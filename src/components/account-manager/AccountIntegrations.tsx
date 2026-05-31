import { useState, useEffect } from "react";
import {
  Link2, Plus, Trash2, CheckCircle, AlertCircle, Eye, EyeOff,
  Copy, ExternalLink, RefreshCw, Zap, Database, Globe
} from "lucide-react";
import { toast } from "sonner";
import { encryptData, decryptData, packEncrypted, unpackEncrypted } from "@/utils/crypto.utils";

// 🔹 Типы интеграций
export type IntegrationType = "telegram" | "notion" | "webhook" | "google_sheets";

export type IntegrationItem = {
  id: string;
  type: IntegrationType;
  name: string;
  config: Record<string, string>; // { token: "...", chat_id: "..." }
  status: "connected" | "error" | "unchecked";
  lastChecked: string;
  createdAt: string;
};

const SERVICE_CONFIG: Record<IntegrationType, { 
  label: string; 
  icon: React.ComponentType<any>; 
  fields: { key: string; label: string; placeholder: string; type?: "password" | "text" }[];
  testEndpoint: string;
}> = {
  telegram: {
    label: "Telegram Bot",
    icon: Zap,
    fields: [
      { key: "token", label: "Bot Token", placeholder: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11", type: "password" },
      { key: "chat_id", label: "Chat ID / Username", placeholder: "@mychannel или 123456789" }
    ],
    testEndpoint: "https://api.telegram.org/bot{token}/getMe"
  },
  notion: {
    label: "Notion API",
    icon: Database,
    fields: [
      { key: "api_key", label: "Integration Token", placeholder: "secret_...", type: "password" },
      { key: "database_id", label: "Database ID", placeholder: "abc123..." }
    ],
    testEndpoint: "https://api.notion.com/v1/databases/{database_id}"
  },
  webhook: {
    label: "Webhook URL",
    icon: Globe,
    fields: [
      { key: "url", label: "Webhook URL", placeholder: "https://your-server.com/webhook" },
      { key: "method", label: "Method", placeholder: "POST" }
    ],
    testEndpoint: "{url}"
  },
  google_sheets: {
    label: "Google Sheets",
    icon: Database,
    fields: [
      { key: "api_key", label: "API Key / Service Account JSON", placeholder: "{ ... }", type: "password" },
      { key: "spreadsheet_id", label: "Spreadsheet ID", placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" }
    ],
    testEndpoint: "https://sheets.googleapis.com/v4/spreadsheets/{spreadsheet_id}"
  }
};

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

interface AccountIntegrationsProps {
  cryptoKey: CryptoKey | null;
}

export function AccountIntegrations({ cryptoKey }: AccountIntegrationsProps) {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState<Record<string, boolean>>({});
  const [newIntegration, setNewIntegration] = useState<{ type: IntegrationType; config: Record<string, string> }>({
    type: "telegram",
    config: {}
  });

  // Загрузка зашифрованных интеграций
  useEffect(() => {
    if (!cryptoKey) return;
    const stored = localStorage.getItem("encrypted_integrations");
    if (stored) {
      try {
        const { salt, data } = unpackEncrypted(stored);
        decryptData(data, cryptoKey).then(decrypted => {
          setIntegrations(JSON.parse(decrypted));
        });
      } catch (e) { console.error("Ошибка загрузки интеграций:", e); }
    }
  }, [cryptoKey]);

  // Сохранение (двойная запись + шифрование)
  const saveToIntegrations = async (data: IntegrationItem[]) => {
    setIntegrations(data);
    if (cryptoKey) {
      try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const encrypted = await encryptData(JSON.stringify(data), cryptoKey, salt);
        const packed = packEncrypted(salt, encrypted);
        localStorage.setItem("encrypted_integrations", packed);
      } catch (e) { console.error("Ошибка шифрования интеграций:", e); }
    }
  };

  // Тест подключения к сервису
  const testConnection = async (integration: IntegrationItem) => {
    setTestingId(integration.id);
    try {
      const service = SERVICE_CONFIG[integration.type];
      let url = service.testEndpoint;
      
      // Подстановка значений в URL (для Telegram, Notion)
      Object.entries(integration.config).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
      });

      const headers: Record<string, string> = {};
      if (integration.type === "notion") {
        headers["Authorization"] = `Bearer ${integration.config.api_key}`;
        headers["Notion-Version"] = "2022-06-28";
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: integration.type === "webhook" ? (integration.config.method || "POST") : "GET",
        headers: integration.type === "webhook" ? { "Content-Type": "application/json" } : headers,
        body: integration.type === "webhook" ? JSON.stringify({ test: true, timestamp: new Date().toISOString() }) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok || (integration.type === "telegram" && response.status === 200)) {
        const updated = integrations.map(i => 
          i.id === integration.id 
            ? { ...i, status: "connected" as const, lastChecked: new Date().toISOString() } 
            : i
        );
        await saveToIntegrations(updated);
        toast.success(`✅ ${service.label} подключен`);
      } else {
        const error = await response.text().catch(() => "Неизвестная ошибка");
        toast.error(`❌ Ошибка подключения: ${response.status} ${error.slice(0, 100)}`);
      }
    } catch (error: any) {
      toast.error(`❌ Не удалось проверить: ${error.message || "Таймаут"}`);
    } finally {
      setTestingId(null);
    }
  };

  // Добавление новой интеграции
  const handleAddIntegration = async () => {
    if (!cryptoKey) { toast.error("Требуется разблокировка"); return; }
    
    const service = SERVICE_CONFIG[newIntegration.type];
    const required = service.fields.filter(f => !newIntegration.config[f.key]?.trim());
    if (required.length > 0) {
      toast.error(`Заполните: ${required.map(f => f.label).join(", ")}`);
      return;
    }

    const newItem: IntegrationItem = {
      id: `int_${Date.now()}`,
      type: newIntegration.type,
      name: `${service.label} #${integrations.filter(i => i.type === newIntegration.type).length + 1}`,
      config: newIntegration.config,
      status: "unchecked",
      lastChecked: "",
      createdAt: new Date().toISOString()
    };

    await saveToIntegrations([...integrations, newItem]);
    setShowAddModal(false);
    setNewIntegration({ type: "telegram", config: {} });
    toast.success("Интеграция добавлена");
  };

  // Удаление
  const deleteIntegration = async (id: string) => {
    if (confirm("Удалить эту интеграцию?")) {
      await saveToIntegrations(integrations.filter(i => i.id !== id));
      toast.success("Интеграция удалена");
    }
  };

  // Копирование значения
  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Скопировано");
  };

  const ServiceIcon = ({ type }: { type: IntegrationType }) => {
    const Icon = SERVICE_CONFIG[type].icon;
    return <Icon className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Хедер */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" /> Интеграции с сервисами
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Подключите внешние сервисы для реальной работы агентов и скилов
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Добавить интеграцию
        </button>
      </div>

      {/* Список интеграций */}
      {integrations.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl bg-muted/30 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Link2 className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-1">Нет подключенных сервисов</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Добавьте первую интеграцию, чтобы агенты могли отправлять данные во внешние сервисы
          </p>
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Подключить сервис
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map(int => {
            const service = SERVICE_CONFIG[int.type];
            const StatusIcon = int.status === "connected" ? CheckCircle : int.status === "error" ? AlertCircle : RefreshCw;
            const statusColor = int.status === "connected" ? "text-green-600 bg-green-100" : int.status === "error" ? "text-red-600 bg-red-100" : "text-yellow-600 bg-yellow-100";
            
            return (
              <div key={int.id} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ServiceIcon type={int.type} />
                    <div>
                      <h3 className="font-medium">{int.name}</h3>
                      <span className="text-[10px] text-muted-foreground">{service.label}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                    <StatusIcon className="h-3 w-3" />
                    {int.status === "connected" ? "Подключено" : int.status === "error" ? "Ошибка" : "Не проверено"}
                  </div>
                </div>

                {/* Конфигурация (скрытая) */}
                <div className="mb-3 space-y-2">
                  {service.fields.map(field => (
                    <div key={field.key} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{field.label}:</span>
                      <div className="flex items-center gap-1">
                        <code className="px-1.5 py-0.5 bg-muted rounded text-[10px] truncate max-w-[100px]">
                          {showConfig[int.id] ? int.config[field.key] : "••••••••"}
                        </code>
                        <button onClick={() => setShowConfig(p => ({ ...p, [int.id]: !p[int.id] }))} className="p-0.5 hover:bg-muted rounded">
                          {showConfig[int.id] ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
                        </button>
                        <button onClick={() => copyValue(int.config[field.key])} className="p-0.5 hover:bg-muted rounded">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Действия */}
                <div className="flex gap-2 pt-3 border-t border-border">
                  <button 
                    onClick={() => testConnection(int)}
                    disabled={testingId === int.id}
                    className="flex-1 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {testingId === int.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3 w-3" />
                    )}
                    Проверить
                  </button>
                  <button 
                    onClick={() => deleteIntegration(int.id)}
                    className="py-1.5 px-3 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/5 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {int.lastChecked && (
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Последняя проверка: {new Date(int.lastChecked).toLocaleString("ru-RU")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Модал добавления */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Подключить сервис</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-muted"><Link2 className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Тип сервиса</label>
                <select 
                  value={newIntegration.type} 
                  onChange={e => setNewIntegration(p => ({ ...p, type: e.target.value as IntegrationType, config: {} }))}
                  className={inputCls}
                >
                  {Object.entries(SERVICE_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
              </div>

              {SERVICE_CONFIG[newIntegration.type].fields.map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium mb-1 block">{field.label}</label>
                  <input
                    type={field.type || "text"}
                    value={newIntegration.config[field.key] || ""}
                    onChange={e => setNewIntegration(p => ({ ...p, config: { ...p.config, [field.key]: e.target.value } }))}
                    placeholder={field.placeholder}
                    className={inputCls}
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={handleAddIntegration} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold">
                  Подключить
                </button>
                <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted">
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}