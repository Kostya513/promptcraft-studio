import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Sun, Moon, Monitor, Trash2, AlertTriangle, Eye, EyeOff, Shield,
  Smartphone, Globe, LogOut, Link2, Link2Off, Upload, CreditCard,
  Bell, BellOff, Clock, Download, FileText, Mail, MessageSquare,
  CheckCircle, X, ChevronDown, ExternalLink, Receipt, Zap, Crown,
  QrCode, Copy, Phone, Loader2
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DataSettings } from "@/components/settings/DataSettings";

const settingsTabs = ["Профиль", "Безопасность", "Подписка", "Данные"];

const connectedServices = [
  { id: "vk", name: "ВКонтакте", connected: true, desc: "Автопубликация постов и кросс-постинг" },
  { id: "tg", name: "Telegram", connected: true, desc: "Публикация в каналы и боты" },
  { id: "youtube", name: "YouTube", connected: false, desc: "Публикация видео и описаний" },
  { id: "rutube", name: "RuTube", connected: false, desc: "Публикация видео" },
];

const mockSessions = [
  { id: "1", device: "Chrome на Windows", date: "17 фев 2026, 10:32", icon: Monitor, current: true },
  { id: "2", device: "Safari на iPhone", date: "16 фев 2026, 18:14", icon: Smartphone, current: false },
];

const roleOptions = [
  { value: "business", label: "Бизнес" },
  { value: "creative", label: "Создатель контента" },
  { value: "dev", label: "Разработчик" },
];

const mockPaymentHistory = [
  { id: "p1", date: "15 фев 2026", amount: "990 ₽", type: "Подписка PRO", receipt: true },
  { id: "p2", date: "15 янв 2026", amount: "990 ₽", type: "Подписка PRO", receipt: true },
  { id: "p3", date: "15 дек 2025", amount: "590 ₽", type: "Подписка PRO (скидка)", receipt: true },
];

const notificationChannels = [
  { key: "email" as const, label: "Email", desc: "Все уведомления на почту", icon: Mail },
  { key: "push" as const, label: "Push-уведомления", desc: "Браузерные push-уведомления", icon: Bell },
  { key: "telegram" as const, label: "Telegram-бот", desc: "Уведомления через Telegram", icon: MessageSquare },
  { key: "sms" as const, label: "SMS", desc: "Критические уведомления по SMS", icon: Phone },
];

const notificationEvents = [
  { key: "financial", label: "Финансы", desc: "Покупки, продажи, выплаты" },
  { key: "security", label: "Безопасность", desc: "Входы, пароли, 2FA" },
  { key: "content", label: "Контент", desc: "Модерация, отзывы, продажи промптов" },
  { key: "social", label: "Социальные", desc: "Лайки, комментарии, подписчики" },
  { key: "marketing", label: "Маркетинг", desc: "Акции, рекомендации (opt-in)" },
];

const plans = [
  { key: "free", name: "Free", price: 0, features: ["5 генераций/день", "Базовые модели", "Стандартная поддержка"] },
  { key: "pro", name: "PRO", price: 990, features: ["Безлимит генераций", "Все AI модели", "Приоритетная поддержка", "Тестирование промптов", "0% комиссия за вывод"] },
  { key: "business", name: "Business", price: 2999, features: ["Всё из PRO", "Командный доступ до 20 человек", "SSO интеграция", "Выделенный менеджер", "API доступ"] },
];

const promoCodes: Record<string, { discount: number; expired?: boolean }> = {
  "WELCOME10": { discount: 10 },
  "PRO50": { discount: 50 },
  "EXPIRED2025": { discount: 20, expired: true },
};

