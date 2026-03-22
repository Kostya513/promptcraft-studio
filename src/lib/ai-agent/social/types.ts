// src/lib/ai-agent/social/types.ts
// Общие типы для всех социальных сетей

// ─── Контент поста ───
export interface SocialPost {
  text: string;
  hashtags?: string[];
  imageUrl?: string;
  imageFile?: File;
  link?: string;
  scheduledTime?: Date;
}

// ─── Результат публикации ───
export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
  platform: string;
  timestamp: number;
}

// ─── Статистика поста ───
export interface PostStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  clicks?: number;
  reach?: number;
}

// ─── Конфигурация соцсети ───
export interface SocialNetworkConfig {
  platform: string;
  credentials: Record<string, string>;
  settings?: Record<string, any>;
}

// ─── Интерфейс для ВСЕХ соцсетей ───
export interface ISocialNetwork {
  // Получить название платформы
  getPlatform(): string;

  // Проверить подключение
  isConnected(): Promise<boolean>;

  // Опубликовать пост
  publish(post: SocialPost): Promise<PublishResult>;

  // Получить статистику
  getStats(postId: string): Promise<PostStats>;

  // Запланировать публикацию
  schedule(post: SocialPost, time: Date): Promise<PublishResult>;

  // Отменить запланированную публикацию
  cancelScheduled(postId: string): Promise<boolean>;

  // Получить список подключённых аккаунтов
  getConnectedAccounts(): Promise<string[]>;
}

// ─── Реестр доступных соцсетей ───
export interface SocialNetworkRegistry {
  register(platform: string, network: ISocialNetwork): void;
  get(platform: string): ISocialNetwork | null;
  getAll(): Map<string, ISocialNetwork>;
  getAvailable(): string[];
}
