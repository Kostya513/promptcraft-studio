import { useState } from "react";
import { X, RefreshCw, Save, Copy } from "lucide-react";

interface GeneratedProfile {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

interface ProfileGeneratorProps {
  open: boolean;
  onClose: () => void;
  onSave: (profile: GeneratedProfile) => void;
}

const platforms = ["Универсальный", "Соцсеть", "Маркетплейс", "SaaS", "Форум"];
const types = ["Личный", "Рабочий", "Анонимный", "Тестовый"];

const randomNames = ["Алексей Иванов", "Мария Петрова", "Дмитрий Сидоров", "Елена Козлова", "Андрей Волков"];
const randomDomains = ["mail.ru", "yandex.ru", "gmail.com", "proton.me"];

function generateRandom(): GeneratedProfile {
  const name = randomNames[Math.floor(Math.random() * randomNames.length)];
  const domain = randomDomains[Math.floor(Math.random() * randomDomains.length)];
  const slug = name.toLowerCase().replace(/\s/g, ".").replace(/[а-я]/g, () => String.fromCharCode(97 + Math.floor(Math.random() * 26)));
  const email = `${slug}${Math.floor(Math.random() * 999)}@${domain}`;
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const password = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const initials = name.split(" ").map((n) => n[0]).join("");
  return { name, email, password, avatar: initials };
}

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

export function ProfileGenerator({ open, onClose, onSave }: ProfileGeneratorProps) {
  const [platform, setPlatform] = useState("Универсальный");
  const [type, setType] = useState("Анонимный");
  const [generated, setGenerated] = useState<GeneratedProfile | null>(null);

  if (!open) return null;

  const handleGenerate = () => {
    setGenerated(generateRandom());
  };

  const handleSave = () => {
    if (generated) {
      onSave(generated);
      onClose();
    }
  };

  const copyField = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    alert(`${label} скопирован`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Генератор профиля</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Settings */}
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground">Платформа</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={`${inputCls} mt-1`}>
              {platforms.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Тип профиля</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputCls} mt-1`}>
              {types.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold mb-4"
        >
          <RefreshCw className="h-4 w-4" /> Сгенерировать
        </button>

        {/* Generated result */}
        {generated && (
          <div className="space-y-3 bg-muted/50 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {generated.avatar}
              </div>
              <div>
                <p className="text-sm font-medium">{generated.name}</p>
                <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground">{type}</span>
              </div>
            </div>

            {[
              { label: "Email", value: generated.email },
              { label: "Пароль", value: generated.password },
            ].map((field) => (
              <div key={field.label} className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground">{field.label}</p>
                  <p className="text-xs font-mono">{field.value}</p>
                </div>
                <button onClick={() => copyField(field.value, field.label)} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
                <Save className="h-3.5 w-3.5" /> Сохранить
              </button>
              <button onClick={handleGenerate} className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
