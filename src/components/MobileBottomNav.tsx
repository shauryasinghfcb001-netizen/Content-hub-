import React from 'react';
import { TabType } from '../types';
import {
  Terminal,
  Activity,
  FolderKanban,
  Target,
  Film,
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const tabs: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'focus',
      label: 'Priority',
      icon: <Target className="w-5 h-5" />,
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      id: 'reels',
      label: 'Reel Hub',
      icon: <Film className="w-5 h-5" />,
    },
    {
      id: 'circadian',
      label: 'Routine',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      id: 'swarm',
      label: 'Harness',
      icon: <Terminal className="w-5 h-5" />,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-md border-t border-white/[0.08] lg:hidden select-none safe-bottom"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 h-16 items-center px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all rounded-lg relative ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300 active:scale-95'
              }`}
            >
              {/* Active top subtle hairline marker */}
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-white rounded-full" />
              )}
              <div className={`${isActive ? 'scale-105' : ''} transition-transform`}>
                {tab.icon}
              </div>
              <span
                className={`text-[10px] font-mono-studio tracking-tight mt-1 truncate max-w-[64px] ${
                  isActive ? 'font-bold text-white' : 'font-normal text-neutral-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
