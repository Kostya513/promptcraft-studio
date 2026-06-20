import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search, Heart, Trash2, ShoppingCart, Play, ExternalLink,
  FolderPlus, Tag, TrendingDown, TrendingUp, BarChart3,
  CheckSquare, Bell, X, ChevronDown, Folder, FolderX, Zap, FileText, Bot
} from "lucide-react";

interface FavoriteItem {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  priceChange: "up" | "down" | "none";
  addedDate: string;
  purchased: boolean;
  tags: string[];
  folder: string;
  rating: number;
  image: string;
  type?: "prompt" | "skill" | "agent";
  version?: string;
}

const mockFolders: string[] = ["Все"];
const sortOptions = ["По дате добавления", "По цене", "По названию"];
type ContentType = "all" | "prompt" | "skill" | "agent";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("По дате добавления");
  const [activeFolder, setActiveFolder] = useState("Все");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState(mockFolders);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // 🔹 ЗАГРУЗКА ИЗБРАННЫХ ИЗ LOCALSTORAGE
  useEffect(() => {
    const loadFavorites = () => {
      try {
        // Получаем список сохраненных ID
        const savedIds: string[] = JSON.parse(localStorage.getItem("saved_items") || "[]");
        
        if (savedIds.length === 0) {
          setFavorites([]);
          return;
        }

        // Загружаем все элементы из хранилищ
        const prompts = JSON.parse(localStorage.getItem("promptcraft_prompts") || "[]");
        const skills = JSON.parse(localStorage.getItem("promptcraft_skills") || "[]");
        const agents = JSON.parse(localStorage.getItem("promptcraft_agents") || "[]");

        const allItems: any[] = [
          ...prompts.map((p: any) => ({ ...p, _type: "prompt" as const })),
          ...skills.map((s: any) => ({ ...s, _type: "skill" as const })),
          ...agents.map((a: any) => ({ ...a, _type: "agent" as const })),
        ];

        // Находим избранные элементы
        const favoriteItems: FavoriteItem[] = savedIds
          .map((savedId) => {
            // Ищем по полному ID или по части
            const found = allItems.find((item: any) => {
              const itemId = item.id;
              const fullId = `${item._type}_${item.id}`;
              return itemId === savedId || fullId === savedId || savedId.endsWith(itemId);
            });

            if (!found) return null;

            // Получаем изображение
            let image = "";
            if (found.media && found.media.length > 0) {
              image = found.media[0].url;
            } else if (found.images && found.images.length > 0) {
              image = found.images[0];
            } else if (found.image) {
              image = found.image;
            }

            // Плейсхолдеры по типу
            if (!image) {
              if (found._type === "prompt") {
                image = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%233b82f6' width='400' height='300'/%3E%3Ctext fill='white' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24'%3EPrompt%3C/text%3E%3C/svg%3E`;
              } else if (found._type === "skill") {
                image = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%2310b981' width='400' height='300'/%3E%3Ctext fill='white' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24'%3ESkill%3C/text%3E%3C/svg%3E`;
              } else {
                image = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%238b5cf6' width='400' height='300'/%3E%3Ctext fill='white' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24'%3EAgent%3C/text%3E%3C/svg%3E`;
              }
            }

            // Формируем ID для карточки
            const cardId = found.id.includes("_") ? found.id : `${found._type}_${found.id}`;

            return {
              id: cardId,
              title: found.title || found.name || "Без названия",
              author: found.author || "Автор",
              price: found.price || 0,
              originalPrice: found.originalPrice,
              priceChange: "none" as const,
              addedDate: new Date(found.createdAt || Date.now()).toLocaleDateString("ru-RU"),
              purchased: false,
              tags: found.tags || [],
              folder: "Все",
              rating: found.rating || 5,
              image,
              type: found._type,
              version: found.version || "1.0",
            };
          })
          .filter(Boolean) as FavoriteItem[];

        setFavorites(favoriteItems);
      } catch (e) {
        console.error("Ошибка загрузки избранного:", e);
        setFavorites([]);
      }
    };

    loadFavorites();

    // 🔹 Слушаем изменения localStorage (для синхронизации между вкладками)
    const handleStorageChange = () => loadFavorites();
    window.addEventListener("storage", handleStorageChange);
    
    // Обновляем при фокусе на вкладку
    const handleFocus = () => loadFavorites();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // 🔹 Фильтрация по типу контента + поиску + папке
  const filtered = favorites
    .filter(f => contentType === "all" || f.type === contentType)
    .filter(f => activeFolder === "Все" || f.folder === activeFolder)
    .filter(f => !searchQuery || f.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "По цене") return a.price - b.price;
      if (sortBy === "По названию") return a.title.localeCompare(b.title);
      return 0;
    });

  // 🔹 Удаление из избранного (с синхронизацией localStorage)
  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
    
    // Синхронизируем с localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("saved_items") || "[]");
      const filtered = saved.filter((i: string) => i !== id);
      localStorage.setItem("saved_items", JSON.stringify(filtered));
    } catch (e) {
      console.error("Ошибка синхронизации:", e);
    }
  };

  const clearAll = () => { 
    if (confirm("Очистить все избранные?")) {
      setFavorites([]);
      localStorage.setItem("saved_items", JSON.stringify([]));
    }
  };

  const toggleSelect = (id: string) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const buySelected = () => console.log("Buy selected:", selectedItems);
  
  const addFolder = () => { 
    if (newFolderName && !folders.includes(newFolderName)) { 
      setFolders(prev => [...prev, newFolderName]); 
      setNewFolderName(""); 
      setShowNewFolder(false); 
    } 
  };
  
  const deleteFolder = (folderName: string) => {
    if (folderName === "Все") {
      alert("Папку 'Все' нельзя удалить");
      return;
    }
    const count = favorites.filter(f => f.folder === folderName).length;
    if (count > 0) {
      const confirmMove = confirm(`В папке "${folderName}" есть ${count} элемент(ов).\n\nПереместить их в "Все" и удалить папку?`);
      if (!confirmMove) return;
      setFavorites(prev => prev.map(f => f.folder === folderName ? { ...f, folder: "Все" } : f));
    }
    setFolders(prev => prev.filter(f => f !== folderName));
    if (activeFolder === folderName) {
      setActiveFolder("Все");
    }
  };

  // 🔹 Аналитика с разделением по типам
  const totalPrompts = favorites.filter(f => f.type === "prompt").length;
  const totalSkills = favorites.filter(f => f.type === "skill").length;
  const totalAgents = favorites.filter(f => f.type === "agent").length;
  const totalSaved = favorites.filter(f => f.originalPrice && f.originalPrice > f.price).reduce((sum, f) => sum + ((f.originalPrice || 0) - f.price), 0);
  const totalPurchased = favorites.filter(f => f.purchased).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Избранное</h1>
          <p className="text-sm text-muted-foreground">
            {totalPrompts} промтов · {totalSkills} скилов · {totalAgents} агентов
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAnalytics(!showAnalytics)} className="px-3 py-1.5 rounded-lg border border-border text-sm flex items-center gap-1 hover:bg-muted"><BarChart3 className="h-4 w-4" /> Аналитика</button>
          <button onClick={clearAll} className="px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-sm flex items-center gap-1 hover:bg-destructive/5"><Trash2 className="h-4 w-4" /> Очистить</button>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && (
        <div className="bg-card rounded-xl border border-border p-4 mb-4 animate-fade-in">
          <h3 className="font-semibold text-sm mb-3">Статистика избранного</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalPrompts}</p>
              <p className="text-xs text-muted-foreground">Промтов</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalSkills}</p>
              <p className="text-xs text-muted-foreground">Скилов</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalAgents}</p>
              <p className="text-xs text-muted-foreground">Агентов</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{totalPurchased}</p>
              <p className="text-xs text-muted-foreground">Куплено</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{totalSaved} ₽</p>
              <p className="text-xs text-muted-foreground">Сэкономлено</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">💡 Совет: активируйте скилы в Менеджере аккаунтов для автоматизации</p>
          </div>
        </div>
      )}

      {/* Search, sort, content type filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск в избранном..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        
        {/* 🔹 Фильтр типа контента */}
        <div className="flex bg-muted rounded-lg p-0.5">
          {[
            { key: "all", label: "Все" },
            { key: "prompt", label: "Промты", icon: <FileText className="h-3 w-3" /> },
            { key: "skill", label: "Скилы", icon: <Zap className="h-3 w-3" /> },
            { key: "agent", label: "Агенты", icon: <Bot className="h-3 w-3" /> },
          ].map((ct) => (
            <button
              key={ct.key}
              onClick={() => setContentType(ct.key as ContentType)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                contentType === ct.key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {ct.icon}
              {ct.label}
            </button>
          ))}
        </div>
        
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg bg-background border border-border text-sm">
          {sortOptions.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Folders */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {folders.map(f => (
          <div key={f} className="relative group">
            <button 
              onClick={() => setActiveFolder(f)} 
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                activeFolder === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Folder className="h-3 w-3" /> {f}
              {f !== "Все" && (
                <span className="ml-1 px-1.5 py-0.5 rounded bg-background/20 text-[10px]">
                  {favorites.filter(pf => pf.folder === f).length}
                </span>
              )}
            </button>
            {f !== "Все" && (
              <button
                onClick={() => deleteFolder(f)}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                title="Удалить папку"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        ))}
        <button onClick={() => setShowNewFolder(true)} className="px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground flex items-center gap-1 hover:bg-muted">
          <FolderPlus className="h-3 w-3" /> Папка
        </button>
      </div>

      {showNewFolder && (
        <div className="flex gap-2 mb-4">
          <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Название папки" className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-sm" />
          <button onClick={addFolder} className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-sm">Создать</button>
          <button onClick={() => setShowNewFolder(false)} className="px-3 py-2 rounded-lg border border-border text-sm"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">Выбрано: {selectedItems.length}</span>
          <button onClick={buySelected} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> Купить выбранные</button>
          <button className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium flex items-center gap-1"><Bell className="h-3 w-3" /> Напомнить позже</button>
          <button onClick={() => setSelectedItems([])} className="ml-auto text-xs text-muted-foreground">Отменить</button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {contentType === "skill" 
              ? "Нет избранных скилов" 
              : contentType === "prompt"
              ? "Нет избранных промтов"
              : contentType === "agent"
              ? "Нет избранных агентов"
              : "Нет избранных элементов"}
          </p>
          <Link to="/market" className="mt-3 inline-block px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">Перейти в маркет</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(f => {
            const isSkill = f.type === "skill";
            const isAgent = f.type === "agent";
            return (
              <div key={f.id} className="bg-card rounded-xl border border-border overflow-hidden relative">
                
                {/* 🔹 Бейдж типа контента */}
                <div className="absolute top-2 left-2 z-10">
                  {isAgent ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full backdrop-blur-sm">
                      <Bot className="h-3 w-3" /> AGENT
                    </span>
                  ) : isSkill ? (
                    <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full backdrop-blur-sm">
                      <Zap className="h-3 w-3" /> SKILL
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] rounded-full backdrop-blur-sm">
                      <FileText className="h-3 w-3" /> PROMPT
                    </span>
                  )}
                </div>
                
                <div className="aspect-video bg-muted relative">
                  <img src={f.image} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => toggleSelect(f.id)} className={`absolute top-2 right-2 h-6 w-6 rounded border flex items-center justify-center ${selectedItems.includes(f.id) ? "bg-primary border-primary text-primary-foreground" : "bg-card/80 border-border"}`}>
                    {selectedItems.includes(f.id) && <CheckSquare className="h-3 w-3" />}
                  </button>
                  {f.priceChange === "down" && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-success/90 text-success-foreground text-[10px] font-medium flex items-center gap-0.5"><TrendingDown className="h-3 w-3" /> Скидка</span>
                  )}
                  {f.priceChange === "up" && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-medium flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> Подорожал</span>
                  )}
                </div>
                <div className="p-3">
                  <Link to={`/prompt/${f.id}`}>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1 pr-12 hover:text-primary transition-colors">{f.title}</h3>
                  </Link>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{f.author} · ★ {f.rating}</p>
                    {(isSkill || isAgent) && f.version && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v{f.version}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {f.tags.slice(0, 2).map(t => <span key={t} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">#{t}</span>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {f.price === 0 ? (
                        <span className="text-sm font-bold text-success">Бесплатно</span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">{f.price} ₽</span>
                          {f.originalPrice && f.originalPrice > f.price && <span className="text-xs text-muted-foreground line-through">{f.originalPrice} ₽</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link to={`/prompt/${f.id}`} className="px-2 py-1 rounded-lg gradient-primary text-primary-foreground text-xs font-medium flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" /> Открыть
                      </Link>
                      <button onClick={() => removeFavorite(f.id)} className="px-2 py-1 rounded-lg text-destructive hover:bg-destructive/5">
                        <Heart className="h-3 w-3 fill-current" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Добавлено {f.addedDate}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Limits note */}
      <div className="mt-6 p-3 bg-muted/50 rounded-lg border border-border text-xs text-muted-foreground">
        Бесплатный план: до 20 элементов, 1 папка. <button className="text-primary hover:underline">PRO — без ограничений</button>
      </div>
    </div>
  );
}