import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Zap, User, Settings, LogOut, X, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface TopBarProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function TopBar({ sidebarCollapsed, onToggleSidebar }: TopBarProps) {
  const { user, isLoggedIn, getInitial, logout } = useUser();
  const { notifications, unreadCount, markAllRead, markAsRead } = useNotifications();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link to="/market" className="flex items-center gap-2">
          <div className="relative p-[1.5px] rounded-[3px] bg-gradient-to-br from-yellow-400 via-purple-600 via-blue-500 to-purple-800"><img src="/logo.png" alt="Промт-Студия" className="h-8 w-8 object-contain bg-white rounded-[2px]" /></div>
          <span className="text-lg font-bold tracking-tight">
            Промт<span className="text-gradient">-Студия</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="h-9 w-9 rounded-lg hover:bg-muted transition-colors flex items-center justify-center relative"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden animate-slide-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Уведомления</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">Прочитать все</button>
                  )}
                  <button onClick={() => setShowNotifications(false)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`px-4 py-3 border-b border-border/50 last:border-0 text-sm cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    <p className={`${!n.read ? "font-medium" : "text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => { navigate("/notifications"); setShowNotifications(false); }} className="w-full py-2.5 text-center text-xs text-primary font-medium hover:bg-muted transition-colors border-t border-border">
                Все уведомления
              </button>
            </div>
          )}
        </div>

        {/* Auth / Profile */}
        {isLoggedIn ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center gradient-primary text-primary-foreground text-xs font-bold"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                getInitial()
              )}
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden animate-slide-up">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-medium text-sm truncate">{user.name || "Пользователь"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                    {user.roleLabel || "Бизнес"}
                  </span>
                </div>
                <div className="py-1">
                  <button onClick={() => { navigate("/profile"); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                    <User className="h-4 w-4 text-muted-foreground" /> Мой профиль
                  </button>
                  <button onClick={() => { navigate("/settings"); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Настройки
                  </button>
                  <button onClick={() => { logout(); navigate("/login"); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left text-destructive">
                    <LogOut className="h-4 w-4" /> Выход
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
              Войти
            </Link>
            <Link to="/register" className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Регистрация
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
