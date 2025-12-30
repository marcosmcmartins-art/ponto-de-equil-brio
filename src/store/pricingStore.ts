import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RawMaterial, Product, FixedExpense, Employee, ResaleProduct, PricingConfig, SavedScenario, ScenarioTotals } from '@/types/pricing';

interface PricingState {
  rawMaterials: RawMaterial[];
  products: Product[];
  fixedExpenses: FixedExpense[];
  employees: Employee[];
  resaleProducts: ResaleProduct[];
  config: PricingConfig;
  savedScenarios: SavedScenario[];
  
  // Raw Materials
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'pricePerMeasure'>) => void;
  updateRawMaterial: (id: string, material: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => void;
  
  // Products
  addProduct: (product: Omit<Product, 'id' | 'totalVariableCost' | 'suggestedPrice' | 'expectedRevenue' | 'contributionMargin' | 'markupMultiplier' | 'mixPercentage'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Fixed Expenses
  addFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  updateFixedExpense: (id: string, expense: Partial<FixedExpense>) => void;
  deleteFixedExpense: (id: string) => void;
  getTotalFixedExpenses: () => number;
  
  // Employees
  addEmployee: (employee: Omit<Employee, 'id' | 'laborCharges' | 'socialCharges' | 'totalCost' | 'hourlyRate'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  getTotalEmployeeCost: () => number;
  
  // Resale Products
  addResaleProduct: (product: Omit<ResaleProduct, 'id' | 'pricePerUnit' | 'suggestedPrice'>) => void;
  updateResaleProduct: (id: string, product: Partial<ResaleProduct>) => void;
  deleteResaleProduct: (id: string) => void;
  
  // Config
  updateConfig: (config: Partial<PricingConfig>) => void;
  
  // Calculations
  getFixedExpenseRateForProduct: (productRevenue: number) => number;
  
  // Scenarios
  saveScenario: (name: string, description: string | undefined, productForecasts: Record<string, number>, resaleForecasts: Record<string, number>, totals: ScenarioTotals) => SavedScenario;
  updateScenario: (id: string, updates: Partial<Omit<SavedScenario, 'id' | 'createdAt'>>) => void;
  deleteScenario: (id: string) => void;
  duplicateScenario: (id: string, newName: string) => SavedScenario | null;
}

const calculatePricePerMeasure = (pricePerUnit: number, correctionFactor: number): number => {
  return pricePerUnit / (correctionFactor / 100);
};

const calculateTotalVariableCost = (ingredients: Product['ingredients'], laborCost: number, rawMaterials: RawMaterial[]): number => {
  const ingredientsCost = ingredients.reduce((sum, ing) => {
    const material = rawMaterials.find(m => m.id === ing.rawMaterialId);
    return sum + (material ? material.pricePerMeasure * ing.quantity : ing.value);
  }, 0);
  return ingredientsCost + laborCost;
};

const calculateSuggestedPrice = (
  totalVariableCost: number,
  profitMargin: number,
  fixedExpensesRate: number,
  taxes: number,
  cardFee: number = 0,
  appFee: number = 0,
  commission: number = 0,
  freight: number = 0
): number => {
  const totalPercentage = (profitMargin + fixedExpensesRate + taxes + cardFee + appFee + commission) / 100;
  const basePrice = totalVariableCost / (1 - totalPercentage);
  return basePrice + freight;
};

const calculateMarkupMultiplier = (suggestedPrice: number, totalVariableCost: number): number => {
  if (totalVariableCost === 0) return 0;
  return suggestedPrice / totalVariableCost;
};

const calculateEmployeeCosts = (
  baseSalary: number,
  transportVoucher: number,
  mealVoucher: number,
  healthInsurance: number,
  contractType: string,
  laborChargesRate: number,
  socialChargesRate: number,
  workHoursPerMonth: number
): { laborCharges: number; socialCharges: number; totalCost: number; hourlyRate: number } => {
  if (contractType === 'pj' || contractType === 'freelancer') {
    return {
      laborCharges: 0,
      socialCharges: 0,
      totalCost: baseSalary,
      hourlyRate: workHoursPerMonth > 0 ? baseSalary / workHoursPerMonth : 0,
    };
  }
  
  const laborCharges = baseSalary * (laborChargesRate / 100);
  const socialCharges = baseSalary * (socialChargesRate / 100);
  const totalCost = baseSalary + laborCharges + socialCharges + transportVoucher + mealVoucher + healthInsurance;
  const hourlyRate = workHoursPerMonth > 0 ? totalCost / workHoursPerMonth : 0;
  
  return { laborCharges, socialCharges, totalCost, hourlyRate };
};

const calculateResalePrice = (
  purchasePrice: number,
  packageQuantity: number,
  profitMargin: number,
  taxes: number,
  freight: number,
  cardFee: number,
  appFee: number,
  commission: number
): { pricePerUnit: number; suggestedPrice: number } => {
  const pricePerUnit = packageQuantity > 0 ? purchasePrice / packageQuantity : purchasePrice;
  const totalPercentage = (profitMargin + taxes + cardFee + appFee + commission) / 100;
  const suggestedPrice = (pricePerUnit + freight) / (1 - totalPercentage);
  return { pricePerUnit, suggestedPrice };
};

export const usePricingStore = create<PricingState>()(
  persist(
    (set, get) => ({
      rawMaterials: [
        {
          id: '1',
          code: 1,
          name: 'Soja',
          supplier: 'Fornecedor A',
          grossWeight: 59,
          netWeight: 59,
          unit: 'KG',
          pricePerUnit: 151.00,
          correctionFactor: 100,
          pricePerMeasure: 2.56,
        },
        {
          id: '2',
          code: 2,
          name: 'Óleo Bruto',
          supplier: 'Fornecedor B',
          grossWeight: 1,
          netWeight: 1,
          unit: 'Litro',
          pricePerUnit: 2.56,
          correctionFactor: 100,
          pricePerMeasure: 2.56,
        },
        {
          id: '3',
          code: 3,
          name: 'Milho',
          supplier: 'Fornecedor A',
          grossWeight: 50,
          netWeight: 50,
          unit: 'KG',
          pricePerUnit: 66.00,
          correctionFactor: 100,
          pricePerMeasure: 1.32,
        },
        {
          id: '4',
          code: 4,
          name: 'Sacaria',
          supplier: 'Fornecedor C',
          grossWeight: 1,
          netWeight: 1,
          unit: 'Unidade',
          pricePerUnit: 1.50,
          correctionFactor: 100,
          pricePerMeasure: 1.50,
        },
        {
          id: '5',
          code: 5,
          name: 'Premix Suíno',
          supplier: 'Fornecedor D',
          grossWeight: 1,
          netWeight: 20,
          unit: 'KG',
          pricePerUnit: 139.80,
          correctionFactor: 5,
          pricePerMeasure: 6.99,
        },
      ],
      products: [
        {
          id: '1',
          code: 1,
          name: 'Farelo de Soja',
          category: 'industry',
          unit: 'KG',
          ingredients: [
            { rawMaterialId: '1', quantity: 40, value: 102.37 },
            { rawMaterialId: '4', quantity: 1, value: 1.50 },
          ],
          laborCost: 0,
          totalVariableCost: 103.87,
          profitMargin: 15,
          fixedExpensesRate: 10,
          taxes: 8.5,
          freight: 0,
          cardFee: 2,
          appFee: 0,
          commission: 3,
          suggestedPrice: 156.19,
          finalPrice: 160.00,
          salesForecast: 100,
          expectedRevenue: 16000,
          contributionMargin: 5613,
          markupMultiplier: 1.54,
          mixPercentage: 40,
        },
        {
          id: '2',
          code: 2,
          name: 'Milho',
          category: 'industry',
          unit: 'Saco 50kg',
          ingredients: [
            { rawMaterialId: '3', quantity: 50, value: 66.00 },
          ],
          laborCost: 0,
          totalVariableCost: 66.00,
          profitMargin: 15,
          fixedExpensesRate: 10,
          taxes: 8.5,
          freight: 0,
          cardFee: 2,
          appFee: 0,
          commission: 3,
          suggestedPrice: 99.25,
          finalPrice: 100.00,
          salesForecast: 150,
          expectedRevenue: 15000,
          contributionMargin: 5100,
          markupMultiplier: 1.52,
          mixPercentage: 35,
        },
        {
          id: '3',
          code: 3,
          name: 'Ração Suína Inicial',
          category: 'industry',
          unit: 'Saco 40kg',
          ingredients: [
            { rawMaterialId: '3', quantity: 27.2, value: 35.90 },
            { rawMaterialId: '1', quantity: 11.2, value: 28.66 },
            { rawMaterialId: '5', quantity: 1.6, value: 11.18 },
            { rawMaterialId: '4', quantity: 1, value: 1.50 },
          ],
          laborCost: 0,
          totalVariableCost: 77.25,
          profitMargin: 20,
          fixedExpensesRate: 12,
          taxes: 8.5,
          freight: 0,
          cardFee: 2,
          appFee: 0,
          commission: 3,
          suggestedPrice: 129.83,
          finalPrice: 130.00,
          salesForecast: 80,
          expectedRevenue: 10400,
          contributionMargin: 4220,
          markupMultiplier: 1.68,
          mixPercentage: 25,
        },
      ],
      fixedExpenses: [
        { id: '1', code: 1, name: 'Salários Administrativos', category: 'salaries', monthlyValue: 8000, description: 'Salários do setor administrativo' },
        { id: '2', code: 2, name: 'Aluguel', category: 'rent', monthlyValue: 3500, description: 'Aluguel do galpão' },
        { id: '3', code: 3, name: 'Energia Elétrica', category: 'utilities', monthlyValue: 1200, description: 'Conta de luz mensal' },
        { id: '4', code: 4, name: 'Água', category: 'utilities', monthlyValue: 350, description: 'Conta de água mensal' },
        { id: '5', code: 5, name: 'Internet/Telefone', category: 'utilities', monthlyValue: 250, description: 'Telecomunicações' },
        { id: '6', code: 6, name: 'Contador', category: 'administrative', monthlyValue: 800, description: 'Honorários contábeis' },
        { id: '7', code: 7, name: 'Seguro', category: 'other', monthlyValue: 450, description: 'Seguro empresarial' },
      ],
      employees: [
        {
          id: '1',
          code: 1,
          name: 'João Silva',
          department: 'Produção',
          position: 'Operador',
          contractType: 'clt',
          baseSalary: 2200,
          transportVoucher: 220,
          mealVoucher: 440,
          healthInsurance: 350,
          laborCharges: 478.94,
          socialCharges: 704,
          totalCost: 4392.94,
          hourlyRate: 20.06,
          workHoursPerMonth: 220,
        },
        {
          id: '2',
          code: 2,
          name: 'Maria Santos',
          department: 'Administrativo',
          position: 'Assistente',
          contractType: 'clt',
          baseSalary: 1800,
          transportVoucher: 180,
          mealVoucher: 360,
          healthInsurance: 350,
          laborCharges: 391.86,
          socialCharges: 576,
          totalCost: 3657.86,
          hourlyRate: 16.63,
          workHoursPerMonth: 220,
        },
      ],
      resaleProducts: [
        {
          id: '1',
          code: 1,
          name: 'Vitamina E',
          supplier: 'Fornecedor X',
          packageQuantity: 50,
          unit: 'Unidade',
          purchasePrice: 150,
          pricePerUnit: 3,
          profitMargin: 30,
          taxes: 8.5,
          freight: 0.5,
          cardFee: 2,
          appFee: 0,
          commission: 5,
          suggestedPrice: 6.42,
          finalPrice: 6.50,
          salesForecast: 200,
        },
      ],
      savedScenarios: [],
      config: {
        defaultProfitMargin: 15,
        defaultFixedExpensesRate: 10,
        defaultTaxes: 8.5,
        defaultCardFee: 2,
        defaultAppFee: 0,
        defaultCommission: 3,
        laborChargesRate: 21.77,
        socialChargesRate: 32,
      },
      
      // Raw Materials
      addRawMaterial: (material) => set((state) => {
        const pricePerMeasure = calculatePricePerMeasure(material.pricePerUnit, material.correctionFactor);
        const newMaterial: RawMaterial = {
          ...material,
          id: crypto.randomUUID(),
          pricePerMeasure,
        };
        return { rawMaterials: [...state.rawMaterials, newMaterial] };
      }),
      updateRawMaterial: (id, updates) => set((state) => ({
        rawMaterials: state.rawMaterials.map((m) => {
          if (m.id !== id) return m;
          const updated = { ...m, ...updates };
          if (updates.pricePerUnit !== undefined || updates.correctionFactor !== undefined) {
            updated.pricePerMeasure = calculatePricePerMeasure(updated.pricePerUnit, updated.correctionFactor);
          }
          return updated;
        }),
      })),
      deleteRawMaterial: (id) => set((state) => ({
        rawMaterials: state.rawMaterials.filter((m) => m.id !== id),
      })),
      
      // Products
      addProduct: (product) => set((state) => {
        const totalVariableCost = calculateTotalVariableCost(product.ingredients, product.laborCost, state.rawMaterials);
        const suggestedPrice = calculateSuggestedPrice(
          totalVariableCost,
          product.profitMargin,
          product.fixedExpensesRate,
          product.taxes,
          product.cardFee,
          product.appFee,
          product.commission,
          product.freight
        );
        const expectedRevenue = product.salesForecast * product.finalPrice;
        const contributionMargin = expectedRevenue - (product.salesForecast * totalVariableCost);
        const markupMultiplier = calculateMarkupMultiplier(suggestedPrice, totalVariableCost);
        
        const newProduct: Product = {
          ...product,
          id: crypto.randomUUID(),
          totalVariableCost,
          suggestedPrice,
          expectedRevenue,
          contributionMargin,
          markupMultiplier,
          mixPercentage: 0,
        };
        return { products: [...state.products, newProduct] };
      }),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p, ...updates };
          if (updates.ingredients || updates.laborCost !== undefined) {
            updated.totalVariableCost = calculateTotalVariableCost(
              updated.ingredients,
              updated.laborCost,
              state.rawMaterials
            );
          }
          if (updates.profitMargin !== undefined || updates.fixedExpensesRate !== undefined || 
              updates.taxes !== undefined || updates.cardFee !== undefined || 
              updates.appFee !== undefined || updates.commission !== undefined || updates.freight !== undefined) {
            updated.suggestedPrice = calculateSuggestedPrice(
              updated.totalVariableCost,
              updated.profitMargin,
              updated.fixedExpensesRate,
              updated.taxes,
              updated.cardFee,
              updated.appFee,
              updated.commission,
              updated.freight
            );
            updated.markupMultiplier = calculateMarkupMultiplier(updated.suggestedPrice, updated.totalVariableCost);
          }
          if (updates.salesForecast !== undefined || updates.finalPrice !== undefined) {
            updated.expectedRevenue = updated.salesForecast * updated.finalPrice;
            updated.contributionMargin = updated.expectedRevenue - (updated.salesForecast * updated.totalVariableCost);
          }
          return updated;
        }),
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),
      
      // Fixed Expenses
      addFixedExpense: (expense) => set((state) => {
        const newExpense: FixedExpense = {
          ...expense,
          id: crypto.randomUUID(),
        };
        return { fixedExpenses: [...state.fixedExpenses, newExpense] };
      }),
      updateFixedExpense: (id, updates) => set((state) => ({
        fixedExpenses: state.fixedExpenses.map((e) => 
          e.id === id ? { ...e, ...updates } : e
        ),
      })),
      deleteFixedExpense: (id) => set((state) => ({
        fixedExpenses: state.fixedExpenses.filter((e) => e.id !== id),
      })),
      getTotalFixedExpenses: () => {
        return get().fixedExpenses.reduce((sum, e) => sum + e.monthlyValue, 0);
      },
      
      // Employees
      addEmployee: (employee) => set((state) => {
        const costs = calculateEmployeeCosts(
          employee.baseSalary,
          employee.transportVoucher,
          employee.mealVoucher,
          employee.healthInsurance,
          employee.contractType,
          state.config.laborChargesRate,
          state.config.socialChargesRate,
          employee.workHoursPerMonth
        );
        const newEmployee: Employee = {
          ...employee,
          id: crypto.randomUUID(),
          ...costs,
        };
        return { employees: [...state.employees, newEmployee] };
      }),
      updateEmployee: (id, updates) => set((state) => ({
        employees: state.employees.map((e) => {
          if (e.id !== id) return e;
          const updated = { ...e, ...updates };
          if (updates.baseSalary !== undefined || updates.transportVoucher !== undefined ||
              updates.mealVoucher !== undefined || updates.healthInsurance !== undefined ||
              updates.contractType !== undefined || updates.workHoursPerMonth !== undefined) {
            const costs = calculateEmployeeCosts(
              updated.baseSalary,
              updated.transportVoucher,
              updated.mealVoucher,
              updated.healthInsurance,
              updated.contractType,
              state.config.laborChargesRate,
              state.config.socialChargesRate,
              updated.workHoursPerMonth
            );
            return { ...updated, ...costs };
          }
          return updated;
        }),
      })),
      deleteEmployee: (id) => set((state) => ({
        employees: state.employees.filter((e) => e.id !== id),
      })),
      getTotalEmployeeCost: () => {
        return get().employees.reduce((sum, e) => sum + e.totalCost, 0);
      },
      
      // Resale Products
      addResaleProduct: (product) => set((state) => {
        const { pricePerUnit, suggestedPrice } = calculateResalePrice(
          product.purchasePrice,
          product.packageQuantity,
          product.profitMargin,
          product.taxes,
          product.freight,
          product.cardFee,
          product.appFee,
          product.commission
        );
        const newProduct: ResaleProduct = {
          ...product,
          id: crypto.randomUUID(),
          pricePerUnit,
          suggestedPrice,
        };
        return { resaleProducts: [...state.resaleProducts, newProduct] };
      }),
      updateResaleProduct: (id, updates) => set((state) => ({
        resaleProducts: state.resaleProducts.map((p) => {
          if (p.id !== id) return p;
          const updated = { ...p, ...updates };
          if (updates.purchasePrice !== undefined || updates.packageQuantity !== undefined ||
              updates.profitMargin !== undefined || updates.taxes !== undefined ||
              updates.freight !== undefined || updates.cardFee !== undefined ||
              updates.appFee !== undefined || updates.commission !== undefined) {
            const { pricePerUnit, suggestedPrice } = calculateResalePrice(
              updated.purchasePrice,
              updated.packageQuantity,
              updated.profitMargin,
              updated.taxes,
              updated.freight,
              updated.cardFee,
              updated.appFee,
              updated.commission
            );
            updated.pricePerUnit = pricePerUnit;
            updated.suggestedPrice = suggestedPrice;
          }
          return updated;
        }),
      })),
      deleteResaleProduct: (id) => set((state) => ({
        resaleProducts: state.resaleProducts.filter((p) => p.id !== id),
      })),
      
      // Config
      updateConfig: (config) => set((state) => ({
        config: { ...state.config, ...config },
      })),
      
      // Calculations
      getFixedExpenseRateForProduct: (productRevenue: number) => {
        const totalRevenue = get().products.reduce((sum, p) => sum + p.expectedRevenue, 0);
        const totalFixed = get().getTotalFixedExpenses() + get().getTotalEmployeeCost();
        if (totalRevenue === 0) return 0;
        return (productRevenue / totalRevenue) * totalFixed;
      },
      
      // Scenarios
      saveScenario: (name, description, productForecasts, resaleForecasts, totals) => {
        const now = new Date().toISOString();
        const newScenario: SavedScenario = {
          id: crypto.randomUUID(),
          name,
          description,
          createdAt: now,
          updatedAt: now,
          productForecasts,
          resaleForecasts,
          totals,
        };
        set((state) => ({
          savedScenarios: [...state.savedScenarios, newScenario],
        }));
        return newScenario;
      },
      updateScenario: (id, updates) => set((state) => ({
        savedScenarios: state.savedScenarios.map((s) =>
          s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
        ),
      })),
      deleteScenario: (id) => set((state) => ({
        savedScenarios: state.savedScenarios.filter((s) => s.id !== id),
      })),
      duplicateScenario: (id, newName) => {
        const original = get().savedScenarios.find((s) => s.id === id);
        if (!original) return null;
        const now = new Date().toISOString();
        const duplicated: SavedScenario = {
          ...original,
          id: crypto.randomUUID(),
          name: newName,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          savedScenarios: [...state.savedScenarios, duplicated],
        }));
        return duplicated;
      },
    }),
    {
      name: 'pricing-storage',
    }
  )
);
