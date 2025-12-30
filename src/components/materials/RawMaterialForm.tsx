import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePricingStore } from "@/store/pricingStore";
import type { RawMaterial } from "@/types/pricing";

interface RawMaterialFormProps {
  material?: RawMaterial | null;
  onClose: () => void;
}

export const RawMaterialForm = ({ material, onClose }: RawMaterialFormProps) => {
  const { addRawMaterial, updateRawMaterial, rawMaterials } = usePricingStore();
  
  const [formData, setFormData] = useState({
    code: material?.code || rawMaterials.length + 1,
    name: material?.name || "",
    grossWeight: material?.grossWeight || 1,
    netWeight: material?.netWeight || 1,
    unit: material?.unit || "KG",
    pricePerUnit: material?.pricePerUnit || 0,
    correctionFactor: material?.correctionFactor || 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (material) {
      updateRawMaterial(material.id, formData);
    } else {
      addRawMaterial(formData);
    }
    
    onClose();
  };

  const pricePerMeasure = formData.pricePerUnit / (formData.correctionFactor / 100);

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
        className="glass-card rounded-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-foreground">
            {material ? "Editar Matéria-Prima" : "Nova Matéria-Prima"}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="KG, Litro, Unidade..."
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome da matéria-prima"
              className="bg-secondary/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grossWeight">Peso Bruto</Label>
              <Input
                id="grossWeight"
                type="number"
                step="0.01"
                value={formData.grossWeight}
                onChange={(e) => setFormData({ ...formData, grossWeight: parseFloat(e.target.value) })}
                className="bg-secondary/50"
              />
            </div>
            <div>
              <Label htmlFor="netWeight">Peso Líquido</Label>
              <Input
                id="netWeight"
                type="number"
                step="0.01"
                value={formData.netWeight}
                onChange={(e) => setFormData({ ...formData, netWeight: parseFloat(e.target.value) })}
                className="bg-secondary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricePerUnit">Preço por Unidade (R$)</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="0.01"
                value={formData.pricePerUnit}
                onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) })}
                className="bg-secondary/50"
                required
              />
            </div>
            <div>
              <Label htmlFor="correctionFactor">Fator de Correção (%)</Label>
              <Input
                id="correctionFactor"
                type="number"
                step="1"
                value={formData.correctionFactor}
                onChange={(e) => setFormData({ ...formData, correctionFactor: parseFloat(e.target.value) })}
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Calculated Price Preview */}
          <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Preço por Medida (calculado)</p>
            <p className="text-2xl font-heading font-bold text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pricePerMeasure || 0)}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                por {formData.unit}
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
              {material ? "Salvar Alterações" : "Adicionar"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
