import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";

const platformOptions = ["GPT", "Claude", "YandexGPT", "GigaChat", "Midjourney", "Другое"];
const formatOptions = ["Чат-промпт", "Системный", "Цепочка шагов", "Агент/Workflow"];
const levelOptions = ["Новичок", "Средний", "Про", "Эксперт"];
const taskTypes = ["Маркетинг", "Код", "Дизайн", "Аналитика", "Контент", "SEO", "Другое"];

export default function CreatePrompt() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [promptText, setPromptText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [format, setFormat] = useState("");
  const [level, setLevel] = useState("");
  const [taskType, setTaskType] = useState("");
  const [language, setLanguage] = useState("Русский");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [status, setStatus] = useState("draft");

  const togglePlatform = (p: string) =>
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const handleSave = () => {
    console.log("Save prompt:", { title, description, promptText, selectedPlatforms, format, level, taskType, language, price: isFree ? "Бесплатно" : price, status });
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/my-prompts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Мои промпты
      </Link>

      <h1 className="text-2xl font-bold mb-6">Создать промпт</h1>

      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Название *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название промпта" className={inputCls} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Описание и цель</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опишите назначение промпта и кейсы использования" rows={3} className={`${inputCls} resize-none`} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Текст промпта / шаги *</label>
          <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder="Основной текст промпта или список шагов (для цепочки)" rows={6} className={`${inputCls} resize-none font-mono text-xs`} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Рекомендуемые модели/платформы</label>
          <div className="flex flex-wrap gap-2">
            {platformOptions.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedPlatforms.includes(p) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Формат</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} className={inputCls}>
              <option value="">Выберите</option>
              {formatOptions.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Уровень</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
              <option value="">Выберите</option>
              {levelOptions.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Тип задачи</label>
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className={inputCls}>
              <option value="">Выберите</option>
              {taskTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Язык</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
              <option>Русский</option>
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Цена</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="rounded border-border" />
                Бесплатно
              </label>
              {!isFree && (
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Цена, ₽" className={`${inputCls} flex-1`} />
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Статус</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="draft">Черновик</option>
            <option value="moderation">На модерацию</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            {status === "moderation" ? "Отправить на модерацию" : "Сохранить черновик"}
          </button>
        </div>
      </div>
    </div>
  );
}
