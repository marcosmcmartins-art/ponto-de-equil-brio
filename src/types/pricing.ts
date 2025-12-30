export interface RawMaterial {
  id: string;
  code: number;
  name: string;
  supplier?: string;
  grossWeight: number;
  netWeight: number;
  unit: string;
  pricePerUnit: number;
  correctionFactor: number;
  pricePerMeasure: number;
}

export interface ProductIngredient {
  rawMaterialId: string;
  quantity: number;
  value: number;
}

export interface Product {
  id: string;
  code: number;
  name: string;
  category: 'industry' | 'commerce' | 'service';
  unit: string;
  ingredients: ProductIngredient[];
  laborCost: number;
  totalVariableCost: number;
  profitMargin: number;
  fixedExpensesRate: number;
  taxes: number;
  freight: number;
  cardFee: number;
  appFee: number;
  commission: number;
  suggestedPrice: number;
  finalPrice: number;
  salesForecast: number;
  expectedRevenue: number;
  contributionMargin: number;
  markupMultiplier: number;
  mixPercentage: number;
}

export interface FixedExpense {
  id: string;
  code: number;
  name: string;
  category: 'salaries' | 'rent' | 'utilities' | 'administrative' | 'other';
  monthlyValue: number;
  description?: string;
}

export interface Employee {
  id: string;
  code: number;
  name: string;
  department: string;
  position: string;
  contractType: 'clt' | 'pj' | 'freelancer';
  baseSalary: number;
  transportVoucher: number;
  mealVoucher: number;
  healthInsurance: number;
  laborCharges: number; // 21.77%
  socialCharges: number; // 32%
  totalCost: number;
  hourlyRate: number;
  workHoursPerMonth: number;
}

export interface ResaleProduct {
  id: string;
  code: number;
  name: string;
  supplier: string;
  packageQuantity: number;
  unit: string;
  purchasePrice: number;
  pricePerUnit: number;
  profitMargin: number;
  taxes: number;
  freight: number;
  cardFee: number;
  appFee: number;
  commission: number;
  suggestedPrice: number;
  finalPrice: number;
  salesForecast: number;
}

export interface PricingConfig {
  defaultProfitMargin: number;
  defaultFixedExpensesRate: number;
  defaultTaxes: number;
  defaultCardFee: number;
  defaultAppFee: number;
  defaultCommission: number;
  laborChargesRate: number; // 21.77%
  socialChargesRate: number; // 32%
}

export interface ScenarioTotals {
  revenue: number;
  variableCosts: number;
  contributionMargin: number;
  fixedExpenses: number;
  profit: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  productForecasts: Record<string, number>;
  resaleForecasts: Record<string, number>;
  totals: ScenarioTotals;
}
