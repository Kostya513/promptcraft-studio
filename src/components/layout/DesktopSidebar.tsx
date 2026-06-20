import { Link } from "react-router-dom";
import {
  FolderHeart, Store, Settings, Zap, Vault,
  Flag, HelpCircle, Users, Gift, Building2, FileText,
  Menu, ChevronLeft, BookOpen
} from "lucide-react";

const navItems = [
  { title: "Меню", path: "#toggle", icon: Menu, isToggle: true },
  { title: "Prompt-Market", path: "/market", icon: Store },
  { title: "Библиотека", path: "/library", icon: BookOpen },
  { title: "Студия", path: "/studio", icon: FolderHeart },
  { title: "Менеджер аккаунтов", path: "/accounts", icon: Vault },
  { title: "Заказные промпты", path: "/custom-orders", icon: FileText },
  { title: "Команда", path: "/team", icon: Building2 },
  { title: "Сообщество", path: "/community", icon: Users },
  { title: "Избранное", path: "/favorites", icon: Flag },
  { title: "Рефералы", path: "/referrals", icon: Gift },
  { title: "Настройки", path: "/settings", icon: Settings },
  { title: "Поддержка", path: "/support", icon: HelpCircle },
];

interface DesktopSidebarProps {
  collapsed: boolean;
  currentPath: string;
  onToggle: () => void;
}

export function DesktopSidebar({ collapsed, currentPath, onToggle }: DesktopSidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col transition-all duration-500 ease-out ${
        collapsed ? "w-[84px]" : "w-[280px]"
      }`}
    >
      {/* Премиальная панель-колонна */}
      {/* ✅ ИЗМЕНЕНО: h-[calc(100vh-16px)] выравнивает нижний отступ по верхнему (mt-1) */}
      <div 
        className="flex flex-col h-[calc(100vh-65px)] mx-3 mt-1 mb-1 rounded-[12px] overflow-hidden backdrop-blur-xl bg-gradient-to-b from-white/80 via-white/60 to-white/70 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-slate-900/70 border border-white/20 dark:border-slate-700/30 shadow-2xl shadow-primary/5"
      >
        {/* Навигация: фиксирована сверху */}
        <nav className="flex-1 py-0.5 px-2 space-y-0">
          {navItems.map((item, index) => {
            const isActive = !item.isToggle && currentPath && (currentPath === item.path || currentPath.startsWith(item.path + "/"));
            
            // Кнопка переключения (первый элемент)
            if (item.isToggle) {
              return (
                <button
                  key={item.path + index}
                  onClick={onToggle}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1 rounded-[8px] text-sm font-medium transition-all duration-300 group cursor-pointer bg-primary/5 hover:bg-primary/10 text-muted-foreground hover:text-primary"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-[6px] flex-shrink-0">
                    {collapsed ? (
                      <Menu className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                    )}
                  </div>
                  {!collapsed && (
                    <span className="truncate text-xs">Меню</span>
                  )}
                </button>
              );
            }
            
            // Обычные ссылки навигации
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-1 rounded-[8px] text-sm font-medium transition-all duration-300 group relative ${
                  isActive
                    ? "bg-gradient-to-r from-primary/15 to-primary/8 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {/* Индикатор активности */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
                
                {/* Иконка */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-[6px] transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}>
                  <item.icon className="h-4 w-4" strokeWidth={2} />
                </div>
                
                {/* Текст */}
                {!collapsed && (
                  <span className="truncate transition-opacity duration-300 text-xs">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ✅ Pro блок: теперь стоит ровно по нижней границе */}
        <div className="p-1.5 mt-0 flex-shrink-0">
          <Link
            to="/settings?tab=Подписка"
            className={`flex items-center gap-2.5 p-2 rounded-[8px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white cursor-pointer hover:opacity-90 transition-all duration-300 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-white/20 flex-shrink-0">
              <Zap className="h-4 w-4" strokeWidth={2} />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold">Промт-Студия Pro</div>
                <p className="text-[10px] opacity-80 truncate">Безлимитный доступ</p>
              </div>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}