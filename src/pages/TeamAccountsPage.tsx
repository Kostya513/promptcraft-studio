import { useState, useEffect, useRef } from "react";
import {
  Users, Crown, Building2, Rocket, Plus, Mail, Trash2, Shield,
  CreditCard, BarChart3, FolderOpen, Search, Settings, Link2,
  Check, X, ChevronRight, UserPlus, Download, Bell, Eye,
  Edit, MessageSquare, Clock, DollarSign, Lock, RefreshCw, Zap, FileText,
  ToggleRight, ToggleLeft, FolderPlus, Folder, Pencil, MoreHorizontal, Copy,
  Upload, File, Code, Terminal, Copy as CopyIcon, Move, Save, EyeOff,
  ChevronLeft, Home, Share2, History, GitBranch
} from "lucide-react";

// --- ТИПЫ ДАННЫХ ---

type TeamTab = "dashboard" | "members" | "library" | "billing" | "settings";
type ContentType = "all" | "prompt" | "skill" | "file";
type ElementType = "prompt" | "skill" | "file";
type Permission = "admin" | "editor" | "viewer";

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  permissions: Record<string, Permission>;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  isPublic: boolean;
}

interface TeamItem {
  id: string;
  folderId: string;
  type: ElementType;
  title: string;
  description: string;
  content: string;
  category: string;
  addedBy: string;
  addedAt: string;
  updatedAt: string;
  usageCount: number;
  version: string;
  isActive: boolean;
  tags: string[];
  files: UploadedFile[];
  settings?: SkillSettings;
  status: "draft" | "review" | "active";
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface SkillSettings {
  triggers: string[];
  integrations: string[];
  inputSchema: string;
  outputSchema: string;
  testCases: string[];
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  items: number;
}

// --- КОНСТАНТЫ ---

const tiers = [
  {
    key: "startup",
    name: "Startup",
    price: "2 999 ₽/мес",
    maxMembers: 5,
    icon: Rocket,
    features: ["До 5 участников", "Общая библиотека промптов и скилов", "Единый биллинг", "Базовые отчёты по расходам", "Стандартная поддержка"],
  },
  {
    key: "business",
    name: "Business",
    price: "9 999 ₽/мес",
    maxMembers: 20,
    icon: Building2,
    features: ["До 20 участников", "Все функции Startup", "Ролевой доступ (Admin, Manager, Member, Viewer)", "SSO интеграция", "Расширенные отчёты по проектам", "Приоритетная поддержка", "Slack / Teams интеграция", "Управление доступом к скилам"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Индивидуально",
    maxMembers: Infinity,
    icon: Crown,
    features: ["Безлимитные участники", "Все функции Business", "Персональный менеджер", "Кастомный SLA", "Интеграции с внутренними системами", "White-label опция", "On-premise развертывание", "Обучающие сессии", "API-доступ к скилам"],
  },
];

const roleLabels: Record<string, string> = { admin: "Администратор", manager: "Менеджер", member: "Участник", viewer: "Наблюдатель" };
const roleColors: Record<string, string> = { admin: "text-destructive", manager: "text-primary", member: "text-foreground", viewer: "text-muted-foreground" };

const contentLabels: Record<ElementType, string> = { prompt: "Промпт", skill: "Скил", file: "Файл" };
const contentIcons: Record<ElementType, JSX.Element> = { prompt: <FileText className="h-3 w-3" />, skill: <Zap className="h-3 w-3" />, file: <File className="h-3 w-3" /> };
const contentColors: Record<ElementType, string> = { prompt: "bg-blue-100 text-blue-700", skill: "bg-purple-100 text-purple-700", file: "bg-gray-100 text-gray-700" };

const mockMembers = [];
const mockInvoices = [];

// --- КОМПОНЕНТ МЕНЮ ПАПКИ (ВНУТРЕННИЙ) ---

function FolderContextMenu({ 
  folder, 
  onDelete, 
  onRename 
}: { 
  folder: Folder; 
  onDelete: (id: string) => void; 
  onRename: (id: string, name: string) => void; 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRename = () => {
    if (newName.trim()) {
      onRename(folder.id, newName.trim());
    }
    setIsRenaming(false);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (confirm(`Удалить папку "${folder.name}"? Все элементы внутри тоже будут удалены.`)) {
      onDelete(folder.id);
      setIsOpen(false);
    }
  };

  if (isRenaming) {
    return (
      <div className="absolute top-2 right-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-40">
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="w-full text-xs border rounded px-1 py-1 mb-1 focus:ring-2 focus:ring-primary/30 outline-none"
        />
        <div className="flex gap-1">
          <button onClick={handleRename} className="flex-1 text-[10px] bg-blue-600 text-white rounded px-1 py-0.5 hover:bg-blue-700">OK</button>
          <button onClick={() => setIsRenaming(false)} className="flex-1 text-[10px] bg-gray-200 rounded px-1 py-0.5 hover:bg-gray-300">X</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          setIsOpen(!isOpen); 
        }}
        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsRenaming(true); 
              setIsOpen(false); 
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit className="h-3 w-3" /> Переименовать
          </button>
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              handleDelete(); 
            }}
            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="h-3 w-3" /> Удалить
          </button>
        </div>
      )}
    </div>
  );
}

