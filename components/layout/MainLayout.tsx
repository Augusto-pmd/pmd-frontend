"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Topbar } from "./Topbar";
import SidebarToggle from "./SidebarToggle";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div 
      className="flex h-screen bg-[var(--apple-canvas)] font-[Inter,system-ui,sans-serif] touch-pan-y touch-manipulation"
      style={{ 
        display: "flex", 
        height: "100vh", 
        backgroundColor: "var(--apple-canvas)",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      {/* Mobile Sidebar Toggle Button - Fixed and always visible */}
      <SidebarToggle
        open={mobileSidebarOpen}
        onToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

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
        <main 
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ 
            flex: 1, 
            overflowY: "auto",
            overflowX: "hidden"
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
