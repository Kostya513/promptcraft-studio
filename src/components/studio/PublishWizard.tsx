import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ShoppingCart, Share2, Check, Globe, Upload, Image, Video, Trash2, Sparkles, ArrowRight, ArrowLeft, FileText, Edit3, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface PublishWizardProps {
  promptText: string;
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
}

type Step = "prompt" | "content" | "media" | "edit" | "platforms" | "publish";

const STEPS: { id: Step; label: string; icon: any }[] = [
  { id: "prompt", label: "Промт", icon: FileText },
  { id: "content", label: "Контент", icon: Edit3 },
  { id: "media", label: "Медиа", icon: Image },
  { id: "edit", label: "Правки", icon: Edit3 },
  { id: "platforms", label: "Площадки", icon: Globe },
  { id: "publish", label: "Публикация", icon: Send },
];

export default function PublishWizard({ promptText, onClose }: PublishWizardProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Состояния
  const [currentStep, setCurrentStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState(promptText);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(990);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [selectedSocials, setSelectedSocials] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  // Данные
  const marketplaces = [
    { id: "wildberries", name: "Wildberries" },
    { id: "ozon", name: "Ozon" },
    { id: "yandex", name: "Яндекс.Маркет" },
    { id: "avito", name: "Avito" },
    { id: "lamoda", name: "Lamoda" },
    { id: "megamarket", name: "Мегамаркет" },
  ];

  const socials = [
    { id: "vk", name: "ВКонтакте" },
    { id: "telegram", name: "Telegram" },
    { id: "tenchat", name: "TenChat" },
    { id: "dzen", name: "Дзен" },
  ];

  // Навигация
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);
  const totalSteps = STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const nextStep = () => {
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx < totalSteps - 1) {
      setCurrentStep(STEPS[idx + 1].id);
    }
  };

  const prevStep = () => {
    const idx = STEPS.findIndex(s => s.id === currentStep);
    if (idx > 0) {
      setCurrentStep(STEPS[idx - 1].id);
    }
  };

  // Шаг 1: Промт
  const handlePromptSubmit = () => {
    if (!prompt.trim()) {
      toast({ title: "Ошибка", description: "Введите промт", variant: "destructive" });
      return;
    }
    // AI генерация контента на основе промта
    const generatedTitle = `Товар: ${prompt.slice(0, 50)}...`;
    const generatedDescription = prompt;
    setTitle(generatedTitle);
    setDescription(generatedDescription);
    nextStep();
  };

  // Шаг 2: Контент (уже сгенерирован, можно править)
  const handleContentSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Ошибка", description: "Заполните название и описание", variant: "destructive" });
      return;
    }
    nextStep();
  };

  // Шаг 3: Медиа
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (isImage || isVideo) {
        const preview = URL.createObjectURL(file);
        setUploadedFiles(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          type: isImage ? "image" : "video",
        }]);
      }
    });
    toast({ title: "Файлы загружены", description: `${files.length} файл(ов) добавлено` });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const generateImages = async () => {
    if (!description) {
      toast({ title: "Ошибка", description: "Введите описание для генерации", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    setGenerationProgress(0);
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + 10;
      });
    }, 300);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGenerationProgress(100);
      toast({ title: "Генерация завершена", description: "Изображения созданы" });
    } catch (error) {
      toast({ title: "Ошибка генерации", description: "Не удалось создать изображения", variant: "destructive" });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const handleMediaSubmit = () => {
    if (uploadedFiles.length === 0) {
      toast({ title: "Ошибка", description: "Загрузите хотя бы одно изображение", variant: "destructive" });
      return;
    }
    nextStep();
  };

  // Шаг 4: Правки (финальное редактирование)
  const handleEditSubmit = () => {
    if (!title.trim()) {
      toast({ title: "Ошибка", description: "Введите название", variant: "destructive" });
      return;
    }
    nextStep();
  };

  // Шаг 5: Площадки
  const toggleMarketplace = (id: string) => {
    setSelectedMarketplaces(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSocial = (id: string) => {
    setSelectedSocials(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handlePlatformsSubmit = () => {
    if (selectedMarketplaces.length === 0 && selectedSocials.length === 0) {
      toast({ title: "Ошибка", description: "Выберите хотя бы одну площадку", variant: "destructive" });
      return;
    }
    nextStep();
  };

  // Шаг 6: Публикация
  const handlePublish = async () => {
    setIsPublishing(true);
    // Здесь будет реальный вызов AI Agent
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast({
      title: "Публикация завершена",
      description: `Опубликовано на ${selectedMarketplaces.length + selectedSocials.length} площадках`,
    });
    setIsPublishing(false);
    onClose();
  };

  // Рендер шага
  const renderStep = () => {
    switch (currentStep) {
      case "prompt":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Шаг 1: Создайте промт</h3>
              <p className="text-sm text-muted-foreground">Опишите что хотите создать</p>
            </div>
            <div>
              <label className="text-sm font-medium">Промт</label>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="mt-1 min-h-[120px]"
                placeholder="Например: Создай карточку товара беспроводные наушники премиум класса..."
              />
            </div>
            <Button className="w-full" onClick={handlePromptSubmit}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Далее: Генерация контента
            </Button>
          </div>
        );

      case "content":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Edit3 className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Шаг 2: Контент</h3>
              <p className="text-sm text-muted-foreground">AI создал текст на основе промта</p>
            </div>
            <div>
              <label className="text-sm font-medium">Название</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 min-h-[100px]" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Назад
              </Button>
              <Button className="flex-1" onClick={handleContentSubmit}>
                Далее <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "media":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Image className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Шаг 3: Медиафайлы</h3>
              <p className="text-sm text-muted-foreground">Загрузите или сгенерируйте изображения</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={generateImages} disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Генерация..." : "AI Генерация"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Загрузить
              </Button>
            </div>
            {isGenerating && <Progress value={generationProgress} className="h-2" />}
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFileUpload} className="hidden" />
            {uploadedFiles.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {uploadedFiles.map(file => (
                  <Card key={file.id} className="relative group">
                    <CardContent className="p-2">
                      {file.type === "image" ? (
                        <img src={file.preview} alt="preview" className="w-full h-20 object-cover rounded" />
                      ) : (
                        <div className="w-full h-20 bg-muted rounded flex items-center justify-center">
                          <Video className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <Button variant="destructive" size="sm" className="absolute top-1 right-1 h-5 w-5 p-0" onClick={() => removeFile(file.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-6 text-center text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Нет файлов</p>
                </CardContent>
              </Card>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Назад
              </Button>
              <Button className="flex-1" onClick={handleMediaSubmit}>
                Далее <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "edit":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Edit3 className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Шаг 4: Финальные правки</h3>
              <p className="text-sm text-muted-foreground">Проверьте и отредактируйте данные</p>
            </div>
            <div>
              <label className="text-sm font-medium">Название</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 min-h-[80px]" />
            </div>
            <div>
              <label className="text-sm font-medium">Цена (₽)</label>
              <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="mt-1 w-32" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Назад
              </Button>
              <Button className="flex-1" onClick={handleEditSubmit}>
                Далее <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "platforms":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Globe className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Шаг 5: Выберите площадки</h3>
              <p className="text-sm text-muted-foreground">Где опубликовать контент</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4" />
                <label className="text-sm font-medium">Маркетплейсы</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {marketplaces.map(mp => (
                  <Card key={mp.id} className={`cursor-pointer ${selectedMarketplaces.includes(mp.id) ? "border-primary bg-primary/5" : ""}`} onClick={() => toggleMarketplace(mp.id)}>
                    <CardContent className="py-2 flex items-center justify-between">
                      <span className="text-sm">{mp.name}</span>
                      {selectedMarketplaces.includes(mp.id) && <Check className="h-4 w-4 text-primary" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="h-4 w-4" />
                <label className="text-sm font-medium">Соцсети</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {socials.map(social => (
                  <Card key={social.id} className={`cursor-pointer ${selectedSocials.includes(social.id) ? "border-primary bg-primary/5" : ""}`} onClick={() => toggleSocial(social.id)}>
                    <CardContent className="py-2 flex items-center justify-between">
                      <span className="text-sm">{social.name}</span>
                      {selectedSocials.includes(social.id) && <Check className="h-4 w-4 text-primary" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Назад
              </Button>
              <Button className="flex-1" onClick={handlePlatformsSubmit}>
                Далее <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case "publish":
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Send className="h-12 w-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Шаг 6: Публикация</h3>
              <p className="text-sm text-muted-foreground">Финальная проверка</p>
            </div>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Название:</span>
                  <span className="text-sm font-medium">{title.slice(0, 40)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Файлов:</span>
                  <span className="text-sm font-medium">{uploadedFiles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Площадки:</span>
                  <span className="text-sm font-medium">{selectedMarketplaces.length + selectedSocials.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Цена:</span>
                  <span className="text-sm font-medium">{price} ₽</span>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={prevStep} disabled={isPublishing}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Назад
              </Button>
              <Button className="flex-1" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? "Публикация..." : "Опубликовать"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <CardTitle>Публикация контента</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Шаг {currentStepIndex + 1} из {totalSteps}</span>
              <span>{STEPS.find(s => s.id === currentStep)?.label}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
}
