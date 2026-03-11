import { useState } from "react";
import {
  X, Key, Copy, Eye, EyeOff, CreditCard, ShieldCheck,
  Send, AlertTriangle, ExternalLink, Clock
} from "lucide-react";

interface AccountDetailModalProps {
  open: boolean;
  onClose: () => void;
  account: {
    id: string;
    service: string;
    url: string;
    login: string;
    type: string;
    status: string;
    plan: string;
    costAmount: string;
    costPeriod: string;
    regDate: string;
    nextPayment: string;
    notes: string;
    has2fa: boolean;
    lastPwChange: string;
  } | null;
}

const tabs = ["Доступы", "Финансы", "Безопасность", "Интеграция"];

export function AccountDetailModal({ open, onClose, account }: AccountDetailModalProps) {
  const [activeTab, setActiveTab] = useState("Доступы");
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  if (!open || !account) return null;

  // password and API key are provided by backend; no hard-coded samples

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} скопирован`);
  };

  const pwOld = !account.lastPwChange || (Date.now() - new Date(account.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-lg">{account.service}</h2>
            <a href={`https://${account.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
              {account.url} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[50vh]">
          {activeTab === "Доступы" && (
            <div className="space-y-4">
              {/* Login */}
              <div>
                <label className="text-xs text-muted-foreground">Логин / Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium flex-1">{account.login || "—"}</span>
                  <button onClick={() => copyToClipboard(account.login, "Логин")} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center">
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* 2FA */}
              <div>
                <label className="text-xs text-muted-foreground">2FA код</label>
                <p className="text-sm mt-1">{account.has2fa ? "Настроена (TOTP)" : "Не настроена"}</p>
              </div>

            </div>
          )}

          {activeTab === "Финансы" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Тариф</label>
                  <p className="text-sm font-medium mt-1">{account.plan || "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Стоимость</label>
                  <p className="text-sm font-medium mt-1">{account.costAmount}/{account.costPeriod}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Дата регистрации</label>
                  <p className="text-sm mt-1">{account.regDate ? new Date(account.regDate).toLocaleDateString("ru-RU") : "—"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Следующее списание</label>
                  <p className="text-sm mt-1">{account.nextPayment ? new Date(account.nextPayment).toLocaleDateString("ru-RU") : "—"}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-xs font-medium mb-1">История платежей</p>
                <p className="text-xs text-muted-foreground">20.01.2026 — $20.00 (списание)</p>
                <p className="text-xs text-muted-foreground">20.12.2025 — $20.00 (списание)</p>
                <p className="text-xs text-muted-foreground">20.11.2025 — $20.00 (списание)</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Инструкция по отписке</p>
                <p className="text-xs">Перейдите в настройки аккаунта → Подписка → Отменить подписку</p>
              </div>
            </div>
          )}

          {activeTab === "Безопасность" && (
            <div className="space-y-4">
              <div className={`p-3 rounded-xl border ${pwOld ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
                <div className="flex items-center gap-2 mb-1">
                  {pwOld ? <AlertTriangle className="h-4 w-4 text-warning" /> : <ShieldCheck className="h-4 w-4 text-success" />}
                  <span className="text-sm font-medium">Дата смены пароля</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {account.lastPwChange ? new Date(account.lastPwChange).toLocaleDateString("ru-RU") : "Не указана"}
                  {pwOld && " — рекомендуем обновить"}
                </p>
              </div>

              <div className={`p-3 rounded-xl border ${account.has2fa ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className={`h-4 w-4 ${account.has2fa ? "text-success" : "text-destructive"}`} />
                  <span className="text-sm font-medium">2FA</span>
                </div>
                <p className="text-xs text-muted-foreground">{account.has2fa ? "Включена" : "Не настроена — рекомендуем включить"}</p>
              </div>

              <div className="p-3 rounded-xl border border-border">
                <p className="text-sm font-medium mb-1">Проверка компрометации</p>
                <p className="text-xs text-muted-foreground mb-2">Проверьте, не был ли ваш пароль скомпрометирован</p>
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors">
                  Проверить
                </button>
              </div>

              <div>
                <p className="text-xs font-medium mb-2">Рекомендации</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {!account.has2fa && <li>• Включите двухфакторную аутентификацию</li>}
                  {pwOld && <li>• Обновите пароль (старше 6 месяцев)</li>}
                  <li>• Используйте уникальный пароль для каждого сервиса</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "Интеграция" && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Постинг</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Формат публикаций для {account.service}</p>
                <div className="flex gap-1">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px]">Текст</span>
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px]">Изображения</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border">
                <p className="text-sm font-medium mb-1">Статус токена</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs">Активен</span>
                  <span className="text-xs text-muted-foreground ml-auto">Обновлён: 15.02.2026</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border">
                <p className="text-sm font-medium mb-1">Ротация кабинетов</p>
                <p className="text-xs text-muted-foreground">Для множественных кабинетов — автоматическое переключение при постинге</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
