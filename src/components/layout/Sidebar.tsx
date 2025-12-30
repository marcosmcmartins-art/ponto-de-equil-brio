import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Boxes, 
  Package, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Users,
  ShoppingCart,
  Table
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentView: string;
  onNavigate: (view: 'dashboard' | 'materials' | 'products' | 'calculator' | 'expenses' | 'employees' | 'resale' | 'pricing') => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'materials', label: 'Matérias-Primas', icon: Boxes },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'expenses', label: 'Despesas Fixas', icon: Receipt },
  { id: 'employees', label: 'Funcionários', icon: Users },
  { id: 'resale', label: 'Produtos Revenda', icon: ShoppingCart },
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'pricing', label: 'Tabela de Preços', icon: Table },
] as const;

export const Sidebar = ({ currentView, onNavigate, collapsed, onToggleCollapse }: SidebarProps) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 h-screen glass border-r border-border/50 z-40 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1 className="font-heading font-bold text-foreground text-lg">
              <span className="text-gradient">Preci</span>ficação
            </h1>
          </motion.div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleCollapse}
          className="hover:bg-secondary/50 shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      <nav className="p-2 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = currentView === item.id;
          return (
            <motion.button
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </motion.aside>
  );
};
