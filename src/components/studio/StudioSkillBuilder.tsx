import { useState, useCallback, useEffect } from "react";
import {
  Bot, Layout, Code, ChevronRight, ChevronLeft, X,
  Plus, Trash2, ArrowUp, ArrowDown, Sparkles,
  Clock, Zap, Globe, Save, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import IntegrationPicker, { type Integration } from "./IntegrationPicker";

type SkillMode = "ai" | "visual" | "advanced";
type NodeType = "trigger" | "action" | "condition" | "integration";

interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, any>;
  icon: string;
}

interface SkillWorkflow {
  name: string;
  description: string;
  category: string;
  triggerType: string;
  triggerConfig: Record<string, any>;
  nodes: WorkflowNode[];
  integrations: Integration[];
  aiModel: string;
  aiPrompt: string;
  status: "draft" | "active" | "paused";
}

const CATEGORIES = [
  { id: "marketing", label: "Маркетинг", icon: "📈" },
  { id: "dev", label: "Разработка", icon: "" },
  { id: "data", label: "Данные", icon: "📊" },
  { id: "content", label: "Контент", icon: "✍️" },
  { id: "automation", label: "Автоматизация", icon: "⚙️" },
];

const TRIGGERS = [
  { id: "manual", label: "Ручной запуск", icon: Zap, desc: "Запуск по кнопке из интерфейса" },
  { id: "schedule", label: "По расписанию", icon: Clock, desc: "Cron-выражение или визуальный таймер" },
  { id: "webhook", label: "Webhook", icon: Globe, desc: "Внешний HTTP-запрос с авторизацией" },
  { id: "event", label: "Событие", icon: MessageSquare, desc: "Новое сообщение, файл или изменение" },
];

const NODE_TEMPLATES: Record<NodeType, { label: string; icon: string; config: Record<string, any> }> = {
  trigger: { label: "Триггер", icon: "", config: { source: "", params: {} } },
  action: { label: "Действие", icon: "✨", config: { operation: "", payload: {} } },
  condition: { label: "Условие", icon: "🔀", config: { rule: "if", expression: "" } },
  integration: { label: "Интеграция", icon: "🔗", config: { service: "", method: "POST", headers: {} } },
};

const AI_MODELS = [
  { id: "yandexgpt", label: "YandexGPT Pro" },
  { id: "gigachat", label: "GigaChat Enterprise" },
  { id: "custom", label: "Custom Endpoint" },
];

