import { useState, useEffect } from "react";
import {
  Plus, Search, Trash2, Settings, Play, Pause, Zap,
  Clock, BarChart3, Copy as CopyIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import StudioSkillBuilder from "./StudioSkillBuilder";
import StudioSkillEditor from "./StudioSkillEditor";
import { type Integration } from "./IntegrationPicker";

interface Skill {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  trigger?: string;
  action?: string;
  integration?: string;
  lastRun?: number;
  runCount?: number;
  createdAt: number;
  integrations?: Integration[];
  workflow?: any;
  config?: any;
}

const normalizeIntegrations = (integrations?: any[]): Integration[] => {
  if (!integrations) return [];
  return integrations.map((int: any, index: number) => {
    if (typeof int === "string") {
      return {
        id: `legacy_${index}`,
        source: "account_manager",
        service: int,
        name: int.charAt(0).toUpperCase() + int.slice(1)
      };
    }
    return int as Integration;
  });
};

const STORAGE_KEY = "promptcraft_skills";

function getSkills(): Skill[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveSkills(skills: Skill[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(skills));
}

const statusLabels: Record<string, string> = {
  active: "Активен",
  paused: "На паузе",
  draft: "Черновик",
};

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  paused: "bg-warning/10 text-warning",
  draft: "bg-muted text-muted-foreground",
};

export function StudioMySkills() {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  // Загрузка скилов при монтировании
  useEffect(() => {
    setSkills(getSkills());
  }, []);

  // 🔹 АВТОВОССТАНОВЛЕНИЕ: Открываем правильную модалку при возврате из Менеджера
  useEffect(() => {
    const contextStr = localStorage.getItem("restore_skill_context");
    const restoreId = localStorage.getItem("restore_skill_id");
    
    console.log("🔍 Проверка восстановления:", { contextStr, restoreId });
    
    if (contextStr && restoreId) {
      try {
        const context = JSON.parse(contextStr);
        console.log("♻️ Контекст восстановления:", context);
        
        if (context.source === 'editor') {
          // 🔹 ОТКРЫВАЕМ РЕДАКТОР существующего скила
          console.log("✅ Открываем редактор для скила:", restoreId);
          const skills = getSkills();
          const skill = skills.find((s: any) => s.id === restoreId);
          
          if (skill) {
            setEditingSkill(skill);
            console.log("✅ Редактор открыт для:", skill.name);
            // Очищаем флаги ТОЛЬКО для редактора (конструктор очистит сам)
            localStorage.removeItem("restore_skill_context");
            localStorage.removeItem("restore_skill_id");
          } else {
            console.error("❌ Скил не найден в хранилище:", restoreId);
            setShowBuilder(true);
            // НЕ очищаем флаги — конструктор прочитает и очистит сам
          }
        } else {
          // 🔹 ОТКРЫВАЕМ КОНСТРУКТОР нового скила
          console.log("✅ Открываем конструктор нового скила");
          setShowBuilder(true);
          // 🔹 ВАЖНО: НЕ очищаем флаги здесь! Конструктор сам их прочитает и очистит
        }
      } catch (e) {
        console.error("❌ Ошибка парсинга контекста:", e);
        localStorage.removeItem("restore_skill_context");
        localStorage.removeItem("restore_skill_id");
      }
    } else {
      console.log("⚪ Флаги восстановления не найдены");
    }
  }, []);

  const filtered = skills
    .filter((s) => filter === "all" || s.status === filter)
    .filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (s.name || "").toLowerCase().includes(q) || 
             (s.description || "").toLowerCase().includes(q);
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const handleSaveSkill = (newSkill: Skill) => {
    const updated = [newSkill, ...skills];
    setSkills(updated);
    saveSkills(updated);
  };

  const handleUpdateSkill = (updatedSkill: Skill) => {
    const updated = skills.map(s => s.id === updatedSkill.id ? updatedSkill : s);
    setSkills(updated);
    saveSkills(updated);
  };

  const handleDeleteSkill = (id: string) => {
    const updated = skills.filter(s => s.id !== id);
    setSkills(updated);
    saveSkills(updated);
  };

  const handleToggleStatus = (skill: Skill) => {
    const newStatus: "active" | "paused" | "draft" = skill.status === "active" ? "paused" : "active";
    const updated = skills.map(s => s.id === skill.id ? { ...s, status: newStatus } : s);
    setSkills(updated);
    saveSkills(updated);
    toast({ 
      title: newStatus === "active" ? "▶️ Запущено" : "⏸️ На паузе", 
      description: `Скил "${skill.name}" ${statusLabels[newStatus].toLowerCase()}` 
    });
  };

  const handleDuplicate = (skill: Skill) => {
    const newSkill: Skill = {
      ...skill,
      id: `skill_${Date.now()}`,
      name: `${skill.name} (копия)`,
      status: "draft" as "active" | "paused" | "draft",
      runCount: 0,
      createdAt: Date.now(),
    };
    const updated = [newSkill, ...skills];
    setSkills(updated);
    saveSkills(updated);
    toast({ title: "📋 Дублировано", description: `Создана копия "${skill.name}"` });
  };

  const performDelete = (id: string) => {
    handleDeleteSkill(id);
    setDeleteConfirm(null);
    toast({ title: "🗑️ Удалено", description: "Скил удалён" });
  };

  const formatDate = (ts?: number) => ts ? new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) : "—";
  const formatTime = (ts?: number) => ts ? new Date(ts).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-4 animate-fade-in">
      {showBuilder && (
        <StudioSkillBuilder 
          onClose={() => setShowBuilder(false)} 
          onSave={handleSaveSkill} 
        />
      )}

      {editingSkill && (
        <StudioSkillEditor
          skill={editingSkill}
          onClose={() => setEditingSkill(null)}
          onSave={handleUpdateSkill}
          onDelete={handleDeleteSkill}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <Trash2 className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Удалить скил?</h3>
                <p className="text-sm text-muted-foreground">Это действие нельзя отменить</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Отмена</Button>
                <Button variant="destructive" className="flex-1" onClick={() => performDelete(deleteConfirm)}>Удалить</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Мои скилы</h3>
          <p className="text-sm text-muted-foreground">Создавайте, тестируйте и управляйте автоматизациями</p>
        </div>
        <Button onClick={() => setShowBuilder(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Создать скил
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию или описанию..." className="pl-9" />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Все" },
          { key: "active", label: "Активные" },
          { key: "paused", label: "На паузе" },
          { key: "draft", label: "Черновики" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === tab.key ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
            {tab.key === "all" && skills.length > 0 && <span className="ml-1 text-[10px]">({skills.length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{search ? "Ничего не найдено" : "У вас ещё нет скилов"}</p>
          {!search && <Button onClick={() => setShowBuilder(true)}><Plus className="h-4 w-4 mr-2" /> Создать первый скил</Button>}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((skill) => {
            const normalizedIntegrations = normalizeIntegrations(skill.integrations);
            return (
              <Card key={skill.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{skill.name}</h4>
                        <Badge variant="outline" className={statusColors[skill.status]}>{statusLabels[skill.status]}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{skill.description || "Нет описания"}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {skill.trigger && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{skill.trigger}</span>}
                        <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{skill.runCount || 0} запусков</span>
                        {skill.lastRun && <span> {formatDate(skill.lastRun)} {formatTime(skill.lastRun)}</span>}
                        <span> {formatDate(skill.createdAt)}</span>
                      </div>

                      {normalizedIntegrations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {normalizedIntegrations.map((int, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                              {int.source === "account_manager" && "🔗"}
                              {int.source === "universal" && "🔌"}
                              {int.source === "custom" && "⚙️"}
                              {int.name || int.service}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button 
                        size="sm" 
                        variant={skill.status === "active" ? "outline" : "default"} 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleToggleStatus(skill)} 
                        title={skill.status === "active" ? "Остановить" : "Запустить"}
                      >
                        {skill.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0" 
                        onClick={() => setEditingSkill(skill)} 
                        title="Настроить"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleDuplicate(skill)} 
                        title="Дублировать"
                      >
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 w-8 p-0 text-destructive" 
                        onClick={() => setDeleteConfirm(skill.id)} 
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}