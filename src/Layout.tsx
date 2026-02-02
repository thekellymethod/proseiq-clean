import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Menu,
  X,
  Scale,
  ChevronRight
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
    { name: 'Cases', href: 'Cases', icon: Briefcase },
    { name: 'Templates', href: 'Templates', icon: FileText },
  ];

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">LitMaster</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">LitMaster</h1>
                <p className="text-xs text-slate-500">Litigation Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    active 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                  {active && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white">
              <p className="text-sm font-medium">Need Help?</p>
              <p className="text-xs text-slate-300 mt-1">Access documentation and support</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-200",
        "lg:ml-64",
        "pt-16 lg:pt-0"
      )}>
        {children}
      </main>
    </div>
  );
}