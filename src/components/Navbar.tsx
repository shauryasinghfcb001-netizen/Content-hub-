import React from 'react';
import { TabType, FineTuningCalibration } from '../types';
import { ArrowUpRight, Cpu } from 'lucide-react';

interface NavbarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  calibration: FineTuningCalibration;
  currentHour: number;
  onTriggerDispatch: () => void;
  isDispatching: boolean;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  calibration,
  currentHour,
  onTriggerDispatch,
  isDispatching,
  onOpenArchitecture,
}) => {
  const tabs: Array<{ id: TabType; number: string; label: string }> = [
    { id: 'swarm', number: '01', label: 'SWARM' },
    { id: 'circadian', number: '02', label: 'CIRCADIAN MATRIX' },
    { id: 'scout', number: '03', label: 'X & YT SCOUT' },
    { id: 'projects', number: '04', label: 'PROJECTS & 16W TWIN' },
    { id: 'loop', number: '05', label: '1-10 LOOP' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Trademark Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onSelectTab('swarm')}
          >
            <div className="flex items-center space-x-2">
              <span className="font-display font-medium text-lg tracking-tight text-white group-hover:text-neutral-300 transition-colors">
                Shaurya Studio<span className="text-xs font-mono align-super">®</span>
              </span>
              <span className="text-neutral-600 font-mono text-xs">/</span>
              <span className="font-mono-studio text-xs uppercase tracking-widest text-neutral-400">
                CogniBrain OS
              </span>
            </div>
          </div>

          {/* Center: Studio Availability / Bio Clock Status Pill */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.12] text-[11px] font-mono-studio">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 studio-glow-emerald animate-pulse" />
              <span className="text-neutral-300 tracking-wider uppercase">
                {currentHour.toString().padStart(2, '0')}:00 WINDOW ·{' '}
                {(currentHour >= 9 && currentHour <= 12) || (currentHour >= 16 && currentHour <= 19)
                  ? 'PEAK FLOW (94%)'
                  : currentHour >= 13 && currentHour <= 15
                  ? 'SLUMP TRIAGE (45%)'
                  : 'RHYTHM ACTIVE'}
              </span>
            </div>

            <div
              onClick={() => onSelectTab('projects')}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.08] hover:border-white/25 text-[11px] font-mono-studio text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              <span className="text-neutral-500">(TWIN)</span>
              <span>WEEK {calibration.currentWeek}/16</span>
              <span className="text-neutral-200">· {calibration.digitalTwinFidelityScore}%</span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenArchitecture}
              className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-white/[0.15] hover:border-white/40 bg-white/[0.02] text-xs font-mono-studio uppercase tracking-widest text-neutral-300 hover:text-white transition-all"
            >
              <span>SPECIFICATION</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>

            <button
              onClick={onTriggerDispatch}
              disabled={isDispatching}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-widest shadow-lg shadow-white/5 transition-all disabled:opacity-50"
            >
              <span>{isDispatching ? 'ORCHESTRATING...' : 'DISPATCH SWARM'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Studio Sub-Navigation Bar */}
        <nav className="flex space-x-1 sm:space-x-4 py-2.5 overflow-x-auto border-t border-white/[0.06] scrollbar-none text-[11px] font-mono-studio tracking-wider">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white bg-white/[0.07] border border-white/[0.15]'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]'
                }`}
              >
                <span className={isActive ? 'text-neutral-300' : 'text-neutral-600'}>
                  ({tab.number})
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
