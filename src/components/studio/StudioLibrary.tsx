import { useState } from "react";
import {
  Copy, Download, Send, Heart, ExternalLink,
  Search, ShieldCheck, FileText
} from "lucide-react";

interface LibraryItem {
  id: string;
  title: string;
  author: string;
  purchaseDate: string;
  purchaseId: string;
  licenseType: string;
  tags: string[];
  isFavorite: boolean;
}

const mockLibrary: LibraryItem[] = [];

export function StudioLibrary() {
  const [items, setItems] = useState(mockLibrary);
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (i) => !search || i.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  };

  const copyPrompt = (title: string) => {
    navigator.clipboard.writeText(`[Промпт] ${title} — скопирован из библиотеки Промт-Студии`);
    alert("Текст промпта скопирован!");
  };

  const sendToManager = (title: string) => {
    alert(`«${title}» отправлен в Менеджер аккаунтов для постинга`);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск в библиотеке…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-card rounded-xl border border-border p-4">
            {/* Purchase date badge */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground">
                Куплено: {new Date(item.purchaseDate).toLocaleDateString("ru-RU")}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> {item.licenseType}
              </span>
            </div>

            <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
            <p className="text-xs text-muted-foreground mb-2">от {item.author}</p>

            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px]">{t}</span>
              ))}
            </div>

            <p className="text-[10px] text-muted-foreground mb-3">ID: {item.purchaseId}</p>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => copyPrompt(item.title)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                title="Копировать промпт"
              >
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                title="Скачать файлы"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => sendToManager(item.title)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                title="Отправить в менеджер"
              >
                <Send className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => toggleFavorite(item.id)}
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-auto"
                title="В избранное"
              >
                <Heart className={`h-3.5 w-3.5 ${item.isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Библиотека пуста</p>
        </div>
      )}
    </div>
  );
}
