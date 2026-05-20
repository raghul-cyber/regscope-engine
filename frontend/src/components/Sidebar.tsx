"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, FileText, Scale, Bug, Download,
  Shield, Settings, Menu, X
} from "lucide-react";

const NAV = [
  { name: "Dashboard",       path: "/",            icon: LayoutDashboard },
  { name: "Semantic Search",  path: "/search",     icon: Search },
  { name: "Browse Clauses",  path: "/clauses",     icon: FileText },
  { name: "Compare",         path: "/compare",     icon: Scale },
  { name: "Crawl Manager",   path: "/admin/crawl", icon: Bug, badge: "Admin" },
  { name: "Export",           path: "/export",      icon: Download },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const navContent = (
    <>
      {/* Logo */}
      <div className="p-6 pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-cyan-dim))" }}
          >
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ fontFamily: "var(--font-syne)", color: "var(--text-primary)" }}>
              RegScope
            </p>
            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
              Compliance Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <p className="section-label px-3 mb-2">Navigation</p>
        <div className="space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg mx-1 text-sm transition-all"
                style={{
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  color: active ? "var(--accent-cyan)" : "var(--text-secondary)",
                  backgroundColor: active ? "rgba(0,217,255,0.08)" : "transparent",
                  borderLeft: active ? "2px solid var(--accent-cyan)" : "2px solid transparent",
                }}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="badge-amber">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "rgba(0,217,255,0.15)", color: "var(--accent-cyan)" }}
          >
            RC
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              raghul-cyber
            </p>
            <p className="text-[10px] flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full animate-pulse-dot"
                style={{ backgroundColor: "var(--accent-green)" }}
              />
              Admin
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-40"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {navContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
        }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="md:hidden fixed left-0 top-0 bottom-0 w-60 z-40 flex flex-col"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}
