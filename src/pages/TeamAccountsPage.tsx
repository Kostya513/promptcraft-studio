import { useState } from "react";
import {
  Users, Crown, Building2, Rocket, Plus, Mail, Trash2, Shield,
  CreditCard, BarChart3, FolderOpen, Search, Settings, Link2,
  Check, X, ChevronRight, UserPlus, Download, Bell, Eye,
  Edit, MessageSquare, Clock, DollarSign, Lock, RefreshCw
} from "lucide-react";

type TeamTab = "dashboard" | "members" | "library" | "billing" | "settings";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member" | "viewer";
  status: "active" | "invited" | "deactivated";
  joinedAt: string;
  lastActive: string;
  spending: number;
}

interface TeamPrompt {
  id: string;
  title: string;
  category: string;
  addedBy: string;
  addedAt: string;
  folder: string;
  usageCount: number;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  items: number;
}

const tiers = [
  {
    key: "startup",
    name: "Startup",
    price: "2 999 ₽/мес",
    maxMembers: 5,
    icon: Rocket,
    features: [
      "До 5 участников",
      "Общая библиотека промптов",
      "Единый биллинг",
      "Базовые отчёты по расходам",
      "Стандартная поддержка",
    ],
  },
  {
    key: "business",
    name: "Business",
    price: "9 999 ₽/мес",
    maxMembers: 20,
    icon: Building2,
    features: [
      "До 20 участников",
      "Все функции Startup",
      "Ролевой доступ (Admin, Manager, Member, Viewer)",
      "SSO интеграция",
      "Расширенные отчёты по проектам",
      "Приоритетная поддержка",
      "Slack / Teams интеграция",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Индивидуально",
    maxMembers: Infinity,
    icon: Crown,
    features: [
      "Безлимитные участники",
      "Все функции Business",
      "Персональный менеджер",
      "Кастомный SLA",
      "Интеграции с внутренними системами",
      "White-label опция",
      "On-premise развертывание",
      "Обучающие сессии",
    ],
  },
];

const roleLabels: Record<string, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  member: "Участник",
  viewer: "Наблюдатель",
};

const roleColors: Record<string, string> = {
  admin: "text-destructive",
  manager: "text-primary",
  member: "text-foreground",
  viewer: "text-muted-foreground",
};

const mockMembers: TeamMember[] = [];

const mockPrompts: TeamPrompt[] = [];

const mockInvoices: Invoice[] = [];

