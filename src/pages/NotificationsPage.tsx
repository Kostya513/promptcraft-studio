import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, BellOff, Search, Check, Trash2, Filter,
  Wallet, Shield, FileText, Heart, Monitor, Megaphone,
  Mail, Smartphone, MessageSquare, Clock, X, ChevronDown
} from "lucide-react";
import { useNotifications, Notification } from "@/contexts/NotificationContext";

const tabs = ["Все", "Непрочитанные", "Финансы", "Безопасность", "Контент", "Социальные", "Системные"];

const typeToTab: Record<string, string> = {
  financial: "Финансы",
  security: "Безопасность",
  content: "Контент",
  social: "Социальные",
  system: "Системные",
  marketing: "Системные",
};

const typeIcons: Record<string, typeof Bell> = {
  financial: Wallet,
  security: Shield,
  content: FileText,
  social: Heart,
  system: Monitor,
  marketing: Megaphone,
};

const typeColors: Record<string, string> = {
  financial: "text-success bg-success/10",
  security: "text-destructive bg-destructive/10",
  content: "text-primary bg-primary/10",
  social: "text-warning bg-warning/10",
  system: "text-muted-foreground bg-muted",
  marketing: "text-primary bg-primary/10",
};

const channelLabels = [
  { key: "email" as const, label: "Email", icon: Mail },
  { key: "push" as const, label: "Push", icon: Smartphone },
  { key: "telegram" as const, label: "Telegram", icon: MessageSquare },
  { key: "sms" as const, label: "SMS", icon: Shield },
];

const eventLabels = [
  { key: "financial", label: "Финансовые", desc: "Покупки, продажи, выплаты" },
  { key: "security", label: "Безопасность", desc: "Входы, пароли, 2FA" },
  { key: "content", label: "Контент", desc: "Модерация, отзывы, продажи промптов" },
  { key: "social", label: "Социальные", desc: "Лайки, комментарии, подписчики" },
  { key: "system", label: "Системные", desc: "Обновления платформы, ТОС" },
  { key: "marketing", label: "Маркетинг", desc: "Акции, рекомендации (opt-in)" },
];

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll, settings, updateSettings, updateChannels, updateEvent } = useNotifications();
  const [activeTab, setActiveTab] = useState("Все");
  const [search, setSearch] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const filtered = notifications.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === "Непрочитанные") return !n.read;
    if (activeTab !== "Все") return typeToTab[n.type] === activeTab;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Уведомления</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} непрочитанных</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
            <Filter className="h-4 w-4" /> Настройки
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            {t}
            {t === "Непрочитанные" && unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px]">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по уведомлениям..." className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {/* Mass actions */}
      <div className="flex gap-2 mb-4">
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
            <Check className="h-3 w-3" /> Прочитать все
          </button>
        )}
        {notifications.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
            <Trash2 className="h-3 w-3" /> Очистить
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Нет уведомлений</p>
          </div>
        ) : (
          filtered.map(n => {
            const Icon = typeIcons[n.type] || Bell;
            const colors = typeColors[n.type] || "text-muted-foreground bg-muted";
            const [iconColor, iconBg] = colors.split(" ");
            return (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                  !n.read ? "border-primary/20 bg-primary/5" : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                    {n.actionLabel && n.actionUrl && (
                      <button onClick={(e) => { e.stopPropagation(); navigate(n.actionUrl!); }} className="text-[10px] text-primary font-medium hover:underline">
                        {n.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Настройки уведомлений</h3>
              <button onClick={() => setShowSettings(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            {/* Channels */}
            <h4 className="font-medium text-sm mb-3">Каналы доставки</h4>
            <div className="space-y-2 mb-5">
              {channelLabels.map(ch => (
                <div key={ch.key} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <ch.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{ch.label}</span>
                  </div>
                  <button onClick={() => updateChannels({ [ch.key]: !settings.channels[ch.key] })} className={`relative w-10 h-5 rounded-full transition-colors ${settings.channels[ch.key] ? "bg-primary" : "bg-muted"}`}>
                    <span className="absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform" style={{ transform: settings.channels[ch.key] ? "translateX(20px)" : "translateX(2px)" }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Event types */}
            <h4 className="font-medium text-sm mb-3">Типы событий</h4>
            <div className="space-y-2 mb-5">
              {eventLabels.map(ev => (
                <label key={ev.key} className="flex items-center justify-between py-1.5 cursor-pointer">
                  <div>
                    <span className="text-sm">{ev.label}</span>
                    <p className="text-xs text-muted-foreground">{ev.desc}</p>
                  </div>
                  <input type="checkbox" checked={settings.events[ev.key] ?? true} onChange={() => updateEvent(ev.key, !settings.events[ev.key])} className="rounded border-border" />
                </label>
              ))}
            </div>

            {/* DND */}
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2"><BellOff className="h-4 w-4" /> Не беспокоить</h4>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Включить тихий режим</span>
              <button onClick={() => updateSettings({ dndEnabled: !settings.dndEnabled })} className={`relative w-10 h-5 rounded-full transition-colors ${settings.dndEnabled ? "bg-primary" : "bg-muted"}`}>
                <span className="absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform" style={{ transform: settings.dndEnabled ? "translateX(20px)" : "translateX(2px)" }} />
              </button>
            </div>
            {settings.dndEnabled && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">С</span>
                <input type="time" value={settings.dndFrom} onChange={e => updateSettings({ dndFrom: e.target.value })} className="px-2 py-1 rounded border border-border text-sm bg-background" />
                <span className="text-xs text-muted-foreground">до</span>
                <input type="time" value={settings.dndTo} onChange={e => updateSettings({ dndTo: e.target.value })} className="px-2 py-1 rounded border border-border text-sm bg-background" />
              </div>
            )}

            {/* Digest */}
            <h4 className="font-medium text-sm mb-2">Дайджест</h4>
            <div className="flex gap-2 mb-4">
              {(["daily", "weekly", "never"] as const).map(f => (
                <button key={f} onClick={() => updateSettings({ digestFrequency: f })} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${settings.digestFrequency === f ? "border-primary bg-primary/5" : "border-border"}`}>
                  {f === "daily" ? "Ежедневно" : f === "weekly" ? "Еженедельно" : "Никогда"}
                </button>
              ))}
            </div>

            <button onClick={() => setShowSettings(false)} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Сохранить</button>
          </div>
        </div>
      )}
    </div>
  );
}
