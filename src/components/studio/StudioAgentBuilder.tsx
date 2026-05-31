import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, ChevronRight, ChevronLeft, X, Sparkles, Zap, Clock, 
  MessageSquare, FileText, Send, Save, Download, Copy, Bot, 
  Brain, Shield, AlertCircle, Play, Pause, Settings, Database,
  Globe, Webhook, Eye, Terminal, ArrowRight, RefreshCw, Loader2 
} from "lucide-react";
import { toast } from "sonner";

type Step = "personality" | "triggers" | "integrations" | "workflow" | "memory" | "sandbox" | "security" | "publish";

interface AgentConfig {
  name: string;
  role: string;
  personality: string;
  triggers: string[];
  integrations: string[];
  workflow: WorkflowNode[];
  memoryType: "none" | "short" | "long" | "rag";
  maxContext: number;
  maxIterations: number;
  timeout: number;
  tokenBudget: number;
}

interface WorkflowNode {
  id: string;
  type: "trigger" | "llm" | "condition" | "action" | "memory" | "loop";
  label: string;
  config: Record<string, any>;
}

const TRIGGER_TYPES = [
  { id: "manual", label: "Ручной запуск", icon: <Zap className="h-5 w-5" />, desc: "Запуск по кнопке" },
  { id: "schedule", label: "По расписанию", icon: <Clock className="h-5 w-5" />, desc: "Cron или таймер" },
  { id: "webhook", label: "Webhook", icon: <Send className="h-5 w-5" />, desc: "Внешний запрос" },
  { id: "event", label: "Событие", icon: <MessageSquare className="h-5 w-5" />, desc: "Новое сообщение/файл" },
];

const INTEGRATION_CATEGORIES = [
  { id: "messenger", label: "Мессенджеры", icon: <MessageSquare className="h-5 w-5" />, items: ["Telegram", "WhatsApp", "Discord", "Slack"] },
  { id: "database", label: "Базы данных", icon: <Database className="h-5 w-5" />, items: ["Notion", "Airtable", "Google Sheets", "PostgreSQL"] },
  { id: "ai_provider", label: "AI-провайдеры", icon: <Brain className="h-5 w-5" />, items: ["OpenAI", "Anthropic", "YandexGPT", "GigaChat"] },
  { id: "webhook", label: "Вебхуки/API", icon: <Webhook className="h-5 w-5" />, items: ["Custom API", "REST Endpoint", "GraphQL"] },
  { id: "storage", label: "Файловые хранилища", icon: <Globe className="h-5 w-5" />, items: ["Google Drive", "Dropbox", "S3", "Local"] },
];

const WORKFLOW_NODE_TYPES = [
  { id: "llm", label: "LLM Call", icon: <Brain className="h-4 w-4" />, desc: "Вызов языковой модели" },
  { id: "condition", label: "Condition", icon: <AlertCircle className="h-4 w-4" />, desc: "Условное ветвление" },
  { id: "action", label: "Action", icon: <Send className="h-4 w-4" />, desc: "Выполнение действия" },
  { id: "memory", label: "Memory", icon: <Database className="h-4 w-4" />, desc: "Запись в память" },
  { id: "loop", label: "Loop", icon: <RefreshCw className="h-4 w-4" />, desc: "Цикл повторений" }, // Исправлено: добавлен RefreshCw
];

const MEMORY_TYPES = [
  { id: "none", label: "Без памяти", icon: <X className="h-5 w-5" />, desc: "Каждый запуск с нуля" },
  { id: "short", label: "Краткосрочная", icon: <Clock className="h-5 w-5" />, desc: "Контекст сессии" },
  { id: "long", label: "Долгосрочная", icon: <Database className="h-5 w-5" />, desc: "Сохранение между запусками" },
  { id: "rag", label: "Векторная (RAG)", icon: <Brain className="h-5 w-5" />, desc: "Поиск по базе знаний" },
];

