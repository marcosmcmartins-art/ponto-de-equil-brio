import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { RawMaterialsList } from "@/components/materials/RawMaterialsList";
import { ProductsList } from "@/components/products/ProductsList";
import { ProductDataSheet } from "@/components/products/ProductDataSheet";
import { PricingCalculator } from "@/components/calculator/PricingCalculator";
import { FixedExpensesList } from "@/components/expenses/FixedExpensesList";
import { EmployeesList } from "@/components/employees/EmployeesList";
import { ResaleProductsList } from "@/components/commerce/ResaleProductsList";
import { PricingTable } from "@/components/pricing/PricingTable";
import { ScenarioSimulation } from "@/components/simulation/ScenarioSimulation";
import { ManagementReport } from "@/components/reports/ManagementReport";

type View = 'dashboard' | 'materials' | 'products' | 'calculator' | 'expenses' | 'employees' | 'resale' | 'pricing' | 'datasheet' | 'simulation' | 'reports';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview onNavigate={handleNavigate} />;
      case 'materials':
        return <RawMaterialsList />;
      case 'products':
        return <ProductsList />;
      case 'datasheet':
        return <ProductDataSheet />;
      case 'calculator':
        return <PricingCalculator />;
      case 'expenses':
        return <FixedExpensesList />;
      case 'employees':
        return <EmployeesList />;
      case 'resale':
        return <ResaleProductsList />;
      case 'pricing':
        return <PricingTable />;
      case 'simulation':
        return <ScenarioSimulation />;
      case 'reports':
        return <ManagementReport />;
      default:
        return <DashboardOverview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main 
        className={cn(
          "transition-all duration-300 min-h-screen p-6 md:p-8",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
