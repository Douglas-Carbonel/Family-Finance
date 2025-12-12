import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Menu,
  Minus,
  Plus,
  Users,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/TransactionForm";

interface FormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType: "expense" | "income";
}

function FormDialog({ isOpen, onOpenChange, defaultType }: FormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <TransactionForm onSuccess={() => onOpenChange(false)} defaultFormType={defaultType} />
      </DialogContent>
    </Dialog>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);

  const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
          isActive 
            ? "bg-primary text-primary-foreground font-medium" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`} data-testid={`nav-${href.replace('/', '') || 'dashboard'}`}>
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </div>
      </Link>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight">FinFamily</h1>
        </div>
      </div>
      
      <div className="flex-1 px-4 py-2 space-y-1">
        <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem href="/transactions" icon={Receipt} label="Transações" />
        <NavItem href="/accounts" icon={Wallet} label="Contas" />
        <NavItem href="/family" icon={Users} label="Família" />
        <NavItem href="/settings" icon={Settings} label="Configurações" />
      </div>

      <div className="p-4 border-t space-y-2">
        <Button 
          variant="destructive"
          className="w-full gap-2 font-semibold shadow-md transition-all" 
          size="lg" 
          onClick={() => setIsExpenseOpen(true)}
          data-testid="button-new-expense"
        >
          <Minus className="h-5 w-5" />
          Nova Despesa
        </Button>
        <Button 
          className="w-full gap-2 font-semibold shadow-md transition-all bg-green-600 dark:bg-green-700 text-white" 
          size="lg" 
          onClick={() => setIsIncomeOpen(true)}
          data-testid="button-new-income"
        >
          <Plus className="h-5 w-5" />
          Nova Renda
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <div className="hidden md:block w-64 flex-shrink-0 h-full">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <header className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">FinFamily</span>
          </div>
          
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      <FormDialog isOpen={isExpenseOpen} onOpenChange={setIsExpenseOpen} defaultType="expense" />
      <FormDialog isOpen={isIncomeOpen} onOpenChange={setIsIncomeOpen} defaultType="income" />
    </div>
  );
}
