import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, CreditCard, Banknote, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccounts, getTransactions, getMovements, createAccount } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Accounts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState<any>("checking");

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const { data: movements = [] } = useQuery({
    queryKey: ["movements"],
    queryFn: () => getMovements(),
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "Conta criada",
        description: "A conta foi adicionada com sucesso.",
      });
      setNewAccountName("");
      setNewAccountType("checking");
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive",
      });
    },
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName) return;
    
    createMutation.mutate({
      name: newAccountName,
      type: newAccountType,
      initialBalance: "0"
    });
  };

  const getAccountBalance = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 0;
    
    const accountMovements = movements.filter(m => m.accountId === accountId);
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    
    const income = accountMovements.reduce((acc, m) => acc + parseFloat(m.amount as any), 0);
    const expense = accountTransactions.reduce((acc, t) => acc + parseFloat(t.amount as any), 0);
    
    return parseFloat(account.initialBalance as any) + income - expense;
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "checking": return <Building2 className="h-5 w-5" />;
      case "credit": return <CreditCard className="h-5 w-5" />;
      case "cash": return <Banknote className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "checking": return "Conta Corrente";
      case "credit": return "Cartão de Crédito";
      case "savings": return "Poupança";
      case "cash": return "Dinheiro";
      default: return "Outro";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Contas</h2>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e carteiras.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-account">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAccount} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Nubank, Carteira..." 
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  required
                  data-testid="input-account-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={newAccountType} onValueChange={setNewAccountType}>
                  <SelectTrigger data-testid="select-account-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Conta Corrente</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="cash">Dinheiro Físico</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-account">Criar Conta</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const balance = getAccountBalance(account.id);
          return (
            <Card key={account.id} className="hover-elevate transition-all overflow-hidden relative" data-testid={`card-account-${account.id}`}>
              <div className={`absolute top-0 left-0 w-1 h-full ${balance < 0 ? 'bg-red-500' : 'bg-primary'}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {account.name}
                </CardTitle>
                <div className="text-muted-foreground">
                  {getIcon(account.type)}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance < 0 ? 'text-red-600' : 'text-foreground'}`} data-testid={`text-balance-${account.id}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {getTypeLabel(account.type)}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/30 p-2 px-6">
                <p className="text-xs text-muted-foreground w-full text-right">
                  Atualizado agora
                </p>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
