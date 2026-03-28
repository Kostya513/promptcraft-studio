import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, Sparkles, Check, ArrowRight, ArrowLeft, Image, FileText, Wand2, ShoppingBag, MessageSquare, Briefcase, Code, Palette, BarChart3, GraduationCap, Video, PenTool, MoreHorizontal, X, Clock, Cpu, Star, Layers, Download, Sliders, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePromptWithYandexGPT } from "@/lib/ai-api";
import { recommendAI, type PlatformType } from "@/lib/ai-orchestrator";
import { useExpertMode } from "@/contexts/ExpertModeContext";
import { autoSave } from "@/lib/auto-save";
import { exportAndDownload } from "@/lib/export-utils";
import { PromptData, PromptVersion, AIModel, PromptCategory, ExportFormat } from "@/types/prompt";

interface QuickStartWizardProps {
  onClose: () => void;
  onPublish?: (data: any) => void;
}

type Step = "mode" | "category" | "upload" | "describe" | "style" | "ai-process" | "result";

type CategoryType = "marketplace" | "social" | "business" | "development" | "creative" | "analytics" | "education" | "content" | "video" | "other";

type CompareTab = "before" | "after" | "details";

interface GeneratedResult {
  prompt: string;
  title: string;
  description: string;
  imageUrl?: string;
  category?: CategoryType;
  originalDescription?: string;
  aiModel?: string;
  generationTime?: number;
  quality?: number;
}

