import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePricingStore } from "@/store/pricingStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from "recharts";
import { TrendingUp } from "lucide-react";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatCompact = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return `R$ ${value.toFixed(0)}`;
};

interface BreakEvenChartProps {
  desiredProfit: number;
}

export const BreakEvenChart = ({ desiredProfit }: BreakEvenChartProps) => {
  const { products, resaleProducts, getTotalFixedExpenses, getTotalEmployeeCost } = usePricingStore();

  const chartData = useMemo(() => {
    const totalFixedExpenses = getTotalFixedExpenses();
    const totalEmployeeCost = getTotalEmployeeCost();
    const totalFixed = totalFixedExpenses + totalEmployeeCost;

    // Calculate contribution margin percentage
    let totalRevenue = 0;
    let totalContributionMargin = 0;

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
    });

    const contributionMarginPercent = totalRevenue > 0 
      ? (totalContributionMargin / totalRevenue) * 100 
      : 0;

    // Variable cost percentage (inverse of contribution margin)
    const variableCostPercent = 100 - contributionMarginPercent;

    // Break-even point
    const breakEvenRevenue = contributionMarginPercent > 0 
      ? (totalFixed / (contributionMarginPercent / 100))
      : 0;

    // Economic break-even
    const economicBreakEvenRevenue = contributionMarginPercent > 0
      ? ((totalFixed + desiredProfit) / (contributionMarginPercent / 100))
      : 0;

    // Generate chart data points
    const maxRevenue = Math.max(totalRevenue, economicBreakEvenRevenue) * 1.3;
    const points = 12;
    const step = maxRevenue / points;

    const data = [];
    for (let i = 0; i <= points; i++) {
      const revenue = step * i;
      const variableCosts = revenue * (variableCostPercent / 100);
      const totalCosts = totalFixed + variableCosts;
      const profit = revenue - totalCosts;

      data.push({
        revenue,
        revenueLabel: formatCompact(revenue),
        custoFixo: totalFixed,
        custoTotal: totalCosts,
        receita: revenue,
        lucro: profit,
      });
    }

    return {
      data,
      totalFixed,
      breakEvenRevenue,
      economicBreakEvenRevenue,
      totalRevenue,
      contributionMarginPercent,
    };
  }, [products, resaleProducts, getTotalFixedExpenses, getTotalEmployeeCost, desiredProfit]);

  if (chartData.contributionMarginPercent <= 0) {
    return (
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-primary" />
            Gráfico de Ponto de Equilíbrio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Cadastre produtos com previsão de vendas para visualizar o gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Gráfico de Ponto de Equilíbrio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="revenueLabel" 
                tick={{ fontSize: 11 }}
                label={{ value: 'Faturamento', position: 'insideBottom', offset: -10, fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatCompact}
                tick={{ fontSize: 11 }}
                label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    custoFixo: 'Custos Fixos',
                    custoTotal: 'Custo Total',
                    receita: 'Receita',
                  };
                  return [formatCurrency(value), labels[name] || name];
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    custoFixo: 'Custos Fixos',
                    custoTotal: 'Custo Total (Fixo + Variável)',
                    receita: 'Receita',
                  };
                  return labels[value] || value;
                }}
              />
              
              {/* Fixed Costs Line (horizontal) */}
              <Line 
                type="monotone" 
                dataKey="custoFixo" 
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              
              {/* Total Costs Line */}
              <Line 
                type="monotone" 
                dataKey="custoTotal" 
                stroke="#f97316"
                strokeWidth={3}
                dot={false}
              />
              
              {/* Revenue Line */}
              <Line 
                type="monotone" 
                dataKey="receita" 
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
              />
              
              {/* Break-even reference line */}
              <ReferenceLine 
                x={formatCompact(chartData.breakEvenRevenue)} 
                stroke="#eab308"
                strokeWidth={2}
                strokeDasharray="8 4"
                label={{
                  value: 'PE',
                  fill: '#eab308',
                  fontSize: 12,
                  fontWeight: 'bold',
                  position: 'top',
                }}
              />
              
              {/* Current revenue reference line */}
              {chartData.totalRevenue > 0 && (
                <ReferenceLine 
                  x={formatCompact(chartData.totalRevenue)} 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  label={{
                    value: 'Atual',
                    fill: 'hsl(142, 76%, 36%)',
                    fontSize: 12,
                    fontWeight: 'bold',
                    position: 'top',
                  }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend explanation */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-primary rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">Custos Fixos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: '#f97316' }} />
            <span className="text-muted-foreground">Custo Total</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-muted-foreground">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: '#eab308', borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">Ponto de Equilíbrio (PE)</span>
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p>
            O ponto de equilíbrio ocorre quando a linha de <span className="text-green-500 font-medium">Receita</span> cruza 
            a linha de <span className="text-orange-500 font-medium">Custo Total</span> em{' '}
            <span className="font-bold text-foreground">{formatCurrency(chartData.breakEvenRevenue)}</span>.
            Acima deste ponto, a empresa gera lucro; abaixo, prejuízo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
