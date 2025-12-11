import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { Search, FilterX, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExpenseCategories, getExpenseTypes, getAccounts, getTransactions, deleteTransaction, getMembers, updateTransactionStatus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Transactions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: expenseCategories = [] } = useQuery({
    queryKey: ["expenseCategories"],
    queryFn: getExpenseCategories,
  });

  const { data: expenseTypes = [] } = useQuery({
    queryKey: ["expenseTypes"],
    queryFn: getExpenseTypes,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Transação excluída",
        description: "A transação foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação.",
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateTransactionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Status atualizado",
        description: "O status da transação foi atualizado.",
      });
    },
  });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.expenseCategoryId === parseInt(categoryFilter);
    const matchesAccount = accountFilter === "all" || t.accountId === parseInt(accountFilter);
    const matchesType = typeFilter === "all" || t.expenseTypeId === parseInt(typeFilter);
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesCategory && matchesAccount && matchesType && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setAccountFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
  };

  const hasFilters = searchTerm || categoryFilter !== "all" || accountFilter !== "all" || typeFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Transações</h2>
        <p className="text-muted-foreground">Gerencie suas despesas (saídas de dinheiro).</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-type">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  {expenseTypes.map(t => (
                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-category">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Cat.</SelectItem>
                  {expenseCategories.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-account">
                  <SelectValue placeholder="Conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Contas</SelectItem>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]" data-testid="select-status">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar Filtros" data-testid="button-clear-filters">
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((t) => {
                    const category = expenseCategories.find(c => c.id === t.expenseCategoryId);
                    const expenseType = expenseTypes.find(et => et.id === t.expenseTypeId);
                    const account = accounts.find(a => a.id === t.accountId);
                    const member = members.find(m => m.id === t.memberId);
                    
                    return (
                      <TableRow key={t.id} data-testid={`row-transaction-${t.id}`}>
                        <TableCell className="font-medium">
                          {format(new Date(t.date), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{t.description}</span>
                            {t.installmentNumber && t.totalInstallments && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                                {t.installmentNumber}/{t.totalInstallments}
                              </span>
                            )}
                            {member && (
                              <span 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: member.color }}
                                title={member.name}
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expenseType?.name || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <span 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: category?.color + '20', color: category?.color }}
                          >
                            {category?.name || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{account?.name || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-1 ${t.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}
                            onClick={() => statusMutation.mutate({ 
                              id: t.id, 
                              status: t.status === 'paid' ? 'pending' : 'paid' 
                            })}
                          >
                            {t.status === 'paid' ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Pago
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" />
                                Pendente
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          -{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(t.amount as any))}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(t.id)}
                            data-testid={`button-delete-${t.id}`}
                          >
                            <span className="sr-only">Delete</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
