import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, ChevronRight, ChevronDown, Folder, Search, Grid, List, Zap, FileText, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";

// 🔹 Типы
type LibraryClass = {
  id: string;
  name: string;
  groups: LibraryGroup[];
};

type LibraryGroup = {
  id: string;
  classId: string;
  name: string;
  shelves: LibraryShelf[];
};

type LibraryShelf = {
  id: string;
  groupId: string;
  name: string;
  type: "system" | "user";
};

type LibraryItem = {
  id: string;
  type: "prompt" | "skill";
  title: string;
  description: string;
  price: number;
  currency: string;
  author: { id: string; name: string };
  tags: string[];
  classId: string;
  groupId: string;
  shelfIds: string[];
  version?: string;
  isActive: boolean;
};

// 🔹 Классификация (дерево категорий)
const MOCK_CLASSES: LibraryClass[] = [
  {
    id: "marketing",
    name: "📈 Маркетинг и Продажи",
    groups: [
      { id: "smm", classId: "marketing", name: "SMM и соцсети", shelves: [{ id: "s1", groupId: "smm", name: "Посты для Instagram", type: "system" }, { id: "s2", groupId: "smm", name: "Telegram-каналы", type: "system" }] },
      { id: "seo", classId: "marketing", name: "SEO и контент", shelves: [{ id: "s3", groupId: "seo", name: "Meta-теги", type: "system" }, { id: "s4", groupId: "seo", name: "Статьи для блога", type: "system" }] },
      { id: "email", classId: "marketing", name: "Email-маркетинг", shelves: [{ id: "s5", groupId: "email", name: "Рассылки", type: "system" }] },
      { id: "ads", classId: "marketing", name: "Реклама", shelves: [{ id: "s6", groupId: "ads", name: "Таргетированная реклама", type: "system" }] },
    ],
  },
  {
    id: "development",
    name: "💻 Разработка и IT",
    groups: [
      { id: "frontend", classId: "development", name: "Frontend", shelves: [{ id: "s7", groupId: "frontend", name: "React-компоненты", type: "system" }, { id: "s8", groupId: "frontend", name: "Vue.js", type: "system" }] },
      { id: "backend", classId: "development", name: "Backend", shelves: [{ id: "s9", groupId: "backend", name: "API и REST", type: "system" }, { id: "s10", groupId: "backend", name: "Базы данных", type: "system" }] },
      { id: "devops", classId: "development", name: "DevOps", shelves: [{ id: "s11", groupId: "devops", name: "CI/CD", type: "system" }] },
      { id: "mobile", classId: "development", name: "Мобильная разработка", shelves: [{ id: "s12", groupId: "mobile", name: "React Native", type: "system" }] },
    ],
  },
  {
    id: "creative",
    name: " Креатив и Контент",
    groups: [
      { id: "copywriting", classId: "creative", name: "Копирайтинг", shelves: [{ id: "s13", groupId: "copywriting", name: "Заголовки", type: "system" }, { id: "s14", groupId: "copywriting", name: "Продающие тексты", type: "system" }] },
      { id: "design", classId: "creative", name: "Дизайн", shelves: [{ id: "s15", groupId: "design", name: "Midjourney", type: "system" }, { id: "s16", groupId: "design", name: "DALL-E", type: "system" }] },
      { id: "video", classId: "creative", name: "Видео", shelves: [{ id: "s17", groupId: "video", name: "Сценарии", type: "system" }] },
    ],
  },
  {
    id: "business",
    name: "💼 Бизнес и Управление",
    groups: [
      { id: "hr", classId: "business", name: "HR и рекрутинг", shelves: [{ id: "s18", groupId: "hr", name: "Собеседования", type: "system" }] },
      { id: "sales", classId: "business", name: "Продажи", shelves: [{ id: "s19", groupId: "sales", name: "Воронки продаж", type: "system" }] },
      { id: "analytics", classId: "business", name: "Аналитика", shelves: [{ id: "s20", groupId: "analytics", name: "Отчёты", type: "system" }] },
    ],
  },
  {
    id: "education",
    name: "🎓 Обучение и Развитие",
    groups: [
      { id: "courses", classId: "education", name: "Курсы", shelves: [{ id: "s21", groupId: "courses", name: "Структура курсов", type: "system" }] },
      { id: "training", classId: "education", name: "Тренинги", shelves: [{ id: "s22", groupId: "training", name: "Программы", type: "system" }] },
    ],
  },
  {
    id: "automation",
    name: "⚡ Автоматизация и AI-агенты",
    groups: [
      { id: "skills", classId: "automation", name: "Скилы", shelves: [{ id: "s23", groupId: "skills", name: "Бизнес-процессы", type: "system" }, { id: "s24", groupId: "skills", name: "Интеграции", type: "system" }] },
      { id: "agents", classId: "automation", name: "AI-агенты", shelves: [{ id: "s25", groupId: "agents", name: "Чат-боты", type: "system" }, { id: "s26", groupId: "agents", name: "Ассистенты", type: "system" }] },
      { id: "workflows", classId: "automation", name: "Рабочие процессы", shelves: [{ id: "s27", groupId: "workflows", name: "Автоматизация", type: "system" }] },
    ],
  },
  {
    id: "data",
    name: "📊 Данные и Аналитика",
    groups: [
      { id: "analysis", classId: "data", name: "Анализ данных", shelves: [{ id: "s28", groupId: "analysis", name: "Обработка CSV/Excel", type: "system" }] },
      { id: "visualization", classId: "data", name: "Визуализация", shelves: [{ id: "s29", groupId: "visualization", name: "Дашборды", type: "system" }] },
    ],
  },
];

