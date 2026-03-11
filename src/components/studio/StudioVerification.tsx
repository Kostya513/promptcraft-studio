import { useState } from "react";
import {
  Shield, Upload, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronRight, FileText, Camera, Info, Award, Star, Users, Zap
} from "lucide-react";

type VerificationLevel = "newbie" | "verified" | "expert" | "partner";

interface LevelConfig {
  id: VerificationLevel;
  label: string;
  badgeColor: string;
  icon: typeof Shield;
  requirements: string[];
  privileges: string[];
  commission: string;
  minWithdraw: string;
  maxUploads: string;
}

const levels: LevelConfig[] = [
  {
    id: "newbie", label: "Новичок", badgeColor: "bg-muted text-muted-foreground", icon: Shield,
    requirements: ["Регистрация", "Подтверждение email"],
    privileges: ["До 5 промптов", "Обязательная модерация"],
    commission: "15%", minWithdraw: "1 000 ₽", maxUploads: "5",
  },
  {
    id: "verified", label: "Верифицированный", badgeColor: "bg-primary/10 text-primary", icon: CheckCircle,
    requirements: ["Подтверждение телефона", "Скан паспорта (основная + прописка)", "Справка самозанятого / ИП"],
    privileges: ["Безлимит промптов", "Авто-публикация после первого одобрения"],
    commission: "15%", minWithdraw: "500 ₽", maxUploads: "∞",
  },
  {
    id: "expert", label: "Эксперт", badgeColor: "bg-success/10 text-success", icon: Star,
    requirements: ["50+ продаж", "Рейтинг ≥ 4.5 ★", "3+ месяца на платформе"],
    privileges: ["Пониженная комиссия", "Приоритет в выдаче", "Приоритетная поддержка"],
    commission: "12%", minWithdraw: "500 ₽", maxUploads: "∞",
  },
  {
    id: "partner", label: "Партнёр", badgeColor: "bg-warning/10 text-warning", icon: Award,
    requirements: ["500+ продаж", "Рейтинг ≥ 4.8 ★", "12+ месяцев на платформе"],
    privileges: ["Минимальная комиссия", "Персональный менеджер", "API-интеграция", "Эксклюзивные условия"],
    commission: "10%", minWithdraw: "500 ₽", maxUploads: "∞",
  },
];

type DocStatus = "none" | "uploaded" | "pending" | "approved" | "rejected";

interface Document {
  id: string;
  label: string;
  status: DocStatus;
  rejectedReason?: string;
}

const statusLabels: Record<DocStatus, { label: string; color: string; Icon: typeof CheckCircle }> = {
  none: { label: "Не загружен", color: "text-muted-foreground", Icon: Upload },
  uploaded: { label: "Загружен", color: "text-primary", Icon: Clock },
  pending: { label: "На проверке", color: "text-warning", Icon: Clock },
  approved: { label: "Одобрен", color: "text-success", Icon: CheckCircle },
  rejected: { label: "Отклонён", color: "text-destructive", Icon: XCircle },
};

