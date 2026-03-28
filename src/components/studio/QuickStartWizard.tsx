import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Sparkles, Check, ArrowRight, ArrowLeft, Image, FileText, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePromptWithYandexGPT } from "@/lib/ai-api";

interface QuickStartWizardProps {
  onClose: () => void;
  onPublish?: (data: any) => void;
}

type Step = "upload" | "describe" | "style" | "ai-process" | "result";

interface GeneratedResult {
  prompt: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function QuickStartWizard({ onClose, onPublish }: QuickStartWizardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedAI, setSelectedAI] = useState("yandexgpt");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);

  // Стили для маркетплейсов (как в Aidentika, но лучше)
  const styles = [
    { id: "studio", name: "Студия", icon: "���", desc: "Профессиональное освещение, чистый фон", ai: "Kandinsky" },
    { id: "interior", name: "Интерьер", icon: "���", desc: "В домашней обстановке, lifestyle", ai: "Kandinsky" },
    { id: "infographic", name: "Инфографика", icon: "���", desc: "С текстами и преимуществами", ai: "Kandinsky" },
    { id: "composition", name: "Композиция", icon: "���", desc: "Художественная подача", ai: "Шедеврум" },
    { id: "catalog", name: "Каталог", icon: "���", desc: "Минимализм для WB/Ozon", ai: "Kandinsky" },
    { id: "social", name: "Соцсети", icon: "���", desc: "Для VK/Telegram постов", ai: "Шедеврум" },
  ];

  // AI модели с описанием сильных сторон
  const aiModels = [
    { id: "yandexgpt", name: "YandexGPT", icon: "���", desc: "Лучший для текстов и промтов", strength: "Точность, SEO" },
    { id: "kandinsky", name: "Kandinsky 3.0", icon: "���", desc: "Фотореалистичные изображения", strength: "Качество, детали" },
    { id: "gigachat", name: "GigaChat", icon: "���", desc: "Креативные маркетинговые тексты", strength: "Креатив, продающие тексты" },
    { id: "shedevrum", name: "Шедеврум", icon: "✨", desc: "Художественные стили", strength: "Арт, креатив" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      toast({ title: "Фото загружено", description: `${file.name} (${(file.size / 1024).toFixed(0)} KB)` });
    }
  };

  const handleAIProcessing = async () => {
    if (!description.trim() && !uploadedImage) {
      toast({ title: "Ошибка", description: "Загрузите фото или введите описание", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Имитация прогресса (в реальности — опрос API)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      // Шаг 1: Генерация промта через YandexGPT
      const variations = await generatePromptWithYandexGPT(
        description || "Товар для маркетплейса",
        selectedAI,
        selectedStyle,
        8
      );

      // Шаг 2: Формируем результат
      const generatedResult: GeneratedResult = {
        prompt: variations[0] || description,
        title: `Товар: ${description.slice(0, 50)}...`,
        description: variations.join("\n\n"),
        imageUrl: uploadedImage ? imagePreview : undefined,
      };

      setResult(generatedResult);
      setProgress(100);
      
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep("result");
        toast({ 
          title: "Готово!", 
          description: `AI создал промт за ~1 минуту`,
        });
      }, 1000);

    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось сгенерировать", variant: "destructive" });
      setIsProcessing(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handlePublish = () => {
    if (result && onPublish) {
      onPublish(result);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {["Фото", "Описание", "Стиль", "AI", "Результат"].map((label, i) => {
              const stepNum = i + 1;
              const isActive = currentStep === ["upload", "describe", "style", "ai-process", "result"][i] as Step;
              const isCompleted = ["upload", "describe", "style", "ai-process", "result"].indexOf(currentStep) > i;
              
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    isActive ? "bg-primary text-primary-foreground" : 
                    isCompleted ? "bg-success text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={`ml-2 text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {i < 4 && <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-success" : "bg-muted"}`} />}
                </div>
              );
            })}
          </div>

          {/* STEP 1: Upload Photo */}
          {currentStep === "upload" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Шаг 1: Загрузи фото товара</h2>
                <p className="text-muted-foreground">Подойдёт фото со смартфона или компьютера</p>
              </div>
              
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => { setUploadedImage(null); setImagePreview(""); }}
                  >
                    Удалить
                  </Button>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-1">Нажми чтобы загрузить</p>
                  <p className="text-sm text-muted-foreground">или перетащи файл сюда</p>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG до 10MB</p>
                </div>
              )}
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>Отмена</Button>
                <Button className="flex-1" onClick={() => setCurrentStep("describe")}>
                  Далее <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Describe */}
          {currentStep === "describe" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Шаг 2: Опиши товар</h2>
                <p className="text-muted-foreground">AI создаст продающее описание и промт</p>
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

          {/* STEP 3: Choose Style */}
          {currentStep === "style" && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Шаг 3: Выбери стиль</h2>
                <p className="text-muted-foreground">Как должен выглядеть результат</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {styles.map(style => (
                  <Card 
                    key={style.id} 
                    className={`cursor-pointer transition-all ${
                      selectedStyle === style.id ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
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

          {/* STEP 4: AI Processing */}
          {currentStep === "ai-process" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Шаг 4: AI создаёт</h2>
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
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  {progress < 30 && "Анализирую товар..."}
                  {progress >= 30 && progress < 60 && "Генерирую промт..."}
                  {progress >= 60 && progress < 90 && "Создаю визуал..."}
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

          {/* STEP 5: Result */}
          {currentStep === "result" && result && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                  <Check className="h-6 w-6 text-success" /> Готово!
                </h2>
                <p className="text-muted-foreground">AI создал промт и визуализацию</p>
              </div>
              
              <div className="space-y-4">
                {result.imageUrl && (
                  <div className="relative">
                    <img src={result.imageUrl} alt="Result" className="w-full h-64 object-cover rounded-lg" />
                  </div>
                )}
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Сгенерированный промт:</label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{result.prompt}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Описание:</label>
                      <p className="text-sm mt-1 p-3 bg-muted rounded-lg whitespace-pre-line">{result.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
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
