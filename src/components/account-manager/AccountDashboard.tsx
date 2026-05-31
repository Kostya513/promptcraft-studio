import { useState, useEffect } from "react";
import { 
  Users, CreditCard, AlertTriangle, Send, Shield, 
  Plus, UserPlus, TrendingUp, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { decryptData, unpackEncrypted } from "@/utils/crypto.utils";

interface Account {
  id: string;
  service: string;
  type: string;
  status: string;
  costAmount: string;
  costPeriod: string;
  has2fa: boolean;
  lastPwChange: string;
  postingEnabled: boolean;
  login: string;
  password?: string;
}

interface AuditResult {
  totalAccounts: number;
  without2FA: number;
  oldPasswords: number;
  weakPasswords: number;
  threats: number;
}

export function AccountDashboard({ 
  onAdd, 
  onGenerateProfile, 
  cryptoKey,
  onNavigate 
}: { 
  onAdd: () => void, 
  onGenerateProfile: () => void, 
  cryptoKey: CryptoKey | null,
  onNavigate: (tab: string) => void
}) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  useEffect(() => {
    if (!cryptoKey) return;
    
    const stored = localStorage.getItem("encrypted_accounts");
    if (stored) {
      try {
        const { salt, data } = unpackEncrypted(stored);
        decryptData(data, cryptoKey).then((decrypted) => {
          setAccounts(JSON.parse(decrypted));
        });
      } catch (e) {
        console.error("Ошибка загрузки:", e);
      }
    }
  }, [cryptoKey]);

  const totalAccounts = accounts.length;
  
  const subscriptionsPerMonth = accounts
    .filter(a => a.type === "Подписка" && a.status === "Активен")
    .reduce((sum, a) => {
      const cost = parseFloat(a.costAmount.replace(/[^0-9.]/g, "")) || 0;
      return sum + (a.costPeriod === "год" ? cost / 12 : cost);
    }, 0);

  const threats = accounts.filter(a => 
    !a.has2fa || 
    (!a.lastPwChange || (Date.now() - new Date(a.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000))
  ).length;

  const forPosting = accounts.filter(a => a.postingEnabled).length;

  const navigateTo = (tab: string, filter?: string) => {
    if (filter) localStorage.setItem("account_filter", filter);
    onNavigate(tab);
  };

  const runAudit = async () => {
    setIsAuditing(true);
    setShowAuditModal(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result: AuditResult = {
      totalAccounts: accounts.length,
      without2FA: accounts.filter(a => !a.has2fa).length,
      oldPasswords: accounts.filter(a => !a.lastPwChange || (Date.now() - new Date(a.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000)).length,
      weakPasswords: accounts.filter(a => a.password && a.password.length < 8).length,
      threats: threats
    };
    
    setAuditResult(result);
    setIsAuditing(false);
    
    const logs = JSON.parse(localStorage.getItem("promptcraft_audit_log") || "[]");
    logs.unshift({ id: Date.now().toString(), timestamp: new Date().toISOString(), action: "Аудит безопасности", details: `Найдено ${result.threats} угроз`, status: result.threats > 0 ? "warning" : "success" });
    localStorage.setItem("promptcraft_audit_log", JSON.stringify(logs.slice(0, 100)));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🔹 ПЕРЕСТРОЕНО: Теперь блоки идентичны разделу "Безопасность" */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Всего аккаунтов */}
        <button 
          type="button"
          onClick={() => navigateTo("accounts")}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-muted-foreground">Всего аккаунтов</span>
          </div>
          <p className="text-2xl font-bold">{totalAccounts}</p>
        </button>

        {/* 2. Подписки/мес */}
        <button 
          type="button"
          onClick={() => navigateTo("accounts", "subscriptions")}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-muted-foreground">Подписки/мес</span>
          </div>
          <p className="text-2xl font-bold">{subscriptionsPerMonth.toFixed(0)} <span className="text-lg text-muted-foreground font-normal">у.е.</span></p>
        </button>

        {/* 3. Угрозы */}
        <button 
          type="button"
          onClick={() => navigateTo("security")}
          className="bg-card rounded-xl border border-border p-4 hover:border-destructive/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-muted-foreground">Угрозы</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{threats}</p>
        </button>

        {/* 4. Для постинга */}
        <button 
          type="button"
          onClick={() => navigateTo("accounts")}
          className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors text-left group"
        >
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">Для постинга</span>
          </div>
          <p className="text-2xl font-bold">{forPosting}</p>
        </button>
      </div>

      {/* Статус безопасности (остался без изменений) */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><Shield className="h-6 w-6" /></div>
            <div>
              <h3 className="text-lg font-semibold">Статус безопасности</h3>
              <p className="text-sm text-muted-foreground mt-1">{threats === 0 ? "Все аккаунты защищены" : `Найдено ${threats} угроз безопасности`}</p>
            </div>
          </div>
          <button onClick={runAudit} disabled={isAuditing} className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium disabled:opacity-50">
            {isAuditing ? "Проверка..." : "Запустить аудит"}
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Уровень защиты</span>
            <span className={`text-sm font-medium ${threats === 0 ? "text-success" : threats < 3 ? "text-warning" : "text-destructive"}`}>
              {threats === 0 ? "Отличный" : threats < 3 ? "Средний" : "Низкий"}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-500 ${threats === 0 ? "bg-success w-full" : threats < 3 ? "bg-warning w-2/3" : "bg-destructive w-1/3"}`} />
          </div>
        </div>

        {threats > 0 && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-sm font-medium text-destructive mb-2">Рекомендации:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {accounts.some(a => !a.has2fa) && <li className="flex items-center gap-2"><AlertCircle className="h-3 w-3 text-destructive" />Включите 2FA для {accounts.filter(a => !a.has2fa).length} аккаунтов</li>}
              {accounts.some(a => !a.lastPwChange || (Date.now() - new Date(a.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000)) && <li className="flex items-center gap-2"><AlertCircle className="h-3 w-3 text-destructive" />Обновите пароли для {accounts.filter(a => !a.lastPwChange || (Date.now() - new Date(a.lastPwChange).getTime() > 180 * 24 * 60 * 60 * 1000)).length} аккаунтов</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={onAdd} className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
          <Plus className="h-4 w-4" /> Добавить аккаунт
        </button>
        <button onClick={onGenerateProfile} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors text-sm font-medium">
          <UserPlus className="h-4 w-4" /> Сгенерировать профиль
        </button>
      </div>

      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowAuditModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Результаты аудита</h3>
              <button onClick={() => setShowAuditModal(false)} className="p-2 rounded-lg hover:bg-muted"><XCircle className="h-5 w-5" /></button>
            </div>
            {isAuditing ? (
              <div className="text-center py-8"><div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-sm text-muted-foreground">Проверка...</p></div>
            ) : auditResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-2xl font-bold text-destructive">{auditResult.without2FA}</p><p className="text-xs text-muted-foreground">Без 2FA</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-2xl font-bold text-warning">{auditResult.oldPasswords}</p><p className="text-xs text-muted-foreground">Старые пароли</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-2xl font-bold text-warning">{auditResult.weakPasswords}</p><p className="text-xs text-muted-foreground">Слабые пароли</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-2xl font-bold text-primary">{auditResult.totalAccounts}</p><p className="text-xs text-muted-foreground">Всего</p></div>
                </div>
                <div className={`p-4 rounded-lg border ${auditResult.threats === 0 ? "bg-success/5 border-success/20" : "bg-destructive/5 border-destructive/20"}`}>
                  <div className="flex items-center gap-2 mb-2">{auditResult.threats === 0 ? <CheckCircle className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}<p className="font-medium">{auditResult.threats === 0 ? "Всё отлично!" : "Требует внимания"}</p></div>
                  <p className="text-sm text-muted-foreground">{auditResult.threats === 0 ? "Все аккаунты защищены" : `Найдено ${auditResult.threats} угроз.`}</p>
                </div>
                <button onClick={() => { setShowAuditModal(false); onNavigate("security"); }} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Перейти в Безопасность</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}