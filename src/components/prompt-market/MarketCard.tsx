import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Play, Zap, FileText, Bot, Eye, ThumbsUp, ThumbsDown, MessageCircle, Flag } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export interface MarketCardData {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  image: string;
  images?: { url: string; type: string; name: string }[];
  rating: number;
  reviewCount?: number;
  price: number | null;
  originalPrice?: number;
  subscriptionOnly?: boolean;
  likes?: number;
  dislikes?: number;
  views?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  type?: "prompt" | "skill" | "agent";
  version?: string;
  description?: string;
  sales?: number;
  status?: string;
}

interface MarketCardProps {
  data: MarketCardData;
  onLike: (id: string) => void;
  onAddToCart: (id: string) => void;
  onQuickView: (id: string) => void;
}

export function MarketCard({ data, onLike, onAddToCart, onQuickView }: MarketCardProps) {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);
  const isFree = data.price === null || data.price === 0;
  const hasDiscount = data.originalPrice && data.originalPrice > (data.price || 0);
  const isSkill = data.type === "skill";
  const isAgent = data.type === "agent";

  const firstMedia = data.images?.[0];
  const isVideo = firstMedia?.type === "video";

  // Загружаем данные при монтировании
  useEffect(() => {
    const userKey = user.email || "anonymous";
    
    // Загружаем реакции из localStorage
    const savedReactions = JSON.parse(localStorage.getItem(`reactions_${data.id}`) || "{}");
    setUserReaction(savedReactions[userKey] || null);
    
    // Подсчитываем лайки/дизлайки
    let likeCount = 0;
    let dislikeCount = 0;
    Object.values(savedReactions).forEach((reaction: any) => {
      if (reaction === 'like') likeCount++;
      if (reaction === 'dislike') dislikeCount++;
    });
    setLikes(likeCount);
    setDislikes(dislikeCount);
    
    // 🔹 ИСПРАВЛЕНИЕ: извлекаем реальный ID (без префикса)
    const realId = data.id.includes("_") ? data.id.split("_").slice(1).join("_") : data.id;
    
    // Загружаем комментарии с правильным ключом
    const comments = JSON.parse(localStorage.getItem(`comments_${realId}`) || "[]");
    setCommentsCount(comments.length);
  }, [data.id, user.email]);

  // 🔹 Лайк/Дизлайк
  const handleReaction = (type: 'like' | 'dislike', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const savedReactions = JSON.parse(localStorage.getItem(`reactions_${data.id}`) || "{}");
    const userKey = user.email || "anonymous";
    const currentReaction = savedReactions[userKey];
    
    if (currentReaction === type) {
      // Убрать реакцию
      delete savedReactions[userKey];
      if (type === 'like') setLikes(prev => Math.max(0, prev - 1));
      else setDislikes(prev => Math.max(0, prev - 1));
      setUserReaction(null);
    } else {
      // Сменить реакцию
      if (currentReaction === 'like' && type === 'dislike') {
        setLikes(prev => Math.max(0, prev - 1));
        setDislikes(prev => prev + 1);
      } else if (currentReaction === 'dislike' && type === 'like') {
        setLikes(prev => prev + 1);
        setDislikes(prev => Math.max(0, prev - 1));
      } else {
        if (type === 'like') setLikes(prev => prev + 1);
        else setDislikes(prev => prev + 1);
      }
      savedReactions[userKey] = type;
      setUserReaction(type);
    }
    
    localStorage.setItem(`reactions_${data.id}`, JSON.stringify(savedReactions));
  };

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

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = e.currentTarget.querySelector('video');
    if (video) {
      if (video.paused) {
        video.play();
        setVideoPlaying(true);
      } else {
        video.pause();
        setVideoPlaying(false);
      }
    }
  };

  const TypeBadge = () => {
    if (isAgent) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full backdrop-blur-sm">
          <Bot className="h-3 w-3" /> AGENT
        </span>
      );
    }
    if (isSkill) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full backdrop-blur-sm">
          <Zap className="h-3 w-3" /> SKILL
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] rounded-full backdrop-blur-sm">
        <FileText className="h-3 w-3" /> PROMPT
      </span>
    );
  };

  const getButtonText = () => {
    if (isFree) {
      if (isAgent) return "Активировать агента";
      if (isSkill) return "Активировать";
      return "Открыть";
    }
    if (data.subscriptionOnly) return "Подписка";
    if (isAgent) return "Купить агента";
    if (isSkill) return "Купить скил";
    return "В корзину";
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group relative">
      
      {/* Media preview */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {isVideo ? (
          <div onClick={handleVideoClick} className="w-full h-full cursor-pointer">
            <video 
              src={firstMedia?.url || data.image} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              muted loop playsInline
            />
            {!videoPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="h-12 w-12 rounded-full bg-card/90 backdrop-blur flex items-center justify-center">
                  <Play className="h-5 w-5 text-foreground ml-0.5" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to={`/prompt/${data.id}`}>
            <img src={data.image} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </Link>
        )}
        
        <div className="absolute top-2 left-2 z-10"><TypeBadge /></div>
        
        <div className="absolute top-2 right-2 z-10">
          {data.subscriptionOnly ? (
            <span className="px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold backdrop-blur-sm">Подписка</span>
          ) : isFree ? (
            <span className="px-2.5 py-1 rounded-lg bg-success/90 text-success-foreground text-xs font-bold backdrop-blur-sm">Бесплатно</span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-card/90 text-foreground text-xs font-bold backdrop-blur-sm">
              {hasDiscount && <span className="line-through text-muted-foreground mr-1">{data.originalPrice} ₽</span>}
              {data.price} ₽
            </span>
          )}
        </div>

        {isVideo && (
          <div className="absolute bottom-2 left-2">
            <span className="px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
              <Play className="h-2.5 w-2.5" /> VIDEO
            </span>
          </div>
        )}
      </div>

      <div className="p-3.5 space-y-2.5">
        {/* Title */}
        <Link to={`/prompt/${data.id}`}>
          <h3 className="text-sm font-semibold leading-tight line-clamp-2 hover:text-primary transition-colors">
            {data.title}
          </h3>
        </Link>

        {/* Краткое описание */}
        {data.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {data.description}
          </p>
        )}

        {/* Author + Version/Status */}
        <div className="flex items-center justify-between">
          <Link to={data.authorId ? `/profile/${data.authorId}` : "#"} className="text-xs text-muted-foreground hover:text-primary transition-colors">
            @{data.author}
          </Link>
          {isSkill && data.version && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v{data.version}</span>
          )}
          {isAgent && data.status && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              data.status === "active" ? "bg-success/10 text-success" :
              data.status === "moderation" ? "bg-warning/10 text-warning" :
              "bg-muted text-muted-foreground"
            }`}>
              {data.status === "active" ? "Активен" : data.status === "moderation" ? "На модерации" : data.status}
            </span>
          )}
        </div>

        {/* РЕАКЦИИ: 👍 12  👎 1  💬 3  👁 6 */}
        <div className="flex items-center justify-between pt-1 border-t border-border/50">
          <div className="flex items-center gap-2.5">
            <button onClick={(e) => handleReaction('like', e)} className={`flex items-center gap-1 text-xs transition-colors ${userReaction === 'like' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>
              <ThumbsUp className={`h-3.5 w-3.5 ${userReaction === 'like' ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
            
            <button onClick={(e) => handleReaction('dislike', e)} className={`flex items-center gap-1 text-xs transition-colors ${userReaction === 'dislike' ? 'text-destructive font-semibold' : 'text-muted-foreground hover:text-destructive'}`}>
              <ThumbsDown className={`h-3.5 w-3.5 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
              <span>{dislikes}</span>
            </button>
            
            <Link to={`/prompt/${data.id}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{commentsCount}</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span>{data.views || 0}</span>
          </div>
        </div>

        {/* Actions - КНОПКА КУПИТЬ + ФЛАЖОК (ИЗБРАННОЕ) */}
        <div className="flex items-center gap-2 pt-1">
          {isFree ? (
            <Link to={`/prompt/${data.id}`} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold text-center hover:opacity-90 transition-opacity">
              {getButtonText()}
            </Link>
          ) : (
            <button onClick={handleCart} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
              <ShoppingCart className="h-3.5 w-3.5" />
              {getButtonText()}
            </button>
          )}
          
          {/* 🔹 ФЛАЖОК - ИЗБРАННОЕ (вместо сердечка) */}
          <button onClick={handleLike} className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${liked ? "border-primary/30 bg-primary/10 text-primary" : "border-border hover:bg-muted text-muted-foreground"}`}>
            <Flag className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}