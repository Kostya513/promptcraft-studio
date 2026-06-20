export interface MarketplaceItem {
  id: string;
  type: "prompt" | "skill" | "agent";
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  status: "draft" | "moderation" | "published" | "rejected";
  createdAt: string;
  updatedAt: string;
  data: any;
}

const STORAGE_KEY = "promptcraft_marketplace";

export function getMarketplaceItems(): MarketplaceItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveMarketplaceItems(items: MarketplaceItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function publishToMarketplace(item: Omit<MarketplaceItem, "id" | "createdAt" | "updatedAt" | "status">): MarketplaceItem {
  const items = getMarketplaceItems();
  const newItem: MarketplaceItem = {
    ...item,
    id: `item_${Date.now()}`,
    status: "moderation",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  saveMarketplaceItems(items);
  return newItem;
}

export function updateMarketplaceItem(id: string, updates: Partial<MarketplaceItem>): void {
  const items = getMarketplaceItems();
  const updated = items.map(item => 
    item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
  );
  saveMarketplaceItems(updated);
}

export function deleteFromMarketplace(id: string): void {
  const items = getMarketplaceItems().filter(item => item.id !== id);
  saveMarketplaceItems(items);
}