import React, { useState } from "react";
import { Puzzle, Info, GitBranch, LogOut, UserCircle, ShieldCheck, Copy, Check } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { SolverProvider } from "@/components/puzzle/SolverContext";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/ui/auth-modal";
import NavigationTracker from "@/lib/NavigationTracker";

export default function Layout({ children }) {
  const { user, logout, setIsAuthModalOpen, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SolverProvider>
      <SidebarProvider>
        <NavigationTracker />
        <AuthModal />
        
        <div className="min-h-screen flex w-full bg-slate-950">
          <SidebarTriggerWithLogic />

          <Sidebar className="border-r border-slate-800 bg-slate-950 text-slate-200">
            <style>{`
              :root {
                --sidebar-background: rgb(2 6 23);
                --sidebar-foreground: rgb(226 232 240);
                --sidebar-primary: rgb(99 102 241);
                --sidebar-border: rgb(30 41 59);
              }
            `}</style>

            <SidebarHeader className="border-b border-slate-800 p-6 relative group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Puzzle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white">Eternity II</h2>
                  <p className="text-xs text-slate-400">Solver & Analyzer</p>
                </div>
              </div>
              <SidebarTrigger className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-slate-300" />
            </SidebarHeader>
            
            <SidebarContent className="p-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-slate-400 uppercase tracking-wider px-3 py-2">
                  Algorithm Info
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-4 space-y-4">
                    <div className="flex items-start gap-3 text-sm leading-tight">
                        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 italic">Strict placement order & random rotation matching.</span>
                    </div>
                     <div className="flex items-start gap-3 text-sm leading-tight">
                        <GitBranch className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300 italic">Non-backtracking, brute-force statistical analysis.</span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-900/40 space-y-4">
              {/* STATUS & VERSION */}
              <div className="flex items-center justify-between px-2 pt-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-3.5 h-3.5 ${isAuthenticated ? 'text-emerald-500' : 'text-slate-600'}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isAuthenticated ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isAuthenticated ? (user?.role || 'user') : 'guest'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-700 font-bold">v2.0.6</span>
              </div>

              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <UserCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-semibold text-slate-200 truncate leading-none mb-1">
                        {user.email}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 truncate">
                          UID: {user.id.substring(0, 8)}...
                        </span>
                        <button 
                          onClick={() => copyToClipboard(user.id)}
                          className="text-slate-600 hover:text-indigo-400 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 h-9"
                    onClick={logout}
                  >
                    <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 px-1">
                  <p className="text-[11px] text-slate-500 italic text-center leading-relaxed">
                    Sign in to sync your solver progress.
                  </p>
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    Login / Register
                  </Button>
                </div>
              )}
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </SolverProvider>
  );
}

function SidebarTriggerWithLogic() {
  const { open, isMobile } = useSidebar();
  if (open || isMobile) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <SidebarTrigger className="bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 shadow-2xl" />
    </div>
  );
}
