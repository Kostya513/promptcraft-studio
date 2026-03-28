import { useState, useEffect, useRef, useCallback } from "react";
import { Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
import { FilterModal } from "@/components/prompt-market/FilterModal";
import { MarketCard, type MarketCardData } from "@/components/prompt-market/MarketCard";
import { QuickViewModal } from "@/components/prompt-market/QuickViewModal";
import { CartPanel, type CartItem } from "@/components/prompt-market/CartPanel";

type SortTab = "new" | "popular" | "rating" | "subscription" | "place";

const tabLabels: { key: SortTab; label: string }[] = [
  { key: "new", label: "Новые" },
  { key: "popular", label: "Популярные" },
  { key: "rating", label: "По рейтингу" },
  { key: "subscription", label: "Подписки" },
  { key: "place", label: "Разместить" },
];

// data will be fetched from the backend; no mock cards by default
const generateMockCards = (page: number): MarketCardData[] => [];

export default function PromptMarket() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SortTab>("new");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [quickViewItem, setQuickViewItem] = useState<MarketCardData | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cards, setCards] = useState<MarketCardData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          // Replace with backend fetch when ready
          setTimeout(() => {
            const nextPage = page + 1;
            // no mock data added
            setPage(nextPage);
            setLoading(false);
          }, 800);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, loading]);

  const handleLike = (id: string) => {
    console.log("Like:", id);
  };

  const handleAddToCart = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.price === null) return;
    if (cartItems.find((i) => i.id === id)) return;
    setCartItems((prev) => [...prev, { id: card.id, title: card.title, author: card.author, price: card.price!, image: card.image }]);
  };

  const handleQuickView = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (card) setQuickViewItem(card);
  };

  const totalFilterCount = Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0);

  // Filter cards by query
  const filteredCards = cards.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q)) || c.author.toLowerCase().includes(q);
  });

  // Sort
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (activeTab === "new") return b.createdAt.localeCompare(a.createdAt);
    if (activeTab === "popular") return b.views - a.views;
    if (activeTab === "rating") return b.rating - a.rating;
    return 0;
  });

  // If "place" tab is active, we show publish page (handled by routing)
  if (activeTab === "place") {
    // We'll redirect to publish page via navigate, but for tab UX just show inline message
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">Prompt Market</h1>
      <p className="text-sm text-muted-foreground mb-6">Маркетплейс промтов и AI-инструментов</p>
      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск промптов, моделей, задач..."
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

      {/* Tabs */}
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
        )) : (
          <p className="text-center text-muted-foreground py-8">Пока нет промтов. Станьте первым автором!</p>
        )}
      </div>

      {/* Infinite scroll loader */}
      <div ref={loaderRef} className="py-8 text-center">
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Загрузка...
          </div>
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
