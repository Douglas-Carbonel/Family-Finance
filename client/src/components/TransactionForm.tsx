import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getExpenseCategories, 
  getExpenseTypes, 
  getIncomeCategories,
  getIncomeTypes,
  getAccounts, 
  getMembers, 
  createTransaction,
  createMovement
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const transactionFormSchema = z.object({
  description: z.string().min(2, "Descrição muito curta"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor inválido"),
  date: z.date(),
  expenseCategoryId: z.string().min(1, "Selecione uma categoria"),
  expenseTypeId: z.string().min(1, "Selecione um tipo"),
  accountId: z.string().optional(),
  memberId: z.string().min(1, "Selecione um membro"),
  totalInstallments: z.string().optional(),
});

const movementFormSchema = z.object({
  description: z.string().min(2, "Descrição muito curta"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor inválido"),
  date: z.date(),
  incomeCategoryId: z.string().optional(),
  incomeTypeId: z.string().min(1, "Selecione um tipo"),
  accountId: z.string().optional(),
  memberId: z.string().min(1, "Selecione um membro"),
});

interface TransactionFormProps {
  onSuccess: () => void;
  defaultFormType?: "expense" | "income";
}

export function TransactionForm({ onSuccess, defaultFormType = "expense" }: TransactionFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [formType, setFormType] = useState<"expense" | "income">(defaultFormType);

  const { data: expenseCategories = [] } = useQuery({
    queryKey: ["expenseCategories"],
    queryFn: getExpenseCategories,
  });

  const { data: expenseTypes = [] } = useQuery({
    queryKey: ["expenseTypes"],
    queryFn: getExpenseTypes,
  });

  const { data: incomeCategories = [] } = useQuery({
    queryKey: ["incomeCategories"],
    queryFn: getIncomeCategories,
  });

  const { data: incomeTypes = [] } = useQuery({
    queryKey: ["incomeTypes"],
    queryFn: getIncomeTypes,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Despesa registrada",
        description: "A despesa foi registrada com sucesso.",
      });
      transactionForm.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a despesa.",
        variant: "destructive",
      });
    },
  });

  const createMovementMutation = useMutation({
    mutationFn: createMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      toast({
        title: "Renda registrada",
        description: "A renda foi registrada com sucesso.",
      });
      movementForm.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível registrar a renda.",
        variant: "destructive",
      });
    },
  });
  
  const transactionForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date(),
      expenseCategoryId: "",
      expenseTypeId: "",
      accountId: "",
      memberId: "",
      totalInstallments: "2",
    },
  });

  const movementForm = useForm<z.infer<typeof movementFormSchema>>({
    resolver: zodResolver(movementFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date(),
      incomeCategoryId: "",
      incomeTypeId: "",
      accountId: "",
      memberId: "",
    },
  });

  const selectedExpenseTypeId = transactionForm.watch("expenseTypeId");
  const selectedExpenseType = expenseTypes.find(t => t.id.toString() === selectedExpenseTypeId);
  const isInstallment = selectedExpenseType?.name === "Parcelada";

  function onSubmitTransaction(values: z.infer<typeof transactionFormSchema>) {
    const data: any = {
      description: values.description,
      amount: values.amount,
      date: values.date,
      expenseCategoryId: parseInt(values.expenseCategoryId),
      expenseTypeId: parseInt(values.expenseTypeId),
      accountId: values.accountId ? parseInt(values.accountId) : null,
      memberId: parseInt(values.memberId),
      status: "pending",
    };

    if (isInstallment && values.totalInstallments) {
      data.totalInstallments = parseInt(values.totalInstallments);
    }

    createTransactionMutation.mutate(data);
  }

  function onSubmitMovement(values: z.infer<typeof movementFormSchema>) {
    const data: any = {
      description: values.description,
      amount: values.amount,
      date: values.date,
      incomeCategoryId: values.incomeCategoryId ? parseInt(values.incomeCategoryId) : null,
      incomeTypeId: parseInt(values.incomeTypeId),
      accountId: values.accountId ? parseInt(values.accountId) : null,
      memberId: parseInt(values.memberId),
    };

    createMovementMutation.mutate(data);
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Nova Movimentação</DialogTitle>
        <DialogDescription>
          Registre uma entrada (renda) ou saída (despesa) financeira.
        </DialogDescription>
      </DialogHeader>

      <Tabs value={formType} onValueChange={(v) => setFormType(v as "expense" | "income")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700" data-testid="tab-expense">
            Despesa (Transação)
          </TabsTrigger>
          <TabsTrigger value="income" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700" data-testid="tab-income">
            Renda (Movimentação)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {formType === "expense" ? (
        <Form {...transactionForm}>
          <form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={transactionForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                        <Input placeholder="0.00" {...field} className="pl-9" type="number" step="0.01" data-testid="input-amount" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={transactionForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel className="mb-1">Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-date"
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={transactionForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Compras no mercado" {...field} data-testid="input-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={transactionForm.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membro</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-member">
                        <SelectValue placeholder="Selecione o membro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
                            {member.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={transactionForm.control}
                name="expenseTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Despesa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expense-type">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={transactionForm.control}
                name="expenseCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                              {category.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={transactionForm.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-account-transaction">
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isInstallment && (
              <FormField
                control={transactionForm.control}
                name="totalInstallments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" min="2" max="48" {...field} data-testid="input-installments" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      O valor será dividido em {field.value || 2}x
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="mt-6">
              <Button type="submit" className="w-full" disabled={createTransactionMutation.isPending} data-testid="button-submit-transaction">
                {createTransactionMutation.isPending ? "Salvando..." : "Registrar Despesa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      ) : (
        <Form {...movementForm}>
          <form onSubmit={movementForm.handleSubmit(onSubmitMovement)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={movementForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                        <Input placeholder="0.00" {...field} className="pl-9" type="number" step="0.01" data-testid="input-amount-income" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={movementForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel className="mb-1">Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="button-date-income"
                          >
                            {field.value ? format(field.value, "dd/MM/yyyy") : <span>Selecione</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={movementForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Salário de Janeiro" {...field} data-testid="input-description-income" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={movementForm.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membro</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-member-income">
                        <SelectValue placeholder="Selecione o membro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id.toString()}>
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
                            {member.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={movementForm.control}
                name="incomeTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Renda</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-income-type">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incomeTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={movementForm.control}
                name="incomeCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria (opcional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-income-category">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {incomeCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                              {category.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={movementForm.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-account-income">
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={createMovementMutation.isPending} data-testid="button-submit-movement">
                {createMovementMutation.isPending ? "Salvando..." : "Registrar Renda"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </div>
  );
}
