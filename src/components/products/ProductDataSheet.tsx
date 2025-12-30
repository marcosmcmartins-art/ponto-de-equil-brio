import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePricingStore } from "@/store/pricingStore";
import { ProductIngredient } from "@/types/pricing";
import { ClipboardList, Search, Package, DollarSign, Layers, ArrowRight, X, Edit2, Plus, Trash2, Save, XCircle } from "lucide-react";
import { toast } from "sonner";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const ProductDataSheet = () => {
  const { products, rawMaterials, updateProduct, config } = usePricingStore();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [compareProductId, setCompareProductId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState<ProductIngredient[]>([]);
  const [newMaterialId, setNewMaterialId] = useState<string>("");
  const [newQuantity, setNewQuantity] = useState<string>("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toString().includes(searchTerm)
    );
  }, [products, searchTerm]);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const compareProduct = products.find(p => p.id === compareProductId);

  // Get available materials for adding (not already in the composition)
  const availableMaterials = useMemo(() => {
    const usedIds = editedIngredients.map(ing => ing.rawMaterialId);
    return rawMaterials.filter(m => !usedIds.includes(m.id));
  }, [rawMaterials, editedIngredients]);

  const getIngredientDetails = (ingredients: ProductIngredient[]) => {
    return ingredients.map(ing => {
      const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
      return {
        rawMaterialId: ing.rawMaterialId,
        code: material?.code || 0,
        name: material?.name || "Material não encontrado",
        unit: material?.unit || "-",
        quantity: ing.quantity,
        unitPrice: material?.pricePerMeasure || 0,
        value: ing.value || (material ? material.pricePerMeasure * ing.quantity : 0),
      };
    });
  };

  const startEditing = () => {
    if (selectedProduct) {
      setEditedIngredients([...selectedProduct.ingredients]);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedIngredients([]);
    setNewMaterialId("");
    setNewQuantity("");
  };

  const handleUpdateQuantity = (rawMaterialId: string, newQty: number) => {
    const material = rawMaterials.find(m => m.id === rawMaterialId);
    setEditedIngredients(prev => 
      prev.map(ing => 
        ing.rawMaterialId === rawMaterialId 
          ? { ...ing, quantity: newQty, value: (material?.pricePerMeasure || 0) * newQty }
          : ing
      )
    );
  };

  const handleRemoveIngredient = (rawMaterialId: string) => {
    setEditedIngredients(prev => prev.filter(ing => ing.rawMaterialId !== rawMaterialId));
  };

  const handleAddIngredient = () => {
    if (!newMaterialId || !newQuantity) {
      toast.error("Selecione a matéria-prima e informe a quantidade");
      return;
    }
    
    const qty = parseFloat(newQuantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantidade inválida");
      return;
    }

    const material = rawMaterials.find(m => m.id === newMaterialId);
    if (!material) return;

    const newIngredient: ProductIngredient = {
      rawMaterialId: newMaterialId,
      quantity: qty,
      value: material.pricePerMeasure * qty
    };

    setEditedIngredients(prev => [...prev, newIngredient]);
    setNewMaterialId("");
    setNewQuantity("");
  };

  const handleSave = () => {
    if (!selectedProduct) return;

    // Calculate new costs
    const ingredientsCost = editedIngredients.reduce((sum, ing) => sum + ing.value, 0);
    const totalVariableCost = ingredientsCost + selectedProduct.laborCost;
    
    // Recalculate prices using the same formula from the store
    const totalDeductions = 
      selectedProduct.profitMargin + 
      config.defaultFixedExpensesRate + 
      selectedProduct.taxes + 
      selectedProduct.freight + 
      selectedProduct.cardFee + 
      selectedProduct.appFee + 
      selectedProduct.commission;
    
    const markupDivisor = (100 - totalDeductions) / 100;
    const suggestedPrice = markupDivisor > 0 ? totalVariableCost / markupDivisor : totalVariableCost;
    const markupMultiplier = totalVariableCost > 0 ? suggestedPrice / totalVariableCost : 1;
    const contributionMargin = suggestedPrice - totalVariableCost;
    const expectedRevenue = suggestedPrice * selectedProduct.salesForecast;

    updateProduct(selectedProduct.id, {
      ingredients: editedIngredients,
      totalVariableCost,
      suggestedPrice,
      finalPrice: suggestedPrice,
      markupMultiplier,
      contributionMargin,
      expectedRevenue
    });

    setIsEditing(false);
    setEditedIngredients([]);
    toast.success("Ficha técnica atualizada com sucesso!");
  };

  // Calculate costs for editing preview
  const editingIngredientsCost = useMemo(() => {
    return editedIngredients.reduce((sum, ing) => sum + ing.value, 0);
  }, [editedIngredients]);

  const renderProductCard = (product: typeof selectedProduct, title: string, onClear?: () => void) => {
    if (!product) return null;
    
    const isSelectedProduct = product.id === selectedProductId;
    const ingredientsToShow = isSelectedProduct && isEditing ? editedIngredients : product.ingredients;
    const ingredients = getIngredientDetails(ingredientsToShow);
    const ingredientsCost = isSelectedProduct && isEditing 
      ? editingIngredientsCost 
      : ingredients.reduce((sum, ing) => sum + ing.value, 0);
    
    const currentTotalVariableCost = isSelectedProduct && isEditing 
      ? editingIngredientsCost + product.laborCost 
      : product.totalVariableCost;

    return (
      <Card className="glass border-border/50 flex-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isSelectedProduct && !isEditing && (
                <Button variant="outline" size="sm" onClick={startEditing} className="gap-2">
                  <Edit2 className="w-4 h-4" />
                  Editar Ficha
                </Button>
              )}
              {onClear && (
                <Button variant="ghost" size="icon" onClick={onClear}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Product Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Código:</span>
                <p className="font-bold font-mono">{product.code}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Unidade:</span>
                <p className="font-bold">{product.unit}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Nome:</span>
                <p className="font-bold text-lg">{product.name}</p>
              </div>
            </div>
          </div>

          {/* Ingredients Table */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Composição do Produto
              {isSelectedProduct && isEditing && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Editando</span>
              )}
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">Cód</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Unid</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    {isSelectedProduct && isEditing && <TableHead className="w-12"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ing, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono">{ing.code}</TableCell>
                      <TableCell className="text-muted-foreground">Insumo</TableCell>
                      <TableCell className="font-medium">{ing.name}</TableCell>
                      <TableCell className="text-center">{ing.unit}</TableCell>
                      <TableCell className="text-right">
                        {isSelectedProduct && isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={ing.quantity}
                            onChange={(e) => handleUpdateQuantity(ing.rawMaterialId, parseFloat(e.target.value) || 0)}
                            className="w-20 text-right h-8"
                          />
                        ) : (
                          ing.quantity.toFixed(2)
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(ing.value)}</TableCell>
                      {isSelectedProduct && isEditing && (
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveIngredient(ing.rawMaterialId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {ingredients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isSelectedProduct && isEditing ? 7 : 6} className="text-center text-muted-foreground py-8">
                        Nenhum ingrediente cadastrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Add Ingredient Row */}
            {isSelectedProduct && isEditing && (
              <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-dashed border-border">
                <div className="flex items-center gap-3">
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <Select value={newMaterialId} onValueChange={setNewMaterialId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione matéria-prima..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.code} - {m.name} ({formatCurrency(m.pricePerMeasure)}/{m.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Qtd"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-24"
                  />
                  <Button size="sm" onClick={handleAddIngredient} className="gap-1">
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Cost Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Resumo de Custos
            </h4>
            <div className="grid gap-2">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Custo com Mão de Obra Direta</span>
                <span className="font-bold">{formatCurrency(product.laborCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-muted-foreground">Custo com Insumos/Matéria Prima</span>
                <span className="font-bold">{formatCurrency(ingredientsCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/30">
                <span className="font-semibold text-primary">Custos Variáveis Totais</span>
                <span className="font-bold text-primary text-lg">{formatCurrency(currentTotalVariableCost)}</span>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Preço Sugerido</span>
              <p className="font-bold">{formatCurrency(product.suggestedPrice)}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <span className="text-green-600">Preço Final</span>
              <p className="font-bold text-green-600">{formatCurrency(product.finalPrice)}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Margem Lucro</span>
              <p className="font-bold">{product.profitMargin}%</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-muted-foreground">Markup</span>
              <p className="font-bold">{product.markupMultiplier.toFixed(2)}x</p>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isSelectedProduct && isEditing && (
            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="outline" onClick={cancelEditing} className="gap-2">
                <XCircle className="w-4 h-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Salvar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-heading font-bold text-foreground"
      >
        <span className="text-gradient">Ficha</span> Técnica
      </motion.h1>

      {/* Search and Select */}
      <Card className="glass border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Localizar Produto</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Selecionar Produto</label>
              <Select 
                value={selectedProductId} 
                onValueChange={(value) => {
                  setSelectedProductId(value);
                  cancelEditing();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um produto..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground mb-1 block">Comparar com</label>
              <Select value={compareProductId} onValueChange={(value) => setCompareProductId(value === "none" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Comparar com outro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {products.filter(p => p.id !== selectedProductId).map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Cards */}
      {selectedProduct ? (
        <div className="flex gap-6">
          {renderProductCard(selectedProduct, "Produto Selecionado")}
          {compareProduct && (
            <>
              <div className="flex items-center">
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </div>
              {renderProductCard(compareProduct, "Comparativo", () => setCompareProductId(""))}
            </>
          )}
        </div>
      ) : (
        <Card className="glass border-border/50">
          <CardContent className="py-16 text-center">
            <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg">
              Selecione um produto para visualizar sua ficha técnica
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              A ficha técnica mostra a composição detalhada do produto com todos os ingredientes e custos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
