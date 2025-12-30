import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePricingStore } from "@/store/pricingStore";
import type { ResaleProduct } from "@/types/pricing";

interface ResaleProductFormProps {
  product?: ResaleProduct | null;
  onClose: () => void;
}

export const ResaleProductForm = ({ product, onClose }: ResaleProductFormProps) => {
  const { resaleProducts, addResaleProduct, updateResaleProduct, config } = usePricingStore();
  
  const [formData, setFormData] = useState({
    code: product?.code || resaleProducts.length + 1,
    name: product?.name || '',
    supplier: product?.supplier || '',
    packageQuantity: product?.packageQuantity || 1,
    unit: product?.unit || 'Unidade',
    purchasePrice: product?.purchasePrice || 0,
    profitMargin: product?.profitMargin || config.defaultProfitMargin,
    taxes: product?.taxes || config.defaultTaxes,
    freight: product?.freight || 0,
    cardFee: product?.cardFee || config.defaultCardFee,
    appFee: product?.appFee || config.defaultAppFee,
    commission: product?.commission || config.defaultCommission,
    finalPrice: product?.finalPrice || 0,
    salesForecast: product?.salesForecast || 0,
  });

  // Calculate preview values
  const pricePerUnit = formData.packageQuantity > 0 ? formData.purchasePrice / formData.packageQuantity : formData.purchasePrice;
  const totalPercentage = (formData.profitMargin + formData.taxes + formData.cardFee + formData.appFee + formData.commission) / 100;
  const suggestedPrice = (pricePerUnit + formData.freight) / (1 - totalPercentage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (product) {
      updateResaleProduct(product.id, formData);
    } else {
      addResaleProduct(formData);
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-semibold text-foreground">
            {product ? 'Editar Produto' : 'Novo Produto para Revenda'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Dados do Produto</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  type="number"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: parseInt(e.target.value) || 0 })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Fornecedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Nome do fornecedor"
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packageQuantity">Qtd por Embalagem</Label>
                <Input
                  id="packageQuantity"
                  type="number"
                  value={formData.packageQuantity}
                  onChange={(e) => setFormData({ ...formData, packageQuantity: parseInt(e.target.value) || 1 })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ex: Unidade, KG"
                  className="bg-secondary/50"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Precificação</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Preço de Compra (R$)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50"
                  required
                />
              </div>
              <div className="space-y-2">
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
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="freight">Frete (R$)</Label>
                <Input
                  id="freight"
                  type="number"
                  step="0.01"
                  value={formData.freight}
                  onChange={(e) => setFormData({ ...formData, freight: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardFee">Taxa Cartão (%)</Label>
                <Input
                  id="cardFee"
                  type="number"
                  step="0.1"
                  value={formData.cardFee}
                  onChange={(e) => setFormData({ ...formData, cardFee: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appFee">Taxa Aplicativo (%)</Label>
                <Input
                  id="appFee"
                  type="number"
                  step="0.1"
                  value={formData.appFee}
                  onChange={(e) => setFormData({ ...formData, appFee: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Comissão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.1"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesForecast">Previsão Vendas/Mês</Label>
                <Input
                  id="salesForecast"
                  type="number"
                  value={formData.salesForecast}
                  onChange={(e) => setFormData({ ...formData, salesForecast: parseInt(e.target.value) || 0 })}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalPrice">Preço Final (R$)</Label>
              <Input
                id="finalPrice"
                type="number"
                step="0.01"
                value={formData.finalPrice}
                onChange={(e) => setFormData({ ...formData, finalPrice: parseFloat(e.target.value) || 0 })}
                className="bg-secondary/50"
                placeholder={suggestedPrice.toFixed(2)}
              />
            </div>
          </div>

          {/* Price Preview */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground mb-3">Prévia de Preços</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço por Unidade:</span>
                <span className="font-medium">{formatCurrency(pricePerUnit)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preço Sugerido:</span>
                <span className="font-bold text-primary">{formatCurrency(suggestedPrice)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {product ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
