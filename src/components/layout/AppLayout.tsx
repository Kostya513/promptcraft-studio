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
    <div className="min-h-screen bg-background">
      {/* Top bar - FIXED position (не скроллится) */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
        <TopBar />
      </div>

      <div className="flex">
        {/* Desktop sidebar - fixed position (только для десктопа) */}
        <div className="hidden md:block fixed left-0 top-14 bottom-0 z-40">
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
          <div className="min-h-screen container-mobile pt-14">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}