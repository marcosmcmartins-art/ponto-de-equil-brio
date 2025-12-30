import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePricingStore } from "@/store/pricingStore";
import { Target, TrendingUp, DollarSign, Info, Ticket, AlertTriangle, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(2)}%`;
};

interface BreakEvenAnalysisProps {
  desiredProfit: number;
}

export const BreakEvenAnalysis = ({ desiredProfit }: BreakEvenAnalysisProps) => {
  const { products, resaleProducts, getTotalFixedExpenses, getTotalEmployeeCost } = usePricingStore();

  const calculations = useMemo(() => {
    const totalFixedExpenses = getTotalFixedExpenses();
    const totalEmployeeCost = getTotalEmployeeCost();
    const totalFixed = totalFixedExpenses + totalEmployeeCost;

    // Calculate weighted average contribution margin
    let totalRevenue = 0;
    let totalContributionMargin = 0;
    let totalQuantity = 0;

    products.forEach(p => {
      const revenue = p.salesForecast * p.finalPrice;
      const variableCost = p.salesForecast * p.totalVariableCost;
      const taxes = revenue * (p.taxes / 100);
      const cardFee = revenue * (p.cardFee / 100);
      const appFee = revenue * (p.appFee / 100);
      const commission = revenue * (p.commission / 100);
      const contribution = revenue - variableCost - taxes - cardFee - appFee - commission;
      
      totalRevenue += revenue;
      totalContributionMargin += contribution;
      totalQuantity += p.salesForecast;
    });

    resaleProducts.forEach(p => {
      const revenue = p.salesForecast * p.finalPrice;
      const variableCost = p.salesForecast * p.pricePerUnit;
      const taxes = revenue * (p.taxes / 100);
      const cardFee = revenue * (p.cardFee / 100);
      const appFee = revenue * (p.appFee / 100);
      const commission = revenue * (p.commission / 100);
      const contribution = revenue - variableCost - taxes - cardFee - appFee - commission;
      
      totalRevenue += revenue;
      totalContributionMargin += contribution;
      totalQuantity += p.salesForecast;
    });

    const contributionMarginPercent = totalRevenue > 0 
      ? (totalContributionMargin / totalRevenue) * 100 
      : 0;

    // Break-even point (covers fixed expenses only)
    const breakEvenRevenue = contributionMarginPercent > 0 
      ? (totalFixed / (contributionMarginPercent / 100))
      : 0;

    // Economic break-even (covers fixed expenses + desired profit)
    const economicBreakEvenRevenue = contributionMarginPercent > 0
      ? ((totalFixed + desiredProfit) / (contributionMarginPercent / 100))
      : 0;

    // Average ticket
    const averageTicket = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

    // Break-even in units
    const breakEvenUnits = averageTicket > 0 ? breakEvenRevenue / averageTicket : 0;
    const economicBreakEvenUnits = averageTicket > 0 ? economicBreakEvenRevenue / averageTicket : 0;

    // Current situation
    const currentProfit = totalContributionMargin - totalFixed;
    const isAboveBreakEven = currentProfit >= 0;
    const percentAboveBreakEven = breakEvenRevenue > 0 
      ? ((totalRevenue - breakEvenRevenue) / breakEvenRevenue) * 100
      : 0;

    return {
      totalFixedExpenses,
      totalEmployeeCost,
      totalFixed,
      totalRevenue,
      totalContributionMargin,
      contributionMarginPercent,
      breakEvenRevenue,
      economicBreakEvenRevenue,
      averageTicket,
      breakEvenUnits,
      economicBreakEvenUnits,
      currentProfit,
      isAboveBreakEven,
      percentAboveBreakEven,
      totalQuantity,
    };
  }, [products, resaleProducts, getTotalFixedExpenses, getTotalEmployeeCost, desiredProfit]);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Input Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <span>Despesas Fixas</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de despesas fixas mensais cadastradas</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xl font-bold">{formatCurrency(calculations.totalFixedExpenses)}</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <span>Custo Funcionários</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de custos com funcionários (salários + encargos)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xl font-bold">{formatCurrency(calculations.totalEmployeeCost)}</p>
            </CardContent>
          </Card>
          <Card className="glass border-border/50 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary text-sm mb-1">
                <span>Total Custos Fixos</span>
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(calculations.totalFixed)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Margin */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Margem de Contribuição Prevista
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Faturamento Previsto</span>
                <p className="text-lg font-bold">{formatCurrency(calculations.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Margem Contrib. R$</span>
                <p className="text-lg font-bold text-primary">{formatCurrency(calculations.totalContributionMargin)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                <span className="text-sm text-primary">Margem Contrib. %</span>
                <p className="text-2xl font-bold text-primary">{formatPercent(calculations.contributionMarginPercent)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Qtd Total Prevista</span>
                <p className="text-lg font-bold">{calculations.totalQuantity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Break-Even Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Ponto de Equilíbrio
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Faturamento mínimo necessário para cobrir todos os custos fixos. Neste ponto, a empresa não tem lucro nem prejuízo.</p>
                    <p className="mt-2 font-mono text-xs">PE = Custos Fixos / Margem Contrib. %</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <span className="text-sm text-amber-600">Faturamento Mínimo</span>
                <p className="text-3xl font-bold text-amber-600">{formatCurrency(calculations.breakEvenRevenue)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Em quantidade (Ticket Médio)</span>
                <p className="text-lg font-bold">{Math.ceil(calculations.breakEvenUnits)} unidades</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                Ponto de Equilíbrio Econômico
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>Faturamento necessário para cobrir custos fixos E atingir o lucro desejado.</p>
                    <p className="mt-2 font-mono text-xs">PEE = (Custos Fixos + Lucro Desejado) / Margem Contrib. %</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <span className="text-sm text-green-600">Faturamento para Lucro de {formatCurrency(desiredProfit)}</span>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(calculations.economicBreakEvenRevenue)}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Em quantidade (Ticket Médio)</span>
                <p className="text-lg font-bold">{Math.ceil(calculations.economicBreakEvenUnits)} unidades</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Médio */}
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Ticket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ticket Médio</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 ml-1 text-muted-foreground inline" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Faturamento Total / Quantidade Total de Vendas</p>
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-2xl font-bold">{formatCurrency(calculations.averageTicket)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Situation Analysis */}
        <Card className={`glass border-border/50 ${calculations.isAboveBreakEven ? 'bg-green-500/5 border-green-500/30' : 'bg-destructive/5 border-destructive/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${calculations.isAboveBreakEven ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                {calculations.isAboveBreakEven ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold text-lg ${calculations.isAboveBreakEven ? 'text-green-600' : 'text-destructive'}`}>
                  {calculations.isAboveBreakEven ? 'Situação: ACIMA do Ponto de Equilíbrio' : 'Situação: ABAIXO do Ponto de Equilíbrio'}
                </h4>
                <p className="text-muted-foreground mt-1">
                  {calculations.isAboveBreakEven 
                    ? `Com base na previsão de vendas, sua empresa opera ${formatPercent(Math.abs(calculations.percentAboveBreakEven))} acima do ponto de equilíbrio, gerando lucro de ${formatCurrency(calculations.currentProfit)}.`
                    : `Com base na previsão de vendas, sua empresa opera abaixo do ponto de equilíbrio, com prejuízo de ${formatCurrency(Math.abs(calculations.currentProfit))}.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
