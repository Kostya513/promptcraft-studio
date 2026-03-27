import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DesktopSidebar } from "./DesktopSidebar";
import { TopBar } from "./TopBar";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background mobile-content-padding">
      {/* Top bar - always visible */}
      <TopBar />

      <div className="flex">
        {/* Desktop sidebar - fixed position (только для десктопа) */}
        <div className="hidden md:block fixed left-0 top-0 bottom-0 z-40">
          <DesktopSidebar
            collapsed={sidebarCollapsed}
            currentPath={location.pathname}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Main content - scrollable independently */}
        <main className={`flex-1 transition-all duration-500 ease-out ${
          sidebarCollapsed ? "md:ml-[84px]" : "md:ml-[280px]"
        }`}>
          <div className="min-h-[calc(100vh-4rem)] container-mobile">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav - УБРАНО (теперь только гамбургер) */}
    </div>
  );
}
