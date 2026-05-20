"use client";
import { usePathname } from "next/navigation";
import { Bell, Settings } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/":            "Dashboard",
  "/search":      "Semantic Search",
  "/clauses":     "Browse Clauses",
  "/compare":     "Jurisdiction Compare",
  "/admin/crawl": "Crawl Manager",
  "/export":      "Export Center",
};

export default function Topbar() {
  const pathname = usePathname();
  const title =
    PAGE_TITLES[pathname] ||
    (pathname.startsWith("/clauses/") ? "Clause Audit" : "RegScope");

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-8"
      style={{
        backgroundColor: "rgba(13,17,23,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <h2
        className="text-lg font-bold"
        style={{ fontFamily: "var(--font-syne)", color: "var(--text-primary)" }}
      >
        {title}
      </h2>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <Bell size={16} />
        </button>
        <button
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <Settings size={16} />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "rgba(0,217,255,0.15)", color: "var(--accent-cyan)" }}
        >
          RC
        </div>
      </div>
    </header>
  );
}
