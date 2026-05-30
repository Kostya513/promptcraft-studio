import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, Crown, Building2, Rocket, Plus, Mail, Trash2, Shield,
  CreditCard, BarChart3, FolderOpen, Search, Settings, Link2,
  Check, X, ChevronRight, UserPlus, Download, Bell, Eye,
  Edit, MessageSquare, Clock, DollarSign, Lock, RefreshCw, Zap, FileText,
  ToggleRight, ToggleLeft, FolderPlus, Folder, Pencil, MoreHorizontal, Copy,
  Upload, File, Code, Terminal, Copy as CopyIcon, Move, Save, EyeOff,
  ChevronLeft, Home, Share2, History, GitBranch, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";

// ─── TYPES (inline for self-containment) ───
type TeamTab = "dashboard" | "members" | "library" | "billing" | "settings";
type ContentType = "all" | "prompt" | "skill" | "file";
type ElementType = "prompt" | "skill" | "file";
type Permission = "admin" | "editor" | "viewer";
type MemberRole = "admin" | "manager" | "member" | "viewer";
type MemberStatus = "active" | "invited" | "pending";
type AssetStatus = "draft" | "review" | "active";

interface Team {
  id: string;
  name: string;
  slug: string;
  tier: "startup" | "business" | "enterprise";
  createdAt: string;
  updatedAt: string;
  limits: {
    members: { used: number; max: number };
    assets: { used: number; max: number };
    tokens: { used: number; max: number };
    storage: { used: number; max: number };
  };
  subscription: { status: "active" | "past_due" | "canceled"; nextBillingDate: string };
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  spending: number;
}

interface TeamFolder {
  id: string;
  name: string;
  parentId: string | null;
  itemCount: number;
  createdAt: string;
}

interface TeamAsset {
  id: string;
  folderId: string;
  type: ElementType;
  title: string;
  description: string;
  tags: string[];
  status: AssetStatus;
  updatedAt: string;
  version: string;
  content?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  items: number;
  receiptUrl?: string;
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

// ─── API CLIENT (graceful fallback to localStorage) ───
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: HeadersInit = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (error) {
    console.warn(`[API Fallback] ${endpoint}:`, error);
    throw error;
  }
}