// 🔹 Компонент дерева
function LibraryTree({ 
  classes, 
  selectedClass, 
  selectedGroup, 
  onSelectClass, 
  onSelectGroup 
}: { 
  classes: LibraryClass[];
  selectedClass: string | null;
  selectedGroup: string | null;
  onSelectClass: (id: string) => void;
  onSelectGroup: (id: string) => void;
}) {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  const toggleClass = (classId: string) => {
    const next = new Set(expandedClasses);
    next.has(classId) ? next.delete(classId) : next.add(classId);
    setExpandedClasses(next);
  };

  return (
    <div className="space-y-1">
      {classes.map((cls) => (
        <div key={cls.id}>
          <button
            onClick={() => { toggleClass(cls.id); onSelectClass(cls.id); }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedClass === cls.id && !selectedGroup
                ? "bg-primary/10 text-primary"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            {expandedClasses.has(cls.id) ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="truncate">{cls.name}</span>
          </button>
          
          {expandedClasses.has(cls.id) && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-slate-700 pl-3 mt-1">
              {cls.groups.map((g) => (
                <button
                  key={g.id}
                  onClick={() => onSelectGroup(g.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors ${
                    selectedGroup === g.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Folder className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{g.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 🔹 Карточка элемента (поддержка промтов и скилов)
function LibraryItemCard({ item, onToggleActive }: { item: LibraryItem; onToggleActive: (id: string) => void }) {
  const isSkill = item.type === "skill";

  return (
    <div className="group relative border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 p-4 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
      {/* Бейдж типа */}
      <div className="absolute top-3 right-3">
        {isSkill ? (
          <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
            <Zap className="h-3 w-3" /> SKILL
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] rounded-full">
            <FileText className="h-3 w-3" /> PROMPT
          </span>
        )}
      </div>

      <h3 className="font-semibold text-sm mb-1 pr-12 text-gray-900 dark:text-gray-100">{item.title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{item.description}</p>

      {/* Теги */}
      <div className="flex flex-wrap gap-1 mb-4">
        {item.tags.slice(0, 3).map((t) => (
          <span key={t} className="px-1.5 py-0.5 bg-gray-50 dark:bg-slate-800 text-[10px] text-gray-500 rounded border border-gray-200 dark:border-slate-700">
            {t}
          </span>
        ))}
      </div>

      {/* Мета для скилов */}
      {isSkill && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>v{item.version}</span>
            <span className={item.isActive ? "text-green-600" : "text-yellow-600"}>
              {item.isActive ? "● Активен" : "○ Отключен"}
            </span>
          </div>
          {/* Тоггл активации */}
          <button
            onClick={() => onToggleActive(item.id)}
            className={`p-1 rounded-full transition-colors ${
              item.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"
            }`}
            title={item.isActive ? "Отключить скил" : "Активировать скил"}
          >
            {item.isActive ? (
              <ToggleRight className="h-5 w-5" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      {/* Футер карточки */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-slate-800">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.price} {item.currency}</span>
        {isSkill ? (
          <button 
            onClick={() => onToggleActive(item.id)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-opacity ${
              item.isActive 
                ? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200" 
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {item.isActive ? "⚙️ Настроить" : "▶️ Активировать"}
          </button>
        ) : (
          <button className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:opacity-90 transition-opacity">
            📋 Копировать
          </button>
        )}
      </div>
    </div>
  );
}

// 🔹 Главная страница
export default function LibraryPage() {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "prompt" | "skill">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  
  // ✅ СТРОГО ПУСТОЙ МАССИВ. Демо удалены. Данные будут подтягиваться из API/Studio.
  const [items, setItems] = useState<LibraryItem[]>([]);

  // Фильтрация
  const filteredItems = items.filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (selectedClass && item.classId !== selectedClass) return false;
    if (selectedGroup && item.groupId !== selectedGroup) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Переключение статуса активации скила
  const handleToggleActive = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-65px)] gap-4 p-4 bg-gray-50 dark:bg-slate-950">
      
      {/* Левая панель: Дерево */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-col shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Классификация</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <LibraryTree 
            classes={MOCK_CLASSES}
            selectedClass={selectedClass}
            selectedGroup={selectedGroup}
            onSelectClass={(id) => { setSelectedClass(id); setSelectedGroup(null); }}
            onSelectGroup={(id) => { setSelectedGroup(id); }}
          />
        </div>
      </aside>

      {/* Центральная панель: Контент */}
      <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        
        {/* Хедер */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Поиск в библиотеке..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-gray-100 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Фильтры типа */}
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
              {(["all", "prompt", "skill"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    activeFilter === f 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-primary" 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {f === "all" ? "Все" : f === "prompt" ? "Промты" : "Скилы"}
                </button>
              ))}
            </div>

            {/* Переключатель вида */}
            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setViewMode("grid")} 
                className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")} 
                className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Сетка контента или пустое состояние */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {selectedClass || selectedGroup ? "В этом разделе пока пусто" : "Библиотека пуста"}
              </h3>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                {selectedClass || selectedGroup 
                  ? "Здесь будут появляться промпты и скилы, соответствующие выбранной категории. Публикуйте или покупайте контент, чтобы наполнить библиотеку."
                  : "Начните с публикации своих промптов в Маркетплейсе или приобретите готовые решения. Контент автоматически попадёт сюда."}
              </p>
              <button 
                onClick={() => navigate("/market")}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Перейти в Маркетплейс
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}>
              {filteredItems.map((item) => (
                <LibraryItemCard key={item.id} item={item} onToggleActive={handleToggleActive} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}