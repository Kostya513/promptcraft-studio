import { useState } from "react";
import {
  Search, BookOpen, MessageCircle, Send, Paperclip, ChevronDown,
  ChevronRight, ThumbsUp, ThumbsDown, Play, HelpCircle, Bug,
  Lightbulb, Star, X, Plus, Clock, CheckCircle, AlertCircle,
  Phone, Upload, Camera, Info
} from "lucide-react";

interface KBArticle {
  id: string;
  title: string;
  category: string;
  type: "article" | "faq" | "video" | "tutorial";
  helpful: number;
}

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  created: string;
  lastReply: string;
  messages: { from: "user" | "support"; text: string; time: string; attachments?: string[] }[];
  rated?: number;
}

interface ChatMessage {
  id: string;
  from: "user" | "bot" | "operator";
  text: string;
  time: string;
}

const mockArticles: KBArticle[] = [
  { id: "a1", title: "Как начать работу с Промт-Студией", category: "Начало работы", type: "article", helpful: 156 },
  { id: "a2", title: "Как создать и опубликовать промт", category: "Маркетплейс", type: "tutorial", helpful: 98 },
  { id: "a3", title: "Настройка автопостинга", category: "Менеджер аккаунтов", type: "video", helpful: 74 },
  { id: "a4", title: "Часто задаваемые вопросы об оплате", category: "Финансы", type: "faq", helpful: 210 },
  { id: "a5", title: "Безопасность и 2FA", category: "Безопасность", type: "article", helpful: 132 },
  { id: "a6", title: "Как вывести заработок из Studio", category: "Studio", type: "tutorial", helpful: 89 },
];

const faqItems = [
  { q: "Как вернуть деньги за промт?", a: "Перейдите в Studio → Библиотека → выберите промт → кнопка «Запросить возврат». Возврат обрабатывается в течение 3 рабочих дней." },
  { q: "Можно ли изменить цену после публикации?", a: "Да, в Studio → Мои промты → меню промта → «Редактировать». Изменение цены вступает в силу немедленно." },
  { q: "Как подключить Telegram для автопостинга?", a: "Настройки → Подключённые сервисы → Telegram → Подключить. Следуйте инструкциям бота." },
  { q: "Какие комиссии при выводе средств?", a: "RF карта — 2%, СБП — 1%, внутренний баланс — 0%. Минимум вывода 500 ₽." },
];

const mockTickets: Ticket[] = [
  { id: "T-001", subject: "Не работает автопостинг в VK", status: "in_progress", priority: "high", created: "19 фев 2026", lastReply: "20 фев 2026", messages: [
    { from: "user", text: "При попытке опубликовать пост в VK возникает ошибка 403.", time: "19 фев, 14:20" },
    { from: "support", text: "Здравствуйте! Проверьте, пожалуйста, что токен VK актуален в разделе Подключённые сервисы.", time: "20 фев, 09:15" },
  ]},
  { id: "T-002", subject: "Вопрос по лицензии промта", status: "resolved", priority: "low", created: "15 фев 2026", lastReply: "16 фев 2026", messages: [
    { from: "user", text: "Можно ли использовать купленный промт в коммерческих проектах?", time: "15 фев, 10:00" },
    { from: "support", text: "Да, стандартная лицензия включает коммерческое использование. Подробности в карточке промта.", time: "16 фев, 11:30" },
  ], rated: 5 },
];

const statusLabels: Record<string, string> = { open: "Открыт", in_progress: "В работе", resolved: "Решён", closed: "Закрыт" };
const statusColors: Record<string, string> = { open: "bg-warning/10 text-warning", in_progress: "bg-primary/10 text-primary", resolved: "bg-success/10 text-success", closed: "bg-muted text-muted-foreground" };
const priorityLabels: Record<string, string> = { low: "Низкий", medium: "Средний", high: "Высокий" };

const popularQueries = ["автопостинг", "вывод средств", "2FA", "возврат", "лицензия"];

// navigation tabs for support page; kept outside component to avoid
// redefinition or accidental state conflicts that could cause text flicker
export const supportSections = [
  { key: "search", label: "Поиск", icon: Search },
  { key: "kb", label: "База знаний", icon: BookOpen },
  { key: "tickets", label: "Тикеты", icon: HelpCircle },
  { key: "chat", label: "Чат", icon: MessageCircle },
  { key: "feedback", label: "Обратная связь", icon: Lightbulb },
];

