import { motion } from "framer-motion";
import { 
  Package, 
  Boxes, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Receipt,
  Users,
  ShoppingCart,
  Table
} from "lucide-react";
import { StatCard } from "./StatCard";
import { usePricingStore } from "@/store/pricingStore";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  onNavigate: (view: 'materials' | 'products' | 'calculator' | 'expenses' | 'employees' | 'resale' | 'pricing') => void;
}

export const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const { rawMaterials, products, fixedExpenses, employees, resaleProducts, getTotalFixedExpenses, getTotalEmployeeCost } = usePricingStore();

  const totalMaterialValue = rawMaterials.reduce((sum, m) => sum + m.pricePerUnit, 0);
  const totalProductValue = products.reduce((sum, p) => sum + p.finalPrice, 0);
  const avgProfitMargin = products.length > 0 
    ? products.reduce((sum, p) => sum + p.profitMargin, 0) / products.length 
    : 0;

  const totalFixedExpenses = getTotalFixedExpenses();
  const totalEmployeeCost = getTotalEmployeeCost();
  const totalResaleRevenue = resaleProducts.reduce((sum, p) => sum + (p.suggestedPrice * p.salesForecast), 0);
  const totalExpectedRevenue = products.reduce((sum, p) => sum + (p.expectedRevenue || 0), 0) + totalResaleRevenue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
          <span className="text-gradient">Precificação</span>
          <span className="text-foreground"> Inteligente</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Gerencie suas matérias-primas, calcule custos e defina preços competitivos para seus produtos
        </p>
      </motion.div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Matérias-Primas"
          value={rawMaterials.length}
          subtitle="cadastradas"
          icon={Boxes}
          delay={0.1}
        />
        <StatCard
          title="Produtos"
          value={products.length}
          subtitle="precificados"
          icon={Package}
          delay={0.2}
        />
        <StatCard
          title="Margem Média"
          value={`${avgProfitMargin.toFixed(1)}%`}
          subtitle="de lucro"
          icon={TrendingUp}
          trend={{ value: avgProfitMargin, isPositive: avgProfitMargin > 10 }}
          delay={0.3}
        />
        <StatCard
          title="Faturamento Previsto"
          value={formatCurrency(totalExpectedRevenue)}
          subtitle="mensal"
          icon={DollarSign}
          delay={0.4}
        />
      </div>

      {/* Stats Grid - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Despesas Fixas"
          value={formatCurrency(totalFixedExpenses)}
          subtitle="mensal"
          icon={Receipt}
          delay={0.5}
        />
        <StatCard
          title="Custo Funcionários"
          value={formatCurrency(totalEmployeeCost)}
          subtitle={`${employees.length} funcionário(s)`}
          icon={Users}
          delay={0.6}
        />
        <StatCard
          title="Produtos Revenda"
          value={resaleProducts.length}
          subtitle="cadastrados"
          icon={ShoppingCart}
          delay={0.7}
        />
        <StatCard
          title="Receita Revenda"
          value={formatCurrency(totalResaleRevenue)}
          subtitle="prevista"
          icon={DollarSign}
          delay={0.8}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <QuickActionCard
          title="Matérias-Primas"
          description="Cadastre e gerencie os insumos"
          icon={Boxes}
          onClick={() => onNavigate('materials')}
          color="primary"
        />
        <QuickActionCard
          title="Produtos"
          description="Crie fichas técnicas e custos"
          icon={Package}
          onClick={() => onNavigate('products')}
          color="accent"
        />
        <QuickActionCard
          title="Despesas Fixas"
          description="Controle gastos mensais"
          icon={Receipt}
          onClick={() => onNavigate('expenses')}
          color="warning"
        />
        <QuickActionCard
          title="Funcionários"
          description="Gerencie custos com pessoal"
          icon={Users}
          onClick={() => onNavigate('employees')}
          color="info"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <QuickActionCard
          title="Produtos Revenda"
          description="Gerencie produtos de revenda"
          icon={ShoppingCart}
          onClick={() => onNavigate('resale')}
          color="success"
        />
        <QuickActionCard
          title="Calculadora"
          description="Simule preços e margens"
          icon={TrendingUp}
          onClick={() => onNavigate('calculator')}
          color="primary"
        />
        <QuickActionCard
          title="Tabela de Preços"
          description="Visão consolidada de preços"
          icon={Table}
          onClick={() => onNavigate('pricing')}
          color="accent"
        />
      </motion.div>

      {/* Recent Products */}
      {products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-foreground">
              Produtos Recentes
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate('products')}
              className="text-primary hover:text-primary/80"
            >
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-muted-foreground text-sm border-b border-border">
                  <th className="pb-3 font-medium">Produto</th>
                  <th className="pb-3 font-medium">Custo</th>
                  <th className="pb-3 font-medium">Margem</th>
                  <th className="pb-3 font-medium">Preço Final</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((product, index) => (
                  <motion.tr 
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="border-b border-border/50 last:border-0"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {formatCurrency(product.totalVariableCost)}
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-success/10 text-success rounded-full text-sm">
                        {product.profitMargin}%
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-foreground">
                      {formatCurrency(product.finalPrice)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: typeof Package;
  onClick: () => void;
  color: 'primary' | 'accent' | 'success' | 'warning' | 'info';
}

const QuickActionCard = ({ title, description, icon: Icon, onClick, color }: QuickActionCardProps) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    accent: "bg-accent/20 text-accent group-hover:bg-accent group-hover:text-accent-foreground",
    success: "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground",
    warning: "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-warning-foreground",
    info: "bg-info/10 text-info group-hover:bg-info group-hover:text-info-foreground",
  };

  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-6 text-left group hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Acessar
        <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </button>
  );
};
