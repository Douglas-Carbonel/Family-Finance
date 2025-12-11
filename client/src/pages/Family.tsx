import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Users, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembers, createMember, getTransactions, getMovements, updateMember } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const MEMBER_COLORS = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f97316", "#ec4899", 
  "#6366f1", "#14b8a6", "#f59e0b", "#84cc16", "#ef4444"
];

export default function Family() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(MEMBER_COLORS[0]);
  const [aggregateToFamily, setAggregateToFamily] = useState(true);

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
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
    mutationFn: createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        title: "Membro adicionado",
        description: "O membro foi adicionado à família.",
      });
      setOpen(false);
      setAggregateToFamily(true);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { aggregateToFamily: boolean } }) => 
      updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({
        title: "Membro atualizado",
        description: "As configurações do membro foram atualizadas.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name") as string,
      color: selectedColor,
      aggregateToFamily: aggregateToFamily,
    });
  };

  const getMemberStats = (memberId: number) => {
    const memberMovements = movements.filter(m => m.memberId === memberId);
    const memberTransactions = transactions.filter(t => t.memberId === memberId);
    
    const income = memberMovements.reduce((acc, m) => acc + parseFloat(m.amount as any), 0);
    const expenses = memberTransactions.reduce((acc, t) => acc + parseFloat(t.amount as any), 0);
    
    return { income, expenses, balance: income - expenses };
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const totalFamilyIncome = movements
    .filter(m => {
      const member = members.find(mem => mem.id === m.memberId);
      return member?.aggregateToFamily || m.aggregateToFamily;
    })
    .reduce((acc, m) => acc + parseFloat(m.amount as any), 0);

  const totalFamilyExpenses = transactions
    .filter(t => {
      const member = members.find(mem => mem.id === t.memberId);
      return member?.aggregateToFamily || t.aggregateToFamily;
    })
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Família</h2>
          <p className="text-muted-foreground">Gerencie os membros e suas contribuições financeiras.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-member">
              <Plus size={18} />
              Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Ex: Douglas, Cassia..." 
                  required 
                  data-testid="input-member-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Cor de Identificação</Label>
                <div className="flex gap-2 flex-wrap">
                  {MEMBER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      data-testid={`color-${color}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="aggregate">Agregar à Família</Label>
                  <p className="text-xs text-muted-foreground">
                    Incluir rendas e despesas nos totais da família
                  </p>
                </div>
                <Switch
                  id="aggregate"
                  checked={aggregateToFamily}
                  onCheckedChange={setAggregateToFamily}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-member">
                  {createMutation.isPending ? "Salvando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {members.length > 0 && (
        <Card className="shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle>Resumo Familiar</CardTitle>
            <CardDescription>Total agregado de todos os membros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Renda Total</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalFamilyIncome)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Despesas Totais</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalFamilyExpenses)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Familiar</p>
                  <p className={`text-2xl font-bold ${totalFamilyIncome - totalFamilyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalFamilyIncome - totalFamilyExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {members.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum membro cadastrado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Adicione os membros da família para rastrear a renda e despesas de cada um.
            </p>
            <Button onClick={() => setOpen(true)} data-testid="button-add-first-member">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Primeiro Membro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => {
            const stats = getMemberStats(member.id);
            return (
              <Card key={member.id} className="shadow-sm hover-elevate transition-all" data-testid={`card-member-${member.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <CardDescription>
                          {member.aggregateToFamily ? 'Agregado à família' : 'Dados separados'}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={member.aggregateToFamily}
                      onCheckedChange={(checked) => 
                        updateMutation.mutate({ id: member.id, data: { aggregateToFamily: checked } })
                      }
                      title="Agregar à família"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Renda</span>
                      </div>
                      <span className="font-bold text-green-600" data-testid={`income-member-${member.id}`}>
                        {formatCurrency(stats.income)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">Despesas</span>
                      </div>
                      <span className="font-bold text-red-600" data-testid={`expenses-member-${member.id}`}>
                        {formatCurrency(stats.expenses)}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg ${stats.balance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                      <span className="text-sm font-medium">Saldo</span>
                      <span className={`font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {formatCurrency(stats.balance)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
