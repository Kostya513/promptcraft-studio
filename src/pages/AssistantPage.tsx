import { useState } from "react";
import { Send, Bot, User, ChevronDown, Sparkles, Image, MessageSquare, Globe, Calendar } from "lucide-react";

const models = ["YandexGPT", "GigaChat", "Mistral", "LLaMA"];

const agentScenarios = [
  { id: "wb-card", title: "Карточка товара для WB", desc: "Создайте полную карточку товара" },
  { id: "article", title: "Статья/блог‑пост", desc: "Напишите SEO‑статью по шагам" },
  { id: "video-script", title: "Сценарий видео/подкаста", desc: "Структура + сценарий" },
  { id: "grant", title: "Грантовая заявка", desc: "Соберите структуру документа" },
  { id: "social-post", title: "Пост для соцсетей", desc: "Создать и опубликовать во все сети" },
  { id: "manage-service", title: "Управление сервисами", desc: "Инструкции по удалению/настройке аккаунтов" },
];

const connectedSocials = [
  { id: "vk", name: "ВКонтакте", connected: true },
  { id: "tg", name: "Telegram", connected: true },
  { id: "youtube", name: "YouTube", connected: false },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image";
}

export default function AssistantPage() {
  const [mode, setMode] = useState<"chat" | "agent">("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Привет! Я ваш ИИ‑помощник в Промт-Студии. Могу генерировать тексты и изображения. Чем помочь?" },
  ]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [showPublishPanel, setShowPublishPanel] = useState(false);
  const [selectedSocials, setSelectedSocials] = useState<string[]>([]);
  const [publishMode, setPublishMode] = useState<"now" | "schedule">("now");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    // Check for publish command
    if (userMsg.toLowerCase().includes("размести") && userMsg.toLowerCase().includes("соцсет")) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Готов опубликовать ваш контент. Выберите соцсети и время публикации:" },
        ]);
        setShowPublishPanel(true);
      }, 500);
    } else if (userMsg.toLowerCase().includes("картинк") || userMsg.toLowerCase().includes("изображен") || userMsg.toLowerCase().includes("сгенерируй")) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "🖼 [Сгенерированное изображение будет отображено здесь]\n\nГотово! Вы можете отредактировать результат или попросить меня сгенерировать другой вариант.", type: "image" },
        ]);
      }, 800);
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Это демо‑ответ. В реальной версии здесь будет ответ от выбранной ИИ‑модели. Вы можете отредактировать текст, попросить сгенерировать изображение, или дать команду «Ассистент, размести это во всех моих соцсетях»." },
        ]);
      }, 500);
    }
    setInput("");
  };

  const handlePublish = () => {
    const names = selectedSocials
      .map((id) => connectedSocials.find((s) => s.id === id)?.name)
      .filter(Boolean)
      .join(", ");
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: `✅ Задачи публикации созданы для: ${names}. ${publishMode === "now" ? "Публикация запущена." : "Публикация запланирована."}` },
    ]);
    setShowPublishPanel(false);
    setSelectedSocials([]);
  };

  const toggleSocial = (id: string) =>
    setSelectedSocials((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-3xl mx-auto">
      {/* Mode tabs */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-2">
        <button
          onClick={() => setMode("chat")}
          className={`pb-2 text-sm font-medium transition-colors ${mode === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Обычный чат
        </button>
        <button
          onClick={() => setMode("agent")}
          className={`pb-2 text-sm font-medium transition-colors ${mode === "agent" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
        >
          Ассистент
        </button>

        {/* Model selector */}
        <div className="ml-auto relative">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg bg-card border border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {mode === "chat" ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border rounded-bl-md"
                  }`}
                >
                  {msg.type === "image" && (
                    <div className="aspect-video rounded-lg bg-muted mb-2 flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Publish panel */}
            {showPublishPanel && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3 animate-slide-up">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" /> Публикация в соцсети
                </h3>
                <div className="flex flex-wrap gap-2">
                  {connectedSocials.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => s.connected && toggleSocial(s.id)}
                      disabled={!s.connected}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedSocials.includes(s.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : s.connected
                          ? "border-border hover:border-primary/30"
                          : "border-border opacity-40 cursor-not-allowed"
                      }`}
                    >
                      {s.name} {!s.connected && "(не подключен)"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPublishMode("now")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      publishMode === "now" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Сейчас
                  </button>
                  <button
                    onClick={() => setPublishMode("schedule")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      publishMode === "schedule" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" /> Запланировать
                  </button>
                </div>
                {publishMode === "schedule" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input type="time" className="px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                )}
                <button
                  onClick={handlePublish}
                  disabled={selectedSocials.length === 0}
                  className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {publishMode === "now" ? "Опубликовать" : "Запланировать"}
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Введите сообщение... (напишите «сгенерируй картинку» для изображений)"
                className="flex-1 px-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleSend}
                className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Agent mode */
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h2 className="text-lg font-semibold mb-4">Выберите сценарий</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {agentScenarios.map((s) => (
              <button
                key={s.id}
                className="text-left p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{s.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </button>
            ))}
          </div>

          {/* Step form placeholder */}
          <div className="mt-6 bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold mb-3">Пример: Карточка товара для WB</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Название товара</label>
                <input
                  type="text"
                  placeholder="Например: Термокружка 500мл"
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Характеристики</label>
                <textarea
                  placeholder="Материал, объём, цвет..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              <button className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                Сгенерировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
