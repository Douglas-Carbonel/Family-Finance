import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Users, Repeat, CalendarClock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getAccounts, getTransactions, getMembers } from "@/lib/api";

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

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  const balance = totalIncome - totalExpense;

  const incomeByMember = members.map(member => ({
    name: member.name,
    value: transactions
      .filter(t => t.type === "income" && t.memberId === member.id)
      .reduce((acc, t) => acc + parseFloat(t.amount as any), 0),
    color: member.color,
  })).filter(item => item.value > 0);

  const unassignedIncome = transactions
    .filter(t => t.type === "income" && !t.memberId)
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  if (unassignedIncome > 0) {
    incomeByMember.push({ name: "Não atribuída", value: unassignedIncome, color: "#94a3b8" });
  }

  const expensesByCategory = categories
    .filter(c => c.type === "expense")
    .map(category => {
      const amount = transactions
        .filter(t => t.categoryId === category.id)
        .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);
      return { name: category.name, value: amount, color: category.color };
    })
    .filter(item => item.value > 0);

  const fixedExpenses = transactions
    .filter(t => t.type === "expense" && t.recurrenceType === "fixed")
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  const installmentExpenses = transactions
    .filter(t => t.type === "expense" && t.recurrenceType === "installment")
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  const oneTimeExpenses = transactions
    .filter(t => t.type === "expense" && t.recurrenceType === "one_time")
    .reduce((acc, t) => acc + parseFloat(t.amount as any), 0);

  const expensesByType = [
    { name: "Fixas", value: fixedExpenses, color: "#8b5cf6" },
    { name: "Parceladas", value: installmentExpenses, color: "#f97316" },
    { name: "Avulsas", value: oneTimeExpenses, color: "#06b6d4" },
  ].filter(item => item.value > 0);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Resumo financeiro do mês.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover-elevate transition-all" data-testid="card-balance">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-red-500'}`} data-testid="text-balance">
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
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
              {formatCurrency(totalIncome)}
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
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de saídas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover-elevate transition-all" data-testid="card-fixed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Fixas</CardTitle>
            <Repeat className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-fixed">
              {formatCurrency(fixedExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Gastos recorrentes
            </p>
          </CardContent>
        </Card>
      </div>

      {members.length > 0 && incomeByMember.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Renda por Membro
            </CardTitle>
            <CardDescription>Distribuição da renda familiar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                {incomeByMember.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-green-600 font-bold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeByMember}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {incomeByMember.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                      formatter={(value: number) => formatCurrency(value)}
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
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Tipos de Despesa
            </CardTitle>
            <CardDescription>Fixas vs Parceladas vs Avulsas.</CardDescription>
          </CardHeader>
          <CardContent>
            {expensesByType.length > 0 ? (
              <div className="space-y-4">
                {expensesByType.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm font-bold">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(item.value / totalExpense) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground py-8">
                Sem dados de despesas para exibir.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas 5 movimentações.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t) => {
              const category = categories.find(c => c.id === t.categoryId);
              const account = accounts.find(a => a.id === t.accountId);
              const member = members.find(m => m.id === t.memberId);
              
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
                      <p className="text-sm font-medium leading-none flex items-center gap-2">
                        {t.description}
                        {t.recurrenceType === "installment" && t.installmentNumber && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                            {t.installmentNumber}/{t.totalInstallments}
                          </span>
                        )}
                        {t.recurrenceType === "fixed" && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                            Fixa
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.date), "dd MMM", { locale: ptBR })} • {account?.name}
                        {member && ` • ${member.name}`}
                      </p>
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-foreground'}`}>
                    {t.type === 'expense' ? '-' : '+'}
                    {formatCurrency(parseFloat(t.amount as any))}
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
  );
}
