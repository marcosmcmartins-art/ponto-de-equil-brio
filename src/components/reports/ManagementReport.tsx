import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BreakEvenAnalysis } from "./BreakEvenAnalysis";
import { IncomeStatement } from "./IncomeStatement";
import { Target, FileText } from "lucide-react";

export const ManagementReport = () => {
  const [desiredProfit, setDesiredProfit] = useState<number>(5000);

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-heading font-bold text-foreground"
      >
        <span className="text-gradient">Relatórios</span> Gerenciais
      </motion.h1>

      <Tabs defaultValue="breakeven" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="breakeven" className="gap-2">
            <Target className="w-4 h-4" />
            Ponto de Equilíbrio
          </TabsTrigger>
          <TabsTrigger value="dre" className="gap-2">
            <FileText className="w-4 h-4" />
            DRE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="breakeven" className="space-y-4">
          {/* Desired Profit Input */}
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-xs">
                  <Label htmlFor="desiredProfit">Lucro Desejado (R$)</Label>
                  <Input
                    id="desiredProfit"
                    type="number"
                    min="0"
                    value={desiredProfit}
                    onChange={(e) => setDesiredProfit(Number(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  Informe o lucro desejado para calcular o Ponto de Equilíbrio Econômico
                </p>
              </div>
            </CardContent>
          </Card>

          <BreakEvenAnalysis desiredProfit={desiredProfit} />
        </TabsContent>

        <TabsContent value="dre">
          <IncomeStatement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