export default function SupportPage() {
  const [activeSection, setActiveSection] = useState<"search" | "kb" | "tickets" | "chat" | "feedback">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", priority: "medium" as string, description: "" });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", from: "bot", text: "Здравствуйте! Я виртуальный помощник Промт-Студии. Чем могу помочь?", time: "сейчас" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"bot" | "operator">("bot");
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "nps">("bug");
  const [feedbackText, setFeedbackText] = useState("");
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [helpfulArticles, setHelpfulArticles] = useState<Record<string, boolean>>({});


  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), from: "user", text: chatInput, time: "сейчас" };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: chatMode === "bot" ? "bot" : "operator",
        text: chatMode === "bot" ? "Спасибо за вопрос! Ищу информацию в базе знаний..." : "Оператор скоро ответит.",
        time: "сейчас"
      };
      setChatMessages(prev => [...prev, reply]);
    }, 1000);
  };

  const createTicket = () => {
    const t: Ticket = {
      id: `T-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: newTicket.subject,
      status: "open",
      priority: newTicket.priority as any,
      created: "сегодня",
      lastReply: "сегодня",
      messages: [{ from: "user", text: newTicket.description, time: "сейчас" }],
    };
    setTickets(prev => [t, ...prev]);
    setShowCreateTicket(false);
    setNewTicket({ subject: "", priority: "medium", description: "" });
    setSelectedTicket(t);
  };

  const sendTicketReply = () => {
    if (!ticketReplyText.trim() || !selectedTicket) return;
    const updated = { ...selectedTicket, messages: [...selectedTicket.messages, { from: "user" as const, text: ticketReplyText, time: "сейчас" }] };
    setSelectedTicket(updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setTicketReplyText("");
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  const filteredArticles = mockArticles.filter(a => !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Поддержка</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-success"></span>
          Среднее время ответа: ~15 мин
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto pb-px">
        {supportSections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key as any)} className={`pb-3 px-3 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${activeSection === s.key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <s.icon className="h-4 w-4" /> {s.label}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      {activeSection === "search" && (
        <div className="animate-fade-in">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Опишите проблему или вопрос..." className="w-full pl-9 pr-3 py-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {popularQueries.map(q => (
              <button key={q} onClick={() => setSearchQuery(q)} className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary">
                {q}
              </button>
            ))}
          </div>
          {searchQuery && (
            <div className="space-y-2">
              {filteredArticles.map(a => (
                <button key={a.id} onClick={() => setActiveSection("kb")} className="w-full text-left bg-card rounded-lg border border-border p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    {a.type === "video" ? <Play className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-medium">{a.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{a.category}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {!searchQuery && (
            <div className="grid sm:grid-cols-2 gap-3">
              <button onClick={() => setActiveSection("kb")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">База знаний</h3>
                <p className="text-xs text-muted-foreground mt-1">Статьи, FAQ, видео и туториалы</p>
              </button>
              <button onClick={() => setActiveSection("tickets")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <HelpCircle className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Создать тикет</h3>
                <p className="text-xs text-muted-foreground mt-1">Обратиться в техподдержку</p>
              </button>
              <button onClick={() => setActiveSection("chat")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <MessageCircle className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">Живой чат</h3>
                <p className="text-xs text-muted-foreground mt-1">Бот или оператор онлайн</p>
              </button>
              <button onClick={() => setActiveSection("feedback")} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <Lightbulb className="h-6 w-6 text-warning mb-2" />
                <h3 className="font-semibold text-sm">Обратная связь</h3>
                <p className="text-xs text-muted-foreground mt-1">Баг-репорт, идеи, опросы</p>
              </button>
              <button onClick={() => window.location.href = "/support/about"} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30">
                <Info className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-semibold text-sm">О сервисе</h3>
                <p className="text-xs text-muted-foreground mt-1">Информация о компании и документация</p>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Knowledge Base ── */}
      {activeSection === "kb" && (
        <div className="animate-fade-in">
          <div className="space-y-3 mb-6">
            {filteredArticles.map(a => (
              <div key={a.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  {a.type === "video" && <Play className="h-4 w-4 text-primary" />}
                  {a.type === "article" && <BookOpen className="h-4 w-4 text-primary" />}
                  {a.type === "tutorial" && <BookOpen className="h-4 w-4 text-success" />}
                  {a.type === "faq" && <HelpCircle className="h-4 w-4 text-warning" />}
                  <span className="text-xs text-muted-foreground">{a.category}</span>
                  <span className="text-xs text-muted-foreground uppercase ml-auto">{a.type}</span>
                </div>
                <h3 className="font-semibold text-sm">{a.title}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setHelpfulArticles(prev => ({ ...prev, [a.id]: true }))} className={`h-7 w-7 rounded flex items-center justify-center ${helpfulArticles[a.id] === true ? "bg-success/10 text-success" : "hover:bg-muted text-muted-foreground"}`}><ThumbsUp className="h-3 w-3" /></button>
                    <button onClick={() => setHelpfulArticles(prev => ({ ...prev, [a.id]: false }))} className={`h-7 w-7 rounded flex items-center justify-center ${helpfulArticles[a.id] === false ? "bg-destructive/10 text-destructive" : "hover:bg-muted text-muted-foreground"}`}><ThumbsDown className="h-3 w-3" /></button>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.helpful} нашли полезным</span>
                </div>
              </div>
            ))}
          </div>
          {/* FAQ Accordion */}
          <h3 className="font-semibold text-sm mb-3">Часто задаваемые вопросы</h3>
          <div className="space-y-2">
            {faqItems.map((f, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                  <span className="text-sm font-medium">{f.q}</span>
                  {expandedFaq === i ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </button>
                {expandedFaq === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tickets ── */}
      {activeSection === "tickets" && (
        <div className="animate-fade-in">
          {selectedTicket ? (
            <div>
              <button onClick={() => setSelectedTicket(null)} className="text-sm text-primary hover:underline mb-3 flex items-center gap-1">← Назад к тикетам</button>
              <div className="bg-card rounded-xl border border-border p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{selectedTicket.id}: {selectedTicket.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[selectedTicket.status]}`}>{statusLabels[selectedTicket.status]}</span>
                </div>
                <p className="text-xs text-muted-foreground">Приоритет: {priorityLabels[selectedTicket.priority]} · Создан: {selectedTicket.created}</p>
              </div>
              <div className="space-y-3 mb-4">
                {selectedTicket.messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl text-sm ${m.from === "user" ? "bg-primary/5 border border-primary/20 ml-8" : "bg-card border border-border mr-8"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{m.from === "user" ? "Вы" : "Поддержка"}</span>
                      <span className="text-xs text-muted-foreground">{m.time}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== "closed" && (
                <div className="flex gap-2">
                  <input value={ticketReplyText} onChange={e => setTicketReplyText(e.target.value)} placeholder="Ваш ответ..." className={inputCls} />
                  <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted"><Paperclip className="h-4 w-4" /></button>
                  <button onClick={sendTicketReply} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
                </div>
              )}
              {selectedTicket.status === "closed" && !selectedTicket.rated && (
                <div className="bg-card rounded-xl border border-border p-4 mt-4">
                  <p className="text-sm font-medium mb-2">Оцените качество поддержки:</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button key={s} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><Star className={`h-4 w-4 ${s <= (npsScore || 0) ? "text-warning fill-current" : "text-muted-foreground"}`} /></button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Мои тикеты</h3>
                <button onClick={() => setShowCreateTicket(true)} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-1"><Plus className="h-4 w-4" /> Создать тикет</button>
              </div>
              {showCreateTicket && (
                <div className="bg-card rounded-xl border border-border p-4 mb-4">
                  <h3 className="font-semibold text-sm mb-3">Новый тикет</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Тема</label>
                      <input value={newTicket.subject} onChange={e => setNewTicket(prev => ({ ...prev, subject: e.target.value }))} className={`${inputCls} mt-1`} placeholder="Кратко опишите проблему" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Приоритет</label>
                      <select value={newTicket.priority} onChange={e => setNewTicket(prev => ({ ...prev, priority: e.target.value }))} className={`${inputCls} mt-1`}>
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Описание</label>
                      <textarea value={newTicket.description} onChange={e => setNewTicket(prev => ({ ...prev, description: e.target.value }))} rows={3} className={`${inputCls} mt-1 resize-none`} placeholder="Подробное описание..." />
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-1"><Paperclip className="h-4 w-4" /> Прикрепить</button>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowCreateTicket(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Отмена</button>
                      <button onClick={createTicket} disabled={!newTicket.subject || !newTicket.description} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-40">Отправить</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {tickets.map(t => (
                  <button key={t.id} onClick={() => setSelectedTicket(t)} className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{t.id}: {t.subject}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[t.status]}`}>{statusLabels[t.status]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Приоритет: {priorityLabels[t.priority]}</span>
                      <span>Создан: {t.created}</span>
                      <span>Последний ответ: {t.lastReply}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Live Chat ── */}
      {activeSection === "chat" && (
        <div className="animate-fade-in">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-semibold text-sm">Чат поддержки</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setChatMode("bot")} className={`px-3 py-1 rounded-lg text-xs font-medium ${chatMode === "bot" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Бот</button>
                <button onClick={() => setChatMode("operator")} className={`px-3 py-1 rounded-lg text-xs font-medium ${chatMode === "operator" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Оператор</button>
              </div>
            </div>
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(m => (
                <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.from !== "user" && <p className="text-[10px] font-medium mb-0.5 opacity-70">{m.from === "bot" ? "🤖 Бот" : "👤 Оператор"}</p>}
                    <p>{m.text}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-3 border-t border-border">
              <button className="px-2 py-2 rounded-lg border border-border hover:bg-muted"><Paperclip className="h-4 w-4 text-muted-foreground" /></button>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder="Введите сообщение..." className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={sendChat} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Если оператор оффлайн, вопрос автоматически станет тикетом.</p>
        </div>
      )}

      {/* ── Feedback ── */}
      {activeSection === "feedback" && (
        <div className="animate-fade-in">
          <div className="flex gap-2 mb-4">
            {([{ key: "bug", label: "Баг-репорт", icon: Bug }, { key: "feature", label: "Идея / запрос", icon: Lightbulb }, { key: "nps", label: "Оценка (NPS)", icon: Star }] as const).map(f => (
              <button key={f.key} onClick={() => setFeedbackType(f.key)} className={`flex-1 py-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-1.5 ${feedbackType === f.key ? "border-primary bg-primary/5" : "border-border"}`}>
                <f.icon className="h-4 w-4" /> {f.label}
              </button>
            ))}
          </div>

          {feedbackType === "bug" && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-semibold text-sm">Сообщить об ошибке</h3>
              <p className="text-xs text-muted-foreground">Системные данные (браузер, версия, ОС) будут собраны автоматически</p>
              <div>
                <label className="text-xs text-muted-foreground">Шаги для воспроизведения</label>
                <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3} className={`${inputCls} mt-1 resize-none`} placeholder="1. Открыл страницу...&#10;2. Нажал кнопку...&#10;3. Увидел ошибку..." />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-1"><Upload className="h-4 w-4" /> Скриншот</button>
                <button className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-1"><Camera className="h-4 w-4" /> Запись экрана</button>
              </div>
              <button className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Отправить</button>
            </div>
          )}

          {feedbackType === "feature" && (
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-semibold text-sm">Предложить функцию</h3>
              <div>
                <label className="text-xs text-muted-foreground">Описание идеи</label>
                <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} rows={3} className={`${inputCls} mt-1 resize-none`} placeholder="Было бы здорово если..." />
              </div>
              <p className="text-xs text-muted-foreground">💡 Другие пользователи смогут голосовать за вашу идею</p>
              <button className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Предложить</button>
            </div>
          )}

          {feedbackType === "nps" && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-semibold text-sm mb-3">Насколько вы рекомендуете Промт-Студию?</h3>
              <div className="flex gap-1 mb-4 justify-center">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setNpsScore(n)} className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${npsScore === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-4">
                <span>Точно нет</span>
                <span>Обязательно!</span>
              </div>
              {npsScore && (
                <div>
                  <textarea placeholder="Что можно улучшить?" rows={2} className={`${inputCls} resize-none mb-3`} />
                  <button className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Отправить оценку</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
