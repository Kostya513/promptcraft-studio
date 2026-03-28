export type AIModel = "yandexgpt" | "kandinsky" | "gigachat" | "shedevrum" | "custom" | "manual";

export type PromptCategory = 
  | "marketplace" 
  | "social" 
  | "business" 
  | "development" 
  | "creative" 
  | "analytics" 
  | "education" 
  | "content" 
  | "video" 
  | "other";

export type PromptStatus = "draft" | "published" | "moderation" | "archived";

export type ExportFormat = "json" | "txt" | "png" | "pdf" | "code" | "markdown";

export type PublishPlatform = "wb" | "ozon" | "ym" | "vk" | "tg" | "dzen" | "tenchat";

export interface PromptVersion {
  version: number;
  text: string;
  createdAt: number;
  changes: string;
}

export interface PromptMetadata {
  generationTime: number;
  aiModel: AIModel;
  style?: string;
  temperature?: number;
  maxTokens?: number;
  detailLevel?: number;
  creativity?: number;
  exportFormats?: ExportFormat[];
  category?: PromptCategory;
}

export interface PromptData {
  id: string;
  text: string;
  title: string;
  description: string;
  category: PromptCategory;
  model: AIModel;
  status: PromptStatus;
  quality: number;
  createdAt: number;
  updatedAt: number;
  imageUrl?: string;
  originalDescription?: string;
  version: number;
  versions: PromptVersion[];
  metadata: PromptMetadata;
}

export interface PublishData {
  promptId: string;
  platforms: PublishPlatform[];
  scheduledAt?: number;
  autoPost: boolean;
}

export interface PlatformInfo {
  id: PublishPlatform;
  name: string;
  type: PromptCategory;
  connected: boolean;
  lastPublished?: number;
  icon: string;
}

export const PLATFORMS: PlatformInfo[] = [
  { id: "wb", name: "Wildberries", type: "marketplace", connected: false, icon: "🛒" },
  { id: "ozon", name: "Ozon", type: "marketplace", connected: false, icon: "📦" },
  { id: "ym", name: "Яндекс.Маркет", type: "marketplace", connected: false, icon: "🏪" },
  { id: "vk", name: "VK", type: "social", connected: false, icon: "💙" },
  { id: "tg", name: "Telegram", type: "social", connected: false, icon: "✈️" },
  { id: "dzen", name: "Дзен", type: "social", connected: false, icon: "📰" },
  { id: "tenchat", name: "TenChat", type: "social", connected: false, icon: "💼" },
];