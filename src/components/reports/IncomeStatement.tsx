import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/store/pricingStore";
import { FileText, TrendingUp, TrendingDown, FileDown, Loader2 } from "lucide-react";
import { exportToPdf } from "@/lib/pdfExport";
import { toast } from "sonner";
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercent = (value: number, total: number) => {
  if (total === 0) return "0,00%";
  return `${((value / total) * 100).toFixed(2)}%`;
};

export const IncomeStatement = () => {
  const { products, resaleProducts, getTotalFixedExpenses, getTotalEmployeeCost } = usePricingStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      await exportToPdf(contentRef.current, {
        title: "Demonstração de Resultado do Exercício (DRE)",
        filename: "DRE_Precificacao",
      });
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const dre = useMemo(() => {
    let grossRevenue = 0;
    let totalVariableCosts = 0;
    let taxes = 0;
    let cardFees = 0;
    let appFees = 0;
    let commissions = 0;

    // Products
    products.forEach(p => {
      const revenue = p.salesForecast * p.finalPrice;
      const variableCost = p.salesForecast * p.totalVariableCost;
      
      grossRevenue += revenue;
      totalVariableCosts += variableCost;
      taxes += revenue * (p.taxes / 100);
      cardFees += revenue * (p.cardFee / 100);
      appFees += revenue * (p.appFee / 100);
      commissions += revenue * (p.commission / 100);
    });

    // Resale Products
    resaleProducts.forEach(p => {
      const revenue = p.salesForecast * p.finalPrice;
      const variableCost = p.salesForecast * p.pricePerUnit;
      
      grossRevenue += revenue;
      totalVariableCosts += variableCost;
      taxes += revenue * (p.taxes / 100);
      cardFees += revenue * (p.cardFee / 100);
      appFees += revenue * (p.appFee / 100);
      commissions += revenue * (p.commission / 100);
    });

    const totalDeductions = taxes + cardFees + appFees + commissions;
    const netRevenue = grossRevenue - totalDeductions;
    const contributionMargin = netRevenue - totalVariableCosts;
    const totalFixedExpenses = getTotalFixedExpenses();
    const totalEmployeeCost = getTotalEmployeeCost();
    const totalFixed = totalFixedExpenses + totalEmployeeCost;
    const operatingProfit = contributionMargin - totalFixed;
    const operatingMargin = grossRevenue > 0 ? (operatingProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      taxes,
      cardFees,
      appFees,
      commissions,
      totalDeductions,
      netRevenue,
      totalVariableCosts,
      contributionMargin,
      totalFixedExpenses,
      totalEmployeeCost,
      totalFixed,
      operatingProfit,
      operatingMargin,
    };
  }, [products, resaleProducts, getTotalFixedExpenses, getTotalEmployeeCost]);

  const LineItem = ({ 
    label, 
    value, 
    percentage, 
    type = 'normal',
    indent = 0,
    bold = false,
  }: { 
    label: string; 
    value: number; 
    percentage: string;
    type?: 'positive' | 'negative' | 'normal' | 'result';
    indent?: number;
    bold?: boolean;
  }) => {
    const prefix = type === 'positive' ? '(+)' : type === 'negative' ? '(-)' : type === 'result' ? '(=)' : '';
    
    return (
      <div 
        className={`flex items-center justify-between py-2 px-3 ${
          type === 'result' ? 'bg-muted/50 rounded-lg' : ''
        } ${bold ? 'font-semibold' : ''}`}
        style={{ paddingLeft: `${12 + indent * 16}px` }}
      >
        <span className={`${type === 'negative' ? 'text-destructive' : ''} ${type === 'result' ? 'text-primary' : ''}`}>
          {prefix} {label}
        </span>
        <div className="flex items-center gap-4">
          <span className={`font-mono ${
            type === 'negative' ? 'text-destructive' : ''
          } ${type === 'result' ? 'text-primary font-bold' : ''}`}>
            {formatCurrency(Math.abs(value))}
          </span>
          <span className="text-muted-foreground text-sm w-16 text-right">
            {percentage}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" ref={contentRef}>
      <Card className="glass border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Demonstração de Resultado do Exercício (DRE)
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPdf}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Exportar PDF
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {/* Gross Revenue */}
            <LineItem 
              label="Faturamento Bruto" 
              value={dre.grossRevenue} 
              percentage="100,00%"
              type="positive"
              bold
            />

            {/* Deductions */}
            <div className="py-2">
              <p className="text-sm text-muted-foreground px-3 py-1">Deduções sobre Vendas</p>
              <LineItem 
                label="Impostos sobre Vendas" 
                value={-dre.taxes} 
                percentage={formatPercent(dre.taxes, dre.grossRevenue)}
                type="negative"
                indent={1}
              />
              <LineItem 
                label="Taxa de Cartão" 
                value={-dre.cardFees} 
                percentage={formatPercent(dre.cardFees, dre.grossRevenue)}
                type="negative"
                indent={1}
              />
              <LineItem 
                label="Taxa de Aplicativo" 
                value={-dre.appFees} 
                percentage={formatPercent(dre.appFees, dre.grossRevenue)}
                type="negative"
                indent={1}
              />
              <LineItem 
                label="Comissões de Vendas" 
                value={-dre.commissions} 
                percentage={formatPercent(dre.commissions, dre.grossRevenue)}
                type="negative"
                indent={1}
              />
            </div>

            {/* Net Revenue */}
            <LineItem 
              label="Faturamento Líquido" 
              value={dre.netRevenue} 
              percentage={formatPercent(dre.netRevenue, dre.grossRevenue)}
              type="result"
              bold
            />

            {/* Variable Costs */}
            <LineItem 
              label="Custos Variáveis (CMV)" 
              value={-dre.totalVariableCosts} 
              percentage={formatPercent(dre.totalVariableCosts, dre.grossRevenue)}
              type="negative"
              bold
            />

            {/* Contribution Margin */}
            <LineItem 
              label="Margem de Contribuição" 
              value={dre.contributionMargin} 
              percentage={formatPercent(dre.contributionMargin, dre.grossRevenue)}
              type="result"
              bold
            />

            {/* Fixed Expenses */}
            <div className="py-2">
              <p className="text-sm text-muted-foreground px-3 py-1">Despesas Fixas</p>
              <LineItem 
                label="Despesas Operacionais" 
                value={-dre.totalFixedExpenses} 
                percentage={formatPercent(dre.totalFixedExpenses, dre.grossRevenue)}
                type="negative"
                indent={1}
              />
              <LineItem 
                label="Folha de Pagamento" 
                value={-dre.totalEmployeeCost} 
                percentage={formatPercent(dre.totalEmployeeCost, dre.grossRevenue)}
                type="negative"
                indent={1}
              />
            </div>

            {/* Operating Profit */}
            <div className={`p-4 rounded-lg mt-2 ${dre.operatingProfit >= 0 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-lg flex items-center gap-2 ${dre.operatingProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                  {dre.operatingProfit >= 0 ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  (=) Lucro Operacional
                </span>
                <div className="flex items-center gap-4">
                  <span className={`font-bold text-xl font-mono ${dre.operatingProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {formatCurrency(dre.operatingProfit)}
                  </span>
                  <span className={`font-semibold ${dre.operatingProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {formatPercent(dre.operatingProfit, dre.grossRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Card */}
      <Card className={`glass border-border/50 ${dre.operatingProfit >= 0 ? 'bg-green-500/5 border-green-500/30' : 'bg-destructive/5 border-destructive/30'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${dre.operatingProfit >= 0 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
              {dre.operatingProfit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-destructive" />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold text-lg ${dre.operatingProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {dre.operatingProfit >= 0 
                  ? 'Sua empresa gera LUCRO operacional!'
                  : 'Sua empresa está gerando PREJUÍZO operacional'
                }
              </h4>
              <p className="text-muted-foreground mt-1">
                {dre.operatingProfit >= 0 
                  ? `Com base na previsão de vendas, a margem operacional é de ${dre.operatingMargin.toFixed(2)}%, ou seja, a cada R$ 100,00 de faturamento, sobram ${formatCurrency(dre.operatingMargin)} de lucro.`
                  : `A empresa precisa aumentar o faturamento em ${formatCurrency(Math.abs(dre.operatingProfit))} ou reduzir custos para atingir o ponto de equilíbrio.`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
