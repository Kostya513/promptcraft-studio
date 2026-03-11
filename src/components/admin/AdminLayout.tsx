import { useAdmin } from "@/contexts/AdminContext";
import { Navigate, Outlet, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Users, FileCheck, DollarSign, TicketCheck, Bell, Settings,
  ScrollText, LogOut, Shield
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Дашборд", icon: LayoutDashboard, permission: "dashboard" },
  { path: "/admin/users", label: "Пользователи", icon: Users, permission: "users" },
  { path: "/admin/moderation", label: "Модерация", icon: FileCheck, permission: "moderation" },
  { path: "/admin/finances", label: "Финансы", icon: DollarSign, permission: "finances" },
  { path: "/admin/tickets", label: "Тикеты", icon: TicketCheck, permission: "tickets" },
  { path: "/admin/notifications", label: "Уведомления", icon: Bell, permission: "notifications" },
  { path: "/admin/settings", label: "Настройки", icon: Settings, permission: "settings" },
  { path: "/admin/audit", label: "Аудит", icon: ScrollText, permission: "audit" },
];

const AdminLayout = () => {
  const { isAuthenticated, adminUser, logout, hasPermission } = useAdmin();

  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  const visibleNav = NAV_ITEMS.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-56 border-r p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5" />
          <span className="font-semibold text-sm">Промт-Студия Admin</span>
        </div>
        <div className="mb-4 p-2 rounded bg-muted text-xs">
          <p className="font-medium">{adminUser?.name}</p>
          <Badge variant="outline" className="mt-1 text-xs">{adminUser?.role?.replace("_", " ")}</Badge>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {visibleNav.map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded text-sm ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`
            }>
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" size="sm" onClick={logout} className="justify-start gap-2">
          <LogOut className="h-4 w-4" /> Выйти
        </Button>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
