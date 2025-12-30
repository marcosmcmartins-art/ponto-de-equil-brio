export interface RawMaterial {
  id: string;
  code: number;
  name: string;
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
  suggestedPrice: number;
  finalPrice: number;
}

export interface PricingConfig {
  defaultProfitMargin: number;
  defaultFixedExpensesRate: number;
  defaultTaxes: number;
}
