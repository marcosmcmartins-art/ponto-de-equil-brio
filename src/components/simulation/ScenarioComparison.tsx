import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePricingStore } from "@/store/pricingStore";
import type { SavedScenario } from "@/types/pricing";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ScenarioComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatPercent = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export const ScenarioComparison = ({ isOpen, onClose }: ScenarioComparisonProps) => {
  const { savedScenarios } = usePricingStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedScenarios = useMemo(
    () => savedScenarios.filter((s) => selectedIds.includes(s.id)),
    [savedScenarios, selectedIds]
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const calculateDifference = (value: number, baseValue: number): number => {
    if (baseValue === 0) return 0;
    return ((value - baseValue) / Math.abs(baseValue)) * 100;
  };

  const getDifferenceIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-3.5 h-3.5 text-green-600" />;
    if (diff < 0) return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const metrics = [
    { key: "revenue", label: "Faturamento", higherIsBetter: true },
    { key: "variableCosts", label: "Custos Variáveis", higherIsBetter: false },
    { key: "contributionMargin", label: "Margem de Contribuição", higherIsBetter: true },
    { key: "fixedExpenses", label: "Despesas Fixas", higherIsBetter: false },
    { key: "profit", label: "Lucro", higherIsBetter: true },
  ] as const;

  const chartData = useMemo(() => {
    return metrics.map((metric) => ({
      name: metric.label,
      ...Object.fromEntries(
        selectedScenarios.map((s) => [s.name, s.totals[metric.key]])
      ),
    }));
  }, [selectedScenarios, metrics]);

  const chartColors = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

  const baseScenario = selectedScenarios[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Comparar Cenários
          </DialogTitle>
          <DialogDescription>
            Selecione até 3 cenários para comparar lado a lado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">
              Selecionar Cenários ({selectedIds.length}/3)
            </h3>
            <ScrollArea className="h-[200px] lg:h-[400px] pr-4">
              {savedScenarios.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum cenário salvo para comparar.
                </p>
              ) : (
                <div className="space-y-2">
                  {savedScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedIds.includes(scenario.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      } ${
                        selectedIds.length >= 3 && !selectedIds.includes(scenario.id)
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => toggleSelection(scenario.id)}
                    >
                      <Checkbox
                        id={`scenario-${scenario.id}`}
                        checked={selectedIds.includes(scenario.id)}
                        disabled={selectedIds.length >= 3 && !selectedIds.includes(scenario.id)}
                        onCheckedChange={() => toggleSelection(scenario.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`scenario-${scenario.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {scenario.name}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Lucro: {formatCurrency(scenario.totals.profit)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Comparison Table & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {selectedScenarios.length < 2 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione pelo menos 2 cenários para comparar.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Métrica</TableHead>
                        {selectedScenarios.map((s, idx) => (
                          <TableHead key={s.id} className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: chartColors[idx] }}
                              />
                              {s.name}
                            </div>
                          </TableHead>
                        ))}
                        {selectedScenarios.length > 1 && (
                          <TableHead className="text-right">Variação</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.map((metric) => {
                        const values = selectedScenarios.map((s) => s.totals[metric.key]);
                        const bestValue = metric.higherIsBetter
                          ? Math.max(...values)
                          : Math.min(...values);

                        return (
                          <TableRow key={metric.key}>
                            <TableCell className="font-medium">{metric.label}</TableCell>
                            {selectedScenarios.map((s) => {
                              const value = s.totals[metric.key];
                              const isBest = value === bestValue && selectedScenarios.length > 1;

                              return (
                                <TableCell
                                  key={s.id}
                                  className={`text-right ${
                                    isBest ? "font-bold text-green-600" : ""
                                  }`}
                                >
                                  {formatCurrency(value)}
                                </TableCell>
                              );
                            })}
                            {selectedScenarios.length > 1 && baseScenario && (
                              <TableCell className="text-right">
                                {selectedScenarios.slice(1).map((s, idx) => {
                                  const diff = calculateDifference(
                                    s.totals[metric.key],
                                    baseScenario.totals[metric.key]
                                  );
                                  const isPositive = metric.higherIsBetter ? diff > 0 : diff < 0;

                                  return (
                                    <div
                                      key={s.id}
                                      className={`flex items-center justify-end gap-1 ${
                                        idx > 0 ? "mt-1" : ""
                                      }`}
                                    >
                                      {getDifferenceIcon(metric.higherIsBetter ? diff : -diff)}
                                      <span
                                        className={`text-xs ${
                                          isPositive
                                            ? "text-green-600"
                                            : diff === 0
                                            ? "text-muted-foreground"
                                            : "text-destructive"
                                        }`}
                                      >
                                        {formatPercent(diff)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Chart */}
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        type="number"
                        tickFormatter={(v) =>
                          new Intl.NumberFormat("pt-BR", {
                            notation: "compact",
                            compactDisplay: "short",
                          }).format(v)
                        }
                        className="text-xs"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        className="text-xs"
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      {selectedScenarios.map((s, idx) => (
                        <Bar
                          key={s.id}
                          dataKey={s.name}
                          fill={chartColors[idx]}
                          radius={[0, 4, 4, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
