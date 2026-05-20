"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarStore } from "@/lib/sidebarStore";

export default function Header() {
  const pathname = usePathname();
  const isLearn = pathname.startsWith("/learn");

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "var(--header-height)",
        background: "#0d1117",
        borderBottom: "1px solid #21262d",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        gap: "16px",
      }}
    >
      {/* Hamburger — mobile only, inside learn pages */}
      {isLearn && (
        <button
          className="md:hidden"
          onClick={() => sidebarStore.toggle()}
          aria-label="Toggle sidebar"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px",
            color: "#8b949e",
            lineHeight: 0,
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <rect x="2" y="4" width="16" height="2" rx="1" />
            <rect x="2" y="9" width="16" height="2" rx="1" />
            <rect x="2" y="14" width="16" height="2" rx="1" />
          </svg>
        </button>
      )}

      {/* Logo */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textDecoration: "none",
          flexShrink: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "linear-gradient(135deg, #238636, #2ea043)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#e6edf3",
            letterSpacing: "-0.01em",
          }}
        >
          Fullstack Masters
        </span>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            color: "#8b949e",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#e6edf3")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8b949e")}
          aria-label="GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </div>
    </header>
  );
}
