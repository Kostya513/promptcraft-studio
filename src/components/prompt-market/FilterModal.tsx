import { useState } from "react";
import { X, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

interface FilterCategory {
  name: string;
  items: string[];
}

const filterCategories: FilterCategory[] = [
  { name: "Текст и копирайтинг", items: ["Статьи", "Переводы", "Письма", "Креатив"] },
  { name: "Визуал и дизайн", items: ["Фотореализм", "Логотипы", "UI/UX", "Текстуры", "3D"] },
  { name: "Видео и аудио", items: ["Видео", "Монтаж", "Музыка", "Озвучка"] },
  { name: "Код и разработка", items: ["Сайты", "Скрипты", "Базы данных", "Дебаг"] },
  { name: "Бизнес и маркетинг", items: ["SMM", "Продажи", "HR", "Финансы", "Юридическое"] },
  { name: "Образование и наука", items: ["Уроки", "Термины", "Конспекты", "Статьи"] },
  { name: "Лайфстайл и личное", items: ["Путешествия", "Здоровье", "Хобби", "Психология"] },
];

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  selectedFilters: Record<string, string[]>;
  onApply: (filters: Record<string, string[]>) => void;
}

export function FilterModal({ open, onClose, selectedFilters, onApply }: FilterModalProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [local, setLocal] = useState<Record<string, string[]>>(selectedFilters);

  if (!open) return null;

  const toggleExpand = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  const toggleItem = (category: string, item: string) => {
    setLocal((prev) => {
      const current = prev[category] || [];
      const next = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
      return { ...prev, [category]: next };
    });
  };

  const totalSelected = Object.values(local).reduce((sum, arr) => sum + arr.length, 0);

  const handleReset = () => {
    setLocal({});
  };

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[80vh] bg-card border border-border rounded-2xl shadow-elevated flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Accordion */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
          {filterCategories.map((cat) => {
            const isExpanded = expanded === cat.name;
            const selectedCount = (local[cat.name] || []).length;
            return (
              <div key={cat.name} className="border-b border-border/50 last:border-0">
                <button
                  onClick={() => toggleExpand(cat.name)}
                  className="w-full flex items-center justify-between py-3 text-sm font-medium hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {cat.name}
                    {selectedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {selectedCount}
                      </span>
                    )}
                  </span>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                {isExpanded && (
                  <div className="flex flex-wrap gap-2 pb-3 animate-fade-in">
                    {cat.items.map((item) => {
                      const isSelected = (local[cat.name] || []).includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleItem(cat.name, item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background hover:border-primary/30 text-muted-foreground"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Сбросить
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Применить{totalSelected > 0 ? ` (${totalSelected})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
