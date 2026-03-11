import { useState } from "react";
import { X, Play, Loader2, Lock } from "lucide-react";

interface QuickTestModalProps {
  open: boolean;
  onClose: () => void;
  promptTitle: string;
  promptId: string;
}

export function QuickTestModal({ open, onClose, promptTitle, promptId }: QuickTestModalProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [usedGenerations, setUsedGenerations] = useState(0);
  const maxFreeGenerations = 3;

  if (!open) return null;

  const isLimitReached = usedGenerations >= maxFreeGenerations;

  const handleGenerate = async () => {
    if (isLimitReached || !input.trim()) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setResult(`Результат генерации для: "${input}"\n\nЭто демонстрационный результат промпта "${promptTitle}". В реальном режиме здесь будет ответ от ИИ-модели.`);
    setUsedGenerations((p) => p + 1);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-elevated flex flex-col max-h-[90vh] sm:max-h-[80vh] animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">Быстрый тест</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{promptTitle}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Usage counter */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Бесплатных генераций: {maxFreeGenerations - usedGenerations} из {maxFreeGenerations}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: maxFreeGenerations }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-6 rounded-full ${i < usedGenerations ? "bg-muted" : "bg-primary/30"}`}
                />
              ))}
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Входные параметры</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите данные для тестирования промпта..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              disabled={isLimitReached}
            />
          </div>

          {/* Generate button */}
          {isLimitReached ? (
            <div className="text-center py-4 space-y-3">
              <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Лимит бесплатных генераций исчерпан</p>
              <button className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Купить промпт
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Генерация...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Сгенерировать
                </>
              )}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className="bg-background border border-border rounded-lg p-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Результат:</h4>
              <p className="text-sm whitespace-pre-wrap">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
