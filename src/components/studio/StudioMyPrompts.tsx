import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Copy, Trash2, Cpu, FileText, Star, Heart, Zap, Download, Share2
} from "lucide-react";
import { getPrompts, deletePrompt, StoredPrompt } from "@/lib/local-storage";
import { getAutoSaves } from "@/lib/auto-save";
import { Button } from "@/components/ui/button";
import QuickStartWizard from "./QuickStartWizard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PromptData, AIModel, PromptStatus, PromptCategory } from "@/types/prompt";

type SortKey = "date" | "sales" | "name";

const AI_ICONS: Record<string, { icon: any; color: string }> = {
  yandexgpt: { icon: Cpu, color: "text-blue-500" },
  kandinsky: { icon: FileText, color: "text-purple-500" },
  gigachat: { icon: Heart, color: "text-green-500" },
  shedevrum: { icon: Star, color: "text-amber-500" },
  custom: { icon: FileText, color: "text-muted-foreground" },
};

const statusLabels: Record<PromptStatus, string> = {
  draft: "Черновик",
  published: "Опубликован",
  moderation: "На модерации",
  archived: "В архиве",
};

const statusColors: Record<PromptStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-success/10 text-success",
  moderation: "bg-warning/10 text-warning",
  archived: "bg-muted text-muted-foreground",
};

const toPromptData = (p: StoredPrompt): PromptData => ({
  id: p.id || `tmp-${Date.now()}`,
  text: p.text || "",
  title: p.category || "Без названия",
  description: "",
  category: (p.category as PromptCategory) || "other",
  model: (p.model as AIModel) || "custom",
  status: "draft",
  quality: p.quality || 0,
  createdAt: p.createdAt || Date.now(),
  updatedAt: p.createdAt || Date.now(),
  version: 1,
  versions: [],
  metadata: { generationTime: 0, aiModel: (p.model as AIModel) || "yandexgpt" },
});

