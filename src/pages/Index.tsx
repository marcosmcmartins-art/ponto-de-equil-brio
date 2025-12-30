import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { RawMaterialsList } from "@/components/materials/RawMaterialsList";
import { ProductsList } from "@/components/products/ProductsList";
import { PricingCalculator } from "@/components/calculator/PricingCalculator";

type View = 'dashboard' | 'materials' | 'products' | 'calculator';

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
      case 'calculator':
        return <PricingCalculator />;
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
