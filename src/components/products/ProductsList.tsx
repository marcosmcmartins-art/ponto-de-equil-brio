import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Boxes, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePricingStore } from "@/store/pricingStore";
import { ProductForm } from "./ProductForm";
import type { Product } from "@/types/pricing";

export const ProductsList = () => {
  const { products, rawMaterials, deleteProduct } = usePricingStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const getMaterialName = (id: string) => {
    return rawMaterials.find(m => m.id === id)?.name || "Desconhecido";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">
            Produtos
          </h2>
          <p className="text-muted-foreground">
            {products.length} produtos precificados
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
        />
      </motion.div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Boxes className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product)}
                      className="hover:bg-primary/10 hover:text-primary h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteProduct(product.id)}
                      className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pricing Info */}
              <div className="p-5 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Custo Total</p>
                  <p className="font-semibold text-foreground">{formatCurrency(product.totalVariableCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Margem</p>
                  <p className="font-semibold text-success">{product.profitMargin}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Preço Final</p>
                  <p className="font-bold text-primary text-lg">{formatCurrency(product.finalPrice)}</p>
                </div>
              </div>

              {/* Expandable Ingredients */}
              <div className="border-t border-border/50">
                <button
                  onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                  className="w-full px-5 py-3 flex items-center justify-between text-sm text-muted-foreground hover:bg-secondary/20 transition-colors"
                >
                  <span>Ficha Técnica ({product.ingredients.length} ingredientes)</span>
                  {expandedProduct === product.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedProduct === product.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 space-y-2">
                        {product.ingredients.map((ing, i) => (
                          <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/30 last:border-0">
                            <span className="text-foreground">{getMaterialName(ing.rawMaterialId)}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">{ing.quantity.toFixed(2)}</span>
                              <span className="text-foreground font-medium">{formatCurrency(ing.value)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <Boxes className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? "Nenhum resultado encontrado" : "Nenhum produto cadastrado"}
          </p>
        </motion.div>
      )}

      {/* Form Dialog */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editingProduct}
            onClose={handleCloseForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
