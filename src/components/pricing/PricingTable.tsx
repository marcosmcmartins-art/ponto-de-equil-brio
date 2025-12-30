import { motion } from "framer-motion";
import { Table, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/store/pricingStore";

export const PricingTable = () => {
  const { products, getTotalFixedExpenses, getTotalEmployeeCost } = usePricingStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate totals
  const totalFixedExpenses = getTotalFixedExpenses() + getTotalEmployeeCost();
  const totalExpectedRevenue = products.reduce((sum, p) => sum + p.expectedRevenue, 0);
  const totalVariableCosts = products.reduce((sum, p) => sum + (p.totalVariableCost * p.salesForecast), 0);
  const totalTaxes = products.reduce((sum, p) => sum + (p.finalPrice * p.salesForecast * p.taxes / 100), 0);
  const totalFees = products.reduce((sum, p) => {
    const fees = (p.cardFee + p.appFee + p.commission) / 100;
    return sum + (p.finalPrice * p.salesForecast * fees);
  }, 0);
  const totalContributionMargin = totalExpectedRevenue - totalVariableCosts - totalTaxes - totalFees;
  const totalProfit = totalContributionMargin - totalFixedExpenses;

  // Calculate each product's share of fixed expenses and profit
  const productsWithRateio = products.map((product) => {
    const productRevenue = product.expectedRevenue;
    const revenueShare = totalExpectedRevenue > 0 ? productRevenue / totalExpectedRevenue : 0;
    const fixedExpenseAllocation = totalFixedExpenses * revenueShare;
    const productVariableCost = product.totalVariableCost * product.salesForecast;
    const productTaxes = productRevenue * (product.taxes / 100);
    const productFees = productRevenue * ((product.cardFee + product.appFee + product.commission) / 100);
    const contributionMargin = productRevenue - productVariableCost - productTaxes - productFees;
    const netProfit = contributionMargin - fixedExpenseAllocation;
    const profitMarginReal = productRevenue > 0 ? (netProfit / productRevenue) * 100 : 0;

    return {
      ...product,
      revenueShare: revenueShare * 100,
      fixedExpenseAllocation,
      productVariableCost,
      productTaxes,
      productFees,
      contributionMargin,
      netProfit,
      profitMarginReal,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Tabela de Precificação
          </h2>
          <p className="text-muted-foreground">
            Visão consolidada de todos os produtos
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-sm text-muted-foreground">Faturamento Previsto</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalExpectedRevenue)}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-sm text-muted-foreground">Custos Variáveis</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(totalVariableCosts)}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-sm text-muted-foreground">Margem Contribuição</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalContributionMargin)}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-4"
        >
          <p className="text-sm text-muted-foreground">Lucro Líquido</p>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(totalProfit)}
          </p>
        </motion.div>
      </div>

      {/* Main Table */}
      {products.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 text-left">
                  <th className="p-3 font-medium text-muted-foreground sticky left-0 bg-secondary/50">Produto</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Preço Venda</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Prev. Vendas</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Faturamento</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Custo Var.</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Impostos</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Taxas</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Marg. Contrib.</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Rateio Desp.</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Lucro Líq.</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">Mark-up</th>
                  <th className="p-3 font-medium text-muted-foreground text-right">% Mix</th>
                </tr>
              </thead>
              <tbody>
                {productsWithRateio.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="border-t border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3 font-medium text-foreground sticky left-0 bg-card">
                      {product.name}
                    </td>
                    <td className="p-3 text-right text-foreground">{formatCurrency(product.finalPrice)}</td>
                    <td className="p-3 text-right text-muted-foreground">{product.salesForecast}</td>
                    <td className="p-3 text-right font-medium text-primary">{formatCurrency(product.expectedRevenue)}</td>
                    <td className="p-3 text-right text-warning">{formatCurrency(product.productVariableCost)}</td>
                    <td className="p-3 text-right text-destructive">{formatCurrency(product.productTaxes)}</td>
                    <td className="p-3 text-right text-muted-foreground">{formatCurrency(product.productFees)}</td>
                    <td className="p-3 text-right text-success font-medium">{formatCurrency(product.contributionMargin)}</td>
                    <td className="p-3 text-right text-muted-foreground">{formatCurrency(product.fixedExpenseAllocation)}</td>
                    <td className={`p-3 text-right font-semibold ${product.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(product.netProfit)}
                    </td>
                    <td className="p-3 text-right text-foreground">{product.markupMultiplier.toFixed(2)}x</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {formatPercent(product.revenueShare)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
                
                {/* Totals Row */}
                <tr className="border-t-2 border-primary bg-secondary/30 font-semibold">
                  <td className="p-3 text-foreground sticky left-0 bg-secondary/30">TOTAL</td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right text-muted-foreground">
                    {products.reduce((sum, p) => sum + p.salesForecast, 0)}
                  </td>
                  <td className="p-3 text-right text-primary">{formatCurrency(totalExpectedRevenue)}</td>
                  <td className="p-3 text-right text-warning">{formatCurrency(totalVariableCosts)}</td>
                  <td className="p-3 text-right text-destructive">{formatCurrency(totalTaxes)}</td>
                  <td className="p-3 text-right text-muted-foreground">{formatCurrency(totalFees)}</td>
                  <td className="p-3 text-right text-success">{formatCurrency(totalContributionMargin)}</td>
                  <td className="p-3 text-right text-muted-foreground">{formatCurrency(totalFixedExpenses)}</td>
                  <td className={`p-3 text-right ${totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(totalProfit)}
                  </td>
                  <td className="p-3 text-right">-</td>
                  <td className="p-3 text-right text-primary">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Table className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Cadastre produtos para ver a tabela de precificação</p>
        </motion.div>
      )}

      {/* Fixed Expenses Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card rounded-xl p-4"
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">
              Despesas Fixas Totais (incluindo funcionários)
            </p>
            <p className="font-semibold text-foreground">
              {formatCurrency(totalFixedExpenses)} / mês
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
