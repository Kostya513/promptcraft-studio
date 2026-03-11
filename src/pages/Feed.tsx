import { useState } from "react";
import { PromptCard } from "@/components/PromptCard";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";

const filters = ["Все", "Для бизнеса", "Для творчества", "Для разработки"];
const sortOptions = ["Рекомендовано", "Популярное", "Новые"];

const mockPrompts = [
  {
    id: "1",
    title: "Карточка товара для Wildberries — полный комплект",
    description: "Генерирует SEO‑заголовок, описание, характеристики и ключевые слова для карточки товара на WB.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=340&fit=crop",
    tags: ["WB", "Карточки", "Новичок"],
    rating: 4.8,
    likes: 342,
    views: 2100,
    author: "MarketPro",
  },
  {
    id: "2",
    title: "SEO‑статья для блога с ключевыми словами",
    description: "Пошаговый промпт для создания длинной SEO‑статьи с заданной структурой, заголовками и CTA.",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=340&fit=crop",
    tags: ["Статьи", "SEO", "Продвинутый"],
    rating: 4.6,
    likes: 218,
    views: 1540,
    author: "ContentKing",
  },
  {
    id: "3",
    title: "Баннер для VK‑рекламы — Midjourney prompt",
    description: "Промпт для генерации рекламных баннеров в стиле бренда через Midjourney или Kandinsky.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop",
    tags: ["VK", "Картинки", "Баннеры"],
    rating: 4.9,
    likes: 512,
    views: 3200,
    author: "DesignLab",
  },
  {
    id: "4",
    title: "Сценарий видеоролика для YouTube",
    description: "Создаёт структурированный сценарий: хук, основной контент, CTA. Подходит для обзоров и туториалов.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=340&fit=crop",
    tags: ["YouTube", "Видео", "Продвинутый"],
    rating: 4.5,
    likes: 178,
    views: 980,
    author: "VideoGuru",
  },
  {
    id: "5",
    title: "Грантовая заявка — структура и текст",
    description: "Агентный промпт для пошаговой подготовки грантовой заявки: описание проекта, бюджет, план.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=340&fit=crop",
    tags: ["Бизнес", "Гранты", "Агент"],
    rating: 4.7,
    likes: 134,
    views: 760,
    author: "GrantHelper",
  },
];

export default function Feed() {
  const [activeFilter, setActiveFilter] = useState("Все");
  const [activeSort, setActiveSort] = useState("Рекомендовано");

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Лента</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === f
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-4 mb-6 text-sm">
        {sortOptions.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSort(s)}
            className={`pb-1 transition-colors ${
              activeSort === s
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Onboarding checklist */}
      <OnboardingChecklist />

      {/* Cards */}
      <div className="space-y-6 mt-6">
        {mockPrompts.map((prompt) => (
          <PromptCard key={prompt.id} {...prompt} />
        ))}
      </div>
    </div>
  );
}
