// AI AGENT ORCHESTRATOR - Рациональное использование AI моделей

export type AITaskType = "text" | "image" | "marketing" | "seo" | "creative" | "infographic";
export type PlatformType = "wildberries" | "ozon" | "vk" | "telegram" | "dzen" | "universal";

export interface AIRecommendation {
  primaryAI: string;
  secondaryAI?: string;
  reason: string;
  estimatedTime: number;
}

const AI_CAPABILITIES: Record<string, { strengths: string[]; bestFor: AITaskType[] }> = {
  yandexgpt: { strengths: ["SEO", "Точность", "Структура"], bestFor: ["text", "seo", "infographic"] },
  kandinsky: { strengths: ["Фотореализм", "Детали", "Качество"], bestFor: ["image", "infographic"] },
  gigachat: { strengths: ["Креатив", "Продающие тексты", "Эмоции"], bestFor: ["marketing", "creative", "text"] },
  shedevrum: { strengths: ["Художественные стили", "Креатив", "Арт"], bestFor: ["creative", "image"] },
};

const PLATFORM_RECOMMENDATIONS: Record<PlatformType, AIRecommendation> = {
  wildberries: { primaryAI: "yandexgpt", secondaryAI: "kandinsky", reason: "SEO + студийное фото", estimatedTime: 45 },
  ozon: { primaryAI: "yandexgpt", secondaryAI: "kandinsky", reason: "Описание + инфографика", estimatedTime: 50 },
  vk: { primaryAI: "gigachat", secondaryAI: "shedevrum", reason: "Эмоции + креатив", estimatedTime: 40 },
  telegram: { primaryAI: "gigachat", secondaryAI: "kandinsky", reason: "Короткий текст + превью", estimatedTime: 35 },
  dzen: { primaryAI: "gigachat", secondaryAI: "shedevrum", reason: "Длинный контент + обложка", estimatedTime: 60 },
  universal: { primaryAI: "yandexgpt", secondaryAI: "kandinsky", reason: "Универсальное решение", estimatedTime: 55 },
};

export function recommendAI(taskType: AITaskType, platform?: PlatformType): AIRecommendation {
  if (platform && PLATFORM_RECOMMENDATIONS[platform]) return PLATFORM_RECOMMENDATIONS[platform];
  const best = Object.entries(AI_CAPABILITIES).find(([_, c]) => c.bestFor.includes(taskType));
  if (best) return { primaryAI: best[0], reason: `Лучший для: ${best[1].strengths.join(", ")}`, estimatedTime: 45 };
  return { primaryAI: "yandexgpt", secondaryAI: "kandinsky", reason: "Универсальная комбинация", estimatedTime: 55 };
}

export interface AIChainStep { ai: string; task: string; input: string; output: string; }

export function createAIChain(taskType: AITaskType, platform: PlatformType, data: any): AIChainStep[] {
  const chain: AIChainStep[] = [];
  if (["text","seo","marketing"].includes(taskType)) {
    chain.push({ ai: taskType==="marketing"?"gigachat":"yandexgpt", task: "Генерация текста", input: data.description||"", output: "text" });
  }
  if (["image","infographic","creative"].includes(taskType)) {
    chain.push({ ai: taskType==="creative"?"shedevrum":"kandinsky", task: "Генерация изображения", input: data.prompt||"", output: "image" });
  }
  if (platform !== "universal") chain.push({ ai: "yandexgpt", task: `Адаптация под ${platform}`, input: "generated_text", output: "final_text" });
  return chain;
}

export function estimateTime(chain: AIChainStep[]): number {
  const t: Record<string,number> = { "Генерация текста":15, "Генерация изображения":30, "Адаптация":10 };
  return chain.reduce((sum, s) => sum + (t[s.task]||20), 0);
}

export interface AIUsageLog { timestamp: number; ai: string; task: string; platform?: string; duration: number; success: boolean; }
export function logAIUsage(log: AIUsageLog): void {
  const logs = JSON.parse(localStorage.getItem("ai_usage_logs")||"[]");
  logs.push(log);
  localStorage.setItem("ai_usage_logs", JSON.stringify(logs.slice(-100)));
}
export function getAIUsageStats(): Record<string,number> {
  const logs: AIUsageLog[] = JSON.parse(localStorage.getItem("ai_usage_logs")||"[]");
  return logs.reduce((acc,l)=>{acc[l.ai]=(acc[l.ai]||0)+1;return acc},{} as Record<string,number>);
}