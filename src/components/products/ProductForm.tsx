import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePricingStore } from "@/store/pricingStore";
import type { Product, ProductIngredient } from "@/types/pricing";

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export const ProductForm = ({ product, onClose }: ProductFormProps) => {
  const { addProduct, updateProduct, rawMaterials, products, config } = usePricingStore();
  
  const [formData, setFormData] = useState({
    code: product?.code || products.length + 1,
    name: product?.name || "",
    category: product?.category || "industry" as const,
    unit: product?.unit || "KG",
    laborCost: product?.laborCost || 0,
    profitMargin: product?.profitMargin || config.defaultProfitMargin,
    fixedExpensesRate: product?.fixedExpensesRate || config.defaultFixedExpensesRate,
    taxes: product?.taxes || config.defaultTaxes,
    freight: product?.freight || 0,
    cardFee: product?.cardFee || config.defaultCardFee,
    appFee: product?.appFee || config.defaultAppFee,
    commission: product?.commission || config.defaultCommission,
    salesForecast: product?.salesForecast || 0,
    finalPrice: product?.finalPrice || 0,
  });

  const [ingredients, setIngredients] = useState<ProductIngredient[]>(
    product?.ingredients || []
  );

  const addIngredient = () => {
    setIngredients([...ingredients, { rawMaterialId: "", quantity: 0, value: 0 }]);
  };

  const updateIngredient = (index: number, field: keyof ProductIngredient, value: string | number) => {
    const updated = [...ingredients];
    if (field === "rawMaterialId") {
      updated[index].rawMaterialId = value as string;
      const material = rawMaterials.find(m => m.id === value);
      if (material) {
        updated[index].value = material.pricePerMeasure * updated[index].quantity;
      }
    } else if (field === "quantity") {
      updated[index].quantity = value as number;
      const material = rawMaterials.find(m => m.id === updated[index].rawMaterialId);
      if (material) {
        updated[index].value = material.pricePerMeasure * (value as number);
      }
    }
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const ingredientsCost = ingredients.reduce((sum, ing) => sum + ing.value, 0);
  const totalVariableCost = ingredientsCost + formData.laborCost;
  const totalPercentage = (formData.profitMargin + formData.fixedExpensesRate + formData.taxes) / 100;
  const suggestedPrice = totalVariableCost / (1 - totalPercentage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      ingredients,
      finalPrice: formData.finalPrice || suggestedPrice,
    };

    if (product) {
      updateProduct(product.id, productData);
    } else {
      addProduct(productData);
    }
    
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-heading font-bold text-foreground">
              {product ? "Editar Produto" : "Novo Produto"}
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                type="number"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: parseInt(e.target.value) })}
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="KG, Saco, Unidade..."
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do produto"
              className="bg-secondary/50"
              required
            />
          </div>

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Ficha Técnica (Ingredientes)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {ingredients.map((ing, index) => (
              <div key={index} className="flex items-end gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="flex-1">
                  <Label className="text-xs">Matéria-Prima</Label>
                  <Select
                    value={ing.rawMaterialId}
                    onValueChange={(value) => updateIngredient(index, "rawMaterialId", value)}
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {rawMaterials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} ({formatCurrency(m.pricePerMeasure)}/{m.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={ing.quantity}
                    onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value) || 0)}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="w-28">
                  <Label className="text-xs">Valor</Label>
                  <Input
                    value={formatCurrency(ing.value)}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeIngredient(index)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Costs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="laborCost">Custo Mão de Obra (R$)</Label>
              <Input
                id="laborCost"
                type="number"
                step="0.01"
                value={formData.laborCost}
                onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label>Custo dos Ingredientes</Label>
              <Input
                value={formatCurrency(ingredientsCost)}
                readOnly
                className="bg-muted/50"
              />
            </div>
          </div>

          {/* Margins */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
              <Input
                id="profitMargin"
                type="number"
                step="0.1"
                value={formData.profitMargin}
                onChange={(e) => setFormData({ ...formData, profitMargin: parseFloat(e.target.value) || 0 })}
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="fixedExpensesRate">Despesas Fixas (%)</Label>
              <Input
                id="fixedExpensesRate"
                type="number"
                step="0.1"
                value={formData.fixedExpensesRate}
                onChange={(e) => setFormData({ ...formData, fixedExpensesRate: parseFloat(e.target.value) || 0 })}
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="taxes">Impostos (%)</Label>
              <Input
                id="taxes"
                type="number"
                step="0.1"
                value={formData.taxes}
                onChange={(e) => setFormData({ ...formData, taxes: parseFloat(e.target.value) || 0 })}
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Custo Variável Total</span>
              <span className="font-semibold text-foreground">{formatCurrency(totalVariableCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Preço Sugerido</span>
              <span className="font-semibold text-primary">{formatCurrency(suggestedPrice)}</span>
            </div>
            <div className="pt-3 border-t border-primary/20">
              <Label htmlFor="finalPrice">Preço Final (R$)</Label>
              <Input
                id="finalPrice"
                type="number"
                step="0.01"
                value={formData.finalPrice || suggestedPrice.toFixed(2)}
                onChange={(e) => setFormData({ ...formData, finalPrice: parseFloat(e.target.value) || 0 })}
                className="bg-background/50 mt-1 text-lg font-bold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {product ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
