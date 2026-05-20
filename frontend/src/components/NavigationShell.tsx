"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: '📊' },
    { name: 'Semantic Search', path: '/search', icon: '🔍' },
    { name: 'Browse Clauses', path: '/clauses', icon: '📜' },
    { name: 'Compare Tool', path: '/compare', icon: '⚖️' },
    { name: 'Crawl Manager', path: '/admin/crawl', icon: '🕷️' },
    { name: 'Export Reports', path: '/export', icon: '📤' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0c10] text-[#c9d1d9] antialiased">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-[#161b22] border-r border-[#30363d] shrink-0">
        {/* Logo Section */}
        <div className="h-16 flex items-center px-6 border-b border-[#30363d] gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#58a6ff] to-[#bc8cff] flex items-center justify-center font-bold text-white shadow-lg shadow-[#58a6ff]/20">
            R
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-[#8b949e] bg-clip-text text-transparent">
            RegScope
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-[#58a6ff]/10 to-[#58a6ff]/5 text-white border border-[#58a6ff]/30 shadow-inner'
                    : 'hover:bg-[#1f242c]/50 text-[#8b949e] hover:text-white border border-transparent'
                }`}
              >
                <span className={`text-lg transition-transform duration-200 ${!active && 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.name}</span>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#58a6ff] shadow-lg shadow-[#58a6ff]/50 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User / Footer */}
        <div className="p-4 border-t border-[#30363d] bg-[#0d1117]/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7ee787] to-[#58a6ff] flex items-center justify-center font-bold text-slate-900 text-xs">
            RC
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">raghul-cyber</p>
            <p className="text-xs text-[#8b949e] truncate">Compliance Admin</p>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden h-16 flex items-center justify-between px-6 bg-[#161b22] border-b border-[#30363d] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#58a6ff] to-[#bc8cff] flex items-center justify-center font-bold text-white">
            R
          </div>
          <span className="font-bold text-lg text-white">RegScope</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#1f242c] border border-[#30363d] text-white focus:outline-none"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#0a0c10]/95 backdrop-blur-md pt-20 px-6">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${
                    active
                      ? 'bg-[#58a6ff]/10 text-white border-[#58a6ff]/30'
                      : 'bg-[#161b22]/50 text-[#8b949e] border-[#30363d]/50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Subtle glowing ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#58a6ff]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-[#bc8cff]/3 rounded-full blur-[80px] pointer-events-none -z-10" />
        
        <div className="flex-1 p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