export default function TeamAccountsPage() {
  const [hasTeam, setHasTeam] = useState(false);
  const [activeTab, setActiveTab] = useState<TeamTab>("dashboard");
  const [showTierSelect, setShowTierSelect] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [librarySearch, setLibrarySearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedTier] = useState("business");
  const [showSSOConfig, setShowSSOConfig] = useState(false);
  const [spendingLimits, setSpendingLimits] = useState({
    manager: 50000,
    member: 10000,
  });
  const [notifyThresholds, setNotifyThresholds] = useState([50, 80, 100]);

  const tabs: { key: TeamTab; label: string; icon: typeof Users }[] = [
    { key: "dashboard", label: "Обзор", icon: BarChart3 },
    { key: "members", label: "Участники", icon: Users },
    { key: "library", label: "Библиотека", icon: FolderOpen },
    { key: "billing", label: "Биллинг", icon: CreditCard },
    { key: "settings", label: "Настройки", icon: Settings },
  ];

  // Tier selection screen
  if (!hasTeam || showTierSelect) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Командные аккаунты</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Выберите тарифный план для вашей команды
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`rounded-xl border p-6 flex flex-col ${
                tier.key === "business"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <tier.icon className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">{tier.name}</h3>
              </div>
              <p className="text-2xl font-bold mb-4">{tier.price}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setHasTeam(true);
                  setShowTierSelect(false);
                }}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tier.key === "business"
                    ? "gradient-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {tier.key === "enterprise" ? "Связаться" : "Выбрать"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeMembers = mockMembers.filter((m) => m.status === "active").length;
  const totalSpending = mockMembers.reduce((s, m) => s + m.spending, 0);
  const filteredMembers = mockMembers.filter(
    (m) =>
      !memberSearch.trim() ||
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.email.toLowerCase().includes(memberSearch.toLowerCase())
  );
  const filteredPrompts = mockPrompts.filter(
    (p) =>
      !librarySearch.trim() ||
      p.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      p.folder.toLowerCase().includes(librarySearch.toLowerCase())
  );
  const recentActivity: {text: string; time: string; icon: typeof Users}[] = [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Командный аккаунт</h1>
        <span className="text-xs px-2 py-1 rounded-full gradient-primary text-primary-foreground font-medium">
          Business
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Управление командой и совместная работа с промптами
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Участников", value: `${activeMembers}/${tiers[1].maxMembers}`, icon: Users },
              { label: "Промптов в библиотеке", value: mockPrompts.length.toString(), icon: FolderOpen },
              { label: "Расход за месяц", value: `${totalSpending.toLocaleString()} ₽`, icon: DollarSign },
              { label: "Бюджет остаток", value: `${(50000 - totalSpending).toLocaleString()} ₽`, icon: BarChart3 },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Последняя активность</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Нет активности</p>
              ) : (
                recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <item.icon className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p>{item.text}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
            >
              <UserPlus className="h-4 w-4" />
              Пригласить участника
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
            >
              <FolderOpen className="h-4 w-4" />
              Создать папку
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium"
            >
              <BarChart3 className="h-4 w-4" />
              Отчёт по расходам
            </button>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === "members" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Поиск участников..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium"
            >
              <UserPlus className="h-4 w-4" />
              Пригласить
            </button>
          </div>

          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {member.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <span className={`text-xs font-medium ${roleColors[member.role]}`}>
                      {roleLabels[member.role]}
                    </span>
                    {member.status === "invited" && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                        Приглашён
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{member.spending.toLocaleString()} ₽</p>
                  <p className="text-xs text-muted-foreground">
                    {member.lastActive ? `Активен: ${member.lastActive}` : "—"}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Изменить роль">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                  </button>
                  {member.role !== "admin" && (
                    <button className="p-2 rounded-lg hover:bg-destructive/10 transition-colors" title="Удалить">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library Tab */}
      {activeTab === "library" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Поиск в библиотеке..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
              <Plus className="h-4 w-4" />
              Папка
            </button>
          </div>

          {/* Folders */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["Все", "Маркетинг", "Дизайн", "E-commerce", "Разработка"].map((folder) => (
              <button
                key={folder}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-card border border-border text-muted-foreground hover:text-foreground whitespace-nowrap"
              >
                {folder}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{prompt.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {prompt.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      📁 {prompt.folder}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Добавил: {prompt.addedBy}
                    </span>
                  </div>
                </div>
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{prompt.usageCount} использований</p>
                  <p className="text-xs text-muted-foreground">{prompt.addedAt}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Комментарии">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="История версий">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="space-y-6 animate-fade-in">
          {/* Spending by member */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Расходы по участникам (текущий месяц)</h3>
            <div className="space-y-3">
              {mockMembers
                .filter((m) => m.spending > 0)
                .sort((a, b) => b.spending - a.spending)
                .map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <p className="text-sm w-36 truncate">{member.name}</p>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary rounded-full"
                        style={{
                          width: `${(member.spending / Math.max(...mockMembers.map((m) => m.spending))) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm font-medium w-24 text-right">
                      {member.spending.toLocaleString()} ₽
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Spending limits */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Лимиты расходов</h3>
            <div className="space-y-3">
              {[
                { role: "manager", label: "Менеджер" },
                { role: "member", label: "Участник" },
              ].map((item) => (
                <div key={item.role} className="flex items-center gap-3">
                  <p className="text-sm w-28">{item.label}</p>
                  <input
                    type="number"
                    value={spendingLimits[item.role as keyof typeof spendingLimits]}
                    onChange={(e) =>
                      setSpendingLimits((prev) => ({
                        ...prev,
                        [item.role]: Number(e.target.value),
                      }))
                    }
                    className="w-32 px-3 py-1.5 rounded-lg bg-background border border-border text-sm"
                  />
                  <span className="text-xs text-muted-foreground">₽/мес</span>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Уведомления при {notifyThresholds.join("%, ")}% бюджета
                </p>
              </div>
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Счета</h3>
            <div className="space-y-2">
              {mockInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{inv.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.date} · {inv.items} позиций
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      inv.status === "paid"
                        ? "bg-success/10 text-success"
                        : inv.status === "pending"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {inv.status === "paid" ? "Оплачен" : inv.status === "pending" ? "Ожидает" : "Ошибка"}
                  </span>
                  <p className="text-sm font-bold">{inv.amount.toLocaleString()} ₽</p>
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Скачать PDF">
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-4 animate-fade-in">
          {/* Team info */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Информация о команде</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Название команды</label>
                <input
                  type="text"
                  defaultValue="DigitalAgency Pro"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Сайт компании</label>
                <input
                  type="text"
                  defaultValue="https://digitalagency.ru"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Отрасль</label>
                <select className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm">
                  <option>Маркетинг и реклама</option>
                  <option>IT и разработка</option>
                  <option>Образование</option>
                  <option>E-commerce</option>
                  <option>Медиа и контент</option>
                </select>
              </div>
              <button className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
                Сохранить
              </button>
            </div>
          </div>

          {/* SSO */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Single Sign-On (SSO)</h3>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Business+
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Интеграция с корпоративными провайдерами идентификации
            </p>
            <div className="space-y-2">
              {["Azure Active Directory", "Google Workspace", "Okta", "SAML 2.0 (Custom)"].map(
                (provider) => (
                  <div
                    key={provider}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{provider}</span>
                    </div>
                    <button
                      onClick={() => setShowSSOConfig(true)}
                      className="text-xs px-3 py-1 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    >
                      Настроить
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Integrations */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-semibold mb-3">Интеграции</h3>
            <div className="space-y-2">
              {[
                { name: "Slack", desc: "Уведомления о покупках и активности", connected: true },
                { name: "Microsoft Teams", desc: "Уведомления в канал команды", connected: false },
              ].map((int) => (
                <div
                  key={int.name}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="text-sm font-medium">{int.name}</p>
                    <p className="text-xs text-muted-foreground">{int.desc}</p>
                  </div>
                  <button
                    className={`text-xs px-3 py-1 rounded-lg ${
                      int.connected
                        ? "bg-success/10 text-success"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {int.connected ? "Подключено" : "Подключить"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="font-semibold text-destructive mb-2">Опасная зона</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Эти действия необратимы. Будьте осторожны.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTierSelect(true)}
                className="text-xs px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted"
              >
                Сменить тариф
              </button>
              <button className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10">
                Удалить команду
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Пригласить участника</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.ru"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Роль</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                >
                  <option value="manager">Менеджер</option>
                  <option value="member">Участник</option>
                  <option value="viewer">Наблюдатель</option>
                </select>
              </div>
              <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted">
                <p className="font-medium mb-1">Права роли «{roleLabels[inviteRole]}»:</p>
                {inviteRole === "manager" && <p>Управление участниками, покупки, отчёты по проектам</p>}
                {inviteRole === "member" && <p>Покупка промптов, доступ к библиотеке, загрузка промптов</p>}
                {inviteRole === "viewer" && <p>Просмотр библиотеки, комментарии</p>}
              </div>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteEmail("");
                }}
                className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
              >
                Отправить приглашение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SSO config modal */}
      {showSSOConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Настройка SSO</h3>
              <button onClick={() => setShowSSOConfig(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">Шаг 1: Скачайте метаданные</p>
                <p className="text-muted-foreground text-xs mb-2">
                  Скачайте XML-файл метаданных и загрузите его в ваш провайдер идентификации
                </p>
                <button className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-card border border-border">
                  <Download className="h-3 w-3" />
                  Скачать metadata.xml
                </button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Entity ID</label>
                <input
                  type="text"
                  placeholder="https://your-idp.com/entity-id"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">SSO URL</label>
                <input
                  type="text"
                  placeholder="https://your-idp.com/sso"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Сертификат (X.509)</label>
                <textarea
                  placeholder="-----BEGIN CERTIFICATE-----"
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium">
                  Тест подключения
                </button>
                <button
                  onClick={() => setShowSSOConfig(false)}
                  className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
