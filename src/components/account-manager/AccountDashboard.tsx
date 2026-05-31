import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Vault, CreditCard, ShieldAlert, Send, ShieldCheck,
  Plus, UserPlus, AlertTriangle, CheckCircle, Bot
} from "lucide-react";

interface AuditResult {
  weakPasswords: number;
  no2fa: number;
  oldPasswords: number;
  total: number;
}

interface AccountDashboardProps {
  onAdd?: () => void;
  onGenerateProfile?: () => void;
}

export function AccountDashboard({ onAdd, onGenerateProfile }: AccountDashboardProps) {
  const navigate = useNavigate();
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [auditing, setAuditing] = useState(false);

  const totalAccounts = 5;
  const monthlySubscriptions = 2;
  const securityThreats = 3;
  const connectedForPosting = 1;

  const runAudit = () => {
    setAuditing(true);
    setTimeout(() => {
      setAuditResult({ weakPasswords: 1, no2fa: 3, oldPasswords: 2, total: 5 });
      setAuditing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Vault className="h-4 w-4" /> Всего аккаунтов
          </div>
          <p className="text-2xl font-bold">{totalAccounts}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <CreditCard className="h-4 w-4" /> Подписки/мес
          </div>
          <p className="text-2xl font-bold">{monthlySubscriptions}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <ShieldAlert className="h-4 w-4 text-destructive" /> Угрозы
          </div>
          <p className="text-2xl font-bold text-destructive">{securityThreats}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Send className="h-4 w-4" /> Для постинга
          </div>
          <p className="text-2xl font-bold">{connectedForPosting}</p>
        </div>
      </div>

      {/* Safe status */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Статус безопасности
          </h3>
          <button
            onClick={runAudit}
            disabled={auditing}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            {auditing ? "Проверка..." : "Запустить аудит"}
          </button>
        </div>

        {!auditResult && !auditing && (
          <p className="text-sm text-muted-foreground">Запустите аудит для проверки слабых паролей, отсутствующей 2FA и устаревших данных</p>
        )}

        {auditing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Анализ аккаунтов...
          </div>
        )}

        {auditResult && (
          <div className="grid sm:grid-cols-3 gap-3 mt-3">
            <div className={`p-3 rounded-xl border ${auditResult.weakPasswords > 0 ? "border-destructive/30 bg-destructive/5" : "border-success/30 bg-success/5"}`}>
              <div className="flex items-center gap-2 mb-1">
                {auditResult.weakPasswords > 0 ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-success" />}
                <span className="text-xs font-medium">Слабые пароли</span>
              </div>
              <p className="text-lg font-bold">{auditResult.weakPasswords}</p>
            </div>
            <div className={`p-3 rounded-xl border ${auditResult.no2fa > 0 ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
              <div className="flex items-center gap-2 mb-1">
                {auditResult.no2fa > 0 ? <ShieldAlert className="h-4 w-4 text-warning" /> : <CheckCircle className="h-4 w-4 text-success" />}
                <span className="text-xs font-medium">Без 2FA</span>
              </div>
              <p className="text-lg font-bold">{auditResult.no2fa}</p>
            </div>
            <div className={`p-3 rounded-xl border ${auditResult.oldPasswords > 0 ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
              <div className="flex items-center gap-2 mb-1">
                {auditResult.oldPasswords > 0 ? <AlertTriangle className="h-4 w-4 text-warning" /> : <CheckCircle className="h-4 w-4 text-success" />}
                <span className="text-xs font-medium">Старые пароли</span>
              </div>
              <p className="text-lg font-bold">{auditResult.oldPasswords}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            if (onAdd) onAdd();
            else navigate("/accounts");
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Добавить аккаунт
        </button>
        
        {/* 🔹 ИСПРАВЛЕНО: Добавлен onClick для генерации профиля */}
        <button 
          onClick={() => {
            if (onGenerateProfile) onGenerateProfile();
            else navigate("/accounts?tab=profiles&generate=true");
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          <Bot className="h-4 w-4" /> Сгенерировать профиль
        </button>
      </div>
    </div>
  );
}