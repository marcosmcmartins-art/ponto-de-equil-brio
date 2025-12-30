import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePricingStore } from '@/store/pricingStore';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))'];

export function CostDistributionChart() {
  const { products, getTotalFixedExpenses, getTotalEmployeeCost } = usePricingStore();

  const totalFixedExpenses = getTotalFixedExpenses();
  const totalEmployeeCosts = getTotalEmployeeCost();
  const totalVariableCosts = products.reduce((sum, p) => sum + p.totalVariableCost, 0);

  const data = [
    { name: 'Despesas Fixas', value: totalFixedExpenses },
    { name: 'Funcionários', value: totalEmployeeCosts },
    { name: 'Custos Variáveis', value: totalVariableCosts },
  ].filter(d => d.value > 0);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (data.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">Distribuição de Custos</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Sem dados de custos cadastrados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Distribuição de Custos</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
