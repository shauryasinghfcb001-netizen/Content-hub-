import React, { useState, useEffect } from 'react';
import { TabType } from '../types';
import {
  BrainCircuit,
  Activity,
  Radio,
  FolderKanban,
  Sparkles,
  Flame,
  Zap,
  Target,
  RefreshCw,
  FileCode2,
  Search,
  PlugZap,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: TabType) => void;
  onTriggerParallelModal: () => void;
  onTriggerSocialSweep: () => void;
  onOpenArchitecture: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onTriggerParallelModal,
  onTriggerSocialSweep,
  onOpenArchitecture,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'nav-focus',
      label: "Navigate: Today's Priority & Milestones",
      category: '01. Core Workflow',
      shortcut: '1',
      icon: <Target className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectTab('focus');
        onClose();
      },
    },
    {
      id: 'nav-projects',
      label: 'Navigate: Projects Board & Priority Selector',
      category: '01. Core Workflow',
      shortcut: '2',
      icon: <FolderKanban className="w-4 h-4 text-neutral-400" />,
      action: () => {
        onSelectTab('projects');
        onClose();
      },
    },
    {
      id: 'nav-circadian',
      label: 'Navigate: Routine & Adjustable Focus Windows',
      category: '01. Core Workflow',
      shortcut: '3',
      icon: <Activity className="w-4 h-4 text-neutral-400" />,
      action: () => {
        onSelectTab('circadian');
        onClose();
      },
    },
    {
      id: 'nav-swarm',
      label: 'Navigate: Agent & Tool Harness Console',
      category: '02. Agent Harness & MCP',
      shortcut: '4',
      icon: <BrainCircuit className="w-4 h-4 text-neutral-400" />,
      action: () => {
        onSelectTab('swarm');
        onClose();
      },
    },
    {
      id: 'nav-mcp',
      label: 'Navigate: MCP Connectors & Notion Bridge (Sandbox)',
      category: '02. Agent Harness & MCP',
      shortcut: '5',
      icon: <PlugZap className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectTab('mcp');
        onClose();
      },
    },
    {
      id: 'nav-loop',
      label: 'Navigate: Capped Critique Checklist (Max 3 Passes)',
      category: '03. Sandbox & Telemetry',
      shortcut: '6',
      icon: <Flame className="w-4 h-4 text-neutral-400" />,
      action: () => {
        onSelectTab('loop');
        onClose();
      },
    },
    {
      id: 'nav-habits',
      label: 'Navigate: Cognitive Habit Telemetry Logger',
      category: '03. Sandbox & Telemetry',
      shortcut: '7',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onSelectTab('habits');
        onClose();
      },
    },
    {
      id: 'nav-twin',
      label: 'Navigate: Persona Simulation & Habit Studio',
      category: '03. Sandbox & Telemetry',
      shortcut: '8',
      icon: <Sparkles className="w-4 h-4 text-neutral-400" />,
      action: () => {
        onSelectTab('twin');
        onClose();
      },
    },
    {
      id: 'nav-scout',
      label: 'Navigate: Research Radar (Simulated Feed)',
      category: '03. Sandbox & Telemetry',
      shortcut: '9',
      icon: <Radio className="w-4 h-4 text-neutral-400" />,
      action: () => {
        onSelectTab('scout');
        onClose();
      },
    },
    {
      id: 'parallel-swarm',
      label: 'Run Parallel Agent Harness Dispatch',
      category: 'Actions',
      shortcut: 'D',
      icon: <Zap className="w-4 h-4 text-white" />,
      action: () => {
        onTriggerParallelModal();
        onClose();
      },
    },
    {
      id: 'social-sweep',
      label: 'Refresh Simulated Research Radar Feed',
      category: 'Actions',
      shortcut: 'S',
      icon: <RefreshCw className="w-4 h-4 text-white" />,
      action: () => {
        onTriggerSocialSweep();
        onClose();
      },
    },
    {
      id: 'action-spec',
      label: 'View Master Architecture & System Prompt Specification',
      category: 'System',
      shortcut: 'O',
      icon: <FileCode2 className="w-4 h-4 text-neutral-400" />,
      action: () => {
        onOpenArchitecture();
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-xl rounded-2xl bg-[#080808] border border-white/[0.15] shadow-2xl overflow-hidden font-mono-studio">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/[0.08] flex items-center space-x-3">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to view..."
            className="w-full bg-transparent text-sm text-white focus:outline-none placeholder-neutral-500"
          />
          <kbd className="text-[10px] text-neutral-500 border border-white/10 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white text-left text-xs text-neutral-300 hover:text-black transition-all group"
            >
              <div className="flex items-center space-x-3">
                <span className="p-1.5 rounded-lg bg-black border border-white/[0.08] group-hover:border-black/20 group-hover:bg-neutral-100">
                  {cmd.icon}
                </span>
                <div>
                  <span className="font-semibold block">{cmd.label}</span>
                  <span className="text-[10px] text-neutral-500 group-hover:text-black/60 uppercase">
                    {cmd.category}
                  </span>
                </div>
              </div>

              <kbd className="text-[10px] px-2 py-0.5 rounded bg-black border border-white/10 text-neutral-400 group-hover:border-black/20 group-hover:text-black font-bold">
                {cmd.shortcut}
              </kbd>
            </button>
          ))}

          {filteredCommands.length === 0 && (
            <div className="p-6 text-center text-xs text-neutral-500">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="p-3 border-t border-white/[0.06] bg-black flex items-center justify-between text-[11px] text-neutral-500">
          <span>NAVIGATION & SHORTCUT MATRIX</span>
          <span>PRESS ↵ TO EXECUTE</span>
        </div>
      </div>
    </div>
  );
};