export default function StudioSkillBuilder({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const { toast } = useToast();
  
  // 🔹 1. ГЕНЕРАЦИЯ/ВОССТАНОВЛЕНИЕ ID
  const [draftSkillId] = useState(() => {
    const restoreId = localStorage.getItem("restore_skill_id");
    if (restoreId) return restoreId;
    const stored = sessionStorage.getItem("current_draft_id");
    if (stored) return stored;
    return `skill_new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  useEffect(() => {
    sessionStorage.setItem("current_draft_id", draftSkillId);
  }, [draftSkillId]);
  
  const [mode, setMode] = useState<SkillMode>("ai");
  const [aiStep, setAiStep] = useState(1);
  const [workflow, setWorkflow] = useState<SkillWorkflow>({
    name: "",
    description: "",
    category: "",
    triggerType: "",
    triggerConfig: {},
    nodes: [],
    integrations: [],
    aiModel: "yandexgpt",
    aiPrompt: "",
    status: "draft",
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🔹 2. АВТОСОХРАНЕНИЕ ЧЕРНОВИКА (при любом изменении workflow, aiStep, mode)
  useEffect(() => {
    const draftData = {
      id: draftSkillId,
      ...workflow,
      meta: { aiStep, mode, timestamp: Date.now() }
    };
    localStorage.setItem(`draft_${draftSkillId}`, JSON.stringify(draftData));
  }, [workflow, aiStep, mode, draftSkillId]);

  // 🔹 3. ВОССТАНОВЛЕНИЕ СОСТОЯНИЯ ПРИ ВОЗВРАТЕ ИЗ МЕНЕДЖЕРА
  useEffect(() => {
    const restoreId = localStorage.getItem("restore_skill_id");
    const contextStr = localStorage.getItem("restore_skill_context");
    
    if (restoreId === draftSkillId && contextStr) {
      console.log("♻️ Восстановление конструктора для:", draftSkillId);
      
      try {
        // Пытаемся загрузить автосохранённый черновик
        const savedDraft = localStorage.getItem(`draft_${draftSkillId}`);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          console.log("✅ Восстановлен черновик, шаг:", parsed.meta?.aiStep);
          
          // Восстанавливаем workflow, шаг и режим
          setWorkflow({
            name: parsed.name || "",
            description: parsed.description || "",
            category: parsed.category || "",
            triggerType: parsed.triggerType || "",
            triggerConfig: parsed.triggerConfig || {},
            nodes: parsed.nodes || [],
            integrations: parsed.integrations || [],
            aiModel: parsed.aiModel || "yandexgpt",
            aiPrompt: parsed.aiPrompt || "",
            status: parsed.status || "draft",
          });
          
          if (parsed.meta?.aiStep) {
            setAiStep(parsed.meta.aiStep);
            console.log("✅ Восстановлен шаг:", parsed.meta.aiStep);
          }
          if (parsed.meta?.mode) {
            setMode(parsed.meta.mode);
            console.log("✅ Восстановлен режим:", parsed.meta.mode);
          }
        }
        
        // Подтягиваем интеграции из основного хранилища (на случай если они обновились в Менеджере)
        const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
        const skillFromStore = skills.find((s: any) => s.id === draftSkillId);
        if (skillFromStore?.integrations) {
          setWorkflow(prev => ({
            ...prev,
            integrations: skillFromStore.integrations
          }));
          console.log("✅ Подтянуты интеграции из хранилища:", skillFromStore.integrations.length);
        }
        
        // Очищаем флаги после успешного восстановления
        localStorage.removeItem("restore_skill_id");
        localStorage.removeItem("restore_skill_context");
      } catch (e) {
        console.error("❌ Ошибка восстановления черновика:", e);
      }
    }
  }, []);

  // 🔹 4. СИНХРОНИЗАЦИЯ ИНТЕГРАЦИЙ (дополнительная страховка)
  useEffect(() => {
    const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
    const draft = skills.find((s: any) => s.id === draftSkillId);
    if (draft && draft.integrations) {
      setWorkflow(prev => ({
        ...prev,
        integrations: draft.integrations
      }));
    }
  }, [draftSkillId]);

  const updateWorkflow = useCallback(
    (updates: Partial<SkillWorkflow>) => setWorkflow((prev) => ({ ...prev, ...updates })),
    []
  );

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!workflow.name.trim()) newErrors.name = "Укажите название скила";
    if (workflow.nodes.length === 0) newErrors.nodes = "Добавьте хотя бы один шаг";
    if (!workflow.triggerType) newErrors.trigger = "Выберите тип запуска";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [workflow]);

  const handleSave = () => {
    if (!validate()) {
      toast({ title: "⚠️ Ошибка валидации", description: "Заполните обязательные поля", variant: "destructive" });
      return;
    }
    const payload = {
      id: draftSkillId,
      ...workflow,
      createdAt: Date.now(),
      runCount: 0,
      lastRun: null,
    };
    onSave(payload);
    // Очищаем временные данные
    sessionStorage.removeItem("current_draft_id");
    localStorage.removeItem(`draft_${draftSkillId}`);
    toast({ title: "✅ Скил сохранён", description: "Добавлен в вашу библиотеку" });
    onClose();
  };

  const handleAiNext = () => {
    if (aiStep === 1 && !workflow.category) {
      setErrors({ category: "Выберите категорию" });
      return;
    }
    if (aiStep === 2 && !workflow.triggerType) {
      setErrors({ trigger: "Выберите триггер" });
      return;
    }
    setErrors({});
    
    // 🔹 ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ СЛЕДУЮЩЕГО ШАГА
    if (aiStep < 6) {
      const newStep = aiStep + 1;
      const draftData = {
        id: draftSkillId,
        ...workflow,
        meta: { aiStep: newStep, mode, timestamp: Date.now() }
      };
      localStorage.setItem(`draft_${draftSkillId}`, JSON.stringify(draftData));
      console.log("💾 Сохранён шаг:", newStep);
      setAiStep(newStep);
    } else {
      handleSave();
    }
  };

  const addNode = (type: NodeType) => {
    const tpl = NODE_TEMPLATES[type];
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type,
      label: tpl.label,
      config: { ...tpl.config },
      icon: tpl.icon,
    };
    updateWorkflow({ nodes: [...workflow.nodes, newNode] });
    setSelectedNodeId(newNode.id);
  };

  const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
    updateWorkflow({
      nodes: workflow.nodes.map((n) => (n.id === nodeId ? { ...n, config } : n)),
    });
  };

  const moveNode = (index: number, dir: -1 | 1) => {
    const newNodes = [...workflow.nodes];
    const target = index + dir;
    if (target < 0 || target >= newNodes.length) return;
    [newNodes[index], newNodes[target]] = [newNodes[target], newNodes[index]];
    updateWorkflow({ nodes: newNodes });
  };

  const removeNode = (id: string) => {
    updateWorkflow({ nodes: workflow.nodes.filter((n) => n.id !== id) });
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const selectedNode = workflow.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Конструктор скилов
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Создавайте автоматизации любой сложности</p>
          </div>
          <div className="flex gap-2">
            {(["ai", "visual", "advanced"] as SkillMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                  mode === m ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border border-border hover:bg-muted"
                }`}
              >
                {m === "ai" && <Bot className="h-3.5 w-3.5" />}
                {m === "visual" && <Layout className="h-3.5 w-3.5" />}
                {m === "advanced" && <Code className="h-3.5 w-3.5" />}
                {m === "ai" ? "AI Помощник" : m === "visual" ? "Визуальный" : "JSON / Код"}
              </button>
            ))}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors ml-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {mode === "ai" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Шаг {aiStep} из 6</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <div key={s} className={`h-1.5 w-8 rounded-full ${s <= aiStep ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
              </div>

              {aiStep === 1 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">1. Категория и цель</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => updateWorkflow({ category: cat.id })}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          workflow.category === cat.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{cat.icon}</span>
                        <span className="font-medium text-sm">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>
              )}

              {aiStep === 2 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">2. Триггер запуска</h4>
                  <div className="grid gap-3">
                    {TRIGGERS.map((trig) => (
                      <button
                        key={trig.id}
                        onClick={() => updateWorkflow({ triggerType: trig.id })}
                        className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                          workflow.triggerType === trig.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                        }`}
                      >
                        <div className={`p-3 rounded-lg ${workflow.triggerType === trig.id ? "bg-primary text-white" : "bg-muted"}`}>
                          <trig.icon className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium block">{trig.label}</span>
                          <span className="text-xs text-muted-foreground">{trig.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.trigger && <p className="text-xs text-destructive">{errors.trigger}</p>}
                </div>
              )}

              {aiStep === 3 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">3. Цепочка действий</h4>
                  <div className="space-y-2">
                    {workflow.nodes.map((node, i) => (
                      <div key={node.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                        <span className="text-lg">{node.icon}</span>
                        <span className="font-medium flex-1">{node.label}</span>
                        <button onClick={() => removeNode(node.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {workflow.nodes.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">Добавьте шаги ниже</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(NODE_TEMPLATES) as NodeType[]).map((type) => (
                      <Button key={type} variant="outline" size="sm" onClick={() => addNode(type)}>
                        <Plus className="h-4 w-4 mr-2" /> {NODE_TEMPLATES[type].label}
                      </Button>
                    ))}
                  </div>
                  {errors.nodes && <p className="text-xs text-destructive">{errors.nodes}</p>}
                </div>
              )}

              {aiStep === 4 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">4. Интеграции</h4>
                  <IntegrationPicker
                    skillId={draftSkillId}
                    source="builder"
                    selectedIntegrations={workflow.integrations}
                    onChange={(integrations) => updateWorkflow({ integrations })}
                  />
                </div>
              )}

              {aiStep === 5 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">5. AI Настройки</h4>
                  <div className="space-y-3">
                    <Label>Модель</Label>
                    <select
                      className="w-full p-2 rounded-lg border border-border bg-background"
                      value={workflow.aiModel}
                      onChange={(e) => updateWorkflow({ aiModel: e.target.value })}
                    >
                      {AI_MODELS.map((m) => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                    <Label>Системный промт</Label>
                    <Textarea
                      value={workflow.aiPrompt}
                      onChange={(e) => updateWorkflow({ aiPrompt: e.target.value })}
                      placeholder="Опишите логику обработки данных..."
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              )}

              {aiStep === 6 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">6. Итог и сохранение</h4>
                  <Card className="bg-muted/30">
                    <CardContent className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between items-center"><span className="text-muted-foreground">Название</span> <Input className="h-8 w-40 text-right" value={workflow.name} onChange={e => updateWorkflow({ name: e.target.value })} /></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Категория</span> <span>{CATEGORIES.find(c=>c.id===workflow.category)?.label || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Триггер</span> <span>{TRIGGERS.find(t=>t.id===workflow.triggerType)?.label || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Шагов</span> <span>{workflow.nodes.length}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Интеграций</span> <span>{workflow.integrations.length}</span></div>
                    </CardContent>
                  </Card>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
              )}
            </div>
          )}

          {mode === "visual" && (
            <div className="flex h-full gap-6">
              <div className="w-1/3 space-y-4">
                <h4 className="font-semibold">Палитра блоков</h4>
                <div className="grid gap-2">
                  {(Object.keys(NODE_TEMPLATES) as NodeType[]).map((type) => (
                    <Button key={type} variant="outline" className="justify-start" onClick={() => addNode(type)}>
                      <span className="mr-2">{NODE_TEMPLATES[type].icon}</span> {NODE_TEMPLATES[type].label}
                    </Button>
                  ))}
                </div>
                {selectedNode && (
                  <Card>
                    <CardHeader className="p-3 pb-0"><CardTitle className="text-sm">Настройки: {selectedNode.label}</CardTitle></CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <Input placeholder="Название шага" value={selectedNode.label} onChange={e => updateNodeConfig(selectedNode.id, { ...selectedNode.config, label: e.target.value })} />
                      <Textarea placeholder="Конфигурация (JSON)" className="min-h-[80px] text-xs font-mono" value={JSON.stringify(selectedNode.config, null, 2)} onChange={e => { try { updateNodeConfig(selectedNode.id, JSON.parse(e.target.value)); } catch {} }} />
                    </CardContent>
                  </Card>
                )}
              </div>
              <div className="flex-1 bg-card border border-border rounded-xl p-6 relative overflow-y-auto">
                {workflow.nodes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Layout className="h-12 w-12 mb-3 opacity-30" />
                    <p>Перетащите блоки или используйте палитру</p>
                  </div>
                ) : (
                  <div className="space-y-0 max-w-lg mx-auto">
                    {workflow.nodes.map((node, i) => (
                      <div key={node.id} className="relative group">
                        <div
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedNodeId === node.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 bg-background"
                          }`}
                          onClick={() => setSelectedNodeId(node.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{node.icon}</span>
                              <div>
                                <p className="font-medium">{node.label}</p>
                                <p className="text-xs text-muted-foreground uppercase">{node.type}</p>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveNode(i, -1); }} disabled={i === 0}><ArrowUp className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); moveNode(i, 1); }} disabled={i === workflow.nodes.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                        </div>
                        {i < workflow.nodes.length - 1 && (
                          <div className="w-0.5 h-6 bg-border mx-auto my-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "advanced" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <h4 className="font-semibold text-lg">Редактор конфигурации</h4>
              <div className="relative">
                <Textarea
                  className="min-h-[400px] font-mono text-sm bg-background"
                  value={JSON.stringify({ name: workflow.name, trigger: workflow.triggerType, nodes: workflow.nodes, integrations: workflow.integrations, ai: { model: workflow.aiModel, prompt: workflow.aiPrompt } }, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateWorkflow({
                        name: parsed.name || "",
                        triggerType: parsed.trigger || "",
                        nodes: parsed.nodes || [],
                        integrations: parsed.integrations || [],
                        aiModel: parsed.ai?.model || "yandexgpt",
                        aiPrompt: parsed.ai?.prompt || "",
                      });
                      setErrors({});
                    } catch {
                      setErrors({ json: "Невалидный JSON" });
                    }
                  }}
                />
                {errors.json && <p className="absolute bottom-2 right-2 text-xs text-destructive bg-background px-2 py-1 rounded">{errors.json}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  const formatted = JSON.stringify({ name: workflow.name, trigger: workflow.triggerType, nodes: workflow.nodes, integrations: workflow.integrations, ai: { model: workflow.aiModel, prompt: workflow.aiPrompt } }, null, 2);
                  navigator.clipboard.writeText(formatted);
                  toast({ title: "📋 Скопировано" });
                }}>Копировать JSON</Button>
                <Button variant="outline" size="sm" onClick={() => setWorkflow({ ...workflow, nodes: [], integrations: [], triggerType: "", aiPrompt: "", name: "" })}>Очистить</Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border bg-muted/30 flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <div className="flex gap-2">
            {mode === "ai" && aiStep > 1 && (
              <Button variant="outline" onClick={() => setAiStep((s) => s - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Назад
              </Button>
            )}
            {mode === "ai" ? (
              <Button onClick={handleAiNext} className="gradient-primary text-primary-foreground">
                {aiStep === 6 ? "Сохранить скил" : "Далее"} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSave} className="gradient-primary text-primary-foreground">
                <Save className="h-4 w-4 mr-2" /> Сохранить
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}