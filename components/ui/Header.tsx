"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "./Button";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const user = useAuthStore.getState().getUserSafe();
  const logout = useAuthStore.getState().logout;
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Apple Header Styles
  const headerStyle: React.CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "auto",
    padding: "16px 24px",
    backgroundColor: "var(--apple-surface)",
    borderBottom: "1px solid var(--apple-border)",
    boxShadow: "var(--shadow-apple-subtle)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const leftSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    font: "var(--font-section-title)",
    color: "var(--apple-text-primary)",
    margin: 0,
    padding: 0,
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };


  const userInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const userTextStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    textAlign: "right",
  };

  const userNameStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--apple-text-primary)",
    margin: 0,
    lineHeight: 1.2,
  };

  const userRoleStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 400,
    color: "var(--apple-text-secondary)",
    margin: "2px 0 0 0",
    lineHeight: 1.2,
    textTransform: "capitalize",
  };

  const avatarStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "var(--apple-text-primary)",
    color: "var(--apple-surface)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 500,
    flexShrink: 0,
  };

  return (
    <header style={headerStyle}>
      {/* Left Section */}
      <div style={leftSectionStyle}>
        {/* Title */}
        {title && <h1 style={titleStyle}>{title}</h1>}
      </div>

      {/* Right Section */}
      <div style={rightSectionStyle}>
        {/* User Info */}
        {user && (
          <div style={userInfoStyle} className="hidden sm:flex">
            <div style={userTextStyle}>
              <p style={userNameStyle}>{user.fullName}</p>
              <p style={userRoleStyle}>
                {user.role?.name || user.roleId || "Sin rol"}
              </p>
            </div>
            <div style={avatarStyle}>
              {(user.fullName?.charAt(0) || "").toUpperCase()}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          size="md"
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <LogOut 
            className="w-4 h-4"
            style={{
              transition: "opacity var(--apple-duration-fast) var(--apple-ease)",
            }}
          />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

