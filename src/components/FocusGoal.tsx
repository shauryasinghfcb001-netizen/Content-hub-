import React, { useState, useEffect } from 'react';
import { ProjectItem, DailyFocusMilestone, UserRoutineConfig } from '../types';
import {
  getTopPriorityProject,
  calculateDailyFocusProgress,
  syncProjectProgressWithMilestones,
} from '../utils/cogniLogic';
import {
  Target,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  ChevronDown,
  Trash2,
  Check,
  Sliders,
} from 'lucide-react';

interface FocusGoalProps {
  projects: ProjectItem[];
  currentHour: number;
  onUpdateProjectProgress: (projectId: string, progress: number) => void;
  onOpenCircadianMatrix?: () => void;
  onOpenProjectsBoard?: () => void;
  priorityProjectId?: string;
  onSelectPriorityProject?: (projectId: string) => void;
  projectMilestones?: Record<string, DailyFocusMilestone[]>;
  onToggleMilestone?: (projectId: string, milestoneId: string) => void;
  onAddMilestone?: (projectId: string, title: string, estimatedMinutes: number) => void;
  onDeleteMilestone?: (projectId: string, milestoneId: string) => void;
  routine?: UserRoutineConfig;
  onUpdateRoutine?: (routine: UserRoutineConfig) => void;
}

const DEFAULT_ROUTINE: UserRoutineConfig = {
  wakeHour: 7,
  sleepHour: 23,
  morningPeakStart: 9,
  morningPeakEnd: 12,
  slumpStart: 13,
  slumpEnd: 15,
  eveningPeakStart: 16,
  eveningPeakEnd: 19,
};

const DEFAULT_MILESTONES_BY_PROJECT: Record<string, DailyFocusMilestone[]> = {
  'proj-1': [
    {
      id: 'm-101',
      title: 'Wire Projects → Today’s Priority → Milestone completion flow',
      completed: true,
      estimatedMinutes: 45,
    },
    {
      id: 'm-102',
      title: 'Connect Notion MCP JSON-RPC 2.0 tool bridge',
      completed: true,
      estimatedMinutes: 45,
    },
    {
      id: 'm-103',
      title: 'Cap recursive critique checklist at 3 passes with honest labels',
      completed: true,
      estimatedMinutes: 30,
    },
    {
      id: 'm-104',
      title: 'Verify adjustable routine focus windows across 24h schedule',
      completed: false,
      estimatedMinutes: 30,
    },
  ],
};

