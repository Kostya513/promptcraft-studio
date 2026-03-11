import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Circle, ChevronRight, Gift, X } from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  reward?: string;
  completed: boolean;
  navigateTo: string;
}

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: "profile", label: "Заполнить профиль", reward: "+10 репутации", completed: false, navigateTo: "/settings" },
    { id: "2fa", label: "Включить 2FA", reward: "+20 репутации", completed: false, navigateTo: "/settings" },
    { id: "favorite", label: "Сохранить промпт в Избранное", completed: false, navigateTo: "/market" },
    { id: "follow", label: "Подписаться на 3 авторов", completed: false, navigateTo: "/community" },
    { id: "purchase", label: "Первая покупка", reward: "5% скидка", completed: false, navigateTo: "/market" },
  ]);

  if (dismissed) return null;

  const completedCount = items.filter(i => i.completed).length;
  const allDone = completedCount === items.length;
  const progress = (completedCount / items.length) * 100;

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  const firstIncomplete = items.find(i => !i.completed);

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Первые шаги в Промт-Студии</h3>
        </div>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{completedCount}/{items.length}</span>
      </div>

      {allDone ? (
        <div className="text-center py-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <p className="font-semibold text-sm">Поздравляем! 🎉</p>
          <p className="text-xs text-muted-foreground mt-1">Все задачи выполнены. Вы получили бонусы!</p>
        </div>
      ) : (
        <>
          <div className="space-y-1.5">
            {items.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${item.completed ? "opacity-60" : "hover:bg-muted/50"}`}
              >
                {item.completed ? (
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.label}</span>
                {item.reward && !item.completed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{item.reward}</span>
                )}
              </div>
            ))}
          </div>
          {firstIncomplete && (
            <button
              onClick={() => navigate(firstIncomplete.navigateTo)}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Начать <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
