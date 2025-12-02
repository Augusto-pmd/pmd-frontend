"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      backgroundColor: "var(--apple-canvas)",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      {/* Sidebar - Always visible, fixed position */}
      <Sidebar />
      
      {/* Content Area - Fixed to right of sidebar */}
      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        overflow: "hidden",
        marginLeft: "240px", // Sidebar width
        minWidth: 0, // Allow content to shrink
      }}>
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
