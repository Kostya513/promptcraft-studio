// src/lib/ai-agent/social/registry.ts
// Реестр социальных сетей — управляет всеми адаптерами

import { ISocialNetwork, SocialNetworkConfig, SocialNetworkRegistry } from './types';

export class SocialNetworkManager implements SocialNetworkRegistry {
  private networks: Map<string, ISocialNetwork> = new Map();

  // ─── Зарегистрировать соцсеть ───
  register(platform: string, network: ISocialNetwork): void {
    this.networks.set(platform.toLowerCase(), network);
    console.log(`[SocialRegistry] Зарегистрирована платформа: ${platform}`);
  }

  // ─── Получить адаптер по названию ───
  get(platform: string): ISocialNetwork | null {
    return this.networks.get(platform.toLowerCase()) || null;
  }

  // ─── Получить все адаптеры ───
  getAll(): Map<string, ISocialNetwork> {
    return new Map(this.networks);
  }

  // ─── Получить список доступных платформ ───
  getAvailable(): string[] {
    return Array.from(this.networks.keys());
  }

  // ─── Проверить подключена ли платформа ───
  async isConnected(platform: string): Promise<boolean> {
    const network = this.get(platform);
    if (!network) return false;
    return await network.isConnected();
  }

  // ─── Опубликовать в несколько платформ сразу ───
  async publishToMultiple(
    platforms: string[],
    post: any
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const platform of platforms) {
      const network = this.get(platform);
      if (network) {
        results[platform] = await network.publish(post);
      } else {
        results[platform] = {
          success: false,
          error: `Платформа ${platform} не найдена`,
          platform,
          timestamp: Date.now(),
        };
      }
    }

    return results;
  }

  // ─── Удалить адаптер ───
  unregister(platform: string): boolean {
    return this.networks.delete(platform.toLowerCase());
  }

  // ─── Очистить все адаптеры ───
  clear(): void {
    this.networks.clear();
  }

  // ─── Получить количество зарегистрированных платформ ───
  count(): number {
    return this.networks.size;
  }
}

// ─── Глобальный экземпляр реестра ───
export const socialRegistry = new SocialNetworkManager();
