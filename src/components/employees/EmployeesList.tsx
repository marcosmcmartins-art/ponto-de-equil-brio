import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Edit2, Trash2, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingStore } from "@/store/pricingStore";
import { EmployeeForm } from "./EmployeeForm";
import type { Employee } from "@/types/pricing";

const contractTypeLabels = {
  clt: 'CLT',
  pj: 'PJ',
  freelancer: 'Freelancer',
};

export const EmployeesList = () => {
  const { employees, deleteEmployee, getTotalEmployeeCost, config } = usePricingStore();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

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
            Funcionários
          </h2>
          <p className="text-muted-foreground">
            Cadastro de funcionários com cálculo de encargos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Funcionário
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Funcionários</p>
              <p className="text-2xl font-bold text-foreground">{employees.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Custo Total/Mês</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(getTotalEmployeeCost())}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Encargos CLT</p>
              <p className="text-lg font-bold text-warning">
                {config.laborChargesRate}% + {config.socialChargesRate}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Employees Table */}
      {employees.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 text-left">
                  <th className="p-4 font-medium text-muted-foreground">Funcionário</th>
                  <th className="p-4 font-medium text-muted-foreground">Setor/Cargo</th>
                  <th className="p-4 font-medium text-muted-foreground">Tipo</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Salário Base</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Encargos Trab.</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Encargos Soc.</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Custo Total</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Valor/Hora</th>
                  <th className="p-4 font-medium text-muted-foreground text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => (
                  <motion.tr
                    key={employee.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="border-t border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{employee.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {employee.department} / {employee.position}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.contractType === 'clt' 
                          ? 'bg-success/10 text-success' 
                          : employee.contractType === 'pj'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {contractTypeLabels[employee.contractType]}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-foreground">
                      {formatCurrency(employee.baseSalary)}
                    </td>
                    <td className="p-4 text-right text-warning">
                      {formatCurrency(employee.laborCharges)}
                    </td>
                    <td className="p-4 text-right text-destructive">
                      {formatCurrency(employee.socialCharges)}
                    </td>
                    <td className="p-4 text-right font-semibold text-success">
                      {formatCurrency(employee.totalCost)}
                    </td>
                    <td className="p-4 text-right text-primary">
                      {formatCurrency(employee.hourlyRate)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(employee)}
                          className="h-8 w-8 hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEmployee(employee.id)}
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
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum funcionário cadastrado</p>
          <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
            Adicionar primeiro funcionário
          </Button>
        </motion.div>
      )}

      {/* Form Modal */}
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};
