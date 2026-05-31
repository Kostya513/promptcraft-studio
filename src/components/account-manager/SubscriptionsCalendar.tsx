import { useState, useEffect } from "react";
import { 
  CreditCard, Calendar, TrendingDown, Bell, BellOff, 
  ExternalLink, RefreshCw, ArrowRight
} from "lucide-react";
import { decryptData, unpackEncrypted } from "@/utils/crypto.utils";
import { toast } from "sonner";

interface Subscription {
  id: string;
  service: string;
  costAmount: string;
  costPeriod: string;
  nextPayment: string;
  status: string;
  url: string;
  login: string;
}

export function SubscriptionsCalendar({ 
  cryptoKey, 
  onNavigate 
}: { 
  cryptoKey: CryptoKey | null, 
  onNavigate: (tab: string) => void 
}) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // 🔹 Функция загрузки данных (вызывается при каждом открытии вкладки)
  const loadSubscriptions = async () => {
    if (!cryptoKey) {
      console.warn("⛔ Ошибка: cryptoKey отсутствует");
      return;
    }

    setLoading(true);
    try {
      const stored = localStorage.getItem("encrypted_accounts");
      if (!stored) {
        console.warn("⛔ Нет данных в localStorage");
        setSubscriptions([]);
        return;
      }

      const { salt, data } = unpackEncrypted(stored);
      const decrypted = await decryptData(data, cryptoKey);
      const allAccounts = JSON.parse(decrypted);
      
      // 🔹 Фильтруем только подписки
      const subs = allAccounts.filter((a: any) => a.type === "Подписка");
      console.log(`✅ Загружено подписок: ${subs.length}`, subs);
      
      setSubscriptions(subs);
    } catch (e) {
      console.error("❌ Ошибка загрузки:", e);
      toast.error("Не удалось загрузить подписки");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Загружаем данные при каждом открытии вкладки
  useEffect(() => {
    if (cryptoKey) {
      loadSubscriptions();
    }
  }, [cryptoKey]); // <-- Ключевой момент: перезагрузка при изменении cryptoKey

  // Метрики
  const activeCount = subscriptions.filter(s => s.status === "Активен").length;
  const unusedCount = subscriptions.filter(s => s.status === "Заморожен" || s.status === "Не помню").length;
  
  // Ближайшее списание
  const activeSubs = subscriptions.filter(s => s.status === "Активен" && s.nextPayment);
  const nearestSub = activeSubs.sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())[0];
  const daysUntilPayment = nearestSub ? Math.ceil((new Date(nearestSub.nextPayment).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(notificationsEnabled ? "Уведомления отключены" : "Уведомления включены");
  };

  const goToAccounts = () => {
    localStorage.setItem("account_filter", "Подписки");
    onNavigate("accounts");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🔹 Верхние карточки */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* 1. Активных подписок */}
        <button 
          type="button"
          onClick={goToAccounts}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">Активных подписок</span>
          </div>
          <p className="text-2xl font-bold">{activeCount}</p>
        </button>

        {/* 2. Ближайшее списание */}
        <button 
          type="button"
          onClick={goToAccounts}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Ближайшее списание</span>
          </div>
          <p className="text-2xl font-bold">
            {daysUntilPayment !== null ? (
              daysUntilPayment === 0 ? "Сегодня" : `${daysUntilPayment} дн.`
            ) : "—"}
          </p>
          {nearestSub && <p className="text-xs text-muted-foreground truncate mt-1">{nearestSub.service} • {nearestSub.costAmount}</p>}
        </button>

        {/* 3. Неиспользуемые */}
        <button 
          type="button"
          onClick={goToAccounts}
          className="bg-card rounded-xl border border-border p-4 hover:border-warning/30 transition-colors text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-5 w-5 text-warning" />
            <span className="text-sm text-muted-foreground">Неиспользуемые</span>
          </div>
          <p className="text-2xl font-bold text-warning">{unusedCount}</p>
        </button>
      </div>

      {/* 🔹 Настройка уведомлений */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${notificationsEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="text-sm font-medium">Напоминания за 3 дня до списания</h3>
            <p className="text-xs text-muted-foreground">Email + Push уведомление с суммой и названием сервиса</p>
          </div>
        </div>
        <button 
          onClick={toggleNotifications}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notificationsEnabled ? "bg-primary" : "bg-muted"}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>

      {/* 🔹 Кнопка обновления (для отладки) */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">Мои подписки</h3>
        <button 
          onClick={loadSubscriptions} 
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Обновить
        </button>
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <RefreshCw className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* 🔹 Список подписок */}
      {subscriptions.length === 0 && !loading ? (
        <div className="text-center py-10 border border-dashed border-border rounded-xl bg-muted/20">
          <p className="text-muted-foreground mb-2">Нет подписок</p>
          <button onClick={goToAccounts} className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
            Добавить первую подписку <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subscriptions.map(sub => (
            <div key={sub.id} className="bg-card rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sub.status === "Активен" ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">{sub.service}</h4>
                  <p className="text-xs text-muted-foreground">{sub.costAmount} / {sub.costPeriod}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">След. оплата</p>
                  <p className="text-sm font-medium">{sub.nextPayment ? new Date(sub.nextPayment).toLocaleDateString("ru-RU") : "—"}</p>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                  sub.status === "Активен" ? "bg-green-100 text-green-700" : 
                  sub.status === "Заморожен" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>
                  {sub.status}
                </div>

                <button 
                  onClick={() => window.open(sub.url.startsWith('http') ? sub.url : `https://${sub.url}`, '_blank')}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  title="Перейти на сайт"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}