import { useState, useEffect, useRef } from "react";
import { 
  Search, Heart, MessageCircle, Share2, MoreHorizontal, 
  Image as ImageIcon, Video, Link2, Send, Loader2, 
  CheckCircle, Bookmark, X, Pencil, Trash2, Pin,
  ExternalLink
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ============================================
// КОНСТАНТЫ И ТИПЫ
// ============================================

const API_URL = 'http://localhost:3000/api';

type Post = {
  id: string;
  author: { 
    name: string; 
    avatar?: string; 
    verified?: boolean 
  };
  title: string;
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
  bookmarked?: boolean;
  isPinned?: boolean;
  authorId: string;
};

type Comment = {
  id: string;
  author: { 
    name: string; 
    avatar?: string 
  };
  content: string;
  createdAt: string;
  likes: number;
};

// ============================================
// API ФУНКЦИИ
// ============================================

const apiRequest = async (endpoint: string, options?: RequestInit) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// ============================================
// ОСНОВНОЙ КОМПОНЕНТ
// ============================================

export default function CommunityPage() {
  const { user } = useUser();
  
  // Состояния
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState(""); 
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [newPostVideo, setNewPostVideo] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "popular" | "recent">("recent");
  
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================
  
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/posts');
      
      if (response.success && Array.isArray(response.data)) {
        // Преобразуем данные с бэкенда в формат фронтенда
        const mappedPosts: Post[] = response.data.map((post: any) => ({
          id: post.id,
          author: {
            name: post.authorName || 'Пользователь',
            avatar: post.authorAvatar || undefined,
            verified: post.authorVerified === 'true' || post.authorVerified === true
          },
          title: post.title || '',
          content: post.content || '',
          image: post.image || undefined,
          video: post.video || undefined,
          likes: typeof post.likes === 'number' ? post.likes : 0,
          comments: typeof post.comments === 'number' ? post.comments : 0,
          shares: typeof post.shares === 'number' ? post.shares : 0,
          createdAt: post.createdAt,
          isPinned: post.isPinned === true || post.isPinned === 'true',
          authorId: String(post.authorId) || 'unknown'
        }));
        
        setPosts(mappedPosts);
      } else {
        console.error('Unexpected API response:', response);
        setPosts([]);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
      toast({ 
        title: "Ошибка загрузки", 
        description: error instanceof Error ? error.message : "Не удалось загрузить посты", 
        variant: "destructive" 
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Закрытие меню при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================
  // ОБРАБОТЧИКИ ФАЙЛОВ
  // ============================================

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Файл слишком большой", description: "Максимум 10 МБ", variant: "destructive" });
        return;
      }
      setNewPostImage(file);
      if (newPostVideo) { 
        setNewPostVideo(null); 
        setVideoPreview(null); 
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "Видео слишком большое", description: "Максимум 50 МБ", variant: "destructive" });
        return;
      }
      if (!file.type.startsWith('video/')) {
        toast({ title: "Неверный формат", description: "Загрузите видео файл", variant: "destructive" });
        return;
      }
      setNewPostVideo(file);
      if (newPostImage) { 
        setNewPostImage(null); 
        setImagePreview(null); 
      }
      const reader = new FileReader();
      reader.onloadend = () => setVideoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => { 
    setImagePreview(null); 
    setNewPostImage(null); 
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const removeVideoPreview = () => { 
    setVideoPreview(null); 
    setNewPostVideo(null); 
    if (videoInputRef.current) videoInputRef.current.value = ""; 
  };

  // ============================================
  // СОЗДАНИЕ И РЕДАКТИРОВАНИЕ ПОСТА
  // ============================================

  const handleSavePost = async () => {
    if (!newPostContent.trim() && !newPostImage && !newPostVideo) {
      toast({ title: "Добавьте текст, изображение или видео", variant: "destructive" });
      return;
    }

    setPosting(true);

    try {
      if (editingPost) {
        // Редактирование существующего поста
        const response = await fetch(`${API_URL}/posts/${editingPost.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: newPostTitle,
            content: newPostContent,
          }),
        });

        const result = await response.json();
        if (result.success) {
          await loadPosts();
          toast({ title: "Пост обновлен" });
        } else {
          throw new Error(result.error || 'Failed to update post');
        }
      } else {
        // Создание нового поста через FormData
        const formData = new FormData();
        formData.append('title', newPostTitle || '');
        formData.append('content', newPostContent);
        formData.append('authorName', user?.name || 'Вы');
        formData.append('authorAvatar', user?.avatar || '');
        formData.append('authorVerified', 'true');
        // ✅ ИСПРАВЛЕНИЕ: Преобразуем id в строку
        formData.append('authorId', String(user?.id) || 'demo_user');
        
        if (newPostImage) {
          formData.append('media', newPostImage);
        } else if (newPostVideo) {
          formData.append('media', newPostVideo);
        }

        const response = await fetch(`${API_URL}/posts`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          await loadPosts();
          toast({ title: "Пост опубликован" });
        } else {
          throw new Error(result.error || 'Failed to create post');
        }
      }

      // Очистка формы
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostImage(null); 
      setNewPostVideo(null);
      setImagePreview(null); 
      setVideoPreview(null);
      setShowCreatePost(false);
      setEditingPost(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      
    } catch (error) {
      console.error('Save post error:', error);
      toast({ 
        title: "Ошибка", 
        description: error instanceof Error ? error.message : "Не удалось сохранить пост", 
        variant: "destructive" 
      });
    } finally {
      setPosting(false);
    }
  };

  // ============================================
  // УПРАВЛЕНИЕ ПОСТАМИ
  // ============================================

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Удалить этот пост?")) return;

    try {
      const response = await apiRequest(`/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setActiveMenu(null);
        toast({ title: "Пост удален" });
      }
    } catch (error) {
      console.error('Delete post error:', error);
      toast({ title: "Ошибка при удалении", variant: "destructive" });
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setShowCreatePost(true);
    setActiveMenu(null);
  };

  const handlePinPost = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    ));
    setActiveMenu(null);
    toast({ title: "Пост закреплен" });
  };

  const handleLike = async (postId: string) => {
    try {
      const response = await apiRequest(`/posts/${postId}/like`, {
        method: 'PUT',
      });

      if (response.success) {
        setPosts(prev => prev.map(p => 
          p.id === postId 
            ? { ...p, likes: response.data.likes, liked: !p.liked }
            : p
        ));
      }
    } catch (error) {
      console.error('Like error:', error);
      // Fallback: локальное обновление
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      ));
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      author: { name: user?.name || "Вы", avatar: user?.avatar },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setComments(prev => ({ 
      ...prev, 
      [postId]: [...(prev[postId] || []), comment] 
    }));

    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, comments: p.comments + 1 } : p
    ));

    setNewComment("");
  };

  const handleShare = async (post: Post) => {
    try {
      await apiRequest(`/posts/${post.id}/share`, {
        method: 'PUT',
      });
      
      setPosts(prev => prev.map(p => 
        p.id === post.id ? { ...p, shares: p.shares + 1 } : p
      ));

      const shareData = {
        title: post.title || "Пост в Промпт-Студии",
        text: post.content,
        url: `${window.location.origin}/community?post=${post.id}`
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch {
          navigator.clipboard.writeText(shareData.url);
          toast({ title: "Ссылка скопирована" });
        }
      } else {
        navigator.clipboard.writeText(shareData.url);
        toast({ title: "Ссылка скопирована" });
      }
    } catch (error) {
      console.error('Share error:', error);
      navigator.clipboard.writeText(`${window.location.origin}/community?post=${post.id}`);
      toast({ title: "Ссылка скопирована" });
    }
  };

  // ============================================
  // УТИЛИТЫ
  // ============================================

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "недавно";
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

  const filteredPosts = posts.filter(post => {
    if (searchQuery && (
      !post.content.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !post.title.toLowerCase().includes(searchQuery.toLowerCase())
    )) return false;
    return true;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (filter === "popular") return b.likes - a.likes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const openCreateModal = () => {
    setEditingPost(null); 
    setNewPostTitle(""); 
    setNewPostContent(""); 
    setImagePreview(null); 
    setVideoPreview(null);
    setNewPostImage(null); 
    setNewPostVideo(null); 
    setShowCreatePost(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  // ============================================
  // СКЕЛЕТОН ЗАГРУЗКИ
  // ============================================

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-2"></div>
                  <div className="h-3 w-24 bg-muted rounded"></div>
                </div>
              </div>
              <div className="h-4 w-full bg-muted rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================
  // ОСНОВНОЙ РЕНДЕР
  // ============================================

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Сообщество</h1>
        <Button onClick={openCreateModal} className="gradient-primary">
          Создать пост
        </Button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Поиск по постам..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
          />
        </div>
        <div className="flex gap-1">
          {[
            { key: "recent", label: "Новые" }, 
            { key: "popular", label: "Популярные" }, 
            { key: "all", label: "Все" }
          ].map(f => (
            <button 
              key={f.key} 
              onClick={() => setFilter(f.key as "all" | "popular" | "recent")} 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key 
                  ? "gradient-primary text-primary-foreground" 
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Модальное окно создания поста */}
      {showCreatePost && (
        <div 
          className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={() => setShowCreatePost(false)}
        >
          <div 
            className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full shadow-elevated max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingPost ? "Редактировать пост" : "Новый пост"}
              </h3>
              <button 
                onClick={() => setShowCreatePost(false)} 
                className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <input 
                  type="text" 
                  value={newPostTitle} 
                  onChange={(e) => setNewPostTitle(e.target.value)} 
                  placeholder="Заголовок поста (необязательно)" 
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30" 
                />
                <textarea 
                  value={newPostContent} 
                  onChange={(e) => setNewPostContent(e.target.value)} 
                  placeholder="О чём думаете?" 
                  className="w-full min-h-[100px] px-3 py-2 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" 
                />
              </div>
            </div>

            {/* Превью изображения */}
            {imagePreview && (
              <div className="relative mb-4">
                <img src={imagePreview} alt="preview" className="h-48 w-full object-cover rounded-xl" />
                <button 
                  onClick={removeImagePreview} 
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Превью видео */}
            {videoPreview && (
              <div className="relative mb-4">
                <video src={videoPreview} controls className="h-48 w-full object-cover rounded-xl" />
                <button 
                  onClick={removeVideoPreview} 
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {/* Кнопки */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex gap-2">
                <label className="cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors" title="Загрузить изображение">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageSelect} 
                    className="hidden" 
                  />
                </label>
                <label className="cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors" title="Загрузить видео">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <input 
                    ref={videoInputRef} 
                    type="file" 
                    accept="video/*" 
                    onChange={handleVideoSelect} 
                    className="hidden" 
                  />
                </label>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Добавить ссылку">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <Button 
                onClick={handleSavePost} 
                disabled={posting || (!newPostContent.trim() && !newPostImage && !newPostVideo)} 
                className="gradient-primary"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingPost ? "Сохранить" : "Опубликовать"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Список постов */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Ничего не найдено" : "Пока нет постов. Будьте первым!"}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateModal} variant="outline">
                Создать первый пост
              </Button>
            )}
          </div>
        ) : (
          filteredPosts.map(post => (
            <article key={post.id} className="bg-card rounded-xl border border-border p-4 animate-fade-in relative">
              {/* Закреплённый пост */}
              {post.isPinned && (
                <div className="absolute top-2 right-2 text-primary">
                  <Pin className="h-4 w-4 fill-current" />
                </div>
              )}
              
              {/* Шапка */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm">{post.author.name}</span>
                      {post.author.verified && (
                        <span className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
                
                {/* Меню */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveMenu(activeMenu === post.id ? null : post.id); 
                    }} 
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                  
                  {activeMenu === post.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                      <button 
                        onClick={() => handleEditPost(post)} 
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4" /> Редактировать
                      </button>
                      <button 
                        onClick={() => handlePinPost(post.id)} 
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Pin className="h-4 w-4" /> {post.isPinned ? "Открепить" : "Закрепить"}
                      </button>
                      <div className="border-t border-border my-1"></div>
                      <button 
                        onClick={() => handleDeletePost(post.id)} 
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" /> Удалить
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Заголовок и контент */}
              {post.title && (
                <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
              )}
              <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
              
              {/* Изображение */}
              {post.image && (
                <div className="mb-3 rounded-xl overflow-hidden">
                  <img 
                    src={`http://localhost:3000${post.image}`} 
                    alt="post" 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      if (post.image?.startsWith('data:')) {
                        (e.target as HTMLImageElement).src = post.image;
                      }
                    }}
                  />
                </div>
              )}

              {/* Видео */}
              {post.video && (
                <div className="mb-3 rounded-xl overflow-hidden bg-black">
                  <video 
                    src={`http://localhost:3000${post.video}`} 
                    controls 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      if (post.video?.startsWith('data:')) {
                        (e.target as HTMLVideoElement).src = post.video;
                      }
                    }}
                  />
                </div>
              )}

              {/* Кнопки действий */}
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
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)} 
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
                  onClick={() => setPosts(prev => prev.map(p => 
                    p.id === post.id ? { ...p, bookmarked: !p.bookmarked } : p
                  ))} 
                  className={`flex items-center gap-1.5 text-sm transition-colors ${
                    post.bookmarked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${post.bookmarked ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Комментарии */}
              {expandedPost === post.id && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="space-y-3">
                    {comments[post.id]?.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} />
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
      </div>
    </div>
  );
}