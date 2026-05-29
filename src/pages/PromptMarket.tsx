import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, SlidersHorizontal, ShoppingCart, Zap, FileText } from "lucide-react";
import { FilterModal } from "@/components/prompt-market/FilterModal";
import { MarketCard, type MarketCardData } from "@/components/prompt-market/MarketCard";
import { QuickViewModal } from "@/components/prompt-market/QuickViewModal";
import { CartPanel, type CartItem } from "@/components/prompt-market/CartPanel";

type SortTab = "new" | "popular" | "rating" | "subscription" | "place";
type ContentType = "all" | "prompt" | "skill"; // 🔹 НОВОЕ

const tabLabels: { key: SortTab; label: string }[] = [
  { key: "new", label: "Новые" },
  { key: "popular", label: "Популярные" },
  { key: "rating", label: "По рейтингу" },
  { key: "subscription", label: "Подписки" },
  { key: "place", label: "Разместить" },
];

// ✅ OPTIMIZATION: Ключи для кэширования
const CACHE_KEYS = {
  CARDS: "promptcraft_market_cards",
  CARDS_TIMESTAMP: "promptcraft_market_cards_ts",
  CARDS_EXPIRY_MS: "promptcraft_cache_expiry",
  DEFAULT_EXPIRY: 300000, // 5 минут
};

// ✅ OPTIMIZATION: Утилита для работы с кэшем
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

const generateMockCards = (_page: number): MarketCardData[] => [];

export default function PromptMarket() {
  const [query, setQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<SortTab>("new");
  const [contentType, setContentType] = useState<ContentType>("all"); // 🔹 НОВОЕ
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
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCards: MarketCardData[] = generateMockCards(pageNum);
      
      if (newCards.length === 0) {
        setHasMore(false);
      }
      
      setCards(prev => append ? [...prev, ...newCards] : newCards);
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
  }, [loading, hasMore, activeTab]);

  useEffect(() => {
    if (cards.length === 0 && !CacheUtil.isFresh()) {
      fetchCards(1, false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const nextPage: number = page + 1;
          fetchCards(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, loading, hasMore, fetchCards]);

  useEffect(() => {
    if (activeTab !== "place") {
      if (CacheUtil.isFresh() && cards.length > 0) {
        return;
      }
      fetchCards(1, false);
    }
  }, [activeTab]);

  const handleLike = (id: string) => {
    console.log("Like:", id);
  };

  const handleAddToCart = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.price === null) return;
    if (cartItems.find((i) => i.id === id)) return;
    
    setCartItems((prev) => [...prev, { 
      id: card.id, 
      title: card.title, 
      author: card.author, 
      price: card.price!, 
      image: card.image 
    }]);
  };

  const handleQuickView = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (card) setQuickViewItem(card);
  };

  const totalFilterCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

  // 🔹 Фильтрация по поиску
  const searchedCards = useMemo(() => {
    if (!query.trim()) return cards;
    const q = query.toLowerCase();
    return cards.filter((c) => {
      return c.title.toLowerCase().includes(q) || 
             c.tags.some((t) => t.toLowerCase().includes(q)) || 
             c.author.toLowerCase().includes(q);
    });
  }, [cards, query]);

  // 🔹 Фильтрация по типу контента (промт/скил)
  const typeFilteredCards = useMemo(() => {
    if (contentType === "all") return searchedCards;
    return searchedCards.filter((c) => c.type === contentType);
  }, [searchedCards, contentType]);

  // 🔹 Сортировка
  const sortedCards = useMemo(() => {
    return [...typeFilteredCards].sort((a, b) => {
      if (activeTab === "new") return b.createdAt.localeCompare(a.createdAt);
      if (activeTab === "popular") return b.views - a.views;
      if (activeTab === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [typeFilteredCards, activeTab]);

  if (activeTab === "place") {
    window.location.href = "/publish";
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Prompt Market</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">Маркетплейс промтов и AI-инструментов</p>
      
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск промптов, скилов, моделей..."
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

      {/* 🔹 Фильтр типа контента: [Все] [Промты] [Скилы] */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Все", icon: null },
          { key: "prompt", label: "Промты", icon: <FileText className="h-3.5 w-3.5" /> },
          { key: "skill", label: "Скилы", icon: <Zap className="h-3.5 w-3.5" /> },
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

      {/* Tabs сортировки */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabLabels.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (tab.key === "place") {
                window.location.href = "/publish";
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

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedCards.length > 0 ? sortedCards.map((card) => (
          <MarketCard
            key={card.id}
            data={card}
            onLike={handleLike}
            onAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
          />
        )) : !loading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">
              {contentType === "skill" 
                ? "Пока нет скилов. Создайте первый в Studio!" 
                : contentType === "prompt"
                ? "Пока нет промтов. Станьте первым автором!"
                : "Пока нет контента. Опубликуйте первый промт или скил!"}
            </p>
            <a href="/publish" className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">
              Опубликовать
            </a>
          </div>
        ) : null}
      </div>

      {/* Infinite scroll loader */}
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

      {/* Modals */}
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