"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Topbar } from "./Topbar";
import SidebarToggle from "./SidebarToggle";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      backgroundColor: "var(--apple-canvas)",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <SidebarToggle 
          isOpen={mobileSidebarOpen} 
          onToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)} 
        />
      </div>

      {/* Sidebar - Responsive: hidden on mobile, visible on desktop */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />
      
      {/* Content Area - Responsive margin */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 md:ml-64">
        {/* Header - Fixed to top of content area */}
        <Topbar />
        
        {/* Main Content - Scrollable */}
        <main style={{ 
          flex: 1, 
          overflowY: "auto",
          overflowX: "hidden"
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