export default function StudioAgentBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("personality");
  const [config, setConfig] = useState<AgentConfig>({
    name: "",
    role: "",
    personality: "",
    triggers: [],
    integrations: [],
    workflow: [],
    memoryType: "short",
    maxContext: 4096,
    maxIterations: 5,
    timeout: 30,
    tokenBudget: 10000,
  });
  const [sandboxLogs, setSandboxLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateConfig = (updates: Partial<AgentConfig>) => setConfig(prev => ({ ...prev, ...updates }));

  const handleNext = () => {
    const steps: Step[] = ["personality", "triggers", "integrations", "workflow", "memory", "sandbox", "security", "publish"];
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx < steps.length - 1) {
      setCurrentStep(steps[currentIdx + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ["personality", "triggers", "integrations", "workflow", "memory", "sandbox", "security", "publish"];
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1]);
    }
  };

  const addWorkflowNode = (type: string) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: type as any,
      label: `Node ${config.workflow.length + 1}`,
      config: {},
    };
    updateConfig({ workflow: [...config.workflow, newNode] });
  };

  const removeWorkflowNode = (id: string) => {
    updateConfig({ workflow: config.workflow.filter(n => n.id !== id) });
  };

  const runSandbox = () => {
    setIsRunning(true);
    setSandboxLogs(["🚀 Запуск песочницы...", "📥 Загрузка конфигурации...", "🧠 Инициализация LLM...", "✅ Готово к выполнению"]);
    
    setTimeout(() => {
      setSandboxLogs(prev => [...prev, "⚡ Выполнение workflow...", "📤 Результат: Успешно"]);
      setIsRunning(false);
    }, 3000);
  };

  const handlePublish = () => {
    toast.success("Агент опубликован! Он доступен в разделе 'Мои агенты'.");
    navigate("/studio?tab=agents");
  };

  const steps: Step[] = ["personality", "triggers", "integrations", "workflow", "memory", "sandbox", "security", "publish"];
  const stepLabels = ["Личность", "Триггеры", "Интеграции", "Workflow", "Память", "Песочница", "Безопасность", "Публикация"];
  const currentStepIndex = steps.indexOf(currentStep);

  const renderStepContent = () => {
    switch (currentStep) {
      case "personality":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Bot className="h-6 w-6 text-primary" /> Шаг 1: Личность агента
              </h2>
              <p className="text-muted-foreground text-sm">Кто твой агент? Опиши его роль и характер</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Имя агента</label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => updateConfig({ name: e.target.value })}
                  placeholder="Например: Ассистент продаж"
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Роль (System Prompt)</label>
                <textarea
                  value={config.role}
                  onChange={(e) => updateConfig({ role: e.target.value })}
                  placeholder="Ты — профессиональный помощник по продажам. Твоя задача..."
                  className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none resize-none font-mono"
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Характер и стиль</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Формальный", "Дружелюбный", "Краткий", "Детальный", "Креативный", "Техничный"].map(style => (
                    <button
                      key={style}
                      onClick={() => updateConfig({ personality: style })}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        config.personality === style ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "triggers":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 2: Триггеры запуска</h2>
              <p className="text-muted-foreground text-sm">Когда агент должен начинать работу?</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRIGGER_TYPES.map(trig => (
                <button
                  key={trig.id}
                  onClick={() => {
                    const newTriggers = config.triggers.includes(trig.id) 
                      ? config.triggers.filter(t => t !== trig.id)
                      : [...config.triggers, trig.id];
                    updateConfig({ triggers: newTriggers });
                  }}
                  className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    config.triggers.includes(trig.id) ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${config.triggers.includes(trig.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {trig.icon}
                  </div>
                  <div>
                    <span className="font-medium text-sm block">{trig.label}</span>
                    <span className="text-xs text-muted-foreground">{trig.desc}</span>
                  </div>
                  {config.triggers.includes(trig.id) && <Check className="h-5 w-5 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 3: Интеграции</h2>
              <p className="text-muted-foreground text-sm">Какие сервисы будет использовать агент?</p>
            </div>
            
            <div className="space-y-4">
              {INTEGRATION_CATEGORIES.map(cat => (
                <div key={cat.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-3">
                    {cat.icon}
                    <span className="font-medium text-sm">{cat.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.items.map(item => (
                      <button
                        key={item}
                        onClick={() => {
                          const newIntegrations = config.integrations.includes(item)
                            ? config.integrations.filter(i => i !== item)
                            : [...config.integrations, item];
                          updateConfig({ integrations: newIntegrations });
                        }}
                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-between ${
                          config.integrations.includes(item) ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
                        }`}
                      >
                        {item}
                        {config.integrations.includes(item) && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "workflow":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 4: Workflow</h2>
              <p className="text-muted-foreground text-sm">Построй логику выполнения агента</p>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {WORKFLOW_NODE_TYPES.map(node => (
                <button
                  key={node.id}
                  onClick={() => addWorkflowNode(node.id)}
                  className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium flex items-center gap-2 transition-colors"
                >
                  {node.icon} {node.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {config.workflow.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-xl bg-muted/20">
                  <Settings className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Добавь ноды для построения workflow</p>
                </div>
              ) : (
                config.workflow.map((node, idx) => (
                  <div key={node.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                    <span className="text-xs text-muted-foreground w-6">{idx + 1}</span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {WORKFLOW_NODE_TYPES.find(t => t.id === node.type)?.icon}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={node.label}
                        onChange={(e) => {
                          const newWorkflow = [...config.workflow];
                          newWorkflow[idx] = { ...node, label: e.target.value };
                          updateConfig({ workflow: newWorkflow });
                        }}
                        className="w-full text-sm bg-transparent outline-none"
                      />
                    </div>
                    <button
                      onClick={() => removeWorkflowNode(node.id)}
                      className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {idx < config.workflow.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "memory":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 5: Память и контекст</h2>
              <p className="text-muted-foreground text-sm">Как агент будет запоминать информацию?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MEMORY_TYPES.map(mem => (
                <button
                  key={mem.id}
                  onClick={() => updateConfig({ memoryType: mem.id as any })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    config.memoryType === mem.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={`mb-2 ${config.memoryType === mem.id ? "text-primary" : "text-muted-foreground"}`}>
                    {mem.icon}
                  </div>
                  <span className="font-medium text-sm block">{mem.label}</span>
                  <span className="text-xs text-muted-foreground">{mem.desc}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div>
                <label className="text-sm font-medium mb-2 block">Макс. контекст (токены): {config.maxContext}</label>
                <input
                  type="range"
                  min="1024"
                  max="32768"
                  step="1024"
                  value={config.maxContext}
                  onChange={(e) => updateConfig({ maxContext: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Бюджет токенов на запуск: {config.tokenBudget}</label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={config.tokenBudget}
                  onChange={(e) => updateConfig({ tokenBudget: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
        );

      case "sandbox":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Шаг 6: Песочница</h2>
              <p className="text-muted-foreground text-sm">Протестируй агента перед публикацией</p>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={runSandbox}
                disabled={isRunning}
                className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {/* Исправлено: добавлен Loader2 */}
                {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {isRunning ? "Выполняется..." : "Запустить тест"}
              </button>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 font-mono text-xs space-y-1 max-h-64 overflow-y-auto border border-border">
              {sandboxLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Логи появятся после запуска</p>
              ) : (
                sandboxLogs.map((log, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>В песочнице агент использует тестовые данные. Реальные интеграции не затрагиваются.</span>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Shield className="h-6 w-6 text-primary" /> Шаг 7: Безопасность и лимиты
              </h2>
              <p className="text-muted-foreground text-sm">Защити агент от злоупотреблений</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Таймаут выполнения (сек): {config.timeout}</label>
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={config.timeout}
                  onChange={(e) => updateConfig({ timeout: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Макс. итераций цикла: {config.maxIterations}</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.maxIterations}
                  onChange={(e) => updateConfig({ maxIterations: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Защитные меры
                </h4>
                {[
                  "Блокировка опасных API-вызовов",
                  "Валидация входных данных",
                  "Логирование всех действий",
                  "Автоматическая остановка при ошибке",
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-border" />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case "publish":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Check className="h-6 w-6 text-green-500" /> Шаг 8: Публикация
              </h2>
              <p className="text-muted-foreground text-sm">Агент готов к запуску!</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <h4 className="font-medium text-sm">Итоговая конфигурация</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Имя:</span>
                  <span>{config.name || "Не указано"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Триггеры:</span>
                  <span>{config.triggers.length > 0 ? config.triggers.join(", ") : "Нет"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Интеграции:</span>
                  <span>{config.integrations.length > 0 ? config.integrations.join(", ") : "Нет"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ноды workflow:</span>
                  <span>{config.workflow.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Память:</span>
                  <span>{MEMORY_TYPES.find(m => m.id === config.memoryType)?.label}</span>
                </div>
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

            <button
              onClick={handlePublish}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Save className="h-4 w-4" /> Опубликовать агента
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/studio?tab=agents")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" /> Конструктор AI-агентов
            </h1>
            <p className="text-sm text-muted-foreground">Создай автономного помощника за 8 шагов</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i < currentStepIndex ? "bg-primary text-primary-foreground" :
                i === currentStepIndex ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden lg:block text-[10px] font-medium">{label}</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }} 
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 min-h-[500px]">
        {renderStepContent()}
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" /> Назад
        </button>
        
        <span className="text-xs text-muted-foreground">
          Шаг {currentStepIndex + 1} из {steps.length}
        </span>

        {currentStep !== "publish" ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-1 hover:opacity-90 transition-opacity"
          >
            Далее <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="w-[100px]" />
        )}
      </div>
    </div>
  );
}