import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ShoppingCart, Zap, FileText, Bot } from "lucide-react";
import { FilterModal } from "@/components/prompt-market/FilterModal";
import { MarketCard, type MarketCardData } from "@/components/prompt-market/MarketCard";
import { QuickViewModal } from "@/components/prompt-market/QuickViewModal";
import { CartPanel, type CartItem } from "@/components/prompt-market/CartPanel";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";

type SortTab = "new" | "popular" | "rating" | "subscription" | "place";
type ContentType = "all" | "prompt" | "skill" | "agent";

const tabLabels: { key: SortTab; label: string }[] = [
  { key: "new", label: "Новые" },
  { key: "popular", label: "Популярные" },
  { key: "rating", label: "По рейтингу" },
  { key: "subscription", label: "Подписки" },
  { key: "place", label: "Разместить" },
];

const CACHE_KEYS = {
  CARDS: "promptcraft_market_cards",
  CARDS_TIMESTAMP: "promptcraft_market_cards_ts",
  CARDS_EXPIRY_MS: "promptcraft_cache_expiry",
  DEFAULT_EXPIRY: 300000,
};

const CacheUtil = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      const parsed = JSON.parse(item);
      
      if (key.includes('_ts')) {
        const now = Date.now();
        const storedExpiry = localStorage.getItem(CACHE_KEYS.CARDS_EXPIRY_MS);
        const expiry = storedExpiry ? Number(storedExpiry) : CACHE_KEYS.DEFAULT_EXPIRY;
        
        if (typeof parsed === 'number' && now - parsed > expiry) {
          CacheUtil.clear();
          return null;
        }
      }
      return parsed as T;
    } catch {
      return null;
    }
  },
  
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Cache save failed:", e);
    }
  },
  
  clear(): void {
    try {
      localStorage.removeItem(CACHE_KEYS.CARDS);
      localStorage.removeItem(CACHE_KEYS.CARDS_TIMESTAMP);
    } catch (e) {
      console.warn("Cache clear failed:", e);
    }
  },
  
  isFresh(): boolean {
    const ts = CacheUtil.get<number>(CACHE_KEYS.CARDS_TIMESTAMP);
    if (!ts) return false;
    const storedExpiry = localStorage.getItem(CACHE_KEYS.CARDS_EXPIRY_MS);
    const expiry = storedExpiry ? Number(storedExpiry) : CACHE_KEYS.DEFAULT_EXPIRY;
    return Date.now() - ts < expiry;
  }
};

