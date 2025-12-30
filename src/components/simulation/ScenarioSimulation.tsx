import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePricingStore } from "@/store/pricingStore";
import type { SavedScenario, ScenarioTotals } from "@/types/pricing";
import { ScenarioManager } from "./ScenarioManager";
import { ScenarioComparison } from "./ScenarioComparison";
import {
  TrendingUp,
  DollarSign,
  Target,
  RotateCcw,
  Package,
  ShoppingCart,
  Save,
  FolderOpen,
  BarChart3,
  FileText,
} from "lucide-react";

interface SimulationItem {
  id: string;
  code: number;
  name: string;
  unit: string;
  variableCost: number;
  finalPrice: number;
  profitMargin: number;
  taxes: number;
  cardFee: number;
  appFee: number;
  commission: number;
  fixedExpensesRate: number;
  salesForecast: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};

export const ScenarioSimulation = () => {
  const { products, resaleProducts, getTotalFixedExpenses, savedScenarios } = usePricingStore();
  
  const [productForecasts, setProductForecasts] = useState<Record<string, number>>({});
  const [resaleForecasts, setResaleForecasts] = useState<Record<string, number>>({});
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>();
  const [managerOpen, setManagerOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  
  const totalFixedExpenses = getTotalFixedExpenses();
  
  const productItems: SimulationItem[] = useMemo(() => 
    products.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      unit: p.unit,
      variableCost: p.totalVariableCost,
      finalPrice: p.finalPrice,
      profitMargin: p.profitMargin,
      taxes: p.taxes,
      cardFee: p.cardFee,
      appFee: p.appFee,
      commission: p.commission,
      fixedExpensesRate: p.fixedExpensesRate,
      salesForecast: productForecasts[p.id] ?? p.salesForecast,
    })), [products, productForecasts]);

  const resaleItems: SimulationItem[] = useMemo(() => 
    resaleProducts.map(p => ({
      id: p.id,
      code: p.code,
      name: p.name,
      unit: p.unit,
      variableCost: p.pricePerUnit,
      finalPrice: p.finalPrice,
      profitMargin: p.profitMargin,
      taxes: p.taxes,
      cardFee: p.cardFee,
      appFee: p.appFee,
      commission: p.commission,
      fixedExpensesRate: 0,
      salesForecast: resaleForecasts[p.id] ?? p.salesForecast,
    })), [resaleProducts, resaleForecasts]);

  const calculateSimulation = (items: SimulationItem[], totalRevenueAll: number) => {
    return items.map(item => {
      const revenue = item.salesForecast * item.finalPrice;
      const variableCosts = item.salesForecast * item.variableCost;
      const taxesValue = revenue * (item.taxes / 100);
      const cardFeeValue = revenue * (item.cardFee / 100);
      const appFeeValue = revenue * (item.appFee / 100);
      const commissionValue = revenue * (item.commission / 100);
      const totalDeductions = taxesValue + cardFeeValue + appFeeValue + commissionValue;
      const contributionMargin = revenue - variableCosts - totalDeductions;
      const contributionMarginPercent = revenue > 0 ? (contributionMargin / revenue) * 100 : 0;
      const mixPercent = totalRevenueAll > 0 ? (revenue / totalRevenueAll) * 100 : 0;
      const fixedExpenseShare = totalFixedExpenses * (mixPercent / 100);
      const profit = contributionMargin - fixedExpenseShare;
      const profitPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
      const markup = item.variableCost > 0 ? item.finalPrice / item.variableCost : 0;

      return {
        ...item,
        revenue,
        variableCosts,
        taxesValue,
        cardFeeValue,
        appFeeValue,
        commissionValue,
        totalDeductions,
        contributionMargin,
        contributionMarginPercent,
        mixPercent,
        fixedExpenseShare,
        profit,
        profitPercent,
        markup,
      };
    });
  };

  const allItems = [...productItems, ...resaleItems];
  const totalRevenueAll = allItems.reduce((sum, item) => sum + (item.salesForecast * item.finalPrice), 0);
  
  const simulatedProducts = calculateSimulation(productItems, totalRevenueAll);
  const simulatedResale = calculateSimulation(resaleItems, totalRevenueAll);

  const productTotals = useMemo(() => {
    return simulatedProducts.reduce((acc, item) => ({
      salesForecast: acc.salesForecast + item.salesForecast,
      revenue: acc.revenue + item.revenue,
      variableCosts: acc.variableCosts + item.variableCosts,
      contributionMargin: acc.contributionMargin + item.contributionMargin,
      fixedExpenseShare: acc.fixedExpenseShare + item.fixedExpenseShare,
      profit: acc.profit + item.profit,
    }), { salesForecast: 0, revenue: 0, variableCosts: 0, contributionMargin: 0, fixedExpenseShare: 0, profit: 0 });
  }, [simulatedProducts]);

  const resaleTotals = useMemo(() => {
    return simulatedResale.reduce((acc, item) => ({
      salesForecast: acc.salesForecast + item.salesForecast,
      revenue: acc.revenue + item.revenue,
      variableCosts: acc.variableCosts + item.variableCosts,
      contributionMargin: acc.contributionMargin + item.contributionMargin,
      fixedExpenseShare: acc.fixedExpenseShare + item.fixedExpenseShare,
      profit: acc.profit + item.profit,
    }), { salesForecast: 0, revenue: 0, variableCosts: 0, contributionMargin: 0, fixedExpenseShare: 0, profit: 0 });
  }, [simulatedResale]);

  const grandTotals: ScenarioTotals = {
    revenue: productTotals.revenue + resaleTotals.revenue,
    variableCosts: productTotals.variableCosts + resaleTotals.variableCosts,
    contributionMargin: productTotals.contributionMargin + resaleTotals.contributionMargin,
    fixedExpenses: totalFixedExpenses,
    profit: productTotals.profit + resaleTotals.profit,
  };

  const handleReset = () => {
    setProductForecasts({});
    setResaleForecasts({});
    setActiveScenarioId(undefined);
  };

  const handleLoadScenario = (scenario: SavedScenario) => {
    setProductForecasts(scenario.productForecasts);
    setResaleForecasts(scenario.resaleForecasts);
    setActiveScenarioId(scenario.id);
  };

  const activeScenario = savedScenarios.find(s => s.id === activeScenarioId);

  const renderSimulationTable = (
    items: ReturnType<typeof calculateSimulation>,
    forecasts: Record<string, number>,
    setForecasts: React.Dispatch<React.SetStateAction<Record<string, number>>>,
    originalForecasts: Record<string, number>
  ) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">Cód</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead className="text-center">Unid</TableHead>
            <TableHead className="text-right">Custo Var.</TableHead>
            <TableHead className="text-right">Preço Venda</TableHead>
            <TableHead className="text-center w-24">Prev. Vendas</TableHead>
            <TableHead className="text-right">Faturamento</TableHead>
            <TableHead className="text-right">Custos Var.</TableHead>
            <TableHead className="text-right">Impostos</TableHead>
            <TableHead className="text-right">Tx Cartão</TableHead>
            <TableHead className="text-right">Comissão</TableHead>
            <TableHead className="text-right">Marg. Contrib.</TableHead>
            <TableHead className="text-right">MC %</TableHead>
            <TableHead className="text-right">Mix %</TableHead>
            <TableHead className="text-right">Rateio DF</TableHead>
            <TableHead className="text-right">Lucro R$</TableHead>
            <TableHead className="text-right">Lucro %</TableHead>
            <TableHead className="text-right">Markup</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell className="font-mono text-sm">{item.code}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-center">{item.unit}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.variableCost)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.finalPrice)}</TableCell>
              <TableCell className="text-center">
                <Input
                  type="number"
                  min="0"
                  value={forecasts[item.id] ?? originalForecasts[item.id] ?? item.salesForecast}
                  onChange={(e) => {
                    setForecasts(prev => ({
                      ...prev,
                      [item.id]: Number(e.target.value) || 0
                    }));
                    setActiveScenarioId(undefined);
                  }}
                  className="w-20 text-center h-8"
                />
              </TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.revenue)}</TableCell>
              <TableCell className="text-right text-destructive">{formatCurrency(item.variableCosts)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatCurrency(item.taxesValue)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatCurrency(item.cardFeeValue)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatCurrency(item.commissionValue)}</TableCell>
              <TableCell className="text-right text-primary font-medium">{formatCurrency(item.contributionMargin)}</TableCell>
              <TableCell className="text-right">{formatPercent(item.contributionMarginPercent)}</TableCell>
              <TableCell className="text-right">{formatPercent(item.mixPercent)}</TableCell>
              <TableCell className="text-right text-muted-foreground">{formatCurrency(item.fixedExpenseShare)}</TableCell>
              <TableCell className={`text-right font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatCurrency(item.profit)}
              </TableCell>
              <TableCell className={`text-right ${item.profitPercent >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatPercent(item.profitPercent)}
              </TableCell>
              <TableCell className="text-right font-mono">{item.markup.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-heading font-bold text-foreground"
          >
            <span className="text-gradient">Simulação</span> de Cenários
          </motion.h1>
          {activeScenario && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
              <FileText className="w-3.5 h-3.5" />
              {activeScenario.name}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setManagerOpen(true)} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar / Carregar
          </Button>
          <Button
            variant="outline"
            onClick={() => setComparisonOpen(true)}
            className="gap-2"
            disabled={savedScenarios.length < 2}
          >
            <BarChart3 className="w-4 h-4" />
            Comparar
          </Button>
          <Button variant="ghost" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Limpar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Faturamento</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrency(grandTotals.revenue)}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <Package className="w-4 h-4" />
              <span>Custos Var.</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-destructive">{formatCurrency(grandTotals.variableCosts)}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Marg. Contrib.</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(grandTotals.contributionMargin)}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Target className="w-4 h-4" />
              <span>Desp. Fixas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{formatCurrency(grandTotals.fixedExpenses)}</p>
          </CardContent>
        </Card>
        <Card className={`glass border-border/50 ${grandTotals.profit >= 0 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
          <CardContent className="p-4">
            <div className={`flex items-center gap-2 text-sm ${grandTotals.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              <TrendingUp className="w-4 h-4" />
              <span>Lucro</span>
            </div>
            <p className={`text-2xl font-bold mt-1 ${grandTotals.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {formatCurrency(grandTotals.profit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Tables */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Produtos/Serviços ({products.length})
          </TabsTrigger>
          <TabsTrigger value="resale" className="gap-2">
            <ShoppingCart className="w-4 h-4" />
            Revenda ({resaleProducts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Simulação de Produtos e Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderSimulationTable(
                simulatedProducts,
                productForecasts,
                setProductForecasts,
                Object.fromEntries(products.map(p => [p.id, p.salesForecast]))
              )}
              
              {/* Totals Row */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Vendas:</span>
                    <p className="font-bold">{productTotals.salesForecast}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Faturamento:</span>
                    <p className="font-bold">{formatCurrency(productTotals.revenue)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Custos Variáveis:</span>
                    <p className="font-bold text-destructive">{formatCurrency(productTotals.variableCosts)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Margem Contrib.:</span>
                    <p className="font-bold text-primary">{formatCurrency(productTotals.contributionMargin)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lucro:</span>
                    <p className={`font-bold ${productTotals.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {formatCurrency(productTotals.profit)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resale">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Simulação de Produtos para Revenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resaleProducts.length > 0 ? (
                <>
                  {renderSimulationTable(
                    simulatedResale,
                    resaleForecasts,
                    setResaleForecasts,
                    Object.fromEntries(resaleProducts.map(p => [p.id, p.salesForecast]))
                  )}
                  
                  {/* Totals Row */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Vendas:</span>
                        <p className="font-bold">{resaleTotals.salesForecast}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Faturamento:</span>
                        <p className="font-bold">{formatCurrency(resaleTotals.revenue)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Custos Variáveis:</span>
                        <p className="font-bold text-destructive">{formatCurrency(resaleTotals.variableCosts)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Margem Contrib.:</span>
                        <p className="font-bold text-primary">{formatCurrency(resaleTotals.contributionMargin)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Lucro:</span>
                        <p className={`font-bold ${resaleTotals.profit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {formatCurrency(resaleTotals.profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto de revenda cadastrado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scenario Manager Dialog */}
      <ScenarioManager
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        currentForecasts={{ productForecasts, resaleForecasts }}
        currentTotals={grandTotals}
        onLoadScenario={handleLoadScenario}
        activeScenarioId={activeScenarioId}
      />

      {/* Scenario Comparison Dialog */}
      <ScenarioComparison
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
      />
    </div>
  );
};
