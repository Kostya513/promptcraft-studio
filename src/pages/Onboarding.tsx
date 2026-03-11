import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, Palette, Code, ShoppingCart, Store, Layers,
  Image, Video, Mic, Box, Zap, ArrowRight, Check, Bell, BellOff, Shield,
  Gift, MessageSquare, Mail, Smartphone, FileText, Globe
} from "lucide-react";

const goals = [
  { id: "buy", label: "Покупать промпты", desc: "Маркетплейс, Избранное, Ассистент", icon: ShoppingCart },
  { id: "sell", label: "Создавать промпты", desc: "Studio, Верификация, Финансы", icon: Store },
  { id: "business", label: "Для бизнеса", desc: "Командный доступ, API, интеграции", icon: Briefcase },
];

const categories = [
  { id: "text", label: "Текст и копирайтинг", icon: FileText },
  { id: "visual", label: "Визуал и дизайн", icon: Image },
  { id: "video", label: "Видео и аудио", icon: Video },
  { id: "code", label: "Код и разработка", icon: Code },
  { id: "business", label: "Бизнес и маркетинг", icon: Briefcase },
  { id: "education", label: "Образование и наука", icon: Globe },
  { id: "lifestyle", label: "Лайфстайл", icon: Palette },
];

const notifPresets = [
  { id: "all", label: "Все", desc: "Все уведомления включены", icon: Bell },
  { id: "important", label: "Только важные", desc: "Финансовые и безопасность", icon: Shield },
  { id: "minimum", label: "Минимум", desc: "Только безопасность", icon: BellOff },
];

const bonuses = [
  { id: "free_prompt", label: "Бесплатный промпт", desc: "Из коллекции «Для начинающих»", icon: Gift },
  { id: "discount", label: "Скидка 10%", desc: "На первую покупку", icon: ShoppingCart },
  { id: "pro_trial", label: "7 дней PRO", desc: "Бесплатный пробный период", icon: Zap },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [notifPreset, setNotifPreset] = useState("");
  const [notifChannels, setNotifChannels] = useState({ email: true, push: true, telegram: false });
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState("");
  const navigate = useNavigate();

  const toggleCategory = (id: string) =>
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : prev.length < 5 ? [...prev, id] : prev
    );

  const canProceed =
    (step === 0 && selectedGoal) ||
    (step === 1 && selectedCategories.length > 0) ||
    (step === 2) ||
    (step === 3) ||
    (step === 4 && selectedBonus);

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps - 1) setStep(step + 1);
    else navigate("/market");
  };

  const handleSkip = () => navigate("/market");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl gradient-primary items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Добро пожаловать в Промт-Студию</h1>
          <p className="text-muted-foreground text-sm">Настроим сервис под ваши задачи</p>
        </motion.div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= step ? "gradient-primary" : "bg-muted"}`} />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-lg font-semibold mb-4">Что вы хотите делать?</h2>
              <div className="space-y-3">
                {goals.map(g => (
                  <button key={g.id} onClick={() => setSelectedGoal(g.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      selectedGoal === g.id ? "border-primary bg-primary/5 shadow-card-hover" : "border-border bg-card hover:border-primary/30 shadow-card"
                    }`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${selectedGoal === g.id ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <g.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{g.label}</span>
                      <p className="text-sm text-muted-foreground">{g.desc}</p>
                    </div>
                    {selectedGoal === g.id && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-lg font-semibold mb-2">Какие категории вам интересны?</h2>
              <p className="text-sm text-muted-foreground mb-4">Выберите от 1 до 5 — мы персонализируем ленту</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(c => (
                  <button key={c.id} onClick={() => toggleCategory(c.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left text-sm ${
                      selectedCategories.includes(c.id) ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                    }`}>
                    <c.icon className={`h-4 w-4 flex-shrink-0 ${selectedCategories.includes(c.id) ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium">{c.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{selectedCategories.length}/5 выбрано</p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-lg font-semibold mb-4">Настройте уведомления</h2>
              <div className="space-y-3 mb-4">
                {notifPresets.map(p => (
                  <button key={p.id} onClick={() => setNotifPreset(p.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      notifPreset === p.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30"
                    }`}>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${notifPreset === p.id ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <p.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-medium text-sm">{p.label}</span>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    {notifPreset === p.id && <Check className="h-4 w-4 text-primary ml-auto" />}
                  </button>
                ))}
              </div>
              <h3 className="text-sm font-medium mb-2">Каналы доставки</h3>
              <div className="space-y-2">
                {([
                  { key: "email" as const, label: "Email", icon: Mail },
                  { key: "push" as const, label: "Push", icon: Smartphone },
                  { key: "telegram" as const, label: "Telegram", icon: MessageSquare },
                ]).map(ch => (
                  <div key={ch.key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <ch.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{ch.label}</span>
                    </div>
                    <button onClick={() => setNotifChannels(p => ({ ...p, [ch.key]: !p[ch.key] }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${notifChannels[ch.key] ? "bg-primary" : "bg-muted"}`}>
                      <span className="absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform" style={{ transform: notifChannels[ch.key] ? "translateX(20px)" : "translateX(2px)" }} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-lg font-semibold mb-2">Подключите Telegram</h2>
              <p className="text-sm text-muted-foreground mb-4">Получайте уведомления и управляйте аккаунтом через бота</p>
              <div className="bg-card rounded-xl border border-border p-5 text-center">
                <MessageSquare className="h-10 w-10 text-primary mx-auto mb-3" />
                {telegramConnected ? (
                  <>
                    <p className="font-semibold text-sm text-success">Telegram подключён ✓</p>
                    <p className="text-xs text-muted-foreground mt-1">Вы получите бонус после завершения</p>
                  </>
                ) : (
                  <>
                    <button onClick={() => setTelegramConnected(true)} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                      Подключить бота
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">Бонус: бесплатный промпт из коллекции для начинающих</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-lg font-semibold mb-2">Выберите приветственный бонус</h2>
              <p className="text-sm text-muted-foreground mb-4">Подарок за регистрацию — действует 30 дней</p>
              <div className="space-y-3">
                {bonuses.map(b => (
                  <button key={b.id} onClick={() => setSelectedBonus(b.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      selectedBonus === b.id ? "border-primary bg-primary/5 shadow-card-hover" : "border-border bg-card hover:border-primary/30"
                    }`}>
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${selectedBonus === b.id ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <b.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{b.label}</span>
                      <p className="text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                    {selectedBonus === b.id && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Назад</button>
          ) : (
            <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Пропустить и перейти в Маркет</button>
          )}
          <button onClick={handleNext} disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90">
            {step === totalSteps - 1 ? "Начать" : "Далее"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