// ✅ OPTIMIZATION: Утилита для сжатия и конвертации изображений
const AvatarOptimizer = {
  // Конвертация в WebP + сжатие
  compressImage: async (file: File, maxWidth: number = 400, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        // Вычисляем размеры с сохранением пропорций
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        // Создаём canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas не поддерживается'));
          return;
        }
        
        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в WebP
        canvas.toBlob(
          (blob) => {
            canvas.remove();
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Ошибка конвертации'));
            }
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Ошибка загрузки изображения'));
      };
      
      img.src = url;
    });
  },

  // Генерация thumbnail (50x50)
  generateThumbnail: async (file: File): Promise<Blob> => {
    return AvatarOptimizer.compressImage(file, 50, 0.7);
  },

  // Кэш аватаров в localStorage
  cache: {
    set: (url: string, blob: Blob): void => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          localStorage.setItem(`avatar_cache_${url}`, JSON.stringify({
            data: base64,
            timestamp: Date.now(),
            expiry: 7 * 24 * 60 * 60 * 1000 // 7 дней
          }));
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.warn('Avatar cache save failed:', e);
      }
    },
    get: (url: string): string | null => {
      try {
        const item = localStorage.getItem(`avatar_cache_${url}`);
        if (!item) return null;
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > parsed.expiry) {
          localStorage.removeItem(`avatar_cache_${url}`);
          return null;
        }
        return parsed.data;
      } catch {
        return null;
      }
    }
  }
};

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState("Профиль");
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("pf-theme");
    if (stored) return stored;
    return "system";
  });
  const [fontScale, setFontScale] = useState(() => {
    const stored = localStorage.getItem("pf-font-scale");
    return stored ? Number(stored) : 100;
  });
  const [animations, setAnimations] = useState(() => {
    return localStorage.getItem("pf-animations") !== "false";
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && settingsTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteUnderstood, setDeleteUnderstood] = useState(false);
  const [deleteSurvey, setDeleteSurvey] = useState("");
  const [deleteCustomReason, setDeleteCustomReason] = useState("");
  const [services, setServices] = useState(connectedServices);

  // Profile form
  const [profileName, setProfileName] = useState(user.name || "");
  const [profileRole, setProfileRole] = useState(user.role);
  const [profileBio, setProfileBio] = useState(user.bio || "");
  const [profileLang, setProfileLang] = useState(user.language || "Русский");
  const [profileTz, setProfileTz] = useState(user.timezone || "Europe/Moscow");
  const [socialLinks, setSocialLinks] = useState({ vk: "", telegram: "", github: "" });

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAMethod, setTwoFAMethod] = useState<"app" | "sms">("app");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAPhone, setTwoFAPhone] = useState("");
  const backupCodes = ["A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0", "U1V2-W3X4", "Y5Z6-A7B8", "C9D0-E1F2", "G3H4-I5J6", "K7L8-M9N0"];

  // Subscription
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [subscriptionEnd] = useState(new Date(2026, 2, 15));
  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState<null | "success" | "invalid" | "expired">(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{ id: string; type: string; last4: string; status: string }[]>([
    { id: "1", type: "Карта", last4: "4242", status: "Основной" },
  ]);
  const [newCard, setNewCard] = useState({ number: "", expiry: "", cvv: "", name: "" });

  // Notifications
  const [notifChannels, setNotifChannels] = useState({ email: true, push: true, telegram: false, sms: false });
  const [notifEvents, setNotifEvents] = useState<Record<string, boolean>>({ financial: true, security: true, content: true, social: true, marketing: false });
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndFrom, setDndFrom] = useState("22:00");
  const [dndTo, setDndTo] = useState("08:00");

  // Apply font scale
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    localStorage.setItem("pf-font-scale", String(fontScale));
    return () => { document.documentElement.style.fontSize = ""; };
  }, [fontScale]);

  // Apply animations
  useEffect(() => {
    localStorage.setItem("pf-animations", String(animations));
    if (!animations) {
      document.documentElement.classList.add("no-animations");
    } else {
      document.documentElement.classList.remove("no-animations");
    }
  }, [animations]);

  // System theme listener
  useEffect(() => {
    const applyTheme = (t: string) => {
      if (t === "dark") document.documentElement.classList.add("dark");
      else if (t === "light") document.documentElement.classList.remove("dark");
      else {
        const pd = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.classList.toggle("dark", pd);
      }
      localStorage.setItem("pf-theme", t);
    };
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  // Cleanup avatar preview URL
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleServiceToggle = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, connected: !s.connected } : s));
  };

  const showSaveToast = (msg = "Настройки сохранены") => {
    toast({ title: msg, duration: 3000 });
  };

  const handleDeleteAccount = () => {
    toast({ title: "Запрос на удаление принят", description: "Все данные будут удалены в течение 30 дней согласно 152-ФЗ. Уведомление отправлено на email.", variant: "destructive", duration: 5000 });
    setShowDeleteModal(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) return;
    toast({ title: "Пароль изменён", description: "Новый пароль сохранён" });
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  const handleLogoutAll = () => toast({ title: "Все сессии завершены" });
  const handleLogoutSession = (id: string) => toast({ title: "Сессия завершена" });

  const handleSaveProfile = () => {
    setUser({ ...user, name: profileName, role: profileRole, roleLabel: roleOptions.find(r => r.value === profileRole)?.label || profileRole, bio: profileBio, language: profileLang, timezone: profileTz });
    showSaveToast("Профиль сохранён");
  };

  // === OPTIMIZED AVATAR UPLOAD FUNCTIONS ===
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Неверный формат", description: "Выберите изображение (JPG, PNG, GIF, WebP)", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Файл слишком большой", description: "Максимальный размер: 5 МБ", variant: "destructive" });
      return;
    }

    try {
      // ✅ OPTIMIZATION: Сжатие и конвертация в WebP
      setIsUploading(true);
      setUploadProgress(30);
      
      const compressedBlob = await AvatarOptimizer.compressImage(file, 400, 0.85);
      setUploadProgress(70);
      
      // Создаём preview из сжатого Blob
      const previewUrl = URL.createObjectURL(compressedBlob);
      setAvatarPreview(previewUrl);
      
      // Создаём новый File из Blob для отправки
      const optimizedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.webp'), {
        type: 'image/webp',
        lastModified: Date.now()
      });
      
      setAvatarFile(optimizedFile);
      setUploadProgress(100);
      
      toast({ title: "Изображение оптимизировано", description: `Размер уменьшен до ${(compressedBlob.size / 1024).toFixed(1)} КБ` });
      
    } catch (error: any) {
      console.error('Avatar optimization error:', error);
      // Fallback: используем оригинальный файл
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      toast({ title: "Предупреждение", description: "Не удалось оптимизировать изображение, используется оригинал", variant: "default" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast({ title: "Выберите файл", description: "Нажмите на аватар чтобы выбрать изображение", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Не авторизован');
      }

      const formData = new FormData();
      formData.append('avatar', avatarFile);
      formData.append('format', 'webp'); // Указываем формат

      console.log('📤 Загрузка оптимизированного аватара...');
      setUploadProgress(40);

      const response = await fetch('http://localhost:3000/api/users/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Ошибка загрузки');
      }

      setUploadProgress(80);
      const data = await response.json();
      
      console.log('✅ Аватар загружен:', data.avatar_url);
      
      // Создаём полный URL
      const fullAvatarUrl = data.avatar_url.startsWith('http') 
        ? data.avatar_url 
        : `http://localhost:3000${data.avatar_url}`;
      
      // ✅ OPTIMIZATION: Кэшируем аватар
      if (avatarPreview) {
        fetch(avatarPreview)
          .then(res => res.blob())
          .then(blob => AvatarOptimizer.cache.set(fullAvatarUrl, blob))
          .catch(() => {});
      }
      
      // Обновляем UserContext
      const updatedUser = { 
        ...user, 
        avatar: fullAvatarUrl,
        avatar_url: fullAvatarUrl,
        avatar_format: 'webp'
      };
      setUser(updatedUser);
      
      // Обновляем localStorage (promptcraft_user)
      const storedUser = localStorage.getItem('promptcraft_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.avatar = fullAvatarUrl;
        parsed.avatar_url = fullAvatarUrl;
        parsed.avatar_format = 'webp';
        localStorage.setItem('promptcraft_user', JSON.stringify(parsed));
      }
      
      // Обновляем localStorage (promptcraft_context)
      const contextStorage = localStorage.getItem('promptcraft_context');
      if (contextStorage) {
        const parsed = JSON.parse(contextStorage);
        if (parsed.user) {
          parsed.user.avatar = fullAvatarUrl;
          parsed.user.avatar_url = fullAvatarUrl;
          parsed.user.avatar_format = 'webp';
          localStorage.setItem('promptcraft_context', JSON.stringify(parsed));
        }
      }

      toast({ title: "Аватар обновлён", description: "Новое изображение сохранено в формате WebP" });
      
      // Очищаем состояние
      setAvatarFile(null);
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setUploadProgress(100);

    } catch (error: any) {
      console.error('❌ Avatar upload error:', error);
      toast({ 
        title: "Ошибка загрузки", 
        description: error.message || "Не удалось загрузить аватар", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 500);
    }
  };

  const handleAvatarCancel = () => {
    setAvatarFile(null);
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadProgress(0);
  };

  // ✅ OPTIMIZATION: Компонент для отображения аватара с кэшем и lazy loading
  const AvatarImage: React.FC<{ src: string; alt: string; size?: 'small' | 'medium' | 'large'; className?: string }> = ({ src, alt, size = 'medium', className = '' }) => {
    const [cachedSrc, setCachedSrc] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);

    const sizeClasses = {
      small: 'h-8 w-8',
      medium: 'h-16 w-16',
      large: 'h-24 w-24'
    };

    useEffect(() => {
      // Пытаемся получить из кэша
      const cached = AvatarOptimizer.cache.get(src);
      if (cached) {
        setCachedSrc(cached);
        setLoaded(true);
      }
    }, [src]);

    const handleLoad = () => {
      setLoaded(true);
      // Кэшируем после успешной загрузки
      if (!cachedSrc) {
        fetch(src)
          .then(res => res.blob())
          .then(blob => AvatarOptimizer.cache.set(src, blob))
          .catch(() => {});
      }
    };

    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        {!loaded && (
            <div className="absolute inset-0 rounded-full bg-muted animate-pulse" />
          )}
          <img
            src={cachedSrc || src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={handleLoad}
            className={`h-full w-full rounded-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      );
    };

  const handleExportData = () => {
    const exportData = {
      profile: { name: user.name, email: user.email, role: user.role, bio: user.bio, language: user.language, timezone: user.timezone },
      stats: { prompts: user.promptsCount, purchases: user.purchasesCount, services: user.servicesCount },
      settings: { theme, fontScale, animations, notifications: { channels: notifChannels, events: notifEvents, dnd: { enabled: dndEnabled, from: dndFrom, to: dndTo } } },
      purchases: mockPaymentHistory,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promt-studiya_export_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Экспорт завершён", description: "Файл с данными скачан", duration: 3000 });
  };

  const handleApplyPromo = () => {
    const code = promoCodes[promoCode.toUpperCase().trim()];
    if (!code) {
      setPromoStatus("invalid");
      toast({ title: "Промокод недействителен", variant: "destructive", duration: 5000 });
    } else if (code.expired) {
      setPromoStatus("expired");
      toast({ title: "Промокод истёк", description: "Срок действия промокода закончился", duration: 5000 });
    } else {
      setPromoStatus("success");
      setPromoDiscount(code.discount);
      toast({ title: `Скидка ${code.discount}% применена!`, description: "Скидка будет учтена при следующей оплате", duration: 5000 });
    }
  };

  const handleAddPayment = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvv) {
      toast({ title: "Заполните все обязательные поля", variant: "destructive", duration: 5000 });
      return;
    }
    const last4 = newCard.number.replace(/\s/g, "").slice(-4);
    setPaymentMethods(prev => [...prev.map(p => ({ ...p, status: "Резервный" })), { id: Date.now().toString(), type: "Карта", last4, status: "Основной" }]);
    setShowAddPaymentModal(false);
    setNewCard({ number: "", expiry: "", cvv: "", name: "" });
    showSaveToast("Карта добавлена");
  };

  const handleDeletePayment = (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    setShowDeletePaymentModal(null);
    showSaveToast("Способ оплаты удалён");
  };

  const handleChangePlan = (planKey: string) => {
    setCurrentPlan(planKey);
    setShowChangePlanModal(false);
    toast({ title: `Тариф изменён на ${plans.find(p => p.key === planKey)?.name}`, duration: 3000 });
  };

  const handleCancelSubscription = () => {
    setShowCancelModal(false);
    toast({ title: "Подписка отменена", description: "Доступ сохранится до конца оплаченного периода", duration: 5000 });
  };

  const handleDownloadReceipt = (paymentId: string) => {
    const payment = mockPaymentHistory.find(p => p.id === paymentId);
    const content = `КАССОВЫЙ ЧЕК\n\nООО «ПромптФордж»\nИНН: 7712345678\nДата: ${payment?.date}\nУслуга: ${payment?.type}\nСумма: ${payment?.amount}\nНДС 20%: ${Math.round(parseInt(payment?.amount || "0") * 0.2)} ₽\n\nФН: 9999078900012345\nФД: 1234567890\nФП: 0987654321\n\nСпасибо за покупку!`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${paymentId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Чек скачан" });
  };

  const handleNotifChannelChange = (key: keyof typeof notifChannels, val: boolean) => {
    setNotifChannels(p => ({ ...p, [key]: val }));
    showSaveToast(`${key === "email" ? "Email" : key === "push" ? "Push" : key === "telegram" ? "Telegram" : "SMS"} ${val ? "включён" : "выключён"}`);
  };

  const handleNotifEventChange = (key: string, val: boolean) => {
    setNotifEvents(p => ({ ...p, [key]: val }));
    showSaveToast();
  };

  const handleDndToggle = (val: boolean) => {
    setDndEnabled(val);
    showSaveToast(val ? "Режим «Не беспокоить» включён" : "Режим «Не беспокоить» выключен");
  };

  const handle2FAToggle = (val: boolean) => {
    if (val) {
      setShow2FASetup(true);
    } else {
      setTwoFAEnabled(false);
      setShow2FASetup(false);
      showSaveToast("2FA отключена");
    }
  };

  const confirm2FASetup = () => {
    if (twoFAMethod === "app" && twoFACode.length !== 6) {
      toast({ title: "Введите 6-значный код", variant: "destructive" });
      return;
    }
    if (twoFAMethod === "sms" && (!twoFAPhone || twoFACode.length !== 6)) {
      toast({ title: "Введите номер и 6-значный код", variant: "destructive" });
      return;
    }
    setTwoFAEnabled(true);
    setShow2FASetup(false);
    setTwoFACode("");
    toast({ title: "2FA активирована", description: "Сохраните резервные коды!", duration: 5000 });
    setShowBackupCodes(true);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const currentPlanData = plans.find(p => p.key === currentPlan);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto pb-px -mx-4 px-4 md:mx-0 md:px-0">
        {settingsTabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`pb-3 px-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Профиль ── */}
      {activeTab === "Профиль" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                <div 
                  className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold overflow-hidden cursor-pointer" 
                  onClick={handleAvatarClick}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="preview" 
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : user.avatar ? (
                    // ✅ OPTIMIZATION: Используем AvatarImage с кэшем
                    <AvatarImage src={user.avatar} alt="avatar" />
                  ) : (
                    profileName ? profileName[0].toUpperCase() : user.email[0].toUpperCase()
                  )}
                </div>
                <button 
                  onClick={handleAvatarClick} 
                  disabled={isUploading}
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="font-semibold">{profileName || "Пользователь"}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {avatarFile && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{avatarFile.name}</span>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <span className="text-xs text-primary">{uploadProgress}%</span>
                    )}
                    <button onClick={handleAvatarCancel} className="text-xs text-destructive hover:underline">Отмена</button>
                    <button onClick={handleAvatarUpload} disabled={isUploading} className="text-xs text-primary hover:underline disabled:opacity-50">
                      {isUploading ? (uploadProgress === 100 ? "Сохранение..." : "Оптимизация...") : "Сохранить"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Имя / Ник *</label>
                <input value={profileName} onChange={e => setProfileName(e.target.value)} className={`${inputCls} mt-1`} required />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Роль</label>
                <select value={profileRole} onChange={e => setProfileRole(e.target.value as any)} className={`${inputCls} mt-1`}>
                  {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs text-muted-foreground">О себе / специализация</label>
              <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={2} placeholder="Кратко опишите себя" className={`${inputCls} mt-1 resize-none`} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-xs text-muted-foreground">Основной рабочий язык</label>
                <select value={profileLang} onChange={e => setProfileLang(e.target.value)} className={`${inputCls} mt-1`}>
                  <option>Русский</option><option>English</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Часовой пояс</label>
                <select value={profileTz} onChange={e => setProfileTz(e.target.value)} className={`${inputCls} mt-1`}>
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/Samara">Самара (UTC+4)</option>
                  <option value="Asia/Yekaterinburg">Екатеринбург (UTC+5)</option>
                </select>
              </div>
            </div>
            <h3 className="font-semibold text-sm mt-5 mb-2">Социальные ссылки</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="text-xs text-muted-foreground">VK</label><input value={socialLinks.vk} onChange={e => setSocialLinks(p => ({ ...p, vk: e.target.value }))} placeholder="vk.com/..." className={`${inputCls} mt-1`} /></div>
              <div><label className="text-xs text-muted-foreground">Telegram</label><input value={socialLinks.telegram} onChange={e => setSocialLinks(p => ({ ...p, telegram: e.target.value }))} placeholder="@username" className={`${inputCls} mt-1`} /></div>
              <div><label className="text-xs text-muted-foreground">GitHub</label><input value={socialLinks.github} onChange={e => setSocialLinks(p => ({ ...p, github: e.target.value }))} placeholder="github.com/..." className={`${inputCls} mt-1`} /></div>
            </div>
            <button onClick={handleSaveProfile} className="mt-4 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Сохранить</button>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-4">Подключённые сервисы</h3>
            <div className="space-y-4">
              {services.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    {s.connected ? <Link2 className="h-4 w-4 text-primary" /> : <Link2Off className="h-4 w-4 text-muted-foreground" />}
                    <div>
                      <span className="text-sm font-medium">{s.name}</span>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => handleServiceToggle(s.id)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${s.connected ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "gradient-primary text-primary-foreground hover:opacity-90"}`}>
                    {s.connected ? "Отключить" : "Подключить"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Безопасность ── */}
      {activeTab === "Безопасность" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-4">Смена пароля</h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Текущий пароль *</label>
                <div className="relative mt-1">
                  <input type={showCurrentPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} className={inputCls} required />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Новый пароль *</label>
                <div className="relative mt-1">
                  <input type={showNewPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} className={inputCls} required minLength={8} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Подтверждение пароля *</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className={`${inputCls} mt-1`} required />
                {confirmPw && newPw !== confirmPw && <p className="text-xs text-destructive mt-1">Пароли не совпадают</p>}
              </div>
              <button type="submit" disabled={!currentPw || !newPw || newPw !== confirmPw} className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">Сменить пароль</button>
            </form>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm">Двухфакторная аутентификация (2FA)</h3>
              </div>
              <Switch checked={twoFAEnabled || show2FASetup} onCheckedChange={handle2FAToggle} />
            </div>
            {!twoFAEnabled && !show2FASetup && (
              <p className="text-xs text-muted-foreground">Включите для дополнительной защиты аккаунта</p>
            )}
            {show2FASetup && !twoFAEnabled && (
              <div className="space-y-4 mt-3">
                <div className="flex gap-2">
                  <button onClick={() => setTwoFAMethod("app")} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${twoFAMethod === "app" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                    <QrCode className="h-4 w-4 mx-auto mb-1" /> Google Authenticator
                  </button>
                  <button onClick={() => setTwoFAMethod("sms")} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${twoFAMethod === "sms" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}>
                    <Phone className="h-4 w-4 mx-auto mb-1" /> SMS
                  </button>
                </div>
                {twoFAMethod === "app" && (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-background rounded-xl border border-border mb-3">
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">Отсканируйте QR-код в Google Authenticator или другом приложении</p>
                    <div className="flex items-center gap-2 justify-center mb-3">
                      <code className="text-xs bg-muted px-3 py-1.5 rounded font-mono">JBSW Y3DP EHPK 3PXP</code>
                      <button onClick={() => { navigator.clipboard.writeText("JBSWY3DPEHPK3PXP"); toast({ title: "Ключ скопирован" }); }} className="text-primary hover:opacity-80"><Copy className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )}
                {twoFAMethod === "sms" && (
                  <div>
                    <label className="text-xs text-muted-foreground">Номер телефона *</label>
                    <input value={twoFAPhone} onChange={e => setTwoFAPhone(e.target.value)} placeholder="+7 (999) 123-45-67" className={`${inputCls} mt-1 mb-3`} />
                    <button onClick={() => toast({ title: "SMS отправлен", description: "Код подтверждения отправлен" })} className="text-xs text-primary hover:underline">Отправить код</button>
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">Введите 6-значный код *</label>
                  <input value={twoFACode} onChange={e => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className={`${inputCls} mt-1 text-center tracking-widest text-lg font-mono`} />
                </div>
                <button onClick={confirm2FASetup} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Подтвердить и включить 2FA</button>
              </div>
            )}
            {twoFAEnabled && (
              <div className="space-y-3 mt-3">
                <p className="text-xs text-success font-medium">✓ 2FA активирована ({twoFAMethod === "app" ? "Приложение" : "SMS"})</p>
                <button onClick={() => setShowBackupCodes(!showBackupCodes)} className="text-xs text-primary hover:underline">
                  {showBackupCodes ? "Скрыть резервные коды" : "Показать резервные коды (10 шт.)"}
                </button>
                {showBackupCodes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">Каждый код одноразовый. Сохраните их в надёжном месте:</p>
                    <div className="grid grid-cols-2 gap-1 mb-3">
                      {backupCodes.map(c => <code key={c} className="text-xs bg-background px-2 py-1 rounded font-mono">{c}</code>)}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        const text = backupCodes.join("\n");
                        const blob = new Blob([text], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = "promt-studiya_backup_codes.txt"; a.click();
                        URL.revokeObjectURL(url);
                        toast({ title: "Коды скачаны" });
                      }} className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> Скачать</button>
                      <button onClick={() => { navigator.clipboard.writeText(backupCodes.join("\n")); toast({ title: "Коды скопированы" }); }} className="text-xs text-primary hover:underline flex items-center gap-1"><Copy className="h-3 w-3" /> Копировать</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-3">Активные сессии</h3>
            <p className="text-xs text-muted-foreground mb-3">Таймаут сессии: 30 дней без активности</p>
            <div className="space-y-3">
              {mockSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{s.device} {s.current && <span className="text-xs text-primary">(текущая)</span>}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                    </div>
                  </div>
                  {!s.current && <button onClick={() => handleLogoutSession(s.id)} className="text-xs text-destructive hover:underline">Завершить</button>}
                </div>
              ))}
            </div>
            <button onClick={handleLogoutAll} className="mt-3 flex items-center gap-2 text-sm text-destructive hover:underline">
              <LogOut className="h-4 w-4" /> Выйти на всех устройствах
            </button>
          </div>
        </div>
      )}

      {/* ── Подписка ── */}
      {activeTab === "Подписка" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">Текущий план</h3>
                <p className="text-xs text-muted-foreground mt-1">Активен до {subscriptionEnd.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
              <span className="px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-bold">{currentPlanData?.name}</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">{currentPlanData?.price?.toLocaleString("ru-RU")} ₽</p>
                <p className="text-xs text-muted-foreground">/ месяц</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">{subscriptionEnd.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</p>
                <p className="text-xs text-muted-foreground">Следующая оплата</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-lg font-bold">Авто</p>
                <p className="text-xs text-muted-foreground">Продление</p>
              </div>
            </div>
            {promoDiscount > 0 && <p className="text-sm text-success mb-3">Скидка {promoDiscount}% активна</p>}
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => toast({ title: "Перенаправление на оплату", description: "Подписка будет продлена" })} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Продлить</button>
              <button onClick={() => setShowChangePlanModal(true)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Сменить план</button>
              <button onClick={() => setShowCancelModal(true)} className="px-4 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/5 transition-colors">Отменить подписку</button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-4">Сравнение тарифов</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {plans.map(plan => (
                <div key={plan.key} className={`rounded-xl border p-4 transition-all ${currentPlan === plan.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {plan.key === "pro" && <Crown className="h-4 w-4 text-primary" />}
                    {plan.key === "business" && <Zap className="h-4 w-4 text-primary" />}
                    <h4 className="font-semibold text-sm">{plan.name}</h4>
                  </div>
                  <p className="text-2xl font-bold mb-3">{plan.price.toLocaleString("ru-RU")} <span className="text-sm font-normal text-muted-foreground">₽/мес</span></p>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map(f => <li key={f} className="text-xs text-muted-foreground flex items-start gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-success mt-0.5 flex-shrink-0" />{f}</li>)}
                  </ul>
                  {currentPlan === plan.key ? (
                    <span className="text-xs text-primary font-medium">Текущий план</span>
                  ) : (
                    <button onClick={() => handleChangePlan(plan.key)} className="w-full py-2 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition-colors">Выбрать</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-3">Способы оплаты</h3>
            {paymentMethods.map(pm => (
              <div key={pm.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{pm.type} •••• {pm.last4}</span>
                    <span className={`text-xs ml-2 ${pm.status === "Основной" ? "text-primary" : "text-muted-foreground"}`}>{pm.status}</span>
                  </div>
                </div>
                <button onClick={() => setShowDeletePaymentModal(pm.id)} className="text-xs text-destructive hover:underline">Удалить</button>
              </div>
            ))}
            <button onClick={() => setShowAddPaymentModal(true)} className="mt-3 text-sm text-primary hover:underline flex items-center gap-1">+ Добавить способ оплаты</button>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-3">Промокод</h3>
            <div className="flex gap-2">
              <input value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoStatus(null); }} placeholder="Введите промокод" className={inputCls} />
              <button onClick={handleApplyPromo} disabled={!promoCode.trim()} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium whitespace-nowrap hover:opacity-90 transition-opacity disabled:opacity-40">Применить</button>
            </div>
            {promoStatus === "success" && <p className="text-xs text-success mt-2">✓ Промокод активирован! Скидка {promoDiscount}%</p>}
            {promoStatus === "invalid" && <p className="text-xs text-destructive mt-2">✗ Промокод недействителен</p>}
            {promoStatus === "expired" && <p className="text-xs text-warning mt-2">⚠ Срок действия промокода истёк</p>}
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-3">История платежей</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs text-muted-foreground font-medium">Название</th>
                    <th className="text-left py-2 text-xs text-muted-foreground font-medium">Дата</th>
                    <th className="text-right py-2 text-xs text-muted-foreground font-medium">Сумма</th>
                    <th className="text-right py-2 text-xs text-muted-foreground font-medium">Чек</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPaymentHistory.map(p => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-medium">{p.type}</td>
                      <td className="py-2.5 text-muted-foreground">{p.date}</td>
                      <td className="py-2.5 text-right font-medium">{p.amount}</td>
                      <td className="py-2.5 text-right">
                        {p.receipt && <button onClick={() => handleDownloadReceipt(p.id)} className="text-xs text-primary hover:underline flex items-center gap-1 ml-auto"><Receipt className="h-3 w-3" /> Скачать</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Уведомления ── */}
      {activeTab === "Уведомления" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-4">Каналы уведомлений</h3>
            <div className="space-y-4">
              {notificationChannels.map(ch => (
                <div key={ch.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ch.icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">{ch.label}</span>
                      <p className="text-xs text-muted-foreground">{ch.desc}</p>
                    </div>
                  </div>
                  <Switch checked={notifChannels[ch.key]} onCheckedChange={(val) => handleNotifChannelChange(ch.key, val)} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-4">Типы событий</h3>
            <div className="space-y-4">
              {notificationEvents.map(ev => (
                <div key={ev.key} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{ev.label}</span>
                    <p className="text-xs text-muted-foreground">{ev.desc}</p>
                  </div>
                  <Switch checked={notifEvents[ev.key] ?? true} onCheckedChange={(val) => handleNotifEventChange(ev.key, val)} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <BellOff className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-sm">Не беспокоить</h3>
                  <p className="text-xs text-muted-foreground">Критические уведомления безопасности всё равно будут приходить</p>
                </div>
              </div>
              <Switch checked={dndEnabled} onCheckedChange={handleDndToggle} />
            </div>
            {dndEnabled && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">С</span>
                <input type="time" value={dndFrom} onChange={e => { setDndFrom(e.target.value); showSaveToast(); }} className="px-2 py-1 rounded border border-border text-sm bg-background" />
                <span className="text-xs text-muted-foreground">до</span>
                <input type="time" value={dndTo} onChange={e => { setDndTo(e.target.value); showSaveToast(); }} className="px-2 py-1 rounded border border-border text-sm bg-background" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Интерфейс ── */}
      {activeTab === "Интерфейс" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-3">Тема оформления</h3>
            <div className="flex gap-3">
              {[
                { key: "light", label: "Светлая", icon: Sun },
                { key: "dark", label: "Тёмная", icon: Moon },
                { key: "system", label: "Системная", icon: Monitor },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => { setTheme(key); showSaveToast(`Тема: ${label}`); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all hover:bg-muted/50 ${theme === key ? "border-primary bg-primary/5" : "border-border"}`}>
                  <Icon className="h-4 w-4" /> <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
            {theme === "system" && <p className="text-xs text-muted-foreground mt-2">Тема определяется настройками вашей ОС через CSS prefers-color-scheme</p>}
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-3">Язык интерфейса</h3>
            <div className="flex gap-3">
              {[{ key: "Русский", label: "🇷🇺 Русский" }, { key: "English", label: "🇬🇧 English" }].map(lang => (
                <button key={lang.key} onClick={() => { setProfileLang(lang.key); showSaveToast(`Язык: ${lang.key}`); }} className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium hover:bg-muted/50 ${profileLang === lang.key ? "border-primary bg-primary/5" : "border-border"}`}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Размер шрифта</h3>
              <span className="text-sm font-bold text-primary">{fontScale}%</span>
            </div>
            <Slider
              value={[fontScale]}
              onValueChange={([v]) => setFontScale(v)}
              onValueCommit={() => showSaveToast(`Размер шрифта: ${fontScale}%`)}
              min={80}
              max={150}
              step={10}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>80%</span>
              <span>100%</span>
              <span>150%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2" style={{ fontSize: `${fontScale * 0.12}px` }}>Пример текста с текущим размером шрифта</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Анимации</h3>
                <p className="text-xs text-muted-foreground mt-1">Отключите для повышения производительности</p>
              </div>
              <Switch checked={animations} onCheckedChange={(val) => { setAnimations(val); showSaveToast(val ? "Анимации включены" : "Анимации отключены"); }} />
            </div>
          </div>
        </div>
      )}

      {/* ── Данные ── */}
      {activeTab === "Данные" && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-sm mb-1">Экспорт данных</h3>
            <p className="text-xs text-muted-foreground mb-3">Скачайте все данные: профиль, покупки, избранное, настройки, историю действий</p>
            <button onClick={handleExportData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Download className="h-4 w-4" /> Экспорт в JSON
            </button>
          </div>

          <div className="bg-card rounded-xl border border-destructive/20 p-5">
            <h3 className="font-semibold text-sm text-destructive mb-1">Удалить аккаунт и все данные</h3>
            <p className="text-xs text-muted-foreground mb-3">Все персональные данные будут удалены в течение 30 дней согласно 152-ФЗ. Уведомление об удалении будет отправлено на email.</p>
            <button onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <AlertTriangle className="h-4 w-4" /> Удалить аккаунт
            </button>
          </div>

          {showDeleteModal && (
            <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
              <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-elevated" onClick={e => e.stopPropagation()}>
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Удалить аккаунт?</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">Это действие необратимо. Все данные удалятся в течение 30 дней.</p>
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Почему вы уходите? *</p>
                  <select value={deleteSurvey} onChange={e => setDeleteSurvey(e.target.value)} className={inputCls}>
                    <option value="">Выберите причину</option>
                    <option value="func">Не устроил функционал</option>
                    <option value="price">Дорого</option>
                    <option value="alt">Нашёл альтернативу</option>
                    <option value="other">Другая причина</option>
                  </select>
                </div>
                {deleteSurvey === "other" && (
                  <div className="mb-3">
                    <textarea value={deleteCustomReason} onChange={e => setDeleteCustomReason(e.target.value)} placeholder="Расскажите подробнее..." rows={2} className={`${inputCls} resize-none`} />
                  </div>
                )}
                <label className="flex items-start gap-2 text-sm mb-3">
                  <input type="checkbox" checked={deleteUnderstood} onChange={e => setDeleteUnderstood(e.target.checked)} className="rounded border-border mt-0.5" />
                  <span>Я понимаю, что удаление необратимо</span>
                </label>
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Введите «УДАЛИТЬ» для подтверждения:</p>
                  <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="УДАЛИТЬ" className={inputCls} />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); setDeleteUnderstood(false); setDeleteSurvey(""); }} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
                  <button disabled={deleteConfirmText !== "УДАЛИТЬ" || !deleteUnderstood || !deleteSurvey} onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">Удалить</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowChangePlanModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Сменить тарифный план</h3>
              <button onClick={() => setShowChangePlanModal(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              {plans.map(plan => (
                <button key={plan.key} onClick={() => handleChangePlan(plan.key)} className={`w-full text-left p-4 rounded-xl border transition-all hover:bg-muted/50 ${currentPlan === plan.key ? "border-primary bg-primary/5" : "border-border"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{plan.name}</span>
                    <span className="font-bold">{plan.price.toLocaleString("ru-RU")} ₽/мес</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.features.join(" • ")}</p>
                  {currentPlan === plan.key && <span className="text-xs text-primary font-medium mt-1 block">Текущий план</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCancelModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Отменить подписку?</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">Доступ к PRO-функциям сохранится до {subscriptionEnd.toLocaleDateString("ru-RU")}. После этого аккаунт перейдёт на Free план.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Оставить</button>
              <button onClick={handleCancelSubscription} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity">Отменить</button>
            </div>
          </div>
        </div>
      )}

      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowAddPaymentModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Добавить карту</h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Номер карты *</label>
                <input value={newCard.number} onChange={e => setNewCard(p => ({ ...p, number: e.target.value }))} placeholder="0000 0000 0000 0000" maxLength={19} className={`${inputCls} mt-1`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Срок *</label>
                  <input value={newCard.expiry} onChange={e => setNewCard(p => ({ ...p, expiry: e.target.value }))} placeholder="MM/ГГ" maxLength={5} className={`${inputCls} mt-1`} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">CVV *</label>
                  <input type="password" value={newCard.cvv} onChange={e => setNewCard(p => ({ ...p, cvv: e.target.value }))} placeholder="•••" maxLength={3} className={`${inputCls} mt-1`} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Имя на карте</label>
                <input value={newCard.name} onChange={e => setNewCard(p => ({ ...p, name: e.target.value }))} placeholder="IVAN IVANOV" className={`${inputCls} mt-1`} />
              </div>
              <p className="text-xs text-muted-foreground">Поддерживаем МИР, Visa, MasterCard и СБП</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowAddPaymentModal(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
              <button onClick={handleAddPayment} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Добавить</button>
            </div>
          </div>
        </div>
      )}

      {showDeletePaymentModal && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeletePaymentModal(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-elevated" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-center mb-2">Удалить способ оплаты?</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">Карта •••• {paymentMethods.find(p => p.id === showDeletePaymentModal)?.last4} будет удалена</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeletePaymentModal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
              <button onClick={() => handleDeletePayment(showDeletePaymentModal)} className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}