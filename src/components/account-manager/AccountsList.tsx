import { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Search, CreditCard, ExternalLink, Edit,
  Key, MoreHorizontal, Globe, ShoppingBag, Bot, MessageSquare, Video, Mail, Lock,
  Eye, EyeOff, Copy, Clock
} from "lucide-react";
import { AccountDetailModal } from "./AccountDetailModal";
import { encryptData, decryptData, packEncrypted, unpackEncrypted } from "@/utils/crypto.utils";
import { toast } from "sonner";

interface Account {
  id: string;
  service: string;
  url: string;
  profile: string;
  type: string;
  status: string;
  plan: string;
  costAmount: string;
  costPeriod: string;
  regDate: string;
  nextPayment: string;
  notes: string;
  has2fa: boolean;
  lastPwChange: string;
  login: string;
  password?: string;
  postingEnabled: boolean;
  lastLogin: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
}

const initialAccounts: Account[] = [];

const typeFilters = ["Все", "Соцсети", "Подписки", "API", "Маркетплейсы"];
const typeFilterMap: Record<string, string[]> = {
  "Все": [],
  "Соцсети": ["Соцсеть", "Social"],
  "Подписки": ["Подписка", "Subscription"],
  "API": ["API"],
  "Маркетплейсы": ["Маркетплейс", "Marketplace"],
};

const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

interface AccountsListProps {
  showFormProp?: boolean;
  onFormClose?: () => void;
  cryptoKey?: CryptoKey | null;
}

const detectServiceType = (serviceName: string, url: string = ""): string => {
  const s = (serviceName + " " + url).toLowerCase();
  if (s.includes("vk") || s.includes("вконтакте") || s.includes("telegram") || s.includes("instagram") || s.includes("facebook") || s.includes("twitter") || s.includes("youtube")) return "Соцсеть";
  if (s.includes("wb") || s.includes("wildberries") || s.includes("ozon") || s.includes("aliexpress") || s.includes("amazon")) return "Маркетплейс";
  if (s.includes("netflix") || s.includes("spotify") || s.includes("youtube premium") || s.includes("icloud") || s.includes("подписк")) return "Подписка";
  if (s.includes("api") || s.includes("openai") || s.includes("chatgpt") || s.includes("claude")) return "API";
  return "Аккаунт";
};

const getServiceIcon = (service: string) => {
  const s = service.toLowerCase();
  if (s.includes("vk") || s.includes("вконтакте")) return MessageSquare;
  if (s.includes("telegram") || s.includes("tg")) return Bot;
  if (s.includes("youtube") || s.includes("rutube")) return Video;
  if (s.includes("wb") || s.includes("wildberries") || s.includes("ozon")) return ShoppingBag;
  if (s.includes("chatgpt") || s.includes("openai") || s.includes("midjourney") || s.includes("claude")) return Bot;
  if (s.includes("mail") || s.includes("google")) return Mail;
  if (s.includes("api")) return Globe;
  return Lock;
};

