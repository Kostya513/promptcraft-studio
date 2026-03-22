// src/lib/ai-agent/marketplace/index.ts
// Marketplace модуль — единая точка входа

// ─── Типы ───
export {
  IMarketplace,
  MarketplaceProduct,
  MarketplaceResult,
  ProductStats,
  Order,
  MarketplaceConfig,
  MarketplaceRegistry,
} from './types';

// ─── Адаптеры ───
export { WildberriesAdapter, createWildberriesAdapter } from './wildberries';
export { OzonAdapter, createOzonAdapter } from './ozon';
export { YandexMarketAdapter, createYandexMarketAdapter } from './yandex-market';
export { AvitoAdapter, createAvitoAdapter } from './avito';
export { LamodaAdapter, createLamodaAdapter } from './lamoda';
export { MegamarketAdapter, createMegamarketAdapter } from './megamarket';

// ─── Реестр маркетплейсов ───
class MarketplaceManager implements MarketplaceRegistry {
  private marketplaces: Map<string, IMarketplace> = new Map();

  register(marketplace: string, adapter: IMarketplace): void {
    this.marketplaces.set(marketplace.toLowerCase(), adapter);
    console.log(`[MarketplaceRegistry] Зарегистрирован: ${marketplace}`);
  }

  get(marketplace: string): IMarketplace | null {
    return this.marketplaces.get(marketplace.toLowerCase()) || null;
  }

  getAll(): Map<string, IMarketplace> {
    return new Map(this.marketplaces);
  }

  getAvailable(): string[] {
    return Array.from(this.marketplaces.keys());
  }

  async isConnected(marketplace: string): Promise<boolean> {
    const adapter = this.get(marketplace);
    if (!adapter) return false;
    return await adapter.isConnected();
  }

  count(): number {
    return this.marketplaces.size;
  }
}

// ─── Глобальный экземпляр реестра ───
export const marketplaceRegistry = new MarketplaceManager();

// ─── Фабрика для создания адаптеров ───
export function createMarketplaceAdapter(
  marketplace: string,
  config: MarketplaceConfig
): IMarketplace | null {
  switch (marketplace.toLowerCase()) {
    case 'wildberries':
    case 'wb':
    case 'валдбериз':
      return createWildberriesAdapter(config);
    
    case 'ozon':
    case 'озон':
      return createOzonAdapter(config);
    
    case 'yandex-market':
    case 'яндекс.маркет':
    case 'яндекс':
    case 'ym':
      return createYandexMarketAdapter(config);
    
    case 'avito':
    case 'авито':
      return createAvitoAdapter(config);
    
    case 'lamoda':
    case 'ламода':
      return createLamodaAdapter(config);
    
    case 'megamarket':
    case 'мегамаркет':
    case 'мм':
    case 'sber':
      return createMegamarketAdapter(config);
    
    default:
      console.warn(`Неизвестный маркетплейс: ${marketplace}. Доступны: Wildberries, Ozon, Яндекс.Маркет, Avito, Lamoda, Мегамаркет`);
      return null;
  }
}

// ─── Быстрое подключение маркетплейса ───
export async function connectMarketplace(
  marketplace: string,
  credentials: Record<string, string>
): Promise<boolean> {
  const config: MarketplaceConfig = {
    marketplace,
    credentials,
  };

  const adapter = createMarketplaceAdapter(marketplace, config);
  if (!adapter) return false;

  marketplaceRegistry.register(marketplace, adapter);
  return await adapter.isConnected();
}

// ─── Создать товар в маркетплейсе ───
export async function createProduct(
  marketplace: string,
  product: MarketplaceProduct
): Promise<MarketplaceResult> {
  const adapter = marketplaceRegistry.get(marketplace);
  if (!adapter) {
    return {
      success: false,
      error: `Маркетплейс ${marketplace} не подключён`,
      marketplace,
      timestamp: Date.now(),
    };
  }

  return await adapter.createProduct(product);
}

// ─── Создать товар во всех подключённых маркетплейсах ───
export async function createProductToAll(
  product: MarketplaceProduct
): Promise<Record<string, MarketplaceResult>> {
  const results: Record<string, MarketplaceResult> = {};
  const available = marketplaceRegistry.getAvailable();

  for (const marketplace of available) {
    const adapter = marketplaceRegistry.get(marketplace);
    if (adapter) {
      results[marketplace] = await adapter.createProduct(product);
    }
  }

  return results;
}

// ─── Получить статистику ───
export async function getMarketplaceStats(
  marketplace: string,
  productId?: string
): Promise<ProductStats> {
  const adapter = marketplaceRegistry.get(marketplace);
  if (!adapter) {
    return {
      views: 0,
      clicks: 0,
      orders: 0,
      revenue: 0,
      rating: 0,
      reviews: 0,
      conversionRate: 0,
    };
  }

  return await adapter.getStats(productId);
}

// ─── Получить заказы ───
export async function getOrders(
  marketplace: string,
  status?: string
): Promise<Order[]> {
  const adapter = marketplaceRegistry.get(marketplace);
  if (!adapter) return [];

  return await adapter.getOrders(status);
}

// ─── Получить все заказы со всех маркетплейсов ───
export async function getAllOrders(
  status?: string
): Promise<Record<string, Order[]>> {
  const results: Record<string, Order[]> = {};
  const available = marketplaceRegistry.getAvailable();

  for (const marketplace of available) {
    const adapter = marketplaceRegistry.get(marketplace);
    if (adapter) {
      results[marketplace] = await adapter.getOrders(status);
    }
  }

  return results;
}
