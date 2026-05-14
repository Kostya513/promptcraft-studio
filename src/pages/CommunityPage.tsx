import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Video, Link2, Send, Loader2, CheckCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ✅ OPTIMIZATION: Утилита для кэширования изображений в localStorage
const ImageCache = {
  get: (url: string): string | null => {
    try {
      const item = localStorage.getItem(`img_cache_${url}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`img_cache_${url}`);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  },
  set: (url: string, data: string): void => {
    try {
      localStorage.setItem(`img_cache_${url}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
      console.warn("Image cache save failed:", e);
    }
  }
};

// ✅ OPTIMIZATION: Компонент изображения с кэшем, lazy loading и fallback
const OptimizedImage: React.FC<{ 
  src: string; 
  alt: string; 
  className?: string; 
  priority?: boolean;
  fallbackIcon?: React.ReactNode;
}> = ({ src, alt, className = "", priority = false, fallbackIcon }) => {
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = ImageCache.get(src);
    if (cached) {
      setCachedSrc(cached);
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (!cachedSrc && src.startsWith("http")) {
      fetch(src)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            ImageCache.set(src, base64);
          };
          reader.readAsDataURL(blob);
        })
        .catch(() => {});
    }
  }, [src, cachedSrc]);

  if (error) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center text-muted-foreground`}>
        {fallbackIcon || <ImageIcon className="h-8 w-8" />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        src={cachedSrc || src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

// ✅ SKELETON: Компонент скелетона для поста
const PostSkeleton = () => (
  <div className="bg-card rounded-xl border border-border p-4 space-y-4 animate-fade-in">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-4 rounded" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="flex items-center justify-between pt-2">
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-8" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
      <Skeleton className="h-4 w-4 rounded" />
    </div>
  </div>
);

// ✅ SKELETON: Компонент скелетона для комментария
const CommentSkeleton = () => (
  <div className="flex gap-3 py-3">
    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
);

// ✅ ТИПЫ ДАННЫХ
type Post = {
  id: string;
  author: { name: string; avatar?: string; verified?: boolean };
  content: string;
  image?: string;
  video?: string;
  link?: { title: string; url: string; preview?: string };
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  createdAt: string;
  liked?: boolean;
  bookmarked?: boolean;
  tags?: string[];
};

type Comment = {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  createdAt: string;
  likes: number;
};

// ✅ МОКОВЫЕ ДАННЫЕ (сохранены для локальной разработки)
const mockPosts: Post[] = [];
const mockComments: Record<string, Comment[]> = {};

export default function CommunityPage() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "popular" | "recent">("recent");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  // ✅ OPTIMIZATION: Загрузка постов с retry и обработкой ошибок
  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      // Используем apiClient с автоматическим retry
      // В продакшене раскомментируй:
      /*
      const data = await apiClient.get<Post[]>(
        `/api/community/posts?page=${pageNum}&filter=${activeFilter}`,
        { maxRetries: 3, retryDelay: 1000 }
      );
      */
      
      // Пока имитация:
      await new Promise(resolve => setTimeout(resolve, 800));
      const data: Post[] = []; // mockPosts
      
      if (data.length === 0 && pageNum > 1) {
        setHasMore(false);
      }
      
      setPosts(prev => append ? [...prev, ...data] : data);
      setPage(pageNum);
      
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      toast({ 
        title: "Ошибка загрузки ленты", 
        description: error instanceof Error ? error.message : "Проверьте подключение к интернету",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter, page]);

  // Initial load
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // ✅ OPTIMIZATION: Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          fetchPosts(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, loadingMore, hasMore, fetchPosts]);

  // ✅ OPTIMIZATION: Мемоизация фильтрации и сортировки
  const filteredPosts = useMemo(() => {
    let result = [...posts];
    
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(p => 
        p.content.toLowerCase().includes(q) || 
        p.author.name.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    
    if (activeFilter === "popular") {
      result.sort((a, b) => b.likes - a.likes);
    } else if (activeFilter === "recent") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return result;
  }, [posts, query, activeFilter]);

  // ✅ OPTIMIZATION: Оптимистичный лайк с откатом при ошибке
  const handleLike = async (postId: string) => {
    const originalPosts = [...posts];
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
    
    try {
      // В продакшене: await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      setPosts(originalPosts);
      toast({ title: "Не удалось поставить лайк", variant: "destructive" });
    }
  };

  // ✅ OPTIMIZATION: Оптимистичное сохранение в закладки
  const handleBookmark = async (postId: string) => {
    const originalPosts = [...posts];
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, bookmarked: !p.bookmarked, bookmarks: p.bookmarked ? p.bookmarks - 1 : p.bookmarks + 1 } : p
    ));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      setPosts(originalPosts);
      toast({ title: "Не удалось сохранить пост", variant: "destructive" });
    }
  };

  // ✅ OPTIMIZATION: Шаринг с fallback для десктопа
  const handleShare = (post: Post) => {
    const shareData = {
      title: "Промпт-Студия",
      text: post.content,
      url: `${window.location.origin}/community?post=${post.id}`
    };
    
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({ 
        title: "Ссылка скопирована", 
        description: "Поделитесь постом в любом мессенджере",
        action: <CheckCircle className="h-4 w-4 text-success" />
      });
    }
  };

  // ✅ OPTIMIZATION: Загрузка комментариев с skeleton
  const loadComments = async (postId: string) => {
    if (comments[postId]) return;
    
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // В продакшене: const res = await fetch(`/api/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: mockComments[postId] || [] }));
    } catch (error) {
      toast({ title: "Ошибка загрузки комментариев", variant: "destructive" });
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  // ✅ OPTIMIZATION: Оптимистичное добавление комментария
  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    
    const optimisticComment: Comment = {
      id: `temp_${Date.now()}`,
      author: { name: user?.name || "Вы", avatar: user?.avatar },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), optimisticComment]
    }));
    setNewComment("");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      // В продакшене: await fetch(`/api/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content: newComment }) });
    } catch (error) {
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.filter(c => c.id !== optimisticComment.id)
      }));
      toast({ title: "Не удалось опубликовать комментарий", variant: "destructive" });
    }
  };

  // ✅ OPTIMIZATION: Создание поста с валидацией и прогрессом
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast({ title: "Напишите содержание поста", variant: "destructive" });
      return;
    }
    
    setPosting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPost: Post = {
        id: `new_${Date.now()}`,
        author: { name: user?.name || "Вы", avatar: user?.avatar, verified: true },
        content: newPostContent,
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0,
        createdAt: new Date().toISOString(),
        liked: false,
        bookmarked: false
      };
      
      setPosts(prev => [newPost, ...prev]);
      setNewPostContent("");
      setNewPostImage(null);
      setShowCreatePost(false);
      
      toast({ title: "Пост опубликован", description: "Ваш пост появился в ленте" });
      
    } catch (error) {
      toast({ title: "Ошибка публикации", description: "Попробуйте позже", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  // ✅ Утилита форматирования времени
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString("ru-RU");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сообщество</h1>
        <Button onClick={() => setShowCreatePost(true)} className="gradient-primary">
          Создать пост
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по постам..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: "recent", label: "Новые" },
            { key: "popular", label: "Популярные" },
            { key: "all", label: "Все" }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => { setActiveFilter(filter.key as any); fetchPosts(1, false); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? "gradient-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreatePost(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Новый пост</h3>
              <button onClick={() => setShowCreatePost(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <span className="text-lg">×</span>
              </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="О чём думаете?"
                className="flex-1 min-h-[100px] p-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            
            {newPostImage && (
              <div className="relative mb-4">
                <OptimizedImage
                  src={URL.createObjectURL(newPostImage)}
                  alt="preview"
                  className="h-48 rounded-xl"
                  priority
                />
                <button
                  onClick={() => { setNewPostImage(null); URL.revokeObjectURL(URL.createObjectURL(newPostImage)); }}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex gap-2">
                <label className="cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast({ title: "Файл слишком большой", description: "Максимум 10 МБ", variant: "destructive" });
                          return;
                        }
                        setNewPostImage(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Video className="h-5 w-5 text-muted-foreground" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <Button
                onClick={handleCreatePost}
                disabled={posting || !newPostContent.trim()}
                className="gradient-primary"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Опубликовать
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {/* ✅ SKELETON: Первая загрузка */}
        {loading && posts.length === 0 ? (
          [...Array(3)].map((_, i) => <PostSkeleton key={i} />)
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">
              {query ? "Ничего не найдено" : "Пока нет постов. Будьте первым!"}
            </p>
            {!query && (
              <Button onClick={() => setShowCreatePost(true)} variant="outline">
                Создать первый пост
              </Button>
            )}
          </div>
        ) : (
          filteredPosts.map(post => (
            <article key={post.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} loading="lazy" />
                    <AvatarFallback>{post.author.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm">{post.author.name}</span>
                      {post.author.verified && (
                        <span className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-[10px] text-primary-foreground">✓</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Post Content */}
              <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Post Media */}
              {post.image && (
                <div className="mb-3 rounded-xl overflow-hidden">
                  <OptimizedImage src={post.image} alt="post image" className="h-64" />
                </div>
              )}
              
              {post.link && (
                <a
                  href={post.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted/80 transition-colors mb-3"
                >
                  {post.link.preview && (
                    <OptimizedImage src={post.link.preview} alt={post.link.title} className="h-32 rounded-lg mb-2" />
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-primary hover:underline truncate">{post.link.title}</span>
                  </div>
                </a>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      post.liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => {
                      setExpandedPost(expandedPost === post.id ? null : post.id);
                      if (expandedPost !== post.id) loadComments(post.id);
                    }}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </button>
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>{post.shares}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    post.bookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {post.bookmarked ? <BookmarkCheck className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="space-y-3">
                    {loadingComments[post.id] && !comments[post.id] ? (
                      [...Array(2)].map((_, i) => <CommentSkeleton key={i} />)
                    ) : comments[post.id]?.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} loading="lazy" />
                          <AvatarFallback>{comment.author.name[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted/30 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.author.name}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 pt-3 border-t border-border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                        placeholder="Написать комментарий..."
                        className="flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment.trim()}
                        className="p-2 rounded-xl gradient-primary text-primary-foreground disabled:opacity-40"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))
        )}

        {/* ✅ SKELETON: Бесконечная прокрутка */}
        {loadingMore && (
          <div className="py-4">
            <PostSkeleton />
          </div>
        )}
        
        <div ref={loaderRef} className="h-1" />
        
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">Все посты загружены</p>
        )}
      </div>
    </div>
  );
}