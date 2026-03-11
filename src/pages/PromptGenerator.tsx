import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Wand2, Copy, Star, Sparkles, Zap, RefreshCw, Play, Save, Heart,
  Upload, History, Trash2, ChevronRight, Check, X, ArrowRight,
  Lightbulb, Settings, Eye, Layers, Diff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ───
interface GeneratedPrompt {
  id: string;
  text: string;
  model: string;
  quality: number;
  rating: number | null;
}

interface HistoryItem {
  id: string;
  date: string;
  mode: string;
  model: string;
  input: string;
  results: GeneratedPrompt[];
}

interface Improvement {
  id: string;
  text: string;
  category: "structure" | "keywords" | "parameters" | "redundancy";
  applied: boolean;
}

// ─── Constants ───
const AI_MODELS = [
  { value: "midjourney_v6", label: "Midjourney v6.1", type: "image" },
  { value: "sdxl", label: "Stable Diffusion XL", type: "image" },
  { value: "dalle3", label: "DALL-E 3", type: "image" },
  { value: "gpt4", label: "GPT-4", type: "text" },
  { value: "claude", label: "Claude", type: "text" },
];

const STYLES = [
  "Фотореализм", "Цифровое искусство", "Минимализм", "Абстракция",
  "Винтаж", "Модерн", "Аниме", "Киберпанк", "Фэнтези", "Акварель",
];

const FORMATS = {
  image: [
    { value: "1:1", label: "Квадрат 1:1" },
    { value: "9:16", label: "Портрет 9:16" },
    { value: "16:9", label: "Ландшафт 16:9" },
    { value: "custom", label: "Свой формат" },
  ],
  text: [
    { value: "short", label: "Короткий" },
    { value: "medium", label: "Средний" },
    { value: "long", label: "Длинный" },
    { value: "detailed", label: "Детализированный" },
  ],
};

const EXAMPLE_PROMPTS = [
  "Создай киберпанк-город ночью с неоновыми вывесками",
  "Напиши описание товара для беспроводных наушников",
  "Сгенерируй логотип для кофейни в минималистичном стиле",
  "Создай промпт для анализа данных о продажах",
];

// ─── Mock generated results ───
function generateMockResults(model: string, input: string): GeneratedPrompt[] {
  const isImage = AI_MODELS.find(m => m.value === model)?.type === "image";
  const variations = isImage ? [
    `${input}, cinematic lighting, 8k resolution, highly detailed, photorealistic --ar 16:9 --v 6.1 --q 2`,
    `${input}, digital art style, vibrant colors, dramatic composition, trending on artstation --ar 16:9 --v 6.1`,
    `${input}, minimalist design, clean lines, soft gradients, professional photography --ar 16:9 --v 6.1 --style raw`,
  ] : [
    `You are an expert ${input}. Provide a comprehensive analysis with actionable insights. Structure your response with: 1) Executive Summary, 2) Key Findings, 3) Recommendations. Use data-driven reasoning and cite specific examples.`,
    `Act as a professional ${input}. Break down the topic into clear sections. For each section, provide: context, analysis, and practical application. Keep language concise and professional.`,
    `As a specialist in ${input}, create a detailed guide covering fundamentals to advanced concepts. Include real-world examples, common pitfalls, and best practices. Format with headers and bullet points.`,
  ];

  return variations.map((text, i) => ({
    id: `gen_${Date.now()}_${i}`,
    text,
    model,
    quality: 70 + Math.floor(Math.random() * 25),
    rating: null,
  }));
}

function generateImprovements(prompt: string): Improvement[] {
  return [
    { id: "i1", text: "Добавьте описание освещения для лучшей атмосферы", category: "keywords", applied: false },
    { id: "i2", text: "Оптимизируйте соотношение сторон для данной композиции", category: "parameters", applied: false },
    { id: "i3", text: "Уберите избыточные слова «красивый» и «потрясающий»", category: "redundancy", applied: false },
    { id: "i4", text: "Добавьте ссылку на стиль художника для консистентности", category: "structure", applied: false },
    { id: "i5", text: "Укажите разрешение и качество для детализации", category: "parameters", applied: false },
  ];
}

