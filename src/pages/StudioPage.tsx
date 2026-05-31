import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { StudioDashboard } from "../components/studio/StudioDashboard";
import { StudioMyPrompts } from "../components/studio/StudioMyPrompts";
import { StudioMySkills } from "../components/studio/StudioMySkills";
import { StudioLibrary } from "../components/studio/StudioLibrary";
import { StudioFinances } from "../components/studio/StudioFinances";
import { StudioAnalytics } from "../components/studio/StudioAnalytics";
import { StudioAuthorSettings } from "../components/studio/StudioAuthorSettings";
import { StudioVerification } from "../components/studio/StudioVerification";
import PromptGenerator from "@/pages/PromptGenerator";
import { StudioAITools } from "../components/studio/StudioAITools";
import { Bot, Plus, Zap, Settings, Play, Clock, AlertCircle, Trash2, Copy } from "lucide-react";
import { Link } from "react-router-dom";

// 🔹 Тип для агента (для заглушки)
interface AgentStub {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "paused";
  lastRun?: string;
  runCount?: number;
  integrations: string[];
  createdAt: string;
}

const tabs = [
  { key: "main", label: "Главная" },
  { key: "prompts", label: "Мои промты" },
  { key: "skills", label: "Мои скилы" },
  { key: "agents", label: "🤖 Мои агенты" },
  { key: "generator", label: "AI Генератор" },
  { key: "library", label: "Библиотека" },
  { key: "finances", label: "Финансы" },
  { key: "analytics", label: "Аналитика" },
  { key: "verification", label: "Верификация" },
  { key: "ai_tools", label: "AI и Инструменты" },
  { key: "author", label: "Настройки автора" },
];

