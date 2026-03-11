import { useState } from "react";
import {
  Plus, Search, Pencil, Trash2, Archive, BarChart3,
  Download, Tag, MoreHorizontal, FileText, Eye, ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";

type PromptStatus = "published" | "draft" | "moderation" | "archive";

interface StudioPrompt {
  id: string;
  title: string;
  status: PromptStatus;
  tags: string[];
  sales7d: number;
  totalSales: number;
  views: number;
  price: number | null;
  createdAt: string;
}

const statusLabels: Record<PromptStatus, string> = {
  published: "Опубликован",
  draft: "Черновик",
  moderation: "На модерации",
  archive: "В архиве",
};

const statusColors: Record<PromptStatus, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-muted text-muted-foreground",
  moderation: "bg-warning/10 text-warning",
  archive: "bg-muted text-muted-foreground",
};

const mockPrompts: StudioPrompt[] = [];

const filterTabs: { key: PromptStatus | "all"; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "published", label: "Опубликованные" },
  { key: "draft", label: "Черновики" },
  { key: "moderation", label: "На модерации" },
  { key: "archive", label: "Архив" },
];

type SortKey = "date" | "sales" | "name";

export function StudioMyPrompts() {
  const [filter, setFilter] = useState<PromptStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [search, setSearch] = useState("");
  const [statsPopup, setStatsPopup] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const filtered = mockPrompts
    .filter((p) => filter === "all" || p.status === filter)
    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "date") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "sales") return b.totalSales - a.totalSales;
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск промптов…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm sm:w-40 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="date">По дате</option>
          <option value="sales">По продажам</option>
          <option value="name">По названию</option>
        </select>
        <Link
          to="/publish"
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
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4 relative">
              {/* Status badge */}
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mb-2 ${statusColors[p.status]}`}>
                {statusLabels[p.status]}
              </span>

              <h3 className="font-medium text-sm mb-1 line-clamp-2">{p.title}</h3>

              <div className="flex flex-wrap gap-1 mb-3">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px]">{t}</span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views}</span>
                <span className="flex items-center gap-1"><ShoppingCart className="h-3 w-3" />{p.totalSales}</span>
                <span className="font-medium text-foreground">{p.price ? `${p.price} ₽` : "Бесплатно"}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Link
                  to="/publish"
                  className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  title="Редактировать"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
                <button
                  onClick={() => setStatsPopup(statsPopup === p.id ? null : p.id)}
                  className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  title="Статистика"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <div className="relative ml-auto">
                  <button
                    onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                    className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {menuOpen === p.id && (
                    <div className="absolute right-0 top-9 z-10 bg-popover border border-border rounded-xl shadow-elevated py-1 w-48 animate-fade-in">
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2">
                        <Download className="h-3.5 w-3.5" /> Скачать
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2">
                        <Archive className="h-3.5 w-3.5" /> В архив
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" /> Создать промо
                      </button>
                      <button className="w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 text-destructive flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" /> Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats popup */}
              {statsPopup === p.id && (
                <div className="absolute left-0 right-0 -bottom-1 translate-y-full z-10 bg-popover border border-border rounded-xl shadow-elevated p-3 animate-slide-up">
                  <p className="text-xs font-medium mb-1">Статистика за 7 дней</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold">{p.sales7d}</p>
                      <p className="text-[10px] text-muted-foreground">Продажи</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{p.views}</p>
                      <p className="text-[10px] text-muted-foreground">Просмотры</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{p.totalSales > 0 ? ((p.sales7d / p.totalSales) * 100).toFixed(0) : 0}%</p>
                      <p className="text-[10px] text-muted-foreground">Конверсия</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">У вас ещё нет промптов</h3>
          <p className="text-sm text-muted-foreground mb-4">Создайте первый!</p>
          <Link
            to="/publish"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold"
          >
            <Plus className="h-4 w-4" /> Создать первый промпт
          </Link>
        </div>
      )}
    </div>
  );
}
