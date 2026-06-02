import { useState, useEffect } from "react";
import { Check, Plus, X, Globe, Database, Zap, Lock, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export interface Integration {
  id: string;
  source: "account_manager" | "universal" | "custom";
  service: string;
  name?: string;
  config?: Record<string, any>;
}

interface IntegrationPickerProps {
  skillId?: string;
  source?: 'builder' | 'editor';
  selectedIntegrations: Integration[];
  onChange: (integrations: Integration[]) => void;
}

const UNIVERSAL_CONNECTORS = [
  { id: "http_rest", label: "HTTP/REST API", icon: Globe, desc: "Любой REST API сервис" },
  { id: "websocket", label: "WebSocket", icon: Zap, desc: "Real-time соединение" },
  { id: "database", label: "База данных", icon: Database, desc: "PostgreSQL, MySQL, MongoDB" },
  { id: "graphql", label: "GraphQL", icon: Link, desc: "GraphQL endpoint" },
  { id: "oauth", label: "OAuth 2.0", icon: Lock, desc: "Подключить через OAuth" },
];

function getConnectedAccounts(): { id: string; service: string; name: string }[] {
  try {
    const data = localStorage.getItem("promptcraft_accounts");
    if (!data) return [];
    const accounts = JSON.parse(data);
    return Array.isArray(accounts) ? accounts.map((acc: any) => ({
      id: acc.id,
      service: acc.service || acc.type || "unknown",
      name: acc.name || acc.email || acc.username || "Без названия",
    })) : [];
  } catch {
    return [];
  }
}

export default function IntegrationPicker({ 
  skillId,
  source = 'builder',
  selectedIntegrations = [], 
  onChange 
}: IntegrationPickerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"accounts" | "universal" | "custom">("accounts");
  const [showPicker, setShowPicker] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<{ id: string; service: string; name: string }[]>([]);
  const [customIntegration, setCustomIntegration] = useState({ name: "", url: "", apiKey: "", type: "http_rest" });

  useEffect(() => {
    const accounts = getConnectedAccounts();
    setConnectedAccounts(accounts);
  }, []);

  const handleAddFromManager = (account: { id: string; service: string; name: string }) => {
    const exists = selectedIntegrations.some(i => i.id === account.id);
    if (exists) {
      toast({ title: "️ Уже добавлено", description: "Этот аккаунт уже подключен", variant: "destructive" });
      return;
    }
    const newIntegration: Integration = { 
      id: account.id, 
      source: "account_manager", 
      service: account.service, 
      name: account.name 
    };
    onChange([...selectedIntegrations, newIntegration]);
    setShowPicker(false);
    toast({ title: "✅ Добавлено", description: `Подключено: ${account.name}` });
  };

  const handleAddUniversal = (connectorId: string) => {
    const connector = UNIVERSAL_CONNECTORS.find(c => c.id === connectorId);
    if (!connector) return;
    const id = `universal_${connectorId}_${Date.now()}`;
    const newIntegration: Integration = { 
      id, 
      source: "universal", 
      service: connectorId, 
      name: connector.label 
    };
    onChange([...selectedIntegrations, newIntegration]);
    setShowPicker(false);
    toast({ title: "✅ Добавлено", description: `Коннектор: ${connector.label}` });
  };

  const handleAddCustom = () => {
    if (!customIntegration.name || !customIntegration.url) {
      toast({ title: "️ Заполните поля", description: "Название и URL обязательны", variant: "destructive" });
      return;
    }
    const id = `custom_${Date.now()}`;
    const newIntegration: Integration = { 
      id, 
      source: "custom", 
      service: "custom", 
      name: customIntegration.name,
      config: { url: customIntegration.url, apiKey: customIntegration.apiKey, type: customIntegration.type }
    };
    onChange([...selectedIntegrations, newIntegration]);
    setCustomIntegration({ name: "", url: "", apiKey: "", type: "http_rest" });
    setShowPicker(false);
    toast({ title: "✅ Добавлено", description: `Интеграция: ${customIntegration.name}` });
  };

  const handleRemove = (id: string) => {
    onChange(selectedIntegrations.filter(i => i.id !== id));
    toast({ title: "🗑️ Удалено", description: "Интеграция отключена" });
  };

  return (
    <div className="space-y-3">
      <Label>Интеграции</Label>
      <div className="flex flex-wrap gap-2">
        {selectedIntegrations.map(int => (
          <Badge 
            key={int.id} 
            variant={int.source === "account_manager" ? "default" : int.source === "universal" ? "secondary" : "outline"}
            className="px-3 py-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive group"
          >
            {int.source === "account_manager" && "🔗"}
            {int.source === "universal" && ""}
            {int.source === "custom" && "⚙️"}
            <span className="ml-1">{int.name || int.service}</span>
            <X className="h-3 w-3 ml-1.5 opacity-0 group-hover:opacity-100" onClick={() => handleRemove(int.id)} />
          </Badge>
        ))}
        
        <Button size="sm" variant="outline" onClick={() => setShowPicker(!showPicker)} className="h-8 px-3">
          <Plus className="h-3.5 w-3.5 mr-1" /> Добавить
        </Button>
      </div>

      {showPicker && (
        <Card className="border-border shadow-lg animate-in fade-in slide-in-from-top-2">
          <CardContent className="p-0">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("accounts")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "accounts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                Из Менеджера ({connectedAccounts.length})
              </button>
              <button
                onClick={() => setActiveTab("universal")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "universal" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                Коннекторы
              </button>
              <button
                onClick={() => setActiveTab("custom")}
                className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === "custom" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                Своя
              </button>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto">
              {activeTab === "accounts" && (
                <div className="space-y-2">
                  {connectedAccounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Нет подключённых аккаунтов. 
                      <button 
                        onClick={() => {
                          if (!skillId) {
                            toast({ title: "⚠️ Ошибка", description: "ID скила не определён", variant: "destructive" });
                            return;
                          }
                          
                          // 🔹 ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ПЕРЕД УХОДОМ
                          const currentDraft = localStorage.getItem(`draft_${skillId}`);
                          if (currentDraft) {
                            try {
                              const parsed = JSON.parse(currentDraft);
                              parsed.meta.timestamp = Date.now();
                              localStorage.setItem(`draft_${skillId}`, JSON.stringify(parsed));
                              console.log("💾 Принудительно сохранён черновик перед уходом");
                            } catch (e) {
                              console.error("Ошибка сохранения черновика:", e);
                            }
                          }
                          
                          const context = {
                            skillId,
                            returnUrl: window.location.href,
                            timestamp: Date.now(),
                            source: source
                          };
                          
                          localStorage.setItem("restore_skill_context", JSON.stringify(context));
                          localStorage.setItem("restore_skill_id", skillId);
                          
                          console.log("💾 Сохранён контекст перед уходом:", context);
                          
                          // Небольшая задержка для гарантии сохранения
                          setTimeout(() => {
                            window.location.href = "/accounts?mode=select";
                          }, 100);
                        }} 
                        className="text-primary underline ml-1"
                      >
                        Перейти в Менеджер
                      </button>
                    </p>
                  ) : (
                    connectedAccounts.map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => handleAddFromManager(acc)}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted text-left transition-colors"
                      >
                        <div>
                          <p className="font-medium text-sm">{acc.name}</p>
                          <p className="text-xs text-muted-foreground">{acc.service}</p>
                        </div>
                        <Check className="h-4 w-4 text-primary opacity-0 hover:opacity-100" />
                      </button>
                    ))
                  )}
                </div>
              )}

              {activeTab === "universal" && (
                <div className="grid grid-cols-2 gap-2">
                  {UNIVERSAL_CONNECTORS.map(conn => (
                    <button
                      key={conn.id}
                      onClick={() => handleAddUniversal(conn.id)}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted text-left transition-colors"
                    >
                      <div className="p-2 rounded bg-primary/10 text-primary">
                        <conn.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{conn.label}</p>
                        <p className="text-xs text-muted-foreground">{conn.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "custom" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Название</Label>
                    <Input 
                      placeholder="Например: Binance API" 
                      value={customIntegration.name}
                      onChange={e => setCustomIntegration({...customIntegration, name: e.target.value})}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input 
                      placeholder="https://api.example.com" 
                      value={customIntegration.url}
                      onChange={e => setCustomIntegration({...customIntegration, url: e.target.value})}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">API Key (опционально)</Label>
                    <Input 
                      placeholder="********" 
                      type="password"
                      value={customIntegration.apiKey}
                      onChange={e => setCustomIntegration({...customIntegration, apiKey: e.target.value})}
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Тип</Label>
                    <select 
                      className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                      value={customIntegration.type}
                      onChange={e => setCustomIntegration({...customIntegration, type: e.target.value})}
                    >
                      <option value="http_rest">HTTP/REST</option>
                      <option value="websocket">WebSocket</option>
                      <option value="graphql">GraphQL</option>
                    </select>
                  </div>
                  <Button onClick={handleAddCustom} className="w-full gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" /> Добавить интеграцию
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        {selectedIntegrations.length === 0 
          ? "Добавьте интеграции для работы с внешними сервисами" 
          : `Подключено: ${selectedIntegrations.length} сервис(ов)`}
      </p>
    </div>
  );
}