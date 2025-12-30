import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePricingStore } from "@/store/pricingStore";
import type { SavedScenario, ScenarioTotals } from "@/types/pricing";
import {
  Save,
  FolderOpen,
  Copy,
  Trash2,
  Edit3,
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface ScenarioManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentForecasts: {
    productForecasts: Record<string, number>;
    resaleForecasts: Record<string, number>;
  };
  currentTotals: ScenarioTotals;
  onLoadScenario: (scenario: SavedScenario) => void;
  activeScenarioId?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const ScenarioManager = ({
  isOpen,
  onClose,
  currentForecasts,
  currentTotals,
  onLoadScenario,
  activeScenarioId,
}: ScenarioManagerProps) => {
  const { savedScenarios, saveScenario, updateScenario, deleteScenario, duplicateScenario } =
    usePricingStore();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<SavedScenario | null>(null);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");

  const handleSave = () => {
    if (!scenarioName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o cenário.",
        variant: "destructive",
      });
      return;
    }

    saveScenario(
      scenarioName.trim(),
      scenarioDescription.trim() || undefined,
      currentForecasts.productForecasts,
      currentForecasts.resaleForecasts,
      currentTotals
    );

    toast({
      title: "Cenário salvo",
      description: `"${scenarioName}" foi salvo com sucesso.`,
    });

    setScenarioName("");
    setScenarioDescription("");
    setSaveDialogOpen(false);
  };

  const handleEdit = () => {
    if (!selectedScenario || !scenarioName.trim()) return;

    updateScenario(selectedScenario.id, {
      name: scenarioName.trim(),
      description: scenarioDescription.trim() || undefined,
    });

    toast({
      title: "Cenário atualizado",
      description: `"${scenarioName}" foi atualizado.`,
    });

    setEditDialogOpen(false);
    setSelectedScenario(null);
    setScenarioName("");
    setScenarioDescription("");
  };

  const handleDelete = () => {
    if (!selectedScenario) return;

    deleteScenario(selectedScenario.id);

    toast({
      title: "Cenário excluído",
      description: `"${selectedScenario.name}" foi removido.`,
    });

    setDeleteDialogOpen(false);
    setSelectedScenario(null);
  };

  const handleDuplicate = (scenario: SavedScenario) => {
    const newName = `${scenario.name} (Cópia)`;
    duplicateScenario(scenario.id, newName);

    toast({
      title: "Cenário duplicado",
      description: `"${newName}" foi criado.`,
    });
  };

  const handleLoad = (scenario: SavedScenario) => {
    onLoadScenario(scenario);
    toast({
      title: "Cenário carregado",
      description: `"${scenario.name}" foi carregado na simulação.`,
    });
    onClose();
  };

  const openEditDialog = (scenario: SavedScenario) => {
    setSelectedScenario(scenario);
    setScenarioName(scenario.name);
    setScenarioDescription(scenario.description || "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (scenario: SavedScenario) => {
    setSelectedScenario(scenario);
    setDeleteDialogOpen(true);
  };

  const openSaveDialog = () => {
    setScenarioName("");
    setScenarioDescription("");
    setSaveDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              Gerenciar Cenários
            </DialogTitle>
            <DialogDescription>
              Salve, carregue e compare diferentes cenários de simulação de vendas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Save Current Button */}
            <Button onClick={openSaveDialog} className="w-full gap-2">
              <Save className="w-4 h-4" />
              Salvar Cenário Atual
            </Button>

            {/* Saved Scenarios List */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Cenários Salvos ({savedScenarios.length})
              </h3>
              <ScrollArea className="h-[400px] pr-4">
                {savedScenarios.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum cenário salvo ainda.</p>
                    <p className="text-sm">Salve o cenário atual para começar.</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {savedScenarios
                      .slice()
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .map((scenario) => (
                        <motion.div
                          key={scenario.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          layout
                        >
                          <Card
                            className={`mb-3 transition-all hover:border-primary/50 ${
                              activeScenarioId === scenario.id ? "border-primary bg-primary/5" : ""
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold truncate">{scenario.name}</h4>
                                    {activeScenarioId === scenario.id && (
                                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                        Ativo
                                      </span>
                                    )}
                                  </div>
                                  {scenario.description && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                      {scenario.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {format(new Date(scenario.updatedAt), "dd MMM yyyy 'às' HH:mm", {
                                        locale: ptBR,
                                      })}
                                    </span>
                                  </div>

                                  {/* Metrics */}
                                  <div className="grid grid-cols-3 gap-3 mt-3">
                                    <div className="flex items-center gap-1.5">
                                      <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                                      <span className="text-xs">
                                        <span className="text-muted-foreground">Faturamento:</span>{" "}
                                        <span className="font-medium">
                                          {formatCurrency(scenario.totals.revenue)}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                                      <span className="text-xs">
                                        <span className="text-muted-foreground">M.C.:</span>{" "}
                                        <span className="font-medium text-primary">
                                          {formatCurrency(scenario.totals.contributionMargin)}
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <TrendingUp
                                        className={`w-3.5 h-3.5 ${
                                          scenario.totals.profit >= 0 ? "text-green-600" : "text-destructive"
                                        }`}
                                      />
                                      <span className="text-xs">
                                        <span className="text-muted-foreground">Lucro:</span>{" "}
                                        <span
                                          className={`font-medium ${
                                            scenario.totals.profit >= 0 ? "text-green-600" : "text-destructive"
                                          }`}
                                        >
                                          {formatCurrency(scenario.totals.profit)}
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-1">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="gap-1.5"
                                    onClick={() => handleLoad(scenario)}
                                  >
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    Carregar
                                  </Button>
                                  <div className="flex gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => handleDuplicate(scenario)}
                                      title="Duplicar"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() => openEditDialog(scenario)}
                                      title="Editar"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => openDeleteDialog(scenario)}
                                      title="Excluir"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-primary" />
              Salvar Cenário
            </DialogTitle>
            <DialogDescription>
              Dê um nome para identificar este cenário de simulação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scenario-name">Nome do Cenário *</Label>
              <Input
                id="scenario-name"
                placeholder="Ex: Projeção Janeiro 2025"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scenario-description">Descrição (opcional)</Label>
              <Textarea
                id="scenario-description"
                placeholder="Ex: Cenário otimista com aumento de 20% nas vendas"
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Preview */}
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <h4 className="text-sm font-medium">Resumo da Simulação Atual:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Faturamento:</span>{" "}
                  <span className="font-medium">{formatCurrency(currentTotals.revenue)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lucro:</span>{" "}
                  <span
                    className={`font-medium ${
                      currentTotals.profit >= 0 ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(currentTotals.profit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Cenário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Editar Cenário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Cenário *</Label>
              <Input
                id="edit-name"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea
                id="edit-description"
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cenário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{selectedScenario?.name}"? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
