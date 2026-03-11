import { Link } from "react-router-dom";
import { Store, Bot, Vault, Settings, FolderHeart } from "lucide-react";

const mobileNavItems = [
  { title: "Маркет", path: "/market", icon: Store },
  { title: "Studio", path: "/studio", icon: FolderHeart },
  { title: "Аккаунты", path: "/accounts", icon: Vault },
  { title: "Сообщество", path: "/community", icon: Bot },
  { title: "Ещё", path: "/settings", icon: Settings },
];

interface MobileNavProps {
  currentPath: string;
}

export function MobileNav({ currentPath }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {mobileNavItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
