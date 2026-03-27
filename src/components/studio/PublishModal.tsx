import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ShoppingCart, Share2, Check, Globe, Upload, Image, Video, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PublishModalProps {
  promptText: string;
  onClose: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video";
}

export default function PublishModal({ promptText, onClose }: PublishModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(promptText);
  const [price, setPrice] = useState(990);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
  const [selectedSocials, setSelectedSocials] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // ВСЕ маркетплейсы (6 платформ)
  const marketplaces = [
    { id: "wildberries", name: "Wildberries" },
    { id: "ozon", name: "Ozon" },
    { id: "yandex", name: "Яндекс.Маркет" },
    { id: "avito", name: "Avito" },
    { id: "lamoda", name: "Lamoda" },
    { id: "megamarket", name: "Мегамаркет" },
  ];

  // ВСЕ соцсети (4 платформы)
  const socials = [
    { id: "vk", name: "ВКонтакте" },
    { id: "telegram", name: "Telegram" },
    { id: "tenchat", name: "TenChat" },
    { id: "dzen", name: "Дзен" },
  ];

  // Загрузка файлов
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

    toast({
      title: "Файлы загружены",
      description: `${files.length} файл(ов) добавлено`,
    });
  };

  // Удаление файла
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // AI Генерация изображений
  const generateImages = async () => {
    if (!description) {
      toast({ title: "Ошибка", description: "Введите описание для генерации", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Имитация прогресса (здесь будет реальный вызов Kandinsky API)
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Здесь будет реальный вызов AI API для генерации изображений
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGenerationProgress(100);
      
      toast({
        title: "Генерация завершена",
        description: "Изображения созданы и добавлены",
      });
    } catch (error) {
      toast({
        title: "Ошибка генерации",
        description: "Не удалось создать изображения",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  const toggleMarketplace = (id: string) => {
    setSelectedMarketplaces(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSocial = (id: string) => {
    setSelectedSocials(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    if (!title) {
      toast({ title: "Ошибка", description: "Введите название", variant: "destructive" });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({ title: "Ошибка", description: "Загрузите хотя бы одно изображение", variant: "destructive" });
      return;
    }

    if (selectedMarketplaces.length === 0 && selectedSocials.length === 0) {
      toast({ title: "Ошибка", description: "Выберите хотя бы одну площадку", variant: "destructive" });
      return;
    }

    // Здесь будет реальный вызов AI Agent для публикации
    const platforms = [
      ...selectedMarketplaces.map(id => `Маркетплейс: ${marketplaces.find(m => m.id === id)?.name}`),
      ...selectedSocials.map(id => `Соцсеть: ${socials.find(s => s.id === id)?.name}`),
    ].join("\n");

    toast({
      title: "Публикация начата",
      description: `Площадки: ${selectedMarketplaces.length + selectedSocials.length}\nФайлов: ${uploadedFiles.length}`,
    });

    // Здесь будет реальный вызов AI Agent адаптеров
    // await publishToMarketplaces({ title, description, price, files: uploadedFiles, marketplaces: selectedMarketplaces });
    // await publishToSocials({ title, description, files: uploadedFiles, socials: selectedSocials });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Публикация контента</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Данные контента */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Название</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="mt-1" 
                placeholder="Например: Беспроводные наушники Premium"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Описание</label>
              <Textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="mt-1 min-h-[80px]" 
                placeholder="Описание товара или поста"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Цена (₽)</label>
              <Input 
                type="number" 
                value={price} 
                onChange={e => setPrice(Number(e.target.value))} 
                className="mt-1 w-32" 
              />
            </div>
          </div>

          {/* Загрузка и генерация файлов */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <label className="text-sm font-medium">Медиафайлы</label>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateImages}
                  disabled={isGenerating || !description}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {isGenerating ? "Генерация..." : "AI Генерация"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Загрузить
                </Button>
              </div>
            </div>

            {isGenerating && (
              <div className="mb-3">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  AI создаёт изображения по вашему описанию...
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {uploadedFiles.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {uploadedFiles.map(file => (
                  <Card key={file.id} className="relative group">
                    <CardContent className="p-2">
                      {file.type === "image" ? (
                        <img src={file.preview} alt="preview" className="w-full h-24 object-cover rounded" />
                      ) : (
                        <div className="w-full h-24 bg-muted rounded flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFile(file.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Upload className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Загрузите изображения или видео</p>
                  <p className="text-xs">или используйте AI генерацию</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Маркетплейсы */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-4 w-4" />
              <label className="text-sm font-medium">Маркетплейсы ({marketplaces.length})</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {marketplaces.map(mp => (
                <Card
                  key={mp.id}
                  className={`cursor-pointer transition-colors ${
                    selectedMarketplaces.includes(mp.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => toggleMarketplace(mp.id)}
                >
                  <CardContent className="py-3 flex items-center justify-between">
                    <span className="text-sm">{mp.name}</span>
                    {selectedMarketplaces.includes(mp.id) && <Check className="h-4 w-4 text-primary" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Соцсети */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Share2 className="h-4 w-4" />
              <label className="text-sm font-medium">Соцсети ({socials.length})</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {socials.map(social => (
                <Card
                  key={social.id}
                  className={`cursor-pointer transition-colors ${
                    selectedSocials.includes(social.id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => toggleSocial(social.id)}
                >
                  <CardContent className="py-3 flex items-center justify-between">
                    <span className="text-sm">{social.name}</span>
                    {selectedSocials.includes(social.id) && <Check className="h-4 w-4 text-primary" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Кнопка публикации */}
          <Button className="w-full" size="lg" onClick={handlePublish}>
            <Globe className="h-4 w-4 mr-2" />
            Опубликовать ({selectedMarketplaces.length + selectedSocials.length} площадок, {uploadedFiles.length} файлов)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