// --- ОСНОВНАЯ СТРАНИЦА ---

export default function TeamAccountsPage() {
  const [hasTeam, setHasTeam] = useState(false);
  const [showTierSelect, setShowTierSelect] = useState(false);
  const [activeTab, setActiveTab] = useState<TeamTab>("dashboard");
  
  // --- ЛОГИКА СОХРАНЕНИЯ (PERSISTENCE) ---
  const loadFromStorage = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [folders, setFolders] = useState<Folder[]>(() => 
    loadFromStorage("team_library_folders", [
      { id: "root", name: "Все", parentId: null, ownerId: "me", permissions: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), itemCount: 0, isPublic: false },
      { id: "f1", name: "Маркетинг", parentId: null, ownerId: "me", permissions: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), itemCount: 0, isPublic: false },
      { id: "f2", name: "Дизайн", parentId: null, ownerId: "me", permissions: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), itemCount: 0, isPublic: false },
      { id: "f3", name: "Разработка", parentId: null, ownerId: "me", permissions: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), itemCount: 0, isPublic: false },
    ])
  );

  const [items, setItems] = useState<TeamItem[]>(() => loadFromStorage("team_library_items", []));

  // Сохранение при любом изменении
  useEffect(() => {
    localStorage.setItem("team_library_folders", JSON.stringify(folders));
    localStorage.setItem("team_library_items", JSON.stringify(items));
  }, [folders, items]);

  // --- СОСТОЯНИЯ ИНТЕРФЕЙСА ---
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [contentFilter, setContentFilter] = useState<ContentType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Модальные окна
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TeamItem | null>(null);
  const [folderName, setFolderName] = useState("");
  
  // Данные формы элемента
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemContent, setItemContent] = useState("");
  const [itemType, setItemType] = useState<ElementType>("prompt");
  const [itemTags, setItemTags] = useState("");
  const [itemStatus, setItemStatus] = useState<"draft" | "review" | "active">("draft");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedTier] = useState("business");
  const [showSSOConfig, setShowSSOConfig] = useState(false);
  const [spendingLimits, setSpendingLimits] = useState({ manager: 50000, member: 10000 });
  const [notifyThresholds, setNotifyThresholds] = useState([50, 80, 100]);

  const tabs_content = [
    { key: "dashboard", label: "Обзор", icon: BarChart3 },
    { key: "members", label: "Участники", icon: Users },
    { key: "library", label: "Библиотека", icon: FolderOpen },
    { key: "billing", label: "Биллинг", icon: CreditCard },
    { key: "settings", label: "Настройки", icon: Settings },
  ];

  // --- ФУНКЦИИ УПРАВЛЕНИЯ ДАННЫМИ ---

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: folderName.trim(),
      parentId: currentFolderId === "root" ? null : currentFolderId,
      ownerId: "me",
      permissions: { "me": "admin" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
      isPublic: false,
    };
    setFolders(prev => [...prev, newFolder]);
    setFolderName("");
    setShowFolderModal(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    // Удаляем папку
    setFolders(prev => prev.filter(f => f.id !== folderId));
    // Удаляем все элементы внутри папки
    setItems(prev => prev.filter(i => i.folderId !== folderId));
    // Если удалили текущую папку, переходим в корень
    if (currentFolderId === folderId) setCurrentFolderId("root");
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
  };

  const openItemModal = (item?: TeamItem) => {
    if (item) {
      setEditingItem(item);
      setItemTitle(item.title);
      setItemDescription(item.description);
      setItemContent(item.content);
      setItemType(item.type);
      setItemTags(item.tags.join(", "));
      setItemStatus(item.status);
    } else {
      setEditingItem(null);
      setItemTitle("");
      setItemDescription("");
      setItemContent("");
      setItemType("prompt");
      setItemTags("");
      setItemStatus("draft");
    }
    setShowItemModal(true);
  };

  const handleSaveItem = () => {
    if (!itemTitle.trim()) return;
    
    const itemData = {
      title: itemTitle.trim(),
      description: itemDescription.trim(),
      content: itemContent,
      type: itemType,
      folderId: currentFolderId === "root" ? "f1" : currentFolderId, // Если в корне, кидаем в первую доступную папку
      category: "Общее",
      addedBy: "Вы",
      tags: itemTags.split(",").map(t => t.trim()).filter(Boolean),
      status: itemStatus,
      isActive: true,
      files: [],
    };

    if (editingItem) {
      setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...itemData, updatedAt: new Date().toISOString() } : i));
    } else {
      const newItem: TeamItem = {
        ...itemData,
        id: crypto.randomUUID(),
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: "1.0",
        usageCount: 0,
      };
      setItems(prev => [...prev, newItem]);
      // Обновляем счетчик в папке
      setFolders(prev => prev.map(f => f.id === newItem.folderId ? { ...f, itemCount: f.itemCount + 1 } : f));
    }
    
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Фильтрация элементов
  const filteredItems = items.filter(item => {
    if (currentFolderId !== "root" && item.folderId !== currentFolderId) return false;
    if (contentFilter !== "all" && item.type !== contentFilter) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !item.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const activeMembers = mockMembers.filter((m: any) => m.status === "active").length;
  const totalSpending = mockMembers.reduce((s: number, m: any) => s + m.spending, 0);
  const totalPrompts = items.filter(i => i.type === "prompt").length;
  const totalSkills = items.filter(i => i.type === "skill").length;
  const totalFiles = items.filter(i => i.type === "file").length;
  const currentFolder = folders.find(f => f.id === currentFolderId);

  // --- РЕНДЕРИНГ ---

  if (!hasTeam || showTierSelect) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1">Командные аккаунты</h1>
        <p className="text-sm text-muted-foreground mb-6">Выберите тарифный план для вашей команды</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <div key={tier.key} className={`rounded-xl border p-6 flex flex-col ${tier.key === "business" ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
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
              <button onClick={() => { setHasTeam(true); setShowTierSelect(false); }} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${tier.key === "business" ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                {tier.key === "enterprise" ? "Связаться" : "Выбрать"}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Командный аккаунт</h1>
        <span className="text-xs px-2 py-1 rounded-full gradient-primary text-primary-foreground font-medium">Business</span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Управление командой и совместная работа с промптами и скилами</p>

      {/* Навигация по вкладкам */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs_content.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as TeamTab)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key ? "gradient-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "library" && (
        <div className="space-y-4 animate-fade-in">
          {/* Хлебные крошки и заголовок */}
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
            <div className="flex items-center gap-2 flex-1">
              {currentFolderId !== "root" && (
                <button onClick={() => setCurrentFolderId("root")} className="p-2 hover:bg-muted rounded-lg transition-colors" title="В корень">
                  <Home className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Библиотека</span>
                {currentFolderId !== "root" && currentFolder && (
                  <>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      {currentFolder.name}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={() => openItemModal()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Добавить элемент
            </button>
          </div>

          {/* Поиск и фильтры */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск в библиотеке..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="flex bg-muted rounded-lg p-0.5">
              {[{ key: "all", label: "Все" }, { key: "prompt", label: "Промты", icon: <FileText className="h-3 w-3" /> }, { key: "skill", label: "Скилы", icon: <Zap className="h-3 w-3" /> }, { key: "file", label: "Файлы", icon: <File className="h-3 w-3" /> }].map((ct) => (
                <button key={ct.key} onClick={() => setContentFilter(ct.key as ContentType)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${contentFilter === ct.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {ct.icon}{ct.label}
                </button>
              ))}
            </div>
            <button onClick={() => setShowFolderModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
              <FolderPlus className="h-4 w-4" /> Папка
            </button>
          </div>

          {/* СПИСОК ПАПЕК (Только если мы в корне) */}
          {currentFolderId === "root" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {folders.filter(f => f.parentId === null && f.id !== "root").map(folder => {
                const folderItems = items.filter(i => i.folderId === folder.id);
                return (
                  <div 
                    key={folder.id} 
                    onClick={() => setCurrentFolderId(folder.id)} 
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left group cursor-pointer relative"
                  >
                    {/* Меню папки (ИСПРАВЛЕННОЕ) */}
                    <div className="absolute top-3 right-3 z-10">
                      <FolderContextMenu 
                        folder={folder} 
                        onDelete={handleDeleteFolder} 
                        onRename={handleRenameFolder} 
                      />
                    </div>

                    <div className="flex items-center justify-between mb-2 pr-6"> 
                      <Folder className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    
                    <h3 className="font-medium text-sm mb-1 truncate">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground">{folderItems.length} элементов</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* СОДЕРЖИМОЕ ПАПКИ (Список элементов) */}
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium text-foreground">
                  {currentFolderId === "root" ? "Библиотека пуста" : `Папка "${currentFolder?.name}" пуста`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Создайте первый элемент или добавьте его из Market</p>
                <button onClick={() => openItemModal()} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  + Создать элемент
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${contentColors[item.type]}`}>
                    {contentIcons[item.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description || "Нет описания"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.type === "skill" && (
                          <button onClick={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i))} className={`p-1.5 rounded-lg transition-colors ${item.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                            {item.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                        )}
                        <button onClick={() => handleCopyContent(item.content)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Копировать">
                          <CopyIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => openItemModal(item)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Редактировать">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive" title="Удалить">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${contentColors[item.type]}`}>{contentLabels[item.type]}</span>
                      {item.tags.map((tag, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">#{tag}</span>)}
                      <span className="text-[10px] text-muted-foreground">v{item.version}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-green-100 text-green-700" : item.status === "review" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                        {item.status === "active" ? "Активен" : item.status === "review" ? "На проверке" : "Черновик"}
                      </span>
                    </div>
                    {item.type === "prompt" && item.content && (
                      <div className="mt-2 p-2 bg-muted rounded-lg text-xs font-mono text-muted-foreground max-h-20 overflow-hidden">
                        {item.content.slice(0, 200)}{item.content.length > 200 ? "..." : ""}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Модальное окно создания папки */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Создать папку</h3>
              <button onClick={() => setShowFolderModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Название папки</label>
                <input type="text" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Например: Маркетинг Q3" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" autoFocus onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()} />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowFolderModal(false)} className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
                <button onClick={handleCreateFolder} disabled={!folderName.trim()} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Создать</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно создания/редактирования элемента */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Фиксированная шапка */}
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <h3 className="font-bold text-xl">{editingItem ? "Редактировать элемент" : "Добавить элемент"}</h3>
              <button onClick={() => setShowItemModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            
            {/* Скроллящийся контент */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 block">Тип элемента</label>
                <div className="flex gap-2">
                  <button onClick={() => setItemType("prompt")} className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${itemType === "prompt" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-border text-muted-foreground hover:bg-muted"}`}>
                    <FileText className="h-4 w-4 mx-auto mb-1" /> Промпт
                  </button>
                  <button onClick={() => setItemType("skill")} className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${itemType === "skill" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-border text-muted-foreground hover:bg-muted"}`}>
                    <Zap className="h-4 w-4 mx-auto mb-1" /> Скил
                  </button>
                  <button onClick={() => setItemType("file")} className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${itemType === "file" ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20" : "border-border text-muted-foreground hover:bg-muted"}`}>
                    <File className="h-4 w-4 mx-auto mb-1" /> Файл
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Название *</label>
                <input type="text" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder={itemType === "prompt" ? "Например: Промпт для генерации заголовков" : "Название"} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
              </div>

              <div>
                <label className="text-xs text-muted-foreground font-medium">Описание</label>
                <textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Опишите назначение элемента..." rows={2} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>

              {itemType === "prompt" && (
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Текст промпта *</label>
                  <textarea value={itemContent} onChange={(e) => setItemContent(e.target.value)} placeholder="Введите текст промпта..." rows={6} className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                  <p className="text-[10px] text-muted-foreground mt-1">Используйте {'{variable}'} для переменных</p>
                </div>
              )}

              {itemType === "skill" && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium">Настройки скила</h4>
                  <div>
                    <label className="text-xs text-muted-foreground">Триггеры (через запятую)</label>
                    <input type="text" placeholder="Новая заявка, Обновление статуса" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Интеграции (через запятую)</label>
                    <input type="text" placeholder="Telegram, CRM, Notion" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground font-medium">Теги (через запятую)</label>
                <input type="text" value={itemTags} onChange={(e) => setItemTags(e.target.value)} placeholder="маркетинг, заголовки, генерация" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Фиксированный подвал */}
            <div className="flex gap-2 p-6 border-t border-border flex-shrink-0">
              <button onClick={() => setShowItemModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
              <button onClick={handleSaveItem} disabled={!itemTitle.trim() || (itemType === "prompt" && !itemContent.trim())} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                {editingItem ? "Сохранить изменения" : "Создать элемент"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Участников", value: `${activeMembers}/${tiers[1].maxMembers}`, icon: Users },
              { label: "Промптов", value: totalPrompts.toString(), icon: FileText },
              { label: "Скилов", value: totalSkills.toString(), icon: Zap },
              { label: "Расход за месяц", value: `${totalSpending.toLocaleString()} ₽`, icon: DollarSign },
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
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="Поиск участников..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
              <UserPlus className="h-4 w-4" /> Пригласить
            </button>
          </div>
        </div>
      )}

      {activeTab === "billing" && <div className="text-center py-12 text-muted-foreground">Раздел в разработке</div>}
      {activeTab === "settings" && <div className="text-center py-12 text-muted-foreground">Раздел в разработке</div>}

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-lg">Пригласить участника</h3><button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <div><label className="text-xs text-muted-foreground">Email</label><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.ru" className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" /></div>
              <div><label className="text-xs text-muted-foreground">Роль</label><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"><option value="manager">Менеджер</option><option value="member">Участник</option><option value="viewer">Наблюдатель</option></select></div>
              <button onClick={() => { setShowInviteModal(false); setInviteEmail(""); }} className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Отправить приглашение</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}