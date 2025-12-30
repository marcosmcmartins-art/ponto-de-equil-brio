import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon, TrendingUp, DollarSign, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { usePricingStore } from "@/store/pricingStore";

export const PricingCalculator = () => {
  const { config } = usePricingStore();
  
  const [values, setValues] = useState({
    cost: 100,
    profitMargin: config.defaultProfitMargin,
    fixedExpenses: config.defaultFixedExpensesRate,
    taxes: config.defaultTaxes,
    discount: 0,
  });

  const totalPercentage = (values.profitMargin + values.fixedExpenses + values.taxes) / 100;
  const suggestedPrice = values.cost / (1 - totalPercentage);
  const discountedPrice = suggestedPrice * (1 - values.discount / 100);
  const profit = discountedPrice - values.cost;
  const actualMargin = (profit / discountedPrice) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-heading font-bold text-foreground">
          Calculadora de Preços
        </h2>
        <p className="text-muted-foreground">
          Simule diferentes cenários de precificação
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-6 space-y-6"
        >
          <h3 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-primary" />
            Parâmetros
          </h3>

          {/* Cost Input */}
          <div className="space-y-2">
            <Label htmlFor="cost" className="flex items-center justify-between">
              <span>Custo do Produto</span>
              <span className="text-primary font-semibold">{formatCurrency(values.cost)}</span>
            </Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={values.cost}
              onChange={(e) => setValues({ ...values, cost: parseFloat(e.target.value) || 0 })}
              className="bg-secondary/50 text-lg"
            />
          </div>

          {/* Profit Margin Slider */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span>Margem de Lucro</span>
              <span className="text-success font-semibold">{values.profitMargin}%</span>
            </Label>
            <Slider
              value={[values.profitMargin]}
              onValueChange={([v]) => setValues({ ...values, profitMargin: v })}
              min={0}
              max={50}
              step={0.5}
              className="[&_[role=slider]]:bg-success"
            />
          </div>

          {/* Fixed Expenses Slider */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span>Despesas Fixas</span>
              <span className="text-warning font-semibold">{values.fixedExpenses}%</span>
            </Label>
            <Slider
              value={[values.fixedExpenses]}
              onValueChange={([v]) => setValues({ ...values, fixedExpenses: v })}
              min={0}
              max={30}
              step={0.5}
            />
          </div>

          {/* Taxes Slider */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span>Impostos</span>
              <span className="text-destructive font-semibold">{values.taxes}%</span>
            </Label>
            <Slider
              value={[values.taxes]}
              onValueChange={([v]) => setValues({ ...values, taxes: v })}
              min={0}
              max={30}
              step={0.5}
              className="[&_[role=slider]]:bg-destructive"
            />
          </div>

          {/* Discount Slider */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between">
              <span>Desconto</span>
              <span className="text-muted-foreground font-semibold">{values.discount}%</span>
            </Label>
            <Slider
              value={[values.discount]}
              onValueChange={([v]) => setValues({ ...values, discount: v })}
              min={0}
              max={50}
              step={1}
            />
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Suggested Price */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preço Sugerido</p>
                <p className="text-3xl font-heading font-bold text-primary">
                  {formatCurrency(suggestedPrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Discounted Price */}
          {values.discount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl p-6 border-warning/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Percent className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com {values.discount}% de Desconto</p>
                  <p className="text-3xl font-heading font-bold text-warning">
                    {formatCurrency(discountedPrice)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Profit */}
          <div className={`glass-card rounded-xl p-6 ${profit > 0 ? 'border-success/30' : 'border-destructive/30'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profit > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <TrendingUp className={`w-5 h-5 ${profit > 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lucro por Unidade</p>
                <p className={`text-3xl font-heading font-bold ${profit > 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(profit)}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Margem Real</span>
                <span className={`font-semibold ${actualMargin > 0 ? 'text-success' : 'text-destructive'}`}>
                  {actualMargin.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="font-heading font-semibold text-foreground mb-4">Composição do Preço</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Custo Base</span>
                <span className="font-medium text-foreground">{formatCurrency(values.cost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">+ Despesas Fixas ({values.fixedExpenses}%)</span>
                <span className="font-medium text-warning">
                  {formatCurrency(suggestedPrice * (values.fixedExpenses / 100))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">+ Impostos ({values.taxes}%)</span>
                <span className="font-medium text-destructive">
                  {formatCurrency(suggestedPrice * (values.taxes / 100))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">+ Lucro ({values.profitMargin}%)</span>
                <span className="font-medium text-success">
                  {formatCurrency(suggestedPrice * (values.profitMargin / 100))}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between items-center">
                <span className="font-semibold text-foreground">Preço Final</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(suggestedPrice)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
