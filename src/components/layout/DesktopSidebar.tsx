import { Link } from "react-router-dom";
import {
  FolderHeart, Store, Settings, Zap, Vault,
  Heart, HelpCircle, Users, Gift, Building2, FileText
} from "lucide-react";

const navItems = [
  { title: "Prompt-Market", path: "/market", icon: Store },
  { title: "Studio", path: "/studio", icon: FolderHeart },
  { title: "Менеджер аккаунтов", path: "/accounts", icon: Vault },
  { title: "Заказные промпты", path: "/custom-orders", icon: FileText },
  { title: "Команда", path: "/team", icon: Building2 },
  { title: "Сообщество", path: "/community", icon: Users },
  { title: "Избранное", path: "/favorites", icon: Heart },
  { title: "Рефералы", path: "/referrals", icon: Gift },
  { title: "Настройки", path: "/settings", icon: Settings },
  { title: "Поддержка", path: "/support", icon: HelpCircle },
];

interface DesktopSidebarProps {
  collapsed: boolean;
  currentPath: string;
}

export function DesktopSidebar({ collapsed, currentPath }: DesktopSidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="h-0" />
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <Link
          to="/settings?tab=Подписка"
          className="block p-3 m-3 rounded-xl gradient-primary text-primary-foreground cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-semibold">Промт-Студия Pro</span>
          </div>
          <p className="text-xs opacity-80">Безлимитный доступ ко всем промптам и агентам</p>
        </Link>
      )}
    </aside>
  );
}
