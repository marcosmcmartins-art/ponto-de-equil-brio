import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/store/pricingStore";
import { ResaleProductForm } from "./ResaleProductForm";
import type { ResaleProduct } from "@/types/pricing";

export const ResaleProductsList = () => {
  const { resaleProducts, deleteResaleProduct } = usePricingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ResaleProduct | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleEdit = (product: ResaleProduct) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const totalRevenue = resaleProducts.reduce((sum, p) => sum + (p.finalPrice * p.salesForecast), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Produtos para Revenda
          </h2>
          <p className="text-muted-foreground">
            Produtos de comércio com cálculo de margem
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Faturamento Previsto</p>
            <p className="text-3xl font-heading font-bold text-primary">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {resaleProducts.length} produto(s) cadastrado(s)
            </p>
          </div>
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      {resaleProducts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 text-left">
                  <th className="p-4 font-medium text-muted-foreground">Cód</th>
                  <th className="p-4 font-medium text-muted-foreground">Produto</th>
                  <th className="p-4 font-medium text-muted-foreground">Fornecedor</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Qtd/Emb</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Preço Compra</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Preço/Unid</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Margem</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Preço Sugerido</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Preço Final</th>
                  <th className="p-4 font-medium text-muted-foreground text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {resaleProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-t border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4 text-muted-foreground">{product.code}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{product.name}</span>
                          <p className="text-xs text-muted-foreground">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{product.supplier}</td>
                    <td className="p-4 text-right text-foreground">{product.packageQuantity}</td>
                    <td className="p-4 text-right text-foreground">{formatCurrency(product.purchasePrice)}</td>
                    <td className="p-4 text-right text-foreground">{formatCurrency(product.pricePerUnit)}</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-1 bg-success/10 text-success rounded-full text-sm">
                        {product.profitMargin}%
                      </span>
                    </td>
                    <td className="p-4 text-right text-primary font-medium">
                      {formatCurrency(product.suggestedPrice)}
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground">
                      {formatCurrency(product.finalPrice)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          className="h-8 w-8 hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteResaleProduct(product.id)}
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum produto para revenda cadastrado</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
            Adicionar primeiro produto
          </Button>
        </motion.div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ResaleProductForm
          product={editingProduct}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};
