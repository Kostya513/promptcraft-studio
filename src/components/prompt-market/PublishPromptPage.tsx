import { useState, useCallback, useEffect } from "react";
import { 
  ArrowLeft, Sparkles, Upload, X, Check, Loader2, Save, Send, 
  AlertCircle, Tag, Bot, Plus, Trash2, Globe, Key, Zap, Database, DollarSign,
  Eye, EyeOff, Lock, Users, FileText, Image as ImageIcon, Video, Link as LinkIcon,
  Shield, Clock, TrendingUp, Star, Heart, Share2, Download
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { classifyContent, getClassName, getGroupName, LibraryClassId, LibraryGroupId } from "../../utils/libraryClassifier";
import { uploadMedia, checkFileSize } from "../../utils/mediaUpload";

interface AgentStage {
  label: string;
  status: "pending" | "running" | "done" | "error";
  result?: string;
}

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
export type PricingType = "free" | "paid" | "subscription";
export type VisibilityType = "public" | "subscribers" | "private";
export type LicenseType = "commercial" | "personal" | "educational" | "custom";

const INTEGRATION_CATEGORIES: { key: IntegrationCategory; label: string; icon: JSX.Element; description: string }[] = [
  { key: "messenger", label: "Мессенджеры", icon: <Globe className="h-4 w-4" />, description: "Telegram, WhatsApp, Discord" },
  { key: "database", label: "Базы данных", icon: <Database className="h-4 w-4" />, description: "Notion, Airtable, Google Sheets" },
  { key: "ai_provider", label: "AI-провайдеры", icon: <Zap className="h-4 w-4" />, description: "OpenAI, Anthropic, YandexGPT" },
  { key: "webhook", label: "Вебхуки / API", icon: <Globe className="h-4 w-4" />, description: "REST API endpoint" },
  { key: "storage", label: "Файловые хранилища", icon: <Database className="h-4 w-4" />, description: "Google Drive, Dropbox" },
  { key: "custom", label: "Кастомная интеграция", icon: <Key className="h-4 w-4" />, description: "Своя логика" },
];

const TRIGGER_TYPES: { key: AgentTrigger["type"]; label: string }[] = [
  { key: "webhook", label: "🔗 Webhook" },
  { key: "schedule", label: " Расписание" },
  { key: "manual", label: "👤 Ручной запуск" },
  { key: "api", label: "🔌 API" },
  { key: "event", label: "📡 Событие" },
];

const WORKFLOW_NODE_TYPES: { key: WorkflowNode["type"]; label: string; icon: JSX.Element }[] = [
  { key: "llm", label: "LLM Call", icon: <Zap className="h-3 w-3" /> },
  { key: "condition", label: "Condition", icon: <AlertCircle className="h-3 w-3" /> },
  { key: "action", label: "Action", icon: <Send className="h-3 w-3" /> },
  { key: "memory", label: "Memory", icon: <Database className="h-3 w-3" /> },
  { key: "tool", label: "Tool", icon: <Key className="h-3 w-3" /> },
];

const VISIBILITY_OPTIONS: { key: VisibilityType; label: string; icon: JSX.Element; description: string }[] = [
  { key: "public", label: "Публично", icon: <Globe className="h-4 w-4" />, description: "Видно всем в Prompt Market" },
  { key: "subscribers", label: "Только подписчикам", icon: <Users className="h-4 w-4" />, description: "Видно только вашим подписчикам" },
  { key: "private", label: "Приватно", icon: <Lock className="h-4 w-4" />, description: "Видно только вам" },
];

const LICENSE_OPTIONS: { key: LicenseType; label: string; description: string }[] = [
  { key: "commercial", label: "Коммерческая", description: "Можно использовать в коммерческих проектах" },
  { key: "personal", label: "Личная", description: "Только для личного использования" },
  { key: "educational", label: "Образовательная", description: "Для обучения и образования" },
  { key: "custom", label: "Своя лицензия", description: "Укажите свои условия использования" },
];

export default function PublishPromptPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🔹 Основные стейты формы
  const [promptText, setPromptText] = useState("");
  const [promptTitle, setPromptTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState("");
  const [contentType, setContentType] = useState<ContentType>("prompt");
  
  // 🔹 Медиа файлы (с поддержкой загрузки на сервер)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; type: string; size?: number }[]>([]);
  const [dragging, setDragging] = useState(false);
  
  // 🔹 Ценообразование
  const [pricingType, setPricingType] = useState<PricingType>("free");
  const [price, setPrice] = useState<number>(0);
  const [subscriptionPrice, setSubscriptionPrice] = useState<number>(0);
  const [previewText, setPreviewText] = useState("");
  
  // 🔹 Видимость и лицензия
  const [visibility, setVisibility] = useState<VisibilityType>("public");
  const [license, setLicense] = useState<LicenseType>("personal");
  const [customLicenseText, setCustomLicenseText] = useState("");
  
  // 🔹 AI-агент анализа
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentValidated, setAgentValidated] = useState(false);
  const [agentCategory, setAgentCategory] = useState("");
  const [agentTags, setAgentTags] = useState<string[]>([]);
  const [agentModel, setAgentModel] = useState("");
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

  // 🔹 Стейты для скилов и агентов
  const [skillWorkflow, setSkillWorkflow] = useState<any>(null);
  const [agentConfig, setAgentConfig] = useState<any>(null);
  const [skillIntegrations, setSkillIntegrations] = useState<any[]>([]);
  const [agentIntegrationsList, setAgentIntegrationsList] = useState<string[]>([]);
  
  // 🔹 Автосохранение черновика
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saving" | "saved" | "error">("saved");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 🔹 АВТОМАТИЧЕСКАЯ ДЕТЕКЦИЯ ТИПА КОНТЕНТА И ЗАПОЛНЕНИЕ ФОРМЫ
  useEffect(() => {
    const state = location.state as { prompt?: any; skill?: any; agent?: any } | null;
    
    if (state?.prompt) {
      const prompt = state.prompt;
      setContentType("prompt");
      setPromptText(prompt.text || "");
      setPromptTitle(prompt.title || "");
      setDescription(prompt.description || "");
      setTags(prompt.tags || []);
      setCategory(prompt.category || "");
      if (prompt.metadata?.aiModel) {
        setAgentModel(prompt.metadata.aiModel);
      }
      if (prompt.price) {
        setPrice(prompt.price);
        setPricingType(prompt.price > 0 ? "paid" : "free");
      }
      if (prompt.media && prompt.media.length > 0) {
        setUploadedFiles(prompt.media);
      }
    } else if (state?.skill) {
      const skill = state.skill;
      setContentType("skill");
      setPromptTitle(skill.name || "");
      setDescription(skill.description || "");
      setSkillWorkflow(skill.workflow || null);
      setSkillIntegrations(skill.integrations || []);
      setTags(skill.tags || []);
      if (skill.price) {
        setPrice(skill.price);
        setPricingType(skill.price > 0 ? "paid" : "free");
      }
      if (skill.media && skill.media.length > 0) {
        setUploadedFiles(skill.media);
      }
    } else if (state?.agent) {
      const agent = state.agent;
      setContentType("agent");
      setPromptTitle(agent.name || "");
      setDescription(agent.description || "");
      setAgentConfig(agent.config || null);
      setAgentIntegrationsList(agent.integrations || []);
      setTags(agent.tags || []);
      if (agent.price) {
        setPrice(agent.price);
        setPricingType(agent.price > 0 ? "paid" : "free");
      }
      if (agent.media && agent.media.length > 0) {
        setUploadedFiles(agent.media);
      }
    }
  }, [location.state]);

  // 🔹 АВТОСОХРАНЕНИЕ ЧЕРНОВИКА
  useEffect(() => {
    const timer = setTimeout(() => {
      if (promptTitle || promptText || description) {
        setAutoSaveStatus("saving");
        const draft = {
          contentType,
          promptTitle,
          promptText,
          description,
          tags,
          category,
          pricingType,
          price,
          subscriptionPrice,
          visibility,
          license,
          uploadedFiles,
          timestamp: Date.now(),
        };
        localStorage.setItem("publish_draft", JSON.stringify(draft));
        setAutoSaveStatus("saved");
        setLastSaved(new Date());
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [promptTitle, promptText, description, tags, category, contentType, pricingType, price, subscriptionPrice, visibility, license, uploadedFiles]);

  const finalPrice = pricingType === "free" ? 0 : (pricingType === "paid" ? price : subscriptionPrice);

  // 🔹 ВАЛИДАЦИЯ ОБЯЗАТЕЛЬНЫХ ПОЛЕЙ
  const isFormValid = () => {
    if (contentType === "prompt") {
      return promptText.trim().length >= 10;
    } else if (contentType === "skill" || contentType === "agent") {
      return promptTitle.trim().length >= 3 && description.trim().length >= 10;
    }
    return false;
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    if (contentType === "prompt" && promptText.trim().length < 10) {
      errors.push("Текст промта слишком короткий (минимум 10 символов)");
    }
    if ((contentType === "skill" || contentType === "agent") && promptTitle.trim().length < 3) {
      errors.push("Название слишком короткое (минимум 3 символа)");
    }
    if ((contentType === "skill" || contentType === "agent") && description.trim().length < 10) {
      errors.push("Описание слишком короткое (минимум 10 символов)");
    }
    if (pricingType !== "free" && finalPrice <= 0) {
      errors.push("Укажите корректную цену");
    }
    return errors;
  };

  // 🔹 РАБОТА С ТЕГАМИ
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // 🔹 ЗАГРУЗКА ФАЙЛОВ НА СЕРВЕР (ЧЕРЕЗ BACKEND)
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    
    try {
      for (const f of files) {
        if (!checkFileSize(f)) continue;
        
        const uploaded = await uploadMedia(f);
        
        setUploadedFiles((prev) => [...prev, {
          name: uploaded.name,
          url: uploaded.url,
          type: uploaded.type,
          size: uploaded.size
        }].slice(0, 10));
      }
    } catch (error: any) {
      console.error("Ошибка загрузки файлов:", error);
      alert(`❌ ${error.message || "Ошибка загрузки файлов"}`);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    try {
      for (const f of files) {
        if (!checkFileSize(f)) continue;
        
        const uploaded = await uploadMedia(f);
        
        setUploadedFiles((prev) => [...prev, {
          name: uploaded.name,
          url: uploaded.url,
          type: uploaded.type,
          size: uploaded.size
        }].slice(0, 10));
      }
    } catch (error: any) {
      console.error("Ошибка загрузки файлов:", error);
      alert(` ${error.message || "Ошибка загрузки файлов"}`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔹 AI-АГЕНТ АНАЛИЗА
  const runAgent = async () => {
    if (!isFormValid()) return;
    
    setAgentRunning(true);
    setAgentValidated(false);

    for (let i = 0; i < stages.length; i++) {
      setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "running" } : s)));
      await new Promise((r) => setTimeout(r, 600));

      try {
        if (i === 0) {
          setAgentCategory("Автоматизация");
        }
        if (i === 1) {
          setAgentTags(["AI", "Workflow", "Интеграция"]);
        }
        if (i === 2) {
          setAgentModel("GPT-4o");
        }
        if (i === 3) {
          let classificationType: "prompt" | "skill";
          if (contentType === "agent") {
            classificationType = "prompt";
          } else if (contentType === "skill") {
            classificationType = "skill";
          } else {
            classificationType = "prompt";
          }
          
          const classification = classifyContent(["AI", "Workflow"], description, classificationType);
          setLibraryClass(classification.classId);
          setLibraryGroup(classification.groupId);
          setClassificationConfidence(classification.confidence);
        }
        if (i === 4) {
          // Определение модели
        }
        if (i === 5) {
          const hasBasicData = contentType === "prompt" 
            ? promptText.trim().length >= 10 
            : promptTitle.trim().length >= 3 && description.trim().length >= 10;
          
          if (!hasBasicData) {
            setStages((prev) => prev.map((s, idx) => 
              idx === i ? { ...s, status: "error", result: "Недостаточно данных" } : s
            ));
            setAgentRunning(false);
            return;
          }
        }

        setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, status: "done" } : s)));
      } catch (error) {
        console.error("Ошибка на этапе", i, error);
        setStages((prev) => prev.map((s, idx) => 
          idx === i ? { ...s, status: "error", result: "Ошибка" } : s
        ));
        setAgentRunning(false);
        return;
      }
    }

    setAgentValidated(true);
    setAgentRunning(false);
  };

  // 🔹 ПУБЛИКАЦИЯ
  const handlePublish = () => {
    if (!agentValidated) {
      alert("⚠️ Запустите AI-агент анализа!");
      return;
    }
    
    if (!isFormValid()) {
      const errors = getValidationErrors();
      alert("⚠️ Исправьте ошибки:\n" + errors.join("\n"));
      return;
    }

    const basePayload = {
      id: `${contentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: contentType,
      title: promptTitle || (contentType === "prompt" ? promptText.split('\n')[0].slice(0, 50) : "Без названия"),
      description,
      tags,
      category: agentCategory || category,
      model: agentModel,
      price: finalPrice,
      subscriptionPrice: pricingType === "subscription" ? subscriptionPrice : undefined,
      subscriptionOnly: pricingType === "subscription",
      visibility,
      license,
      customLicenseText: license === "custom" ? customLicenseText : undefined,
      previewText: pricingType !== "free" ? previewText : undefined,
      status: contentType === "prompt" ? "moderation" : "active",
      libraryClass,
      libraryGroup,
      confidence: classificationConfidence,
      media: uploadedFiles,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: "current_user",
      author: "Вы",
      rating: 5,
      reviewCount: 0,
      views: 0,
      sales: 0,
      likes: 0,
      favorites: 0,
    };
    
    try {
      if (contentType === "prompt") {
        const prompts = JSON.parse(localStorage.getItem("promptcraft_prompts") || "[]");
        const promptPayload = {
          ...basePayload,
          text: promptText,
        };
        prompts.unshift(promptPayload);
        localStorage.setItem("promptcraft_prompts", JSON.stringify(prompts));
      } else if (contentType === "skill") {
        const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
        const skillPayload = {
          ...basePayload,
          name: basePayload.title,
          workflow: skillWorkflow,
          integrations: skillIntegrations,
          runCount: 0,
        };
        skills.unshift(skillPayload);
        localStorage.setItem("promptcraft_skills", JSON.stringify(skills));
      } else if (contentType === "agent") {
        const agents = JSON.parse(localStorage.getItem("promptcraft_agents") || "[]");
        const agentPayload = {
          ...basePayload,
          name: basePayload.title,
          config: agentConfig,
          integrations: agentIntegrationsList,
          runCount: 0,
          status: "active" as const,
        };
        agents.unshift(agentPayload);
        localStorage.setItem("promptcraft_agents", JSON.stringify(agents));
      }
      
      localStorage.removeItem("publish_draft");
      
      setShowNotification(true);
      setTimeout(() => {
        const tabMap: Record<ContentType, string> = { prompt: "prompts", skill: "skills", agent: "agents" };
        navigate(`/studio?tab=${tabMap[contentType]}`);
      }, 2000);
    } catch (error) {
      console.error("Ошибка:", error);
      alert(" Ошибка сохранения");
    }
  };

  // 🔹 СОХРАНЕНИЕ ЧЕРНОВИКА
  const handleSaveDraft = () => {
    const draft = {
      contentType,
      promptTitle,
      promptText,
      description,
      tags,
      category,
      pricingType,
      price,
      subscriptionPrice,
      visibility,
      license,
      uploadedFiles,
      timestamp: Date.now(),
    };
    localStorage.setItem("publish_draft_manual", JSON.stringify(draft));
    alert("💾 Черновик сохранён!");
  };

  // 🔹 ЗАГРУЗКА ЧЕРНОВИКА
  const handleLoadDraft = () => {
    const draftStr = localStorage.getItem("publish_draft_manual");
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setContentType(draft.contentType || "prompt");
        setPromptTitle(draft.promptTitle || "");
        setPromptText(draft.promptText || "");
        setDescription(draft.description || "");
        setTags(draft.tags || []);
        setCategory(draft.category || "");
        setPricingType(draft.pricingType || "free");
        setPrice(draft.price || 0);
        setSubscriptionPrice(draft.subscriptionPrice || 0);
        setVisibility(draft.visibility || "public");
        setLicense(draft.license || "personal");
        if (draft.uploadedFiles) {
          setUploadedFiles(draft.uploadedFiles);
        }
        alert("✅ Черновик загружен!");
      } catch (e) {
        alert("❌ Ошибка загрузки черновика");
      }
    } else {
      alert("📭 Черновики не найдены");
    }
  };

  const [showNotification, setShowNotification] = useState(false);

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link to="/market" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад в маркет
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Публикация</h1>
          <p className="text-sm text-muted-foreground">
            Заполните все поля для создания премиальной публикации
          </p>
        </div>
        <div className="flex items-center gap-2">
          {autoSaveStatus === "saving" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Сохранение...
            </span>
          )}
          {autoSaveStatus === "saved" && lastSaved && (
            <span className="text-xs text-muted-foreground">
              Сохранено: {lastSaved.toLocaleTimeString("ru-RU")}
            </span>
          )}
          <button
            onClick={handleLoadDraft}
            className="px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
          >
            Загрузить черновик
          </button>
        </div>
      </div>

      {showNotification && (
        <div className="mb-6 p-4 rounded-xl border border-success/30 bg-success/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-medium">Опубликовано!</p>
              <p className="text-xs text-muted-foreground">Цена: {finalPrice} ₽</p>
            </div>
          </div>
          <Link to="/library" className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted">
            В библиотеку
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 🔹 ОСНОВНАЯ ФОРМА */}
        <div className="lg:col-span-2 space-y-5">
          {/* Тип контента */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <label className="text-sm font-medium mb-3 block">Тип контента</label>
            <div className="flex gap-2">
              {[
                { key: "prompt", label: " Промпт" },
                { key: "skill", label: "⚡ Скил" },
                { key: "agent", label: " Агент" },
              ].map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => setContentType(ct.key as ContentType)}
                  className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    contentType === ct.key 
                      ? "border-primary bg-primary/5 text-primary shadow-sm" 
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {ct.label}
                </button>
              ))}
            </div>
          </div>

          {/* Основные поля */}
          {contentType === "prompt" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Текст промта *</label>
                <textarea 
                  value={promptText} 
                  onChange={(e) => setPromptText(e.target.value)} 
                  placeholder="Введите текст промта (минимум 10 символов)..." 
                  rows={8} 
                  className={`${inputCls} resize-none font-mono text-xs`} 
                />
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-xs ${promptText.trim().length < 10 ? "text-destructive" : "text-muted-foreground"}`}>
                    {promptText.trim().length < 10 ? "⚠️ Минимум 10 символов" : `${promptText.length} символов`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(contentType === "skill" || contentType === "agent") && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Название *</label>
                <input 
                  type="text"
                  value={promptTitle} 
                  onChange={(e) => setPromptTitle(e.target.value)} 
                  placeholder={`Введите название ${contentType === "skill" ? "скила" : "агента"}...`} 
                  className={inputCls}
                />
                <p className={`text-xs mt-1 ${promptTitle.trim().length < 3 ? "text-destructive" : "text-muted-foreground"}`}>
                  {promptTitle.trim().length < 3 ? "⚠️ Минимум 3 символа" : `${promptTitle.length} символов`}
                </p>
              </div>
            </div>
          )}

          {/* Описание */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Описание *</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Подробно опишите что делает ваш контент (минимум 10 символов)..." 
              rows={4} 
              className={`${inputCls} resize-none`} 
            />
            <p className={`text-xs mt-1 ${description.trim().length < 10 ? "text-destructive" : "text-muted-foreground"}`}>
              {description.trim().length < 10 ? "⚠️ Минимум 10 символов" : `${description.length} символов`}
            </p>
          </div>

          {/* Теги */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Теги (до 10)</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Введите тег и нажмите Enter"
                className={`${inputCls} flex-1`}
                disabled={tags.length >= 10}
              />
              <button
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 10}
                className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Медиа файлы */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Медиа (скриншоты, демо)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Перетащите файлы сюда или
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted cursor-pointer">
                <ImageIcon className="h-4 w-4" />
                Выбрать файлы
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileInput} className="hidden" />
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                Максимум 10 файлов (до 5MB каждый)
              </p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    {file.type === "image" ? (
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    ) : file.type === "video" ? (
                      <video src={file.url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ценообразование */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Стоимость</label>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button 
                  onClick={() => setPricingType("free")} 
                  className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    pricingType === "free" 
                      ? "border-success bg-success/10 text-success" 
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Бесплатно
                </button>
                <button 
                  onClick={() => setPricingType("paid")} 
                  className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    pricingType === "paid" 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Платно
                </button>
                <button 
                  onClick={() => setPricingType("subscription")} 
                  className={`flex-1 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                    pricingType === "subscription" 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:bg-muted"
                  }`}
                >
                  Подписка
                </button>
              </div>
              {pricingType !== "free" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {pricingType === "paid" ? "Цена (₽)" : "Цена в месяц (₽)"}
                  </label>
                  <input 
                    type="number" 
                    min="10" 
                    step="10" 
                    value={pricingType === "paid" ? price : subscriptionPrice} 
                    onChange={(e) => { 
                      const val = Number(e.target.value); 
                      if (pricingType === "paid") setPrice(val); 
                      else setSubscriptionPrice(val); 
                    }} 
                    placeholder="100" 
                    className={inputCls} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    💰 Итоговая цена: <strong className="text-primary">{finalPrice} ₽</strong>
                  </p>
                </div>
              )}
              {pricingType !== "free" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Превью (что увидят до покупки)
                  </label>
                  <textarea 
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Краткое описание того, что получит покупатель..."
                    rows={3}
                    className={`${inputCls} text-xs`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Видимость */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Видимость</label>
            </div>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setVisibility(opt.key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    visibility === opt.key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className={visibility === opt.key ? "text-primary" : "text-muted-foreground"}>
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Лицензия */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">Лицензия</label>
            </div>
            <div className="space-y-2">
              {LICENSE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setLicense(opt.key)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    license === opt.key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                  {license === opt.key && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
            {license === "custom" && (
              <textarea
                value={customLicenseText}
                onChange={(e) => setCustomLicenseText(e.target.value)}
                placeholder="Опишите ваши условия использования..."
                rows={4}
                className={`${inputCls} mt-3 text-xs`}
              />
            )}
          </div>

          {/* Для скилов и агентов */}
          {contentType === "skill" && skillWorkflow && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Workflow конфигурация</label>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(skillWorkflow, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {contentType === "agent" && agentConfig && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Конфигурация агента</label>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(agentConfig, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 🔹 БОКОВАЯ ПАНЕЛЬ */}
        <div className="space-y-5">
          {/* AI-агент анализа */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI-агент анализа
              </h3>
              <button 
                onClick={runAgent} 
                disabled={agentRunning || !isFormValid()} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {agentRunning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {agentRunning ? "Анализ..." : "Запустить"}
              </button>
            </div>
            
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
                </div>
              ))}
            </div>

            {agentValidated && (
              <div className="pt-3 border-t border-border">
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-xs text-success flex items-center gap-1 font-medium">
                    <Check className="h-3 w-3" />
                    Готово к публикации!
                  </p>
                </div>
              </div>
            )}

            {!agentValidated && !agentRunning && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 AI-агент поможет:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>Автоматически определить категорию</li>
                  <li>Сгенерировать теги</li>
                  <li>Классифицировать для библиотеки</li>
                  <li>Проверить качество контента</li>
                </ul>
              </div>
            )}
          </div>

          {/* Превью карточки */}
          <div className="bg-card border border-border rounded-xl p-4 sticky top-[400px]">
            <h3 className="text-sm font-semibold mb-3">Превью карточки</h3>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 mb-3 flex items-center justify-center">
                {uploadedFiles.length > 0 ? (
                  <img src={uploadedFiles[0].url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Нет медиа</p>
                  </div>
                )}
              </div>
              <h4 className="font-medium text-sm mb-1 line-clamp-2">
                {promptTitle || "Без названия"}
              </h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {description || "Нет описания"}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {contentType === "prompt" ? "📝 Промпт" : contentType === "skill" ? "⚡ Скил" : "🤖 Агент"}
                </span>
                <span className="font-semibold text-primary">
                  {pricingType === "free" ? "Бесплатно" : `${finalPrice} ₽`}
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="space-y-2">
            <button 
              onClick={handlePublish} 
              disabled={!agentValidated || !isFormValid()} 
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" /> Опубликовать
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handleSaveDraft} 
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <Save className="h-4 w-4" /> Черновик
              </button>
            </div>
          </div>

          {/* Подсказки */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Рекомендации
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Заполните все обязательные поля</li>
              <li>• Добавьте скриншоты или демо (до 5MB)</li>
              <li>• Укажите минимум 3 тега</li>
              <li>• Запустите AI-агент анализа</li>
              <li>• Проверьте превью карточки</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}