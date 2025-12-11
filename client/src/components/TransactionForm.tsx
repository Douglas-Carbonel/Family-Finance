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
import { useFinance, Transaction } from "@/context/FinanceContext";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useEffect } from "react";

const formSchema = z.object({
  description: z.string().min(2, "Descrição muito curta"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Valor inválido"),
  date: z.date(),
  categoryId: z.string().min(1, "Selecione uma categoria"),
  accountId: z.string().min(1, "Selecione uma conta"),
  type: z.enum(["income", "expense"]),
});

interface TransactionFormProps {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { addTransaction, categories, accounts } = useFinance();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date(),
      categoryId: "",
      accountId: "",
      type: "expense",
    },
  });

  const type = form.watch("type");

  // Filter categories based on type
  const filteredCategories = categories.filter(c => c.type === type);

  // Set default category when type changes if current category is invalid
  useEffect(() => {
    const currentCatId = form.getValues("categoryId");
    const currentCat = categories.find(c => c.id === currentCatId);
    if (currentCat && currentCat.type !== type) {
      form.setValue("categoryId", "");
    }
  }, [type, categories, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    addTransaction({
      description: values.description,
      amount: Number(values.amount),
      date: values.date.toISOString(),
      categoryId: values.categoryId,
      accountId: values.accountId,
      type: values.type,
    });
    form.reset();
    onSuccess();
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
                      <TabsTrigger value="expense" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">Despesa</TabsTrigger>
                      <TabsTrigger value="income" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">Receita</TabsTrigger>
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
                      <Input placeholder="0.00" {...field} className="pl-9" type="number" step="0.01" />
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
                  <Input placeholder="Ex: Compras no mercado" {...field} />
                </FormControl>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
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

          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full">Salvar Transação</Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
