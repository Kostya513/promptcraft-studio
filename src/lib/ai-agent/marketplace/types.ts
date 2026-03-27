// src/lib/ai-agent/marketplace/types.ts
// Общие типы для всех маркетплейсов

// Товар (карточка промта)
export interface MarketplaceProduct {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  tags: string[];
  sku?: string;
  stock?: number;
  status: 'draft' | 'active' | 'paused' | 'deleted';
}

// Результат операции
export interface MarketplaceResult {
  success: boolean;
  productId?: string;
  productUrl?: string;
  error?: string;
  marketplace: string;
  timestamp: number;
}

// Статистика товара
export interface ProductStats {
  views: number;
  clicks: number;
  orders: number;
  revenue: number;
  rating: number;
  reviews: number;
  conversionRate: number;
}

// Заказ
export interface Order {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerName?: string;
  createdAt: Date;
}

// Конфигурация маркетплейса
export interface MarketplaceConfig {
  marketplace: string;
  credentials: Record<string, string>;
  settings?: Record<string, any>;
}

// Интерфейс для ВСЕХ маркетплейсов
export interface IMarketplace {
  getMarketplace(): string;
  isConnected(): Promise<boolean>;
  createProduct(product: MarketplaceProduct): Promise<MarketplaceResult>;
  updateProduct(productId: string, product: Partial<MarketplaceProduct>): Promise<MarketplaceResult>;
  deleteProduct(productId: string): Promise<boolean>;
  getProduct(productId: string): Promise<MarketplaceProduct | null>;
  getProducts(limit?: number): Promise<MarketplaceProduct[]>;
  getStats(productId?: string): Promise<ProductStats>;
  getOrders(status?: string): Promise<Order[]>;
  updatePrice(productId: string, price: number): Promise<MarketplaceResult>;
  updateStock(productId: string, stock: number): Promise<MarketplaceResult>;
  getReviews(productId?: string): Promise<any[]>;
}

// Реестр маркетплейсов
export interface MarketplaceRegistry {
  register(marketplace: string, adapter: IMarketplace): void;
  get(marketplace: string): IMarketplace | null;
  getAll(): Map<string, IMarketplace>;
  getAvailable(): string[];
}
