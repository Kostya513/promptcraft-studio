import { useState } from "react";
import { Search, SlidersHorizontal, Grid3X3, List } from "lucide-react";
import { PromptCard } from "@/components/PromptCard";

const formatFilters = ["Все", "Текст", "Картинки", "Видео", "Подкасты", "3D", "Код"];
const platformFilters = ["Все", "WB", "Ozon", "VK", "Telegram", "YouTube", "Сайт"];
const levelFilters = ["Все", "Новичок", "Продвинутый", "Эксперт", "Агент"];
const sortOptions = ["Популярные", "Новые", "По рейтингу", "По моим интересам"];

const mockResults = [
  { id: "1", title: "Карточка товара для WB", description: "SEO‑заголовок и описание для Wildberries", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop", tags: ["WB", "Карточки"], rating: 4.8, likes: 342, views: 2100, author: "MarketPro" },
  { id: "2", title: "SEO‑статья для блога", description: "Длинная SEO‑статья с ключевыми словами", image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=225&fit=crop", tags: ["Статьи", "SEO"], rating: 4.6, likes: 218, views: 1540, author: "ContentKing" },
  { id: "3", title: "Баннер VK — Midjourney", description: "Рекламные баннеры для VK", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop", tags: ["VK", "Картинки"], rating: 4.9, likes: 512, views: 3200, author: "DesignLab" },
  { id: "4", title: "Сценарий YouTube‑ролика", description: "Структурированный сценарий видео", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop", tags: ["YouTube", "Видео"], rating: 4.5, likes: 178, views: 980, author: "VideoGuru" },
  { id: "6", title: "Описание товара для Ozon", description: "Оптимизированное описание для карточки Ozon", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=225&fit=crop", tags: ["Ozon", "Карточки"], rating: 4.4, likes: 95, views: 620, author: "OzonSeller" },
];

export default function SearchCatalog() {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Поиск промптов</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Искать по названию, описанию, тегам..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-colors ${
            showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-card rounded-xl border border-border p-4 mb-4 space-y-4 animate-slide-up">
          <div>
            <h3 className="text-sm font-medium mb-2">Формат</h3>
            <div className="flex flex-wrap gap-2">
              {formatFilters.map((f) => (
                <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Платформа</h3>
            <div className="flex flex-wrap gap-2">
              {platformFilters.map((f) => (
                <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Уровень</h3>
            <div className="flex flex-wrap gap-2">
              {levelFilters.map((f) => (
                <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sort + view toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 text-sm overflow-x-auto">
          {sortOptions.map((s) => (
            <button key={s} className="text-muted-foreground hover:text-foreground whitespace-nowrap transition-colors">
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {mockResults.map((p) => (
          <PromptCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}
