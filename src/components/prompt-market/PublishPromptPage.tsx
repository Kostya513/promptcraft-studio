import { useState, useCallback } from "react";
import { 
  ArrowLeft, Sparkles, Upload, X, Check, Loader2, Save, Send, 
  AlertCircle, Tag, Bot, Plus, Trash2, Globe, Key, Zap, Database 
} from "lucide-react";
import { Link } from "react-router-dom";
import { classifyContent, getClassName, getGroupName, LibraryClassId, LibraryGroupId } from "../../utils/libraryClassifier";

// ─── TYPES ───
interface AgentStage {
  label: string;
  status: "pending" | "running" | "done" | "error";
  result?: string;
}

// 🔹 Универсальные категории интеграций (не привязаны к конкретным сервисам)
export type IntegrationCategory = "messenger" | "database" | "ai_provider" | "webhook" | "storage" | "custom";

export interface AgentIntegration {
  id: string;
  category: IntegrationCategory;
  required: boolean;
  description: string;
  config?: Record<string, any>;
}

export interface AgentTrigger {
  id: string;
  type: "webhook" | "schedule" | "manual" | "api" | "event";
  config: Record<string, any>;
}

export interface WorkflowNode {
  id: string;
  type: "prompt" | "llm" | "condition" | "action" | "memory" | "tool";
  label: string;
  config: Record<string, any>;
}

export type ContentType = "prompt" | "skill" | "agent";

// ─── CONSTANTS ───
const INTEGRATION_CATEGORIES: { key: IntegrationCategory; label: string; icon: JSX.Element; description: string }[] = [
  { key: "messenger", label: "Мессенджеры", icon: <Globe className="h-4 w-4" />, description: "Telegram, WhatsApp, Discord и др." },
  { key: "database", label: "Базы данных", icon: <Database className="h-4 w-4" />, description: "Notion, Airtable, Google Sheets и др." },
  { key: "ai_provider", label: "AI-провайдеры", icon: <Zap className="h-4 w-4" />, description: "OpenAI, Anthropic, YandexGPT и др." },
  { key: "webhook", label: "Вебхуки / API", icon: <Globe className="h-4 w-4" />, description: "Любой REST API endpoint" },
  { key: "storage", label: "Файловые хранилища", icon: <Database className="h-4 w-4" />, description: "Google Drive, Dropbox и др." },
  { key: "custom", label: "Кастомная интеграция", icon: <Key className="h-4 w-4" />, description: "Своя логика подключения" },
];

const TRIGGER_TYPES: { key: AgentTrigger["type"]; label: string }[] = [
  { key: "webhook", label: "🔗 Webhook" },
  { key: "schedule", label: "⏰ Расписание" },
  { key: "manual", label: "👤 Ручной запуск" },
  { key: "api", label: "🔌 Внешний API" },
  { key: "event", label: "📡 Событие" },
];

const WORKFLOW_NODE_TYPES: { key: WorkflowNode["type"]; label: string; icon: JSX.Element }[] = [
  { key: "llm", label: "LLM Call", icon: <Zap className="h-3 w-3" /> },
  { key: "condition", label: "Condition", icon: <AlertCircle className="h-3 w-3" /> },
  { key: "action", label: "Action", icon: <Send className="h-3 w-3" /> },
  { key: "memory", label: "Memory", icon: <Database className="h-3 w-3" /> },
  { key: "tool", label: "Tool / Function", icon: <Key className="h-3 w-3" /> },
];

