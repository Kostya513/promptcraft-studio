// src/lib/ai-agent/social/index.ts
// Социальный модуль — единая точка входа

// ─── Типы ───
export {
  ISocialNetwork,
  SocialPost,
  PublishResult,
  PostStats,
  SocialNetworkConfig,
  SocialNetworkRegistry,
} from './types';

// ─── Реестр ───
export { SocialNetworkManager, socialRegistry } from './registry';

// ─── Адаптеры ───
export { VKAdapter, createVKAdapter } from './vk';
export { TelegramAdapter, createTelegramAdapter } from './telegram';
export { TenChatAdapter, createTenChatAdapter } from './tenchat';
export { DzenAdapter, createDzenAdapter } from './dzen';

// ─── Фабрика для создания адаптеров ───
export function createSocialAdapter(
  platform: string,
  config: SocialNetworkConfig
): ISocialNetwork | null {
  switch (platform.toLowerCase()) {
    case 'vk':
    case 'vkontakte':
    case 'вконтакте':
      return createVKAdapter(config);
    
    case 'telegram':
    case 'tg':
    case 'телеграм':
      return createTelegramAdapter(config);
    
    case 'tenchat':
    case 'ten':
    case 'тенчат':
      return createTenChatAdapter(config);
    
    case 'dzen':
    case 'дзен':
    case 'zen':
      return createDzenAdapter(config);
    
    default:
      console.warn(`Платформа ${platform} не поддерживается. Доступны: VK, Telegram, TenChat, Дзен`);
      return null;
  }
}

// ─── Быстрое подключение платформы ───
export async function connectSocialNetwork(
  platform: string,
  credentials: Record<string, string>
): Promise<boolean> {
  const config: SocialNetworkConfig = {
    platform,
    credentials,
  };

  const adapter = createSocialAdapter(platform, config);
  if (!adapter) return false;

  socialRegistry.register(platform, adapter);
  return await adapter.isConnected();
}

// ─── Быстрая публикация ───
export async function publishToSocial(
  platform: string,
  post: SocialPost
): Promise<PublishResult> {
  const network = socialRegistry.get(platform);
  if (!network) {
    return {
      success: false,
      error: `Платформа ${platform} не подключена`,
      platform,
      timestamp: Date.now(),
    };
  }

  return await network.publish(post);
}

// ─── Публикация в несколько платформ ───
export async function publishToMultiple(
  platforms: string[],
  post: SocialPost
): Promise<Record<string, PublishResult>> {
  return await socialRegistry.publishToMultiple(platforms, post);
}