export function StudioMyPrompts() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PromptStatus | "all">("all");      
  const [sort, setSort] = useState<SortKey>("date");
  const [search, setSearch] = useState("");
  const [allPrompts, setAllPrompts] = useState<PromptData[]>([]);
  const [showQuickStart, setShowQuickStart] = useState(false);    
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = () => {
      try {
        const storedPrompts = getPrompts();
        let promptsData = storedPrompts.map(toPromptData);

        const autoSaves = getAutoSaves();
        autoSaves.forEach(save => {
          if (!save?.data?.id) return;
          const existingIndex = promptsData.findIndex(p => p.id === save.data.id);
          if (existingIndex >= 0) promptsData[existingIndex] = save.data;
          else promptsData.unshift(save.data);
        });

        const validPrompts = promptsData.filter(p => p && p.id && p.text !== undefined);
        setAllPrompts(validPrompts);
      } catch (error) {
        console.error("❌ Ошибка загрузки:", error);
        setAllPrompts([]);
      }
    };
    loadAllData();
  }, []);

  const filtered = allPrompts
    .filter((p) => {
      if (!p) return false;
      if (filter === "all") return true;
      return p.status === filter;
    })
    .filter((p) => {
      if (!p || !search.trim()) return true;
      const q = search.toLowerCase();
      return (p.text || "").toLowerCase().includes(q) || (p.title || "").toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "date") return (b?.createdAt || 0) - (a?.createdAt || 0);
      if (sort === "sales") return (b?.quality || 0) - (a?.quality || 0);
      return (a?.title || "").localeCompare(b?.title || "");
    });

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
  };

  const truncateText = (text: string | undefined, maxLength: number = 120) => {
    if (!text) return "";
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
  };

  const handleCopy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "✅ Скопировано" });
    } catch {
      toast({ title: "❌ Ошибка", variant: "destructive" });
    }
  };

  const performDelete = (id: string) => {
    try {
      deletePrompt(id);
      const autoSaves = getAutoSaves();
      const filtered = autoSaves.filter(s => s.promptId !== id);
      if (filtered.length !== autoSaves.length) {
        localStorage.setItem("promptcraft_autosave", JSON.stringify(filtered));
      }
      
      setAllPrompts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
      toast({ title: "🗑️ Удалено" });
    } catch {
      toast({ title: "❌ Ошибка", variant: "destructive" });
    }
  };

  const handleDownloadPrompt = (prompt: PromptData) => {
    const exportData = {
      type: "prompt",
      version: "1.0",
      exported_at: new Date().toISOString(),
      data: {
        id: prompt.id,
        text: prompt.text,
        title: prompt.title,
        description: prompt.description,
        category: prompt.category,
        model: prompt.model,
        status: prompt.status,
        quality: prompt.quality,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
        metadata: prompt.metadata,
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${(prompt.title || "untitled").replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "⬇️ Промт скачан" });
  };

  // 🔹 НОВАЯ ФУНКЦИЯ ПУБЛИКАЦИИ - прямой переход на страницу публикации
  const handlePublishPrompt = (prompt: PromptData) => {
    navigate('/publish', { state: { prompt } });
  };

  const getModelDisplay = (model?: string) => {
    const modelKey = (model || "").toLowerCase();
    const modelInfo = AI_ICONS[modelKey] || AI_ICONS.custom;
    const modelNames: Record<string, string> = {
      yandexgpt: "YandexGPT", kandinsky: "Kandinsky", gigachat: "GigaChat", shedevrum: "Шедеврум",
    };
    return { name: modelNames[modelKey] || "AI", icon: modelInfo.icon, color: modelInfo.color };
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {showQuickStart && (
        <QuickStartWizard 
          onClose={() => setShowQuickStart(false)}
          onPublish={() => {
            setShowQuickStart(false);
            const updated = getPrompts();
            setAllPrompts(updated.map(toPromptData));
            toast({ title: "✅ Создано" });
          }}
        />
      )}
      
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <Trash2 className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Удалить промт?</h3>
                <p className="text-sm text-muted-foreground">Это действие нельзя отменить</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                  Отмена
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => performDelete(deleteConfirm)}>
                  Удалить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Мои промты</h3>
          <p className="text-sm text-muted-foreground">Создавайте и управляйте промтами</p>
        </div>
        <Button onClick={() => setShowQuickStart(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Создать
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..." className="pl-9" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm sm:w-40">
          <option value="date">По дате</option>
          <option value="sales">По качеству</option>
          <option value="name">По названию</option>
        </select>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {[{ key: "all", label: "Все" }, { key: "draft", label: "Черновики" }, { key: "published", label: "Опубликованные" }, { key: "moderation", label: "На модерации" }, { key: "archived", label: "Архив" }].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key as PromptStatus | "all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === tab.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{search ? "Ничего не найдено" : "У вас ещё нет промтов"}</p>
          {!search && <Button onClick={() => setShowQuickStart(true)}>Создать первый</Button>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            if (!p) return null;
            const modelInfo = getModelDisplay(p.model);
            const ModelIcon = modelInfo.icon;
            const textLength = (p.text || "").length;
            const canPublish = p.status !== "published";
            
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={`${modelInfo.color} border-current`}>
                          <ModelIcon className="h-3 w-3 mr-1" /> {modelInfo.name}
                        </Badge>
                        <Badge variant="outline" className={statusColors[p.status]}>
                          {statusLabels[p.status]}
                        </Badge>
                        {p.quality ? <span className="text-xs text-amber-500">✨ {p.quality}%</span> : null}
                      </div>
                      <h4 className="font-medium mb-1 truncate">{p.title || "Без названия"}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{truncateText(p.text)}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span> {formatDate(p.createdAt)}</span>
                        <span>📝 {textLength} симв.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canPublish && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handlePublishPrompt(p)} 
                          title="Опубликовать в Market"
                          className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDownloadPrompt(p)} 
                        title="Скачать JSON"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleCopy(p.text)} title="Копировать">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(p.id)} title="Удалить" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}