export const FocusGoal: React.FC<FocusGoalProps> = ({
  projects,
  currentHour,
  onUpdateProjectProgress,
  onOpenCircadianMatrix,
  onOpenProjectsBoard,
  priorityProjectId,
  onSelectPriorityProject,
  projectMilestones,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  routine = DEFAULT_ROUTINE,
  onUpdateRoutine,
}) => {
  const fallbackProject: ProjectItem = {
    id: 'proj-1',
    title: 'CogniBrain Autonomous Multi-Agent Kernel',
    category: 'ongoing',
    priority: 'critical',
    progress: 75,
    energyRequirement: 'high_focus',
    tags: ['gemini', 'agent', 'orchestration', 'digital-twin'],
    lastUpdated: new Date().toISOString().split('T')[0],
    cogniNotes: 'Implementing multi-subagent coordination with capped critique loops.',
  };

  const safeProjects = projects && projects.length > 0 ? projects : [fallbackProject];
  const defaultTopProject = getTopPriorityProject(safeProjects) || safeProjects[0];

  const [localSelectedProjectId, setLocalSelectedProjectId] = useState<string>(
    priorityProjectId || (defaultTopProject ? defaultTopProject.id : safeProjects[0].id)
  );

  const activeProjectId = priorityProjectId || localSelectedProjectId;
  const activeProject =
    safeProjects.find((p) => p.id === activeProjectId) || defaultTopProject || fallbackProject;

  const [showProjectSelector, setShowProjectSelector] = useState<boolean>(false);
  const [showRoutineEditor, setShowRoutineEditor] = useState<boolean>(false);
  const [localRoutine, setLocalRoutine] = useState<UserRoutineConfig>(routine);

  useEffect(() => {
    setLocalRoutine(routine);
  }, [routine]);

  // Local fallback milestone store if parent does not pass projectMilestones
  const [localMilestonesMap, setLocalMilestonesMap] = useState<
    Record<string, DailyFocusMilestone[]>
  >(DEFAULT_MILESTONES_BY_PROJECT);

  const activeMilestones: DailyFocusMilestone[] =
    (projectMilestones && projectMilestones[activeProject.id]) ||
    localMilestonesMap[activeProject.id] || [
      {
        id: `m-${activeProject.id}-1`,
        title: `Define core specification for ${activeProject.title}`,
        completed: activeProject.progress >= 40,
        estimatedMinutes: 45,
      },
      {
        id: `m-${activeProject.id}-2`,
        title: `Complete primary implementation sprint in peak focus window`,
        completed: activeProject.progress >= 70,
        estimatedMinutes: 60,
      },
      {
        id: `m-${activeProject.id}-3`,
        title: `Verify edge cases and update project documentation`,
        completed: activeProject.progress >= 95,
        estimatedMinutes: 30,
      },
    ];

  const [newMilestoneTitle, setNewMilestoneTitle] = useState<string>('');
  const [newMilestoneMinutes, setNewMilestoneMinutes] = useState<number>(30);

  // Time tracking
  const [minutesLogged, setMinutesLogged] = useState<number>(105);
  const [targetMinutes] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [streakDays] = useState<number>(5);
  const [todayNote, setTodayNote] = useState<string>(
    'Protect morning peak window for core execution. Defer inbox & low-priority triage to slump window.'
  );

  // Live timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= 59) {
            setMinutesLogged((m) => m + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const { progressPct, isGoalAchieved } = calculateDailyFocusProgress(
    activeMilestones,
    minutesLogged,
    targetMinutes
  );

  const completedCount = activeMilestones.filter((m) => m.completed).length;

  const handleSelectProject = (projectId: string) => {
    if (onSelectPriorityProject) {
      onSelectPriorityProject(projectId);
    } else {
      setLocalSelectedProjectId(projectId);
    }
    setShowProjectSelector(false);
  };

  // Toggle milestone completion & sync project progress
  const handleToggleMilestoneItem = (milestoneId: string) => {
    if (onToggleMilestone) {
      onToggleMilestone(activeProject.id, milestoneId);
      return;
    }

    const updatedList = activeMilestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    setLocalMilestonesMap((prev) => ({
      ...prev,
      [activeProject.id]: updatedList,
    }));
    const nextProgress = syncProjectProgressWithMilestones(updatedList, activeProject.progress);
    onUpdateProjectProgress(activeProject.id, nextProgress);
  };

  // Add new milestone & sync project progress
  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMilestoneTitle.trim();
    if (!trimmed) return;

    if (onAddMilestone) {
      onAddMilestone(activeProject.id, trimmed, newMilestoneMinutes || 30);
    } else {
      const newM: DailyFocusMilestone = {
        id: `m-${Date.now()}`,
        title: trimmed,
        completed: false,
        estimatedMinutes: newMilestoneMinutes || 30,
      };
      const updatedList = [...activeMilestones, newM];
      setLocalMilestonesMap((prev) => ({
        ...prev,
        [activeProject.id]: updatedList,
      }));
      const nextProgress = syncProjectProgressWithMilestones(updatedList, activeProject.progress);
      onUpdateProjectProgress(activeProject.id, nextProgress);
    }

    setNewMilestoneTitle('');
  };

  // Delete milestone & sync project progress
  const handleDeleteMilestoneItem = (milestoneId: string) => {
    if (onDeleteMilestone) {
      onDeleteMilestone(activeProject.id, milestoneId);
      return;
    }

    const updatedList = activeMilestones.filter((m) => m.id !== milestoneId);
    setLocalMilestonesMap((prev) => ({
      ...prev,
      [activeProject.id]: updatedList,
    }));
    const nextProgress = syncProjectProgressWithMilestones(updatedList, activeProject.progress);
    onUpdateProjectProgress(activeProject.id, nextProgress);
  };

  // Mark all milestones complete today
  const handleMarkAllComplete = () => {
    activeMilestones.forEach((m) => {
      if (!m.completed) {
        handleToggleMilestoneItem(m.id);
      }
    });
    if (minutesLogged < targetMinutes) {
      setMinutesLogged(targetMinutes);
    }
  };

  const handleAddMinutes = (mins: number) => {
    setMinutesLogged((prev) => Math.max(0, prev + mins));
  };

  const handleBumpProjectProgress = (delta: number) => {
    const nextVal = Math.min(100, Math.max(0, activeProject.progress + delta));
    onUpdateProjectProgress(activeProject.id, nextVal);
  };

  const handleRoutineFieldChange = (field: keyof UserRoutineConfig, value: number) => {
    const clamped = Math.max(0, Math.min(23, value));
    const updated = { ...localRoutine, [field]: clamped };
    setLocalRoutine(updated);
    if (onUpdateRoutine) {
      onUpdateRoutine(updated);
    }
  };

  // Evaluate current hour against user's adjustable routine
  const activeRoutine = onUpdateRoutine ? routine : localRoutine;
  const isPeakHour =
    (currentHour >= activeRoutine.morningPeakStart &&
      currentHour <= activeRoutine.morningPeakEnd) ||
    (currentHour >= activeRoutine.eveningPeakStart &&
      currentHour <= activeRoutine.eveningPeakEnd);
  const isSlumpHour =
    currentHour >= activeRoutine.slumpStart && currentHour <= activeRoutine.slumpEnd;

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  return (
    <div className="space-y-6">
      {/* Workflow Breadcrumb Strip: Projects -> Today's Priority -> Milestone Completion */}
      <div className="p-3.5 sm:px-5 rounded-xl bg-[#070707] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-studio">
          <button
            type="button"
            onClick={onOpenProjectsBoard}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            01. Projects ({safeProjects.length})
          </button>
          <span className="text-neutral-600">→</span>
          <span className="text-white font-bold">
            02. Today&apos;s Priority ({activeProject.title})
          </span>
          <span className="text-neutral-600">→</span>
          <span className="text-emerald-400 font-semibold">
            03. Milestones ({completedCount}/{activeMilestones.length} done · {activeProject.progress}%)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRoutineEditor((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono-studio transition-all flex items-center gap-1.5 ${
              showRoutineEditor
                ? 'bg-white text-black font-bold border-white'
                : 'bg-black border-white/[0.12] text-neutral-300 hover:text-white hover:border-white/30'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>
              Focus Routine ({formatHour(activeRoutine.morningPeakStart)}–
              {formatHour(activeRoutine.morningPeakEnd)})
            </span>
          </button>
        </div>
      </div>

      {/* Adjustable Focus Windows Drawer (Inline, user-customizable routine) */}
      {showRoutineEditor && (
        <div className="p-5 rounded-2xl bg-[#080808] border border-white/[0.15] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
            <div>
              <div className="text-xs font-mono-studio text-emerald-400">
                Custom Focus Windows · Adapts to Your Personal Schedule
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Adjust Your Peak Focus &amp; Triage Windows (24h Clock)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setLocalRoutine(DEFAULT_ROUTINE);
                if (onUpdateRoutine) onUpdateRoutine(DEFAULT_ROUTINE);
              }}
              className="text-xs font-mono-studio text-neutral-400 hover:text-white underline self-start sm:self-auto"
            >
              Reset to Default (09:00–12:00 Peak)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-studio">
            {/* Morning Peak Window */}
            <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
              <div className="text-white font-semibold">01. Primary Peak Window</div>
              <div className="text-[11px] text-neutral-400">
                Deep work &amp; hardest milestones
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">Start Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.morningPeakStart}
                    onChange={(e) =>
                      handleRoutineFieldChange('morningPeakStart', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">End Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.morningPeakEnd}
                    onChange={(e) =>
                      handleRoutineFieldChange('morningPeakEnd', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Slump / Triage Window */}
            <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
              <div className="text-neutral-200 font-semibold">02. Slump &amp; Triage Window</div>
              <div className="text-[11px] text-neutral-400">
                Inbox batching, admin &amp; rest
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">Start Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.slumpStart}
                    onChange={(e) =>
                      handleRoutineFieldChange('slumpStart', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">End Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.slumpEnd}
                    onChange={(e) =>
                      handleRoutineFieldChange('slumpEnd', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Secondary / Evening Peak */}
            <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
              <div className="text-white font-semibold">03. Secondary Focus Window</div>
              <div className="text-[11px] text-neutral-400">
                Synthesis, studies &amp; shipping
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">Start Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.eveningPeakStart}
                    onChange={(e) =>
                      handleRoutineFieldChange('eveningPeakStart', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">End Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.eveningPeakEnd}
                    onChange={(e) =>
                      handleRoutineFieldChange('eveningPeakEnd', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Wake & Sleep Boundaries */}
            <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
              <div className="text-neutral-200 font-semibold">04. Wake &amp; Sleep Cycle</div>
              <div className="text-[11px] text-neutral-400">
                Active day boundaries
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">Wake Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.wakeHour}
                    onChange={(e) =>
                      handleRoutineFieldChange('wakeHour', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-500 mb-1">Sleep Hour</label>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={activeRoutine.sleepHour}
                    onChange={(e) =>
                      handleRoutineFieldChange('sleepHour', Number(e.target.value))
                    }
                    className="w-full bg-[#070707] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Priority Highlight */}
      <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-[#050505] border border-white/[0.08] relative overflow-hidden">
        <div className="relative z-10 flex flex-col space-y-6">
          {/* Tagline Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-studio uppercase tracking-widest text-neutral-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-white font-bold">TODAY&apos;S PRIORITY</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">
                FOCUS WINDOW: {formatHour(activeRoutine.morningPeakStart)}–
                {formatHour(activeRoutine.morningPeakEnd)} &amp;{' '}
                {formatHour(activeRoutine.eveningPeakStart)}–
                {formatHour(activeRoutine.eveningPeakEnd)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5 text-neutral-300">
                <Flame className="w-3.5 h-3.5 text-neutral-400" />
                <span>{streakDays} DAY STREAK</span>
              </div>
              <span className="text-neutral-700">·</span>
              <div className="text-[10px] text-neutral-400">
                {isPeakHour ? (
                  <span className="text-emerald-400 font-bold">
                    ● PEAK FOCUS WINDOW ({formatHour(currentHour)})
                  </span>
                ) : isSlumpHour ? (
                  <span className="text-amber-300">
                    ● SLUMP TRIAGE WINDOW ({formatHour(currentHour)})
                  </span>
                ) : (
                  <span>● STEADY EXECUTION ({formatHour(currentHour)})</span>
                )}
              </div>
            </div>
          </div>

          {/* Target Project Display & Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono-studio font-bold uppercase tracking-wider">
                  ACTIVE PRIORITY
                </span>
                <span className="text-xs font-mono-studio text-neutral-400 uppercase">
                  {activeProject.category} · {activeProject.priority} PRIORITY
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-white font-normal tracking-tight">
                {activeProject.title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-sans leading-relaxed">
                {activeProject.cogniNotes ||
                  'Selected as today’s primary execution target. Completing milestones below automatically updates build completion.'}
              </p>
            </div>

            {/* Project Switcher Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowProjectSelector(!showProjectSelector)}
                className="w-full sm:w-auto inline-flex items-center justify-between space-x-2 px-4 py-2.5 rounded-xl bg-black border border-white/20 hover:border-white text-xs font-mono-studio text-white transition-all min-h-[44px]"
              >
                <span>CHANGE PRIORITY PROJECT</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {showProjectSelector && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl bg-[#0a0a0a] border border-white/20 shadow-2xl p-2 z-30 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-mono-studio uppercase text-neutral-500 border-b border-white/[0.06]">
                    Select Today&apos;s Priority Build
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1 pt-1">
                    {safeProjects.map((p) => {
                      const isTop = defaultTopProject?.id === p.id;
                      const isCurrent = activeProject.id === p.id;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => handleSelectProject(p.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono-studio transition-all flex items-center justify-between ${
                            isCurrent
                              ? 'bg-white text-black font-bold'
                              : 'text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="truncate block">{p.title}</span>
                            <span className="text-[10px] opacity-70 uppercase">
                              {p.category} · {p.progress}%
                            </span>
                          </div>
                          {isTop && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded border border-current shrink-0">
                              Recommended
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Today's Progress Trackers & Time Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Milestone Completion */}
            <div className="p-4 rounded-xl bg-black border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
                  Milestone Completion
                </span>
                <Target className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-mono-studio font-bold text-white tabular-nums">
                    {completedCount}/{activeMilestones.length}
                  </span>
                  <span className="text-xs font-mono-studio text-emerald-400">
                    ({syncProjectProgressWithMilestones(activeMilestones, activeProject.progress)}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 rounded-full"
                    style={{
                      width: `${syncProjectProgressWithMilestones(
                        activeMilestones,
                        activeProject.progress
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-mono-studio text-neutral-500">
                Directly syncs to Project Progress
              </span>
            </div>

            {/* Metric 2: Today's Focus Time Logged */}
            <div className="p-4 rounded-xl bg-black border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
                  Focus Time Logged
                </span>
                <Clock className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-mono-studio font-bold text-white tabular-nums">
                    {Math.floor(minutesLogged / 60)}h{' '}
                    {(minutesLogged % 60).toString().padStart(2, '0')}m
                  </span>
                  <span className="text-xs font-mono-studio text-neutral-400">
                    / {Math.floor(targetMinutes / 60)}h Target
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-neutral-300 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, (minutesLogged / targetMinutes) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleAddMinutes(15)}
                  className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/20 text-[10px] font-mono-studio text-neutral-300"
                >
                  +15m
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMinutes(30)}
                  className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/20 text-[10px] font-mono-studio text-neutral-300"
                >
                  +30m
                </button>
                <button
                  type="button"
                  onClick={() => handleAddMinutes(60)}
                  className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/20 text-[10px] font-mono-studio text-neutral-300"
                >
                  +1h
                </button>
              </div>
            </div>

            {/* Metric 3: Project Build Progress */}
            <div className="p-4 rounded-xl bg-black border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
                  Project Progress
                </span>
                <Zap className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span
                    data-testid="active-project-progress"
                    className="text-3xl font-mono-studio font-bold text-white tabular-nums"
                  >
                    {activeProject.progress}%
                  </span>
                  <span className="text-xs font-mono-studio text-neutral-400">
                    OVERALL
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                    style={{ width: `${activeProject.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleBumpProjectProgress(5)}
                  className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/20 text-[10px] font-mono-studio text-white"
                >
                  +5% Done
                </button>
                <button
                  type="button"
                  onClick={() => handleBumpProjectProgress(10)}
                  className="px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/20 text-[10px] font-mono-studio text-white"
                >
                  +10% Done
                </button>
              </div>
            </div>

            {/* Metric 4: Live Focus Sprint Timer */}
            <div className="p-4 rounded-xl bg-black border border-white/[0.08] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
                  Focus Sprint Timer
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isTimerRunning ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
                  }`}
                />
              </div>

              <div>
                <div className="font-mono-studio text-2xl font-bold text-white tabular-nums">
                  {isTimerRunning ? (
                    <span>
                      {Math.floor(minutesLogged / 60)}:
                      {(minutesLogged % 60).toString().padStart(2, '0')}:
                      {timerSeconds.toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <span>{progressPct}% DAILY GOAL</span>
                  )}
                </div>
                <p className="text-[10px] font-mono-studio text-neutral-400 mt-1">
                  {isTimerRunning ? 'Focus Block in progress' : 'Ready for deep work block'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`flex-1 min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-mono-studio font-bold uppercase flex items-center justify-center space-x-1.5 transition-all ${
                    isTimerRunning
                      ? 'bg-neutral-800 text-white hover:bg-neutral-700'
                      : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>START TIMER</span>
                    </>
                  )}
                </button>
                {timerSeconds > 0 && !isTimerRunning && (
                  <button
                    type="button"
                    onClick={() => setTimerSeconds(0)}
                    className="p-2 rounded-lg bg-white/[0.06] text-neutral-400 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Milestones Checklist & Routine Coaching */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Actionable Daily Milestones Checklist */}
        <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-2">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block">
                MILESTONE EXECUTION CHECKLIST · {activeProject.title}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-normal text-white">
                Actionable Milestones ({completedCount}/{activeMilestones.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={handleMarkAllComplete}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-mono-studio font-bold uppercase tracking-wider transition-all inline-flex items-center space-x-2 ${
                isGoalAchieved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isGoalAchieved ? 'ALL MILESTONES DONE ✓' : 'COMPLETE ALL MILESTONES'}</span>
            </button>
          </div>

          {/* Interactive Checklist Rows */}
          <div className="space-y-2.5">
            {activeMilestones.map((milestone) => (
              <div
                key={milestone.id}
                onClick={() => handleToggleMilestoneItem(milestone.id)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group min-h-[52px] ${
                  milestone.completed
                    ? 'bg-black/60 border-white/[0.06] text-neutral-400'
                    : 'bg-black border-white/[0.12] hover:border-white/40 text-neutral-100'
                }`}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-3">
                  <button
                    type="button"
                    aria-label={`Toggle milestone ${milestone.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMilestoneItem(milestone.id);
                    }}
                    className="min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
                  >
                    {milestone.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300" />
                    )}
                  </button>

                  <div className="truncate">
                    <span
                      className={`text-xs sm:text-sm font-sans block truncate ${
                        milestone.completed ? 'line-through text-neutral-500' : 'text-neutral-200'
                      }`}
                    >
                      {milestone.title}
                    </span>
                    <span className="text-[10px] font-mono-studio text-neutral-500">
                      Est. ~{milestone.estimatedMinutes || 30} mins
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={`Delete milestone ${milestone.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMilestoneItem(milestone.id);
                  }}
                  className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-2 text-neutral-500 hover:text-neutral-300 transition-opacity min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Milestone Inline Form */}
          <form onSubmit={handleAddMilestoneSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              placeholder={`Add next milestone for ${activeProject.title}...`}
              className="flex-1 bg-black border border-white/[0.12] focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono-studio text-white placeholder-neutral-500 focus:outline-none min-h-[44px]"
            />
            <div className="flex items-center space-x-2">
              <select
                value={newMilestoneMinutes}
                onChange={(e) => setNewMilestoneMinutes(Number(e.target.value))}
                className="bg-black border border-white/[0.12] rounded-xl px-3 py-2.5 text-xs font-mono-studio text-neutral-300 focus:outline-none min-h-[44px]"
              >
                <option value={15}>15m</option>
                <option value={30}>30m</option>
                <option value={45}>45m</option>
                <option value={60}>60m</option>
                <option value={90}>90m</option>
              </select>
              <button
                type="submit"
                disabled={!newMilestoneTitle.trim()}
                className="inline-flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider transition-all disabled:opacity-40 min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>ADD</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Routine Windows Summary & Daily Notes */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between text-[10px] font-mono-studio uppercase text-neutral-400">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>YOUR FOCUS ROUTINE</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRoutineEditor((prev) => !prev)}
                className="text-white hover:underline"
              >
                {showRoutineEditor ? 'Hide' : 'Adjust Hours'}
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono-studio">
              <div className="p-3 rounded-xl bg-black border border-white/[0.08] flex items-center justify-between">
                <span className="text-neutral-400">Primary Peak</span>
                <span className="text-white font-bold">
                  {formatHour(activeRoutine.morningPeakStart)} –{' '}
                  {formatHour(activeRoutine.morningPeakEnd)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black border border-white/[0.08] flex items-center justify-between">
                <span className="text-neutral-400">Slump / Triage</span>
                <span className="text-neutral-300">
                  {formatHour(activeRoutine.slumpStart)} – {formatHour(activeRoutine.slumpEnd)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-black border border-white/[0.08] flex items-center justify-between">
                <span className="text-neutral-400">Secondary Peak</span>
                <span className="text-white font-bold">
                  {formatHour(activeRoutine.eveningPeakStart)} –{' '}
                  {formatHour(activeRoutine.eveningPeakEnd)}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-1.5">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-400 block font-bold">
                {isPeakHour
                  ? 'CURRENT WINDOW: PEAK FOCUS'
                  : isSlumpHour
                  ? 'CURRENT WINDOW: SLUMP TRIAGE'
                  : 'CURRENT WINDOW: STEADY PACE'}
              </span>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                {isPeakHour
                  ? `You are inside your configured peak window. Focus on completing milestones for ${activeProject.title} before checking messages.`
                  : isSlumpHour
                  ? `You are inside your ${formatHour(activeRoutine.slumpStart)}–${formatHour(
                      activeRoutine.slumpEnd
                    )} slump window. Good for inbox batching, reviewing notes, or rest.`
                  : 'Steady execution window. Tackle medium-friction tasks or prep your next peak block.'}
              </p>
            </div>

            {onOpenCircadianMatrix && (
              <button
                type="button"
                onClick={onOpenCircadianMatrix}
                className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-xs font-mono-studio text-neutral-300 hover:text-white transition-all min-h-[44px]"
              >
                <span>OPEN FULL 24H SCHEDULE</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            )}
          </div>

          {/* Today's Daily Strategy Notes */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-3">
            <span className="text-[10px] font-mono-studio uppercase text-neutral-400 tracking-wider block">
              DAILY EXECUTION NOTE
            </span>
            <textarea
              rows={3}
              value={todayNote}
              onChange={(e) => setTodayNote(e.target.value)}
              placeholder="Log constraints, blockers, or key decisions for today..."
              className="w-full bg-black border border-white/[0.1] rounded-xl p-3 text-xs font-mono-studio text-neutral-300 focus:outline-none focus:border-white/40 leading-relaxed resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
