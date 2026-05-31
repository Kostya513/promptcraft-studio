import { useState, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, ShieldOff, Clock, Filter, Key, 
  Smartphone, Download, Upload, History, LogOut, Lock, Unlock,
  Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Trash2,
  Monitor, Smartphone as MobileDevice, RotateCcw, ListFilter
} from "lucide-react";
import { toast } from "sonner";
import { encryptData, decryptData, packEncrypted, unpackEncrypted } from "@/utils/crypto.utils";

interface Account {
  id: string;
  service: string;
  has2fa: boolean;
  lastPwChange: string;
  status: string;
  login: string;
  password?: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: "success" | "error" | "warning";
  ip?: string;
}

interface Session {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
  userAgent: string;
}

export function AccountSecurity() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  // 2FA
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  
  // Sessions
  const [sessions, setSessions] = useState<Session[]>([
    { 
      id: "1", device: "Chrome на Windows", ip: "192.168.1.1", location: "Москва, Россия",
      lastActive: new Date().toISOString(), current: true, userAgent: "Mozilla/5.0 (Windows)" 
    },
    { 
      id: "2", device: "Safari на iPhone", ip: "192.168.1.2", location: "Москва, Россия",
      lastActive: new Date(Date.now() - 3600000).toISOString(), current: false, userAgent: "Mozilla/5.0 (iPhone)" 
    },
  ]);
  
  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState<"all" | "success" | "error" | "warning">("all");

  // 🔹 НОВОЕ: Фильтр для карточек (Старые пароли / Требуют внимания)
  const [activeCardFilter, setActiveCardFilter] = useState<'all' | 'old_password' | 'attention'>('all');

  // Загрузка данных
  useEffect(() => {
    const stored = localStorage.getItem("encrypted_accounts");
    if (stored) {
      try {
        // Загружаем из бэкапа для простоты отображения (в проде шифруем)
        const parsed = JSON.parse(localStorage.getItem("accounts_backup") || "[]");
        setAccounts(parsed);
      } catch (e) { console.error("Ошибка загрузки:", e); }
    }
    
    const auditStored = localStorage.getItem("promptcraft_audit_log");
    if (auditStored) {
      try { setAuditLogs(JSON.parse(auditStored)); } catch (e) { console.error("Ошибка логов:", e); }
    }
    
    const twoFAStored = localStorage.getItem("promptcraft_2fa_enabled");
    if (twoFAStored) setTwoFAEnabled(twoFAStored === "true");
    
    addAuditLog("Вход в систему", "Пользователь успешно авторизовался", "success");
  }, []);

  const addAuditLog = (action: string, details: string, status: "success" | "error" | "warning" = "success") => {
    const newLog: AuditLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(), action, details, status, ip: "192.168.1.1"
    };
    const updated = [newLog, ...auditLogs].slice(0, 100);
    setAuditLogs(updated);
    localStorage.setItem("promptcraft_audit_log", JSON.stringify(updated));
  };

  // Подсчет метрик
  const no2fa = accounts.filter(i => !i.has2fa).length;
  const oldPw = accounts.filter(i => {
    if (!i.lastPwChange) return true;
    const diff = Date.now() - new Date(i.lastPwChange).getTime();
    return diff > 180 * 24 * 60 * 60 * 1000;
  }).length;
  const unknownStatus = accounts.filter(i => i.status === "Не помню" || i.status === "Планирую удалить").length;

  // 🔹 ЛОГИКА ОТОБРАЖЕНИЯ СПИСКА
  const displayed = accounts.filter(i => {
    if (activeCardFilter === 'old_password') {
      if (!i.lastPwChange) return true;
      return (Date.now() - new Date(i.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000);
    }
    if (activeCardFilter === 'attention') {
      return i.status === "Не помню" || i.status === "Планирую удалить";
    }
    return true; // 'all'
  });

  // Смена мастер-пароля
  const handleChangeMasterPassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error("Заполните все поля"); return; }
    if (newPassword !== confirmPassword) { toast.error("Пароли не совпадают"); return; }
    if (newPassword.length < 8) { toast.error("Пароль должен быть не менее 8 символов"); return; }

    try {
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(newPassword));
      localStorage.setItem("master_password_hash", JSON.stringify({ hash: Array.from(new Uint8Array(hash)), timestamp: new Date().toISOString() }));
      addAuditLog("Смена мастер-пароля", "Мастер-пароль успешно изменен", "success");
      toast.success("Мастер-пароль изменен");
      setShowPasswordModal(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      addAuditLog("Смена мастер-пароля", "Ошибка при смене пароля", "error");
      toast.error("Ошибка при смене пароля");
    }
  };

  const handleEnable2FA = () => {
    if (twoFACode.length !== 6) { toast.error("Введите 6-значный код"); return; }
    setTwoFAEnabled(true);
    localStorage.setItem("promptcraft_2fa_enabled", "true");
    addAuditLog("Включение 2FA", "Двухфакторная аутентификация включена", "success");
    toast.success("2FA включена");
    setShow2FAModal(false);
    setTwoFACode("");
  };

  const handleEndSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    addAuditLog("Завершение сессии", `Сессия ${id} завершена`, "success");
    toast.success("Сессия завершена");
  };

  const handleExportData = () => {
    const exportData = { accounts, auditLogs, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptcraft-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog("Экспорт данных", "Резервная копия экспортирована", "success");
    toast.success("Данные экспортированы");
    setShowExportModal(false);
  };

  const handleClearLogs = () => {
    if (confirm("Очистить журнал аудита?")) {
      setAuditLogs([]);
      localStorage.removeItem("promptcraft_audit_log");
      toast.success("Журнал очищен");
    }
  };

  const filteredLogs = auditFilter === "all" ? auditLogs : auditLogs.filter(log => log.status === auditFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" /> Безопасность
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Управление доступом, аудит и защита данных</p>
      </div>

      {/* 🔹 АКТИВНЫЕ КАРТОЧКИ-ФИЛЬТРЫ */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Карточка 2FA */}
        <button 
          onClick={() => setShow2FAModal(true)}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">Без 2FA</span>
            </div>
            <span className="text-2xl font-bold">{no2fa}</span>
          </div>
          <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Нажмите для настройки</p>
        </button>

        {/* Карточка Старый пароль */}
        <button 
          onClick={() => setActiveCardFilter(activeCardFilter === 'old_password' ? 'all' : 'old_password')}
          className={`rounded-xl border p-4 transition-colors text-left group ${
            activeCardFilter === 'old_password' 
              ? "bg-primary/5 border-primary" 
              : "bg-card border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${activeCardFilter === 'old_password' ? 'text-primary' : 'text-warning'}`} />
              <span className="text-sm text-muted-foreground">Старый пароль (6+ мес)</span>
            </div>
            <span className="text-2xl font-bold">{oldPw}</span>
          </div>
          <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            {activeCardFilter === 'old_password' ? "Кликните, чтобы сбросить фильтр" : "Показать список"}
          </p>
        </button>

        {/* Карточка Требуют внимания */}
        <button 
          onClick={() => setActiveCardFilter(activeCardFilter === 'attention' ? 'all' : 'attention')}
          className={`rounded-xl border p-4 transition-colors text-left group ${
            activeCardFilter === 'attention' 
              ? "bg-primary/5 border-primary" 
              : "bg-card border-border hover:border-primary/30"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`h-5 w-5 ${activeCardFilter === 'attention' ? 'text-primary' : 'text-warning'}`} />
              <span className="text-sm text-muted-foreground">Требуют внимания</span>
            </div>
            <span className="text-2xl font-bold">{unknownStatus}</span>
          </div>
          <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
            {activeCardFilter === 'attention' ? "Кликните, чтобы сбросить фильтр" : "Показать список"}
          </p>
        </button>
      </div>

      {/* 🔹 БЫСТРЫЕ ДЕЙСТВИЯ (Сетка кнопок) */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Key className="h-5 w-5" /></div>
          <div className="text-left"><p className="text-sm font-medium">Сменить пароль</p><p className="text-xs text-muted-foreground">Мастер-пароль</p></div>
        </button>

        <button onClick={() => setShow2FAModal(true)} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600"><Smartphone className="h-5 w-5" /></div>
          <div className="text-left"><p className="text-sm font-medium">2FA</p><p className="text-xs text-muted-foreground">{twoFAEnabled ? "Включена" : "Выключена"}</p></div>
        </button>

        <button onClick={() => setShowSessionsModal(true)} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-600"><LogOut className="h-5 w-5" /></div>
          <div className="text-left"><p className="text-sm font-medium">Сессии</p><p className="text-xs text-muted-foreground">{sessions.length} активно</p></div>
        </button>

        <button onClick={() => setShowExportModal(true)} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
          <div className="p-2 rounded-lg bg-green-100 text-green-600"><Download className="h-5 w-5" /></div>
          <div className="text-left"><p className="text-sm font-medium">Экспорт</p><p className="text-xs text-muted-foreground">Резервная копия</p></div>
        </button>
      </div>

      {/* 🔹 ИНДИКАТОР ФИЛЬТРА */}
      {activeCardFilter !== 'all' && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <ListFilter className="h-4 w-4" />
            <span className="text-sm font-medium">
              {activeCardFilter === 'old_password' ? 'Показаны аккаунты со старым паролем' : 'Показаны аккаунты, требующие внимания'}
            </span>
          </div>
          <button onClick={() => setActiveCardFilter('all')} className="text-xs text-primary hover:underline flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Сбросить фильтр
          </button>
        </div>
      )}

      {/* Список аккаунтов (теперь реагирует на фильтры) */}
      <div className="space-y-3">
        {displayed.map(item => {
          const pwOld = !item.lastPwChange || (Date.now() - new Date(item.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000);
          return (
            <div key={item.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{item.service}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === "Активен" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {item.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                  item.has2fa ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive"
                }`}>
                  {item.has2fa ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                  2FA: {item.has2fa ? "Включена" : "Выключена"}
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
                  pwOld ? "border-warning/30 bg-warning/5 text-warning" : "border-border"
                }`}>
                  <Clock className="h-4 w-4" />
                  Пароль: {item.lastPwChange ? new Date(item.lastPwChange).toLocaleDateString("ru-RU") : "Не указана"}
                  {pwOld && " ⚠️"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {displayed.length === 0 && activeCardFilter === 'all' && <p className="text-center text-sm text-muted-foreground py-8">Все аккаунты в порядке!</p>}
      {displayed.length === 0 && activeCardFilter !== 'all' && <p className="text-center text-sm text-muted-foreground py-8">В этой категории нет аккаунтов.</p>}

      <button onClick={() => setShowAuditModal(true)} className="w-full py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors flex items-center justify-center gap-2">
        <History className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Журнал аудита ({auditLogs.length} записей)</span>
      </button>

      {/* ... (МОДАЛКИ ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ, КОПИРУЙ ИХ ИЗ ПРЕДЫДУЩЕГО КОДА ЕСЛИ НУЖНО, ОНИ НЕ МЕНЯЛИСЬ) ... */}
      
      {/* 🔐 МОДАЛ: Смена мастер-пароля */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Key className="h-5 w-5 text-primary" /> Смена мастер-пароля</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 rounded-lg hover:bg-muted"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs text-muted-foreground">Текущий пароль</label><div className="relative mt-1"><input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /><button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              <div><label className="text-xs text-muted-foreground">Новый пароль</label><div className="relative mt-1"><input type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /><button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              <div><label className="text-xs text-muted-foreground">Подтверждение пароля</label><div className="relative mt-1"><input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /><button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              <button onClick={handleChangeMasterPassword} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Сменить пароль</button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 МОДАЛ: 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShow2FAModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Smartphone className="h-5 w-5 text-primary" /> Двухфакторная аутентификация</h3>
              <button onClick={() => setShow2FAModal(false)} className="p-2 rounded-lg hover:bg-muted"><XCircle className="h-5 w-5" /></button>
            </div>
            {twoFAEnabled ? (
              <div className="text-center py-6">
                <ShieldCheck className="h-16 w-16 text-success mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">2FA включена</p>
                <p className="text-sm text-muted-foreground mb-6">Ваш аккаунт защищен</p>
                <button onClick={() => { setTwoFAEnabled(false); localStorage.setItem("promptcraft_2fa_enabled", "false"); toast.success("2FA отключена"); }} className="px-6 py-2.5 rounded-lg border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/5">Отключить 2FA</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20"><p className="text-sm font-medium text-primary mb-2">Настройка 2FA</p><p className="text-xs text-muted-foreground">1. Установите Google Authenticator<br/>2. Отсканируйте QR-код<br/>3. Введите 6-значный код</p></div>
                <div className="flex justify-center p-6 bg-muted rounded-xl"><div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-border"><div className="text-center text-xs text-muted-foreground">QR Code<br/>(Mock)</div></div></div>
                <input type="text" value={twoFACode} onChange={e => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm text-center tracking-widest" />
                <button onClick={handleEnable2FA} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Включить 2FA</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 💻 МОДАЛ: Сессии */}
      {showSessionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowSessionsModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><LogOut className="h-5 w-5 text-primary" /> Активные сессии</h3>
              <button onClick={() => setShowSessionsModal(false)} className="p-2 rounded-lg hover:bg-muted"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3 mb-4">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${session.current ? "bg-success" : "bg-muted-foreground"}`} />
                    <div className="flex items-center gap-3">
                      {session.device.includes("iPhone") ? <MobileDevice className="h-5 w-5 text-muted-foreground" /> : <Monitor className="h-5 w-5 text-muted-foreground" />}
                      <div><p className="text-sm font-medium">{session.device}</p><p className="text-xs text-muted-foreground">{session.ip} • {session.location}</p><p className="text-[10px] text-muted-foreground">{new Date(session.lastActive).toLocaleString("ru-RU")}</p></div>
                    </div>
                  </div>
                  {!session.current && <button onClick={() => handleEndSession(session.id)} className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/5">Завершить</button>}
                  {session.current && <span className="text-xs text-success font-medium px-2 py-1 bg-success/10 rounded-full">Текущая</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📦 МОДАЛ: Экспорт/Импорт */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowExportModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Download className="h-5 w-5 text-primary" /> Экспорт / Импорт</h3>
              <button onClick={() => setShowExportModal(false)} className="p-2 rounded-lg hover:bg-muted"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <button onClick={handleExportData} className="w-full py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors flex items-center justify-center gap-2"><Download className="h-5 w-5 text-primary" /><span className="text-sm font-medium">Экспортировать данные</span></button>
              <p className="text-xs text-muted-foreground text-center">Резервная копия содержит все аккаунты и журнал</p>
            </div>
          </div>
        </div>
      )}

      {/* 📜 МОДАЛ: Журнал аудита */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowAuditModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Журнал аудита</h3>
              <div className="flex items-center gap-2"><button onClick={handleClearLogs} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="h-5 w-5" /></button><button onClick={() => setShowAuditModal(false)} className="p-2 rounded-lg hover:bg-muted"><XCircle className="h-5 w-5" /></button></div>
            </div>
            <div className="flex gap-2 mb-4">{(["all", "success", "warning", "error"] as const).map(filter => (<button key={filter} onClick={() => setAuditFilter(filter)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${auditFilter === filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{filter === "all" ? "Все" : filter === "success" ? "Успех" : filter === "warning" ? "Предупреждения" : "Ошибки"}</button>))}</div>
            <div className="space-y-2">{filteredLogs.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">История пуста</p> : filteredLogs.map(log => (<div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30"><div className={`mt-0.5 ${log.status === "success" ? "text-success" : log.status === "error" ? "text-destructive" : "text-warning"}`}>{log.status === "success" ? <CheckCircle className="h-4 w-4" /> : log.status === "error" ? <XCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}</div><div className="flex-1"><p className="text-sm font-medium">{log.action}</p><p className="text-xs text-muted-foreground">{log.details}</p><p className="text-[10px] text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString("ru-RU")}</p></div></div>))}</div>
          </div>
        </div>
      )}
    </div>
  );
}