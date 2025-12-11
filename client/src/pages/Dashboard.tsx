import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getAccounts, getTransactions } from "@/lib/api";

export default function Dashboard() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  const balance = totalIncome - totalExpense;

  const expensesByCategory = categories
    .filter(c => c.type === "expense")
    .map(category => {
      const amount = transactions
        .filter(t => t.categoryId === category.id)
        .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);
      return { name: category.name, value: amount, color: category.color };
    })
    .filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumo financeiro do mês.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm hover-elevate transition-all" data-testid="card-balance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-red-500'}`} data-testid="text-balance">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Balanço geral de todas as contas
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover-elevate transition-all" data-testid="card-income">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-income">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de entradas
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover-elevate transition-all" data-testid="card-expenses">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-expenses">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de saídas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição dos seus gastos.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              {expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                  Sem dados de despesas para exibir.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Recentes</CardTitle>
            <CardDescription>Últimas 5 movimentações.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 5).map((t) => {
                const category = categories.find(c => c.id === t.categoryId);
                const account = accounts.find(a => a.id === t.accountId);
                
                return (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`transaction-${t.id}`}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: category?.color || '#ccc' }}
                      >
                        {category?.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium leading-none">{t.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(t.date), "dd MMM", { locale: ptBR })} • {account?.name}
                        </p>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                      {t.type === 'expense' ? '-' : '+'}
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(t.amount as any))}
                    </div>
                  </div>
                );
              })}
              {transactions.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Nenhuma transação registrada.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
