"use client";
import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, FileText, Scale, Bug, Download,
  ChevronLeft, ChevronRight, Menu, X, Activity, Shield,
  LogOut, Settings, Bell
} from 'lucide-react';

// ---- Sidebar collapsed context ----
const SidebarCtx = createContext({ collapsed: false });
export const useSidebar = () => useContext(SidebarCtx);

const NAV_ITEMS = [
  { name: 'Dashboard',      path: '/',            icon: LayoutDashboard,  badge: null },
  { name: 'Semantic Search', path: '/search',     icon: Search,           badge: null },
  { name: 'Browse Clauses', path: '/clauses',     icon: FileText,         badge: null },
  { name: 'Compare',        path: '/compare',     icon: Scale,            badge: null },
  { name: 'Crawl Manager',  path: '/admin/crawl', icon: Bug,              badge: 'Admin' },
  { name: 'Export',         path: '/export',      icon: Download,         badge: null },
];

function NavLink({ item, collapsed }: { item: typeof NAV_ITEMS[0], collapsed: boolean }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);

  return (
    <Link
      href={item.path}
      className={`nav-item flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium transition-all duration-150 group relative
        ${active
          ? 'active text-white'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
      data-tooltip={collapsed ? item.name : undefined}
    >
      <Icon
        size={18}
        className={`shrink-0 transition-colors ${active ? 'text-[var(--blue-400)]' : 'text-[var(--text-faint)] group-hover:text-[var(--text-muted)]'}`}
      />
      {!collapsed && (
        <span className="flex-1 truncate">{item.name}</span>
      )}
      {!collapsed && item.badge && (
        <span className="badge badge-amber py-0.5 px-1.5 text-[10px]">{item.badge}</span>
      )}
      {active && !collapsed && (
        <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[var(--blue-500)] animate-pulse-glow" />
      )}
    </Link>
  );
}

export default function NavigationShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarCtx.Provider value={{ collapsed }}>
      <div className="min-h-screen flex bg-[var(--bg-base)]">

        {/* ============ DESKTOP SIDEBAR ============ */}
        <aside
          className={`hidden md:flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-base)] shrink-0 transition-all duration-300 ease-in-out relative ${collapsed ? 'w-[68px]' : 'w-[232px]'}`}
        >
          {/* Logo */}
          <div className={`flex items-center border-b border-[var(--border-base)] h-14 shrink-0 px-3 ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[var(--blue-500)] to-[var(--purple-500)] flex items-center justify-center shrink-0">
              <Shield size={14} className="text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-white leading-tight tracking-tight">RegScope</p>
                <p className="text-[10px] text-[var(--text-faint)] leading-tight">Compliance Intelligence</p>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-base)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--blue-500)] transition-all z-10 shadow-md"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)] px-3 pb-2">
                Navigation
              </p>
            )}
            {NAV_ITEMS.map(item => (
              <NavLink key={item.path} item={item} collapsed={collapsed} />
            ))}
          </nav>

          {/* Footer */}
          <div className={`border-t border-[var(--border-base)] p-2 space-y-0.5 ${collapsed ? '' : ''}`}>
            <button className={`nav-item flex items-center gap-3 px-3 py-2.5 w-full text-sm text-[var(--text-muted)] hover:text-white ${collapsed ? 'justify-center' : ''}`} data-tooltip={collapsed ? 'Settings' : undefined}>
              <Settings size={16} className="shrink-0" />
              {!collapsed && <span>Settings</span>}
            </button>
            {!collapsed && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--blue-500)] to-[var(--purple-500)] flex items-center justify-center text-xs font-bold text-white shrink-0">
                  RC
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-white truncate">raghul-cyber</p>
                  <p className="text-[10px] text-[var(--text-faint)] flex items-center gap-1">
                    <span className="status-dot online" /> Admin
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ============ MOBILE HEADER ============ */}
        <div className="md:hidden fixed inset-x-0 top-0 z-50 h-14 flex items-center justify-between px-4 bg-[var(--bg-surface)] border-b border-[var(--border-base)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[var(--blue-500)] to-[var(--purple-500)] flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">RegScope</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white transition-colors">
              <Bell size={16} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute left-0 top-14 bottom-0 w-72 bg-[var(--bg-surface)] border-r border-[var(--border-base)] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <nav className="p-3 space-y-0.5">
                {NAV_ITEMS.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-elevated)] transition-all"
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* ============ MAIN CONTENT ============ */}
        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden md:mt-0 mt-14">
          {/* Ambient glow */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[var(--blue-500)]/4 rounded-full blur-[100px]" />
            <div className="absolute top-1/3 -left-24 w-72 h-72 bg-[var(--purple-500)]/3 rounded-full blur-[80px]" />
          </div>

          <div className="flex-1 p-5 md:p-8 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarCtx.Provider>
  );
}
