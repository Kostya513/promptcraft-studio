import { useState, useEffect, useRef } from "react";
import {
  Search, Star, Clock, DollarSign, MessageSquare, Upload, X,
  FileText, Shield, Paperclip, CheckCircle, RefreshCw, Lock,
  Download, Zap, Bot, Tag, Info, Save, Trash2, Edit3, TrendingUp,
  AlertCircle, HelpCircle, Sparkles, Bell, Heart, Share2, Eye,
  BarChart3, Send, User
} from "lucide-react";

// ==================== ТИПЫ ====================

type OrdersTab = "feed" | "my-orders" | "my-proposals" | "drafts" | "create";
type OrderType = "prompt" | "skill" | "agent" | "complex";
type OrderStatus = "open" | "in_progress" | "review" | "revision" | "completed" | "disputed" | "cancelled";
type VisibilityType = "public" | "private" | "hidden" | "premium_only";
type ProposalStatus = "pending" | "accepted" | "rejected" | "counter";
type UserLevel = "newbie" | "verified" | "expert" | "partner";
type NotificationType = "new_proposal" | "proposal_accepted" | "proposal_rejected" | "order_status_changed" | "new_message" | "review_left";

interface User {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  level: UserLevel;
  skills: string[];
  stats: {
    completed: number;
    inProgress: number;
    successRate: number;
    totalProposals: number;
    acceptedProposals: number;
  };
}

interface CustomOrder {
  id: string;
  client_id: string;
  clientName?: string;
  type: OrderType;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number };
  deadline: string;
  status: OrderStatus;
  proposalCount: number;
  createdAt: string;
  files: { name: string; size: number; type: string; data: string }[];
  requirements: string;
  tags: string[];
  visibility: VisibilityType;
  complexity: "low" | "medium" | "high";
  views: number;
  proposals: Proposal[];
  reviews: OrderReview[];
  complexDetails?: {
    elementCount: number;
    elementTypes: string[];
    needsIntegration: boolean;
    needsTraining: boolean;
    deliveryFormat: string;
  };
}

interface Proposal {
  id: string;
  order_id: string;
  executor_id: string;
  price: number;
  deadline: string;
  coverLetter: string;
  status: ProposalStatus;
  submittedAt: string;
  attachments?: { name: string; size: number; type: string; data: string }[];
}

interface OrderReview {
  id: string;
  orderId: string;
  authorId: string;
  authorName: string;
  rating: number;
  quality: number;
  communication: number;
  timeliness: number;
  text: string;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  text: string;
  orderId?: string;
  proposalId?: string;
  read: boolean;
  createdAt: string;
}

// ==================== КОНСТАНТЫ ====================

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

const proposalStatusLabels: Record<ProposalStatus, string> = {
  pending: "На рассмотрении",
  accepted: "Принято",
  rejected: "Отклонено",
  counter: "Контр-предложение",
};

const proposalStatusColors: Record<ProposalStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  accepted: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  counter: "bg-warning/10 text-warning",
};

const levelLabels: Record<UserLevel, string> = {
  newbie: "Новичок",
  verified: "Верифицирован",
  expert: "Эксперт",
  partner: "Партнёр",
};

const levelColors: Record<UserLevel, string> = {
  newbie: "text-muted-foreground",
  verified: "text-primary",
  expert: "text-success",
  partner: "text-warning",
};

const orderTypeLabels: Record<OrderType, string> = {
  prompt: "Промпт",
  skill: "Скил",
  agent: "AI-агент",
  complex: "Комплексное решение",
};