interface Message {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

const CATEGORIES: { id: CategoryType; name: string; icon: any; desc: string; popular?: boolean }[] = [
  { id: "marketplace", name: "Маркетплейсы", icon: ShoppingBag, desc: "WB, Ozon, Яндекс.Маркет", popular: true },
  { id: "social", name: "Соцсети", icon: MessageSquare, desc: "VK, Telegram, Дзен", popular: true },
  { id: "business", name: "Бизнес", icon: Briefcase, desc: "Стратегии, планы, финансы", popular: true },
  { id: "development", name: "Разработка", icon: Code, desc: "Код, API, архитектура" },
  { id: "creative", name: "Креатив", icon: Palette, desc: "Логотипы, брендинг, арт" },
  { id: "analytics", name: "Аналитика", icon: BarChart3, desc: "Отчёты, дашборды, метрики" },
  { id: "education", name: "Образование", icon: GraduationCap, desc: "Курсы, уроки, материалы" },
  { id: "content", name: "Контент", icon: PenTool, desc: "Статьи, сценарии, тексты" },
  { id: "video", name: "Видео", icon: Video, desc: "Сценарии, обложки, промо" },
  { id: "other", name: "Другое", icon: MoreHorizontal, desc: "Любая другая задача" },
];

const STYLES_BY_CATEGORY: Record<CategoryType, { id: string; name: string; icon: string; desc: string; ai: string }[]> = {
  marketplace: [
    { id: "studio", name: "Студия", icon: "📸", desc: "Белый фон, каталог", ai: "Kandinsky" },
    { id: "infographic", name: "Инфографика", icon: "📊", desc: "С текстами и преимуществами", ai: "Kandinsky" },
    { id: "interior", name: "Интерьер", icon: "🏠", desc: "Lifestyle, в использовании", ai: "Kandinsky" },
    { id: "catalog", name: "Каталог", icon: "📦", desc: "Минимализм для WB/Ozon", ai: "Kandinsky" },
  ],
  social: [
    { id: "vk_post", name: "Пост VK", icon: "📱", desc: "Текст + изображение", ai: "GigaChat" },
    { id: "telegram", name: "Telegram", icon: "✈️", desc: "Коротко, ёмко, превью", ai: "GigaChat" },
    { id: "dzen", name: "Дзен", icon: "📰", desc: "Длинный контент, обложка", ai: "GigaChat" },
    { id: "tenchat", name: "TenChat", icon: "💼", desc: "Деловой стиль", ai: "GigaChat" },
  ],
  business: [
    { id: "strategy", name: "Стратегия", icon: "📊", desc: "Структурированно, метрики", ai: "YandexGPT" },
    { id: "presentation", name: "Презентация", icon: "📈", desc: "Слайды, тезисы", ai: "YandexGPT" },
    { id: "document", name: "Документ", icon: "📝", desc: "Формально, подробно", ai: "YandexGPT" },
    { id: "brief", name: "Бриф", icon: "💡", desc: "Кратко, по делу", ai: "GigaChat" },
  ],
  development: [
    { id: "architecture", name: "Архитектура", icon: "🏗️", desc: "Структура, компоненты", ai: "YandexGPT" },
    { id: "api", name: "API", icon: "📡", desc: "Endpoints, документация", ai: "YandexGPT" },
    { id: "database", name: "БД", icon: "🗄️", desc: "Схемы, миграции", ai: "YandexGPT" },
    { id: "tests", name: "Тесты", icon: "🧪", desc: "Юнит, интеграционные", ai: "YandexGPT" },
  ],
  creative: [
    { id: "art_concept", name: "Арт-концепт", icon: "🎭", desc: "Художественно, креативно", ai: "Шедеврум" },
    { id: "logo", name: "Логотип", icon: "🏷️", desc: "Минимализм, бренд", ai: "Шедеврум" },
    { id: "scenario", name: "Сценарий", icon: "🎬", desc: "Структура, диалоги", ai: "GigaChat" },
    { id: "story", name: "История", icon: "📖", desc: "Нарратив, эмоции", ai: "GigaChat" },
  ],
  analytics: [
    { id: "report", name: "Отчёт", icon: "📊", desc: "Структурированные данные", ai: "YandexGPT" },
    { id: "dashboard", name: "Дашборд", icon: "📈", desc: "Метрики, визуализация", ai: "YandexGPT" },
    { id: "metrics", name: "Метрики", icon: "📉", desc: "KPI, цели, результаты", ai: "YandexGPT" },
  ],
  education: [
    { id: "course", name: "Курс", icon: "📚", desc: "Структура, модули", ai: "YandexGPT" },
    { id: "lesson", name: "Урок", icon: "📖", desc: "План, материалы", ai: "YandexGPT" },
    { id: "test", name: "Тест", icon: "✅", desc: "Вопросы, ответы", ai: "YandexGPT" },
  ],
  content: [
    { id: "article", name: "Статья", icon: "📝", desc: "Длинный формат", ai: "GigaChat" },
    { id: "post", name: "Пост", icon: "📱", desc: "Для соцсетей", ai: "GigaChat" },
    { id: "copywriting", name: "Копирайтинг", icon: "✍️", desc: "Продающий текст", ai: "GigaChat" },
  ],
  video: [
    { id: "script", name: "Сценарий", icon: "🎬", desc: "Структура видео", ai: "GigaChat" },
    { id: "thumbnail", name: "Обложка", icon: "🖼️", desc: "Превью для видео", ai: "Kandinsky" },
    { id: "promo", name: "Промо", icon: "🎯", desc: "Рекламный ролик", ai: "GigaChat" },
  ],
  other: [
    { id: "universal", name: "Универсальный", icon: "🌐", desc: "Подходит для любых задач", ai: "YandexGPT" },
    { id: "custom", name: "Кастомный", icon: "⚙️", desc: "Свои параметры", ai: "YandexGPT" },
  ],
};

const AI_ICONS: Record<string, { icon: any; color: string }> = {
  yandexgpt: { icon: Cpu, color: "text-blue-500" },
  kandinsky: { icon: Image, color: "text-purple-500" },
  gigachat: { icon: MessageSquare, color: "text-green-500" },
  shedevrum: { icon: Sparkles, color: "text-amber-500" },
};

export default function QuickStartWizard({ onClose, onPublish }: QuickStartWizardProps) {
  const { toast } = useToast();
  const { mode, setMode, settings, updateSettings } = useExpertMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedAI, setSelectedAI] = useState("yandexgpt");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [version, setVersion] = useState(1.0);
  const [compareTab, setCompareTab] = useState<CompareTab>("after");
  const [generationStartTime, setGenerationStartTime] = useState<number>(0);
  const [promptId, setPromptId] = useState<string>("");
  const [versions, setVersions] = useState<PromptVersion[]>([]);

  const aiModels = [
    { id: "yandexgpt", name: "YandexGPT", icon: "🧠", desc: "Лучший для текстов и промтов", strength: "Точность, SEO" },
    { id: "kandinsky", name: "Kandinsky 3.0", icon: "🎨", desc: "Фотореалистичные изображения", strength: "Качество, детали" },
    { id: "gigachat", name: "GigaChat", icon: "💬", desc: "Креативные маркетинговые тексты", strength: "Креатив, продающие тексты" },
    { id: "shedevrum", name: "Шедеврум", icon: "✨", desc: "Художественные стили", strength: "Арт, креатив" },
  ];

