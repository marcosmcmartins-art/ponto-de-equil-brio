import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePricingStore } from '@/store/pricingStore';

const CATEGORY_LABELS: Record<string, string> = {
  salaries: 'Salários',
  rent: 'Aluguel',
  utilities: 'Utilidades',
  administrative: 'Administrativo',
  other: 'Outros',
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--accent))',
];

export function ExpensesByCategoryChart() {
  const { fixedExpenses } = usePricingStore();

  const categoryTotals = fixedExpenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.monthlyValue;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals)
    .map(([category, value]) => ({
      category,
      name: CATEGORY_LABELS[category] || category,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (data.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Sem despesas fixas cadastradas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Despesas por Categoria</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 10, right: 30, bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11 }} 
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Valor']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
