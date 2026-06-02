import { useState, useEffect } from "react";
import { X, Save, Trash2, Settings, Code, Wand2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import IntegrationPicker, { type Integration } from "./IntegrationPicker";

interface Skill {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  workflow?: any;
  config?: any;
  integrations?: (Integration | string)[];
  createdAt?: number;
}

const normalizeIntegrations = (integrations?: (Integration | string)[]): Integration[] => {
  if (!integrations) return [];
  if (!Array.isArray(integrations)) return [];
  return integrations.map((int, index) => {
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

export default function StudioSkillEditor({ 
  skill, 
  onClose, 
  onSave,
  onDelete
}: { 
  skill: Skill; 
  onClose: () => void; 
  onSave: (skill: Skill) => void;
  onDelete: (id: string) => void;
}) {
  const { toast } = useToast();
  const [editedSkill, setEditedSkill] = useState<Skill>({ 
    ...skill, 
    integrations: normalizeIntegrations(skill?.integrations) 
  });
  const [activeTab, setActiveTab] = useState<"general" | "workflow" | "settings">("general");

  // 🔹 ВОССТАНОВЛЕНИЕ ИНТЕГРАЦИЙ ПРИ ВОЗВРАТЕ ИЗ МЕНЕДЖЕРА
  useEffect(() => {
    const restoreId = localStorage.getItem("restore_skill_id");
    const contextStr = localStorage.getItem("restore_skill_context");
    
    if (restoreId === skill.id && contextStr) {
      console.log("♻️ Восстановление редактора для:", skill.name);
      
      try {
        const context = JSON.parse(contextStr);
        
        // Подтягиваем обновлённые данные из основного хранилища
        const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
        const updatedSkill = skills.find((s: any) => s.id === skill.id);
        
        if (updatedSkill) {
          setEditedSkill({
            ...editedSkill,
            integrations: updatedSkill.integrations || editedSkill.integrations
          });
          console.log("✅ Восстановлены интеграции:", updatedSkill.integrations?.length || 0);
          
          // Переключаемся на вкладку настроек, если пришли оттуда
          setActiveTab("settings");
        }
        
        // Очищаем флаги после успешного восстановления
        localStorage.removeItem("restore_skill_id");
        localStorage.removeItem("restore_skill_context");
      } catch (e) {
        console.error("❌ Ошибка восстановления:", e);
      }
    }
  }, []);

  const handleSave = () => {
    if (!editedSkill.name.trim()) {
      toast({ title: "⚠️ Ошибка", description: "Название скила не может быть пустым", variant: "destructive" });
      return;
    }
    onSave(editedSkill);
    toast({ title: "✅ Сохранено", description: "Изменения применены" });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm("Удалить этот скил? Это действие нельзя отменить.")) {
      onDelete(skill.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{editedSkill.name || "Без названия"}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={editedSkill.status === "active" ? "default" : "outline"}>
                {editedSkill.status === "active" ? "● Активен" : editedSkill.status === "paused" ? "○ На паузе" : " Черновик"}
              </Badge>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-border bg-muted/20">
          {[
            { id: "general", label: "Основные" },
            { id: "workflow", label: "Workflow" },
            { id: "settings", label: "Настройки" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "general" && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Название скила</label>
                <Input
                  value={editedSkill.name}
                  onChange={e => setEditedSkill({ ...editedSkill, name: e.target.value })}
                  placeholder="Например: Автопостинг в Telegram"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Описание задачи</label>
                <Textarea
                  value={editedSkill.description}
                  onChange={e => setEditedSkill({ ...editedSkill, description: e.target.value })}
                  placeholder="Что делает этот скил? Какие данные использует?"
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Статус выполнения</label>
                <div className="flex gap-2">
                  {(["draft", "active", "paused"] as const).map(status => (
                    <Button
                      key={status}
                      variant={editedSkill.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditedSkill({ ...editedSkill, status })}
                      className="flex-1"
                    >
                      {status === "draft" ? "Черновик" : status === "active" ? "Активен" : "На паузе"}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "workflow" && (
            <div className="space-y-4">
              <Card className="bg-muted/30 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" /> Конфигурация workflow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editedSkill.workflow ? (
                    <pre className="text-xs bg-background p-3 rounded-lg overflow-auto max-h-[250px] border border-border">
                      {JSON.stringify(editedSkill.workflow, null, 2)}
                    </pre>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground py-4">
                      <AlertCircle className="h-4 w-4" />
                      Workflow не настроен. Используйте конструктор для создания цепочки действий.
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                <Wand2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-medium text-sm text-primary mb-1">AI Оптимизация</h5>
                  <p className="text-xs text-muted-foreground mb-2">Автоматически улучшит логику и ускорит выполнение шагов</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    <Wand2 className="h-3 w-3 mr-1" /> Оптимизировать через AI
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <IntegrationPicker
                skillId={skill.id}
                source="editor" // 🔹 ДОБАВЛЕНО: явно указываем источник
                selectedIntegrations={normalizeIntegrations(editedSkill?.integrations)}
                onChange={(integrations) => setEditedSkill({ ...editedSkill, integrations })}
              />

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3 text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> Опасная зона
                </h4>
                <Button variant="destructive" onClick={handleDelete} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" /> Удалить скил навсегда
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-border flex gap-3 bg-muted/20">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Отмена
          </Button>
          <Button onClick={handleSave} className="flex-1 gradient-primary text-primary-foreground">
            <Save className="h-4 w-4 mr-2" /> Сохранить изменения
          </Button>
        </div>
      </div>
    </div>
  );
}