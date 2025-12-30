import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RawMaterial, Product, PricingConfig } from '@/types/pricing';

interface PricingState {
  rawMaterials: RawMaterial[];
  products: Product[];
  config: PricingConfig;
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'pricePerMeasure'>) => void;
  updateRawMaterial: (id: string, material: Partial<RawMaterial>) => void;
  deleteRawMaterial: (id: string) => void;
  addProduct: (product: Omit<Product, 'id' | 'totalVariableCost' | 'suggestedPrice'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateConfig: (config: Partial<PricingConfig>) => void;
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
  taxes: number
): number => {
  const totalPercentage = (profitMargin + fixedExpensesRate + taxes) / 100;
  return totalVariableCost / (1 - totalPercentage);
};

export const usePricingStore = create<PricingState>()(
  persist(
    (set, get) => ({
      rawMaterials: [
        {
          id: '1',
          code: 1,
          name: 'Soja',
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
          suggestedPrice: 156.19,
          finalPrice: 160.00,
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
          suggestedPrice: 99.25,
          finalPrice: 100.00,
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
          suggestedPrice: 129.83,
          finalPrice: 130.00,
        },
      ],
      config: {
        defaultProfitMargin: 15,
        defaultFixedExpensesRate: 10,
        defaultTaxes: 8.5,
      },
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
      addProduct: (product) => set((state) => {
        const totalVariableCost = calculateTotalVariableCost(product.ingredients, product.laborCost, state.rawMaterials);
        const suggestedPrice = calculateSuggestedPrice(
          totalVariableCost,
          product.profitMargin,
          product.fixedExpensesRate,
          product.taxes
        );
        const newProduct: Product = {
          ...product,
          id: crypto.randomUUID(),
          totalVariableCost,
          suggestedPrice,
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
          if (updates.profitMargin !== undefined || updates.fixedExpensesRate !== undefined || updates.taxes !== undefined) {
            updated.suggestedPrice = calculateSuggestedPrice(
              updated.totalVariableCost,
              updated.profitMargin,
              updated.fixedExpensesRate,
              updated.taxes
            );
          }
          return updated;
        }),
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      })),
      updateConfig: (config) => set((state) => ({
        config: { ...state.config, ...config },
      })),
    }),
    {
      name: 'pricing-storage',
    }
  )
);
