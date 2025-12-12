import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getIncomeTypes, 
  getIncomeCategories, 
  createIncomeType, 
  createIncomeCategory,
  getExpenseTypes,
  getExpenseCategories,
  createExpenseType,
  createExpenseCategory
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [newIncomeType, setNewIncomeType] = useState({ name: "", description: "" });
  const [newIncomeCategory, setNewIncomeCategory] = useState({ name: "", color: "#10B981", icon: "" });
  const [newExpenseType, setNewExpenseType] = useState({ name: "", description: "" });
  const [newExpenseCategory, setNewExpenseCategory] = useState({ name: "", color: "#EF4444", icon: "" });

  const { data: incomeTypes = [], isLoading: loadingIncomeTypes } = useQuery({
    queryKey: ["incomeTypes"],
    queryFn: getIncomeTypes,
  });

  const { data: incomeCategories = [], isLoading: loadingIncomeCategories } = useQuery({
    queryKey: ["incomeCategories"],
    queryFn: getIncomeCategories,
  });

  const { data: expenseTypes = [], isLoading: loadingExpenseTypes } = useQuery({
    queryKey: ["expenseTypes"],
    queryFn: getExpenseTypes,
  });

  const { data: expenseCategories = [], isLoading: loadingExpenseCategories } = useQuery({
    queryKey: ["expenseCategories"],
    queryFn: getExpenseCategories,
  });

  const createIncomeTypeMutation = useMutation({
    mutationFn: createIncomeType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeTypes"] });
      setNewIncomeType({ name: "", description: "" });
      toast({
        title: "Tipo de renda criado",
        description: "O tipo de renda foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o tipo de renda.",
        variant: "destructive",
      });
    },
  });

  const createIncomeCategoryMutation = useMutation({
    mutationFn: createIncomeCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomeCategories"] });
      setNewIncomeCategory({ name: "", color: "#10B981", icon: "" });
      toast({
        title: "Categoria de renda criada",
        description: "A categoria de renda foi adicionada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria de renda.",
        variant: "destructive",
      });
    },
  });

  const createExpenseTypeMutation = useMutation({
    mutationFn: createExpenseType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseTypes"] });
      setNewExpenseType({ name: "", description: "" });
      toast({
        title: "Tipo de despesa criado",
        description: "O tipo de despesa foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o tipo de despesa.",
        variant: "destructive",
      });
    },
  });

  const createExpenseCategoryMutation = useMutation({
    mutationFn: createExpenseCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      setNewExpenseCategory({ name: "", color: "#EF4444", icon: "" });
      toast({
        title: "Categoria de despesa criada",
        description: "A categoria de despesa foi adicionada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria de despesa.",
        variant: "destructive",
      });
    },
  });

  const handleCreateIncomeType = () => {
    if (!newIncomeType.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do tipo de renda.",
        variant: "destructive",
      });
      return;
    }
    createIncomeTypeMutation.mutate(newIncomeType);
  };

  const handleCreateIncomeCategory = () => {
    if (!newIncomeCategory.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome da categoria de renda.",
        variant: "destructive",
      });
      return;
    }
    createIncomeCategoryMutation.mutate(newIncomeCategory);
  };

  const handleCreateExpenseType = () => {
    if (!newExpenseType.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome do tipo de despesa.",
        variant: "destructive",
      });
      return;
    }
    createExpenseTypeMutation.mutate(newExpenseType);
  };

  const handleCreateExpenseCategory = () => {
    if (!newExpenseCategory.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Informe o nome da categoria de despesa.",
        variant: "destructive",
      });
      return;
    }
    createExpenseCategoryMutation.mutate(newExpenseCategory);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie os tipos e categorias de renda e despesa.</p>
      </div>

      <Tabs defaultValue="expense-types" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="expense-types" data-testid="tab-expense-types">Tipos de Despesa</TabsTrigger>
          <TabsTrigger value="expense-categories" data-testid="tab-expense-categories">Categorias de Despesa</TabsTrigger>
          <TabsTrigger value="income-types" data-testid="tab-income-types">Tipos de Renda</TabsTrigger>
          <TabsTrigger value="income-categories" data-testid="tab-income-categories">Categorias de Renda</TabsTrigger>
        </TabsList>

        <TabsContent value="expense-types" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Novo Tipo de Despesa</CardTitle>
              <CardDescription>
                Adicione tipos como Fixa (aluguel, internet), Avulsa (compras pontuais), Parcelada (compras em parcelas).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="expense-type-name">Nome</Label>
                  <Input
                    id="expense-type-name"
                    placeholder="Ex: Fixa, Avulsa, Parcelada"
                    value={newExpenseType.name}
                    onChange={(e) => setNewExpenseType({ ...newExpenseType, name: e.target.value })}
                    data-testid="input-expense-type-name"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="expense-type-description">Descrição (opcional)</Label>
                  <Input
                    id="expense-type-description"
                    placeholder="Ex: Despesas recorrentes mensais"
                    value={newExpenseType.description}
                    onChange={(e) => setNewExpenseType({ ...newExpenseType, description: e.target.value })}
                    data-testid="input-expense-type-description"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateExpenseType} 
                    disabled={createExpenseTypeMutation.isPending}
                    className="gap-2"
                    data-testid="button-add-expense-type"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Tipos de Despesa Cadastrados</CardTitle>
              <CardDescription>
                Sugestões: Fixa (aluguel, contas fixas), Avulsa (gastos pontuais), Parcelada (compras em parcelas onde o sistema calcula a duração).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingExpenseTypes ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : expenseTypes.length > 0 ? (
                      expenseTypes.map((type) => (
                        <TableRow key={type.id} data-testid={`row-expense-type-${type.id}`}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell className="text-muted-foreground">{type.description || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Nenhum tipo de despesa cadastrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense-categories" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Nova Categoria de Despesa</CardTitle>
              <CardDescription>
                Adicione categorias como Alimentação, Transporte, Moradia, Lazer, Saúde, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="expense-category-name">Nome</Label>
                  <Input
                    id="expense-category-name"
                    placeholder="Ex: Alimentação"
                    value={newExpenseCategory.name}
                    onChange={(e) => setNewExpenseCategory({ ...newExpenseCategory, name: e.target.value })}
                    data-testid="input-expense-category-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-category-color">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="expense-category-color"
                      type="color"
                      value={newExpenseCategory.color}
                      onChange={(e) => setNewExpenseCategory({ ...newExpenseCategory, color: e.target.value })}
                      className="w-14 h-9 p-1 cursor-pointer"
                      data-testid="input-expense-category-color"
                    />
                    <Input
                      value={newExpenseCategory.color}
                      onChange={(e) => setNewExpenseCategory({ ...newExpenseCategory, color: e.target.value })}
                      className="w-24"
                      placeholder="#EF4444"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateExpenseCategory} 
                    disabled={createExpenseCategoryMutation.isPending}
                    className="gap-2"
                    data-testid="button-add-expense-category"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Categorias de Despesa Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cor</TableHead>
                      <TableHead>Nome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingExpenseCategories ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : expenseCategories.length > 0 ? (
                      expenseCategories.map((category) => (
                        <TableRow key={category.id} data-testid={`row-expense-category-${category.id}`}>
                          <TableCell>
                            <div 
                              className="w-6 h-6 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Nenhuma categoria de despesa cadastrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-types" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Novo Tipo de Renda</CardTitle>
              <CardDescription>
                Adicione tipos como Fixa, Benefício, Extra, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="type-name">Nome</Label>
                  <Input
                    id="type-name"
                    placeholder="Ex: Fixa"
                    value={newIncomeType.name}
                    onChange={(e) => setNewIncomeType({ ...newIncomeType, name: e.target.value })}
                    data-testid="input-income-type-name"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="type-description">Descrição (opcional)</Label>
                  <Input
                    id="type-description"
                    placeholder="Ex: Renda mensal fixa"
                    value={newIncomeType.description}
                    onChange={(e) => setNewIncomeType({ ...newIncomeType, description: e.target.value })}
                    data-testid="input-income-type-description"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateIncomeType} 
                    disabled={createIncomeTypeMutation.isPending}
                    className="gap-2"
                    data-testid="button-add-income-type"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Tipos de Renda Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingIncomeTypes ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : incomeTypes.length > 0 ? (
                      incomeTypes.map((type) => (
                        <TableRow key={type.id} data-testid={`row-income-type-${type.id}`}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell className="text-muted-foreground">{type.description || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Nenhum tipo de renda cadastrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-categories" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Nova Categoria de Renda</CardTitle>
              <CardDescription>
                Adicione categorias como Salário, Vale Alimentação, Freelance, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="category-name">Nome</Label>
                  <Input
                    id="category-name"
                    placeholder="Ex: Salário"
                    value={newIncomeCategory.name}
                    onChange={(e) => setNewIncomeCategory({ ...newIncomeCategory, name: e.target.value })}
                    data-testid="input-income-category-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-color">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="category-color"
                      type="color"
                      value={newIncomeCategory.color}
                      onChange={(e) => setNewIncomeCategory({ ...newIncomeCategory, color: e.target.value })}
                      className="w-14 h-9 p-1 cursor-pointer"
                      data-testid="input-income-category-color"
                    />
                    <Input
                      value={newIncomeCategory.color}
                      onChange={(e) => setNewIncomeCategory({ ...newIncomeCategory, color: e.target.value })}
                      className="w-24"
                      placeholder="#10B981"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleCreateIncomeCategory} 
                    disabled={createIncomeCategoryMutation.isPending}
                    className="gap-2"
                    data-testid="button-add-income-category"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Categorias de Renda Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cor</TableHead>
                      <TableHead>Nome</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingIncomeCategories ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : incomeCategories.length > 0 ? (
                      incomeCategories.map((category) => (
                        <TableRow key={category.id} data-testid={`row-income-category-${category.id}`}>
                          <TableCell>
                            <div 
                              className="w-6 h-6 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          Nenhuma categoria de renda cadastrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