const PLACEHOLDER_IMAGES = {
  prompt: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%233b82f6' width='400' height='300'/%3E%3Ctext fill='white' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24'%3EPrompt%3C/text%3E%3C/svg%3E`,
  skill: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2310b981' width='400' height='300'/%3E%3Ctext fill='white' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24'%3ESkill%3C/text%3E%3C/svg%3E`,
  agent: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%238b5cf6' width='400' height='300'/%3E%3Ctext fill='white' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24'%3EAgent%3C/text%3E%3C/svg%3E`,
};

// 🔹 МИГРАЦИЯ: обновляем authorId на реальный email пользователя
const migrateAuthorData = (currentUser: any) => {
  if (!currentUser?.email) return;
  
  const updateItems = (key: string) => {
    try {
      const items = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = items.map((item: any) => {
        if (item.authorId === "current_user" || item.author === "Вы") {
          return {
            ...item,
            authorId: currentUser.email,
            author: currentUser.name || currentUser.email,
          };
        }
        return item;
      });
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error(`Migration error for ${key}:`, e);
    }
  };
  
  updateItems("promptcraft_prompts");
  updateItems("promptcraft_skills");
  updateItems("promptcraft_agents");
};

const generateMockCards = (_page: number, currentUser: any): MarketCardData[] => {
  const cardsMap = new Map<string, MarketCardData>();
  
  try {
    const prompts = JSON.parse(localStorage.getItem("promptcraft_prompts") || "[]");
    prompts.forEach((p: any) => {
      if (p.status === "published" || p.status === "moderation") {
        const key = `prompt_${p.id}`;
        if (!cardsMap.has(key)) {
          let image = PLACEHOLDER_IMAGES.prompt;
          if (p.media && p.media.length > 0) {
            const firstMedia = p.media[0];
            image = firstMedia.url || PLACEHOLDER_IMAGES.prompt;
          } else if (p.images && p.images.length > 0) {
            image = p.images[0];
          }
          
          cardsMap.set(key, {
            id: key,
            type: "prompt",
            title: p.title || "Без названия",
            author: p.author || currentUser.name || "Вы",
            authorId: p.authorId || currentUser.email || "current_user",
            description: p.description || p.text?.slice(0, 100) || "",
            price: p.price || 0,
            originalPrice: p.originalPrice || undefined,
            subscriptionOnly: p.subscriptionOnly || false,
            rating: p.quality || 5,
            reviewCount: p.reviewCount || 0,
            views: p.views || 0,
            sales: p.sales || 0,
            likes: p.likes || 0,
            tags: p.tags || [p.model || "AI", p.category || "other"],
            image: image,
            images: p.media || p.images || [],
            createdAt: new Date(p.createdAt).toISOString(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
            status: p.status,
            version: p.version || "1.0",
          });
        }
      }
    });
  } catch (e) {
    console.error("Error loading prompts:", e);
  }
  
  try {
    const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
    skills.forEach((s: any) => {
      if (s.status === "active" || s.status === "published") {
        const key = `skill_${s.id}`;
        if (!cardsMap.has(key)) {
          let image = PLACEHOLDER_IMAGES.skill;
          if (s.media && s.media.length > 0) {
            const firstMedia = s.media[0];
            image = firstMedia.url || PLACEHOLDER_IMAGES.skill;
          } else if (s.images && s.images.length > 0) {
            image = s.images[0];
          }
          
          cardsMap.set(key, {
            id: key,
            type: "skill",
            title: s.name || "Без названия",
            author: s.author || currentUser.name || "Вы",
            authorId: s.authorId || currentUser.email || "current_user",
            description: s.description || "",
            price: s.price || 0,
            originalPrice: s.originalPrice || undefined,
            subscriptionOnly: s.subscriptionOnly || false,
            rating: s.rating || 5,
            reviewCount: s.reviewCount || 0,
            views: s.views || s.runCount || 0,
            sales: s.sales || 0,
            likes: s.likes || 0,
            tags: s.tags || ["skill", s.trigger || "manual"],
            image: image,
            images: s.media || s.images || [],
            createdAt: new Date(s.createdAt).toISOString(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : undefined,
            status: s.status,
            version: s.version || "1.0",
          });
        }
      }
    });
  } catch (e) {
    console.error("Error loading skills:", e);
  }
  
  try {
    const agents = JSON.parse(localStorage.getItem("promptcraft_agents") || "[]");
    agents.forEach((a: any) => {
      if (a.status === "active" || a.status === "published") {
        const key = `agent_${a.id}`;
        if (!cardsMap.has(key)) {
          let image = PLACEHOLDER_IMAGES.agent;
          if (a.media && a.media.length > 0) {
            const firstMedia = a.media[0];
            image = firstMedia.url || PLACEHOLDER_IMAGES.agent;
          } else if (a.images && a.images.length > 0) {
            image = a.images[0];
          }
          
          cardsMap.set(key, {
            id: key,
            type: "agent",
            title: a.name || "Без названия",
            author: a.author || currentUser.name || "Вы",
            authorId: a.authorId || currentUser.email || "current_user",
            description: a.description || "",
            price: a.price || 0,
            originalPrice: a.originalPrice || undefined,
            subscriptionOnly: a.subscriptionOnly || false,
            rating: a.rating || 5,
            reviewCount: a.reviewCount || 0,
            views: a.views || a.runCount || 0,
            sales: a.sales || 0,
            likes: a.likes || 0,
            tags: a.tags || ["agent", ...(a.integrations || [])],
            image: image,
            images: a.media || a.images || [],
            createdAt: new Date(a.createdAt).toISOString(),
            updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : undefined,
            status: a.status,
            version: a.version || "1.0",
          });
        }
      }
    });
  } catch (e) {
    console.error("Error loading agents:", e);
  }
  
  const cards = Array.from(cardsMap.values());
  return cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export default function PromptMarket() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { toast } = useToast();
  const [query, setQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<SortTab>("new");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [quickViewItem, setQuickViewItem] = useState<MarketCardData | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const cached = localStorage.getItem("promptcraft_cart");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  
  const [cards, setCards] = useState<MarketCardData[]>(() => {
    const cached = CacheUtil.get<MarketCardData[]>(CACHE_KEYS.CARDS);
    return cached || [];
  });
  
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 🔹 МИГРАЦИЯ ДАННЫХ при загрузке
  useEffect(() => {
    if (user?.email) {
      migrateAuthorData(user);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem("promptcraft_cart", JSON.stringify(cartItems));
    } catch (e) {
      console.warn("Cart save failed:", e);
    }
  }, [cartItems]);

  useEffect(() => {
    if (cards.length > 0) {
      CacheUtil.set(CACHE_KEYS.CARDS, cards);
      CacheUtil.set(CACHE_KEYS.CARDS_TIMESTAMP, Date.now());
    }
  }, [cards]);

  const fetchCards = useCallback(async (pageNum: number, append: boolean = false) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    
    try {
      // 🔹 УБРАНА ИСКУССТВЕННАЯ ЗАДЕРЖКА 500мс (чтобы не моргало)
      const newCards: MarketCardData[] = generateMockCards(pageNum, user);
      
      if (newCards.length === 0) {
        setHasMore(false);
      }
      
      setCards(newCards);
      setPage(pageNum);
      
    } catch (error) {
      console.error("Failed to fetch cards:", error);
      const cached = CacheUtil.get<MarketCardData[]>(CACHE_KEYS.CARDS);
      if (cached && !append) {
        setCards(cached);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, activeTab, user]);

  useEffect(() => {
    fetchCards(1, false);
  }, [activeTab, contentType, user]);

  const handleLike = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    
    const saved = JSON.parse(localStorage.getItem("saved_items") || "[]");
    
    if (saved.includes(id)) {
      const filtered = saved.filter((i: string) => i !== id);
      localStorage.setItem("saved_items", JSON.stringify(filtered));
      toast({ title: "❌ Удалено из избранного" });
    } else {
      saved.push(id);
      localStorage.setItem("saved_items", JSON.stringify(saved));
      toast({ title: "❤️ Добавлено в избранное" });
    }
  };

  const handleAddToCart = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.price === null) return;
    if (cartItems.find((i) => i.id === id)) return;
    
    // 🔹 ИСПРАВЛЕНИЕ: берём реальное фото из images массива
    const realImage = card.images?.[0]?.url || card.image;
    
    setCartItems((prev) => [...prev, { 
      id: card.id, 
      title: card.title, 
      author: card.author, 
      price: card.price!, 
      image: realImage  // ✅ ТЕПЕРЬ РЕАЛЬНОЕ ФОТО
    }]);
  };

  const handleQuickView = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (card) setQuickViewItem(card);
  };

  const totalFilterCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

  const searchedCards = useMemo(() => {
    if (!query.trim()) return cards;
    const q = query.toLowerCase();
    return cards.filter((c) => {
      return c.title.toLowerCase().includes(q) || 
             c.tags?.some((t) => t.toLowerCase().includes(q)) || 
             c.author.toLowerCase().includes(q);
    });
  }, [cards, query]);

  const typeFilteredCards = useMemo(() => {
    if (contentType === "all") return searchedCards;
    return searchedCards.filter((c) => c.type === contentType);
  }, [searchedCards, contentType]);

  const sortedCards = useMemo(() => {
    return [...typeFilteredCards].sort((a, b) => {
      if (activeTab === "new") return b.createdAt.localeCompare(a.createdAt);
      if (activeTab === "popular") return (b.views || 0) - (a.views || 0);
      if (activeTab === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [typeFilteredCards, activeTab]);

  if (activeTab === "place") {
    navigate("/studio");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Prompt Market</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Маркетплейс промтов, скилов и AI-агентов</p>
      
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск промтов, скилов, агентов, моделей..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {totalFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {totalFilterCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setCartOpen(true)}
          className="h-12 w-12 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors relative"
        >
          <ShoppingCart className="h-4 w-4" />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Все", icon: null },
          { key: "prompt", label: "Промты", icon: <FileText className="h-3.5 w-3.5" /> },
          { key: "skill", label: "Скилы", icon: <Zap className="h-3.5 w-3.5" /> },
          { key: "agent", label: "Агенты", icon: <Bot className="h-3.5 w-3.5" /> },
        ].map((ct) => (
          <button
            key={ct.key}
            onClick={() => setContentType(ct.key as ContentType)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              contentType === ct.key
                ? "bg-primary/10 text-primary border border-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {ct.icon}
            {ct.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabLabels.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (tab.key === "place") {
                navigate("/studio");
                return;
              }
              setActiveTab(tab.key);
            }}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedCards.length > 0 ? sortedCards.map((card) => (
          <MarketCard
            key={`${card.type}_${card.id}`}
            data={card}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
          />
        )) : !loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">
              {contentType === "agent" 
                ? "Пока нет AI-агентов. Создайте первого в Studio!" 
                : contentType === "skill"
                ? "Пока нет скилов. Создайте первый в Studio!"
                : contentType === "prompt"
                ? "Пока нет промтов. Опубликуйте первый в Studio!"
                : "Пока нет контента. Опубликуйте первый промт, скил или агента!"}
            </p>
            <button 
              onClick={() => navigate("/studio")}
              className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium"
            >
              Создать в Studio
            </button>
          </div>
        ) : null}
      </div>

      <div ref={loaderRef} className="py-8 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Загрузка...
          </div>
        )}
        {!hasMore && cards.length > 0 && (
          <p className="text-xs text-muted-foreground">Все загружено</p>
        )}
      </div>

      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedFilters={selectedFilters}
        onApply={setSelectedFilters}
      />
      <QuickViewModal
        open={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        data={quickViewItem}
        onAddToCart={handleAddToCart}
      />
      <CartPanel
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={(id) => setCartItems((prev) => prev.filter((i) => i.id !== id))}
        onClear={() => setCartItems([])}
      />
    </div>
  );
}