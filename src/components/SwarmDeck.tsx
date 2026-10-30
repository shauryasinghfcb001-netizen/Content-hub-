import React, { useState } from 'react';
import {
  SubagentInfo,
  OrchestratorDispatchResult,
  LoopIteration,
  ProjectItem,
  MCPServerConfig,
} from '../types';
import {
  ArrowUpRight,
  Check,
  Sparkles,
  Target,
  TrendingUp,
  Terminal,
  Database,
  Play,
  RefreshCw,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  generateSessionTelemetryTrend,
  buildHarnessExecutionTrace,
  getIntendedFutureIntegrations,
} from '../utils/cogniLogic';

interface SwarmDeckProps {
  onDispatch: (mode: string, goal: string) => Promise<void>;
  isDispatching: boolean;
  latestDispatch: OrchestratorDispatchResult | null;
  latestLoop: { iterations: LoopIteration[]; finalApprovedStrategy: string; finalScore: number } | null;
  onOpenLoopArena: () => void;
  onOpenScoutHub: () => void;
  onOpenFocusGoal?: () => void;
  onOpenMCPHub?: () => void;
  onExportToNotion?: (title: string) => void;
  topProject?: ProjectItem | null;
  totalInteractions?: number;
  mcpServers?: MCPServerConfig[];
  projects?: ProjectItem[];
  currentHour?: number;
}

