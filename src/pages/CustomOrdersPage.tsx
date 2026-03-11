import { useState } from "react";
import {
  Plus, Search, Filter, Send, Star, Clock, DollarSign, MessageSquare,
  Upload, X, Check, ChevronRight, Eye, FileText, AlertTriangle,
  Shield, User, ArrowRight, Paperclip, ThumbsUp, ThumbsDown, Flag,
  CheckCircle, XCircle, RefreshCw, Lock, Download, BarChart3
} from "lucide-react";

type OrdersTab = "feed" | "my-orders" | "my-proposals" | "create";

type OrderStatus = "open" | "in_progress" | "review" | "revision" | "completed" | "disputed" | "cancelled";

interface CustomOrder {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number };
  deadline: string;
  status: OrderStatus;
  clientName: string;
  clientRating: number;
  clientVerified: boolean;
  proposalCount: number;
  createdAt: string;
  files: number;
}

interface Proposal {
  id: string;
  orderId: string;
  orderTitle: string;
  authorName: string;
  authorRating: number;
  authorLevel: "newbie" | "verified" | "expert" | "partner";
  price: number;
  deadline: string;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected" | "counter";
  submittedAt: string;
}

interface OrderMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  attachments?: string[];
}

const statusLabels: Record<OrderStatus, string> = {
  open: "Открыт",
  in_progress: "В работе",
  review: "На проверке",
  revision: "Доработка",
  completed: "Завершён",
  disputed: "Спор",
  cancelled: "Отменён",
};

