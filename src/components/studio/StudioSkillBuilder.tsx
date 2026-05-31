import { useState } from "react";
import { 
  Check, ChevronRight, ChevronLeft, X, Sparkles, Zap, Clock, 
  MessageSquare, FileText, Send, Save, Download, Copy 
} from "lucide-react";

type Step = "goal" | "trigger" | "action" | "integration" | "ai" | "result";

interface SkillData {
  category: string;
  description: string;
  triggerType: "manual" | "schedule" | "webhook" | "event";
  actionType: "text" | "analysis" | "file" | "notification";
  integration: string;
  aiStatus: "idle" | "generating" | "done" | "error";
  generatedConfig?: any;
}

const CATEGORIES = [
  { id: "marketing", label: "Маркетинг", icon: "📈" },
  { id: "dev", label: "Разработка", icon: "💻" },
  { id: "data", label: "Данные", icon: "📊" },
  { id: "content", label: "Контент", icon: "✍️" },
];

const TRIGGERS = [
  { id: "manual", label: "Ручной запуск", icon: <Zap className="h-5 w-5" />, desc: "Запуск по кнопке" },
  { id: "schedule", label: "По расписанию", icon: <Clock className="h-5 w-5" />, desc: "Cron или таймер" },
  { id: "webhook", label: "Webhook", icon: <Send className="h-5 w-5" />, desc: "Внешний запрос" },
  { id: "event", label: "Событие", icon: <MessageSquare className="h-5 w-5" />, desc: "Новое сообщение/файл" },
];

const ACTIONS = [
  { id: "text", label: "Генерация текста", icon: <FileText className="h-5 w-5" /> },
  { id: "analysis", label: "Анализ данных", icon: <Sparkles className="h-5 w-5" /> },
  { id: "file", label: "Обработка файлов", icon: <Download className="h-5 w-5" /> },
  { id: "notification", label: "Уведомление", icon: <MessageSquare className="h-5 w-5" /> },
];

const INTEGRATIONS = [
  { id: "telegram", label: "Telegram", icon: "✈️" },
  { id: "notion", label: "Notion", icon: "📝" },
  { id: "email", label: "Email", icon: "✉️" },
  { id: "google_sheets", label: "Google Sheets", icon: "📊" },
  { id: "webhook_out", label: "Custom Webhook", icon: "🔗" },
];

export default function StudioSkillBuilder({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [currentStep, setCurrentStep] = useState<Step>("goal");
  const [data, setData] = useState<SkillData>({
    category: "",
    description: "",
    triggerType: "manual",
    actionType: "text",
    integration: "",
    aiStatus: "idle",
  });

  const updateData = (updates: Partial<SkillData>) => setData(prev => ({ ...prev, ...updates }));

  const handleNext = () => {
    if (currentStep === "goal") setCurrentStep("trigger");
    else if (currentStep === "trigger") setCurrentStep("action");
    else if (currentStep === "action") setCurrentStep("integration");
    else if (currentStep === "integration") runAiGeneration();
  };

  const handleBack = () => {
    if (currentStep === "trigger") setCurrentStep("goal");
    else if (currentStep === "action") setCurrentStep("trigger");
    else if (currentStep === "integration") setCurrentStep("action");
  };

  const runAiGeneration = () => {
    setCurrentStep("ai");
    updateData({ aiStatus: "generating" });
    
    setTimeout(() => {
      updateData({ 
        aiStatus: "done",
        generatedConfig: {
          name: `Skill_${Date.now()}`,
          workflow: [data.triggerType, data.actionType],
          integration: data.integration,
        }
      });
      setCurrentStep("result");
    }, 2000);
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "goal":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 1: Назначение скила</h2>
              <p className="text-muted-foreground text-sm">Что должен автоматизировать этот процесс?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => updateData({ category: cat.id })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    data.category === cat.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <span className="font-medium text-sm">{cat.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Описание задачи</label>
              <textarea
                value={data.description}
                onChange={(e) => updateData({ description: e.target.value })}
                placeholder="Например: Каждое утро собирать новости из RSS и отправлять сводку в Telegram..."
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
        );

      case "trigger":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 2: Триггер запуска</h2>
              <p className="text-muted-foreground text-sm">Когда скил должен начинать работу?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRIGGERS.map(trig => (
                <button
                  key={trig.id}
                  onClick={() => updateData({ triggerType: trig.id as any })}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    data.triggerType === trig.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${data.triggerType === trig.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {trig.icon}
                  </div>
                  <div>
                    <span className="font-medium text-sm block">{trig.label}</span>
                    <span className="text-xs text-muted-foreground">{trig.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "action":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 3: Тип действия</h2>
              <p className="text-muted-foreground text-sm">Что именно делает скил?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {ACTIONS.map(act => (
                <button
                  key={act.id}
                  onClick={() => updateData({ actionType: act.id as any })}
                  className={`p-4 rounded-xl border text-center transition-all ${
                    data.actionType === act.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={`mx-auto mb-2 w-10 h-10 rounded-full flex items-center justify-center ${
                    data.actionType === act.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {act.icon}
                  </div>
                  <span className="font-medium text-sm">{act.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "integration":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 4: Интеграция</h2>
              <p className="text-muted-foreground text-sm">С какими сервисами работает скил?</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTEGRATIONS.map(int => (
                <button
                  key={int.id}
                  onClick={() => updateData({ integration: int.id })}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    data.integration === int.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="text-xl block mb-1">{int.icon}</span>
                  <span className="text-xs font-medium">{int.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Sparkles className="h-8 w-8 text-primary animate-spin-slow" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg">AI создаёт скил...</h3>
              <p className="text-sm text-muted-foreground mt-1">Анализирую параметры и строю workflow</p>
            </div>
            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress" style={{ width: "60%" }} />
            </div>
          </div>
        );

      case "result":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Check className="h-6 w-6 text-green-500" /> Готово!
              </h2>
              <p className="text-muted-foreground text-sm">Скил успешно сгенерирован</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Название</span>
                <span className="text-sm font-mono">Skill_{Math.floor(Math.random() * 1000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Триггер</span>
                <span className="text-sm capitalize">{TRIGGERS.find(t => t.id === data.triggerType)?.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Интеграция</span>
                <span className="text-sm capitalize">{INTEGRATIONS.find(i => i.id === data.integration)?.label}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Экспорт JSON
              </button>
              <button className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted flex items-center justify-center gap-2">
                <Copy className="h-4 w-4" /> Копировать конфиг
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = ["goal", "trigger", "action", "integration", "ai", "result"];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Создание скила</span>
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">Beta</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            {["Цель", "Триггер", "Действие", "Связи", "AI", "Готово"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i < currentStepIndex ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="hidden sm:block text-[10px]">{label}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${(currentStepIndex + 1) * 16.6}%` }} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          {currentStep !== "goal" && currentStep !== "ai" && currentStep !== "result" && (
            <button onClick={handleBack} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" /> Назад
            </button>
          )}
          
          {currentStep === "result" ? (
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">
              <Save className="h-4 w-4" /> Сохранить в Studio
            </button>
          ) : currentStep !== "ai" && (
            <button 
              onClick={handleNext} 
              disabled={
                (currentStep === "goal" && !data.category) ||
                (currentStep === "integration" && !data.integration)
              }
              className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-1 disabled:opacity-50"
            >
              Далее <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}