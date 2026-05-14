import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, Eye, FileText, ArrowDownToLine,
  Plus, Settings, ShoppingCart, Star, MessageSquare
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "purchase" | "review" | "withdrawal";
  text: string;
  amount?: string;
  date: string;
}

const mockActivity: ActivityItem[] = [];

const activityIcons = {
  purchase: ShoppingCart,
  review: Star,
  withdrawal: ArrowDownToLine,
};

const activityColors = {
  purchase: "text-success",
  review: "text-primary",
  withdrawal: "text-warning",
};

export function StudioDashboard() {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const navigate = useNavigate();

  const balance = 0;
  const dailySales = 0;
  const totalViews = 0;
  const promptsCount = 0;

  // ✅ Функция перехода на вкладку
  const goToTab = (tab: string) => {
    navigate(`/studio?tab=${tab}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics — ТЕПЕРЬ КЛИКАБЕЛЬНЫЕ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Баланс → Финансы */}
        <div 
          onClick={() => goToTab("finances")}
          className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 hover:shadow-card-hover transition-all group"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1 group-hover:text-primary transition-colors">
            <Wallet className="h-4 w-4" /> Баланс
          </div>
          <p className="text-2xl font-bold">{balance.toLocaleString("ru-RU")} ₽</p>
          <button
            onClick={(e) => { e.stopPropagation(); setShowWithdrawModal(true); }}
            className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ArrowDownToLine className="h-3 w-3" /> Вывести
          </button>
        </div>

        {/* Продажи → Аналитика */}
        <div 
          onClick={() => goToTab("analytics")}
          className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 hover:shadow-card-hover transition-all group"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1 group-hover:text-primary transition-colors">
            <TrendingUp className="h-4 w-4" /> Продажи сегодня
          </div>
          <p className="text-2xl font-bold">{dailySales} ₽</p>
        </div>

        {/* Просмотры → Аналитика */}
        <div 
          onClick={() => goToTab("analytics")}
          className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 hover:shadow-card-hover transition-all group"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1 group-hover:text-primary transition-colors">
            <Eye className="h-4 w-4" /> Просмотры
          </div>
          <p className="text-2xl font-bold">{totalViews.toLocaleString("ru-RU")}</p>
        </div>

        {/* Промптов → Мои промты */}
        <div 
          onClick={() => goToTab("prompts")}
          className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 hover:shadow-card-hover transition-all group"
        >
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1 group-hover:text-primary transition-colors">
            <FileText className="h-4 w-4" /> Промптов
          </div>
          <p className="text-2xl font-bold">{promptsCount}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href="/publish"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Создать черновик
        </a>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4" /> Настроить выплаты
        </button>
      </div>

      {/* Activity feed */}
      <div>
        <h2 className="font-semibold mb-3">Последняя активность</h2>
        <div className="space-y-2">
          {mockActivity.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Нет активности</p>
          ) : (
            mockActivity.map((item) => {
              const Icon = activityIcons[item.type];
              const color = activityColors[item.type];
              return (
                <div key={item.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  {item.amount && (
                    <span className={`text-sm font-semibold flex-shrink-0 ${item.amount.startsWith("+") ? "text-success" : "text-warning"}`}>
                      {item.amount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Withdraw modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Вывод средств</h3>
            <p className="text-sm text-muted-foreground mb-4">Доступно: <span className="font-bold text-foreground">{balance.toLocaleString("ru-RU")} ₽</span></p>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <input type="radio" name="method" defaultChecked className="accent-primary" />
                <span className="text-sm">Карта РФ (по номеру)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <input type="radio" name="method" className="accent-primary" />
                <span className="text-sm">СБП (по телефону)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <input type="radio" name="method" className="accent-primary" />
                <span className="text-sm">Внутренний баланс</span>
              </label>
            </div>
            <div className="mb-3">
              <label className="text-xs text-muted-foreground">Сумма вывода</label>
              <input type="number" placeholder="1000" className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <p className="text-xs text-muted-foreground mb-4">Комиссия: 0%. Минимум: 500 ₽. Лимит: 100 000 ₽/мес</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Вывести</button>
              <button onClick={() => setShowWithdrawModal(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}