const statusColors: Record<OrderStatus, string> = {
  open: "bg-success/10 text-success",
  in_progress: "bg-primary/10 text-primary",
  review: "bg-warning/10 text-warning",
  revision: "bg-warning/10 text-warning",
  completed: "bg-success/10 text-success",
  disputed: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const levelLabels: Record<string, string> = {
  newbie: "Новичок",
  verified: "Верифицирован",
  expert: "Эксперт",
  partner: "Партнёр",
};

const levelColors: Record<string, string> = {
  newbie: "text-muted-foreground",
  verified: "text-primary",
  expert: "text-success",
  partner: "text-warning",
};

const categories = [
  "Текст и копирайтинг",
  "Визуал и дизайн",
  "Видео и аудио",
  "Код и разработка",
  "Бизнес и маркетинг",
  "Обучение и наука",
  "Стиль жизни",
];

// orders will be fetched from the backend
const mockOrders: CustomOrder[] = [];

// proposals loaded from backend
const mockProposals: Proposal[] = [];

// order chat messages from backend
const mockMessages: OrderMessage[] = [];

export default function CustomOrdersPage() {
  const [activeTab, setActiveTab] = useState<OrdersTab>("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Create order form state
  const [orderForm, setOrderForm] = useState({
    title: "",
    category: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    requirements: "",
  });

  // Proposal form state
  const [proposalForm, setProposalForm] = useState({
    price: "",
    deadline: "",
    coverLetter: "",
  });

  // Chat message state
  const [chatMessage, setChatMessage] = useState("");

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    quality: 5,
    communication: 5,
    timeliness: 5,
    text: "",
  });

  const tabItems: { key: OrdersTab; label: string }[] = [
    { key: "feed", label: "Лента заказов" },
    { key: "my-orders", label: "Мои заказы" },
    { key: "my-proposals", label: "Мои предложения" },
    { key: "create", label: "Создать заказ" },
  ];

  const filteredOrders = mockOrders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!o.title.toLowerCase().includes(q) && !o.description.toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Заказные промпты</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Создавайте заказы или предлагайте свои услуги
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {activeTab === "feed" && (
        <div className="space-y-4 animate-fade-in">
          {/* Search & filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск заказов..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm"
            >
              <option value="all">Все категории</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Orders list */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Пока нет заказов. Попробуйте изменить фильтры или проверьте позже.
              </p>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm">{order.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{order.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {order.budget.min.toLocaleString()} — {order.budget.max.toLocaleString()} ₽
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      до {order.deadline}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {order.proposalCount} предложений
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {order.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {order.clientName[0]}
                    </div>
                    <span className="text-xs font-medium">{order.clientName}</span>
                    {order.clientVerified && (
                      <Shield className="h-3 w-3 text-primary" />
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-warning fill-warning" />
                      <span className="text-xs">{order.clientRating}</span>
                    </div>
                    {order.files > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {order.files} файлов
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* My Orders Tab */}
      {activeTab === "my-orders" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2 mb-2">
            {(["all", "open", "in_progress", "review", "completed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  statusFilter === s
                    ? "gradient-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground"
                }`}
              >
                {s === "all" ? "Все" : statusLabels[s]}
              </button>
            ))}
          </div>

          {(() => {
            const myFiltered = mockOrders.filter((o) =>
              statusFilter === "all" ? true : o.status === statusFilter
            );
            if (myFiltered.length === 0) {
              return (
                <p className="text-center text-sm text-muted-foreground py-6">
                  У вас нет заказов в выбранном статусе.
                </p>
              );
            }
            return myFiltered.slice(0, 2).map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{order.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span>{order.budget.min.toLocaleString()} — {order.budget.max.toLocaleString()} ₽</span>
                  <span>до {order.deadline}</span>
                  <span>{order.proposalCount} предложений</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedOrder(order); }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground"
                  >
                    Предложения
                  </button>
                  <button
                    onClick={() => setShowChat(true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Чат
                  </button>
                  {order.status === "review" && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="text-xs px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground"
                    >
                      Принять работу
                    </button>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* My Proposals Tab */}
      {activeTab === "my-proposals" && (
        <div className="space-y-3 animate-fade-in">
          {mockProposals.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              Вы ещё не отправляли предложения. Они появятся здесь после публикации заказа.
            </p>
          ) : (
            mockProposals.map((proposal) => (
              <div key={proposal.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Заказ: {proposal.orderTitle}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{proposal.price.toLocaleString()} ₽</p>
                      <span className="text-xs text-muted-foreground">до {proposal.deadline}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      proposal.status === "accepted"
                        ? "bg-success/10 text-success"
                        : proposal.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : proposal.status === "counter"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {proposal.status === "accepted"
                      ? "Принято"
                      : proposal.status === "rejected"
                      ? "Отклонено"
                      : proposal.status === "counter"
                      ? "Контр-предложение"
                      : "На рассмотрении"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{proposal.coverLetter}</p>
                {proposal.status === "accepted" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setShowChat(true)}
                      className="text-xs px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground flex items-center gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Открыть чат
                    </button>
                    <button className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      Сдать работу
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Order Tab */}
      {activeTab === "create" && (
        <div className="max-w-2xl space-y-4 animate-fade-in">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Название заказа *</label>
              <input
                type="text"
                value={orderForm.title}
                onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                placeholder="Краткое описание задачи (до 100 символов)"
                maxLength={100}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{orderForm.title.length}/100</p>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Категория *</label>
              <select
                value={orderForm.category}
                onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm"
              >
                <option value="">Выберите категорию</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Подробное описание *</label>
              <textarea
                value={orderForm.description}
                onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                placeholder="Опишите задачу подробно: что должен делать промпт, для какой модели, какие результаты ожидаете... (мин. 50 символов)"
                rows={5}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">{orderForm.description.length}/2000 (мин. 50)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Бюджет от (₽) *</label>
                <input
                  type="number"
                  value={orderForm.budgetMin}
                  onChange={(e) => setOrderForm({ ...orderForm, budgetMin: e.target.value })}
                  placeholder="5000"
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Бюджет до (₽) *</label>
                <input
                  type="number"
                  value={orderForm.budgetMax}
                  onChange={(e) => setOrderForm({ ...orderForm, budgetMax: e.target.value })}
                  placeholder="10000"
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Дедлайн *</label>
              <input
                type="date"
                value={orderForm.deadline}
                onChange={(e) => setOrderForm({ ...orderForm, deadline: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Референсы и файлы</label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Перетащите файлы или нажмите для загрузки</p>
                <p className="text-xs text-muted-foreground mt-1">До 5 файлов, макс. 20 МБ. JPG, PNG, PDF</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-medium">Дополнительные требования</label>
              <textarea
                value={orderForm.requirements}
                onChange={(e) => setOrderForm({ ...orderForm, requirements: e.target.value })}
                placeholder="Тип лицензии, эксклюзивность, количество ревизий..."
                rows={3}
                className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm resize-none"
              />
            </div>

            <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
              <p className="font-medium mb-1">Комиссия платформы: 15%</p>
              <p>Средства будут заморожены на эскроу-счёте до завершения заказа. У вас будет 72 часа на проверку результата.</p>
            </div>

            <button className="w-full py-3 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
              Опубликовать заказ
            </button>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && !showProposalForm && !showChat && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Детали заказа</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{selectedOrder.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedOrder.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Бюджет</p>
                  <p className="font-bold text-sm">
                    {selectedOrder.budget.min.toLocaleString()} — {selectedOrder.budget.max.toLocaleString()} ₽
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Дедлайн</p>
                  <p className="font-bold text-sm">{selectedOrder.deadline}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {selectedOrder.clientName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium">{selectedOrder.clientName}</p>
                    {selectedOrder.clientVerified && <Shield className="h-3 w-3 text-primary" />}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    <span className="text-xs">{selectedOrder.clientRating}</span>
                  </div>
                </div>
              </div>

              {/* Proposals for this order */}
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Предложения ({selectedOrder.proposalCount})
                </h4>
                <div className="space-y-2">
                  {(() => {
                    const proposalsForOrder = mockProposals.filter((p) => p.orderId === selectedOrder.id);
                    if (proposalsForOrder.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground">Пока нет предложений к этому заказу.</p>
                      );
                    }
                    return proposalsForOrder.map((proposal) => (
                      <div key={proposal.id} className="p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{proposal.authorName}</span>
                            <span className={`text-xs ${levelColors[proposal.authorLevel]}`}>
                              {levelLabels[proposal.authorLevel]}
                            </span>
                          </div>
                          <p className="text-sm font-bold">{proposal.price.toLocaleString()} ₽</p>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{proposal.coverLetter}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="h-3 w-3 text-warning fill-warning" />
                          <span className="text-xs">{proposal.authorRating}</span>
                          <span className="text-xs text-muted-foreground">· до {proposal.deadline}</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {selectedOrder.status === "open" && (
                <button
                  onClick={() => setShowProposalForm(true)}
                  className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
                >
                  Отправить предложение
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Proposal submission modal */}
      {showProposalForm && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Отправить предложение</h3>
              <button onClick={() => setShowProposalForm(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted text-xs">
                <p className="font-medium">{selectedOrder.title}</p>
                <p className="text-muted-foreground mt-1">
                  Бюджет: {selectedOrder.budget.min.toLocaleString()} — {selectedOrder.budget.max.toLocaleString()} ₽
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Ваша цена (₽) *</label>
                <input
                  type="number"
                  value={proposalForm.price}
                  onChange={(e) => setProposalForm({ ...proposalForm, price: e.target.value })}
                  placeholder="7500"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Срок выполнения *</label>
                <input
                  type="date"
                  value={proposalForm.deadline}
                  onChange={(e) => setProposalForm({ ...proposalForm, deadline: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Сопроводительное письмо *</label>
                <textarea
                  value={proposalForm.coverLetter}
                  onChange={(e) => setProposalForm({ ...proposalForm, coverLetter: e.target.value })}
                  placeholder="Расскажите почему вы подходите для этого заказа..."
                  rows={4}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                Комиссия платформы: 15%. Вы получите{" "}
                {proposalForm.price
                  ? `${Math.round(Number(proposalForm.price) * 0.85).toLocaleString()} ₽`
                  : "—"}
              </div>
              <button
                onClick={() => {
                  setShowProposalForm(false);
                  setSelectedOrder(null);
                }}
                className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
              >
                Отправить предложение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-lg h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="font-bold">Чат по заказу</h3>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
              <button onClick={() => setShowChat(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockMessages.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Здесь пока нет сообщений. Начните диалог с первым сообщением.
                </p>
              ) : (
                mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.isOwn
                          ? "gradient-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      {msg.attachments && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((a) => (
                            <div key={a} className="flex items-center gap-1 text-xs opacity-80">
                              <Paperclip className="h-3 w-3" />
                              {a}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${msg.isOwn ? "opacity-70" : "text-muted-foreground"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button className="p-2.5 rounded-lg border border-border hover:bg-muted">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Сообщение..."
                className="flex-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm"
              />
              <button className="p-2.5 rounded-lg gradient-primary text-primary-foreground">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review form modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Оставить отзыв</h3>
              <button onClick={() => setShowReviewForm(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { key: "quality", label: "Качество работы" },
                { key: "communication", label: "Коммуникация" },
                { key: "timeliness", label: "Соблюдение сроков" },
              ].map((criterion) => (
                <div key={criterion.key}>
                  <label className="text-xs text-muted-foreground font-medium">{criterion.label}</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          setReviewForm({ ...reviewForm, [criterion.key]: star })
                        }
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= Number(reviewForm[criterion.key as keyof typeof reviewForm])
                              ? "text-warning fill-warning"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs text-muted-foreground font-medium">Текст отзыва</label>
                <textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="Поделитесь впечатлениями о работе..."
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Принять и оплатить
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="py-2.5 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Ревизия
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
