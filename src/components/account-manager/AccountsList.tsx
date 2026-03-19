import { useState, useEffect } from "react";
import { Plus, Trash2, Search, CreditCard, TrendingUp, ExternalLink, StickyNote, Key, Globe, Bot, ShieldCheck, Send, Eye, EyeOff, Copy, MoreHorizontal } from "lucide-react";
import { AccountDetailModal } from "./AccountDetailModal";
import { ProfileGenerator } from "./ProfileGenerator";
import { encryptData, decryptData, packEncrypted, unpackEncrypted } from "@/utils/crypto.utils";

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
}

const initialAccounts: Account[] = [];

const typeFilters = ["Все", "Соцсети", "Подписки", "API", "Маркетплейсы"];
const typeFilterMap: Record<string, string[]> = {
  "Все": [],
  "Соцсети": ["Соцсеть"],
  "Подписки": ["Подписка"],
  "API": ["API"],
  "Маркетплейсы": ["Маркетплейс"],
};

const sortOptions = [
  { key: "date", label: "По дате" },
  { key: "cost", label: "По стоимости" },
  { key: "name", label: "По алфавиту" },
];

const popularServices = [
  { name: "Wildberries", url: "wildberries.ru" },
  { name: "Ozon", url: "ozon.ru" },
  { name: "ВКонтакте", url: "vk.com" },
  { name: "Telegram", url: "t.me" },
  { name: "YouTube", url: "youtube.com" },
  { name: "ChatGPT", url: "chat.openai.com" },
  { name: "Midjourney", url: "midjourney.com" },
];

const typeOptions = ["Аккаунт", "Подписка", "Соцсеть", "Маркетплейс", "API", "Другое"];
const statusOptions = ["Активен", "Заморожен", "Планирую удалить", "Не помню"];
const periodOptions = ["мес", "год", "другое"];
const inputCls = "w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

interface AccountsListProps {
  showFormProp?: boolean;
  onFormClose?: () => void;
  cryptoKey?: CryptoKey | null;
}

