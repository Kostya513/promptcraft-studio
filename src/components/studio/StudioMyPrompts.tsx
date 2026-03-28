import { useState, useEffect } from "react";
import {
  Plus, Search, Archive, BarChart3,
  Tag, MoreHorizontal, Star, Heart, FolderHeart, Trash2, Copy, Cpu, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPrompts, getDrafts, getFavorites, getHistory, StoredPrompt, HistoryItem } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import QuickStartWizard from "./QuickStartWizard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PromptData, AIModel, PromptStatus } from "@/types/prompt";

type SortKey = "date" | "sales" | "name";

const AI_ICONS: Record<string, { icon: any; color: string }> = {
  yandexgpt: { icon: Cpu, color: "text-blue-500" },
  kandinsky: { icon: FileText, color: "text-purple-500" },
  gigachat: { icon: Heart, color: "text-green-500" },
  shedevrum: { icon: Star, color: "text-amber-500" },
  custom: { icon: FileText, color: "text-muted-foreground" },
  manual: { icon: FileText, color: "text-muted-foreground" },
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

export function StudioMyPrompts() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<PromptStatus | "all">("all");      
  const [sort, setSort] = useState<SortKey>("date");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<StoredPrompt[]>([]);       
  const [favorites, setFavorites] = useState<StoredPrompt[]>([]); 
  const [allPrompts, setAllPrompts] = useState<StoredPrompt[]>([]);
  const [activeView, setActiveView] = useState<"prompts" | "favorites">("prompts");
  const [showQuickStart, setShowQuickStart] = useState(false);    
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadedDrafts = getDrafts();
    const loadedFavorites = getFavorites();
    const loadedPrompts = getPrompts();
    setDrafts(loadedDrafts);
    setFavorites(loadedFavorites);
    setAllPrompts(loadedPrompts);
    console.log("StudioMyPrompts загружен:", {
      drafts: loadedDrafts.length,
      favorites: loadedFavorites.length,
      prompts: loadedPrompts.length
    });
  }, []);

  const currentPrompts = activeView === "prompts" ? allPrompts : favorites;

  const filtered = currentPrompts
    .filter((p) => {
      if (filter === "all") return true;
      return true;
    })
    .filter((p) => !search || p.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "date") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sort === "sales") return (b.rating || 0) - (a.rating || 0);
      return a.text.localeCompare(b.text);
    });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("ru-RU", {      
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Скопировано", description: "Промт скопирован в буфер обмена" });
  };

  const handleDelete = (id: string) => {
    const newPrompts = allPrompts.filter(p => p.id !== id);
    localStorage.setItem('promptcraft_prompts', JSON.stringify(newPrompts));
    setAllPrompts(newPrompts);
    setDeleteConfirm(null);
    toast({ title: "Удалено", description: "Промт успешно удалён" });
  };

  const getModelDisplay = (model: string) => {
    const modelKey = model.toLowerCase();
    const modelInfo = AI_ICONS[modelKey] || AI_ICONS.custom;
    const ModelIcon = modelInfo.icon;
    
    const modelNames: Record<string, string> = {
      yandexgpt: "YandexGPT",
      kandinsky: "Kandinsky",
      gigachat: "GigaChat",
      shedevrum: "Шедеврум",
    };
    
    return { name: modelNames[modelKey] || "Неизвестно", icon: ModelIcon, color: modelInfo.color };
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {showQuickStart && <QuickStartWizard onClose={() => setShowQuickStart(false)} />}
      
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
                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(deleteConfirm)}>
                  Удалить
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="flex gap-2">
        <Button
          variant={activeView === "prompts" ? "default" : "outline"}
          onClick={() => setActiveView("prompts")}
          className="flex items-center gap-2"
        >
          <FolderHeart className="h-4 w-4" />
          Промты
          {allPrompts.length > 0 && <span className="text-xs">({allPrompts.length})</span>}
        </Button>
        <Button
          variant={activeView === "favorites" ? "default" : "outline"}
          onClick={() => setActiveView("favorites")}
          className="flex items-center gap-2"
        >
          <Heart className="h-4 w-4" />
          Избранное
          {favorites.length > 0 && <span className="text-xs">({favorites.length})</span>}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск промптов…"
            className="pl-9"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}    
          className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm sm:w-40 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="date">По дате</option>
          <option value="sales">По рейтингу</option>
          <option value="name">По названию</option>
        </select>
        <Button
          onClick={() => setShowQuickStart(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Создать
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Все" },
          { key: "draft", label: "Черновики" },
          { key: "published", label: "Опубликованные" },
          { key: "moderation", label: "На модерации" },
          { key: "archive", label: "Архив" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as PromptStatus | "all")}    
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <FolderHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {activeView === "favorites" ? "У вас нет избранных промтов" : "У вас ещё нет промтов"}
          </p>
          <Button onClick={() => setShowQuickStart(true)}>Создать первый промт</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const modelInfo = getModelDisplay(p.model || "custom");
            const ModelIcon = modelInfo.icon;
            
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className={`${modelInfo.color} border-current`}>
                          <ModelIcon className="h-3 w-3 mr-1" />
                          {modelInfo.name}
                        </Badge>
                        {p.rating && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs">{p.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {truncateText(p.text)}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span>✨ {p.quality}%</span>
                        {p.createdAt && <span>📅 {formatDate(p.createdAt)}</span>}
                        <span>📝 {p.text.length} символов</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">       
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