// ─── MAIN COMPONENT ───
export default function PublishPromptPage() {
  const [promptText, setPromptText] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [contentType, setContentType] = useState<ContentType>("prompt");

  // Agent state
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentCategory, setAgentCategory] = useState("");
  const [agentTags, setAgentTags] = useState<string[]>([]);
  const [agentModel, setAgentModel] = useState("");
  const [agentValidated, setAgentValidated] = useState(false);
  
  // 🔹 Universal Agent Configuration
  const [agentTriggers, setAgentTriggers] = useState<AgentTrigger[]>([]);
  const [agentIntegrations, setAgentIntegrations] = useState<AgentIntegration[]>([]);
  const [workflowNodes, setWorkflowNodes] = useState<WorkflowNode[]>([]);
  const [agentMemoryEnabled, setAgentMemoryEnabled] = useState(false);
  const [agentMaxIterations, setAgentMaxIterations] = useState(5);
  const [agentTimeout, setAgentTimeout] = useState(30);

  // 🔹 Library Classification
  const [libraryClass, setLibraryClass] = useState<LibraryClassId | "">("");
  const [libraryGroup, setLibraryGroup] = useState<LibraryGroupId | "">("");
  const [classificationConfidence, setClassificationConfidence] = useState(0);

  const [stages, setStages] = useState<AgentStage[]>([
    { label: "Анализ контента", status: "pending" },
    { label: "Определение категории", status: "pending" },
    { label: "Генерация тегов", status: "pending" },
    { label: "Классификация для библиотеки", status: "pending" },
    { label: "Определение модели", status: "pending" },
    { label: "Валидация", status: "pending" },
  ]);

  // ─── HANDLERS ───
  const handleImprovePrompt = async () => {
    if (!promptText.trim()) return;
    setPromptText((prev) => prev + "\n\n[✨ Улучшенная версия будет сгенерирована через API]");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const newFiles = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 Run analysis agent
  const runAgent = async () => {
    if (!promptText.trim()) return;
    setAgentRunning(true);

    const mockResults = [
      { category: "Автоматизация", delay: 600 },
      { tags: ["AI", "Workflow", "Интеграция"], delay: 800 },
      { model: "GPT-4o / YandexGPT Pro", delay: 500 },
    ];

    for (let i = 0; i < stages.length; i++) {
      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
      await new Promise((r) => setTimeout(r, mockResults[Math.min(i, mockResults.length - 1)]?.delay || 500));

      if (i === 0) setAgentCategory("Автоматизация");
      if (i === 1) setAgentTags(["AI", "Workflow", "Интеграция", "No-Code"]);
      if (i === 2) setAgentModel("GPT-4o / YandexGPT Pro");
      
      // 🔹 Auto-classification for library (фикс: приводим agent к prompt для совместимости)
      if (i === 3) {
        const classification = classifyContent(
          ["AI", "Workflow", "Интеграция"],
          description,
          (contentType === "agent" ? "prompt" : contentType) as "prompt" | "skill"
        );
        setLibraryClass(classification.classId);
        setLibraryGroup(classification.groupId);
        setClassificationConfidence(classification.confidence);
      }

      const hasResults = uploadedFiles.length > 0 || (contentType as ContentType) === "agent";
      if (i === 5 && !hasResults && contentType !== "agent") {
        setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "error", result: "Добавьте результаты" } : s)));
        setAgentRunning(false);
        return;
      }

      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s)));
    }

    setAgentValidated(true);
    setAgentRunning(false);
  };

  // 🔹 Tag change with re-classification
  const handleTagChange = (newTags: string[]) => {
    setAgentTags(newTags);
    if (newTags.length > 0) {
      const classification = classifyContent(newTags, description, (contentType === "agent" ? "prompt" : contentType) as "prompt" | "skill");
      setLibraryClass(classification.classId);
      setLibraryGroup(classification.groupId);
      setClassificationConfidence(classification.confidence);
    }
  };

  // 🔹 Universal integration handlers
  const addIntegration = (category: IntegrationCategory) => {
    const newIntegration: AgentIntegration = {
      id: crypto.randomUUID(),
      category,
      required: false,
      description: "",
      config: {},
    };
    setAgentIntegrations([...agentIntegrations, newIntegration]);
  };

  const updateIntegration = (id: string, updates: Partial<AgentIntegration>) => {
    setAgentIntegrations(agentIntegrations.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const removeIntegration = (id: string) => {
    setAgentIntegrations(agentIntegrations.filter(i => i.id !== id));
  };

  // 🔹 Trigger handlers
  const addTrigger = (type: AgentTrigger["type"]) => {
    const newTrigger: AgentTrigger = {
      id: crypto.randomUUID(),
      type,
      config: {},
    };
    setAgentTriggers([...agentTriggers, newTrigger]);
  };

  const removeTrigger = (id: string) => {
    setAgentTriggers(agentTriggers.filter(t => t.id !== id));
  };

  // 🔹 Workflow node handlers
  const addWorkflowNode = (type: WorkflowNode["type"]) => {
    const newNode: WorkflowNode = {
      id: crypto.randomUUID(),
      type,
      label: `Node ${workflowNodes.length + 1}`,
      config: {},
    };
    setWorkflowNodes([...workflowNodes, newNode]);
  };

  const updateWorkflowNode = (id: string, updates: Partial<WorkflowNode>) => {
    setWorkflowNodes(workflowNodes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const removeWorkflowNode = (id: string) => {
    setWorkflowNodes(workflowNodes.filter(n => n.id !== id));
  };

  // ─── PUBLISH / SAVE ───
  const handlePublish = () => {
    if (!agentValidated) return;
    
    const payload = {
      contentType,
      promptText,
      description,
      tags: agentTags,
      libraryClass,
      libraryGroup,
      confidence: classificationConfidence,
      agentConfig: (contentType as ContentType) === "agent" ? {
        triggers: agentTriggers,
        integrations: agentIntegrations,
        workflow: workflowNodes,
        memory: agentMemoryEnabled,
        maxIterations: agentMaxIterations,
        timeout: agentTimeout,
        model: agentModel,
      } : null,
    };
    
    console.log("🚀 Publishing:", payload);
    setShowNotification(true);
  };

  const handleSaveDraft = () => {
    const payload = {
      contentType,
      promptText,
      description,
      uploadedFiles,
      agentCategory,
      agentTags,
      agentModel,
      libraryClass,
      libraryGroup,
      agentConfig: (contentType as ContentType) === "agent" ? {
        triggers: agentTriggers,
        integrations: agentIntegrations,
        workflow: workflowNodes,
      } : null,
    };
    console.log("💾 Saving draft:", payload);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  // ─── RENDER ───
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link to="/market" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад в маркет
      </Link>

      <h1 className="text-2xl font-bold mb-6">Публикация</h1>

      {/* Notification */}
      {showNotification && (
        <div className="mb-6 p-4 rounded-xl border border-success/30 bg-success/5 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium">
                {(contentType as ContentType) === "agent" ? "🤖 AI-агент опубликован!" : "✅ Контент опубликован!"}
              </p>
              <p className="text-xs text-muted-foreground">
                Размещён в: {libraryClass ? getClassName(libraryClass) : "Библиотеке"}
              </p>
            </div>
          </div>
          <Link to="/library" className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
            В библиотеку
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN — Main Form */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Content Type Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Тип контента</label>
            <div className="flex gap-2">
              {[
                { key: "prompt", label: "📝 Промпт" },
                { key: "skill", label: "⚡ Скил" },
                { key: "agent", label: "🤖 Агент" },
              ].map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => setContentType(ct.key as ContentType)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    contentType === ct.key
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">
                {(contentType as ContentType) === "agent" ? "System Prompt / Инструкция *" : "Текст *"}
              </label>
              <button
                onClick={handleImprovePrompt}
                disabled={!promptText.trim()}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" /> Улучшить
              </button>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={
                (contentType as ContentType) === "agent" 
                  ? "Опишите логику работы агента, его цели, ограничения и поведение...\n\nПример: 'Ты — помощник по анализу данных. Получаешь CSV, возвращаешь инсайты...'"
                  : "Введите текст промпта или скила..."
              }
              rows={10}
              className={`${inputCls} resize-none font-mono text-xs leading-relaxed`}
            />
          </div>

          {/* 🔹 AGENT CONFIGURATION PANEL (Universal) */}
          {(contentType as ContentType) === "agent" && (
            <div className="space-y-5 p-5 rounded-xl border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-primary">Конфигурация AI-агента</h3>
              </div>

              {/* Triggers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Триггеры запуска</label>
                  <div className="flex gap-1">
                    {TRIGGER_TYPES.slice(0, 3).map((t) => (
                      <button
                        key={t.key}
                        onClick={() => addTrigger(t.key)}
                        className="px-2 py-1 rounded text-[10px] bg-background border border-border hover:border-primary transition-colors"
                      >
                        + {t.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
                {agentTriggers.length > 0 ? (
                  <div className="space-y-2">
                    {agentTriggers.map((trigger) => (
                      <div key={trigger.id} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                        <span className="text-xs flex-1">
                          {TRIGGER_TYPES.find(t => t.key === trigger.type)?.label}
                        </span>
                        <button onClick={() => removeTrigger(trigger.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Нет триггеров. Агент будет запускаться вручную.</p>
                )}
              </div>

              {/* Universal Integrations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Интеграции (из Менеджера аккаунтов)</label>
                  <select
                    onChange={(e) => { if (e.target.value) { addIntegration(e.target.value as IntegrationCategory); e.target.value = ""; }}}
                    className="text-xs px-2 py-1 rounded border border-border bg-background"
                    defaultValue=""
                  >
                    <option value="" disabled>+ Добавить категорию...</option>
                    {INTEGRATION_CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                {agentIntegrations.length > 0 ? (
                  <div className="space-y-2">
                    {agentIntegrations.map((integration) => {
                      const cat = INTEGRATION_CATEGORIES.find(c => c.key === integration.category);
                      return (
                        <div key={integration.id} className="p-3 rounded-lg bg-background border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {cat?.icon}
                              <span className="text-sm font-medium">{cat?.label}</span>
                            </div>
                            <button onClick={() => removeIntegration(integration.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={integration.description}
                            onChange={(e) => updateIntegration(integration.id, { description: e.target.value })}
                            placeholder="Для чего нужна эта интеграция?"
                            className="w-full text-xs px-2 py-1.5 rounded border border-border bg-background"
                          />
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={integration.required}
                              onChange={(e) => updateIntegration(integration.id, { required: e.target.checked })}
                            />
                            Обязательна для работы
                          </label>
                          <p className="text-[10px] text-muted-foreground">
                            💡 При запуске агент автоматически получит доступ к подключённым аккаунтам этой категории из вашего Менеджера
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Агент будет использовать интеграции, подключённые пользователем в Менеджере аккаунтов
                  </p>
                )}
              </div>

              {/* Workflow Nodes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Workflow (логика выполнения)</label>
                  <div className="flex gap-1">
                    {WORKFLOW_NODE_TYPES.slice(0, 3).map((n) => (
                      <button
                        key={n.key}
                        onClick={() => addWorkflowNode(n.key)}
                        className="px-2 py-1 rounded text-[10px] bg-background border border-border hover:border-primary transition-colors flex items-center gap-1"
                      >
                        {n.icon} + {n.label}
                      </button>
                    ))}
                  </div>
                </div>
                {workflowNodes.length > 0 ? (
                  <div className="space-y-2">
                    {workflowNodes.map((node, idx) => (
                      <div key={node.id} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                        <span className="text-[10px] text-muted-foreground w-4">{idx + 1}.</span>
                        {WORKFLOW_NODE_TYPES.find(t => t.key === node.type)?.icon}
                        <input
                          type="text"
                          value={node.label}
                          onChange={(e) => updateWorkflowNode(node.id, { label: e.target.value })}
                          className="flex-1 text-xs bg-transparent outline-none"
                        />
                        <button onClick={() => removeWorkflowNode(node.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Линейное выполнение. Добавьте ноды для сложной логики.</p>
                )}
              </div>

              {/* Advanced Settings */}
              <div className="pt-3 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agentMemoryEnabled}
                      onChange={(e) => setAgentMemoryEnabled(e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>🧠 Включить память (контекст между запусками)</span>
                  </label>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Макс. итераций: {agentMaxIterations}</label>
                  <input
                    type="range" min="1" max="20"
                    value={agentMaxIterations}
                    onChange={(e) => setAgentMaxIterations(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Таймаут выполнения: {agentTimeout} сек</label>
                  <input
                    type="range" min="5" max="300" step="5"
                    value={agentTimeout}
                    onChange={(e) => setAgentTimeout(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Results Upload */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              {(contentType as ContentType) === "agent" ? "Примеры входных/выходных данных *" : "Результаты генерации *"}
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Перетащите файлы или</p>
              <label className="inline-block px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
                Выберите файлы
                <input type="file" multiple onChange={handleFileInput} className="hidden" accept="image/*,video/*,.json,.txt" />
              </label>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="relative aspect-square rounded-lg border border-border overflow-hidden group">
                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                (contentType as ContentType) === "agent"
                  ? "Опишите возможности агента, сценарии использования, необходимые интеграции из Менеджера аккаунтов..."
                  : "Опишите назначение, кейсы использования, примеры..."
              }
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        {/* RIGHT COLUMN — Analysis Widget */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">🔍 Агент анализа</h3>
              <button
                onClick={runAgent}
                disabled={agentRunning || !promptText.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {agentRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {agentRunning ? "Анализ..." : "Запустить"}
              </button>
            </div>

            {/* Stages */}
            <div className="space-y-2">
              {stages.map((stage, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    stage.status === "done" ? "bg-success/10 text-success" :
                    stage.status === "running" ? "bg-primary/10 text-primary" :
                    stage.status === "error" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {stage.status === "done" && <Check className="h-3 w-3" />}
                    {stage.status === "running" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {stage.status === "error" && <AlertCircle className="h-3 w-3" />}
                    {stage.status === "pending" && <span className="text-[10px]">{i + 1}</span>}
                  </div>
                  <span className={stage.status === "done" ? "text-foreground" : "text-muted-foreground"}>
                    {stage.label}
                  </span>
                  {stage.result && <span className="text-destructive ml-auto">{stage.result}</span>}
                </div>
              ))}
            </div>

            {/* Auto-filled Fields */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Категория</label>
                <input value={agentCategory} onChange={(e) => setAgentCategory(e.target.value)} placeholder="Определяется агентом..." className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Теги</label>
                <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                  {agentTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleTagChange(agentTags.filter((t) => t !== tag))}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                  {agentTags.length === 0 && <span className="text-xs text-muted-foreground">Определяются агентом...</span>}
                </div>
              </div>
              {/* Classification Badge */}
              {libraryClass && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    <label className="text-xs font-semibold text-primary">Размещение в библиотеке</label>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Класс:</span>
                      <span className="font-medium">{getClassName(libraryClass)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Группа:</span>
                      <span className="font-medium">{libraryGroup ? getGroupName(libraryGroup) : "—"}</span>
                    </div>
                    {classificationConfidence > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground">Уверенность:</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${classificationConfidence * 100}%` }} />
                        </div>
                        <span className="text-[10px]">{Math.round(classificationConfidence * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Рекомендуемая модель</label>
                <input value={agentModel} onChange={(e) => setAgentModel(e.target.value)} placeholder="Определяется агентом..." className={inputCls} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
        <button
          onClick={handlePublish}
          disabled={!agentValidated}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send className="h-4 w-4" /> Опубликовать
        </button>
        <button
          onClick={handleSaveDraft}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Save className="h-4 w-4" /> Черновик
        </button>
      </div>
    </div>
  );
}