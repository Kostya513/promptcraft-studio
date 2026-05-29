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
// ✅ Подключаем новый компонент
import { StudioAITools } from "../components/studio/StudioAITools";

const tabs = [
  { key: "main", label: "Главная" },
  { key: "prompts", label: "Мои промты" },
  { key: "skills", label: "Мои скилы" },
  { key: "generator", label: "AI Генератор" },
  { key: "library", label: "Библиотека" },
  { key: "finances", label: "Финансы" },
  { key: "analytics", label: "Аналитика" },
  { key: "verification", label: "Верификация" },
  { key: "ai_tools", label: "AI и Инструменты" }, // ✅ Добавлена вкладка
  { key: "author", label: "Настройки автора" },
];

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
      {activeTab === "generator" && <PromptGenerator embedded />}
      {activeTab === "library" && <StudioLibrary />}
      {activeTab === "finances" && <StudioFinances />}
      {activeTab === "analytics" && <StudioAnalytics />}
      {activeTab === "verification" && <StudioVerification />}
      {activeTab === "ai_tools" && <StudioAITools />} {/* ✅ Рендер компонента */}
      {activeTab === "author" && <StudioAuthorSettings />}
    </div>
  );
}