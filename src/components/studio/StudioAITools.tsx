import { useState, useEffect } from "react";
import { Bot, Key, Sliders, Plus, Eye, EyeOff, Trash2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

// Интерфейсы
interface AIProvider {
  id: string;
  name: string;
  logo: string;
  models: string[];
  apiKey: string;
}

interface Assistant {
  id: string;
  name: string;
  model: string;
  active: boolean;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Начальные данные
const defaultProviders: AIProvider[] = [
  { id: "yandex", name: "YandexGPT", logo: "🟡", models: ["yandexgpt-lite", "yandexgpt-pro"], apiKey: "" },
  { id: "sber", name: "GigaChat", logo: "🟢", models: ["GigaChat", "GigaChat-Pro"], apiKey: "" },
  { id: "openai", name: "OpenAI", logo: "🔵", models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"], apiKey: "" },
  { id: "anthropic", name: "Anthropic", logo: "🟠", models: ["claude-3-5-sonnet", "claude-3-opus"], apiKey: "" },
];

const defaultAssistants: Assistant[] = [
  { id: "1", name: "Помощник для копирайтинга", model: "yandexgpt-pro", active: true },
  { id: "2", name: "Code Reviewer", model: "gpt-4o", active: false },
];

const defaultSkills: Skill[] = [
  { id: "web-search", name: "Поиск в интернете", description: "Yandex/Google поиск", enabled: true },
  { id: "image-gen", name: "Генерация изображений", description: "Kandinsky/DALL-E", enabled: true },
  { id: "code-analysis", name: "Анализ кода", description: "Проверка и рефакторинг", enabled: false },
  { id: "translation", name: "Перевод", description: "DeepL/Yandex Translate", enabled: true },
  { id: "summarization", name: "Саммаризация", description: "Краткий пересказ текста", enabled: false },
];

export function StudioAITools() {
  // ✅ Загружаем из localStorage или используем значения по умолчанию
  const [providers, setProviders] = useState<AIProvider[]>(() => {
    try {
      const stored = localStorage.getItem("ai_providers");
      return stored ? JSON.parse(stored) : defaultProviders;
    } catch {
      return defaultProviders;
    }
  });

  const [assistants, setAssistants] = useState<Assistant[]>(() => {
    try {
      const stored = localStorage.getItem("ai_assistants");
      return stored ? JSON.parse(stored) : defaultAssistants;
    } catch {
      return defaultAssistants;
    }
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    try {
      const stored = localStorage.getItem("ai_skills");
      return stored ? JSON.parse(stored) : defaultSkills;
    } catch {
      return defaultSkills;
    }
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem("ai_default_model") || "yandexgpt-pro";
  });

  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [temperature, setTemperature] = useState(() => {
    const stored = localStorage.getItem("ai_temperature");
    return stored ? Number(stored) : 0.7;
  });

  const [maxTokens, setMaxTokens] = useState(() => {
    const stored = localStorage.getItem("ai_max_tokens");
    return stored ? Number(stored) : 2000;
  });

  // ✅ Сохраняем в localStorage при изменении
  useEffect(() => {
    localStorage.setItem("ai_providers", JSON.stringify(providers));
  }, [providers]);

  useEffect(() => {
    localStorage.setItem("ai_assistants", JSON.stringify(assistants));
  }, [assistants]);

  useEffect(() => {
    localStorage.setItem("ai_skills", JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem("ai_default_model", selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem("ai_temperature", String(temperature));
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem("ai_max_tokens", String(maxTokens));
  }, [maxTokens]);

  // Обработчики
  const handleApiKeyChange = (providerId: string, apiKey: string) => {
    setProviders(prev => prev.map(p => 
      p.id === providerId ? { ...p, apiKey } : p
    ));
  };

  const handleToggleAssistant = (id: string) => {
    setAssistants(prev => prev.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    ));
    toast({ title: "Ассистент обновлён", duration: 2000 });
  };

  const handleToggleSkill = (id: string) => {
    setSkills(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
    toast({ title: "Инструмент обновлён", duration: 2000 });
  };

  const handleSaveSettings = () => {
    toast({ 
      title: "Настройки AI сохранены", 
      description: "Все изменения применены",
      duration: 3000 
    });
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="space-y-6">
      {/* AI Модели */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <Bot className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">AI Модели</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Модель по умолчанию</label>
            <select 
              value={selectedModel} 
              onChange={(e) => setSelectedModel(e.target.value)} 
              className={`${inputCls} mt-1`}
            >
              <optgroup label="🇷🇺 Российские">
                <option value="yandexgpt-pro">YandexGPT Pro</option>
                <option value="yandexgpt-lite">YandexGPT Lite</option>
                <option value="gigachat">GigaChat</option>
                <option value="gigachat-pro">GigaChat Pro</option>
              </optgroup>
              <optgroup label="🌍 Международные">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </optgroup>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Температура (креативность)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 (Точно)</span>
                <span>{temperature.toFixed(1)}</span>
                <span>1 (Креативно)</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Макс. токенов</label>
              <select 
                value={maxTokens} 
                onChange={(e) => setMaxTokens(Number(e.target.value))} 
                className={`${inputCls} mt-1`}
              >
                <option value={1000}>1,000</option>
                <option value={2000}>2,000</option>
                <option value={4000}>4,000</option>
                <option value={8000}>8,000</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* API Ключи */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <Key className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">API Ключи провайдеров</h3>
        </div>
        <div className="space-y-3">
          {providers.map(provider => (
            <div key={provider.id} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{provider.logo}</span>
                  <span className="text-sm font-medium">{provider.name}</span>
                </div>
                <button 
                  onClick={() => setShowApiKey(prev => ({ ...prev, [provider.id]: !showApiKey[provider.id] }))} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showApiKey[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input 
                type={showApiKey[provider.id] ? "text" : "password"} 
                value={provider.apiKey} 
                onChange={(e) => handleApiKeyChange(provider.id, e.target.value)} 
                placeholder={`Введите API ключ ${provider.name}`} 
                className={inputCls} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Модели: {provider.models.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Ассистенты */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Мои AI Ассистенты</h3>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Создать
          </button>
        </div>
        <div className="space-y-3">
          {assistants.map(assistant => (
            <div key={assistant.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium">{assistant.name}</p>
                <p className="text-xs text-muted-foreground">Модель: {assistant.model}</p>
              </div>
              <Switch 
                checked={assistant.active} 
                onCheckedChange={() => handleToggleAssistant(assistant.id)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Инструменты (Скилы) */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <Sliders className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Инструменты (Скилы)</h3>
        </div>
        <div className="space-y-3">
          {skills.map(skill => (
            <div key={skill.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div>
                <p className="text-sm font-medium">{skill.name}</p>
                <p className="text-xs text-muted-foreground">{skill.description}</p>
              </div>
              <Switch 
                checked={skill.enabled} 
                onCheckedChange={() => handleToggleSkill(skill.id)} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* Кнопка сохранения */}
      <div className="flex justify-end">
        <button 
          onClick={handleSaveSettings} 
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Save className="h-4 w-4" /> Сохранить настройки
        </button>
      </div>
    </div>
  );
}