const orderTypeIcons: Record<OrderType, JSX.Element> = {
  prompt: <FileText className="h-3 w-3" />,
  skill: <Zap className="h-3 w-3" />,
  agent: <Bot className="h-3 w-3" />,
  complex: <CheckCircle className="h-3 w-3" />,
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

const popularTags = [
  "GPT-4", "Midjourney", "DALL-E", "Claude", "Stable Diffusion",
  "Telegram", "Discord", "API", "Автоматизация", "Бот",
  "Копирайтинг", "SEO", "SMM", "Дизайн", "Видео",
  "React", "Python", "JavaScript", "Node.js", "TypeScript",
  "Бизнес", "Маркетинг", "Продажи", "Аналитика", "Обучение"
];

const orderTemplates = [
  {
    id: "template_1",
    name: "Промпт для генерации изображений",
    type: "prompt" as OrderType,
    category: "Визуал и дизайн",
    title: "Промпт для Midjourney — корпоративный стиль",
    description: "Нужен промпт для генерации изображений в корпоративном стиле. Изображения будут использоваться для сайта и социальных сетей. Стиль: минимализм, современные цвета. Примеры референсов прилагаются.",
    budgetMin: 3000,
    budgetMax: 8000,
    tags: ["Midjourney", "Дизайн", "GPT-4"],
  },
  {
    id: "template_2",
    name: "Скил для автоматизации email",
    type: "skill" as OrderType,
    category: "Бизнес и маркетинг",
    title: "Автоматизация email-рассылок",
    description: "Нужен скил для автоматической обработки входящих писем и отправки ответов. Интеграция с Gmail и CRM. Триггер: новое письмо с определённой темой. Результат: автоматический ответ + запись в CRM.",
    budgetMin: 15000,
    budgetMax: 35000,
    tags: ["Автоматизация", "API", "Бизнес"],
  },
  {
    id: "template_3",
    name: "AI-агент для customer support",
    type: "agent" as OrderType,
    category: "Бизнес и маркетинг",
    title: "AI-агент для поддержки клиентов",
    description: "Нужен AI-агент для обработки запросов клиентов в Telegram. Агент должен отвечать на частые вопросы, собирать данные для тикетов, эскалировать сложные случаи оператору. Интеграции: Telegram API, CRM, база знаний.",
    budgetMin: 50000,
    budgetMax: 120000,
    tags: ["Telegram", "Бот", "API", "Автоматизация"],
  },
  {
    id: "template_4",
    name: "Комплекс для запуска продукта",
    type: "complex" as OrderType,
    category: "Бизнес и маркетинг",
    title: "Комплексное решение для запуска продукта",
    description: "Нужен комплекс: промпты для генерации контента, скил для автоматизации публикаций, AI-агент для аналитики. Всё должно работать вместе. Документация и обучение обязательны.",
    budgetMin: 100000,
    budgetMax: 250000,
    tags: ["Комплекс", "Маркетинг", "Автоматизация"],
    complexDetails: {
      elementCount: 5,
      elementTypes: ["prompts", "skills", "agents", "documentation"],
      needsIntegration: true,
      needsTraining: true,
      deliveryFormat: "zip",
    },
  },
];

const checklistItems = [
  "Чётко опишите задачу и ожидаемый результат",
  "Укажите модель AI (GPT-4, Claude, Midjourney и т.д.)",
  "Приложите примеры и референсы",
  "Укажите бюджет и сроки реалистично",
  "Опишите формат сдачи работы",
  "Укажите количество ревизий",
  "Добавьте теги для лучшего поиска",
];

// ==================== КОМПОНЕНТ ====================

export default function CustomOrdersPage() {
  // ===== СОСТОЯНИЯ =====
  const [activeTab, setActiveTab] = useState<OrdersTab>("feed");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [complexityFilter, setComplexityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_new");
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showChecklist, setShowChecklist] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<CustomOrder | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [drafts, setDrafts] = useState<CustomOrder[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [orderForm, setOrderForm] = useState({
    type: "prompt" as OrderType,
    title: "",
    category: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    requirements: "",
    visibility: "public" as VisibilityType,
    anonymous: false,
  });

  const [complexForm, setComplexForm] = useState({
    elementCount: 3,
    elementTypes: [] as string[],
    needsIntegration: false,
    needsTraining: false,
    deliveryFormat: "zip",
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);

  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; type: string; data: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; type: string } | null>(null);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [complexityScore, setComplexityScore] = useState<"low" | "medium" | "high">("low");

  const [proposalForm, setProposalForm] = useState({
    price: "",
    deadline: "",
    coverLetter: "",
  });

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    quality: 5,
    communication: 5,
    timeliness: 5,
    text: "",
  });

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const lastDraftSavedRef = useRef<string>("");

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  useEffect(() => {
    initializeUsers();
  }, []);

  useEffect(() => {
    if (currentUserId) loadData();
  }, [currentUserId]);

  const initializeUsers = () => {
    let currentId = localStorage.getItem("custom_orders_current_user");
    let storedUsers = localStorage.getItem("custom_orders_users");

    let usersList: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    if (!currentId) {
      const newUser: User = {
        id: "user_" + Date.now(),
        name: "Пользователь " + Math.floor(Math.random() * 1000),
        avatar: "",
        rating: 5.0,
        level: "newbie",
        skills: [],
        stats: {
          completed: 0,
          inProgress: 0,
          successRate: 0,
          totalProposals: 0,
          acceptedProposals: 0,
        },
      };
      usersList.push(newUser);
      currentId = newUser.id;
      localStorage.setItem("custom_orders_current_user", currentId);
      localStorage.setItem("custom_orders_users", JSON.stringify(usersList));
    }

    setUsers(usersList);
    setCurrentUserId(currentId);
  };

  const loadData = () => {
    try {
      const savedOrders = localStorage.getItem("custom_orders");
      const savedDrafts = localStorage.getItem("custom_order_drafts");
      const savedProposals = localStorage.getItem("custom_order_proposals");
      const savedReviews = localStorage.getItem("custom_order_reviews");
      const savedNotifications = localStorage.getItem("custom_orders_notifications");
      const savedFavorites = localStorage.getItem("custom_orders_favorites");

      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedDrafts) setDrafts(JSON.parse(savedDrafts) || []);
      if (savedProposals) setProposals(JSON.parse(savedProposals) || []);
      if (savedReviews) setReviews(JSON.parse(savedReviews) || []);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications) || []);
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites) || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // ===== СОХРАНЕНИЕ В LOCALSTORAGE =====
  useEffect(() => {
    if (currentUserId) localStorage.setItem("custom_orders", JSON.stringify(orders));
  }, [orders, currentUserId]);

  useEffect(() => {
    localStorage.setItem("custom_order_drafts", JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    localStorage.setItem("custom_order_proposals", JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem("custom_order_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("custom_orders_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("custom_orders_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Автосохранение черновика каждые 30 секунд
  useEffect(() => {
    if (activeTab === "create") {
      autoSaveRef.current = setInterval(() => {
        const draftData = JSON.stringify({ ...orderForm, tags, uploadedFiles, complexForm });
        if (draftData !== lastDraftSavedRef.current && (orderForm.title || orderForm.description)) {
          saveDraft();
          lastDraftSavedRef.current = draftData;
        }
      }, 30000);
      return () => {
        if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      };
    }
  }, [activeTab, orderForm, tags, uploadedFiles, complexForm]);

  // Оценка сложности
  useEffect(() => {
    let score = 0;
    if (orderForm.description.length > 200) score += 1;
    if (orderForm.description.length > 500) score += 1;
    if (tags.length > 3) score += 1;
    if (uploadedFiles.length > 0) score += 1;
    if (orderForm.type === "complex") score += 2;
    if (orderForm.type === "agent") score += 1;
    if (complexForm.needsIntegration) score += 1;
    if (Number(orderForm.budgetMax) > 50000) score += 1;

    if (score <= 2) setComplexityScore("low");
    else if (score <= 5) setComplexityScore("medium");
    else setComplexityScore("high");
  }, [orderForm, tags, uploadedFiles, complexForm]);

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  const getCurrentUser = () => users.find(u => u.id === currentUserId);
  const getUserById = (id: string) => users.find(u => u.id === id);

  const showNotification = (type: "success" | "error" | "info", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const addNotification = (userId: string, type: NotificationType, text: string, orderId?: string, proposalId?: string) => {
    const newNotification: Notification = {
      id: "notif_" + Date.now(),
      userId,
      type,
      text,
      orderId,
      proposalId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(n => n.userId === currentUserId && !n.read).length;
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => n.userId === currentUserId ? { ...n, read: true } : n));
  };

  const daysUntil = (dateString: string) => {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isUrgent = (deadline: string) => daysUntil(deadline) < 3;
  const isPopular = (views: number) => views > 50;
  const isNew = (createdAt: string) => {
    const hours = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hours < 24;
  };

  // ===== ОБРАБОТКА ФАЙЛОВ =====
  const handleFiles = (files: File[]) => {
    const maxSize = 20 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        showNotification("error", `Файл ${file.name} слишком большой. Максимальный размер: 20 МБ`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        showNotification("error", `Файл ${file.name} имеет неподдерживаемый формат`);
        return false;
      }
      return true;
    });

    const totalFiles = uploadedFiles.length + validFiles.length;
    if (totalFiles > 5) {
      showNotification("error", "Можно загрузить не более 5 файлов");
      validFiles.splice(5 - uploadedFiles.length);
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type, data }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const openFilePreview = (file: { name: string; type: string; data: string }) => {
    setPreviewFile({ url: file.data, name: file.name, type: file.type });
  };

  const closeFilePreview = () => setPreviewFile(null);

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: { type: string }) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.includes("word") || file.type.includes("document")) return "doc";
    if (file.type === "text/plain") return "txt";
    return "file";
  };

  // ===== ТЕГИ =====
  const handleTagInput = (value: string) => {
    setTagInput(value);
    if (value.length > 1) {
      const suggestions = popularTags.filter(t =>
        t.toLowerCase().includes(value.toLowerCase()) && !tags.includes(t)
      );
      setTagSuggestions(suggestions.slice(0, 5));
    } else {
      setTagSuggestions([]);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed]);
      setTagInput("");
      setTagSuggestions([]);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // ===== ВАЛИДАЦИЯ =====
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (orderForm.title.length < 5) errors.title = "Название должно содержать минимум 5 символов";
    if (orderForm.title.length > 100) errors.title = "Название не должно превышать 100 символов";
    if (!orderForm.category) errors.category = "Выберите категорию";
    if (orderForm.description.length < 50) errors.description = "Описание должно содержать минимум 50 символов";
    if (!orderForm.budgetMin || Number(orderForm.budgetMin) <= 0) errors.budgetMin = "Укажите бюджет от";
    if (!orderForm.budgetMax || Number(orderForm.budgetMax) <= Number(orderForm.budgetMin)) errors.budgetMax = "Бюджет до должен быть больше бюджета от";
    if (!orderForm.deadline) errors.deadline = "Укажите дедлайн";
    else {
      const deadlineDate = new Date(orderForm.deadline);
      if (deadlineDate < new Date()) errors.deadline = "Дедлайн не может быть в прошлом";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== ЧЕРНОВИКИ =====
  const saveDraft = () => {
    const draftContent = {
      ...orderForm,
      tags,
      uploadedFiles,
      complexForm,
    };

    const existingDraftIndex = drafts.findIndex(d => 
      d.title === orderForm.title && 
      d.description === orderForm.description
    );

    if (existingDraftIndex >= 0) {
      const updatedDrafts = [...drafts];
      updatedDrafts[existingDraftIndex] = {
        ...updatedDrafts[existingDraftIndex],
        type: orderForm.type,
        title: orderForm.title || "Без названия",
        description: orderForm.description,
        category: orderForm.category,
        budget: { min: Number(orderForm.budgetMin) || 0, max: Number(orderForm.budgetMax) || 0 },
        deadline: orderForm.deadline,
        files: uploadedFiles,
        requirements: orderForm.requirements,
        tags,
        visibility: orderForm.visibility,
        complexity: complexityScore,
        complexDetails: orderForm.type === "complex" ? complexForm : undefined,
      };
      setDrafts(updatedDrafts);
    } else {
      const newDraft: CustomOrder = {
        id: `draft_${Date.now()}`,
        client_id: currentUserId,
        type: orderForm.type,
        title: orderForm.title || "Без названия",
        description: orderForm.description,
        category: orderForm.category,
        budget: { min: Number(orderForm.budgetMin) || 0, max: Number(orderForm.budgetMax) || 0 },
        deadline: orderForm.deadline,
        status: "open",
        proposalCount: 0,
        createdAt: new Date().toISOString(),
        files: uploadedFiles,
        requirements: orderForm.requirements,
        tags,
        visibility: orderForm.visibility,
        complexity: complexityScore,
        views: 0,
        proposals: [],
        reviews: [],
        complexDetails: orderForm.type === "complex" ? complexForm : undefined,
      };
      setDrafts([newDraft, ...drafts]);
    }

    lastDraftSavedRef.current = JSON.stringify(draftContent);
    showNotification("info", "Черновик сохранён");
  };

  const loadDraft = (draft: CustomOrder) => {
    setOrderForm({
      type: draft.type,
      title: draft.title,
      category: draft.category,
      description: draft.description,
      budgetMin: String(draft.budget.min),
      budgetMax: String(draft.budget.max),
      deadline: draft.deadline,
      requirements: draft.requirements,
      visibility: draft.visibility,
      anonymous: false,
    });
    setTags(draft.tags || []);
    setUploadedFiles(draft.files || []);
    if (draft.complexDetails) setComplexForm(draft.complexDetails);
    setActiveTab("create");
    showNotification("info", "Черновик загружен");
  };

  const deleteDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
    showNotification("info", "Черновик удалён");
  };

  // ===== ШАБЛОНЫ =====
  const applyTemplate = (template: typeof orderTemplates[0]) => {
    setOrderForm({
      type: template.type,
      title: template.title,
      category: template.category,
      description: template.description,
      budgetMin: String(template.budgetMin),
      budgetMax: String(template.budgetMax),
      deadline: "",
      requirements: "",
      visibility: "public",
      anonymous: false,
    });
    setTags(template.tags);
    if (template.complexDetails) setComplexForm(template.complexDetails);
    setShowTemplates(false);
    showNotification("success", "Шаблон применён");
  };

  // ===== ПУБЛИКАЦИЯ ЗАКАЗА =====
  const publishOrder = () => {
    if (!validateForm()) {
      showNotification("error", "Исправьте ошибки в форме");
      return;
    }

    const newOrder: CustomOrder = {
      id: `order_${Date.now()}`,
      client_id: currentUserId,
      type: orderForm.type,
      title: orderForm.title,
      description: orderForm.description,
      category: orderForm.category,
      budget: { min: Number(orderForm.budgetMin), max: Number(orderForm.budgetMax) },
      deadline: orderForm.deadline,
      status: "open",
      proposalCount: 0,
      createdAt: new Date().toISOString(),
      files: uploadedFiles,
      requirements: orderForm.requirements,
      tags,
      visibility: orderForm.visibility,
      complexity: complexityScore,
      views: 0,
      proposals: [],
      reviews: [],
      complexDetails: orderForm.type === "complex" ? complexForm : undefined,
    };

    setOrders([newOrder, ...orders]);
    setDrafts(drafts.filter(d => !(d.title === newOrder.title && d.description === newOrder.description)));

    setOrderForm({
      type: "prompt",
      title: "",
      category: "",
      description: "",
      budgetMin: "",
      budgetMax: "",
      deadline: "",
      requirements: "",
      visibility: "public",
      anonymous: false,
    });
    setTags([]);
    setUploadedFiles([]);
    setValidationErrors({});
    lastDraftSavedRef.current = "";

    showNotification("success", "Заказ опубликован!");
    setActiveTab("my-orders");
  };

  // ===== РЕДАКТИРОВАНИЕ ЗАКАЗА =====
  const startEditOrder = (order: CustomOrder) => {
    setEditingOrder(order);
    setOrderForm({
      type: order.type,
      title: order.title,
      category: order.category,
      description: order.description,
      budgetMin: String(order.budget.min),
      budgetMax: String(order.budget.max),
      deadline: order.deadline,
      requirements: order.requirements,
      visibility: order.visibility,
      anonymous: false,
    });
    setTags(order.tags);
    setUploadedFiles(order.files);
    if (order.complexDetails) setComplexForm(order.complexDetails);
    setActiveTab("create");
  };

  const saveEditedOrder = () => {
    if (!editingOrder || !validateForm()) {
      showNotification("error", "Исправьте ошибки в форме");
      return;
    }

    const updatedOrder: CustomOrder = {
      ...editingOrder,
      title: orderForm.title,
      description: orderForm.description,
      category: orderForm.category,
      budget: { min: Number(orderForm.budgetMin), max: Number(orderForm.budgetMax) },
      deadline: orderForm.deadline,
      requirements: orderForm.requirements,
      files: uploadedFiles,
      tags,
      complexDetails: orderForm.type === "complex" ? complexForm : undefined,
    };

    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditingOrder(null);
    setOrderForm({
      type: "prompt",
      title: "",
      category: "",
      description: "",
      budgetMin: "",
      budgetMax: "",
      deadline: "",
      requirements: "",
      visibility: "public",
      anonymous: false,
    });
    setTags([]);
    setUploadedFiles([]);
    setValidationErrors({});
    showNotification("success", "Заказ обновлён");
    setActiveTab("my-orders");
  };

  // ===== УДАЛЕНИЕ ЗАКАЗА =====
  const confirmDeleteOrder = () => {
    if (!orderToDelete) return;
    setOrders(orders.filter(o => o.id !== orderToDelete));
    setProposals(proposals.filter(p => p.order_id !== orderToDelete));
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
    showNotification("success", "Заказ удалён");
  };

  // ===== ПРЕДЛОЖЕНИЯ =====
  const submitProposal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!proposalForm.price || !proposalForm.deadline || !proposalForm.coverLetter) {
      showNotification("error", "Заполните все поля");
      return;
    }

    if (proposalForm.coverLetter.length < 50) {
      showNotification("error", "Сопроводительное письмо должно содержать минимум 50 символов");
      return;
    }

    const newProposal: Proposal = {
      id: `proposal_${Date.now()}`,
      order_id: orderId,
      executor_id: currentUserId,
      price: Number(proposalForm.price),
      deadline: proposalForm.deadline,
      coverLetter: proposalForm.coverLetter,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    setProposals([newProposal, ...proposals]);
    setOrders(orders.map(o => o.id === orderId ? { ...o, proposalCount: o.proposalCount + 1, proposals: [...o.proposals, newProposal] } : o));

    addNotification(order.client_id, "new_proposal", `Новое предложение на заказ "${order.title}"`, orderId, newProposal.id);

    setProposalForm({ price: "", deadline: "", coverLetter: "" });
    showNotification("success", "Предложение отправлено!");
    setShowProposalForm(false);
  };

  const acceptProposal = (proposal: Proposal) => {
    const order = orders.find(o => o.id === proposal.order_id);
    if (!order) return;

    setProposals(proposals.map(p => p.id === proposal.id ? { ...p, status: "accepted" } : p));
    setOrders(orders.map(o => o.id === order.id ? { ...o, status: "in_progress" } : o));

    addNotification(proposal.executor_id, "proposal_accepted", `Ваше предложение принято заказом "${order.title}"`, order.id, proposal.id);

    showNotification("success", "Предложение принято! Заказ перешёл в статус 'В работе'");
    setSelectedProposal(null);
  };

  const rejectProposal = (proposal: Proposal) => {
    const order = orders.find(o => o.id === proposal.order_id);
    if (!order) return;

    setProposals(proposals.map(p => p.id === proposal.id ? { ...p, status: "rejected" } : p));

    addNotification(proposal.executor_id, "proposal_rejected", `Ваше предложение отклонено заказом "${order.title}"`, order.id, proposal.id);

    showNotification("info", "Предложение отклонено");
    setSelectedProposal(null);
  };

  const cancelProposal = (proposalId: string) => {
    setProposals(proposals.filter(p => p.id !== proposalId));
    showNotification("info", "Предложение отменено");
    setSelectedProposal(null);
  };

  // ===== УПРАВЛЕНИЕ СТАТУСАМИ =====
  const closeOrder = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "cancelled" } : o));
    showNotification("info", "Заказ закрыт");
  };

  const completeOrder = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "completed" } : o));
    showNotification("success", "Заказ завершён");
  };

  const requestRevision = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: "revision" } : o));
    showNotification("info", "Заказ возвращён на доработку");
  };

  // ===== ИЗБРАННОЕ =====
  const toggleFavorite = (orderId: string) => {
    if (favorites.includes(orderId)) {
      setFavorites(favorites.filter(id => id !== orderId));
    } else {
      setFavorites([...favorites, orderId]);
    }
  };

  // ===== ПОДЕЛИТЬСЯ =====
  const shareOrder = (orderId: string) => {
    const url = window.location.origin + "/orders/" + orderId;
    navigator.clipboard.writeText(url);
    showNotification("success", "Ссылка скопирована в буфер обмена");
  };

  // ===== ОСТАВИТЬ ОТЗЫВ =====
  const submitReview = (orderId: string) => {
    if (!reviewForm.text) {
      showNotification("error", "Напишите текст отзыва");
      return;
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newReview: OrderReview = {
      id: `review_${Date.now()}`,
      orderId,
      authorId: currentUserId,
      authorName: getCurrentUser()?.name || "Вы",
      rating: reviewForm.rating,
      quality: reviewForm.quality,
      communication: reviewForm.communication,
      timeliness: reviewForm.timeliness,
      text: reviewForm.text,
      createdAt: new Date().toISOString(),
    };

    setReviews([newReview, ...reviews]);
    setOrders(orders.map(o => o.id === orderId ? { ...o, reviews: [...o.reviews, newReview] } : o));

    setReviewForm({ rating: 5, quality: 5, communication: 5, timeliness: 5, text: "" });
    showNotification("success", "Отзыв оставлен!");
    setShowReviewForm(false);
  };

  // ===== ФИЛЬТРАЦИЯ И СОРТИРОВКА =====
  const filterOrders = (ordersList: CustomOrder[]) => {
    return ordersList.filter((o) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!o.title.toLowerCase().includes(q) && !o.description.toLowerCase().includes(q)) return false;
      }
      if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
      if (orderTypeFilter !== "all" && o.type !== orderTypeFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (complexityFilter !== "all" && o.complexity !== complexityFilter) return false;

      if (budgetFilter !== "all") {
        if (budgetFilter === "до 5000" && o.budget.max > 5000) return false;
        if (budgetFilter === "5000-20000" && (o.budget.min < 5000 || o.budget.max > 20000)) return false;
        if (budgetFilter === "20000-50000" && (o.budget.min < 20000 || o.budget.max > 50000)) return false;
        if (budgetFilter === "от 50000" && o.budget.min < 50000) return false;
      }

      return true;
    });
  };

  const sortOrders = (ordersList: CustomOrder[]) => {
    const sorted = [...ordersList];
    switch (sortBy) {
      case "date_new":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "date_old":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "budget_asc":
        return sorted.sort((a, b) => a.budget.min - b.budget.min);
      case "budget_desc":
        return sorted.sort((a, b) => b.budget.max - a.budget.max);
      case "complexity_asc": {
        const complexityOrder = { low: 0, medium: 1, high: 2 };
        return sorted.sort((a, b) => complexityOrder[a.complexity] - complexityOrder[b.complexity]);
      }
      case "complexity_desc": {
        const complexityOrderDesc = { high: 0, medium: 1, low: 2 };
        return sorted.sort((a, b) => complexityOrderDesc[a.complexity] - complexityOrderDesc[b.complexity]);
      }
      case "proposals":
        return sorted.sort((a, b) => b.proposalCount - a.proposalCount);
      case "views":
        return sorted.sort((a, b) => b.views - a.views);
      default:
        return sorted;
    }
  };

  // Лента заказов: ВСЕ заказы (и свои, и чужие)
  const feedOrders = sortOrders(filterOrders(orders));
  
  // Мои заказы: ТОЛЬКО свои заказы
  const myOrders = sortOrders(filterOrders(orders.filter(o => o.client_id === currentUserId)));
  
  // Мои предложения: ТОЛЬКО свои предложения
  const myProposals = proposals.filter(p => p.executor_id === currentUserId);

  // ===== СТАТИСТИКА =====
  const getClientStats = () => {
    const clientOrders = orders.filter(o => o.client_id === currentUserId);
    const active = clientOrders.filter(o => o.status === "open").length;
    const inProgress = clientOrders.filter(o => o.status === "in_progress").length;
    const completed = clientOrders.filter(o => o.status === "completed").length;
    const cancelled = clientOrders.filter(o => o.status === "cancelled").length;
    const revision = clientOrders.filter(o => o.status === "revision").length;
    const turnover = clientOrders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.budget.max, 0);
    return { active, inProgress, completed, cancelled, revision, turnover };
  };

  const getExecutorStats = () => {
    const total = myProposals.length;
    const accepted = myProposals.filter(p => p.status === "accepted").length;
    const rejected = myProposals.filter(p => p.status === "rejected").length;
    const pending = myProposals.filter(p => p.status === "pending").length;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    return { total, accepted, rejected, pending, successRate };
  };

  // ===== TAB ITEMS =====
  const tabItems: { key: OrdersTab; label: string; count?: number }[] = [
    { key: "feed", label: "Лента заказов", count: feedOrders.length },
    { key: "my-orders", label: "Мои заказы", count: myOrders.length },
    { key: "my-proposals", label: "Мои предложения", count: myProposals.length },
    { key: "drafts", label: "Черновики", count: drafts.length },
    { key: "create", label: "Создать заказ" },
  ];

  // ===== РЕНДЕР =====
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Заказные промпты</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Создавайте заказы или предлагайте свои услуги
      </p>

      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === "success" ? "bg-success text-white" :
          notification.type === "error" ? "bg-destructive text-white" :
          "bg-primary text-white"
        }`}>
          {notification.type === "success" && <CheckCircle className="h-4 w-4" />}
          {notification.type === "error" && <AlertCircle className="h-4 w-4" />}
          {notification.type === "info" && <Info className="h-4 w-4" />}
          <span className="text-sm">{notification.text}</span>
        </div>
      )}

      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {getUnreadNotificationsCount() > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center">
              {getUnreadNotificationsCount()}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-sm">Уведомления</h3>
              <button onClick={markAllNotificationsAsRead} className="text-xs text-primary hover:underline">
                Отметить все
              </button>
            </div>
            <div>
              {notifications.filter(n => n.userId === currentUserId).length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">Нет уведомлений</p>
              ) : (
                notifications.filter(n => n.userId === currentUserId).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationAsRead(notif.id);
                      if (notif.orderId) {
                        const order = orders.find(o => o.id === notif.orderId);
                        if (order) setSelectedOrder(order);
                      }
                      setShowNotifications(false);
                    }}
                    className={`p-3 border-b border-border hover:bg-muted cursor-pointer ${!notif.read ? "bg-primary/5" : ""}`}
                  >
                    <p className={`text-sm ${!notif.read ? "font-medium" : ""}`}>{notif.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleString("ru-RU")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ВКЛАДКА: ЛЕНТА ЗАКАЗОВ - ВСЕ ЗАКАЗЫ */}
      {activeTab === "feed" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск заказов..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <select value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value as OrderType | "all")} className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm">
              <option value="all">Все типы</option>
              <option value="prompt">Промпты</option>
              <option value="skill">Скилы</option>
              <option value="agent">Агенты</option>
              <option value="complex">Комплекс</option>
            </select>

            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm">
              <option value="all">Все категории</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select value={complexityFilter} onChange={(e) => setComplexityFilter(e.target.value as any)} className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm">
              <option value="all">Все сложности</option>
              <option value="low">Лёгкий</option>
              <option value="medium">Средний</option>
              <option value="high">Сложный</option>
            </select>

            <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm">
              <option value="all">Все бюджеты</option>
              <option value="до 5000">до 5 000 ₽</option>
              <option value="5000-20000">5 000 — 20 000 ₽</option>
              <option value="20000-50000">20 000 — 50 000 ₽</option>
              <option value="от 50000">от 50 000 ₽</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 rounded-xl bg-card border border-border text-sm">
              <option value="date_new">Сначала новые</option>
              <option value="date_old">Сначала старые</option>
              <option value="budget_asc">Бюджет (возрастание)</option>
              <option value="budget_desc">Бюджет (убывание)</option>
              <option value="complexity_asc">Сложность (лёгкие → сложные)</option>
              <option value="proposals">По количеству откликов</option>
              <option value="views">По популярности</option>
            </select>
          </div>

          <div className="space-y-3">
            {feedOrders.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {orderTypeFilter === "all"
                    ? "Пока нет заказов. Будьте первым!"
                    : `Нет заказов типа "${orderTypeLabels[orderTypeFilter]}"`}
                </p>
              </div>
            ) : (
              feedOrders.map((order) => {
                const client = getUserById(order.client_id);
                const isFavorite = favorites.includes(order.id);
                const isOwnOrder = order.client_id === currentUserId;

                return (
                  <div
                    key={order.id}
                    className="rounded-xl border border-border bg-card p-4 hover:shadow-card-hover transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 cursor-pointer" onClick={() => { setSelectedOrder(order); setOrders(orders.map(o => o.id === order.id ? { ...o, views: o.views + 1 } : o)); }}>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.type === "skill" ? "bg-primary/10 text-primary" :
                            order.type === "agent" ? "bg-purple-100 text-purple-700" :
                            order.type === "complex" ? "bg-success/10 text-success" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {orderTypeIcons[order.type]}
                            {orderTypeLabels[order.type]}
                          </span>
                          <h3 className="font-medium text-sm">{order.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                          {isOwnOrder && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Ваш заказ
                            </span>
                          )}
                          {isUrgent(order.deadline) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              🔴 Срочно
                            </span>
                          )}
                          {isPopular(order.views) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              🔥 Популярный
                            </span>
                          )}
                          {isNew(order.createdAt) && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                               Новый
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{order.description}</p>
                        {order.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {order.tags.slice(0, 5).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 bg-muted text-[10px] rounded-full">{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
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
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {order.views} просмотров
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {order.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {client?.name[0] || "U"}
                      </div>
                      <span className="text-xs font-medium">{client?.name || "Неизвестный"}</span>
                      {client && <Star className="h-3 w-3 text-warning fill-warning" />}
                      {order.files.length > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {order.files.length} файлов
                        </span>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(order.id); }}
                        className={`p-1.5 rounded-md hover:bg-muted transition-colors ${isFavorite ? "text-warning" : "text-muted-foreground"}`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? "fill-warning" : ""}`} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); shareOrder(order.id); }}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      {!isOwnOrder && order.status === "open" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setShowProposalForm(true); }}
                          className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          Быстрый отклик
                        </button>
                      )}
                      {isOwnOrder && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveTab("my-orders"); }}
                          className="px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium flex items-center gap-1"
                        >
                          <User className="h-3 w-3" />
                          Управление
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ВКЛАДКА: МОИ ЗАКАЗЫ */}
      {activeTab === "my-orders" && (
        <div className="space-y-4 animate-fade-in">
          {(() => {
            const stats = getClientStats();
            return (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Ваша статистика
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-xs text-green-700 mb-1">🟢 Активные</p>
                    <p className="text-2xl font-bold text-green-800">{stats.active}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">🔵 В работе</p>
                    <p className="text-2xl font-bold text-blue-800">{stats.inProgress}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xs text-success mb-1">✅ Завершено</p>
                    <p className="text-2xl font-bold text-success">{stats.completed}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted border border-border">
                    <p className="text-xs text-muted-foreground mb-1">❌ Отменено</p>
                    <p className="text-2xl font-bold text-muted-foreground">{stats.cancelled}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-xs text-warning mb-1">🔄 Доработка</p>
                    <p className="text-2xl font-bold text-warning">{stats.revision}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="text-xs text-purple-700 mb-1">💰 Оборот</p>
                    <p className="text-lg font-bold text-purple-800">{stats.turnover.toLocaleString()} ₽</p>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="flex gap-2 mb-2 flex-wrap">
            {(["all", "open", "in_progress", "review", "completed", "cancelled"] as const).map((s) => (
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

          {myOrders.filter(o => statusFilter === "all" || o.status === statusFilter).length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">У вас нет заказов</p>
              <button onClick={() => setActiveTab("create")} className="mt-4 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm">
                Создать заказ
              </button>
            </div>
          ) : (
            myOrders.filter(o => statusFilter === "all" || o.status === statusFilter).map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      order.type === "skill" ? "bg-primary/10 text-primary" :
                      order.type === "agent" ? "bg-purple-100 text-purple-700" :
                      order.type === "complex" ? "bg-success/10 text-success" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {orderTypeIcons[order.type]}
                      {orderTypeLabels[order.type]}
                    </span>
                    <h3 className="font-medium text-sm">{order.title}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                  <span>{order.budget.min.toLocaleString()} — {order.budget.max.toLocaleString()} ₽</span>
                  <span>до {order.deadline}</span>
                  <span>{order.proposalCount} предложений</span>
                  <span>{order.views} просмотров</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setSelectedOrder(order)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Детали
                  </button>
                  {order.status === "open" && (
                    <>
                      <button onClick={() => startEditOrder(order)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Редактировать
                      </button>
                      <button onClick={() => { setOrderToDelete(order.id); setShowDeleteConfirm(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> Удалить
                      </button>
                      <button onClick={() => closeOrder(order.id)} className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground flex items-center gap-1">
                        <X className="h-3 w-3" /> Закрыть
                      </button>
                    </>
                  )}
                  {(order.status === "cancelled" || order.status === "disputed") && (
                    <button onClick={() => { setOrderToDelete(order.id); setShowDeleteConfirm(true); }} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Удалить
                    </button>
                  )}
                  {order.status === "in_progress" && (
                    <button onClick={() => setShowChat(true)} className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Чат
                    </button>
                  )}
                  {order.status === "review" && (
                    <>
                      <button onClick={() => completeOrder(order.id)} className="text-xs px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Принять работу
                      </button>
                      <button onClick={() => requestRevision(order.id)} className="text-xs px-3 py-1.5 rounded-lg bg-warning/10 text-warning flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" /> Доработать
                      </button>
                    </>
                  )}
                  {order.status === "completed" && (
                    <button onClick={() => { setSelectedOrder(order); setShowReviewForm(true); }} className="text-xs px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" /> Оставить отзыв
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ВКЛАДКА: МОИ ПРЕДЛОЖЕНИЯ */}
      {activeTab === "my-proposals" && (
        <div className="space-y-4 animate-fade-in">
          {(() => {
            const stats = getExecutorStats();
            return (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Ваша статистика
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground mb-1">Отправлено</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <p className="text-xs text-success mb-1">Принято</p>
                    <p className="text-2xl font-bold text-success">{stats.accepted}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-xs text-destructive mb-1">Отклонено</p>
                    <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <p className="text-xs text-warning mb-1">На рассмотрении</p>
                    <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary mb-1">Успех</p>
                    <p className="text-2xl font-bold text-primary">{stats.successRate}%</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {myProposals.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Вы ещё не отправляли предложения</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myProposals.map((proposal) => {
                const order = orders.find(o => o.id === proposal.order_id);
                if (!order) return null;

                return (
                  <div
                    key={proposal.id}
                    onClick={() => setSelectedProposal(proposal)}
                    className="rounded-xl border border-border bg-card p-4 hover:shadow-card-hover transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Заказ: {order.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{proposal.price.toLocaleString()} ₽</p>
                          <span className="text-xs text-muted-foreground">до {proposal.deadline}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${proposalStatusColors[proposal.status]}`}>
                        {proposalStatusLabels[proposal.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{proposal.coverLetter}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Отправлено: {new Date(proposal.submittedAt).toLocaleDateString("ru-RU")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ВКЛАДКА: ЧЕРНОВИКИ */}
      {activeTab === "drafts" && (
        <div className="space-y-3 animate-fade-in">
          {drafts.length === 0 ? (
            <div className="text-center py-12">
              <Save className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Нет сохранённых черновиков</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <div key={draft.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted`}>
                      {orderTypeIcons[draft.type]}
                      {orderTypeLabels[draft.type]}
                    </span>
                    <h3 className="font-medium text-sm">{draft.title}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(draft.createdAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{draft.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => loadDraft(draft)} className="text-xs px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground flex items-center gap-1">
                    <Edit3 className="h-3 w-3" /> Редактировать
                  </button>
                  <button onClick={() => deleteDraft(draft.id)} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> Удалить
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ВКЛАДКА: СОЗДАТЬ ЗАКАЗ */}
      {activeTab === "create" && (
        <div className="flex gap-4 animate-fade-in">
          <div className="flex-1 max-w-2xl space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 block">Тип заказа *</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "prompt", label: "Промпт", icon: <FileText className="h-4 w-4" />, desc: "Текстовый промт" },
                    { key: "skill", label: "Скил", icon: <Zap className="h-4 w-4" />, desc: "Автоматизация" },
                    { key: "agent", label: "AI-агент", icon: <Bot className="h-4 w-4" />, desc: "Интеллектуальный агент" },
                    { key: "complex", label: "Комплекс", icon: <CheckCircle className="h-4 w-4" />, desc: "Несколько элементов" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setOrderForm({ ...orderForm, type: t.key as OrderType })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        orderForm.type === t.key
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className={`flex items-center gap-2 mb-1 ${orderForm.type === t.key ? "text-primary" : "text-muted-foreground"}`}>
                        {t.icon}
                        <span className="text-sm font-semibold">{t.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Название заказа *</label>
                <input
                  type="text"
                  value={orderForm.title}
                  onChange={(e) => setOrderForm({ ...orderForm, title: e.target.value })}
                  placeholder="Краткое описание задачи (до 100 символов)"
                  maxLength={100}
                  className={`w-full mt-1 px-3 py-2.5 rounded-lg bg-background border text-sm focus:outline-none focus:ring-2 ${
                    validationErrors.title ? "border-destructive focus:ring-destructive/30" : "border-border focus:ring-primary/30"
                  }`}
                />
                {validationErrors.title && <p className="text-xs text-destructive mt-1">{validationErrors.title}</p>}
                <p className="text-xs text-muted-foreground mt-1 text-right">{orderForm.title.length}/100</p>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Категория *</label>
                <select
                  value={orderForm.category}
                  onChange={(e) => setOrderForm({ ...orderForm, category: e.target.value })}
                  className={`w-full mt-1 px-3 py-2.5 rounded-lg bg-background border text-sm ${
                    validationErrors.category ? "border-destructive" : "border-border"
                  }`}
                >
                  <option value="">Выберите категорию</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {validationErrors.category && <p className="text-xs text-destructive mt-1">{validationErrors.category}</p>}
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Подробное описание *</label>
                <textarea
                  value={orderForm.description}
                  onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                  placeholder={
                    orderForm.type === "skill" ? "Опишите бизнес-процесс..." :
                    orderForm.type === "agent" ? "Опишите задачи агента..." :
                    "Опишите задачу подробно... (мин. 50 символов)"
                  }
                  rows={5}
                  className={`w-full mt-1 px-3 py-2.5 rounded-lg bg-background border text-sm resize-none focus:outline-none focus:ring-2 ${
                    validationErrors.description ? "border-destructive focus:ring-destructive/30" : "border-border focus:ring-primary/30"
                  }`}
                />
                {validationErrors.description && <p className="text-xs text-destructive mt-1">{validationErrors.description}</p>}
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
                    className={`w-full mt-1 px-3 py-2.5 rounded-lg bg-background border text-sm ${
                      validationErrors.budgetMin ? "border-destructive" : "border-border"
                    }`}
                  />
                  {validationErrors.budgetMin && <p className="text-xs text-destructive mt-1">{validationErrors.budgetMin}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Бюджет до (₽) *</label>
                  <input
                    type="number"
                    value={orderForm.budgetMax}
                    onChange={(e) => setOrderForm({ ...orderForm, budgetMax: e.target.value })}
                    placeholder="10000"
                    className={`w-full mt-1 px-3 py-2.5 rounded-lg bg-background border text-sm ${
                      validationErrors.budgetMax ? "border-destructive" : "border-border"
                    }`}
                  />
                  {validationErrors.budgetMax && <p className="text-xs text-destructive mt-1">{validationErrors.budgetMax}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Дедлайн *</label>
                <input
                  type="date"
                  value={orderForm.deadline}
                  onChange={(e) => setOrderForm({ ...orderForm, deadline: e.target.value })}
                  className={`w-full mt-1 px-3 py-2.5 rounded-lg bg-background border text-sm ${
                    validationErrors.deadline ? "border-destructive" : "border-border"
                  }`}
                />
                {validationErrors.deadline && <p className="text-xs text-destructive mt-1">{validationErrors.deadline}</p>}
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Референсы и файлы</label>
                <div
                  className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${
                    isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files)); }}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Перетащите файлы или нажмите для загрузки</p>
                  <p className="text-xs text-muted-foreground mt-1">До 5 файлов, макс. 20 МБ. JPG, PNG, PDF, DOC, DOCX, TXT</p>
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
                    onChange={(e) => { if (e.target.files) handleFiles(Array.from(e.target.files)); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => {
                      const fileType = getFileIcon(file);
                      const isImage = fileType === "image";
                      return (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted border border-border">
                          {isImage ? (
                            <img src={file.data} alt={file.name} className="h-12 w-12 rounded-md object-cover cursor-pointer" onClick={() => openFilePreview(file)} />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-background border border-border flex items-center justify-center">
                              <FileText className={`h-6 w-6 ${
                                fileType === "pdf" ? "text-red-500" :
                                fileType === "doc" ? "text-blue-500" :
                                fileType === "txt" ? "text-gray-500" : "text-muted-foreground"
                              }`} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openFilePreview(file)}>
                            <p className="text-xs font-medium truncate">{file.name}</p>
                            <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openFilePreview(file)} className="p-1.5 rounded-md hover:bg-background"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                            <button onClick={() => removeFile(index)} className="p-1.5 rounded-md hover:bg-destructive/10"><X className="h-3.5 w-3.5 text-destructive" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Теги (до 10)</label>
                <div className="flex flex-wrap gap-1 mt-2 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="Введите тег и нажмите Enter"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm"
                  />
                  {tagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                      {tagSuggestions.map((s) => (
                        <button key={s} onClick={() => addTag(s)} className="w-full px-3 py-2 text-left text-sm hover:bg-muted">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {orderForm.type === "complex" && (
                <div className="p-3 rounded-lg bg-muted space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Детали комплексного заказа
                  </h4>
                  <div>
                    <label className="text-xs text-muted-foreground">Количество элементов</label>
                    <input
                      type="number"
                      value={complexForm.elementCount}
                      onChange={(e) => setComplexForm({ ...complexForm, elementCount: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Типы элементов</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "prompts", label: "Промпты" },
                        { key: "skills", label: "Скилы" },
                        { key: "agents", label: "Агенты" },
                        { key: "documentation", label: "Документация" },
                      ].map((el) => (
                        <label key={el.key} className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={complexForm.elementTypes.includes(el.key)}
                            onChange={(e) => {
                              if (e.target.checked) setComplexForm({ ...complexForm, elementTypes: [...complexForm.elementTypes, el.key] });
                              else setComplexForm({ ...complexForm, elementTypes: complexForm.elementTypes.filter(t => t !== el.key) });
                            }}
                          />
                          {el.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={complexForm.needsIntegration} onChange={(e) => setComplexForm({ ...complexForm, needsIntegration: e.target.checked })} />
                      Нужна интеграция
                    </label>
                    <label className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={complexForm.needsTraining} onChange={(e) => setComplexForm({ ...complexForm, needsTraining: e.target.checked })} />
                      Нужно обучение
                    </label>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Формат сдачи</label>
                    <select
                      value={complexForm.deliveryFormat}
                      onChange={(e) => setComplexForm({ ...complexForm, deliveryFormat: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                    >
                      <option value="zip">ZIP архив</option>
                      <option value="github">GitHub репозиторий</option>
                      <option value="docs">Документация</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-muted space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Видимость заказа
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "public", label: "Публичный", desc: "Виден всем" },
                    { key: "private", label: "Приватный", desc: "Только избранным" },
                    { key: "hidden", label: "Скрытый", desc: "По ссылке" },
                    { key: "premium_only", label: "Премиум", desc: "Только премиум" },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setOrderForm({ ...orderForm, visibility: v.key as VisibilityType })}
                      className={`p-2 rounded-lg border text-left text-xs ${
                        orderForm.visibility === v.key ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <p className="font-medium">{v.label}</p>
                      <p className="text-muted-foreground text-[10px]">{v.desc}</p>
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={orderForm.anonymous} onChange={(e) => setOrderForm({ ...orderForm, anonymous: e.target.checked })} />
                  Опубликовать анонимно
                </label>
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

              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Сложность заказа
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    complexityScore === "low" ? "bg-green-100 text-green-700" :
                    complexityScore === "medium" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {complexityScore === "low" ? "Лёгкий" : complexityScore === "medium" ? "Средний" : "Сложный"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div className={`h-full transition-all ${
                    complexityScore === "low" ? "w-1/3 bg-green-500" :
                    complexityScore === "medium" ? "w-2/3 bg-yellow-500" :
                    "w-full bg-red-500"
                  }`} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                <p className="font-medium mb-1">Комиссия платформы: 15%</p>
                <p>Средства будут заморожены на эскроу-счёте до завершения заказа. У вас будет 72 часа на проверку результата.</p>
              </div>

              <div className="flex gap-2">
                <button onClick={saveDraft} className="flex-1 py-3 rounded-lg border border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted">
                  <Save className="h-4 w-4" /> Сохранить черновик
                </button>
                <button onClick={() => setShowPreview(true)} className="flex-1 py-3 rounded-lg border border-border text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted">
                  <Eye className="h-4 w-4" /> Предпросмотр
                </button>
              </div>
              {editingOrder ? (
                <button onClick={saveEditedOrder} className="w-full py-3 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                  Сохранить изменения
                </button>
              ) : (
                <button onClick={publishOrder} className="w-full py-3 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                  Опубликовать заказ
                </button>
              )}
            </div>
          </div>

          {showChecklist && (
            <div className="w-64 flex-shrink-0">
              <div className="rounded-xl border border-border bg-card p-4 sticky top-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" /> Чек-лист
                  </h4>
                  <button onClick={() => setShowChecklist(false)} className="p-1 rounded hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {checklistItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="w-full mt-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Шаблоны
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ПРЕДПРОСМОТР ФАЙЛА */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-sm truncate">{previewFile.name}</h3>
              <button onClick={closeFilePreview} className="p-2 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/30">
              {previewFile.type.startsWith("image/") ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Предпросмотр недоступен</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ПРЕДПРОСМОТР ЗАКАЗА */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-lg">Предпросмотр заказа</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  orderForm.type === "skill" ? "bg-primary/10 text-primary" :
                  orderForm.type === "agent" ? "bg-purple-100 text-purple-700" :
                  orderForm.type === "complex" ? "bg-success/10 text-success" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {orderTypeIcons[orderForm.type]}
                  {orderTypeLabels[orderForm.type]}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  complexityScore === "low" ? "bg-green-100 text-green-700" :
                  complexityScore === "medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {complexityScore === "low" ? "Лёгкий" : complexityScore === "medium" ? "Средний" : "Сложный"}
                </span>
              </div>
              <h2 className="text-xl font-bold">{orderForm.title || "Без названия"}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{orderForm.description || "Описание не заполнено"}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-muted text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Бюджет</p>
                  <p className="font-bold">{orderForm.budgetMin || "0"} — {orderForm.budgetMax || "0"} ₽</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Дедлайн</p>
                  <p className="font-bold">{orderForm.deadline || "Не указан"}</p>
                </div>
              </div>
              {uploadedFiles.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Файлы ({uploadedFiles.length})</p>
                  <div className="space-y-1">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-muted">
                        <FileText className="h-3 w-3" />
                        <span>{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button onClick={() => setShowPreview(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm">Закрыть</button>
              <button onClick={() => { setShowPreview(false); publishOrder(); }} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ШАБЛОНЫ */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Шаблоны заказов
              </h3>
              <button onClick={() => setShowTemplates(false)} className="p-2 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              {orderTemplates.map((template) => (
                <div key={template.id} className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      template.type === "skill" ? "bg-primary/10 text-primary" :
                      template.type === "agent" ? "bg-purple-100 text-purple-700" :
                      template.type === "complex" ? "bg-success/10 text-success" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {orderTypeIcons[template.type]}
                      {orderTypeLabels[template.type]}
                    </span>
                    <h4 className="font-medium text-sm">{template.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{template.budgetMin.toLocaleString()} — {template.budgetMax.toLocaleString()} ₽</span>
                    <button onClick={() => applyTemplate(template)} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium">
                      Использовать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ДЕТАЛИ ЗАКАЗА */}
      {selectedOrder && !showProposalForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Детали заказа</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedOrder.type === "skill" ? "bg-primary/10 text-primary" :
                    selectedOrder.type === "agent" ? "bg-purple-100 text-purple-700" :
                    selectedOrder.type === "complex" ? "bg-success/10 text-success" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {orderTypeIcons[selectedOrder.type]}
                    {orderTypeLabels[selectedOrder.type]}
                  </span>
                  <h4 className="font-semibold">{selectedOrder.title}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedOrder.status]}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{selectedOrder.description}</p>
                {selectedOrder.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedOrder.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-muted text-[10px] rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Бюджет</p>
                  <p className="font-bold text-sm">{selectedOrder.budget.min.toLocaleString()} — {selectedOrder.budget.max.toLocaleString()} ₽</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Дедлайн</p>
                  <p className="font-bold text-sm">{selectedOrder.deadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {getUserById(selectedOrder.client_id)?.name[0] || "U"}
                </div>
                <div>
                  <p className="text-sm font-medium">{getUserById(selectedOrder.client_id)?.name || "Неизвестный"}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    <span className="text-xs">{getUserById(selectedOrder.client_id)?.rating || "5.0"}</span>
                  </div>
                </div>
              </div>
              {selectedOrder.proposals.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Предложения ({selectedOrder.proposals.length})</h4>
                  <div className="space-y-2">
                    {selectedOrder.proposals.map((p) => {
                      const executor = getUserById(p.executor_id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProposal(p)}
                          className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                {executor?.name[0] || "U"}
                              </div>
                              <span className="text-sm font-medium">{executor?.name || "Неизвестный"}</span>
                            </div>
                            <p className="text-sm font-bold">{p.price.toLocaleString()} ₽</p>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{p.coverLetter}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedOrder.status === "open" && selectedOrder.client_id !== currentUserId && (
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

      {/* МОДАЛЬНОЕ ОКНО: ДЕТАЛИ ПРЕДЛОЖЕНИЯ */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {selectedProposal.executor_id === currentUserId ? "Ваше предложение" : "Предложение"}
              </h3>
              <button onClick={() => setSelectedProposal(null)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              {(() => {
                const order = orders.find(o => o.id === selectedProposal.order_id);
                const executor = getUserById(selectedProposal.executor_id);
                if (!order) return null;

                return (
                  <>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Заказ:</p>
                      <p className="font-medium text-sm">{order.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Бюджет: {order.budget.min.toLocaleString()} — {order.budget.max.toLocaleString()} ₽
                      </p>
                    </div>

                    {selectedProposal.executor_id !== currentUserId && executor && (
                      <div className="p-3 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {executor.name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{executor.name}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-warning fill-warning" />
                              <span className="text-xs">{executor.rating}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full bg-muted ${levelColors[executor.level]}`}>
                                {levelLabels[executor.level]}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2 rounded bg-muted">
                            <p className="text-muted-foreground">Завершено</p>
                            <p className="font-bold">{executor.stats.completed}</p>
                          </div>
                          <div className="p-2 rounded bg-muted">
                            <p className="text-muted-foreground">Успех</p>
                            <p className="font-bold">{executor.stats.successRate}%</p>
                          </div>
                          <div className="p-2 rounded bg-muted">
                            <p className="text-muted-foreground">В работе</p>
                            <p className="font-bold">{executor.stats.inProgress}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Предложение:</p>
                      <div className="p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-lg font-bold">{selectedProposal.price.toLocaleString()} ₽</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${proposalStatusColors[selectedProposal.status]}`}>
                            {proposalStatusLabels[selectedProposal.status]}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Срок: до {selectedProposal.deadline}</p>
                        <p className="text-sm">{selectedProposal.coverLetter}</p>
                      </div>
                    </div>

                    {selectedProposal.executor_id === currentUserId && selectedProposal.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => cancelProposal(selectedProposal.id)} className="flex-1 py-2.5 rounded-lg border border-border text-sm">
                          Отменить
                        </button>
                      </div>
                    )}

                    {selectedOrder?.client_id === currentUserId && selectedProposal.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => acceptProposal(selectedProposal)} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                          Принять
                        </button>
                        <button onClick={() => rejectProposal(selectedProposal)} className="flex-1 py-2.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                          Отклонить
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ФОРМА ПРЕДЛОЖЕНИЯ */}
      {showProposalForm && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Отправить предложение</h3>
              <button onClick={() => { setShowProposalForm(false); setSelectedOrder(null); }} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted text-xs">
                <p className="font-medium">{selectedOrder.title}</p>
                <p className="text-muted-foreground mt-1">Бюджет: {selectedOrder.budget.min.toLocaleString()} — {selectedOrder.budget.max.toLocaleString()} ₽</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Ваша цена (₽) *</label>
                <input
                  type="number"
                  value={proposalForm.price}
                  onChange={(e) => setProposalForm({ ...proposalForm, price: e.target.value })}
                  placeholder="10000"
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
                  rows={4}
                  placeholder="Расскажите почему вы подходите для этого заказа..."
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                Комиссия: 15%. Вы получите: {proposalForm.price ? `${Math.round(Number(proposalForm.price) * 0.85).toLocaleString()} ₽` : "—"}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowProposalForm(false); setSelectedOrder(null); }} className="flex-1 py-2.5 rounded-lg border border-border text-sm">Отмена</button>
                <button onClick={() => submitProposal(selectedOrder.id)} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Отправить</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ */}
      {showDeleteConfirm && orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">Удалить заказ?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Вы уверены что хотите удалить этот заказ? Все предложения исполнителей будут безвозвратно удалены.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteConfirm(false); setOrderToDelete(null); }} className="flex-1 py-2.5 rounded-lg border border-border text-sm">Отмена</button>
              <button onClick={confirmDeleteOrder} className="flex-1 py-2.5 rounded-lg bg-destructive text-white text-sm font-medium">Удалить</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ЧАТ */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-lg h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-bold">Чат по заказу</h3>
              <button onClick={() => setShowChat(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-center text-sm text-muted-foreground py-6">Чат находится в разделе "Сообщество"</p>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО: ОТЗЫВ */}
      {showReviewForm && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-t-2xl md:rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Оставить отзыв</h3>
              <button onClick={() => setShowReviewForm(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium">Общий рейтинг</label>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                      <Star className={`h-6 w-6 ${s <= reviewForm.rating ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Качество работы</label>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm({ ...reviewForm, quality: s })}>
                      <Star className={`h-6 w-6 ${s <= reviewForm.quality ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Коммуникация</label>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm({ ...reviewForm, communication: s })}>
                      <Star className={`h-6 w-6 ${s <= reviewForm.communication ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Соблюдение сроков</label>
                <div className="flex gap-1 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewForm({ ...reviewForm, timeliness: s })}>
                      <Star className={`h-6 w-6 ${s <= reviewForm.timeliness ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Текст отзыва</label>
                <textarea
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  rows={3}
                  placeholder="Поделитесь впечатлениями о работе..."
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowReviewForm(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm">Отмена</button>
                <button onClick={() => submitReview(selectedOrder.id)} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Отправить отзыв</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}