import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePricingStore } from "@/store/pricingStore";
import type { Employee } from "@/types/pricing";

interface EmployeeFormProps {
  employee?: Employee | null;
  onClose: () => void;
}

export const EmployeeForm = ({ employee, onClose }: EmployeeFormProps) => {
  const { employees, addEmployee, updateEmployee, config } = usePricingStore();
  
  const [formData, setFormData] = useState({
    code: employee?.code || employees.length + 1,
    name: employee?.name || '',
    department: employee?.department || '',
    position: employee?.position || '',
    contractType: employee?.contractType || 'clt' as Employee['contractType'],
    baseSalary: employee?.baseSalary || 0,
    transportVoucher: employee?.transportVoucher || 0,
    mealVoucher: employee?.mealVoucher || 0,
    healthInsurance: employee?.healthInsurance || 0,
    workHoursPerMonth: employee?.workHoursPerMonth || 220,
  });

  // Calculate preview values
  const isCLT = formData.contractType === 'clt';
  const laborCharges = isCLT ? formData.baseSalary * (config.laborChargesRate / 100) : 0;
  const socialCharges = isCLT ? formData.baseSalary * (config.socialChargesRate / 100) : 0;
  const benefits = formData.transportVoucher + formData.mealVoucher + formData.healthInsurance;
  const totalCost = isCLT 
    ? formData.baseSalary + laborCharges + socialCharges + benefits
    : formData.baseSalary;
  const hourlyRate = formData.workHoursPerMonth > 0 ? totalCost / formData.workHoursPerMonth : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (employee) {
      updateEmployee(employee.id, formData);
    } else {
      addEmployee(formData);
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
            {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Dados Básicos</h4>
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
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do funcionário"
                  className="bg-secondary/50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Setor</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: Produção"
                  className="bg-secondary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ex: Operador"
                  className="bg-secondary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractType">Tipo Contratação</Label>
                <Select
                  value={formData.contractType}
                  onValueChange={(value) => setFormData({ ...formData, contractType: value as Employee['contractType'] })}
                >
                  <SelectTrigger className="bg-secondary/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clt">CLT</SelectItem>
                    <SelectItem value="pj">PJ</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Salary and Benefits */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Salário e Benefícios</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseSalary">Salário Base (R$)</Label>
                <Input
                  id="baseSalary"
                  type="number"
                  step="0.01"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
                  className="bg-secondary/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workHoursPerMonth">Horas/Mês</Label>
                <Input
                  id="workHoursPerMonth"
                  type="number"
                  value={formData.workHoursPerMonth}
                  onChange={(e) => setFormData({ ...formData, workHoursPerMonth: parseInt(e.target.value) || 0 })}
                  className="bg-secondary/50"
                />
              </div>
            </div>

            {isCLT && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportVoucher">Vale Transporte (R$)</Label>
                  <Input
                    id="transportVoucher"
                    type="number"
                    step="0.01"
                    value={formData.transportVoucher}
                    onChange={(e) => setFormData({ ...formData, transportVoucher: parseFloat(e.target.value) || 0 })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mealVoucher">Vale Refeição (R$)</Label>
                  <Input
                    id="mealVoucher"
                    type="number"
                    step="0.01"
                    value={formData.mealVoucher}
                    onChange={(e) => setFormData({ ...formData, mealVoucher: parseFloat(e.target.value) || 0 })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="healthInsurance">Convênio Médico (R$)</Label>
                  <Input
                    id="healthInsurance"
                    type="number"
                    step="0.01"
                    value={formData.healthInsurance}
                    onChange={(e) => setFormData({ ...formData, healthInsurance: parseFloat(e.target.value) || 0 })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cost Preview */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground mb-3">Prévia de Custos</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salário Base:</span>
                <span className="font-medium">{formatCurrency(formData.baseSalary)}</span>
              </div>
              {isCLT && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Encargos Trab. ({config.laborChargesRate}%):</span>
                    <span className="font-medium text-warning">{formatCurrency(laborCharges)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Encargos Soc. ({config.socialChargesRate}%):</span>
                    <span className="font-medium text-destructive">{formatCurrency(socialCharges)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Benefícios:</span>
                    <span className="font-medium">{formatCurrency(benefits)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between col-span-2 pt-2 border-t border-border">
                <span className="font-medium text-foreground">Custo Total:</span>
                <span className="font-bold text-success">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="font-medium text-foreground">Valor/Hora:</span>
                <span className="font-bold text-primary">{formatCurrency(hourlyRate)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {employee ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
