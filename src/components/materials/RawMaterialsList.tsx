import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePricingStore } from "@/store/pricingStore";
import { RawMaterialForm } from "./RawMaterialForm";
import type { RawMaterial } from "@/types/pricing";

export const RawMaterialsList = () => {
  const { rawMaterials, deleteRawMaterial } = usePricingStore();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const filteredMaterials = rawMaterials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleEdit = (material: RawMaterial) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaterial(null);
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
            Matérias-Primas
          </h2>
          <p className="text-muted-foreground">
            {rawMaterials.length} insumos cadastrados
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Matéria-Prima
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
          placeholder="Buscar matéria-prima..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
        />
      </motion.div>

      {/* List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-muted-foreground text-sm bg-secondary/30">
                <th className="p-4 font-medium">Cód</th>
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">Unidade</th>
                <th className="p-4 font-medium">Preço/Un</th>
                <th className="p-4 font-medium">Fator Correção</th>
                <th className="p-4 font-medium">Preço/Medida</th>
                <th className="p-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredMaterials.map((material, index) => (
                  <motion.tr
                    key={material.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4">
                      <span className="text-muted-foreground">#{material.code}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{material.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{material.unit}</td>
                    <td className="p-4 text-foreground">{formatCurrency(material.pricePerUnit)}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm">
                        {material.correctionFactor}%
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-primary">
                      {formatCurrency(material.pricePerMeasure)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(material)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRawMaterial(material.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredMaterials.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? "Nenhum resultado encontrado" : "Nenhuma matéria-prima cadastrada"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Form Dialog */}
      <AnimatePresence>
        {showForm && (
          <RawMaterialForm
            material={editingMaterial}
            onClose={handleCloseForm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
