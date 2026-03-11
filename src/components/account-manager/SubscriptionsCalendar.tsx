import { useState } from "react";
import { Calendar, Bell, AlertTriangle, TrendingDown, CreditCard, X, ExternalLink, Pencil, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  service: string;
  amount: string;
  nextDate: string;
  daysUntil: number;
  isUnused: boolean;
  cancelUrl?: string;
}

// subscriptions fetched from backend
const mockSubscriptions: Subscription[] = [];

const cancelInstructions: Record<string, string[]> = {
  "ChatGPT Plus": ["Откройте chat.openai.com", "Перейдите в Settings → Subscription", "Нажмите Cancel plan", "Подтвердите отмену"],
  "Midjourney": ["Откройте midjourney.com/account", "Перейдите в Manage Sub", "Нажмите Cancel Plan", "Подтвердите отмену"],
  "Canva Pro": ["Откройте canva.com/settings", "Перейдите в Billing & plans", "Нажмите Cancel subscription", "Выберите причину и подтвердите"],
  "VK Реклама": ["Откройте ads.vk.com", "Перейдите в настройки кабинета", "Выберите Удалить кабинет", "Подтвердите удаление"],
};

export function SubscriptionsCalendar() {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [subs, setSubs] = useState(mockSubscriptions);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editDateValue, setEditDateValue] = useState("");
  const [showCancelModal, setShowCancelModal] = useState<Subscription | null>(null);

  const sorted = [...subs].sort((a, b) => a.daysUntil - b.daysUntil);
  const unusedCount = subs.filter((s) => s.isUnused).length;

  const handleDateEdit = (id: string) => {
    const sub = subs.find(s => s.id === id);
    if (sub) {
      setEditingDate(id);
      setEditDateValue(sub.nextDate);
    }
  };

  const handleDateSave = (id: string) => {
    if (!editDateValue) return;
    const now = new Date();
    const target = new Date(editDateValue);
    const diff = Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    setSubs(prev => prev.map(s => s.id === id ? { ...s, nextDate: editDateValue, daysUntil: diff } : s));
    setEditingDate(null);
    toast({ title: "Дата обновлена", duration: 3000 });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CreditCard className="h-4 w-4" /> Активных подписок
          </div>
          <p className="text-2xl font-bold">{subs.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Calendar className="h-4 w-4" /> Ближайшее списание
          </div>
          <p className="text-2xl font-bold">{sorted[0]?.daysUntil ?? "—"} дн.</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingDown className="h-4 w-4 text-warning" /> Неиспользуемые
          </div>
          <p className="text-2xl font-bold text-warning">{unusedCount}</p>
        </div>
      </div>

      {/* Reminders toggle */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <div>
            <span className="text-sm font-medium">Напоминания за 3 дня до списания</span>
            <p className="text-xs text-muted-foreground">Email + Push уведомление с суммой и названием сервиса</p>
          </div>
        </div>
        <Switch checked={remindersEnabled} onCheckedChange={(val) => { setRemindersEnabled(val); toast({ title: val ? "Напоминания включены" : "Напоминания отключены", duration: 3000 }); }} />
      </div>

      {/* Calendar list */}
      <div className="space-y-2">
        {sorted.map((sub) => (
          <div
            key={sub.id}
            className={`bg-card rounded-xl border p-4 ${
              sub.daysUntil <= 3 ? "border-warning/30" : "border-border"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                sub.daysUntil <= 3 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
              }`}>
                {sub.daysUntil}д
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{sub.service}</p>
                  {sub.isUnused && (
                    <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px] font-medium">Не используется</span>
                  )}
                </div>
                {editingDate === sub.id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input type="date" value={editDateValue} onChange={e => setEditDateValue(e.target.value)} className="px-2 py-1 rounded border border-border text-xs bg-background" />
                    <button onClick={() => handleDateSave(sub.id)} className="text-primary hover:opacity-80"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setEditingDate(null)} className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Списание: {new Date(sub.nextDate).toLocaleDateString("ru-RU")} • {sub.amount}
                    </p>
                    <button onClick={() => handleDateEdit(sub.id)} className="text-muted-foreground hover:text-primary"><Pencil className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {sub.daysUntil <= 3 && <AlertTriangle className="h-4 w-4 text-warning" />}
                <button onClick={() => setShowCancelModal(sub)} className="text-xs text-destructive hover:underline">Отменить</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Optimization suggestions */}
      {unusedCount > 0 && (
        <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
          <h3 className="text-sm font-medium flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-warning" /> Оптимизация расходов
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            Найдено {unusedCount} подписок, которые вы давно не использовали.
          </p>
          {subs.filter((s) => s.isUnused).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-1">
              <span className="text-xs">{s.service} — {s.amount}/мес</span>
              <button onClick={() => setShowCancelModal(s)} className="text-xs text-primary hover:underline">Инструкция по отмене</button>
            </div>
          ))}
        </div>
      )}

      {/* Cancel instructions modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Отмена: {showCancelModal.service}</h3>
              <button onClick={() => setShowCancelModal(null)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-3">Сумма списания: <strong className="text-foreground">{showCancelModal.amount}</strong></p>
              <h4 className="text-sm font-medium mb-2">Пошаговая инструкция:</h4>
              <ol className="space-y-2">
                {(cancelInstructions[showCancelModal.service] || ["Перейдите в настройки сервиса", "Найдите раздел подписки", "Нажмите Отменить"]).map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            {showCancelModal.cancelUrl && (
              <a href={showCancelModal.cancelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity mb-3">
                <ExternalLink className="h-4 w-4" /> Перейти на страницу отмены
              </a>
            )}
            <button onClick={() => setShowCancelModal(null)} className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
