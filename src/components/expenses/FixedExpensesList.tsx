import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Edit2, Trash2, Zap, Home, Briefcase, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/store/pricingStore";
import { FixedExpenseForm } from "./FixedExpenseForm";
import type { FixedExpense } from "@/types/pricing";

const categoryIcons = {
  salaries: Briefcase,
  rent: Home,
  utilities: Zap,
  administrative: Building2,
  other: MoreHorizontal,
};

const categoryLabels = {
  salaries: 'Salários',
  rent: 'Aluguel',
  utilities: 'Utilidades',
  administrative: 'Administrativo',
  other: 'Outros',
};

export const FixedExpensesList = () => {
  const { fixedExpenses, deleteFixedExpense, getTotalFixedExpenses } = usePricingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleEdit = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const expensesByCategory = fixedExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = [];
    }
    acc[expense.category].push(expense);
    return acc;
  }, {} as Record<string, FixedExpense[]>);

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
            Despesas Fixas
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas despesas fixas mensais
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Despesa
        </Button>
      </motion.div>

      {/* Total Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Despesas Fixas/Mês</p>
            <p className="text-3xl font-heading font-bold text-primary">
              {formatCurrency(getTotalFixedExpenses())}
            </p>
          </div>
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Expenses by Category */}
      <div className="space-y-4">
        {Object.entries(expensesByCategory).map(([category, expenses], categoryIndex) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons] || MoreHorizontal;
          const categoryTotal = expenses.reduce((sum, e) => sum + e.monthlyValue, 0);
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + categoryIndex * 0.1 }}
              className="glass-card rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h3>
                    <p className="text-sm text-muted-foreground">{expenses.length} despesa(s)</p>
                  </div>
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(categoryTotal)}
                </span>
              </div>
              
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div 
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground">{expense.name}</p>
                      {expense.description && (
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        {formatCurrency(expense.monthlyValue)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                          className="h-8 w-8 hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteFixedExpense(expense.id)}
                          className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {fixedExpenses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma despesa fixa cadastrada</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
            Adicionar primeira despesa
          </Button>
        </motion.div>
      )}

      {/* Form Modal */}
      {showForm && (
        <FixedExpenseForm
          expense={editingExpense}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};
