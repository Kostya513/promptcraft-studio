import { useState } from "react";
import { FolderHeart, Clock, Pencil, Trash2, ExternalLink, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const tabs = ["Созданные", "Сохранённые", "История"];

const mockPrompts = [
  { id: "1", title: "Карточка товара WB", tags: ["WB", "Карточки"], desc: "SEO‑описание для Wildberries", date: "12 янв 2025", own: true },
  { id: "2", title: "SEO‑статья для блога", tags: ["Статьи", "SEO"], desc: "Длинная статья с ключевыми словами", date: "10 янв 2025", own: true },
  { id: "3", title: "Баннер VK", tags: ["VK", "Картинки"], desc: "Промпт для Midjourney баннеров", date: "8 янв 2025", own: false },
  { id: "4", title: "Сценарий YouTube", tags: ["YouTube", "Видео"], desc: "Структура видеоролика", date: "5 янв 2025", own: false },
];

export default function MyPrompts() {
  const [activeTab, setActiveTab] = useState("Созданные");

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Мои промпты</h1>
        <Link
          to="/my-prompts/create"
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Создать промпт
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {mockPrompts.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-4 hover:shadow-card-hover transition-shadow">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FolderHeart className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
              <div className="flex items-center gap-2 mt-2">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs">{t}</span>
                ))}
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                  <Clock className="h-3 w-3" /> {p.date}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </button>
              {p.own && (
                <button className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <button className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