// 🔹 Заглушка: список агентов
function StudioMyAgentsPlaceholder() {
  const [mockAgents, setMockAgents] = useState<AgentStub[]>([
    {
      id: "ag_1",
      name: "Telegram-помощник",
      description: "Отвечает на вопросы в чате, использует базу знаний",
      status: "active",
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      runCount: 142,
      integrations: ["Telegram", "OpenAI", "Notion"],
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: "ag_2",
      name: "Аналитик данных",
      description: "Обрабатывает CSV, строит графики, пишет отчёты",
      status: "paused",
      runCount: 28,
      integrations: ["Google Sheets", "YandexGPT"],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "ag_3",
      name: "Генератор контента",
      description: "Создает посты для соцсетей по расписанию",
      status: "draft",
      runCount: 0,
      integrations: ["Telegram", "VK API"],
      createdAt: new Date().toISOString(),
    },
  ]);

  // 🔹 Удаление агента
  const handleDeleteAgent = (id: string, name: string) => {
    if (window.confirm(`Удалить агента "${name}"? Это действие нельзя отменить.`)) {
      setMockAgents(prev => prev.filter(a => a.id !== id));
      // Здесь будет вызов API для удаления
      console.log("🗑️ Agent deleted:", id);
    }
  };

  // 🔹 Дублирование агента
  const handleDuplicateAgent = (agent: AgentStub) => {
    const newAgent: AgentStub = {
      ...agent,
      id: `ag_${Date.now()}`,
      name: `${agent.name} (копия)`,
      status: "draft",
      runCount: 0,
      createdAt: new Date().toISOString(),
    };
    setMockAgents(prev => [...prev, newAgent]);
    console.log("📋 Agent duplicated:", newAgent.id);
  };

  return (
    <div className="space-y-4">
      {/* Хедер */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Мои AI-агенты</h3>
          <p className="text-sm text-muted-foreground">
            Создавайте, настраивайте и запускайте автономных помощников
          </p>
        </div>
        <Link
          to="/studio/agent-builder"
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Создать агента
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Bot className="h-4 w-4" /> Всего агентов
          </div>
          <p className="text-2xl font-bold">{mockAgents.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Zap className="h-4 w-4" /> Активных
          </div>
          <p className="text-2xl font-bold text-green-600">
            {mockAgents.filter(a => a.status === "active").length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Play className="h-4 w-4" /> Запусков сегодня
          </div>
          <p className="text-2xl font-bold">
            {mockAgents.reduce((sum, a) => sum + (a.runCount && a.runCount > 10 ? 5 : a.runCount || 0), 0)}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="h-4 w-4" /> Последний запуск
          </div>
          <p className="text-sm font-medium">
            {mockAgents.find(a => a.lastRun) 
              ? new Date(mockAgents.find(a => a.lastRun)!.lastRun!).toLocaleTimeString("ru-RU")
              : "—"}
          </p>
        </div>
      </div>

      {/* Список агентов */}
      <div className="space-y-3">
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{agent.name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    agent.status === "active" ? "bg-green-100 text-green-700" :
                    agent.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {agent.status === "active" ? "● Активен" :
                     agent.status === "paused" ? "○ На паузе" : "✎ Черновик"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                
                {/* Интеграции */}
                {agent.integrations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.integrations.map((int, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                        <Settings className="h-2.5 w-2.5" />
                        {int}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Мета */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>🔄 {agent.runCount || 0} запусков</span>
                  {agent.lastRun && (
                    <span>🕐 {new Date(agent.lastRun).toLocaleDateString("ru-RU")}</span>
                  )}
                  <span>📅 Создан: {new Date(agent.createdAt).toLocaleDateString("ru-RU")}</span>
                </div>
              </div>
              
              {/* 🔹 Действия - добавлены кнопки Копировать и Удалить */}
              <div className="flex flex-col gap-2">
                <button
                  disabled={agent.status !== "active"}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-opacity ${
                    agent.status === "active"
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <Play className="h-3.5 w-3.5" />
                  Запустить
                </button>
                <Link
                  to={`/studio/agent-builder?id=${agent.id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors text-center flex items-center justify-center gap-1.5"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Настроить
                </Link>
                {/* 🔹 Кнопки действий (как в промптах) */}
                <div className="flex gap-1 mt-2 pt-2 border-t border-border">
                  <button
                    onClick={() => handleDuplicateAgent(agent)}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-muted transition-colors flex items-center justify-center gap-1"
                    title="Дублировать агента"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Копия
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.id, agent.name)}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1"
                    title="Удалить агента"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Пустое состояние */}
      {mockAgents.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/20">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium mb-1">У вас пока нет созданных агентов</p>
          <p className="text-xs text-muted-foreground mb-4">
            Создайте первого автономного помощника за 5 минут
          </p>
          <Link
            to="/studio/agent-builder"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Создать агента
          </Link>
        </div>
      )}

      {/* Подсказка */}
      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-primary mb-1">💡 Как работают агенты?</p>
          <p className="text-muted-foreground">
            Агент — это автономный сценарий, который выполняет задачи по расписанию или событию. 
            Он использует подключённые интеграции из <Link to="/account-manager" className="text-primary hover:underline">Менеджера аккаунтов</Link> и может работать 24/7.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get("tab") || "main");
  
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-1">Studio</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Управляйте своим контентом, финансами и библиотекой
      </p>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "main" && <StudioDashboard />}
      {activeTab === "prompts" && <StudioMyPrompts />}
      {activeTab === "skills" && <StudioMySkills />}
      {activeTab === "agents" && <StudioMyAgentsPlaceholder />}
      {activeTab === "generator" && <PromptGenerator embedded />}
      {activeTab === "library" && <StudioLibrary />}
      {activeTab === "finances" && <StudioFinances />}
      {activeTab === "analytics" && <StudioAnalytics />}
      {activeTab === "verification" && <StudioVerification />}
      {activeTab === "ai_tools" && <StudioAITools />}
      {activeTab === "author" && <StudioAuthorSettings />}
    </div>
  );
}