import { useState } from "react";
import { Zap, ToggleLeft, ToggleRight, Settings, Link2, Webhook, Activity, Shield, Users, Plus, Copy } from "lucide-react";

// 🔹 Типы данных
type SkillConnection = {
  id: string;
  name: string;
  version: string;
  isActive: boolean;
  lastUsed: string;
  usageCount: number;
  triggers: string[];
};

type IntegrationConfig = {
  id: string;
  type: "telegram" | "webhook" | "crm" | "notion" | "sheets";
  name: string;
  isConnected: boolean;
  config: Record<string, string>;
};

type UsageLog = {
  id: string;
  skillId: string;
  timestamp: string;
  trigger: string;
  status: "success" | "error" | "pending";
  duration: number;
  tokensUsed: number;
};

// 🔹 Массивы с данными — ТЕПЕРЬ ПУСТЫЕ (демо удалено)
const MOCK_SKILLS: SkillConnection[] = [];
const MOCK_INTEGRATIONS: IntegrationConfig[] = [];
const MOCK_LOGS: UsageLog[] = [];

interface AccountSkillsIntegrationsProps {
  cryptoKey: CryptoKey | null;
}

export function AccountSkillsIntegrations({ cryptoKey }: AccountSkillsIntegrationsProps) {
  const [activeSection, setActiveSection] = useState<"skills" | "integrations" | "logs" | "limits">("skills");
  const [skills, setSkills] = useState<SkillConnection[]>(MOCK_SKILLS);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(MOCK_INTEGRATIONS);
  const [logs] = useState<UsageLog[]>(MOCK_LOGS);

  // Переключение статуса скила
  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  // Копирование конфига
  const copyConfig = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const sections = [
    { key: "skills", label: "Активные скилы", icon: <Zap className="h-4 w-4" /> },
    { key: "integrations", label: "Подключения", icon: <Link2 className="h-4 w-4" /> },
    { key: "logs", label: "Логи использования", icon: <Activity className="h-4 w-4" /> },
    { key: "limits", label: "Лимиты и доступ", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Хедер */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Скилы и Интеграции
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управляйте активными процессами и внешними подключениями
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Добавить скил
        </button>
      </div>

      {/* Переключатель секций */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
        {sections.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeSection === sec.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {sec.icon}
            {sec.label}
          </button>
        ))}
      </div>

      {/* Секция 1: Активные скилы */}
      {activeSection === "skills" && (
        <div className="space-y-4">
          {skills.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl bg-muted/30 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-1">Пока нет активных скилов</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Скилы — это структурированные процессы. Перейдите в Библиотеку, чтобы активировать нужный скил, 
                или создайте свой через Studio.
              </p>
              <div className="flex justify-center gap-3">
                <button className="px-5 py-2.5 border border-border bg-card hover:bg-muted rounded-lg text-sm font-medium transition-colors">
                  Перейти в Библиотеку
                </button>
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Создать в Studio
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Скил</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Версия</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Запусков</th>
                    <th className="text-left px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill) => (
                    <tr key={skill.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Триггеры: {skill.triggers.join(", ")}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">v{skill.version}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{skill.usageCount}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSkill(skill.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            skill.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {skill.isActive ? (
                            <>
                              <ToggleRight className="h-3.5 w-3.5" /> Активен
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-3.5 w-3.5" /> Отключен
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-muted rounded">
                          <Settings className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Секция 2: Подключения */}
      {activeSection === "integrations" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {integrations.length === 0 ? (
            <div className="col-span-full border border-dashed border-border rounded-xl bg-muted/30 p-10 text-center">
              <Link2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Нет подключений</p>
            </div>
          ) : (
            integrations.map((int) => (
              <div key={int.id} className="border border-border rounded-xl bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {int.type === "telegram" && <span className="text-lg">📱</span>}
                    {int.type === "webhook" && <Webhook className="h-4 w-4 text-muted-foreground" />}
                    {int.type === "crm" && <span className="text-lg">🗄️</span>}
                    <span className="font-medium">{int.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    int.isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {int.isConnected ? "Подключено" : "Не активно"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {Object.entries(int.config).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <div className="flex items-center gap-1">
                        <code className="px-1.5 py-0.5 bg-muted rounded truncate max-w-[120px]">
                          {value ? `${value.slice(0, 8)}...` : "—"}
                        </code>
                        {value && (
                          <button onClick={() => copyConfig(value)} className="p-0.5 hover:bg-muted rounded">
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <button className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted transition-colors">
                    Настроить
                  </button>
                  <button className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                    {int.isConnected ? "Отключить" : "Подключить"}
                  </button>
                </div>
              </div>
            ))
          )}
          
          {/* Карточка добавления */}
          <button className="border border-dashed border-border rounded-xl bg-muted/30 p-4 flex flex-col items-center justify-center text-center hover:border-primary/50 hover:bg-muted/50 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-muted-foreground">Добавить подключение</span>
          </button>
        </div>
      )}

      {/* Секция 3: Логи использования */}
      {activeSection === "logs" && (
        <div className="border border-border rounded-xl bg-card overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-10 text-center">
              <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Нет активности</p>
              <p className="text-xs text-muted-foreground mt-1">Запуски скилов будут отображаться здесь</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Время</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Скил</th>
                  <th className="text-left px-4 py-3 font-medium">Триггер</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Статус</th>
                  <th className="text-right px-4 py-3 font-medium">Токены</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(log.timestamp).toLocaleString("ru-RU", { 
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" 
                      })}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell font-medium">
                      {skills.find((s) => s.id === log.skillId)?.name || "Неизвестно"}
                    </td>
                    <td className="px-4 py-3">{log.trigger}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        log.status === "success" ? "bg-green-100 text-green-700" :
                        log.status === "error" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {log.status === "success" ? "Успех" : log.status === "error" ? "Ошибка" : "В процессе"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{log.tokensUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Секция 4: Лимиты и доступ */}
      {activeSection === "limits" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Лимиты */}
          <div className="border border-border rounded-xl bg-card p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Лимиты использования
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Запусков в месяц</label>
                <input type="number" defaultValue={1000} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Токенов в день</label>
                <input type="number" defaultValue={50000} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Webhook timeout (сек)</label>
                <input type="number" defaultValue={30} className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm" />
              </div>
            </div>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Сохранить лимиты
            </button>
          </div>

          {/* Доступ для команды */}
          <div className="border border-border rounded-xl bg-card p-4 space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Доступ для команды
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded border-border" />
                Разрешить запуск скилов участникам
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-border" />
                Разрешить редактирование конфигурации
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-border" />
                Показывать логи использования
              </label>
            </div>
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">API-ключ для внешних интеграций:</p>
              <div className="flex gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-muted text-xs truncate">
                  sk_live_••••••••••••••••
                </code>
                <button className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}