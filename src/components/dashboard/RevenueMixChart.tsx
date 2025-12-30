import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePricingStore } from '@/store/pricingStore';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--accent))',
];

export function RevenueMixChart() {
  const { products, resaleProducts } = usePricingStore();

  const productData = products
    .filter(p => p.expectedRevenue > 0)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      value: p.expectedRevenue,
      type: 'Indústria',
    }));

  const resaleData = resaleProducts
    .filter(p => p.salesForecast > 0)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      value: p.finalPrice * p.salesForecast,
      type: 'Revenda',
    }));

  const data = [...productData, ...resaleData].slice(0, 6);
  
  const totalRevenue = data.reduce((sum, d) => sum + d.value, 0);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (data.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-foreground">Mix de Faturamento</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Sem previsão de vendas cadastrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Mix de Faturamento</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name, props) => [
                formatCurrency(value), 
                `${props.payload.name} (${props.payload.type})`
              ]}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend 
              formatter={(_, entry: any) => (
                <span className="text-foreground text-xs">
                  {entry.payload?.name}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-20px' }}>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
