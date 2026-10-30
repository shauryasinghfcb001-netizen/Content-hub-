import React from 'react';
import { TabType, FineTuningCalibration } from '../types';
import {
  BrainCircuit,
  Activity,
  Radio,
  FolderKanban,
  Target,
  Sparkles,
  Flame,
  Zap,
  Search,
  X,
  Database,
  Clock,
  Film,
} from 'lucide-react';

interface AppSidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  calibration: FineTuningCalibration;
  onOpenParallelModal: () => void;
  onOpenCommandPalette: () => void;
  isDispatching: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenParallelModal,
  onOpenCommandPalette,
  isDispatching,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navSections: Array<{
    title: string;
    items: Array<{
      id: TabType;
      label: string;
      shortcut: string;
      icon: React.ReactNode;
      badge?: string;
    }>;
  }> = [
    {
      title: '01. CORE WORKFLOW (LIVE LOCAL)',
      items: [
        {
          id: 'focus',
          label: "Today's Priority",
          shortcut: '1',
          icon: <Target className="w-4 h-4" />,
          badge: 'Milestones',
        },
        {
          id: 'projects',
          label: 'Projects Board',
          shortcut: '2',
          icon: <FolderKanban className="w-4 h-4" />,
          badge: 'Kanban',
        },
        {
          id: 'circadian',
          label: 'Routine & Windows',
          shortcut: '3',
          icon: <Clock className="w-4 h-4" />,
          badge: 'Display',
        },
        {
          id: 'reels',
          label: 'Reel Hub Pipeline',
          shortcut: '4',
          icon: <Film className="w-4 h-4" />,
          badge: 'Module',
        },
        {
          id: 'habits',
          label: 'Habit Logger',
          shortcut: '5',
          icon: <Activity className="w-4 h-4" />,
          badge: 'Manual',
        },
        {
          id: 'loop',
          label: 'Critique Checklist',
          shortcut: '6',
          icon: <Flame className="w-4 h-4" />,
          badge: 'Cap 3',
        },
      ],
    },
    {
      title: '02. SIMULATION / DEMO PREVIEWS',
      items: [
        {
          id: 'swarm',
          label: 'Agent Harness',
          shortcut: '7',
          icon: <BrainCircuit className="w-4 h-4" />,
          badge: 'Sim/Demo',
        },
        {
          id: 'mcp',
          label: 'MCP & Notion',
          shortcut: '8',
          icon: <Database className="w-4 h-4" />,
          badge: 'Sim/Demo',
        },
        {
          id: 'twin',
          label: 'Persona Sandbox',
          shortcut: '9',
          icon: <Sparkles className="w-4 h-4" />,
          badge: 'Concept',
        },
        {
          id: 'scout',
          label: 'Research Radar',
          shortcut: '0',
          icon: <Radio className="w-4 h-4" />,
          badge: 'Sim/Demo',
        },
      ],
    },
  ];

  const handleNavClick = (id: TabType) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full select-none">
      {/* Top Workspace Header */}
      <div className="overflow-y-auto">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-xs font-mono">
              CB
            </div>
            <div>
              <div className="text-xs font-semibold text-white tracking-tight">
                CogniBrain Harness
              </div>
              <div className="text-[10px] font-mono-studio text-neutral-400">
                Execution · Reel Hub · MCP
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-neutral-400 hover:text-white rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Command Palette Trigger */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              onOpenCommandPalette();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-black border border-white/[0.08] hover:border-white/30 text-xs font-mono-studio text-neutral-400 hover:text-white transition-all group min-h-[42px]"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
              <span>Jump or Run Tool...</span>
            </div>
            <kbd className="text-[10px] bg-white/[0.08] text-neutral-400 px-1.5 py-0.5 rounded border border-white/[0.1]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Sectioned Navigation Rail */}
        <nav className="px-3 space-y-4 pb-3">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider">
                {section.title}
              </div>

              {section.items.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    data-testid={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono-studio transition-all min-h-[38px] ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-md shadow-white/5'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate pr-2">
                      <span className={isActive ? 'text-black' : 'text-neutral-400'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            isActive
                              ? 'bg-black/10 text-black'
                              : 'bg-white/[0.06] text-neutral-400 border border-white/[0.06]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      <kbd
                        className={`text-[9px] px-1 rounded hidden sm:inline ${
                          isActive ? 'text-black/50' : 'text-neutral-600'
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Future Integrations (Intended · Not Connected) */}
        <div className="px-3 pb-3">
          <div className="p-2.5 rounded-xl bg-black border border-white/[0.07] space-y-1.5 font-mono-studio">
            <div className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
              INTENDED · NOT CONNECTED YET
            </div>
            <div className="flex flex-wrap gap-1 text-[10px] text-neutral-400">
              {['Jarvis', 'Codex/ChatGPT', 'Claude', 'MiniMe', 'Hermes'].map((name) => (
                <span
                  key={name}
                  className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="p-3 border-t border-white/[0.06] space-y-2.5 bg-black">
        <button
          type="button"
          onClick={() => {
            onOpenParallelModal();
            if (onCloseMobile) onCloseMobile();
          }}
          disabled={isDispatching}
          className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all disabled:opacity-40 min-h-[42px]"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>HARNESS TRACE (DEMO)</span>
        </button>

        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between px-2 text-[11px] font-mono-studio text-neutral-400">
          <div>
            <span className="text-white block font-medium">Shaurya Singh</span>
            <span className="text-[10px] text-neutral-500 block">Manual-First LocalStorage</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-emerald-400">
            LOCAL
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-64 h-screen bg-[#050505] border-r border-white/[0.08] flex-col justify-between select-none shrink-0 sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile & Tablet Off-Canvas Drawer (< 1024px) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <aside className="fixed inset-y-0 left-0 w-72 sm:w-80 bg-[#050505] border-r border-white/[0.1] z-50 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
