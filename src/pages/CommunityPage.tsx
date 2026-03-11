import { useState, useRef, useCallback, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  Search, Filter, Heart, MessageCircle, Share2, Bookmark, Award,
  MoreHorizontal, Flag, EyeOff, Link2, Calendar, Play, Trophy,
  Rss, BookOpen, Users, TrendingUp, ChevronDown, ChevronRight,
  Send, Pin, X, Star, ThumbsUp, ExternalLink, Clock, Plus, ArrowLeft,
  MapPin, Video, Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/* ── Types ── */
interface CommunityPost {
  id: string;
  type: "user_post" | "platform_news" | "case_guide" | "question";
  author: { name: string; avatar: string; badge: "newbie" | "active" | "expert" | "moderator" | "leader" };
  time: string;
  title: string;
  body: string;
  media?: string[];
  tags: string[];
  likes: number;
  comments: number;
  reposts: number;
  liked: boolean;
  saved: boolean;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
  likes: number;
  pinned: boolean;
  replies: Comment[];
}

interface NewsItem { id: string; source: string; title: string; summary: string; tags: string[]; time: string; comments: number; }

interface Guide {
  id: string;
  title: string;
  type: "article" | "video" | "challenge";
  readTime?: string;
  rating: number;
  chapters?: string[];
  tasks?: number;
  certificate: boolean;
  completed: boolean;
  content?: string[];
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  dateISO: string;
  endDateISO: string;
  type: "webinar" | "challenge" | "meetup";
  registered: boolean;
  live: boolean;
  archived: boolean;
  description?: string;
  speakers?: { name: string; role: string; }[];
  program?: { time: string; title: string; }[];
  location?: string;
  videoUrl?: string;
}

// comments are loaded from backend
const mockComments: Comment[] = [];

// content lists loaded from backend
const mockPosts: CommunityPost[] = [];
const mockEvents: EventItem[] = [];
const mockGuides: Guide[] = [];
const mockNews: NewsItem[] = [];

const badgeLabels: Record<string, string> = { newbie: "Новичок", active: "Активный", expert: "Эксперт", moderator: "Модератор", leader: "Лидер" };
const badgeColors: Record<string, string> = { newbie: "bg-muted text-muted-foreground", active: "bg-primary/10 text-primary", expert: "bg-warning/10 text-warning", moderator: "bg-destructive/10 text-destructive", leader: "bg-success/10 text-success" };

// data is loaded from the backend; start empty

const communityTabs = ["Главная", "AI Новости", "Дискуссии", "Гайды и обучение", "Мероприятия"];
const filterTypes = ["Все", "Посты", "Новости", "Кейсы", "Вопросы"];
const sortOptions = ["По дате", "По популярности"];
const discussionCategories = ["Общее", "Промт-инженеринг", "AI модели", "Маркетинг", "Разработка", "Дизайн"];

const reputationLevels = [
  { level: "Новичок", min: 0, privileges: "Чтение, комментирование" },
  { level: "Активный", min: 50, privileges: "+ создание постов" },
  { level: "Эксперт", min: 200, privileges: "+ бейдж, приоритет в ленте" },
  { level: "Лидер", min: 500, privileges: "+ доступ к закрытым чатам" },
];

function generateICS(event: EventItem): string {
  const fmt = (d: string) => new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Промт-Студия//Events//RU
BEGIN:VEVENT
DTSTART:${fmt(event.dateISO)}
DTEND:${fmt(event.endDateISO)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || "Онлайн"}
END:VEVENT
END:VCALENDAR`;
}

export default function CommunityPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("Главная");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("Все");
  const [sortBy, setSortBy] = useState("По дате");
  const [posts, setPosts] = useState(mockPosts);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showPostMenu, setShowPostMenu] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentSort, setCommentSort] = useState<"new" | "top">("new");
  const [events, setEvents] = useState(mockEvents);
  const [guides] = useState(mockGuides);
  const [news] = useState(mockNews);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  // Create topic modal
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: "", category: "Общее", text: "", tags: "" });
  const [topicErrors, setTopicErrors] = useState<Record<string, string>>({});

  // Guide detail
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [guideRating, setGuideRating] = useState(0);
  const [guideActiveSection, setGuideActiveSection] = useState(0);

  // Event detail
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Calendar month
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 2, 1)); // March 2026

  const loadMore = useCallback(() => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setPosts(prev => [...prev, ...mockPosts.map(p => ({ ...p, id: `${p.id}-${Date.now()}-${Math.random()}` }))]);
      setLoading(false);
    }, 500);
  }, [loading]);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMore(); }, { threshold: 0.1 });
    if (observerRef.current) obs.observe(observerRef.current);
    return () => obs.disconnect();
  }, [loadMore]);

  const toggleLike = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  const toggleSave = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, saved: !p.saved } : p));

  const toggleEventRegister = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, registered: !e.registered } : e));
    const ev = events.find(e => e.id === id);
    if (ev && !ev.registered) {
      downloadICS(ev);
      toast({ title: "Вы зарегистрированы!", description: "Файл для календаря скачан", duration: 3000 });
    }
  };

  const downloadICS = (event: EventItem) => {
    const ics = generateICS(event);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateTopic = () => {
    const errors: Record<string, string> = {};
    if (!topicForm.title.trim()) errors.title = "Введите заголовок";
    if (topicForm.title.length > 100) errors.title = "Максимум 100 символов";
    if (!topicForm.text.trim() || topicForm.text.length < 10) errors.text = "Минимум 10 символов";
    if (Object.keys(errors).length > 0) { setTopicErrors(errors); return; }
    
    const newPost: CommunityPost = {
      id: Date.now().toString(), type: "user_post",
      author: { name: user.name || "Пользователь", avatar: "", badge: "newbie" },
      time: "только что", title: topicForm.title, body: topicForm.text,
      tags: topicForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      likes: 0, comments: 0, reposts: 0, liked: false, saved: false,
    };
    setPosts(prev => [newPost, ...prev]);
    setShowCreateTopic(false);
    setTopicForm({ title: "", category: "Общее", text: "", tags: "" });
    setTopicErrors({});
    toast({ title: "Тема создана", description: "Ваша тема опубликована в Дискуссиях" });
  };

  const filteredPosts = posts.filter(p => {
    if (filterType === "Посты" && p.type !== "user_post") return false;
    if (filterType === "Новости" && p.type !== "platform_news") return false;
    if (filterType === "Кейсы" && p.type !== "case_guide") return false;
    if (filterType === "Вопросы" && p.type !== "question") return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.body.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday-first
  };
  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarMonth);
  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  const getEventsForDay = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => {
      const start = e.dateISO.split("T")[0];
      const end = e.endDateISO.split("T")[0];
      return dateStr >= start && dateStr <= end;
    });
  };

  const renderPostCard = (post: CommunityPost) => (
    <div key={post.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{post.author.name[0]}</div>
          <div>
            <div className="flex items-center gap-2">
              <button className="text-sm font-medium hover:underline">{post.author.name}</button>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeColors[post.author.badge]}`}>{badgeLabels[post.author.badge]}</span>
            </div>
            <p className="text-xs text-muted-foreground">{post.time}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
          {showPostMenu === post.id && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-elevated z-10 py-1 w-40">
              <button onClick={() => { setShowPostMenu(null); toast({ title: "Жалоба отправлена" }); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"><Flag className="h-3 w-3" /> Пожаловаться</button>
              <button onClick={() => setShowPostMenu(null)} className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"><EyeOff className="h-3 w-3" /> Скрыть</button>
              <button onClick={() => { navigator.clipboard.writeText(`https://promt-studiya.ru/post/${post.id}`); setShowPostMenu(null); toast({ title: "Ссылка скопирована" }); }} className="w-full px-3 py-2 text-sm text-left hover:bg-muted flex items-center gap-2"><Link2 className="h-3 w-3" /> Копировать ссылку</button>
            </div>
          )}
        </div>
      </div>
      <button onClick={() => setSelectedPost(post)} className="text-left w-full">
        <h3 className="font-semibold text-sm mb-1">{post.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{post.body}</p>
      </button>
      {post.media && post.media.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {post.media.map((m, i) => <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden"><img src={m} alt="" className="w-full h-full object-cover" /></div>)}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {post.tags.map(tag => <button key={tag} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">#{tag}</button>)}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 text-sm transition-colors ${post.liked ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} /> {post.likes}
        </button>
        <button onClick={() => setSelectedPost(post)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><MessageCircle className="h-4 w-4" /> {post.comments}</button>
        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Share2 className="h-4 w-4" /> {post.reposts}</button>
        <button onClick={() => toggleSave(post.id)} className={`flex items-center gap-1 text-sm ml-auto transition-colors ${post.saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Bookmark className={`h-4 w-4 ${post.saved ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );

  const renderCommentTree = (comments: Comment[], depth = 0) => (
    <div className={depth > 0 ? "ml-6 border-l border-border pl-3" : ""}>
      {comments.map(c => (
        <div key={c.id} className="py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{c.author}</span>
            <span className="text-xs text-muted-foreground">{c.time}</span>
            {c.pinned && <Pin className="h-3 w-3 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">{c.text}</p>
          <div className="flex items-center gap-3 mt-1">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ThumbsUp className="h-3 w-3" /> {c.likes}</button>
            <button className="text-xs text-muted-foreground hover:text-foreground">Ответить</button>
          </div>
          {c.replies.length > 0 && renderCommentTree(c.replies, depth + 1)}
        </div>
      ))}
    </div>
  );

  // Event detail view
  if (selectedEvent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Назад к мероприятиям
        </button>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-3">
            {selectedEvent.type === "webinar" && <Video className="h-5 w-5 text-primary" />}
            {selectedEvent.type === "challenge" && <Trophy className="h-5 w-5 text-warning" />}
            {selectedEvent.type === "meetup" && <MapPin className="h-5 w-5 text-primary" />}
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {selectedEvent.type === "webinar" ? "Вебинар" : selectedEvent.type === "challenge" ? "Челлендж" : "Митап"}
            </span>
            {selectedEvent.live && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium animate-pulse">LIVE</span>}
          </div>
          <h1 className="text-xl font-bold mb-2">{selectedEvent.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {selectedEvent.date}</span>
            {selectedEvent.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {selectedEvent.location}</span>}
          </div>
          {selectedEvent.description && <p className="text-sm text-muted-foreground mb-6">{selectedEvent.description}</p>}

          {/* Video player for archived/live events */}
          {selectedEvent.videoUrl && (selectedEvent.archived || selectedEvent.live) && (
            <div className="aspect-video rounded-xl overflow-hidden bg-muted mb-6">
              <iframe src={selectedEvent.videoUrl} className="w-full h-full" allowFullScreen title={selectedEvent.title} />
            </div>
          )}

          {/* Speakers */}
          {selectedEvent.speakers && selectedEvent.speakers.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3">Спикеры</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {selectedEvent.speakers.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{s.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Program */}
          {selectedEvent.program && selectedEvent.program.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3">Программа</h3>
              <div className="space-y-2">
                {selectedEvent.program.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <span className="text-xs font-mono text-primary font-medium whitespace-nowrap min-w-[80px]">{p.time}</span>
                    <span className="text-sm">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {!selectedEvent.archived && (
              <button onClick={() => { toggleEventRegister(selectedEvent.id); setSelectedEvent(prev => prev ? { ...prev, registered: !prev.registered } : null); }}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedEvent.registered ? "bg-muted text-foreground hover:bg-muted/80" : "gradient-primary text-primary-foreground hover:opacity-90"}`}>
                {selectedEvent.registered ? "Зарегистрирован ✓" : "Записаться"}
              </button>
            )}
            <button onClick={() => downloadICS(selectedEvent)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              <Download className="h-4 w-4" /> Добавить в календарь (.ics)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Guide detail view
  if (selectedGuide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => { setSelectedGuide(null); setGuideRating(0); setGuideActiveSection(0); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Назад к гайдам
        </button>
        <div className="flex gap-6">
          <div className="hidden md:block w-48 flex-shrink-0">
            <h3 className="font-semibold text-xs text-muted-foreground uppercase mb-3">Оглавление</h3>
            <nav className="space-y-1">
              {selectedGuide.content?.map((_, i) => (
                <button key={i} onClick={() => setGuideActiveSection(i)} className={`block text-left w-full px-3 py-1.5 rounded-lg text-xs transition-colors ${guideActiveSection === i ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  {selectedGuide.chapters?.[i] || `Раздел ${i + 1}`}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {selectedGuide.type === "article" && <BookOpen className="h-5 w-5 text-primary" />}
              {selectedGuide.type === "video" && <Play className="h-5 w-5 text-primary" />}
              {selectedGuide.type === "challenge" && <Trophy className="h-5 w-5 text-warning" />}
              <span className="text-xs text-muted-foreground uppercase">{selectedGuide.type === "article" ? "Статья" : selectedGuide.type === "video" ? "Видеокурс" : "Челлендж"}</span>
              {selectedGuide.readTime && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{selectedGuide.readTime}</span>}
            </div>
            <h1 className="text-xl font-bold mb-4">{selectedGuide.title}</h1>
            <div className="md:hidden flex gap-1 mb-4 overflow-x-auto pb-1">
              {selectedGuide.content?.map((_, i) => (
                <button key={i} onClick={() => setGuideActiveSection(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${guideActiveSection === i ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {selectedGuide.chapters?.[i] || `Раздел ${i + 1}`}
                </button>
              ))}
            </div>
            <div className="bg-card rounded-xl border border-border p-5 mb-6">
              <div className="prose prose-sm max-w-none">
                {selectedGuide.content?.[guideActiveSection]?.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) return <h2 key={i} className="text-lg font-bold mb-3 mt-0">{line.replace("# ", "")}</h2>;
                  if (line.startsWith("- ")) return <li key={i} className="text-sm text-muted-foreground ml-4">{line.replace("- ", "")}</li>;
                  if (line.trim() === "") return <br key={i} />;
                  return <p key={i} className="text-sm text-muted-foreground mb-2" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />;
                })}
              </div>
            </div>
            <div className="flex justify-between mb-6">
              <button disabled={guideActiveSection === 0} onClick={() => setGuideActiveSection(s => s - 1)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40">← Назад</button>
              {guideActiveSection < (selectedGuide.content?.length || 1) - 1 ? (
                <button onClick={() => setGuideActiveSection(s => s + 1)} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Далее →</button>
              ) : (
                <span className="text-xs text-success font-medium flex items-center gap-1">Завершено ✓</span>
              )}
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-semibold text-sm mb-3">Оцените полезность гайда</h3>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => { setGuideRating(s); toast({ title: `Оценка: ${s}/5 сохранена` }); }} className="p-1 hover:scale-110 transition-transform">
                    <Star className={`h-6 w-6 ${s <= guideRating ? "text-warning fill-current" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              {guideRating > 0 && <p className="text-xs text-muted-foreground">Спасибо за вашу оценку!</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Сообщество</h1>

      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto pb-px">
        {communityTabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`pb-3 px-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === t ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {/* ── Главная ── */}
      {activeTab === "Главная" && (
        <div className="animate-fade-in">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск по сообществу..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg bg-background border border-border text-sm">
              {sortOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {filterTypes.map(f => <button key={f} onClick={() => setFilterType(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterType === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>)}
          </div>
          {filteredPosts.length > 0 ? (
            <div className="space-y-4">{filteredPosts.map(renderPostCard)}</div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Пока нет постов. Станьте первым участником!</p>
          )}
          <div ref={observerRef} className="py-8 text-center text-sm text-muted-foreground">{loading ? "Загрузка..." : ""}</div>
        </div>
      )}

      {/* ── AI Новости ── */}
      {activeTab === "AI Новости" && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm text-muted-foreground mb-2">Агрегатор новостей из RSS, автоперевод и саммари</p>
          {news.length > 0 ? (
            news.map(n => (
              <div key={n.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Rss className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary">{n.source}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{n.time}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{n.title}</h3>
                <p className="text-sm text-muted-foreground">{n.summary}</p>
                <div className="flex items-center gap-2 mt-3">
                  {n.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">#{t}</span>)}
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"><MessageCircle className="h-3 w-3" /> {n.comments}</span>
                </div>
              </div>
            ))
          ) : null}
        </div>
      )}

      {/* ── Дискуссии ── */}
      {activeTab === "Дискуссии" && (
        <div className="animate-fade-in">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Поиск дискуссий..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <button onClick={() => setShowCreateTopic(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Создать тему
            </button>
          </div>
          <div className="space-y-3">
            {posts.filter(p => p.type === "question" || p.type === "user_post").slice(0, 8).length > 0 ? (
              posts.filter(p => p.type === "question" || p.type === "user_post").slice(0, 8).map(renderPostCard)
            ) : (
              <p className="text-center text-muted-foreground py-6">Пока нет тем. Создайте первую!</p>
            )}
          </div>
          <div className="mt-6 bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-warning" /> Система репутации</h3>
            <div className="space-y-2">
              {reputationLevels.map(r => (
                <div key={r.level} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div><span className="text-sm font-medium">{r.level}</span><span className="text-xs text-muted-foreground ml-2">от {r.min} очков</span></div>
                  <span className="text-xs text-muted-foreground">{r.privileges}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Гайды и обучение ── */}
      {activeTab === "Гайды и обучение" && (
        <div className="space-y-4 animate-fade-in">
          {guides.length > 0 ? (
            guides.map(g => (
              <button key={g.id} onClick={() => { setSelectedGuide(g); setGuideActiveSection(0); }} className="w-full text-left bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-all hover:border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  {g.type === "article" && <BookOpen className="h-4 w-4 text-primary" />}
                  {g.type === "video" && <Play className="h-4 w-4 text-primary" />}
                  {g.type === "challenge" && <Trophy className="h-4 w-4 text-warning" />}
                  <span className="text-xs font-medium text-muted-foreground uppercase">{g.type === "article" ? "Статья" : g.type === "video" ? "Видеокурс" : "Челлендж"}</span>
                  {g.readTime && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {g.readTime}</span>}
                  <span className="ml-auto flex items-center gap-1 text-xs text-warning"><Star className="h-3 w-3 fill-current" /> {g.rating}</span>
                </div>
                <h3 className="font-semibold text-sm mb-1">{g.title}</h3>
                {g.chapters && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Содержание:</p>
                    <ol className="list-decimal list-inside text-xs text-muted-foreground space-y-0.5">
                      {g.chapters.map((ch, i) => <li key={i}>{ch}</li>)}
                    </ol>
                  </div>
                )}
                {g.tasks && <p className="text-xs text-muted-foreground mt-2">Заданий: {g.tasks}</p>}
                <div className="flex items-center gap-2 mt-3">
                  {g.certificate && <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success">Сертификат</span>}
                  {g.completed && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Пройдено ✓</span>}
                  <span className="ml-auto px-4 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium">
                    {g.completed ? "Повторить" : "Начать"} →
                  </span>
                </div>
              </button>
            ))
          ) : null}
        </div>
      )}

      {/* ── Мероприятия ── */}
      {activeTab === "Мероприятия" && (
        <div className="space-y-6 animate-fade-in">
          {/* Calendar */}
          {events.length === 0 && <p className="text-center text-muted-foreground py-4">Нет запланированных мероприятий.</p>}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="px-3 py-1 rounded-lg border border-border text-sm hover:bg-muted transition-colors">←</button>
              <h3 className="font-semibold text-sm">{monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</h3>
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="px-3 py-1 rounded-lg border border-border text-sm hover:bg-muted transition-colors">→</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => (
                <div key={d} className="text-xs text-muted-foreground font-medium py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                return (
                  <button key={day} onClick={() => { if (hasEvents) setSelectedEvent(dayEvents[0]); }}
                    className={`aspect-square rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-colors ${hasEvents ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" : "hover:bg-muted text-foreground"}`}>
                    {day}
                    {hasEvents && <div className="h-1 w-1 rounded-full bg-primary mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event list */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Все мероприятия</h3>
            {events.map(e => (
              <div key={e.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{e.date}</span>
                  {e.live && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium animate-pulse">LIVE</span>}
                  {e.archived && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Запись</span>}
                  <span className="text-xs text-muted-foreground capitalize ml-auto">{e.type === "webinar" ? "Вебинар" : e.type === "challenge" ? "Челлендж" : "Митап"} • {e.location ? "Офлайн" : "Онлайн"}</span>
                </div>
                <button onClick={() => setSelectedEvent(e)} className="text-left w-full">
                  <h3 className="font-semibold text-sm mb-1 hover:text-primary transition-colors">{e.title}</h3>
                  {e.description && <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>}
                </button>
                <div className="flex items-center gap-2 mt-3">
                  {e.archived ? (
                    <button onClick={() => setSelectedEvent(e)} className="ml-auto px-4 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium flex items-center gap-1 hover:bg-muted/80 transition-colors"><Play className="h-3 w-3" /> Смотреть запись</button>
                  ) : e.live ? (
                    <button onClick={() => setSelectedEvent(e)} className="ml-auto px-4 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium flex items-center gap-1 hover:opacity-90 transition-opacity"><Play className="h-3 w-3" /> Смотреть</button>
                  ) : (
                    <>
                      <button onClick={() => downloadICS(e)} className="ml-auto px-3 py-1.5 rounded-lg border border-border text-xs font-medium flex items-center gap-1 hover:bg-muted transition-colors"><Download className="h-3 w-3" /> .ics</button>
                      <button onClick={() => toggleEventRegister(e.id)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${e.registered ? "bg-muted text-foreground hover:bg-muted/80" : "gradient-primary text-primary-foreground hover:opacity-90"}`}>
                        {e.registered ? "Записан ✓" : "Записаться"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create topic modal ── */}
      {showCreateTopic && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateTopic(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-elevated animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">Создать тему</h2>
              <button onClick={() => setShowCreateTopic(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Заголовок * <span className="text-muted-foreground">({topicForm.title.length}/100)</span></label>
                <input value={topicForm.title} onChange={e => setTopicForm(p => ({ ...p, title: e.target.value.slice(0, 100) }))} placeholder="О чём ваша тема?" className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
                {topicErrors.title && <p className="text-xs text-destructive mt-1">{topicErrors.title}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Категория *</label>
                <select value={topicForm.category} onChange={e => setTopicForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm mt-1">
                  {discussionCategories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Текст * (поддержка Markdown)</label>
                <textarea value={topicForm.text} onChange={e => setTopicForm(p => ({ ...p, text: e.target.value }))} rows={5} placeholder="Напишите текст вашей темы..." className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1 resize-none" />
                {topicErrors.text && <p className="text-xs text-destructive mt-1">{topicErrors.text}</p>}
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Теги (через запятую)</label>
                <input value={topicForm.tags} onChange={e => setTopicForm(p => ({ ...p, tags: e.target.value }))} placeholder="GPT-4, промт-инженеринг" className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1" />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-border">
              <button onClick={() => setShowCreateTopic(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Отмена</button>
              <button onClick={handleCreateTopic} className="flex-1 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">Опубликовать</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Post detail modal ── */}
      {selectedPost && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto" onClick={() => setSelectedPost(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-2xl my-8 shadow-elevated" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold">{selectedPost.title}</h2>
              <button onClick={() => setSelectedPost(null)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">{selectedPost.author.name[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{selectedPost.author.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeColors[selectedPost.author.badge]}`}>{badgeLabels[selectedPost.author.badge]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedPost.time}</p>
                </div>
                <button className="ml-auto px-3 py-1 rounded-lg border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition-colors">Подписаться</button>
              </div>
              <p className="text-sm mb-4">{selectedPost.body}</p>
              {selectedPost.media && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedPost.media.map((m, i) => <div key={i} className="aspect-video bg-muted rounded-lg overflow-hidden"><img src={m} alt="" className="w-full h-full object-cover" /></div>)}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedPost.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">#{t}</span>)}
              </div>
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <button onClick={() => toggleLike(selectedPost.id)} className={`flex items-center gap-1 text-sm ${selectedPost.liked ? "text-destructive" : "text-muted-foreground"}`}>
                  <Heart className={`h-4 w-4 ${selectedPost.liked ? "fill-current" : ""}`} /> {selectedPost.likes}
                </button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground"><MessageCircle className="h-4 w-4" /> {selectedPost.comments}</span>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><Share2 className="h-4 w-4" /> {selectedPost.reposts}</button>
                <button onClick={() => toggleSave(selectedPost.id)} className={`ml-auto text-sm ${selectedPost.saved ? "text-primary" : "text-muted-foreground"}`}>
                  <Bookmark className={`h-4 w-4 ${selectedPost.saved ? "fill-current" : ""}`} />
                </button>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Комментарии</h3>
                  <select value={commentSort} onChange={e => setCommentSort(e.target.value as any)} className="text-xs bg-background border border-border rounded px-2 py-1">
                    <option value="new">Новые</option><option value="top">Лучшие</option>
                  </select>
                </div>
                <div className="flex gap-2 mb-4">
                  <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Написать комментарий..." className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={() => { if (commentText.trim()) { toast({ title: "Комментарий отправлен" }); setCommentText(""); } }} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"><Send className="h-4 w-4" /></button>
                </div>
                {renderCommentTree(mockComments)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
