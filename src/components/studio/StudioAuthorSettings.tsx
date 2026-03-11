import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { Eye, Save, Bell, Mail, Smartphone, MessageSquare } from "lucide-react";

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export function StudioAuthorSettings() {
  const { user } = useUser();

  const [nick, setNick] = useState(user.name || "AuthorNick");
  const [bio, setBio] = useState(user.bio || "Создаю промпты для маркетплейсов и контент-маркетинга");
  const [socialVk, setSocialVk] = useState("");
  const [socialTg, setSocialTg] = useState("");
  const [socialYt, setSocialYt] = useState("");
  const [returnPolicy, setReturnPolicy] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const [notifSales, setNotifSales] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);
  const [notifQuestions, setNotifQuestions] = useState(false);
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelPush, setChannelPush] = useState(true);
  const [channelTgBot, setChannelTgBot] = useState(false);

  const handleSave = () => {
    alert("Настройки автора сохранены");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Public profile */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Публичный профиль автора</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {nick ? nick[0].toUpperCase() : "?"}
            </div>
            <button className="text-xs text-primary hover:underline">Загрузить аватар</button>
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Никнейм автора</label>
            <input value={nick} onChange={(e) => setNick(e.target.value)} className={`${inputCls} mt-1`} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Описание / Био</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className={`${inputCls} mt-1 resize-none`} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">VK</label>
              <input value={socialVk} onChange={(e) => setSocialVk(e.target.value)} placeholder="vk.com/..." className={`${inputCls} mt-1`} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Telegram</label>
              <input value={socialTg} onChange={(e) => setSocialTg(e.target.value)} placeholder="@username" className={`${inputCls} mt-1`} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">YouTube</label>
              <input value={socialYt} onChange={(e) => setSocialYt(e.target.value)} placeholder="youtube.com/..." className={`${inputCls} mt-1`} />
            </div>
          </div>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-xs text-primary hover:underline"
          >
            <Eye className="h-3 w-3" /> {showPreview ? "Скрыть предпросмотр" : "Предпросмотр профиля"}
          </button>

          {showPreview && (
            <div className="bg-muted/50 rounded-xl p-4 mt-2 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {nick ? nick[0].toUpperCase() : "?"}
                </div>
                <div>
                  <p className="font-medium text-sm">{nick || "Автор"}</p>
                  <p className="text-xs text-muted-foreground">12 промптов • 557 продаж</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Return policy */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-3">Политика возвратов</h3>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={returnPolicy}
            onChange={(e) => setReturnPolicy(e.target.checked)}
            className="mt-1 accent-primary"
          />
          <div>
            <p className="text-sm">Разрешить возвраты в течение 7 дней</p>
            <p className="text-xs text-muted-foreground">Покупатели смогут запросить возврат, если промпт не соответствует описанию</p>
          </div>
        </label>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4">Уведомления автора</h3>

        <div className="space-y-3 mb-4">
          <p className="text-xs text-muted-foreground font-medium">Получать уведомления о:</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={notifSales} onChange={(e) => setNotifSales(e.target.checked)} className="accent-primary" />
            <span className="text-sm">Продажи</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={notifReviews} onChange={(e) => setNotifReviews(e.target.checked)} className="accent-primary" />
            <span className="text-sm">Отзывы</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={notifQuestions} onChange={(e) => setNotifQuestions(e.target.checked)} className="accent-primary" />
            <span className="text-sm">Вопросы покупателей</span>
          </label>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium">Каналы доставки:</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={channelEmail} onChange={(e) => setChannelEmail(e.target.checked)} className="accent-primary" />
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Email</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={channelPush} onChange={(e) => setChannelPush(e.target.checked)} className="accent-primary" />
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Push-уведомления</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={channelTgBot} onChange={(e) => setChannelTgBot(e.target.checked)} className="accent-primary" />
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Telegram-бот</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <Save className="h-4 w-4" /> Сохранить настройки
      </button>
    </div>
  );
}
