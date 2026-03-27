import { useState, useEffect } from "react";
import {
  Plus, Search, Pencil, Trash2, Archive, BarChart3,
  Download, Tag, MoreHorizontal, FileText, Eye, ShoppingCart,
  Star, Heart, FolderHeart
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPrompts, getDrafts, getFavorites, getHistory, StoredPrompt, HistoryItem } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PromptStatus = "published" | "draft" | "moderation" | "archive" | "all";

const statusLabels: Record<PromptStatus, string> = {
  published: "Опубликован",
  draft: "Черновик",
  moderation: "На модерации",
  archive: "В архиве",
  all: "Все",
};

const statusColors: Record<PromptStatus, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-muted text-muted-foreground",
  moderation: "bg-warning/10 text-warning",
  archive: "bg-muted text-muted-foreground",
  all: "bg-primary/10 text-primary",
};

type SortKey = "date" | "sales" | "name";

export function StudioMyPrompts() {
  const [filter, setFilter] = useState<PromptStatus>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState<StoredPrompt[]>([]);
  const [favorites, setFavorites] = useState<StoredPrompt[]>([]);
  const [allPrompts, setAllPrompts] = useState<StoredPrompt[]>([]);
  const [activeView, setActiveView] = useState<"prompts" | "favorites">("prompts");

  // Загрузка данных из localStorage
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
      if (filter === "draft") return true; // Все черновики
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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* View Tabs */}
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

      {/* Toolbar */}
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
        <Link
          to="/studio?tab=generator"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Создать
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as PromptStatus)}
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

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <FolderHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {activeView === "favorites" ? "У вас нет избранных промтов" : "У вас ещё нет промтов"}
          </p>
          <Link to="/studio?tab=generator">
            <Button>Создать первый промт</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{p.model}</Badge>
                      <Badge className={statusColors.draft}>Черновик</Badge>
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
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Качество: {p.quality}%</span>
                      {p.createdAt && <span>{formatDate(p.createdAt)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(p.text)}>
                      Копировать
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const newFavs = activeView === "favorites" 
                        ? favorites.filter(f => f.id !== p.id)
                        : [...favorites, { ...p, createdAt: Date.now() }];
                      localStorage.setItem('promptcraft_favorites', JSON.stringify(newFavs));
                      setFavorites(newFavs);
                    }}>
                      <Heart className={`h-4 w-4 ${activeView === "favorites" ? "fill-current text-red-500" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const filterTabs = [
  { key: "all", label: "Все" },
  { key: "draft", label: "Черновики" },
  { key: "published", label: "Опубликованные" },
  { key: "moderation", label: "На модерации" },
  { key: "archive", label: "Архив" },
];
