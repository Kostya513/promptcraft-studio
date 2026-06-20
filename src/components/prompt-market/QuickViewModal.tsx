import { useState } from "react";
import { X, Star, ShoppingCart, Play } from "lucide-react";
import { Link } from "react-router-dom";
import type { MarketCardData } from "./MarketCard";

interface QuickViewModalProps {
  open: boolean;
  onClose: () => void;
  data: MarketCardData | null;
  onAddToCart: (id: string) => void;
}

export function QuickViewModal({ open, onClose, data, onAddToCart }: QuickViewModalProps) {
  if (!open || !data) return null;

  const isFree = data.price === null || data.price === 0;
  
  // 🔹 Проверяем есть ли видео
  const firstMedia = data.images && data.images.length > 0 ? data.images[0] : null;
  const isVideo = firstMedia?.type === "video";

  const handleAddToCart = () => {
    onAddToCart(data.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-elevated flex flex-col animate-slide-up overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-lg bg-card/80 backdrop-blur hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Media - Video или Image */}
        <div className="aspect-video bg-muted overflow-hidden">
          {isVideo ? (
            <video
              src={firstMedia?.url || data.image}
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          )}
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          <h2 className="text-lg font-bold">{data.title}</h2>
          <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            @{data.author}
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" /> {data.rating}
              <span className="text-muted-foreground">({data.reviewCount})</span>
            </span>
          </div>

          {/* Description */}
          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {data.tags && data.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{tag}</span>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            {isFree ? (
              <Link
                to={`/prompt/${data.id}`}
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              >
                {data.type === "agent" ? "Активировать агента" : data.type === "skill" ? "Активировать" : "Открыть"}
              </Link>
            ) : (
              <>
                <span className="text-lg font-bold">{data.price} ₽</span>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="h-4 w-4" /> {data.type === "agent" ? "Купить агента" : data.type === "skill" ? "Купить скил" : "В корзину"}
                </button>
              </>
            )}
            <Link
              to={`/prompt/${data.id}`}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}