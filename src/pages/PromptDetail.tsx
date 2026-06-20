import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Bookmark, ArrowLeft, MessageCircle, Trash2, UserPlus, UserCheck, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface MediaFile {
  url: string;
  type: string;
  name: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export default function PromptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const [prompt, setPrompt] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAuthor, setIsAuthor] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

  // 🔹 ФУНКЦИЯ ОЧИСТКИ КЭША МАРКЕТА
  const clearMarketCache = () => {
    localStorage.removeItem("promptcraft_market_cards");
    localStorage.removeItem("promptcraft_market_cards_ts");
  };

  // Загружаем данные
  useEffect(() => {
    if (!id) return;

    const realId = id.includes("_") ? id.split("_").slice(1).join("_") : id;
    const prefix = id.includes("_") ? id.split("_")[0] : "";

    let found: any = null;
    let storageKey = "";

    if (prefix === "prompt" || !prefix) {
      const prompts = JSON.parse(localStorage.getItem("promptcraft_prompts") || "[]");
      found = prompts.find((p: any) => p.id === realId || p.id === id);
      storageKey = "promptcraft_prompts";
    }
    
    if (!found && (prefix === "skill" || !prefix)) {
      const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
      found = skills.find((s: any) => s.id === realId || s.id === id);
      storageKey = "promptcraft_skills";
    }
    
    if (!found && (prefix === "agent" || !prefix)) {
      const agents = JSON.parse(localStorage.getItem("promptcraft_agents") || "[]");
      found = agents.find((a: any) => a.id === realId || a.id === id);
      storageKey = "promptcraft_agents";
    }

    if (found) {
      // УВЕЛИЧИВАЕМ СЧЕТЧИК ПРОСМОТРОВ
      found.views = (found.views || 0) + 1;
      
      const items = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const updatedItems = items.map((item: any) => 
        item.id === found.id ? { ...item, views: found.views } : item
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
      
      setPrompt(found);
      
      // 🔹 ИСПРАВЛЕНИЕ: используем полный ID (с префиксом) для синхронизации
      const fullId = `${prefix}_${realId}`;
      
      // Загружаем реакции с правильным ключом
      const reactions = JSON.parse(localStorage.getItem(`reactions_${fullId}`) || "{}");
      const userKey = user.email || "anonymous";
      setUserReaction(reactions[userKey] || null);
      
      // Подсчитываем лайки/дизлайки
      let likeCount = 0;
      let dislikeCount = 0;
      Object.values(reactions).forEach((reaction: any) => {
        if (reaction === 'like') likeCount++;
        if (reaction === 'dislike') dislikeCount++;
      });
      setLikes(likeCount);
      setDislikes(dislikeCount);
      
      // Проверка автора
      const currentUserEmail = user.email || "";
      const isCurrentUserAuthor = 
        found.authorId === currentUserEmail ||
        found.author === user.name ||
        found.author === currentUserEmail;
      
      setIsAuthor(isCurrentUserAuthor);
      
      const savedComments = JSON.parse(localStorage.getItem(`comments_${realId}`) || "[]");
      setComments(savedComments);

      const saved = JSON.parse(localStorage.getItem("saved_items") || "[]");
      setIsSaved(saved.includes(found.id) || saved.includes(id));

      const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
      const authorEmail = found.authorId || found.author;
      setIsSubscribed(subscriptions.includes(authorEmail));

      const cart = JSON.parse(localStorage.getItem("promptcraft_cart") || "[]");
      setCartItems(cart);
    } else {
      toast({ title: "❌ Элемент не найден", variant: "destructive" });
      setTimeout(() => navigate("/market"), 2000);
    }
  }, [id, navigate, toast, user]);

  // Лайк
  const handleLike = () => {
    if (!prompt) return;
    
    // 🔹 ИСПРАВЛЕНИЕ: используем полный ID
    const fullId = prompt.id.includes("_") ? prompt.id : `${prompt.type || 'prompt'}_${prompt.id}`;
    const reactions = JSON.parse(localStorage.getItem(`reactions_${fullId}`) || "{}");
    const userKey = user.email || "anonymous";
    const currentReaction = reactions[userKey];
    
    if (currentReaction === 'like') {
      delete reactions[userKey];
      setLikes(prev => Math.max(0, prev - 1));
      setUserReaction(null);
    } else {
      if (currentReaction === 'dislike') {
        setDislikes(prev => Math.max(0, prev - 1));
      }
      reactions[userKey] = 'like';
      setLikes(prev => prev + 1);
      setUserReaction('like');
    }
    
    localStorage.setItem(`reactions_${fullId}`, JSON.stringify(reactions));
  };

  // Дизлайк
  const handleDislike = () => {
    if (!prompt) return;
    
    // 🔹 ИСПРАВЛЕНИЕ: используем полный ID
    const fullId = prompt.id.includes("_") ? prompt.id : `${prompt.type || 'prompt'}_${prompt.id}`;
    const reactions = JSON.parse(localStorage.getItem(`reactions_${fullId}`) || "{}");
    const userKey = user.email || "anonymous";
    const currentReaction = reactions[userKey];
    
    if (currentReaction === 'dislike') {
      delete reactions[userKey];
      setDislikes(prev => Math.max(0, prev - 1));
      setUserReaction(null);
    } else {
      if (currentReaction === 'like') {
        setLikes(prev => Math.max(0, prev - 1));
      }
      reactions[userKey] = 'dislike';
      setDislikes(prev => prev + 1);
      setUserReaction('dislike');
    }
    
    localStorage.setItem(`reactions_${fullId}`, JSON.stringify(reactions));
  };

  // Добавление в корзину
  const handleAddToCart = () => {
    if (!prompt) return;
    
    const cart = JSON.parse(localStorage.getItem("promptcraft_cart") || "[]");
    const alreadyInCart = cart.find((item: any) => item.id === prompt.id);
    
    if (alreadyInCart) {
      toast({ title: "⚠️ Уже в корзине", variant: "destructive" });
      return;
    }
    
    // 🔹 ИСПРАВЛЕНИЕ: берём первое медиа из массива
    const mediaUrl = prompt.media?.[0]?.url || prompt.images?.[0] || prompt.image;
    
    cart.push({
      id: prompt.id,
      title: prompt.title,
      author: prompt.author,
      price: prompt.price,
      image: mediaUrl,  // ✅ ТЕПЕРЬ СОХРАНЯЕТСЯ КАРТИНКА
      type: prompt.type,
    });
    
    localStorage.setItem("promptcraft_cart", JSON.stringify(cart));
    setCartItems(cart);
    
    toast({ 
      title: "✅ Добавлено в корзину", 
      description: `${prompt.title} добавлен в корзину` 
    });
  };

  // Удаление для автора
  const handleDelete = () => {
    if (!prompt || !window.confirm("Снять с публикации?")) return;

    const prompts = JSON.parse(localStorage.getItem("promptcraft_prompts") || "[]");
    const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
    const agents = JSON.parse(localStorage.getItem("promptcraft_agents") || "[]");

    localStorage.setItem("promptcraft_prompts", JSON.stringify(prompts.filter((p: any) => p.id !== prompt.id)));
    localStorage.setItem("promptcraft_skills", JSON.stringify(skills.filter((s: any) => s.id !== prompt.id)));
    localStorage.setItem("promptcraft_agents", JSON.stringify(agents.filter((a: any) => a.id !== prompt.id)));

    // 🔹 ОЧИСТКА КЭША МАРКЕТА (чтобы не моргало при возврате)
    clearMarketCache();

    toast({ title: "🗑️ Снято с публикации" });
    navigate("/market");
  };

  // Сохранить в избранное
  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("saved_items") || "[]");
    const itemId = prompt?.id || id;
    
    if (isSaved) {
      const filtered = saved.filter((i: string) => i !== itemId && i !== id);
      localStorage.setItem("saved_items", JSON.stringify(filtered));
    } else {
      if (!saved.includes(itemId)) saved.push(itemId);
      localStorage.setItem("saved_items", JSON.stringify(saved));
    }
    setIsSaved(!isSaved);
    toast({ title: isSaved ? "❌ Удалено из избранного" : "⭐ Добавлено в избранное" });
  };

  // Подписаться на автора
  const handleSubscribe = () => {
    if (!prompt) return;
    
    const authorEmail = prompt.authorId || prompt.author;
    const subscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]");
    
    if (isSubscribed) {
      const filtered = subscriptions.filter((s: string) => s !== authorEmail);
      localStorage.setItem("subscriptions", JSON.stringify(filtered));
      setIsSubscribed(false);
      toast({ title: "🔕 Вы отписались от автора" });
    } else {
      subscriptions.push(authorEmail);
      localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
      setIsSubscribed(true);
      toast({ title: "✅ Вы подписались на автора" });
    }
  };

  // Добавить комментарий
  const handleAddComment = () => {
    if (!newComment.trim() || !prompt) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId: user.email || "current_user",
      userName: user.name || "Вы",
      text: newComment,
      createdAt: new Date().toISOString(),
    };

    const updated = [...comments, comment];
    setComments(updated);
    localStorage.setItem(`comments_${prompt.id}`, JSON.stringify(updated));
    setNewComment("");
    toast({ title: "✅ Комментарий добавлен" });
  };

  if (!prompt) return null;

  const media: MediaFile[] = prompt.media || prompt.images || [];
  const firstMedia = media.length > 0 ? media[0] : null;
  const isVideo = firstMedia?.type === "video";
  const alreadyInCart = cartItems.some(item => item.id === prompt.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/market" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Назад в маркет
      </Link>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Left - Preview */}
        <div className="space-y-3">
          <div className="aspect-video rounded-2xl bg-muted overflow-hidden shadow-card">
            {isVideo ? (
              <video src={firstMedia?.url || prompt.image} className="w-full h-full object-cover" controls autoPlay muted loop playsInline />
            ) : (
              <img src={prompt.image || firstMedia?.url} alt="Preview" className="w-full h-full object-cover" />
            )}
          </div>
          
          {media.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {media.slice(1, 4).map((m, i) => (
                <div key={i} className="aspect-video rounded-lg bg-muted overflow-hidden">
                  {m.type === "video" ? (
                    <video src={m.url} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity cursor-pointer" muted />
                  ) : (
                    <img src={m.url} alt={`Example ${i}`} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity cursor-pointer" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right - Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{prompt.title}</h1>
          <p className="text-muted-foreground">{prompt.description}</p>

          <div className="flex flex-wrap gap-2">
            {(prompt.tags || []).map((t: string) => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{t}</span>
            ))}
          </div>

          {/* 🔹 РЕАКЦИИ КАК В КАРТОЧКАХ */}
          <div className="flex items-center gap-4 text-sm border-t border-border/50 pt-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                userReaction === 'like' 
                  ? 'text-primary font-semibold' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <ThumbsUp className={`h-4 w-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
            
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1.5 transition-colors ${
                userReaction === 'dislike' 
                  ? 'text-destructive font-semibold' 
                  : 'text-muted-foreground hover:text-destructive'
              }`}
            >
              <ThumbsDown className={`h-4 w-4 ${userReaction === 'dislike' ? 'fill-current' : ''}`} />
              <span>{dislikes}</span>
            </button>
            
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </span>
            
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{prompt.views || 0}</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            {alreadyInCart ? (
              <button disabled className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-semibold cursor-not-allowed flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Уже в корзине
              </button>
            ) : (
              <button onClick={handleAddToCart} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <ShoppingCart className="h-4 w-4" /> 
                {prompt.price === 0 || !prompt.price ? "Использовать" : `Купить за ${prompt.price} ₽`}
              </button>
            )}
            
            <button 
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors text-sm font-medium ${
                isSaved ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted"
              }`}
            >
              <Bookmark className="h-4 w-4" /> {isSaved ? "В избранном" : "Сохранить"}
            </button>
            
            {isAuthor && (
              <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium">
                <Trash2 className="h-4 w-4" /> Снять с публикации
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Extended description */}
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">Описание и сценарий использования</h2>
          <div className="bg-card rounded-xl p-5 border border-border text-sm text-muted-foreground space-y-3">
            <p>{prompt.description || "Описание отсутствует"}</p>
          </div>
        </section>

        {/* Comments */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Комментарии ({comments.length})
          </h2>
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Пока нет комментариев. Будьте первым!</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                      {c.userName[0]}
                    </div>
                    <span className="text-sm font-medium">{c.userName}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(c.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.text}</p>
                </div>
              ))
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Написать комментарий..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                Отправить
              </button>
            </div>
          </div>
        </section>

        {/* Author */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Об авторе</h2>
          <div className="bg-card rounded-xl p-4 border border-border flex items-center gap-4">
            {(() => {
              const authorEmail = prompt.authorId || prompt.author;
              let authorAvatar: string | null = null;
              
              if (authorEmail === user.email) {
                authorAvatar = user.avatar;
              } else {
                const users = JSON.parse(localStorage.getItem("promptcraft_users") || "[]");
                const authorProfile = users.find((u: any) => u.email === authorEmail);
                authorAvatar = authorProfile?.avatar || authorProfile?.avatar_url;
              }
              
              if (authorAvatar) {
                return (
                  <img src={authorAvatar} alt={prompt.author} className="h-12 w-12 rounded-full object-cover shadow-lg" />
                );
              } else {
                return (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {prompt.author?.[0]?.toUpperCase() || "A"}
                  </div>
                );
              }
            })()}
            
            <div className="flex-1">
              <h3 className="font-semibold">{prompt.author || "Автор"}</h3>
              <p className="text-sm text-muted-foreground">Создатель контента</p>
            </div>
            
            <div className="flex gap-2">
              {!isAuthor && (
                <button
                  onClick={handleSubscribe}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isSubscribed 
                      ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20" 
                      : "bg-card border border-border hover:bg-muted"
                  }`}
                >
                  {isSubscribed ? (
                    <><UserCheck className="h-4 w-4" /><span>Вы подписаны</span></>
                  ) : (
                    <><UserPlus className="h-4 w-4" /><span>Подписаться</span></>
                  )}
                </button>
              )}
              
              <Link to={`/profile/${prompt.authorId || prompt.author}`} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                Все работы →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}