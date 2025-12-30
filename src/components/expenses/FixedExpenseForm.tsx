import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePricingStore } from "@/store/pricingStore";
import type { FixedExpense } from "@/types/pricing";

interface FixedExpenseFormProps {
  expense?: FixedExpense | null;
  onClose: () => void;
}

const categories = [
  { value: 'salaries', label: 'Salários' },
  { value: 'rent', label: 'Aluguel' },
  { value: 'utilities', label: 'Utilidades (Água, Luz, Internet)' },
  { value: 'administrative', label: 'Administrativo' },
  { value: 'other', label: 'Outros' },
];

export const FixedExpenseForm = ({ expense, onClose }: FixedExpenseFormProps) => {
  const { fixedExpenses, addFixedExpense, updateFixedExpense } = usePricingStore();
  
  const [formData, setFormData] = useState({
    code: expense?.code || fixedExpenses.length + 1,
    name: expense?.name || '',
    category: expense?.category || 'other' as FixedExpense['category'],
    monthlyValue: expense?.monthlyValue || 0,
    description: expense?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (expense) {
      updateFixedExpense(expense.id, formData);
    } else {
      addFixedExpense(formData);
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
        className="glass-card rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-semibold text-foreground">
            {expense ? 'Editar Despesa' : 'Nova Despesa Fixa'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as FixedExpense['category'] })}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome da Despesa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Aluguel, Energia, etc."
              className="bg-secondary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyValue">Valor Mensal (R$)</Label>
            <Input
              id="monthlyValue"
              type="number"
              step="0.01"
              value={formData.monthlyValue}
              onChange={(e) => setFormData({ ...formData, monthlyValue: parseFloat(e.target.value) || 0 })}
              className="bg-secondary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalhes sobre esta despesa..."
              className="bg-secondary/50 resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {expense ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
