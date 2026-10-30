import React from 'react';
import { TabType, FineTuningCalibration } from '../types';
import { ArrowUpRight, Search, Zap, Clock, Menu } from 'lucide-react';

interface AppHeaderProps {
  currentTab: TabType;
  calibration: FineTuningCalibration;
  currentHour: number;
  onOpenParallelModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenArchitecture: () => void;
  isDispatching: boolean;
  onToggleMobileMenu?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  calibration,
  currentHour,
  onOpenParallelModal,
  onOpenCommandPalette,
  onOpenArchitecture,
  isDispatching,
  onToggleMobileMenu,
}) => {
  const tabTitles: Record<TabType, string> = {
    focus: "Today's Priority & Milestones",
    projects: 'Projects Board & Priority Pipeline',
    circadian: 'Routine & Focus Windows (Scheduling Display)',
    reels: 'Reel Hub Content Pipeline (Manual-First)',
    swarm: 'Agent Harness Console (Simulation / Demo)',
    mcp: 'MCP & Notion Bridge (Simulation / Demo)',
    loop: 'Capped Critique Checklist (Max 3 Passes)',
    habits: 'Cognitive Habit Logger (Manual)',
    twin: 'Persona Sandbox (Concept Preview)',
    scout: 'Research Radar (Simulation / Demo)',
  };

  return (
    <header className="h-14 sm:h-16 border-b border-white/[0.08] bg-black/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left: Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 pr-2">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-neutral-400 hover:text-white rounded-lg border border-white/10 hover:border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-xs font-mono-studio text-neutral-500 uppercase tracking-wider hidden sm:inline shrink-0">
            CogniBrain
          </span>
          <span className="text-neutral-700 hidden sm:inline">/</span>
          <span className="text-xs font-mono-studio text-white uppercase font-bold tracking-wider truncate max-w-[160px] sm:max-w-none">
            {tabTitles[currentTab] || 'Workspace'}
          </span>
        </div>
      </div>

      {/* Center Status Line (Typographic separation) */}
      <div className="hidden xl:flex items-center space-x-3 text-xs font-mono-studio text-neutral-400">
        <Clock className="w-3.5 h-3.5 text-neutral-400" />
        <span>
          {currentHour.toString().padStart(2, '0')}:00 ·{' '}
          {(currentHour >= 9 && currentHour <= 12) || (currentHour >= 16 && currentHour <= 19)
            ? 'Peak Focus Window'
            : currentHour >= 13 && currentHour <= 15
            ? 'Slump Triage Window'
            : 'Steady Execution'}
        </span>
        <span className="text-neutral-700">·</span>
        <span>
          W{calibration.currentWeek}/16 ({calibration.digitalTwinFidelityScore}% Heuristic Index)
        </span>
      </div>

      {/* Right Header Buttons */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/[0.12] hover:border-white/30 text-xs font-mono-studio text-neutral-300 hover:text-white transition-all min-h-[40px]"
          title="Open Command Palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Commands</span>
          <kbd className="text-[10px] text-neutral-500 ml-0.5 sm:ml-1">⌘K</kbd>
        </button>

        <button
          type="button"
          onClick={onOpenArchitecture}
          className="hidden md:inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-white/[0.12] hover:border-white/30 text-xs font-mono-studio text-neutral-300 hover:text-white transition-all uppercase min-h-[40px]"
        >
          <span>SPEC</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        <button
          type="button"
          onClick={onOpenParallelModal}
          disabled={isDispatching}
          className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider transition-all disabled:opacity-40 min-h-[40px]"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span className="hidden xs:inline sm:inline">
            {isDispatching ? 'RUNNING...' : 'RUN HARNESS'}
          </span>
          <span className="xs:hidden sm:hidden">
            {isDispatching ? 'RUN' : 'RUN'}
          </span>
        </button>
      </div>
    </header>
  );
};