// ─── Main Component ───
export default function PromptGenerator({ embedded }: { embedded?: boolean } = {}) {
  const { toast } = useToast();
  const [mode, setMode] = useState("create");

  // Create mode state
  const [taskInput, setTaskInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("midjourney_v6");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("16:9");
  const [detailLevel, setDetailLevel] = useState([5]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedPrompt[]>([]);

  // Improve mode state
  const [improveInput, setImproveInput] = useState("");
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [improvedText, setImprovedText] = useState("");
  const [showImproveAnalysis, setShowImproveAnalysis] = useState(false);

  // Variations mode state
  const [variationInput, setVariationInput] = useState("");
  const [variations, setVariations] = useState<GeneratedPrompt[]>([]);

  // Test mode state
  const [testPrompt, setTestPrompt] = useState("");
  const [testModel, setTestModel] = useState("midjourney_v6");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testRating, setTestRating] = useState(0);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: "h1", date: "2025-03-02", mode: "create", model: "midjourney_v6", input: "Киберпанк город", results: [] },
    { id: "h2", date: "2025-03-01", mode: "improve", model: "gpt4", input: "Анализ рынка", results: [] },
    { id: "h3", date: "2025-02-28", mode: "variations", model: "sdxl", input: "Абстрактный фон", results: [] },
  ]);

  // Usage limits (mock)
  const dailyLimit = 5;
  const dailyUsed = 2;
  const testLimit = 0; // Free user
  const isPro = false;

  const currentModelType = AI_MODELS.find(m => m.value === selectedModel)?.type || "image";
  const formatOptions = FORMATS[currentModelType as keyof typeof FORMATS] || FORMATS.image;

  // ─── Generate ───
  const handleGenerate = () => {
    if (!taskInput || taskInput.length < 20) {
      toast({ title: "Ошибка", description: "Минимум 20 символов описания", variant: "destructive" });
      return;
    }
    if (dailyUsed >= dailyLimit && !isPro) {
      toast({ title: "Лимит достигнут", description: "Бесплатный лимит — 5 генераций в день. Перейдите на PRO.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const gen = generateMockResults(selectedModel, taskInput);
      setResults(gen);
      setIsGenerating(false);
      toast({ title: "Готово!", description: `Сгенерировано ${gen.length} вариантов` });
    }, 2000);
  };

  // ─── Improve ───
  const handleImprove = () => {
    if (!improveInput) return;
    const imps = generateImprovements(improveInput);
    setImprovements(imps);
    setImprovedText(improveInput);
    setShowImproveAnalysis(true);
  };

  const applyImprovement = (id: string) => {
    setImprovements(prev => prev.map(i => i.id === id ? { ...i, applied: true } : i));
    setImprovedText(prev => prev + " [улучшено]");
    toast({ title: "Улучшение применено" });
  };

  const applyAllImprovements = () => {
    setImprovements(prev => prev.map(i => ({ ...i, applied: true })));
    setImprovedText(improveInput + ", cinematic lighting, 8k, --ar 16:9 --q 2");
    toast({ title: "Все улучшения применены" });
  };

  // ─── Variations ───
  const handleVariations = () => {
    if (!variationInput) return;
    setIsGenerating(true);
    setTimeout(() => {
      const vars = generateMockResults(selectedModel, variationInput);
      setVariations(vars);
      setIsGenerating(false);
    }, 2000);
  };

  // ─── Test ───
  const handleTest = () => {
    if (!testPrompt) return;
    if (testLimit <= 0 && !isPro) {
      toast({ title: "Недоступно", description: "Тестирование доступно только PRO пользователям", variant: "destructive" });
      return;
    }
    setIsTesting(true);
    setTimeout(() => {
      setTestResult("Результат сгенерирован. Для реальных результатов подключите API ключ в настройках.");
      setIsTesting(false);
    }, 3000);
  };

  // ─── Actions ───
  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Скопировано" });
  };

  const saveToFavorites = (prompt: GeneratedPrompt) => {
    toast({ title: "Сохранено в избранное" });
  };

  const saveToDrafts = (prompt: GeneratedPrompt) => {
    toast({ title: "Сохранено в черновики Studio" });
  };

  const publishToMarket = (prompt: GeneratedPrompt) => {
    toast({ title: "Переход к публикации", description: "Заполните описание и цену" });
  };

  const rateResult = (promptId: string, rating: number) => {
    setResults(prev => prev.map(p => p.id === promptId ? { ...p, rating } : p));
    toast({ title: `Оценка: ${rating} ★` });
  };

  const clearHistory = () => {
    setHistory([]);
    toast({ title: "История очищена" });
  };

  const categoryLabel = (c: string) => {
    const m: Record<string, string> = { structure: "Структура", keywords: "Ключевые слова", parameters: "Параметры", redundancy: "Избыточность" };
    return m[c] || c;
  };

  return (
    <div className={embedded ? "space-y-6" : "max-w-6xl mx-auto space-y-6"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Wand2 className="h-6 w-6" />AI Генератор промптов</h1>
            <p className="text-muted-foreground text-sm">Создавайте, улучшайте и тестируйте промпты с помощью AI</p>
          </div>
          <div className="text-xs text-muted-foreground">
            {isPro ? <Badge>PRO</Badge> : <Badge variant="outline">{dailyUsed}/{dailyLimit} генераций сегодня</Badge>}
          </div>
        </div>
      )}
      {embedded && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Создавайте, улучшайте и тестируйте промпты с помощью AI</p>
          <div className="text-xs text-muted-foreground">
            {isPro ? <Badge>PRO</Badge> : <Badge variant="outline">{dailyUsed}/{dailyLimit} генераций</Badge>}
          </div>
        </div>
      )}

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="create"><Sparkles className="h-4 w-4 mr-1" />С нуля</TabsTrigger>
          <TabsTrigger value="improve"><Zap className="h-4 w-4 mr-1" />Улучшить</TabsTrigger>
          <TabsTrigger value="variations"><Layers className="h-4 w-4 mr-1" />Вариации</TabsTrigger>
          <TabsTrigger value="test"><Play className="h-4 w-4 mr-1" />Тест</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-1" />История</TabsTrigger>
        </TabsList>

        {/* ─── Create From Scratch ─── */}
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Task input */}
              <div>
                <label className="text-sm font-medium">Опишите, что хотите создать</label>
                <Textarea
                  placeholder="Опишите задачу минимум 20 символами..."
                  value={taskInput}
                  onChange={e => setTaskInput(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${taskInput.length < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                    {taskInput.length}/20 мин.
                  </span>
                </div>
              </div>

              {/* Example prompts */}
              <div>
                <label className="text-xs text-muted-foreground">Примеры:</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {EXAMPLE_PROMPTS.map((ex, i) => (
                    <Button key={i} size="sm" variant="outline" className="text-xs h-7" onClick={() => setTaskInput(ex)}>
                      {ex.slice(0, 40)}...
                    </Button>
                  ))}
                </div>
              </div>

              {/* Settings row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium">AI модель</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map(m => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label} <span className="text-muted-foreground text-xs ml-1">({m.type === "image" ? "Изображение" : "Текст"})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Стиль</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Выберите стиль" /></SelectTrigger>
                    <SelectContent>
                      {STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Формат</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {formatOptions.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Детализация: {detailLevel[0]}</label>
                  <Slider value={detailLevel} onValueChange={setDetailLevel} min={1} max={10} step={1} className="mt-3" />
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating || taskInput.length < 20} className="w-full">
                {isGenerating ? <><RefreshCw className="h-4 w-4 mr-1 animate-spin" />Генерация 5-10 сек...</> : <><Sparkles className="h-4 w-4 mr-1" />Сгенерировать</>}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Результаты ({results.length} вариантов)</h3>
              {results.map((r, idx) => (
                <Card key={r.id}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Вариант {idx + 1}</Badge>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary">{AI_MODELS.find(m => m.value === r.model)?.label}</Badge>
                        <Badge variant="outline">Качество: {r.quality}%</Badge>
                      </div>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg font-mono">{r.text}</pre>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyPrompt(r.text)}><Copy className="h-4 w-4 mr-1" />Копировать</Button>
                      <Button size="sm" variant="outline" onClick={() => { setImproveInput(r.text); setMode("improve"); }}><Zap className="h-4 w-4 mr-1" />Улучшить</Button>
                      <Button size="sm" variant="outline" onClick={() => { setTestPrompt(r.text); setMode("test"); }}><Play className="h-4 w-4 mr-1" />Тест</Button>
                      <Button size="sm" variant="outline" onClick={() => saveToDrafts(r)}><Save className="h-4 w-4 mr-1" />В черновики</Button>
                      <Button size="sm" variant="outline" onClick={() => saveToFavorites(r)}><Heart className="h-4 w-4 mr-1" />В избранное</Button>
                      <Button size="sm" onClick={() => publishToMarket(r)}><Upload className="h-4 w-4 mr-1" />Опубликовать</Button>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground mr-1">Оценка:</span>
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} onClick={() => rateResult(r.id, s)} className="p-0.5">
                          <Star className={`h-4 w-4 ${r.rating && s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Improve ─── */}
        <TabsContent value="improve" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Вставьте существующий промпт</label>
                <Textarea
                  placeholder="Вставьте промпт для анализа и улучшения..."
                  value={improveInput}
                  onChange={e => { setImproveInput(e.target.value); setShowImproveAnalysis(false); }}
                  className="mt-1 min-h-[120px]"
                />
                <div className="text-xs text-muted-foreground mt-1">{improveInput.length} символов</div>
              </div>
              <Button onClick={handleImprove} disabled={!improveInput}><Lightbulb className="h-4 w-4 mr-1" />Анализировать</Button>
            </CardContent>
          </Card>

          {showImproveAnalysis && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Рекомендации по улучшению</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {improvements.map(imp => (
                    <div key={imp.id} className={`flex items-center justify-between p-2 border rounded-lg ${imp.applied ? "bg-muted/50" : ""}`}>
                      <div className="flex items-center gap-2">
                        {imp.applied ? <Check className="h-4 w-4 text-primary" /> : <Lightbulb className="h-4 w-4 text-warning" />}
                        <div>
                          <div className="text-sm">{imp.text}</div>
                          <Badge variant="outline" className="text-xs mt-0.5">{categoryLabel(imp.category)}</Badge>
                        </div>
                      </div>
                      {!imp.applied && (
                        <Button size="sm" variant="outline" onClick={() => applyImprovement(imp.id)}>Применить</Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" onClick={applyAllImprovements} className="w-full mt-2">
                    <Check className="h-4 w-4 mr-1" />Применить все
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Diff className="h-4 w-4" />До / После</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Оригинал</label>
                    <pre className="text-xs whitespace-pre-wrap bg-muted/30 p-3 rounded-lg mt-1">{improveInput}</pre>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Улучшенный</label>
                    <pre className="text-xs whitespace-pre-wrap bg-primary/5 p-3 rounded-lg mt-1 border border-primary/20">{improvedText}</pre>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button size="sm" onClick={() => copyPrompt(improvedText)}><Copy className="h-4 w-4 mr-1" />Копировать</Button>
                  <Button size="sm" variant="outline" onClick={() => { setTestPrompt(improvedText); setMode("test"); }}><Play className="h-4 w-4 mr-1" />Тестировать</Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Variations ─── */}
        <TabsContent value="variations" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Введите промпт для вариаций</label>
                <Textarea
                  placeholder="Введите промпт, для которого нужны вариации..."
                  value={variationInput}
                  onChange={e => setVariationInput(e.target.value)}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div className="flex gap-3">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleVariations} disabled={!variationInput || isGenerating}>
                  {isGenerating ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Layers className="h-4 w-4 mr-1" />}
                  Сгенерировать вариации
                </Button>
              </div>
            </CardContent>
          </Card>

          {variations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {variations.map((v, idx) => (
                <Card key={v.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex justify-between">
                      Вариация {idx + 1}
                      <Badge variant="outline">{v.quality}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs whitespace-pre-wrap bg-muted/50 p-2 rounded-lg font-mono mb-3">{v.text}</pre>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => copyPrompt(v.text)}><Copy className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => saveToFavorites(v)}><Heart className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" onClick={() => saveToDrafts(v)}><Save className="h-3 w-3" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Test ─── */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Тестирование промпта</CardTitle>
              <CardDescription className="text-xs">
                {isPro ? "PRO: 10 тестов в день" : "Тестирование доступно только PRO пользователям"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Вставьте промпт для тестирования..."
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-3">
                <Select value={testModel} onValueChange={setTestModel}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={handleTest} disabled={!testPrompt || isTesting || (!isPro && testLimit <= 0)}>
                  {isTesting ? <><RefreshCw className="h-4 w-4 mr-1 animate-spin" />Генерация 30-60 сек...</> : <><Play className="h-4 w-4 mr-1" />Запустить тест</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {testResult && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Результат теста</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg text-sm">{testResult}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Оцените результат:</span>
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setTestRating(s)}>
                      <Star className={`h-5 w-5 ${s <= testRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!isPro && (
            <Card className="border-primary/30">
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Разблокируйте тестирование</div>
                  <div className="text-xs text-muted-foreground">PRO: безлимитные генерации + 10 тестов/день + приоритетная очередь</div>
                </div>
                <Button size="sm"><Zap className="h-4 w-4 mr-1" />Перейти на PRO</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Дополнительные генерации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded-lg">
                <div className="text-sm">50 генераций</div>
                <Button size="sm" variant="outline">100 ₽</Button>
              </div>
              <div className="flex items-center justify-between p-2 border rounded-lg">
                <div className="text-sm">10 тестов</div>
                <Button size="sm" variant="outline">50 ₽</Button>
              </div>
              <div className="text-xs text-muted-foreground">Покупки не имеют срока действия</div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── History ─── */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Автосохранение 30 дней</div>
            <Button size="sm" variant="outline" onClick={clearHistory}><Trash2 className="h-4 w-4 mr-1" />Очистить</Button>
          </div>
          {history.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">История пуста</CardContent></Card>
          ) : (
            history.map(h => (
              <Card key={h.id}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{h.input}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{h.mode === "create" ? "С нуля" : h.mode === "improve" ? "Улучшение" : "Вариации"}</Badge>
                      <Badge variant="secondary">{AI_MODELS.find(m => m.value === h.model)?.label}</Badge>
                      <span className="text-xs text-muted-foreground">{h.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setTaskInput(h.input); setMode("create"); }}><RefreshCw className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setHistory(prev => prev.filter(x => x.id !== h.id)); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
