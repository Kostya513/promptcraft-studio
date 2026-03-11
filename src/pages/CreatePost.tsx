import { useState } from "react";
import { ArrowLeft, Image, Calendar, Clock, Send } from "lucide-react";
import { Link } from "react-router-dom";

const platforms = [
  { id: "vk", label: "VK" },
  { id: "tg", label: "Telegram" },
  { id: "yt", label: "YouTube" },
  { id: "rutube", label: "RuTube" },
];

export default function CreatePost() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [publishNow, setPublishNow] = useState(false);

  const togglePlatform = (id: string) =>
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад к постам
      </Link>

      <h1 className="text-2xl font-bold mb-6">Создать пост</h1>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Заголовок</label>
          <input
            type="text"
            placeholder="Заголовок поста"
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Текст</label>
          <textarea
            placeholder="Напишите текст поста..."
            rows={8}
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        {/* Image */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Изображение</label>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground hover:border-primary/40 transition-colors cursor-pointer">
            <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Нажмите для загрузки изображения</p>
          </div>
        </div>

        {/* Use prompt */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium mb-2">Использовать промпт</h3>
          <p className="text-xs text-muted-foreground mb-3">Выберите промпт для генерации черновика текста</p>
          <button className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
            Выбрать из «Мои промпты»
          </button>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Теги</label>
          <input
            type="text"
            placeholder="маркетинг, WB, тренды..."
            className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Platforms */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Площадки для публикации</label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPlatforms.includes(p.id)
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Дата публикации</label>
            <input
              type="date"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Время</label>
            <input
              type="time"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Publish now toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`h-6 w-11 rounded-full transition-colors relative ${
              publishNow ? "bg-primary" : "bg-muted"
            }`}
            onClick={() => setPublishNow(!publishNow)}
          >
            <div className={`h-5 w-5 rounded-full bg-card absolute top-0.5 transition-transform shadow-sm ${
              publishNow ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </div>
          <span className="text-sm font-medium">Опубликовать сразу</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            {publishNow ? "Опубликовать" : "Запланировать"}
          </button>
          <button className="px-6 py-3 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors">
            Сохранить черновик
          </button>
        </div>
      </div>
    </div>
  );
}