export function StudioVerification() {
  const [currentLevel] = useState<VerificationLevel>("newbie");
  const [targetLevel, setTargetLevel] = useState<VerificationLevel | null>(null);
  const [documents, setDocuments] = useState<Document[]>([
    { id: "passport_main", label: "Паспорт — основная страница", status: "none" },
    { id: "passport_reg", label: "Паспорт — страница прописки", status: "none" },
    { id: "certificate", label: "Справка самозанятого / ИП", status: "none" },
    { id: "selfie", label: "Селфи с паспортом", status: "none" },
  ]);
  const [consent, setConsent] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const currentLevelConfig = levels.find(l => l.id === currentLevel)!;
  const currentLevelIndex = levels.findIndex(l => l.id === currentLevel);

  // Mock metrics for promotion display
  const userMetrics = { sales: 12, rating: 4.6, months: 2 };

  const nextLevel = levels[currentLevelIndex + 1];
  const promotionProgress = nextLevel ? (() => {
    if (nextLevel.id === "verified") return documents.filter(d => d.status === "approved").length / documents.length;
    if (nextLevel.id === "expert") return Math.min(userMetrics.sales / 50, 1) * 0.33 + Math.min(userMetrics.rating / 4.5, 1) * 0.33 + Math.min(userMetrics.months / 3, 1) * 0.34;
    if (nextLevel.id === "partner") return Math.min(userMetrics.sales / 500, 1) * 0.33 + Math.min(userMetrics.rating / 4.8, 1) * 0.33 + Math.min(userMetrics.months / 12, 1) * 0.34;
    return 0;
  })() : 1;

  const handleFileUpload = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: "uploaded" as DocStatus } : d));
  };

  const handleSubmitDocuments = () => {
    if (!consent) return;
    setDocuments(prev => prev.map(d => d.status === "uploaded" ? { ...d, status: "pending" as DocStatus } : d));
    setShowUploadForm(false);
  };

  const allUploaded = documents.every(d => d.status !== "none");

  // Level change history
  const history = [
    { date: "01 янв 2026", from: "—", to: "Новичок", reason: "Регистрация и подтверждение email" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Current status card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${currentLevelConfig.badgeColor}`}>
              <currentLevelConfig.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Текущий уровень: {currentLevelConfig.label}</h2>
              <p className="text-xs text-muted-foreground">Комиссия: {currentLevelConfig.commission} · Мин. вывод: {currentLevelConfig.minWithdraw}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentLevelConfig.badgeColor}`}>
            {currentLevelConfig.label}
          </span>
        </div>

        {/* Progress to next level */}
        {nextLevel && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Прогресс к уровню «{nextLevel.label}»</span>
              <span className="text-xs text-muted-foreground">{Math.round(promotionProgress * 100)}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${promotionProgress * 100}%` }} />
            </div>
            <div className="mt-3 space-y-1">
              {nextLevel.requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`h-3 w-3 ${i === 0 ? "text-success" : "text-muted-foreground"}`} />
                  <span className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{req}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Level comparison */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-sm mb-4">Сравнение уровней</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {levels.map((level) => {
            const isCurrent = level.id === currentLevel;
            const isTarget = level.id === targetLevel;
            return (
              <button
                key={level.id}
                onClick={() => setTargetLevel(level.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  isTarget ? "border-primary bg-primary/5 shadow-card-hover" :
                  isCurrent ? "border-primary/30 bg-primary/5" :
                  "border-border hover:border-primary/20"
                }`}
              >
                <div className={`inline-flex h-8 w-8 rounded-lg items-center justify-center mb-2 ${level.badgeColor}`}>
                  <level.icon className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-sm mb-1">{level.label}</h4>
                <p className="text-xs text-muted-foreground mb-2">Комиссия: {level.commission}</p>
                <ul className="space-y-1">
                  {level.privileges.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                      <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                {isCurrent && <span className="inline-block mt-2 text-[10px] font-bold text-primary">Текущий</span>}
              </button>
            );
          })}
        </div>
        {targetLevel && targetLevel !== currentLevel && levels.findIndex(l => l.id === targetLevel) > currentLevelIndex && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="mt-4 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Начать верификацию → {levels.find(l => l.id === targetLevel)?.label}
          </button>
        )}
      </div>

      {/* Document upload form */}
      {showUploadForm && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" /> Загрузка документов
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Загрузите документы для верификации. Форматы: JPG, PNG, PDF. Макс. размер: 10 МБ.
          </p>
          <div className="space-y-3">
            {documents.map((doc) => {
              const st = statusLabels[doc.status];
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <st.Icon className={`h-4 w-4 ${st.color}`} />
                    <div>
                      <span className="text-sm font-medium">{doc.label}</span>
                      <p className={`text-xs ${st.color}`}>{st.label}</p>
                      {doc.rejectedReason && <p className="text-xs text-destructive">{doc.rejectedReason}</p>}
                    </div>
                  </div>
                  {(doc.status === "none" || doc.status === "rejected") && (
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={() => handleFileUpload(doc.id)} />
                      Загрузить
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <label className="flex items-start gap-2 mt-4 text-sm cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="rounded border-border mt-0.5" />
            <span className="text-xs text-muted-foreground">
              Я даю согласие на обработку персональных данных в соответствии с Федеральным законом №152-ФЗ «О персональных данных»
            </span>
          </label>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmitDocuments}
              disabled={!allUploaded || !consent}
              className="px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Отправить на проверку
            </button>
            <button onClick={() => setShowUploadForm(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Document status (when submitted) */}
      {!showUploadForm && documents.some(d => d.status !== "none") && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-sm mb-3">Статус документов</h3>
          <div className="space-y-2">
            {documents.filter(d => d.status !== "none").map(doc => {
              const st = statusLabels[doc.status];
              return (
                <div key={doc.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <st.Icon className={`h-4 w-4 ${st.color}`} />
                  <span className="text-sm flex-1">{doc.label}</span>
                  <span className={`text-xs font-medium ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Level change history */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-sm mb-3">История изменений уровня</h3>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm">{h.from} → <span className="font-medium">{h.to}</span></p>
                <p className="text-xs text-muted-foreground">{h.reason}</p>
              </div>
              <span className="text-xs text-muted-foreground">{h.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => setShowUploadForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
          <Upload className="h-4 w-4" /> Обновить документы
        </button>
        <a href="/support" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
          <Info className="h-4 w-4" /> Связаться с поддержкой
        </a>
      </div>
    </div>
  );
}
