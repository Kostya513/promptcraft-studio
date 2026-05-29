import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Star, Play, Zap, FileText } from "lucide-react";

export interface MarketCardData {
  id: string;
  title: string;
  author: string;
  authorId: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number | null; // null = free
  originalPrice?: number; // for discount
  subscriptionOnly?: boolean;
  likes: number;
  views: number;
  tags: string[];
  createdAt: string;
  type?: "prompt" | "skill"; // 🔹 НОВОЕ: тип контента
  version?: string; // 🔹 НОВОЕ: версия для скилов
}

interface MarketCardProps {
  data: MarketCardData;
  onLike: (id: string) => void;
  onAddToCart: (id: string) => void;
  onQuickView: (id: string) => void;
}

export function MarketCard({ data, onLike, onAddToCart, onQuickView }: MarketCardProps) {
  const [liked, setLiked] = useState(false);
  const isFree = data.price === null || data.price === 0;
  const hasDiscount = data.originalPrice && data.originalPrice > (data.price || 0);
  const isSkill = data.type === "skill"; // 🔹 Определяем тип

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    onLike(data.id);
  };

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(data.id);
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group relative">
      
      {/* 🔹 Бейдж типа контента (в углу) */}
      <div className="absolute top-2 left-2 z-10">
        {isSkill ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full backdrop-blur-sm">
            <Zap className="h-3 w-3" /> SKILL
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] rounded-full backdrop-blur-sm">
            <FileText className="h-3 w-3" /> PROMPT
          </span>
        )}
      </div>

      {/* Media preview */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        <Link to={`/prompt/${data.id}`}>
          <img src={data.image} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>
        <button
          onClick={() => onQuickView(data.id)}
          className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/20 transition-colors"
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
            <Play className="h-4 w-4 text-foreground" />
          </div>
        </button>
        
        {/* Price badge */}
        <div className="absolute top-2 right-2">
          {data.subscriptionOnly ? (
            <span className="px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold backdrop-blur-sm">
              Подписка
            </span>
          ) : isFree ? (
            <span className="px-2.5 py-1 rounded-lg bg-success/90 text-success-foreground text-xs font-bold backdrop-blur-sm">
              Бесплатно
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-card/90 text-foreground text-xs font-bold backdrop-blur-sm">
              {hasDiscount && (
                <span className="line-through text-muted-foreground mr-1">{data.originalPrice} ₽</span>
              )}
              {data.price} ₽
            </span>
          )}
        </div>
      </div>

      <div className="p-3.5 space-y-2.5">
        {/* Title */}
        <Link to={`/prompt/${data.id}`}>
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors pr-16">
            {data.title}
          </h3>
        </Link>

        {/* Author + Version for skills */}
        <div className="flex items-center justify-between">
          <Link to={`/profile/${data.authorId}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
            @{data.author}
          </Link>
          {isSkill && data.version && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              v{data.version}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 text-warning fill-warning" />
          <span className="font-medium text-foreground">{data.rating}</span>
          <span>({data.reviewCount})</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {isFree ? (
            <Link
              to={`/prompt/${data.id}`}
              className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold text-center hover:opacity-90 transition-opacity"
            >
              {isSkill ? "Активировать" : "Открыть"}
            </Link>
          ) : (
            <button
              onClick={handleCart}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {data.subscriptionOnly ? "Подписка" : isSkill ? "Купить скил" : "В корзину"}
            </button>
          )}
          <button
            onClick={handleLike}
            className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
              liked ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}