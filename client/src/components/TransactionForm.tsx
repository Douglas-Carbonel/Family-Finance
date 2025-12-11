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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, getAccounts, getMembers, createTransaction } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  description: z.string().min(2, "Descrição muito curta"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor inválido"),
  date: z.date(),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  accountId: z.string().min(1, "Selecione uma conta"),
  memberId: z.string().optional(),
  type: z.enum(["income", "expense"]),
  recurrenceType: z.enum(["one_time", "fixed", "installment"]),
  totalInstallments: z.string().optional(),
});

interface TransactionFormProps {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: getMembers,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast({
        title: "Transação criada",
        description: "A transação foi registrada com sucesso.",
      });
      form.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a transação.",
        variant: "destructive",
      });
    },
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date(),
      categoryId: "",
      accountId: "",
      memberId: "",
      type: "expense",
      recurrenceType: "one_time",
      totalInstallments: "2",
    },
  });

  const type = form.watch("type");
  const recurrenceType = form.watch("recurrenceType");

  const filteredCategories = categories.filter(c => c.type === type);

  useEffect(() => {
    const currentCatId = form.getValues("categoryId");
    const currentCat = categories.find(c => c.id.toString() === currentCatId);
    if (currentCat && currentCat.type !== type) {
      form.setValue("categoryId", "");
    }
  }, [type, categories, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const data: any = {
      description: values.description,
      amount: values.amount,
      date: values.date,
      categoryId: parseInt(values.categoryId),
      accountId: parseInt(values.accountId),
      memberId: values.memberId ? parseInt(values.memberId) : null,
      type: values.type,
      recurrenceType: values.recurrenceType,
      isActive: true,
    };

    if (values.recurrenceType === "installment" && values.totalInstallments) {
      data.totalInstallments = parseInt(values.totalInstallments);
    }

    createMutation.mutate(data);
  }

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Nova Transação</DialogTitle>
        <DialogDescription>
          Registre uma entrada ou saída financeira.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Tipo</FormLabel>
                <FormControl>
                  <Tabs 
                    onValueChange={field.onChange} 
                    defaultValue={field.value} 
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700" data-testid="tab-expense">Despesa</TabsTrigger>
                      <TabsTrigger value="income" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700" data-testid="tab-income">Receita</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
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
              control={form.control}
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
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Selecione</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
            control={form.control}
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
            control={form.control}
            name="memberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Membro da Família</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-member">
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        <span className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: member.color }} 
                          />
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
              control={form.control}
              name="categoryId"
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
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <span className="flex items-center gap-2">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: category.color }} 
                            />
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

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-account-transaction">
                        <SelectValue placeholder="Selecione" />
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
          </div>

          {type === "expense" && (
            <FormField
              control={form.control}
              name="recurrenceType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Despesa</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="one_time" id="one_time" data-testid="radio-one-time" />
                        <label htmlFor="one_time" className="flex-1 cursor-pointer">
                          <span className="font-medium">Avulsa</span>
                          <p className="text-sm text-muted-foreground">Gasto único, não se repete</p>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="fixed" id="fixed" data-testid="radio-fixed" />
                        <label htmlFor="fixed" className="flex-1 cursor-pointer">
                          <span className="font-medium">Fixa</span>
                          <p className="text-sm text-muted-foreground">Recorrente todo mês (aluguel, internet...)</p>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="installment" id="installment" data-testid="radio-installment" />
                        <label htmlFor="installment" className="flex-1 cursor-pointer">
                          <span className="font-medium">Parcelada</span>
                          <p className="text-sm text-muted-foreground">Compra dividida em X vezes</p>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === "expense" && recurrenceType === "installment" && (
            <FormField
              control={form.control}
              name="totalInstallments"
              render={({ field }) => (
                <FormItem className="ml-6">
                  <FormLabel>Número de Parcelas</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="2"
                      max="48"
                      {...field}
                      data-testid="input-installments"
                    />
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
            <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-transaction">
              {createMutation.isPending ? "Salvando..." : "Salvar Transação"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