export function AccountsList({ showFormProp, onFormClose, cryptoKey }: AccountsListProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Все");
  const [showForm, setShowForm] = useState(false);
  const [detailAccount, setDetailAccount] = useState<Account | null>(null);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Account>>({});
  const [addFromTab, setAddFromTab] = useState<string>("Все");
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (showFormProp && !showForm) setShowForm(true);
  }, [showFormProp, showForm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'select') {
      setIsSelectionMode(true);
    }
  }, []);

  useEffect(() => {
    if (cryptoKey) {
      const stored = localStorage.getItem("encrypted_accounts");
      if (stored) {
        try {
          const { salt, data } = unpackEncrypted(stored);
          decryptData(data, cryptoKey).then((decrypted) => {
            const parsed = JSON.parse(decrypted) as Account[];
            const updated = parsed.map(acc => ({
              ...acc,
              type: !acc.type || acc.type === "Аккаунт" ? detectServiceType(acc.service, acc.url) : acc.type
            }));
            if (updated.some((acc, i) => acc.type !== parsed[i].type)) {
              setAccounts(updated);
              encryptData(JSON.stringify(updated), cryptoKey, salt).then(enc => {
                localStorage.setItem("encrypted_accounts", packEncrypted(salt, enc));
              });
            } else {
              setAccounts(updated);
            }
          });
        } catch (e) { console.error("Ошибка загрузки:", e); }
      }
    }
  }, [cryptoKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && !Object.values(menuRefs.current).some(ref => ref?.contains(event.target as Node))) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const typeFilter = typeFilterMap[filterType] || [];
  const filtered = accounts.filter((a) => {
    const matchSearch = !search || a.service.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter.length === 0 || typeFilter.includes(a.type);
    return matchSearch && matchType;
  });

  const totalMonth = accounts.filter((a) => a.status === "Активен").reduce((sum, a) => {
    const num = parseFloat(a.costAmount.replace(/[^0-9.]/g, "")) || 0;
    return sum + (a.costPeriod === "год" ? num / 12 : num);
  }, 0);

  const openAdd = () => {
    setAddFromTab(filterType);
    let defaultType = "Аккаунт";
    if (filterType === "API") defaultType = "API";
    else if (filterType === "Соцсети") defaultType = "Соцсеть";
    else if (filterType === "Подписки") defaultType = "Подписка";
    else if (filterType === "Маркетплейсы") defaultType = "Маркетплейс";
    
    setForm({ 
      service: "", url: "", profile: "Личный", type: defaultType, status: "Активен", 
      plan: "", costAmount: "", costPeriod: "мес", regDate: "", nextPayment: "", 
      notes: "", login: "", password: "", apiKey: "", apiSecret: "", webhookUrl: "" 
    });
    setShowForm(true);
    setEditAccount(null);
  };

  const handleSave = async () => {
    if (!form.service?.trim()) { toast.error("Введите название сервиса"); return; }
    
    const detectedType = !form.type || form.type === "Аккаунт" ? detectServiceType(form.service, form.url) : form.type;
    
    const newAcc: Account = {
      id: editAccount?.id || Date.now().toString(),
      service: form.service || "", url: form.url || "", profile: form.profile || "Личный",
      type: detectedType, status: form.status || "Активен", plan: form.plan || "—",
      costAmount: form.costAmount || "0", costPeriod: form.costPeriod || "мес",
      regDate: form.regDate || "", nextPayment: form.nextPayment || "", notes: form.notes || "",
      has2fa: false, lastPwChange: "", 
      login: form.login || form.apiKey || "",
      password: form.password || form.apiSecret,
      postingEnabled: false, lastLogin: "",
      apiKey: form.apiKey,
      apiSecret: form.apiSecret,
      webhookUrl: form.webhookUrl,
    };
    
    const updated = editAccount ? accounts.map(a => a.id === editAccount.id ? newAcc : a) : [...accounts, newAcc];
    setAccounts(updated);
    
    if (cryptoKey) {
      try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const encrypted = await encryptData(JSON.stringify(updated), cryptoKey, salt);
        localStorage.setItem("encrypted_accounts", packEncrypted(salt, encrypted));
      } catch (e) { console.error("Ошибка шифрования:", e); }
    }
    setShowForm(false);
    setEditAccount(null);
    onFormClose?.();
    toast.success(editAccount ? "Аккаунт обновлен" : "Аккаунт добавлен");
  };

  const handleDelete = async (id: string) => {
    if (confirm("Удалить эту запись?")) {
      const updated = accounts.filter((a) => a.id !== id);
      setAccounts(updated);
      if (cryptoKey) {
        try {
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const encrypted = await encryptData(JSON.stringify(updated), cryptoKey, salt);
          localStorage.setItem("encrypted_accounts", packEncrypted(salt, encrypted));
        } catch (e) { console.error("Ошибка:", e); }
      }
      setMenuOpen(null);
      toast.success("Аккаунт удален");
    }
  };

  const handleEdit = (account: Account) => {
    setEditAccount(account);
    setForm(account);
    setShowForm(true);
    setMenuOpen(null);
  };

  const handleOneClickLogin = (account: Account) => {
    const finalUrl = account.url.startsWith('http') ? account.url : `https://${account.url}`;
    window.open(finalUrl, "_blank");
    if (account.login) { navigator.clipboard.writeText(account.login); toast.success("Логин скопирован"); }
  };

  const copyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    toast.success("Скопировано");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />        
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск сервиса..." className={`${inputCls} pl-9`} />
        </div>
        <div className="flex gap-3">
          <div className="bg-card rounded-xl border border-border px-4 py-2 flex items-center gap-2">
             <CreditCard className="h-4 w-4 text-muted-foreground" />
             <span className="text-sm font-medium">~{totalMonth.toFixed(0)} у.е./мес</span>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm">
            <Plus className="h-4 w-4" /> Добавить {addFromTab === "API" ? "ключ" : "сервис"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${      
              filterType === f ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && !showForm ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/20">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-1">{filterType === "Все" ? "Пока нет сервисов" : `В категории "${filterType}" ничего нет`}</p>
          <p className="text-sm text-muted-foreground mb-6">{filterType === "Все" ? "Добавьте ваш первый аккаунт или подписку" : "Переключитесь на вкладку 'Все' или добавьте новый сервис"}</p>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Добавить первый</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a) => {
            const ServiceIcon = getServiceIcon(a.service);
            const hasMenu = menuOpen === a.id;
            
            return (
              <div key={a.id} className="group bg-card rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${a.status === "Активен" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <ServiceIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base truncate max-w-[140px]" title={a.service}>{a.service}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${a.status === "Активен" ? "bg-green-500" : "bg-yellow-500"}`} />
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{a.profile} • {a.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative" ref={el => menuRefs.current[a.id] = el}>
                    <button onClick={() => setMenuOpen(hasMenu ? null : a.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><MoreHorizontal className="h-5 w-5" /></button>
                    {hasMenu && (
                      <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded-xl shadow-elevated py-1 animate-fade-in">
                        
                        {isSelectionMode && (
                          <>
                            <button 
                              onClick={() => {
                                const contextStr = localStorage.getItem("integration_selection_context");
                                if (!contextStr) {
                                  toast.error("Контекст потерян.");
                                  return;
                                }
                                const context = JSON.parse(contextStr);
                                if (!context.skillId) {
                                  toast.error("ID скила не найден.");
                                  return;
                                }

                                const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
                                const updatedSkills = skills.map((s: any) => {
                                  if (s.id === context.skillId) {
                                    const currentIntegrations = s.integrations || [];
                                    if (!currentIntegrations.some((i: any) => i.id === a.id)) {
                                      return { 
                                        ...s, 
                                        integrations: [...currentIntegrations, { 
                                          id: a.id, 
                                          service: a.service, 
                                          name: a.service,
                                          source: "account_manager" 
                                        }] 
                                      };
                                    }
                                  }
                                  return s;
                                });

                                localStorage.setItem("promptcraft_skills", JSON.stringify(updatedSkills));
                                toast.success("✅ Аккаунт выбран!");
                                
                                setTimeout(() => {
                                  window.location.href = context.returnUrl || "/studio";
                                }, 600);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10 text-primary flex items-center gap-2 font-medium"
                            >
                              <Plus className="h-4 w-4" /> Выбрать
                            </button>
                            <div className="border-t border-border my-1" />
                          </>
                        )}
                        
                        <button onClick={() => handleEdit(a)} className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"><Edit className="h-4 w-4" /> Редактировать</button>
                        <button onClick={() => setDetailAccount(a)} className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"><Clock className="h-4 w-4" /> История</button>
                        
                        <div className="border-t border-border my-1" />
                        <button onClick={() => handleDelete(a.id)} className="w-full px-4 py-2 text-left text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"><Trash2 className="h-4 w-4" /> Удалить</button>
                      </div>
                    )}
                  </div>
                </div>

                {a.login && (
                  <div className="mb-4 flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-xs text-muted-foreground truncate flex-1">
                      {showPasswords[a.id] ? a.login : a.login.replace(/(.{3}).*(@.*)/, "$1***$2")}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                      <button onClick={() => setShowPasswords(p => ({ ...p, [a.id]: !p[a.id] }))} className="p-1 hover:bg-muted rounded">
                        {showPasswords[a.id] ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                      {a.password && <button onClick={() => copyPassword(a.password!)} className="p-1 hover:bg-muted rounded"><Copy className="h-3.5 w-3.5 text-muted-foreground" /></button>}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button onClick={() => handleOneClickLogin(a)} className="flex-1 py-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-xs font-medium transition-colors flex items-center justify-center gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" /> Войти
                  </button>
                  <button onClick={() => setDetailAccount(a)} className="px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Key className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg shadow-elevated animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{editAccount ? "Редактировать" : `Новый ${addFromTab === "API" ? "API-ключ" : "сервис"}`}</h3>
              <button onClick={() => { setShowForm(false); setEditAccount(null); onFormClose?.(); }} className="p-2 rounded-lg hover:bg-muted"><span className="text-xl">✕</span></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Сервис *</label><input value={form.service || ""} onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))} className={`${inputCls} mt-1`} placeholder={addFromTab === "API" ? "OpenAI, Anthropic..." : "VK, WB, Netflix..."} /></div>
                <div><label className="text-xs text-muted-foreground">URL / Base URL</label><input value={form.url || ""} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} className={`${inputCls} mt-1`} placeholder={addFromTab === "API" ? "https://api..." : "vk.com" } /></div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">Тип сервиса</label>
                <select value={form.type || "Аккаунт"} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={`${inputCls} mt-1`}>
                  <option value="Аккаунт">Аккаунт (общий)</option>
                  <option value="Соцсеть">Социальная сеть</option>
                  <option value="Подписка">Подписка</option>
                  <option value="Маркетплейс">Маркетплейс</option>
                  <option value="API">API / Сервис</option>
                </select>
              </div>

              {form.type === "API" ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                  <p className="text-xs text-primary font-medium flex items-center gap-1">🔑 Ключи доступа</p>
                  <div><label className="text-xs text-muted-foreground">API Key *</label><input type="password" value={form.apiKey || ""} onChange={(e) => setForm((p) => ({ ...p, apiKey: e.target.value }))} className={`${inputCls} mt-1`} placeholder="sk-..." /></div>
                  <div><label className="text-xs text-muted-foreground">API Secret (опционально)</label><input type="password" value={form.apiSecret || ""} onChange={(e) => setForm((p) => ({ ...p, apiSecret: e.target.value }))} className={`${inputCls} mt-1`} placeholder="Secret key..." /></div>
                  <div><label className="text-xs text-muted-foreground">Webhook URL (опционально)</label><input type="text" value={form.webhookUrl || ""} onChange={(e) => setForm((p) => ({ ...p, webhookUrl: e.target.value }))} className={`${inputCls} mt-1`} placeholder="https://..." /></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-muted-foreground">Логин / Email</label><input value={form.login || ""} onChange={(e) => setForm((p) => ({ ...p, login: e.target.value }))} className={`${inputCls} mt-1`} /></div>
                  <div><label className="text-xs text-muted-foreground">Пароль</label><input type="password" value={form.password || ""} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={`${inputCls} mt-1`} placeholder="••••••••" /></div>
                </div>
              )}
              
              <div><label className="text-xs text-muted-foreground">Заметки</label><textarea value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputCls} mt-1 resize-none`} placeholder={form.type === "API" ? "Для каких задач используется..." : "Для чего используется..."} /></div>
              
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 px-6 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
                  {editAccount ? "Сохранить изменения" : "Сохранить в сейф"}
                </button>
                <button onClick={() => { setShowForm(false); setEditAccount(null); onFormClose?.(); }} className="px-6 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailAccount && <AccountDetailModal open={true} onClose={() => setDetailAccount(null)} account={detailAccount} />}
    </div>
  );
}