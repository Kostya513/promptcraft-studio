import { useState, useEffect } from "react";
import { Plus, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export interface Integration {
  id: string;
  service: string;
  name: string;
  source: "account_manager" | "connector" | "custom";
}

interface IntegrationPickerProps {
  skillId: string;
  source: "builder" | "editor";
  selectedIntegrations: Integration[];
  onChange: (integrations: Integration[]) => void;
}

export default function IntegrationPicker({
  skillId,
  source,
  selectedIntegrations,
  onChange,
}: IntegrationPickerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"manager" | "connectors" | "custom">("manager");
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Загружаем аккаунты из Менеджера
    try {
      const encrypted = localStorage.getItem("encrypted_accounts");
      if (encrypted) {
        // Для простоты показываем все аккаунты
        // В реальной реализации нужна дешифровка
        setAccounts([]);
      }
    } catch (e) {
      console.error("Ошибка загрузки аккаунтов:", e);
    }
  }, []);

  const handleGoToManager = () => {
    if (!skillId) {
      toast({
        title: "⚠️ Ошибка",
        description: "ID скила не определён",
        variant: "destructive",
      });
      return;
    }

    console.log("💾 [LEAVE] Начинаю сохранение перед уходом...");
    console.log("💾 [LEAVE] skillId:", skillId);

    // 🔥 ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ ЧЕРНОВИКА
    const currentDraft = localStorage.getItem(`draft_${skillId}`);
    if (currentDraft) {
      try {
        const parsed = JSON.parse(currentDraft);
        console.log("💾 [LEAVE] Текущий шаг в черновике:", parsed.meta?.aiStep);

        // Обновляем timestamp
        parsed.meta.timestamp = Date.now();
        localStorage.setItem(`draft_${skillId}`, JSON.stringify(parsed));

        console.log("✅ [LEAVE] Черновик обновлён, шаг:", parsed.meta?.aiStep);
      } catch (e) {
        console.error("❌ [LEAVE] Ошибка сохранения:", e);
      }
    } else {
      console.warn("⚠️ [LEAVE] Черновик НЕ найден!");
    }

    // Сохраняем контекст восстановления
    const context = {
      skillId,
      returnUrl: window.location.href,
      timestamp: Date.now(),
      source: source,
    };

    localStorage.setItem("restore_skill_context", JSON.stringify(context));
    localStorage.setItem("restore_skill_id", skillId);

    console.log("✅ [LEAVE] Контекст сохранён:", context);
    console.log("🚀 [LEAVE] Перехожу в Менеджер через 200ms...");

    // Задержка для гарантии сохранения
    setTimeout(() => {
      window.location.href = "/accounts?mode=select";
    }, 200);
  };

  const handleSelectAccount = (account: any) => {
    const newIntegration: Integration = {
      id: account.id,
      service: account.service,
      name: account.service,
      source: "account_manager",
    };

    if (!selectedIntegrations.find((i) => i.id === newIntegration.id)) {
      onChange([...selectedIntegrations, newIntegration]);
      toast({
        title: "✅ Добавлено",
        description: `Аккаунт ${account.service} добавлен`,
      });
    }
  };

  const handleRemoveIntegration = (id: string) => {
    onChange(selectedIntegrations.filter((i) => i.id !== id));
    toast({
      title: "🗑️ Удалено",
      description: "Интеграция удалена",
    });
  };

  return (
    <div className="space-y-4">
      {/* Вкладки */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("manager")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "manager"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Из Менеджера ({selectedIntegrations.filter((i) => i.source === "account_manager").length})
        </button>
        <button
          onClick={() => setActiveTab("connectors")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "connectors"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Коннекторы
        </button>
        <button
          onClick={() => setActiveTab("custom")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "custom"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Своя
        </button>
      </div>

      {/* Контент вкладок */}
      {activeTab === "manager" && (
        <div className="space-y-3">
          {selectedIntegrations.filter((i) => i.source === "account_manager").length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Нет подключённых аккаунтов.
                  <button
                    onClick={handleGoToManager}
                    className="text-primary underline ml-1"
                  >
                    Перейти в Менеджер
                  </button>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {selectedIntegrations
                .filter((i) => i.source === "account_manager")
                .map((integration) => (
                  <Card key={integration.id} className="border-border">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="font-medium text-sm">{integration.service}</p>
                          <Badge variant="secondary" className="text-xs">
                            Из Менеджера
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveIntegration(integration.id)}
                      >
                        Удалить
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "connectors" && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Коннекторы будут доступны позже
            </p>
          </CardContent>
        </Card>
      )}

      {activeTab === "custom" && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Настройте свою интеграцию вручную
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}