export function AccountsList({ showFormProp, onFormClose, cryptoKey }: AccountsListProps) {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Все");
  const [sortBy, setSortBy] = useState("date");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (showFormProp && !showForm) setShowForm(true);
  }, [showFormProp, showForm]);

  // Загрузка зашифрованных данных при разблокировке
  useEffect(() => {
    if (cryptoKey) {
      const stored = localStorage.getItem("encrypted_accounts");
      if (stored) {
        try {
          const { salt, data } = unpackEncrypted(stored);
          const key = cryptoKey; // уже получен из мастер-пароля
          decryptData(new Uint8Array([...salt, ...data]), key).then((decrypted) => {
            const parsed = JSON.parse(decrypted) as Account[];
            setAccounts(parsed);
          });
        } catch (e) {
          console.error("Ошибка расшифровки:", e);
        }
      }
    }
  }, [cryptoKey]);

  const [showGenerator, setShowGenerator] = useState(false);
  const [detailAccount, setDetailAccount] = useState<Account | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Account>>({});

  const typeFilter = typeFilterMap[filterType] || [];
  const filtered = accounts
    .filter((a) => {
      const matchSearch = !search || a.service.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter.length === 0 || typeFilter.includes(a.type);
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.service.localeCompare(b.service);
      if (sortBy === "cost") {
        const ca = parseFloat(a.costAmount.replace(/[^0-9.]/g, "")) || 0;
        const cb = parseFloat(b.costAmount.replace(/[^0-9.]/g, "")) || 0;
        return cb - ca;
      }
      return b.regDate.localeCompare(a.regDate);
    });

  const totalMonth = accounts.filter((a) => a.status === "Активен").reduce((sum, a) => {
    const num = parseFloat(a.costAmount.replace(/[^0-9.]/g, "")) || 0;
    return sum + (a.costPeriod === "год" ? num / 12 : num);
  }, 0);

  const closeForm = () => {
    setShowForm(false);
    onFormClose?.();
  };

  const openAdd = () => {
    setForm({ service: "", url: "", profile: "Личный", type: "Аккаунт", status: "Активен", plan: "", costAmount: "", costPeriod: "мес", regDate: "", nextPayment: "", notes: "", login: "", password: "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.service?.trim()) return;
    const newAcc: Account = {
      id: Date.now().toString(), service: form.service || "", url: form.url || "", profile: form.profile || "Личный",
      type: form.type || "Аккаунт", status: form.status || "Активен", plan: form.plan || "—",
      costAmount: form.costAmount || "0", costPeriod: form.costPeriod || "мес",
      regDate: form.regDate || "", nextPayment: form.nextPayment || "", notes: form.notes || "",
      has2fa: false, lastPwChange: "", login: form.login || "", password: form.password, postingEnabled: false, lastLogin: "",
    };
    
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    
    // Шифруем и сохраняем если есть ключ
    if (cryptoKey) {
      try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const encrypted = await encryptData(JSON.stringify(updated), cryptoKey, salt);
        const packed = packEncrypted(salt, encrypted);
        localStorage.setItem("encrypted_accounts", packed);
      } catch (e) {
        console.error("Ошибка шифрования:", e);
      }
    }
    
    closeForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Удалить запись из менеджера?")) {
      const updated = accounts.filter((a) => a.id !== id);
      setAccounts(updated);
      
      if (cryptoKey) {
        try {
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const encrypted = await encryptData(JSON.stringify(updated), cryptoKey, salt);
          const packed = packEncrypted(salt, encrypted);
          localStorage.setItem("encrypted_accounts", packed);
        } catch (e) {
          console.error("Ошибка шифрования:", e);
        }
      }
    }
  };

  const togglePosting = (id: string) => {
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, postingEnabled: !a.postingEnabled } : a));     
  };

  const handleOneClickLogin = (account: Account) => {
    window.open(`https://${account.url}`, "_blank", "noopener,noreferrer");
    navigator.clipboard.writeText(account.login);
    alert(`Логин скопирован. Вставьте на сайте ${account.service}`);
  };

  const handleSaveGenerated = (profile: { name: string; email: string; password: string }) => {
    const newAcc: Account = {
      id: Date.now().toString(), service: "Новый аккаунт", url: "", profile: "Анонимный",
      type: "Аккаунт", status: "Активен", plan: "—", costAmount: "0", costPeriod: "—",
      regDate: new Date().toISOString().split("T")[0], nextPayment: "", notes: `Сгенерирован: ${profile.name}`,
      has2fa: false, lastPwChange: new Date().toISOString().split("T")[0], login: profile.email, password: profile.password,
      postingEnabled: false, lastLogin: "",
    };
    setAccounts((prev) => [...prev, newAcc]);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><CreditCard className="h-4 w-4" /> Итого в месяц</div>
          <p className="text-2xl font-bold">~{totalMonth.toFixed(0)} у.е.</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><TrendingUp className="h-4 w-4" /> Всего аккаунтов</div>
          <p className="text-2xl font-bold">{accounts.length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />        
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск…" className={`${inputCls} pl-9`} />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`${inputCls} sm:w-36`}>  
          {sortOptions.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
          <Plus className="h-4 w-4" /> Добавить
        </button>
      </div>

      {/* Type filters */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${      
              filterType === f ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">Список аккаунтов пуст</p>
        </div>
      ) : (
        <>
      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="bg-card rounded-xl border border-border p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${a.status === "Активен" ? "bg-success" : a.status === "Заморожен" ? "bg-warning" : "bg-muted-foreground"}`} />
              <h3 className="font-medium text-sm flex-1 truncate">{a.service}</h3>
              {a.has2fa && <span title="2FA"><ShieldCheck className="h-3.5 w-3.5 text-success flex-shrink-0" /></span>}
              {a.postingEnabled && <span title="Постинг"><Send className="h-3.5 w-3.5 text-primary flex-shrink-0" /></span>}
            </div>

            <p className="text-xs text-muted-foreground mb-1">{a.profile} • {a.type}</p>

            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground truncate flex-1">
                {showPasswords[a.id] ? a.login : a.login.replace(/(.{3}).*(@.*)/, "$1***$2")}
              </span>
              <button onClick={() => setShowPasswords((p) => ({ ...p, [a.id]: !p[a.id] }))} className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted">
                {showPasswords[a.id] ? <EyeOff className="h-3 w-3 text-muted-foreground" /> : <Eye className="h-3 w-3 text-muted-foreground" />}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(a.login); alert("Скопировано"); }} className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted">
                <Copy className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            {a.costAmount !== "0 ₽" && a.costAmount !== "0" && (
              <p className="text-xs mb-1"><span className="font-medium">{a.costAmount}</span><span className="text-muted-foreground">/{a.costPeriod}</span>
                {a.nextPayment && a.nextPayment !== "—" && <span className="text-muted-foreground"> • след: {new Date(a.nextPayment).toLocaleDateString("ru-RU")}</span>}
              </p>
            )}

            {a.lastLogin && (
              <p className="text-[10px] text-muted-foreground mb-2">Последний вход: {new Date(a.lastLogin).toLocaleDateString("ru-RU")}</p>
            )}

            <div className="flex items-center gap-1 pt-2 border-t border-border/50">
              <button onClick={() => handleOneClickLogin(a)} className="h-7 px-2 rounded-md hover:bg-muted flex items-center gap-1 text-[10px] text-muted-foreground transition-colors" title="Войти">
                <ExternalLink className="h-3 w-3" /> Войти
              </button>
              <button onClick={() => togglePosting(a.id)} className={`h-7 px-2 rounded-md flex items-center gap-1 text-[10px] transition-colors ${a.postingEnabled ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`} title="Постинг">
                <Send className="h-3 w-3" />
              </button>
              <button onClick={() => setDetailAccount(a)} className="h-7 px-2 rounded-md hover:bg-muted flex items-center gap-1 text-[10px] text-muted-foreground transition-colors" title="Подробнее">
                <Key className="h-3 w-3" /> Детали
              </button>
              <div className="relative ml-auto">
                <button onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)} className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center">
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {menuOpen === a.id && (
                  <div className="absolute right-0 top-8 z-10 bg-popover border border-border rounded-xl shadow-elevated py-1 w-40 animate-fade-in">
                    <button onClick={() => { setDetailAccount(a); setMenuOpen(null); }} className="w-full px-3 py-2 text-xs text-left hover:bg-muted">Редактировать</button>
                    <button onClick={() => { handleDelete(a.id); setMenuOpen(null); }} className="w-full px-3 py-2 text-xs text-left hover:bg-destructive/10 text-destructive">Удалить</button>
                    <button onClick={() => setMenuOpen(null)} className="w-full px-3 py-2 text-xs text-left hover:bg-muted">История</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </>) }

      {/* Add form */}
      {showForm && (
        <div className="bg-card rounded-xl border border-border p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Новый аккаунт / подписка</h3>
            <button onClick={closeForm} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="mb-3">
            <label className="text-xs text-muted-foreground mb-1.5 block">Быстрый выбор</label>
            <div className="flex flex-wrap gap-2">
              {popularServices.map((s) => (
                <button key={s.name} onClick={() => setForm((prev) => ({ ...prev, service: s.name, url: s.url }))} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.service === s.name ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Сервис *</label><input value={form.service || ""} onChange={(e) => setForm((p) => ({ ...p, service: e.target.value }))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">URL</label><input value={form.url || ""} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Логин/email</label><input value={form.login || ""} onChange={(e) => setForm((p) => ({ ...p, login: e.target.value }))} className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Пароль</label><input type="password" value={form.password || ""} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className={`${inputCls} mt-1`} placeholder="••••••••" /></div>
            <div><label className="text-xs text-muted-foreground">Тип</label><select value={form.type || ""} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className={`${inputCls} mt-1`}>{typeOptions.map((t) => <option key={t}>{t}</option>)}</select></div>
            <div><label className="text-xs text-muted-foreground">Стоимость</label><input value={form.costAmount || ""} onChange={(e) => setForm((p) => ({ ...p, costAmount: e.target.value }))} placeholder="0" className={`${inputCls} mt-1`} /></div>
            <div><label className="text-xs text-muted-foreground">Периодичность</label><select value={form.costPeriod || "мес"} onChange={(e) => setForm((p) => ({ ...p, costPeriod: e.target.value }))} className={`${inputCls} mt-1`}>{periodOptions.map((p) => <option key={p}>{p}</option>)}</select></div>
          </div>
          <div className="mt-3"><label className="text-xs text-muted-foreground">Заметки</label><textarea value={form.notes || ""} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputCls} mt-1 resize-none`} /></div>
          <button onClick={handleSave} className="mt-3 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Сохранить</button>
        </div>
      )}

      {/* Detail modal */}
      <AccountDetailModal
        open={!!detailAccount}
        onClose={() => setDetailAccount(null)}
        account={detailAccount}
      />

      {/* Profile generator */}
      <ProfileGenerator
        open={showGenerator}
        onClose={() => setShowGenerator(false)}
        onSave={handleSaveGenerated}
      />
    </div>
  );
}