// Team API with localStorage fallback
const TeamAPI = {
  async getTeam(): Promise<Team | null> {
    try {
      const res = await apiRequest<{ team: Team }>("/team");
      return res.team;
    } catch {
      const cached = localStorage.getItem("team_current");
      return cached ? JSON.parse(cached) : null;
    }
  },

  async getMembers(): Promise<TeamMember[]> {
    try {
      const res = await apiRequest<{ members: TeamMember[] }>("/team/members");
      return res.members;
    } catch {
      const cached = localStorage.getItem("team_members");
      return cached ? JSON.parse(cached) : [];
    }
  },

  async inviteMember(email: string, role: MemberRole): Promise<TeamMember> {
    try {
      const res = await apiRequest<{ member: TeamMember }>("/team/members/invite", {
        method: "POST",
        body: JSON.stringify({ email, role }),
      });
      return res.member;
    } catch {
      // Fallback: create mock member
      const newMember: TeamMember = {
        id: crypto.randomUUID(),
        email,
        name: email.split("@")[0],
        role,
        status: "invited",
        joinedAt: new Date().toISOString(),
        spending: 0,
      };
      const members = JSON.parse(localStorage.getItem("team_members") || "[]");
      members.push(newMember);
      localStorage.setItem("team_members", JSON.stringify(members));
      return newMember;
    }
  },

  async updateMemberRole(memberId: string, role: MemberRole): Promise<TeamMember> {
    try {
      const res = await apiRequest<{ member: TeamMember }>(`/team/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      return res.member;
    } catch {
      const members = JSON.parse(localStorage.getItem("team_members") || "[]");
      const idx = members.findIndex((m: TeamMember) => m.id === memberId);
      if (idx !== -1) {
        members[idx].role = role;
        localStorage.setItem("team_members", JSON.stringify(members));
        return members[idx];
      }
      throw new Error("Member not found");
    }
  },

  async removeMember(memberId: string): Promise<void> {
    try {
      await apiRequest(`/team/members/${memberId}`, { method: "DELETE" });
    } catch {
      const members = JSON.parse(localStorage.getItem("team_members") || "[]").filter(
        (m: TeamMember) => m.id !== memberId
      );
      localStorage.setItem("team_members", JSON.stringify(members));
    }
  },

  async getFolders(): Promise<TeamFolder[]> {
    try {
      const res = await apiRequest<{ folders: TeamFolder[] }>("/team/library/folders");
      return res.folders;
    } catch {
      const cached = localStorage.getItem("team_folders");
      return cached ? JSON.parse(cached) : [
        { id: "root", name: "Все", parentId: null, itemCount: 0, createdAt: new Date().toISOString() },
        { id: "f1", name: "Маркетинг", parentId: null, itemCount: 0, createdAt: new Date().toISOString() },
        { id: "f2", name: "Дизайн", parentId: null, itemCount: 0, createdAt: new Date().toISOString() },
      ];
    }
  },

  async createFolder(name: string, parentId?: string): Promise<TeamFolder> {
    try {
      const res = await apiRequest<{ folder: TeamFolder }>("/team/library/folders", {
        method: "POST",
        body: JSON.stringify({ name, parentId: parentId === "root" ? null : parentId }),
      });
      return res.folder;
    } catch {
      const newFolder: TeamFolder = {
        id: crypto.randomUUID(),
        name,
        parentId: parentId === "root" ? null : parentId || null,
        itemCount: 0,
        createdAt: new Date().toISOString(),
      };
      const folders = JSON.parse(localStorage.getItem("team_folders") || "[]");
      folders.push(newFolder);
      localStorage.setItem("team_folders", JSON.stringify(folders));
      return newFolder;
    }
  },

  async renameFolder(folderId: string, name: string): Promise<TeamFolder> {
    try {
      const res = await apiRequest<{ folder: TeamFolder }>(`/team/library/folders/${folderId}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      return res.folder;
    } catch {
      const folders = JSON.parse(localStorage.getItem("team_folders") || "[]");
      const idx = folders.findIndex((f: TeamFolder) => f.id === folderId);
      if (idx !== -1) {
        folders[idx].name = name;
        localStorage.setItem("team_folders", JSON.stringify(folders));
        return folders[idx];
      }
      throw new Error("Folder not found");
    }
  },

  async deleteFolder(folderId: string): Promise<void> {
    try {
      await apiRequest(`/team/library/folders/${folderId}`, { method: "DELETE" });
    } catch {
      let folders = JSON.parse(localStorage.getItem("team_folders") || "[]").filter(
        (f: TeamFolder) => f.id !== folderId
      );
      let assets = JSON.parse(localStorage.getItem("team_assets") || "[]").filter(
        (a: TeamAsset) => a.folderId !== folderId
      );
      localStorage.setItem("team_folders", JSON.stringify(folders));
      localStorage.setItem("team_assets", JSON.stringify(assets));
    }
  },

  async getAssets(folderId?: string, type?: string, search?: string): Promise<TeamAsset[]> {
    try {
      const params = new URLSearchParams();
      if (folderId && folderId !== "root") params.append("folderId", folderId);
      if (type && type !== "all") params.append("type", type);
      if (search) params.append("search", search);
      const res = await apiRequest<{ assets: TeamAsset[] }>(`/team/library/assets?${params}`);
      return res.assets;
    } catch {
      let assets = JSON.parse(localStorage.getItem("team_assets") || "[]");
      if (folderId && folderId !== "root") assets = assets.filter((a: TeamAsset) => a.folderId === folderId);
      if (type && type !== "all") assets = assets.filter((a: TeamAsset) => a.type === type);
      if (search) {
        const q = search.toLowerCase();
        assets = assets.filter((a: TeamAsset) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some(t => t.toLowerCase().includes(q))
        );
      }
      return assets;
    }
  },

  async createAsset(data: Omit<TeamAsset, "id" | "updatedAt" | "version">): Promise<TeamAsset> {
    try {
      const res = await apiRequest<{ asset: TeamAsset }>("/team/library/assets", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.asset;
    } catch {
      const newAsset: TeamAsset = {
        ...data,
        id: crypto.randomUUID(),
        version: "1.0",
        updatedAt: new Date().toISOString(),
      };
      const assets = JSON.parse(localStorage.getItem("team_assets") || "[]");
      assets.push(newAsset);
      localStorage.setItem("team_assets", JSON.stringify(assets));
      // Update folder count
      const folders = JSON.parse(localStorage.getItem("team_folders") || "[]");
      const fIdx = folders.findIndex((f: TeamFolder) => f.id === newAsset.folderId);
      if (fIdx !== -1) {
        folders[fIdx].itemCount = (folders[fIdx].itemCount || 0) + 1;
        localStorage.setItem("team_folders", JSON.stringify(folders));
      }
      return newAsset;
    }
  },

  async updateAsset(assetId: string, data: Partial<TeamAsset>): Promise<TeamAsset> {
    try {
      const res = await apiRequest<{ asset: TeamAsset }>(`/team/library/assets/${assetId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return res.asset;
    } catch {
      const assets = JSON.parse(localStorage.getItem("team_assets") || "[]");
      const idx = assets.findIndex((a: TeamAsset) => a.id === assetId);
      if (idx !== -1) {
        assets[idx] = { ...assets[idx], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem("team_assets", JSON.stringify(assets));
        return assets[idx];
      }
      throw new Error("Asset not found");
    }
  },

  async deleteAsset(assetId: string): Promise<void> {
    try {
      await apiRequest(`/team/library/assets/${assetId}`, { method: "DELETE" });
    } catch {
      let assets = JSON.parse(localStorage.getItem("team_assets") || "[]").filter(
        (a: TeamAsset) => a.id !== assetId
      );
      localStorage.setItem("team_assets", JSON.stringify(assets));
    }
  },

  async exportLibrary(): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}/team/library/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      });
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    } catch {
      // Fallback: generate JSON locally
      const data = {
        folders: JSON.parse(localStorage.getItem("team_folders") || "[]"),
        assets: JSON.parse(localStorage.getItem("team_assets") || "[]"),
        exportedAt: new Date().toISOString(),
      };
      return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    }
  },

  async getInvoices(): Promise<Invoice[]> {
    try {
      const res = await apiRequest<{ invoices: Invoice[] }>("/team/billing/invoices");
      return res.invoices;
    } catch {
      return [];
    }
  },

  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const res = await apiRequest<{ keys: ApiKey[] }>("/team/settings/api-keys");
      return res.keys;
    } catch {
      return [];
    }
  },

  async createApiKey(name: string): Promise<{ key: string; apiKey: ApiKey }> {
    try {
      return await apiRequest<{ key: string; apiKey: ApiKey }>("/team/settings/api-keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    } catch {
      const newKey: ApiKey = {
        id: crypto.randomUUID(),
        name,
        keyPrefix: "pk_live_" + Math.random().toString(36).slice(2, 10),
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      return { key: "pk_live_" + Math.random().toString(36).slice(2, 30), apiKey: newKey };
    }
  },

  async revokeApiKey(keyId: string): Promise<void> {
    try {
      await apiRequest(`/team/settings/api-keys/${keyId}`, { method: "DELETE" });
    } catch {
      const keys = JSON.parse(localStorage.getItem("team_api_keys") || "[]").filter(
        (k: ApiKey) => k.id !== keyId
      );
      localStorage.setItem("team_api_keys", JSON.stringify(keys));
    }
  },

  async updateWebhook(url: string): Promise<{ webhookUrl: string }> {
    try {
      return await apiRequest<{ webhookUrl: string }>("/team/settings/webhook", {
        method: "PUT",
        body: JSON.stringify({ url }),
      });
    } catch {
      return { webhookUrl: url };
    }
  },
  async updateTeam(data: Partial<Team>): Promise<Team> {
    try {
      const res = await apiRequest<{ team: Team }>(`/team`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return res.team;
    } catch {
      const cached = localStorage.getItem("team_current");
      if (cached) {
        const t: Team = JSON.parse(cached);
        const updated: Team = { ...t, ...data, updatedAt: new Date().toISOString() } as Team;
        localStorage.setItem("team_current", JSON.stringify(updated));
        return updated;
      }
      throw new Error("Team update failed");
    }
  },
};

// ─── CONSTANTS ───
const tiers = [
  {
    key: "startup",
    name: "Startup",
    price: "2 999 ₽/мес",
    maxMembers: 5,
    icon: Rocket,
    features: ["До 5 участников", "Общая библиотека промптов и скилов", "Единый биллинг", "Базовые отчёты", "Стандартная поддержка"],
  },
  {
    key: "business",
    name: "Business",
    price: "9 999 ₽/мес",
    maxMembers: 20,
    icon: Building2,
    features: ["До 20 участников", "Все функции Startup", "Ролевой доступ", "SSO интеграция", "Расширенные отчёты", "Приоритетная поддержка"],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Индивидуально",
    maxMembers: Infinity,
    icon: Crown,
    features: ["Безлимитные участники", "Все функции Business", "Персональный менеджер", "Кастомный SLA", "On-premise развертывание"],
  },
];

const roleLabels: Record<MemberRole, string> = {
  admin: "Администратор",
  manager: "Менеджер",
  member: "Участник",
  viewer: "Наблюдатель",
};

const roleColors: Record<MemberRole, string> = {
  admin: "text-destructive",
  manager: "text-primary",
  member: "text-foreground",
  viewer: "text-muted-foreground",
};

const contentLabels: Record<ElementType, string> = { prompt: "Промпт", skill: "Скил", file: "Файл" };
const contentIcons: Record<ElementType, JSX.Element> = {
  prompt: <FileText className="h-3 w-3" />,
  skill: <Zap className="h-3 w-3" />,
  file: <File className="h-3 w-3" />,
};
const contentColors: Record<ElementType, string> = {
  prompt: "bg-blue-100 text-blue-700",
  skill: "bg-purple-100 text-purple-700",
  file: "bg-gray-100 text-gray-700",
};

const tabs_content = [
  { key: "dashboard", label: "Обзор", icon: BarChart3 },
  { key: "members", label: "Участники", icon: Users },
  { key: "library", label: "Библиотека", icon: FolderOpen },
  { key: "billing", label: "Биллинг", icon: CreditCard },
  { key: "settings", label: "Настройки", icon: Settings },
];

// ─── HELPER COMPONENTS ───

function FolderContextMenu({
  folder,
  onDelete,
  onRename,
}: {
  folder: TeamFolder;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const menuRef = useRef<HTMLDivElement>(null);

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
    if (window.confirm(`Удалить папку "${folder.name}"? Все элементы внутри тоже будут удалены.`)) {
      onDelete(folder.id);
      setIsOpen(false);
    }
  };

  if (isRenaming) {
    return (
      <div className="absolute top-2 right-2 z-50 bg-card border border-border rounded-lg shadow-lg p-2 w-40">
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
          className="w-full text-xs border rounded px-1 py-1 mb-1 bg-background"
        />
        <div className="flex gap-1">
          <button onClick={handleRename} className="flex-1 text-[10px] bg-primary text-primary-foreground rounded px-1 py-0.5">OK</button>
          <button onClick={() => setIsRenaming(false)} className="flex-1 text-[10px] bg-muted rounded px-1 py-0.5">X</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={(e) => { e.stopPropagation(); setIsRenaming(true); setIsOpen(false); }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2"
          >
            <Edit className="h-3 w-3" /> Переименовать
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className="w-full text-left px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 flex items-center gap-2"
          >
            <Trash2 className="h-3 w-3" /> Удалить
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "destructive",
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className={`h-5 w-5 mt-0.5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-primary-foreground transition-colors ${
              variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : "gradient-primary"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───

export default function TeamAccountsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ─── STATE ───
  const [activeTab, setActiveTab] = useState<TeamTab>("dashboard");
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [folders, setFolders] = useState<TeamFolder[]>([]);
  const [assets, setAssets] = useState<TeamAsset[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});
  
  // Library state
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [contentFilter, setContentFilter] = useState<ContentType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{ open: boolean; action: (() => void) | null; title: string; desc: string; variant?: "destructive" | "default" }>({
    open: false, action: null, title: "", desc: "",
  });
  
  // Form states
  const [folderName, setFolderName] = useState("");
  const [editingAsset, setEditingAsset] = useState<TeamAsset | null>(null);
  const [assetTitle, setAssetTitle] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetContent, setAssetContent] = useState("");
  const [assetType, setAssetType] = useState<ElementType>("prompt");
  const [assetTags, setAssetTags] = useState("");
  const [assetStatus, setAssetStatus] = useState<AssetStatus>("draft");
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("member");
  const [memberSearch, setMemberSearch] = useState("");
  
  const [newApiKey, setNewApiKey] = useState<{ key: string; apiKey: ApiKey } | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [teamSlug, setTeamSlug] = useState("");
  const [teamName, setTeamName] = useState("");
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedTierKey, setSelectedTierKey] = useState<Team["tier"] | null>(null);

  // ─── URL SYNC ───
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") as TeamTab;
    if (tab && tabs_content.some(t => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const updateTabInUrl = useCallback((tab: TeamTab) => {
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    navigate({ search: params.toString() }, { replace: true });
  }, [location.search, navigate]);

  const handleTabChange = (tab: TeamTab) => {
    setActiveTab(tab);
    updateTabInUrl(tab);
  };

  // ─── DATA LOADING ───
  const loadData = useCallback(async () => {
    setLoading(prev => ({ ...prev, team: true, members: true, folders: true, assets: true }));
    setError({});

    try {
      const [t, m, f, a, inv, keys] = await Promise.allSettled([
        TeamAPI.getTeam(),
        TeamAPI.getMembers(),
        TeamAPI.getFolders(),
        TeamAPI.getAssets(),
        TeamAPI.getInvoices(),
        TeamAPI.getApiKeys(),
      ]);

      if (t.status === "fulfilled" && t.value) setTeam(t.value);
      if (m.status === "fulfilled") setMembers(m.value);
      if (f.status === "fulfilled") setFolders(f.value);
      if (a.status === "fulfilled") setAssets(a.value);
      if (inv.status === "fulfilled") setInvoices(inv.value);
      if (keys.status === "fulfilled") setApiKeys(keys.value);
    } catch (err) {
      console.error("Failed to load team data:", err);
    } finally {
      setLoading(prev => ({ ...prev, team: false, members: false, folders: false, assets: false }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── ACTIONS ───

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      const newFolder = await TeamAPI.createFolder(folderName.trim(), currentFolderId === "root" ? undefined : currentFolderId);
      setFolders(prev => [...prev, newFolder]);
      setFolderName("");
      setShowFolderModal(false);
      toast.success("Папка создана");
    } catch (err) {
      toast.error("Не удалось создать папку");
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setShowConfirmModal({
      open: true,
      title: "Удалить папку?",
      desc: "Все элементы внутри папки будут безвозвратно удалены.",
      variant: "destructive",
      action: async () => {
        try {
          await TeamAPI.deleteFolder(folderId);
          setFolders(prev => prev.filter(f => f.id !== folderId));
          setAssets(prev => prev.filter(a => a.folderId !== folderId));
          if (currentFolderId === folderId) setCurrentFolderId("root");
          toast.success("Папка удалена");
        } catch {
          toast.error("Ошибка при удалении");
        }
      },
    });
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await TeamAPI.renameFolder(folderId, newName);
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
      toast.success("Папка переименована");
    } catch {
      toast.error("Не удалось переименовать");
    }
  };

  const openAssetModal = (asset?: TeamAsset) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetTitle(asset.title);
      setAssetDescription(asset.description);
      setAssetContent(asset.content || "");
      setAssetType(asset.type);
      setAssetTags(asset.tags.join(", "));
      setAssetStatus(asset.status);
    } else {
      setEditingAsset(null);
      setAssetTitle("");
      setAssetDescription("");
      setAssetContent("");
      setAssetType("prompt");
      setAssetTags("");
      setAssetStatus("draft");
    }
    setShowItemModal(true);
  };

  const handleSaveAsset = async () => {
    if (!assetTitle.trim()) return;
    const assetData = {
      title: assetTitle.trim(),
      description: assetDescription.trim(),
      content: assetContent,
      type: assetType,
      folderId: currentFolderId === "root" ? (folders[1]?.id || "f1") : currentFolderId,
      tags: assetTags.split(",").map(t => t.trim()).filter(Boolean),
      status: assetStatus,
    };

    try {
      if (editingAsset) {
        await TeamAPI.updateAsset(editingAsset.id, assetData);
        setAssets(prev => prev.map(a => a.id === editingAsset.id ? { ...a, ...assetData, updatedAt: new Date().toISOString() } : a));
        toast.success("Элемент обновлён");
      } else {
        const newAsset = await TeamAPI.createAsset({ ...assetData, updatedAt: new Date().toISOString() } as any);
        setAssets(prev => [...prev, newAsset]);
        setFolders(prev => prev.map(f => f.id === newAsset.folderId ? { ...f, itemCount: (f.itemCount || 0) + 1 } : f));
        toast.success("Элемент создан");
      }
      setShowItemModal(false);
      setEditingAsset(null);
    } catch {
      toast.error("Ошибка при сохранении");
    }
  };

  const handleDeleteAsset = (assetId: string) => {
    setShowConfirmModal({
      open: true,
      title: "Удалить элемент?",
      desc: "Этот элемент будет безвозвратно удалён из библиотеки.",
      variant: "destructive",
      action: async () => {
        try {
          await TeamAPI.deleteAsset(assetId);
          setAssets(prev => prev.filter(a => a.id !== assetId));
          toast.success("Элемент удалён");
        } catch {
          toast.error("Ошибка при удалении");
        }
      },
    });
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await TeamAPI.inviteMember(inviteEmail.trim(), inviteRole);
      setInviteEmail("");
      setShowInviteModal(false);
      setMembers(await TeamAPI.getMembers());
      toast.success("Приглашение отправлено");
    } catch {
      toast.error("Не удалось отправить приглашение");
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: MemberRole) => {
    try {
      await TeamAPI.updateMemberRole(memberId, role);
      setMembers(await TeamAPI.getMembers());
      toast.success("Роль обновлена");
    } catch {
      toast.error("Ошибка при обновлении роли");
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setShowConfirmModal({
      open: true,
      title: "Удалить участника?",
      desc: "Пользователь потеряет доступ к команде.",
      variant: "destructive",
      action: async () => {
        try {
          await TeamAPI.removeMember(memberId);
          setMembers(await TeamAPI.getMembers());
          toast.success("Участник удалён");
        } catch {
          toast.error("Ошибка при удалении");
        }
      },
    });
  };

  const handleExportLibrary = async () => {
    try {
      const blob = await TeamAPI.exportLibrary();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `team-library-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Библиотека экспортирована");
    } catch {
      toast.error("Ошибка при экспорте");
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const result = await TeamAPI.createApiKey("Новый ключ");
      setNewApiKey(result);
      setShowApiKeyModal(true);
      setApiKeys(await TeamAPI.getApiKeys());
      toast.success("API-ключ создан");
    } catch {
      toast.error("Не удалось создать ключ");
    }
  };

  const handleRevokeApiKey = (keyId: string) => {
    setShowConfirmModal({
      open: true,
      title: "Отозвать ключ?",
      desc: "Все приложения, использующие этот ключ, потеряют доступ.",
      variant: "destructive",
      action: async () => {
        try {
          await TeamAPI.revokeApiKey(keyId);
          setApiKeys(await TeamAPI.getApiKeys());
          toast.success("Ключ отозван");
        } catch {
          toast.error("Ошибка при отзыве ключа");
        }
      },
    });
  };

  const handleUpdateWebhook = async () => {
    try {
      await TeamAPI.updateWebhook(webhookUrl);
      toast.success("Webhook обновлён");
    } catch {
      toast.error("Ошибка при обновлении webhook");
    }
  };

  const handleOpenChangePlan = () => {
    setSelectedTierKey(team?.tier || null);
    setShowChangePlanModal(true);
  };

  const handleConfirmChangePlan = async () => {
    if (!selectedTierKey) return;
    try {
      const updated = await TeamAPI.updateTeam({ tier: selectedTierKey as Team["tier"] });
      // update local state
      setTeam(prev => prev ? { ...prev, tier: updated.tier, updatedAt: updated.updatedAt } : prev);
      localStorage.setItem("team_current", JSON.stringify({ ...(team || {}), tier: selectedTierKey, updatedAt: new Date().toISOString() }));
      toast.success("Тариф успешно изменён");
      setShowChangePlanModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось сменить тариф");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Скопировано в буфер обмена");
  };

  // Filtered assets
  const filteredAssets = assets.filter(asset => {
    if (currentFolderId !== "root" && asset.folderId !== currentFolderId) return false;
    if (contentFilter !== "all" && asset.type !== contentFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        asset.title.toLowerCase().includes(q) ||
        asset.description.toLowerCase().includes(q) ||
        asset.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const currentFolder = folders.find(f => f.id === currentFolderId);

  // ─── RENDER ───

  if (loading.team && !team) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) {
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
              <button
                onClick={() => {
                  const mockTeam: Team = {
                    id: crypto.randomUUID(),
                    name: "Моя команда",
                    slug: "my-team",
                    tier: tier.key as any,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    limits: {
                      members: { used: 1, max: tier.maxMembers },
                      assets: { used: 0, max: 1000 },
                      tokens: { used: 0, max: 100000 },
                      storage: { used: 0, max: 10737418240 },
                    },
                    subscription: { status: "active", nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
                  };
                  localStorage.setItem("team_current", JSON.stringify(mockTeam));
                  setTeam(mockTeam);
                  toast.success(`Тариф "${tier.name}" активирован`);
                }}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tier.key === "business" ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Командный аккаунт</h1>
        <span className="text-xs px-2 py-1 rounded-full gradient-primary text-primary-foreground font-medium capitalize">
          {team.tier}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Управление командой и совместная работа с промптами и скилами</p>

      {/* Tabs Navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs_content.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key as TeamTab)}
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

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Участников", value: `${team.limits.members.used}/${team.limits.members.max}`, icon: Users },
              { label: "Промптов", value: assets.filter(a => a.type === "prompt").length.toString(), icon: FileText },
              { label: "Скилов", value: assets.filter(a => a.type === "skill").length.toString(), icon: Zap },
              { label: "Хранилище", value: `${Math.round(team.limits.storage.used / 1024 / 1024)} МБ`, icon: FolderOpen },
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

          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">Статус подписки</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Следующее списание:</span>{" "}
                  {new Date(team.subscription.nextBillingDate).toLocaleDateString("ru-RU")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Статус:{" "}
                  <span className={`font-medium ${
                    team.subscription.status === "active" ? "text-green-600" :
                    team.subscription.status === "past_due" ? "text-yellow-600" : "text-destructive"
                  }`}>
                    {team.subscription.status === "active" ? "Активна" :
                     team.subscription.status === "past_due" ? "Просрочена" : "Отменена"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleTabChange("billing")}
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Управление
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
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
              <UserPlus className="h-4 w-4" /> Пригласить
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Участник</th>
                  <th className="text-left p-4 font-medium">Роль</th>
                  <th className="text-left p-4 font-medium">Статус</th>
                  <th className="text-left p-4 font-medium">Присоединился</th>
                  <th className="text-right p-4 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {members
                  .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.email.toLowerCase().includes(memberSearch.toLowerCase()))
                  .map((member) => (
                    <tr key={member.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as MemberRole)}
                          disabled={member.role === "admin"}
                          className={`text-xs px-2 py-1 rounded border ${
                            member.role === "admin" ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-background"
                          } ${roleColors[member.role]}`}
                        >
                          {Object.entries(roleLabels).map(([role, label]) => (
                            <option key={role} value={role}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.status === "active" ? "bg-green-100 text-green-700" :
                          member.status === "invited" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {member.status === "active" ? "Активен" :
                           member.status === "invited" ? "Приглашён" : "Ожидает"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(member.joinedAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="p-4 text-right">
                        {member.role !== "admin" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Нет участников. Пригласите первого!
              </div>
            )}
          </div>
        </div>
      )}

      {/* LIBRARY TAB */}
      {activeTab === "library" && (
        <div className="space-y-4 animate-fade-in">
          {/* Header */}
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
            <div className="flex gap-2">
              <button
                onClick={handleExportLibrary}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Экспорт JSON
              </button>
              <button
                onClick={() => openAssetModal()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Добавить элемент
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск в библиотеке..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex bg-muted rounded-lg p-0.5">
              {[
                { key: "all", label: "Все" },
                { key: "prompt", label: "Промты", icon: <FileText className="h-3 w-3" /> },
                { key: "skill", label: "Скилы", icon: <Zap className="h-3 w-3" /> },
                { key: "file", label: "Файлы", icon: <File className="h-3 w-3" /> },
              ].map((ct) => (
                <button
                  key={ct.key}
                  onClick={() => setContentFilter(ct.key as ContentType)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    contentFilter === ct.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ct.icon}{ct.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFolderModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <FolderPlus className="h-4 w-4" /> Папка
            </button>
          </div>

          {/* Folders Grid (only in root) */}
          {currentFolderId === "root" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {folders
                .filter(f => f.parentId === null && f.id !== "root")
                .map(folder => {
                  const folderAssets = assets.filter(a => a.folderId === folder.id);
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-md transition-all text-left group cursor-pointer relative"
                    >
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
                      <p className="text-xs text-muted-foreground">{folderAssets.length} элементов</p>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Assets List */}
          <div className="space-y-2">
            {filteredAssets.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium text-foreground">
                  {currentFolderId === "root" ? "Библиотека пуста" : `Папка "${currentFolder?.name}" пуста`}
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Создайте первый элемент или добавьте его из Market</p>
                <button
                  onClick={() => openAssetModal()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  + Создать элемент
                </button>
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <div key={asset.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${contentColors[asset.type]}`}>
                    {contentIcons[asset.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-medium text-sm mb-1">{asset.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{asset.description || "Нет описания"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {asset.type === "skill" && (
                          <button
                            onClick={async () => {
                              try {
                                await TeamAPI.updateAsset(asset.id, { status: asset.status === "active" ? "draft" : "active" });
                                setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, status: a.status === "active" ? "draft" : "active" } : a));
                              } catch {
                                toast.error("Ошибка при обновлении статуса");
                              }
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              asset.status === "active" ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"
                            }`}
                          >
                            {asset.status === "active" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => asset.content && handleCopy(asset.content!)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                          title="Копировать"
                        >
                          <CopyIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openAssetModal(asset)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                          title="Редактировать"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${contentColors[asset.type]}`}>
                        {contentLabels[asset.type]}
                      </span>
                      {asset.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">#{tag}</span>
                      ))}
                      <span className="text-[10px] text-muted-foreground">v{asset.version}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        asset.status === "active" ? "bg-green-100 text-green-700" :
                        asset.status === "review" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {asset.status === "active" ? "Активен" : asset.status === "review" ? "На проверке" : "Черновик"}
                      </span>
                    </div>
                    {asset.type === "prompt" && asset.content && (
                      <div className="mt-2 p-2 bg-muted rounded-lg text-xs font-mono text-muted-foreground max-h-20 overflow-hidden">
                        {asset.content.slice(0, 200)}{asset.content.length > 200 ? "..." : ""}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BILLING TAB */}
      {activeTab === "billing" && (
        <div className="space-y-6 animate-fade-in">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">Текущий тариф</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium">{tiers.find(t => t.key === team.tier)?.name}</p>
                <p className="text-sm text-muted-foreground">{tiers.find(t => t.key === team.tier)?.price}</p>
              </div>
              <button onClick={handleOpenChangePlan} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                Сменить тариф
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold">История платежей</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Дата</th>
                  <th className="text-left p-4 font-medium">Сумма</th>
                  <th className="text-left p-4 font-medium">Статус</th>
                  <th className="text-right p-4 font-medium">Чек</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="p-4">{new Date(inv.date).toLocaleDateString("ru-RU")}</td>
                    <td className="p-4 font-medium">{inv.amount.toLocaleString("ru-RU")} ₽</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        inv.status === "paid" ? "bg-green-100 text-green-700" :
                        inv.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {inv.status === "paid" ? "Оплачен" : inv.status === "pending" ? "В обработке" : "Ошибка"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {inv.receiptUrl ? (
                        <a href={inv.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                          Скачать
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                      Нет платежей
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="space-y-6 animate-fade-in">
          {/* Profile */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">Профиль команды</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Название команды</label>
                <input
                  type="text"
                  value={teamName || team.name}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">URL-слаг</label>
                <input
                  type="text"
                  value={teamSlug || team.slug}
                  onChange={(e) => setTeamSlug(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono"
                />
              </div>
              <button
                onClick={async () => {
                  try {
                    await TeamAPI.updateTeam({ name: teamName || team.name, slug: teamSlug || team.slug });
                    setTeam(prev => prev ? { ...prev, name: teamName || prev.name, slug: teamSlug || prev.slug } : prev);
                    toast.success("Профиль обновлён");
                  } catch {
                    toast.error("Ошибка при обновлении");
                  }
                }}
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
              >
                Сохранить изменения
              </button>
            </div>
          </div>

          {/* API Keys */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">API-ключи</h3>
              <button
                onClick={handleCreateApiKey}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80"
              >
                <Plus className="h-3.5 w-3.5" /> Создать ключ
              </button>
            </div>
            {apiKeys.length > 0 ? (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{key.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}••••••••</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Создан: {new Date(key.createdAt).toLocaleDateString("ru-RU")}
                        {key.lastUsed && ` • Использован: ${new Date(key.lastUsed).toLocaleDateString("ru-RU")}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(key.keyPrefix + "••••••••")}
                        className="p-1.5 rounded-lg hover:bg-background transition-colors"
                        title="Копировать"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRevokeApiKey(key.id)}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Отозвать"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Нет активных ключей</p>
            )}
          </div>

          {/* Webhooks */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-bold mb-4">Webhook</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">URL для уведомлений</label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm font-mono"
                />
              </div>
              <button
                onClick={handleUpdateWebhook}
                className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
              >
                Сохранить webhook
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6">
            <h3 className="font-bold text-destructive mb-2">Опасная зона</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Эти действия необратимы. Пожалуйста, будьте осторожны.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal({
                  open: true,
                  title: "Передать владение?",
                  desc: "Вы потеряете права администратора. Убедитесь, что новый владелец готов.",
                  variant: "destructive",
                  action: () => toast.info("Функция передачи владения будет доступна в следующей версии"),
                })}
                className="px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                Передать владение
              </button>
              <button
                onClick={() => setShowConfirmModal({
                  open: true,
                  title: "Удалить команду?",
                  desc: "Все данные, участники и активы будут безвозвратно удалены. Это действие нельзя отменить.",
                  variant: "destructive",
                  action: () => {
                    localStorage.removeItem("team_current");
                    localStorage.removeItem("team_members");
                    localStorage.removeItem("team_folders");
                    localStorage.removeItem("team_assets");
                    window.location.href = "/team";
                  },
                })}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
              >
                Удалить команду
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      
      {/* Create Folder Modal */}
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
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Например: Маркетинг Q3"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!folderName.trim()}
                  className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Asset Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <h3 className="font-bold text-xl">{editingAsset ? "Редактировать элемент" : "Добавить элемент"}</h3>
              <button onClick={() => setShowItemModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-2 block">Тип элемента</label>
                <div className="flex gap-2">
                  {(["prompt", "skill", "file"] as ElementType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAssetType(type)}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium border transition-all ${
                        assetType === type
                          ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {contentIcons[type]}
                      <span className="block mt-1">{contentLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Название *</label>
                <input
                  type="text"
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  placeholder={assetType === "prompt" ? "Например: Промпт для генерации заголовков" : "Название"}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Описание</label>
                <textarea
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  placeholder="Опишите назначение элемента..."
                  rows={2}
                  className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>
              {assetType === "prompt" && (
                <div>
                  <label className="text-xs text-muted-foreground font-medium">Текст промпта *</label>
                  <textarea
                    value={assetContent}
                    onChange={(e) => setAssetContent(e.target.value)}
                    placeholder="Введите текст промпта..."
                    rows={6}
                    className="w-full mt-1 px-3 py-2.5 rounded-lg bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Используйте {"{variable}"} для переменных</p>
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground font-medium">Теги (через запятую)</label>
                <input
                  type="text"
                  value={assetTags}
                  onChange={(e) => setAssetTags(e.target.value)}
                  placeholder="маркетинг, заголовки, генерация"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="flex gap-2 p-6 border-t border-border flex-shrink-0">
              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveAsset}
                disabled={!assetTitle.trim() || (assetType === "prompt" && !assetContent.trim())}
                className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingAsset ? "Сохранить изменения" : "Создать элемент"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Пригласить участника</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
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
                  onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-background border border-border text-sm"
                >
                  <option value="manager">Менеджер</option>
                  <option value="member">Участник</option>
                  <option value="viewer">Наблюдатель</option>
                </select>
              </div>
              <button
                onClick={handleInviteMember}
                disabled={!inviteEmail.trim()}
                className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                Отправить приглашение
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key Created Modal */}
      {showApiKeyModal && newApiKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">API-ключ создан</h3>
              <button onClick={() => { setShowApiKeyModal(false); setNewApiKey(null); }} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Скопируйте ключ сейчас. Он не будет показан снова.
              </p>
              <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all">
                {newApiKey.key}
              </div>
              <button
                onClick={() => { handleCopy(newApiKey.key); setShowApiKeyModal(false); setNewApiKey(null); }}
                className="w-full py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
              >
                <CopyIcon className="h-4 w-4" /> Скопировать и закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Сменить тариф</h3>
              <button onClick={() => setShowChangePlanModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiers.map((t) => (
                <div
                  key={t.key}
                  onClick={() => setSelectedTierKey(t.key as Team["tier"])}
                  className={`p-4 rounded-xl border cursor-pointer ${selectedTierKey === t.key ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <t.icon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.price}</div>
                    </div>
                  </div>
                  <ul className="text-xs space-y-1">
                    {t.features.map((f, i) => <li key={i} className="flex items-start gap-2"><Check className="h-3 w-3 text-primary mt-0.5" />{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setShowChangePlanModal(false)} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
              <button onClick={handleConfirmChangePlan} disabled={!selectedTierKey || selectedTierKey === team?.tier} className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50">Подтвердить</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={showConfirmModal.open}
        title={showConfirmModal.title}
        description={showConfirmModal.desc}
        confirmText="Подтвердить"
        cancelText="Отмена"
        variant={showConfirmModal.variant}
        onConfirm={() => showConfirmModal.action?.()}
        onCancel={() => setShowConfirmModal(prev => ({ ...prev, open: false, action: null }))}
      />
    </div>
  );
}