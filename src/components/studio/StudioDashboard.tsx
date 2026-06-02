import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, Eye, FileText, ArrowDownToLine,
  Plus, Settings, ShoppingCart, Star, Bot
} from "lucide-react";
import { getPrompts } from "@/lib/local-storage";
import QuickStartWizard from "./QuickStartWizard";

interface ActivityItem {
  id: string;
  type: "purchase" | "review" | "withdrawal" | "agent_run";
  text: string;
  amount?: string;
  date: string;
}

const activityIcons = {
  purchase: ShoppingCart,
  review: Star,
  withdrawal: ArrowDownToLine,
  agent_run: Bot,
};

const activityColors = {
  purchase: "text-success",
  review: "text-primary",
  withdrawal: "text-warning",
  agent_run: "text-blue-500",
};

export function StudioDashboard() {
  const navigate = useNavigate();
  const [promptsCount, setPromptsCount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [activity] = useState<ActivityItem[]>([
    { id: "1", type: "agent_run", text: "Агент 'Telegram-помощник' выполнил задачу", date: "2 мин назад" },
    { id: "2", type: "review", text: "Новый отзыв на промт 'Продающий текст'", date: "1 час назад" },
  ]);
  
  // 🔹 СОСТОЯНИЕ ДЛЯ ВИЗАРДА
  const [showQuickStart, setShowQuickStart] = useState(false);

  // 🔹 Загрузка данных
  useEffect(() => {
    // 1. Считаем промты
    const prompts = getPrompts();
    setPromptsCount(prompts.length);

    // 2. Читаем баланс из финансов
    const financesData = localStorage.getItem("promptcraft_finances");
    if (financesData) {
      try {
        const parsed = JSON.parse(financesData);
        setBalance(parsed.available || parsed.balance || 0);
      } catch (e) { console.error("Ошибка чтения финансов:", e); }
    }
  }, []);

  // ✅ Навигация по вкладкам
  const goToTab = (tab: string) => {
    navigate(`/studio?tab=${tab}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🔹 ВИЗАРД СОЗДАНИЯ ПРОМТА */}
      {showQuickStart && (
        <QuickStartWizard 
          onClose={() => setShowQuickStart(false)}
          onPublish={(data) => {
            console.log("Публикация:", data);
            setShowQuickStart(false);
            // После создания обновляем счётчик
            setPromptsCount(prev => prev + 1);
          }}
        />
      )}

      {/* 🔹 МЕТРИКИ (кликабельные) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Баланс → Финансы */}
        <button 
          onClick={() => goToTab("finances")}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Баланс</span>
          </div>
          <p className="text-2xl font-bold">{balance.toLocaleString("ru-RU")} ₽</p>
          <p className="text-xs text-primary mt-1 group-hover:underline flex items-center gap-1">
            <ArrowDownToLine className="h-3 w-3" /> Вывести
          </p>
        </button>

        {/* Продажи сегодня → Аналитика */}
        <button 
          onClick={() => goToTab("analytics")}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <span className="text-sm text-muted-foreground">Продажи сегодня</span>
          </div>
          <p className="text-2xl font-bold">0 ₽</p>
        </button>

        {/* Просмотры → Аналитика */}
        <button 
          onClick={() => goToTab("analytics")}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">Просмотры</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </button>

        {/* Промптов → Мои промты */}
        <button 
          onClick={() => goToTab("prompts")}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-purple-500" />
            <span className="text-sm text-muted-foreground">Промптов</span>
          </div>
          <p className="text-2xl font-bold">{promptsCount}</p>
        </button>
      </div>

      {/* 🔹 БЫСТРЫЕ ДЕЙСТВИЯ */}
      <div className="flex flex-wrap gap-3">
        {/* 🔥 ОТКРЫВАЕТ ВИЗАРД, а не переходит на вкладку! */}
        <button
          onClick={() => setShowQuickStart(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Создать промт
        </button>
        <button
          onClick={() => goToTab("finances")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4" /> Настроить выплаты
        </button>
      </div>

      {/* 🔹 ПОСЛЕДНЯЯ АКТИВНОСТЬ */}
      <div>
        <h2 className="font-semibold mb-3">Последняя активность</h2>
        <div className="space-y-2">
          {activity.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Нет активности</p>
          ) : (
            activity.map((item) => {
              const Icon = activityIcons[item.type];
              const color = activityColors[item.type];
              return (
                <div key={item.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}