export const SwarmDeck: React.FC<SwarmDeckProps> = ({
  onDispatch,
  isDispatching,
  latestDispatch,
  latestLoop,
  onOpenLoopArena,
  onOpenScoutHub,
  onOpenFocusGoal,
  onOpenMCPHub,
  onExportToNotion,
  topProject,
  totalInteractions = 342,
  mcpServers = [],
  projects = [],
  currentHour = 10,
}) => {
  const [activeSection, setActiveSection] = useState<'harness' | 'topology' | 'telemetry'>('harness');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('orchestrator');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [activeMode, setActiveMode] = useState<string>('daily_pulse');
  const [chartMode, setChartMode] = useState<'correlation' | 'lift'>('correlation');
  const [expandedStepId, setExpandedStepId] = useState<string | null>('step-1');

  const trendTelemetry = generateSessionTelemetryTrend(
    totalInteractions,
    latestLoop?.finalScore || 9.6
  );

  const activeMcpIds =
    mcpServers.length > 0
      ? mcpServers.filter((s) => s.status === 'connected').map((s) => s.id)
      : ['notion', 'github', 'gcal', 'scout'];

  const harnessSteps = buildHarnessExecutionTrace(
    customGoal || 'Sync Notion workspace, verify bio-rhythm window, and align active builds',
    activeMode,
    activeMcpIds,
    projects.length > 0 ? projects : topProject ? [topProject] : [],
    currentHour
  );

  const subagents: SubagentInfo[] = [
    {
      id: 'chronos',
      name: 'Chronos-Sync',
      codename: 'AGENT_CHRONO_01',
      role: 'Circadian Chronobiology & Message/Email Triage',
      status: 'active',
      cadence: 'Hourly Telemetry & Slump Quarantine',
      lastExecution: 'Just now',
      tasksCompleted: 48,
      resonance: 98,
      color: 'bg-white',
    },
    {
      id: 'scout',
      name: 'Nexus-Scout',
      codename: 'AGENT_RADAR_02',
      role: 'Twitter (3x/day) & YouTube (2x/day) AI Intelligence Harvester',
      status: 'active',
      cadence: '3x Twitter / 2x YouTube',
      lastExecution: '28m ago',
      tasksCompleted: 92,
      resonance: 96,
      color: 'bg-neutral-300',
    },
    {
      id: 'synthesis',
      name: 'Synthesis-Engine',
      codename: 'AGENT_SYNTH_03',
      role: 'Cross-Maps Breakthroughs to Active & Pending Projects',
      status: 'active',
      cadence: 'On-Demand & Scheduled',
      lastExecution: '14m ago',
      tasksCompleted: 64,
      resonance: 97,
      color: 'bg-neutral-400',
    },
    {
      id: 'mirror',
      name: 'Cogni-Mirror',
      codename: 'AGENT_TWIN_04',
      role: '16-Week Personal Digital Twin Persona Assimilator',
      status: 'active',
      cadence: 'Continuous Fine-Tuning',
      lastExecution: '5m ago',
      tasksCompleted: 142,
      resonance: 94,
      color: 'bg-neutral-200',
    },
    {
      id: 'critic',
      name: 'Evaluation-Critic',
      codename: 'AGENT_CRITIC_05',
      role: '1-10 Benchmark Rating Loop (Rejects < 9.5)',
      status: 'looping',
      cadence: 'Gatekeeper on every plan',
      lastExecution: 'Just now',
      tasksCompleted: 86,
      resonance: 99,
      color: 'bg-emerald-400',
    },
  ];

  const handleRunHarnessTask = (mode: string, goal: string) => {
    setActiveMode(mode);
    setCustomGoal(goal);
    onDispatch(mode, goal);
  };

  return (
    <div className="space-y-8">
      {/* Top Workspace Header & Clean Section Switcher */}
      <section className="pb-6 border-b border-white/[0.08] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-studio text-neutral-400">
            <span className="text-white font-bold">CogniBrain Agent Harness</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">
              MCP Sandbox ({activeMcpIds.join(', ')})
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">Critique Checklist (Capped at 3 Passes)</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-normal text-white tracking-tight">
            Agent &amp; Tool Harness Console
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Run multi-step tool traces across your Priority Project, Notion MCP sandbox, and adjustable focus windows. Critique scores are capped at 3 passes and serve as a heuristic checklist rather than formal proof.
          </p>
        </div>

        {/* Clean 3-Section Switcher (Eliminates vertical clutter) */}
        <div className="flex items-center gap-1 p-1 bg-[#0a0a0a] border border-white/[0.08] rounded-xl self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveSection('harness')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
              activeSection === 'harness'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            01. Agent Harness
          </button>
          <button
            onClick={() => setActiveSection('topology')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
              activeSection === 'topology'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            02. Subagents (5)
          </button>
          <button
            onClick={() => setActiveSection('telemetry')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
              activeSection === 'telemetry'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            03. Telemetry Trend
          </button>
        </div>
      </section>

      {/* P0 Honest Status Banner: SwarmDeck Simulation Notice */}
      <div
        data-testid="swarm-simulation-banner"
        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-studio text-amber-200"
      >
        <div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold mr-2 uppercase">
            SIMULATION / DEMO
          </span>
          <strong>Honest Status Label:</strong> SwarmDeck traces, subagent roles, tool names, and latency numbers are simulated demo outputs until real agent runs are wired.
        </div>
        <span className="text-[10px] text-amber-300/80 uppercase shrink-0">
          STATUS: SIMULATION / DEMO
        </span>
      </div>

      {/* P0 Future Integrations Row (Jarvis, Codex/ChatGPT, Claude, MiniMe, Hermes) */}
      <div
        data-testid="future-integrations-row"
        className="p-4 rounded-2xl bg-[#070707] border border-white/[0.08] space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-studio">
          <span className="font-bold text-white uppercase tracking-wider">
            Future Vision Integrations (Intended · Not Connected)
          </span>
          <span className="text-[11px] text-amber-300">
            Mock/simulated output never counts as connected — each awaits your explicit go-ahead
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {getIntendedFutureIntegrations().map((integ) => (
            <div
              key={integ.id}
              className="p-3 rounded-xl bg-black border border-white/[0.07] space-y-1 font-mono-studio"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-white">{integ.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] uppercase font-bold">
                  Not Connected
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-snug">
                {integ.roleDescription}
              </p>
              <div className="text-[9px] text-neutral-500 uppercase pt-0.5">
                {integ.statusLabel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================================
          SECTION 01: CLAUDE / CODEX STYLE AGENT HARNESS CONSOLE
         ===================================================================== */}
      {activeSection === 'harness' && (
        <div className="space-y-6">
          {/* Active Context Strip: Focus Project + Connected MCP Bridge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Active Build Context */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#060606] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono-studio text-neutral-400">
                  <span>Active Target Context</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-white">{topProject?.priority?.toUpperCase() || 'CRITICAL'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{topProject?.progress || 72}% Complete</span>
                </div>
                <h2 className="text-base font-semibold text-white truncate">
                  {topProject?.title || 'CogniBrain Autonomous Multi-Agent Kernel'}
                </h2>
              </div>

              {onOpenFocusGoal && (
                <button
                  onClick={onOpenFocusGoal}
                  className="px-3.5 py-2 rounded-xl border border-white/[0.15] hover:border-white/40 text-xs font-mono-studio text-white transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center min-h-[38px]"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Open Focus Sprint</span>
                </button>
              )}
            </div>

            {/* Connected MCP Tools Status */}
            <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl bg-[#060606] border border-white/[0.08] flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono-studio text-emerald-400">
                  <Database className="w-3.5 h-3.5" />
                  <span>Notion & MCP Bridge Ready</span>
                </div>
                <div className="text-xs font-mono-studio text-neutral-400 truncate">
                  Tools: notion · github · gcal · scout
                </div>
              </div>

              {onOpenMCPHub && (
                <button
                  onClick={onOpenMCPHub}
                  className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold transition-all flex items-center gap-1.5 shrink-0 min-h-[38px]"
                >
                  <span>MCP Hub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Main Agent Harness Prompt & Tool Runner */}
          <div className="rounded-2xl bg-[#050505] border border-white/[0.1] overflow-hidden">
            {/* Harness Prompt Input Header */}
            <div className="p-4 sm:p-6 border-b border-white/[0.08] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-mono-studio text-neutral-300">
                  <Terminal className="w-4 h-4 text-white" />
                  <span className="font-bold text-white">Task Prompt & Tool Runner</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-500">Select a preset command or enter custom instructions</span>
                </div>
                <button
                  onClick={onOpenLoopArena}
                  className="text-xs font-mono-studio text-neutral-400 hover:text-white underline self-start sm:self-auto"
                >
                  Critique Gatekeeper (&gt;= 9.5) ↗
                </button>
              </div>

              {/* Command Input Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="custom-goal-input"
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="Ask the harness to sync Notion, triage your schedule, or align AI research with your repos..."
                  className="flex-1 bg-black border border-white/[0.14] focus:border-white rounded-xl px-4 py-3 text-xs sm:text-sm font-mono-studio text-white placeholder-neutral-500 focus:outline-none min-h-[44px]"
                />
                <button
                  onClick={() =>
                    handleRunHarnessTask(
                      'custom',
                      customGoal.trim() || 'Execute full Notion MCP sync and daily alignment'
                    )
                  }
                  disabled={isDispatching}
                  className="px-6 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-40 text-xs font-mono-studio font-bold transition-all flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isDispatching ? 'Running Harness...' : 'Run Agent'}</span>
                </button>
              </div>

              {/* 4 Clean Task Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                <button
                  onClick={() =>
                    handleRunHarnessTask(
                      'daily_pulse',
                      'Sync Notion database, run X (3x) & YouTube (2x) radar, and lock today’s peak coding block.'
                    )
                  }
                  disabled={isDispatching}
                  className="p-3 rounded-xl bg-black border border-white/[0.08] hover:border-white/30 text-left transition-all"
                >
                  <div className="text-xs font-mono-studio font-semibold text-white">
                    01. Daily Pulse + Notion Sync
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Pull Notion tasks & align day
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleRunHarnessTask(
                      'circadian_strat',
                      'Audit current biological energy hour, lock peak deep work, and quarantine inbox until 14:00.'
                    )
                  }
                  disabled={isDispatching}
                  className="p-3 rounded-xl bg-black border border-white/[0.08] hover:border-white/30 text-left transition-all"
                >
                  <div className="text-xs font-mono-studio font-semibold text-white">
                    02. Circadian Focus Lock
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Peak flow vs slump quarantine
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleRunHarnessTask(
                      'project_alignment',
                      'Harvest top AI breakthroughs from X & YouTube and attach upgrades to ongoing project repos.'
                    )
                  }
                  disabled={isDispatching}
                  className="p-3 rounded-xl bg-black border border-white/[0.08] hover:border-white/30 text-left transition-all"
                >
                  <div className="text-xs font-mono-studio font-semibold text-white">
                    03. Repo & Radar Synthesis
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Cross-map AI tools to builds
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleRunHarnessTask(
                      'loop_benchmark',
                      'Draft execution strategy and run recursive self-critique loop until score >= 9.5 / 10.'
                    )
                  }
                  disabled={isDispatching}
                  className="p-3 rounded-xl bg-black border border-white/[0.08] hover:border-white/30 text-left transition-all"
                >
                  <div className="text-xs font-mono-studio font-semibold text-white">
                    04. Verify Plan (&gt;= 9.5 Gate)
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    Recursive critic loop
                  </div>
                </button>
              </div>
            </div>

            {/* Step-by-Step Tool Call Execution Trace (Claude Code / Codex Style) */}
            <div className="p-4 sm:p-6 bg-black/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-studio text-neutral-400">
                <span>Tool Execution Trace (4 Steps Completed)</span>
                {onExportToNotion && (
                  <button
                    onClick={() =>
                      onExportToNotion(
                        `Harness Run: ${topProject?.title || 'Daily Strategy Synthesis'}`
                      )
                    }
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Database className="w-3 h-3" />
                    <span>Save Trace to Notion</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {harnessSteps.map((step) => {
                  const isExpanded = expandedStepId === step.id;
                  return (
                    <div
                      key={step.id}
                      className="rounded-xl bg-[#070707] border border-white/[0.08] overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                        className="w-full px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-xs font-mono-studio text-neutral-400 shrink-0">
                            0{step.stepNumber}. {step.agentOrServer}
                          </span>
                          <span className="text-xs font-mono-studio font-bold text-white truncate">
                            {step.toolName}()
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-mono-studio text-neutral-400 shrink-0">
                          <span className="truncate max-w-xs hidden md:inline">
                            {step.outputSummary}
                          </span>
                          <span className="text-neutral-500">{step.durationMs}ms</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3.5 pt-2 border-t border-white/[0.06] bg-black space-y-2 text-xs font-mono-studio">
                          <div className="text-neutral-400">
                            <span className="text-neutral-500">Arguments: </span>
                            <code className="text-neutral-300">{step.inputArgs}</code>
                          </div>
                          <div className="text-emerald-300">
                            <span className="text-neutral-500">Result: </span>
                            <span>{step.outputSummary}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Structured Synthesis Output (Cleanly Sectioned) */}
          {latestDispatch && (
            <div className="p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
                <div>
                  <div className="text-xs font-mono-studio text-neutral-400">
                    Synthesized Agent Output · Certified {latestLoop?.finalScore || 9.6} / 10
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-0.5">
                    Active Execution Plan & Repo Alignments
                  </h3>
                </div>

                <button
                  onClick={onOpenLoopArena}
                  className="text-xs font-mono-studio text-white hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>Inspect Critique Trace ({latestLoop?.finalScore || 9.6}/10)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-xs font-mono-studio text-neutral-400">
                    01. Circadian Schedule Verdict
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
                    {latestDispatch.circadianVerdict}
                  </p>
                  <p className="text-xs font-mono-studio text-neutral-400 pt-1">
                    Triage: {latestDispatch.inboxStrat}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono-studio text-neutral-400">
                    02. X (3x) & YouTube (2x) Radar
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-neutral-200">
                    {latestDispatch.twitterInsights.slice(0, 2).map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono-studio text-neutral-400">
                    03. Project Repo Upgrades
                  </div>
                  <div className="space-y-2.5">
                    {latestDispatch.projectAlignments.slice(0, 2).map((align, i) => (
                      <div key={i} className="text-xs">
                        <div className="font-semibold text-white">{align.projectTitle}</div>
                        <div className="text-neutral-400 mt-0.5 leading-relaxed">
                          {align.recommendedUpgrade}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-1.5">
                <div className="text-xs font-mono-studio text-neutral-400">
                  04. Master Approved Directive
                </div>
                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {latestLoop?.finalApprovedStrategy || latestDispatch.preliminaryStrategy}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          SECTION 02: SUBAGENT TOPOLOGY & NODE REGISTRY
         ===================================================================== */}
      {activeSection === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Node Mesh */}
          <div className="lg:col-span-7 rounded-2xl bg-[#050505] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <span className="text-xs font-mono-studio text-neutral-400">
                01. Multi-Agent Control Plane Topology
              </span>
              <span className="text-xs font-mono-studio text-emerald-400">
                5 Subagents Online
              </span>
            </div>

            <div className="relative w-full aspect-[16/10] my-4 rounded-xl bg-black border border-white/[0.06] flex items-center justify-center overflow-hidden">
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="50%" y1="50%" x2="50%" y2="14%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="82%" y2="24%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="78%" y2="82%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="22%" y2="82%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="50%" y1="50%" x2="18%" y2="24%" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
              </svg>

              <button
                onClick={() => setSelectedAgentId('orchestrator')}
                className={`relative z-20 flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border transition-all ${
                  selectedAgentId === 'orchestrator'
                    ? 'border-white bg-white text-black font-bold'
                    : 'border-white/20 bg-neutral-950 text-white hover:border-white/60'
                }`}
              >
                <span className="text-[11px] font-mono-studio">COGNI</span>
                <span className="text-[9px] font-mono-studio opacity-75">HARNESS</span>
              </button>

              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <button
                  onClick={() => setSelectedAgentId('chronos')}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono-studio transition-all ${
                    selectedAgentId === 'chronos'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/15 bg-black text-neutral-300'
                  }`}
                >
                  01. Chronos-Sync
                </button>
              </div>

              <div className="absolute top-10 right-4 sm:right-6">
                <button
                  onClick={() => setSelectedAgentId('scout')}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono-studio transition-all ${
                    selectedAgentId === 'scout'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/15 bg-black text-neutral-300'
                  }`}
                >
                  02. Nexus-Scout
                </button>
              </div>

              <div className="absolute bottom-6 right-6 sm:right-8">
                <button
                  onClick={() => setSelectedAgentId('synthesis')}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono-studio transition-all ${
                    selectedAgentId === 'synthesis'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/15 bg-black text-neutral-300'
                  }`}
                >
                  03. Synthesis
                </button>
              </div>

              <div className="absolute bottom-6 left-6 sm:left-8">
                <button
                  onClick={() => setSelectedAgentId('mirror')}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono-studio transition-all ${
                    selectedAgentId === 'mirror'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/15 bg-black text-neutral-300'
                  }`}
                >
                  04. Cogni-Mirror
                </button>
              </div>

              <div className="absolute top-10 left-4 sm:left-6">
                <button
                  onClick={() => setSelectedAgentId('critic')}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono-studio transition-all ${
                    selectedAgentId === 'critic'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-white/15 bg-black text-neutral-300'
                  }`}
                >
                  05. Critic Gate
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono-studio">
              <span className="text-neutral-400">
                Selected Role:{' '}
                <strong className="text-white">
                  {selectedAgentId === 'orchestrator'
                    ? 'Master Agent Harness & MCP Supervisor'
                    : subagents.find((a) => a.id === selectedAgentId)?.role}
                </strong>
              </span>
            </div>
          </div>

          {/* Right: Subagent Details List */}
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-3">
            <div className="text-xs font-mono-studio text-neutral-400 pb-2 border-b border-white/[0.06]">
              02. Subagent Registry & Cadence
            </div>
            <div className="divide-y divide-white/[0.06]">
              {subagents.map((agent, i) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:opacity-90"
                >
                  <div className="space-y-0.5 pr-3">
                    <div className="text-sm font-medium text-white">
                      0{i + 1}. {agent.name}
                    </div>
                    <div className="text-xs text-neutral-400">{agent.role}</div>
                    <div className="text-[11px] font-mono-studio text-neutral-500">
                      {agent.cadence} · Last run {agent.lastExecution}
                    </div>
                  </div>
                  <span className="text-xs font-mono-studio text-emerald-400 shrink-0">
                    {agent.resonance}% Sync
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECTION 03: RECHARTS 10-SESSION TELEMETRY VISUALIZATION
         ===================================================================== */}
      {activeSection === 'telemetry' && (
        <section className="p-5 sm:p-8 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-white/[0.08] gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono-studio text-neutral-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Telemetry Analytics</span>
                <span aria-hidden="true">·</span>
                <span>Last 10 Sessions (S-01 → S-10)</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-normal text-white tracking-tight">
                Total Interactions vs. Average Dispatch Rating
              </h3>
              <p className="text-xs text-neutral-400 font-sans max-w-2xl">
                Tracks how cumulative telemetry interactions sharpen CogniBrain&apos;s initial strategy baseline and accelerate recursive gatekeeper convergence above the <strong className="text-white">&gt;= 9.5 / 10</strong> standard.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-black border border-white/[0.08] rounded-xl self-start lg:self-center">
              <button
                onClick={() => setChartMode('correlation')}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
                  chartMode === 'correlation'
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Interactions vs. Rating
              </button>
              <button
                onClick={() => setChartMode('lift')}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
                  chartMode === 'lift'
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Pre-Loop vs. Certified Lift
              </button>
            </div>
          </div>

          {/* 4 Summary Telemetry KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-mono-studio text-neutral-400 block">
                Total Interactions (S-10)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono-studio font-bold text-white tabular-nums">
                  {totalInteractions}
                </span>
                <span className="text-xs font-mono-studio text-emerald-400">
                  +{trendTelemetry.interactionGrowthDelta} (10-Sess)
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-mono-studio text-neutral-400 block">
                10-Session Avg Rating
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono-studio font-bold text-white tabular-nums">
                  {trendTelemetry.meanDispatchRating.toFixed(2)}
                </span>
                <span className="text-xs font-mono-studio text-neutral-400">/ 10.0</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-mono-studio text-neutral-400 block">
                Avg Critique Loop Lift
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono-studio font-bold text-emerald-400 tabular-nums">
                  +{trendTelemetry.avgCritiqueLift.toFixed(2)}
                </span>
                <span className="text-xs font-mono-studio text-neutral-400">pts / run</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[11px] font-mono-studio text-neutral-400 block">
                Rating Trajectory Delta
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono-studio font-bold text-white tabular-nums">
                  +{trendTelemetry.ratingImprovementDelta.toFixed(1)}
                </span>
                <span className="text-xs font-mono-studio text-emerald-400">
                  9.2 → {trendTelemetry.sessions[9].avgDispatchRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="p-4 sm:p-6 rounded-xl bg-black border border-white/[0.08] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono-studio text-neutral-400">
              <div className="flex items-center gap-4">
                {chartMode === 'correlation' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-white/30 border border-white/60 inline-block" />
                      <span>Cumulative Interactions (Left Axis)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                      <span className="text-white font-bold">Avg Dispatch Rating (Right Axis)</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-neutral-600 inline-block" />
                      <span>Pre-Loop Draft Baseline</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white inline-block" />
                      <span className="text-white font-bold">Certified Post-Loop Rating (&gt;= 9.5)</span>
                    </span>
                  </>
                )}
              </div>
              <span className="text-neutral-500">Gatekeeper Threshold: 9.5 / 10</span>
            </div>

            <div className="h-72 sm:h-80 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'correlation' ? (
                  <ComposedChart
                    data={trendTelemetry.sessions}
                    margin={{ top: 12, right: 12, left: -12, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="interactionsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="session"
                      stroke="#737373"
                      tick={{ fill: '#a3a3a3', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                      yAxisId="interactions"
                      orientation="left"
                      stroke="#737373"
                      domain={['dataMin - 20', 'dataMax + 15']}
                      tick={{ fill: '#737373', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="rating"
                      orientation="right"
                      domain={[8.8, 10]}
                      stroke="#34d399"
                      tick={{ fill: '#d4d4d4', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#050505',
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#ffffff',
                      }}
                      labelStyle={{ color: '#a3a3a3', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <ReferenceLine
                      yAxisId="rating"
                      y={9.5}
                      stroke="#34d399"
                      strokeDasharray="4 4"
                      strokeOpacity={0.6}
                      label={{
                        value: 'GATE 9.5',
                        position: 'insideTopRight',
                        fill: '#34d399',
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    />
                    <Area
                      yAxisId="interactions"
                      type="monotone"
                      dataKey="totalInteractions"
                      name="Total Interactions"
                      stroke="#a3a3a3"
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#interactionsAreaGrad)"
                    />
                    <Line
                      yAxisId="rating"
                      type="monotone"
                      dataKey="avgDispatchRating"
                      name="Avg Dispatch Rating"
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#34d399', stroke: '#000000', strokeWidth: 1.5 }}
                      activeDot={{ r: 6, fill: '#ffffff', stroke: '#34d399', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                ) : (
                  <ComposedChart
                    data={trendTelemetry.sessions}
                    margin={{ top: 12, right: 12, left: -12, bottom: 4 }}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="session"
                      stroke="#737373"
                      tick={{ fill: '#a3a3a3', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                      domain={[6.5, 10]}
                      stroke="#737373"
                      tick={{ fill: '#a3a3a3', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#050505',
                        borderColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#ffffff',
                      }}
                    />
                    <ReferenceLine
                      y={9.5}
                      stroke="#34d399"
                      strokeDasharray="4 4"
                      strokeOpacity={0.7}
                    />
                    <Bar
                      dataKey="baselineRating"
                      name="Pre-Loop Draft Score"
                      fill="#404040"
                      radius={[4, 4, 0, 0]}
                      barSize={18}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgDispatchRating"
                      name="Certified Dispatch Score"
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#34d399', stroke: '#000000', strokeWidth: 1.5 }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* 10-Session Compact Tabular Ledger */}
            <div className="pt-3 border-t border-white/[0.06] grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center">
              {trendTelemetry.sessions.map((s) => (
                <div
                  key={s.session}
                  className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] font-mono-studio"
                >
                  <div className="text-[9px] text-neutral-500">{s.session}</div>
                  <div className="text-xs font-bold text-white tabular-nums mt-0.5">
                    {s.avgDispatchRating.toFixed(1)}
                  </div>
                  <div className="text-[9px] text-neutral-400 tabular-nums">
                    {s.totalInteractions}i
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