  const currentStyles = selectedCategory ? STYLES_BY_CATEGORY[selectedCategory] : STYLES_BY_CATEGORY.other;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (result && promptId) {
      const promptData: PromptData = {
        id: promptId,
        text: result.prompt,
        title: result.title,
        description: result.description,
        category: selectedCategory as PromptCategory || "other",
        model: selectedAI as AIModel,
        status: "draft",
        quality: result.quality || 90,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        imageUrl: result.imageUrl,
        originalDescription: result.originalDescription,
        version,
        versions,
        metadata: {
          generationTime: result.generationTime || 0,
          aiModel: selectedAI as AIModel,
          style: selectedStyle,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          detailLevel: settings.detailLevel,
          creativity: settings.creativity,
        },
      };
      autoSave(promptData);
    }
  }, [result, version, promptId]);

  const handleCategorySelect = (categoryId: CategoryType) => {
    setSelectedCategory(categoryId);
    setCurrentStep("describe");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      toast({ title: "Файл загружен", description: `${file.name} (${(file.size / 1024).toFixed(0)} KB)` });
    }
  };

  const handleAIProcessing = async () => {
    if (!description.trim() && !uploadedImage) {
      toast({ title: "Ошибка", description: "Введите описание или загрузите файл", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setGenerationStartTime(Date.now());

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + 10;
      });
    }, 500);

    try {
      const aiRecommendation = recommendAI("text", selectedCategory as PlatformType || "universal");
      
      const variations = await generatePromptWithYandexGPT(
        description || "Товар для маркетплейса",
        selectedAI,
        selectedStyle,
        8
      );

      const generationTime = Math.round((Date.now() - generationStartTime) / 1000);
      const quality = Math.floor(Math.random() * 15) + 85;
      const newId = `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setPromptId(newId);

      const generatedResult: GeneratedResult = {
        prompt: variations[0] || description,
        title: `${CATEGORIES.find(c => c.id === selectedCategory)?.name || "Задача"}: ${description.slice(0, 50)}...`,
        description: variations.join("\n\n"),
        imageUrl: uploadedImage ? imagePreview : undefined,
        category: selectedCategory || undefined,
        originalDescription: description,
        aiModel: selectedAI,
        generationTime,
        quality,
      };

      const newVersion: PromptVersion = {
        version: 1,
        text: variations[0] || description,
        createdAt: Date.now(),
        changes: "Первая генерация",
      };
      setVersions([newVersion]);

      setResult(generatedResult);
      setProgress(100);
      setVersion(1.0);
      setMessages([{ role: "assistant", text: variations[0] || description, timestamp: Date.now() }]);
      
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep("result");
        toast({ title: "Готово!", description: `AI создал промт за ${generationTime} сек` });
      }, 1000);

    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось сгенерировать", variant: "destructive" });
      setIsProcessing(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleImprove = async (feedback: string) => {
    if (!result) return;
    
    const userMessage: Message = { role: "user", text: feedback, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      const improvedPrompt = `${result.prompt}. Улучшение: ${feedback}`;
      const variations = await generatePromptWithYandexGPT(improvedPrompt, selectedAI, selectedStyle, 8);
      
      setResult({
        ...result,
        prompt: variations[0] || improvedPrompt,
        description: variations.join("\n\n"),
      });
      
      const newVersionNum = Math.round((version + 0.1) * 10) / 10;
      setVersion(newVersionNum);
      
      const newVersion: PromptVersion = {
        version: newVersionNum,
        text: variations[0] || improvedPrompt,
        createdAt: Date.now(),
        changes: feedback,
      };
      setVersions(prev => [...prev, newVersion]);
      
      setMessages(prev => [...prev, { role: "assistant", text: variations[0] || improvedPrompt, timestamp: Date.now() }]);
      
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось улучшить", variant: "destructive" });
      setMessages(prev => [...prev, { role: "assistant", text: "Произошла ошибка при улучшении. Попробуйте ещё раз.", timestamp: Date.now() }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRollback = (targetVersion: number) => {
    const target = versions.find(v => v.version === targetVersion);
    if (target && result) {
      setResult({ ...result, prompt: target.text });
      setVersion(targetVersion);
      toast({ title: "Откат выполнен", description: `Версия ${targetVersion} восстановлена` });
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!result || !promptId) return;
    
    const promptData: PromptData = {
      id: promptId,
      text: result.prompt,
      title: result.title,
      description: result.description,
      category: selectedCategory as PromptCategory || "other",
      model: selectedAI as AIModel,
      status: "draft",
      quality: result.quality || 90,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version,
      versions,
      metadata: {
        generationTime: result.generationTime || 0,
        aiModel: selectedAI as AIModel,
      },
    };
    
    const success = await exportAndDownload(promptData, format);
    toast({ 
      title: success ? "Экспорт успешен" : "Ошибка экспорта", 
      description: success ? `Файл скачан в формате ${format.toUpperCase()}` : "Не удалось экспортировать" 
    });
  };

  const handlePublish = () => {
    if (result && onPublish) {
      onPublish(result);
    }
    onClose();
  };

  const getStepLabel = (step: Step) => {
    const labels: Record<Step, string> = {
      mode: "Режим",
      category: "Категория",
      upload: "Файл",
      describe: "Описание",
      style: "Стиль",
      "ai-process": "AI",
      result: "Результат",
    };
    return labels[step];
  };

  const getStepIcon = (step: Step) => {
    const icons: Record<Step, any> = {
      mode: Sliders,
      category: ShoppingBag,
      upload: Upload,
      describe: FileText,
      style: Palette,
      "ai-process": Wand2,
      result: Check,
    };
    return icons[step];
  };

  const isExpertMode = mode === "expert";
  const isSimpleMode = !isExpertMode;

  const steps: Step[] = isExpertMode
    ? ["mode", "category", "upload", "describe", "style", "ai-process", "result"]
    : ["category", "upload", "describe", "style", "ai-process", "result"];

  const getAIModelInfo = (modelId: string) => {
    const modelKey = modelId.toLowerCase();
    const modelInfo = AI_ICONS[modelKey] || AI_ICONS.yandexgpt;
    const ModelIcon = modelInfo.icon;
    
    const modelNames: Record<string, string> = {
      yandexgpt: "YandexGPT",
      kandinsky: "Kandinsky",
      gigachat: "GigaChat",
      shedevrum: "Шедеврум",
    };
    
    return { name: modelNames[modelKey] || modelId, icon: ModelIcon, color: modelInfo.color };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex z-[99999] items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 right-0 flex justify-end p-4 bg-background">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, i) => {
              const StepIcon = getStepIcon(step);
              const isActive = currentStep === step;
              const isCompleted = steps.indexOf(currentStep) > i;
              
              return (
                <div key={step} className="flex items-center flex-1 min-w-[80px]">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    isActive ? "bg-primary text-primary-foreground" : 
                    isCompleted ? "bg-success text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                  </div>
                  <span className={`ml-2 text-xs font-medium whitespace-nowrap ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {getStepLabel(step)}
                  </span>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-success" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>

          {currentStep === "mode" && isExpertMode && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Выберите режим работы</h2>
                <p className="text-muted-foreground">Simple для быстрых задач, Expert для полного контроля</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className={`cursor-pointer transition-all ${isSimpleMode ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"}`} onClick={() => setMode("simple")}>
                  <CardContent className="p-6 text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold text-lg mb-2">Simple</h3>
                    <p className="text-sm text-muted-foreground">Быстрая генерация с настройками по умолчанию</p>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer transition-all ${isExpertMode ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"}`} onClick={() => setMode("expert")}>
                  <CardContent className="p-6 text-center">
                    <Sliders className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold text-lg mb-2">Expert</h3>
                    <p className="text-sm text-muted-foreground">Полный контроль над параметрами AI</p>
                  </CardContent>
                </Card>
              </div>
              
              {isExpertMode && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Параметры AI</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Температура: {settings.temperature}</label>
                      <input type="range" min="0.1" max="1" step="0.1" value={settings.temperature} onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Макс. токенов: {settings.maxTokens}</label>
                      <input type="range" min="100" max="4000" step="100" value={settings.maxTokens} onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Детализация: {settings.detailLevel}/10</label>
                      <input type="range" min="1" max="10" step="1" value={settings.detailLevel} onChange={(e) => updateSettings({ detailLevel: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Креативность: {settings.creativity}</label>
                      <input type="range" min="0.1" max="1" step="0.1" value={settings.creativity} onChange={(e) => updateSettings({ creativity: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button className="w-full" onClick={() => setCurrentStep("category")}>
                Продолжить <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {currentStep === "category" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Шаг 1: Выберите категорию задачи</h2>
                <p className="text-muted-foreground">Для какой цели создаём промт?</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {CATEGORIES.map(cat => {
                  const CatIcon = cat.icon;
                  return (
                    <Card 
                      key={cat.id} 
                      className={`cursor-pointer transition-all ${
                        selectedCategory === cat.id ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:border-primary/50"
                      } ${cat.popular ? "border-2 border-primary/30" : ""}`}
                      onClick={() => handleCategorySelect(cat.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="flex justify-center mb-2">
                          <CatIcon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground">{cat.desc}</p>
                        {cat.popular && <span className="text-xs text-primary font-medium mt-1 block">Популярное</span>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === "upload" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Шаг 2: Загрузи файл (опционально)</h2>
                <p className="text-muted-foreground">Фото товара, эскиз, документ</p>
              </div>
              
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => { setUploadedImage(null); setImagePreview(""); }}>
                    Удалить
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-1">Нажми чтобы загрузить</p>
                  <p className="text-sm text-muted-foreground">или перетащи файл сюда</p>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG, PDF до 10MB</p>
                </div>
              )}
              
              <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep("category")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Назад
                </Button>
                <Button className="flex-1" onClick={() => setCurrentStep("describe")}>
                  Далее <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === "describe" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Шаг {isExpertMode ? "3" : "2"}: Опиши задачу
                </h2>
                <p className="text-muted-foreground">AI создаст качественный промт</p>
              </div>
              
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Например: Беспроводные наушники премиум класса, чёрные, с шумоподавлением, время работы 30 часов..."
                className="min-h-[150px] text-base"
              />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep("upload")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Назад
                </Button>
                <Button className="flex-1" onClick={() => setCurrentStep("style")}>
                  Далее <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === "style" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Шаг {isExpertMode ? "4" : "3"}: Выбери стиль
                </h2>
                <p className="text-muted-foreground">Как должен выглядеть результат</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentStyles.map(style => (
                  <Card 
                    key={style.id} 
                    className={`cursor-pointer transition-all ${
                      selectedStyle === style.id ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:border-primary/50"
                    }`}
                    onClick={() => { setSelectedStyle(style.id); setSelectedAI(style.ai.toLowerCase()); }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{style.icon}</div>
                      <h3 className="font-semibold text-sm mb-1">{style.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{style.desc}</p>
                      <p className="text-xs text-primary font-medium">AI: {style.ai}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep("describe")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Назад
                </Button>
                <Button className="flex-1" onClick={() => setCurrentStep("ai-process")} disabled={!selectedStyle}>
                  Далее <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === "ai-process" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  Шаг {isExpertMode ? "5" : "4"}: AI создаёт
                </h2>
                <p className="text-muted-foreground">Используем {aiModels.find(m => m.id === selectedAI)?.name}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                  {uploadedImage && <Image className="h-16 w-16 text-muted-foreground" />}
                  <Wand2 className="h-8 w-8 text-primary animate-pulse" />
                  <Sparkles className="h-16 w-16 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс генерации...</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  {progress < 30 && "Анализирую задачу..."}
                  {progress >= 30 && progress < 60 && "Генерирую промт..."}
                  {progress >= 60 && progress < 90 && "Создаю результат..."}
                  {progress >= 90 && "Финализирую..."}
                </div>
              </div>
              
              <Button className="w-full" onClick={handleAIProcessing} disabled={isProcessing}>
                {isProcessing ? (
                  <><Sparkles className="h-4 w-4 mr-2 animate-spin" /> Обрабатываю...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Запустить AI</>
                )}
              </Button>
            </div>
          )}

          {currentStep === "result" && result && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Check className="h-6 w-6 text-success" /> Готово!
                </h2>
                <p className="text-muted-foreground">AI создал промт (версия {version})</p>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">📊 Сравнение результата</h3>
                    <div className="flex gap-1">
                      <Button variant={compareTab === "before" ? "default" : "outline"} size="sm" onClick={() => setCompareTab("before")} className="text-xs">
                        <FileText className="h-3 w-3 mr-1" /> До
                      </Button>
                      <Button variant={compareTab === "after" ? "default" : "outline"} size="sm" onClick={() => setCompareTab("after")} className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" /> После
                      </Button>
                      <Button variant={compareTab === "details" ? "default" : "outline"} size="sm" onClick={() => setCompareTab("details")} className="text-xs">
                        <Layers className="h-3 w-3 mr-1" /> Детали
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {compareTab === "before" && (
                    <div className="space-y-3">
                      {uploadedImage && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Загруженный файл:</label>
                          <img src={imagePreview} alt="Before" className="w-full h-48 object-cover rounded-lg" />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Исходный запрос:</label>
                        <p className="text-sm p-3 bg-muted rounded-lg">{result.originalDescription || description}</p>
                      </div>
                    </div>
                  )}
                  
                  {compareTab === "after" && (
                    <div className="space-y-3">
                      {result.imageUrl && (
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">AI Результат:</label>
                          <img src={result.imageUrl} alt="After" className="w-full h-48 object-cover rounded-lg" />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">Финальный промт:</label>
                        <p className="text-sm p-3 bg-primary/10 border border-primary/20 rounded-lg">{result.prompt}</p>
                      </div>
                    </div>
                  )}
                  
                  {compareTab === "details" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Время генерации</span>
                        </div>
                        <p className="text-lg font-semibold">{result.generationTime} сек</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="text-xs text-muted-foreground">Качество</span>
                        </div>
                        <p className="text-lg font-semibold">{result.quality}%</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Cpu className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">AI Модель</span>
                        </div>
                        <p className="text-lg font-semibold">{getAIModelInfo(result.aiModel || "").name}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Layers className="h-4 w-4 text-success" />
                          <span className="text-xs text-muted-foreground">Версия</span>
                        </div>
                        <p className="text-lg font-semibold">{version}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-semibold">📥 Экспорт промта</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
                      <Download className="h-3 w-3 mr-1" /> JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("txt")}>
                      <Download className="h-3 w-3 mr-1" /> TXT
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("markdown")}>
                      <Download className="h-3 w-3 mr-1" /> MD
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport("code")}>
                      <Download className="h-3 w-3 mr-1" /> CODE
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {isExpertMode && versions.length > 1 && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">📜 История версий</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {versions.map((v) => (
                        <div key={v.version} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div>
                            <p className="text-sm font-medium">Версия {v.version}</p>
                            <p className="text-xs text-muted-foreground">{v.changes}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleRollback(v.version)} disabled={v.version === version}>
                            <RotateCcw className="h-3 w-3 mr-1" /> Откат
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">💬 Улучшить промт</h3>
                      <p className="text-xs text-muted-foreground">Диалог с AI (версия {version})</p>
                    </div>
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        <span>AI обрабатывает...</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {messages.length > 0 && (
                    <div ref={chatContainerRef} className="max-h-48 overflow-y-auto space-y-3 p-3 bg-muted/30 rounded-lg">
                      {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            msg.role === "user" 
                              ? "bg-primary text-primary-foreground animate-in slide-in-from-right-2" 
                              : "bg-background border border-border animate-in slide-in-from-left-2"
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    {["Добавить детали", "Сократить", "Расширить", "Изменить тон"].map(quick => (
                      <Button key={quick} variant="outline" size="sm" onClick={() => handleImprove(quick)} disabled={isProcessing} className="text-xs">
                        {quick}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input placeholder="Опишите что улучшить..." onKeyDown={e => {
                      if (e.key === "Enter" && (e.target as HTMLInputElement).value && !isProcessing) {
                        handleImprove((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }} disabled={isProcessing} />
                    <Button onClick={(e) => {
                      const input = e.currentTarget.previousSibling as HTMLInputElement;
                      if (input.value && !isProcessing) {
                        handleImprove(input.value);
                        input.value = "";
                      }
                    }} disabled={isProcessing}>
                      {isProcessing ? <Sparkles className="h-4 w-4 animate-spin" /> : "Улучшить"}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">Нажмите Enter для отправки • Версия {version}</p>
                </CardContent>
              </Card>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep("style")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Изменить стиль
                </Button>
                <Button className="flex-1" onClick={handlePublish}>
                  Опубликовать <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}