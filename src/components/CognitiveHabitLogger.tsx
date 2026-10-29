import React, { useState } from 'react';
import {
  CognitiveHabitLog,
  CognitiveHabitCategory,
  FineTuningCalibration,
} from '../types';
import {
  calculateHabitTelemetryImpact,
  aggregateHabitTelemetry,
} from '../utils/cogniLogic';
import {
  Brain,
  Zap,
  BookOpen,
  BatteryCharging,
  Code2,
  Compass,
  Sun,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Clock,
  Activity,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface CognitiveHabitLoggerProps {
  habitLogs: CognitiveHabitLog[];
  onLogHabit: (habit: Omit<CognitiveHabitLog, 'id' | 'timestamp' | 'impactFidelityDelta' | 'circadianAlignment'>) => void;
  onDeleteHabit: (habitId: string) => void;
  calibration: FineTuningCalibration;
  currentHour: number;
  onNavigateToTwinStudio?: () => void;
}

const CATEGORY_METADATA: Record<
  CognitiveHabitCategory,
  { label: string; icon: React.ReactNode; color: string; desc: string }
> = {
  deep_work: {
    label: 'Deep Work',
    icon: <Zap className="w-4 h-4 text-white" />,
    color: 'border-white text-white',
    desc: 'Uninterrupted algorithmic focus & complex problem solving',
  },
  coding: {
    label: 'Architecture & Code',
    icon: <Code2 className="w-4 h-4 text-white" />,
    color: 'border-white text-white',
    desc: 'Core system kernel execution, tooling, & refactoring',
  },
  reading: {
    label: 'AI Paper & Study',
    icon: <BookOpen className="w-4 h-4 text-neutral-300" />,
    color: 'border-neutral-400 text-neutral-300',
    desc: 'arXiv research, AI model architectures, & technical papers',
  },
  rest: {
    label: 'Biological Recharge',
    icon: <BatteryCharging className="w-4 h-4 text-neutral-300" />,
    color: 'border-neutral-500 text-neutral-400',
    desc: 'Non-Sleep Deep Rest (NSDR), meditation, or post-lunch reset',
  },
  reflection: {
    label: 'Strategic Reflection',
    icon: <Compass className="w-4 h-4 text-neutral-300" />,
    color: 'border-neutral-400 text-neutral-300',
    desc: 'Day review, decision trade-offs logging, & horizon scanning',
  },
  bio_sync: {
    label: 'Bio-Sync & Sunlight',
    icon: <Sun className="w-4 h-4 text-neutral-300" />,
    color: 'border-neutral-500 text-neutral-400',
    desc: 'Circadian sunlight exposure, hydration, & restorative movement',
  },
};

export const CognitiveHabitLogger: React.FC<CognitiveHabitLoggerProps> = ({
  habitLogs,
  onLogHabit,
  onDeleteHabit,
  calibration,
  currentHour,
  onNavigateToTwinStudio,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Form state
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<CognitiveHabitCategory>('deep_work');
  const [customDuration, setCustomDuration] = useState<number>(60);
  const [customQuality, setCustomQuality] = useState<number>(9);
  const [customNotes, setCustomNotes] = useState<string>('');

  const telemetry = aggregateHabitTelemetry(habitLogs);

  // Quick 1-click presets
  const quickPresets: Array<{
    name: string;
    category: CognitiveHabitCategory;
    duration: number;
    quality: number;
    notes: string;
  }> = [
    {
      name: '90m Peak Deep Coding Sprint',
      category: 'coding',
      duration: 90,
      quality: 10,
      notes: 'Built autonomous multi-agent kernel logic with zero context switches.',
    },
    {
      name: '45m Transformer Memory Paper Study',
      category: 'reading',
      duration: 45,
      quality: 9,
      notes: 'Ingested arXiv paper on episodic memory compression and persona alignment.',
    },
    {
      name: '25m Slump Defense NSDR Recharge',
      category: 'rest',
      duration: 25,
      quality: 8,
      notes: 'Non-Sleep Deep Rest reset during biological dip (14:00 window).',
    },
    {
      name: '30m Strategic Day Reflection',
      category: 'reflection',
      duration: 30,
      quality: 9,
      notes: 'Extracted key decision heuristics from daily subagent dispatches.',
    },
    {
      name: '20m Circadian Morning Walk',
      category: 'bio_sync',
      duration: 20,
      quality: 8,
      notes: 'Cortisol spike alignment with natural light exposure.',
    },
  ];

  const handleQuickLog = (preset: typeof quickPresets[0]) => {
    onLogHabit({
      name: preset.name,
      category: preset.category,
      durationMinutes: preset.duration,
      hour: currentHour,
      qualityScore: preset.quality,
      notes: preset.notes,
      tags: [preset.category, 'quick_telemetry'],
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onLogHabit({
      name: customName.trim(),
      category: customCategory,
      durationMinutes: customDuration,
      hour: currentHour,
      qualityScore: customQuality,
      notes: customNotes.trim() || 'Tracked via CogniBrain cognitive telemetry.',
      tags: [customCategory, 'custom_log'],
    });

    setCustomName('');
    setCustomNotes('');
    setShowCustomModal(false);
  };

  // Live preview impact of form
  const projectedImpact = calculateHabitTelemetryImpact({
    category: customCategory,
    durationMinutes: customDuration,
    hour: currentHour,
    qualityScore: customQuality,
  });

  const filteredLogs = habitLogs.filter((log) => {
    if (selectedFilter === 'all') return true;
    return log.category === selectedFilter;
  });

  const isPeakHour = (currentHour >= 9 && currentHour <= 12) || (currentHour >= 16 && currentHour <= 19);
  const isSlumpHour = currentHour >= 13 && currentHour <= 15;

  return (
    <div className="space-y-8 select-none">
      {/* Header Banner */}
      <section className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3 text-[11px] font-mono-studio text-neutral-400 uppercase tracking-widest mb-3">
          <span className="text-neutral-500">© TELEMETRY INGESTION</span>
          <span className="text-neutral-700">·</span>
          <span>(06)</span>
          <span className="text-neutral-700">·</span>
          <span className="text-neutral-300">COGNITIVE HABIT PIPELINE</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono-studio font-bold uppercase tracking-wider">
                LIVE TELEMETRY FEED
              </span>
              <span className="text-xs font-mono-studio text-neutral-400 uppercase">
                {isPeakHour ? '● Peak Flow Ingestion Active' : isSlumpHour ? '● Slump Defense Window' : '● Steady State'}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight leading-tight">
              Cognitive Habit Logger
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-sans leading-relaxed">
              Log daily deep work sessions, paper reading, and biological recovery. Every entry feeds high-dimensional behavioral telemetry directly into your <strong className="text-white">Week {calibration.currentWeek} Digital Twin</strong> to accelerate persona fidelity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCustomModal(true)}
              className="min-h-[44px] px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-widest transition-all flex items-center space-x-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>LOG HABIT</span>
            </button>

            {onNavigateToTwinStudio && (
              <button
                onClick={onNavigateToTwinStudio}
                className="min-h-[44px] px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-xs font-mono-studio text-white uppercase tracking-wider transition-all flex items-center space-x-2"
              >
                <span>VIEW DIGITAL TWIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Telemetry Impact Ribbon: 4 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cumulative Fidelity Boost */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050505] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
              Twin Parity Boost
            </span>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono-studio font-bold text-white tabular-nums">
                +{telemetry.cumulativeFidelityBoost.toFixed(1)}%
              </span>
              <span className="text-xs font-mono-studio text-emerald-400 font-bold uppercase">
                ACCELERATED
              </span>
            </div>
            <p className="text-[10px] font-mono-studio text-neutral-500 mt-1">
              Active Fidelity: {calibration.digitalTwinFidelityScore}% (Baseline: {Math.max(35, Math.round((calibration.digitalTwinFidelityScore - telemetry.cumulativeFidelityBoost) * 10) / 10)}%)
            </p>
          </div>
          <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(100, (telemetry.cumulativeFidelityBoost / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Total Habits Ingested */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050505] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
              Telemetry Ingested
            </span>
            <Activity className="w-4 h-4 text-neutral-400" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono-studio font-bold text-white tabular-nums">
                {telemetry.totalHabitsCount}
              </span>
              <span className="text-xs font-mono-studio text-neutral-400">
                SESSIONS
              </span>
            </div>
            <p className="text-[10px] font-mono-studio text-neutral-500 mt-1">
              {calibration.learnedHabitsCount} total cognitive habits trained
            </p>
          </div>
          <span className="text-[10px] font-mono-studio text-neutral-400">
            Cadence: ~3.4 sessions / day
          </span>
        </div>

        {/* Metric 3: Time In High Focus / Recovery */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050505] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
              Total Logged Time
            </span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono-studio font-bold text-white tabular-nums">
                {Math.floor(telemetry.totalMinutesLogged / 60)}h{' '}
                {(telemetry.totalMinutesLogged % 60).toString().padStart(2, '0')}m
              </span>
              <span className="text-xs font-mono-studio text-neutral-400">
                TIME
              </span>
            </div>
            <p className="text-[10px] font-mono-studio text-neutral-500 mt-1">
              Deep work & deliberate rest ratio
            </p>
          </div>
          <span className="text-[10px] font-mono-studio text-neutral-400">
            Avg session: ~{telemetry.totalHabitsCount > 0 ? Math.round(telemetry.totalMinutesLogged / telemetry.totalHabitsCount) : 0} mins
          </span>
        </div>

        {/* Metric 4: Circadian Synchronization */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050505] border border-white/[0.08] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-studio uppercase text-neutral-400">
              Circadian Sync
            </span>
            <Sun className="w-4 h-4 text-neutral-400" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono-studio font-bold text-white tabular-nums">
                {telemetry.circadianSyncPercentage}%
              </span>
              <span className="text-xs font-mono-studio text-neutral-400">
                OPTIMAL
              </span>
            </div>
            <p className="text-[10px] font-mono-studio text-neutral-500 mt-1">
              Aligned with natural peak & slump rhythm
            </p>
          </div>
          <span className="text-[10px] font-mono-studio text-neutral-400">
            +1.5x Multiplier for peak deep work
          </span>
        </div>
      </div>

      {/* Quick 1-Click Telemetry Logger Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[10px] font-mono-studio uppercase tracking-wider text-neutral-400">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>ONE-TAP TELEMETRY LOGGERS</span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-500">INSTANT PARITY FEED</span>
          </div>
          <span className="text-[10px] font-mono-studio text-neutral-500 hidden sm:inline">
            CLICK TO INGEST DIRECTLY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickPresets.map((preset, idx) => {
            const meta = CATEGORY_METADATA[preset.category];
            const impact = calculateHabitTelemetryImpact({
              category: preset.category,
              durationMinutes: preset.duration,
              hour: currentHour,
              qualityScore: preset.quality,
            });

            return (
              <button
                key={idx}
                onClick={() => handleQuickLog(preset)}
                className="p-3.5 rounded-xl bg-black border border-white/[0.08] hover:border-white text-left transition-all group flex flex-col justify-between space-y-2 min-h-[96px]"
              >
                <div className="flex items-center justify-between">
                  <div className="p-1 rounded-md bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors">
                    {meta.icon}
                  </div>
                  <span className="text-[10px] font-mono-studio text-emerald-400 font-bold">
                    +{impact.impactFidelityDelta.toFixed(2)}%
                  </span>
                </div>

                <div>
                  <span className="text-xs font-mono-studio font-medium text-white block group-hover:underline truncate">
                    {preset.name}
                  </span>
                  <span className="text-[10px] font-mono-studio text-neutral-500">
                    {preset.duration}m · {meta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Habit Telemetry Feed / Ledger */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
          <div>
            <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block">
              CHRONOLOGICAL TELEMETRY
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-normal text-white">
              Habits Ingested ({filteredLogs.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'ALL' },
              { id: 'deep_work', label: 'DEEP WORK' },
              { id: 'coding', label: 'CODING' },
              { id: 'reading', label: 'READING' },
              { id: 'rest', label: 'REST' },
              { id: 'reflection', label: 'REFLECTION' },
              { id: 'bio_sync', label: 'BIO-SYNC' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono-studio uppercase tracking-wider transition-all min-h-[32px] ${
                  selectedFilter === f.id
                    ? 'bg-white text-black font-bold'
                    : 'bg-black border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Log Entries */}
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-black border border-white/[0.06] space-y-2">
            <p className="text-xs font-mono-studio text-neutral-400">
              No habit telemetry recorded in this filter category yet.
            </p>
            <button
              onClick={() => setShowCustomModal(true)}
              className="text-xs font-mono-studio text-white underline hover:opacity-80"
            >
              Record your first habit now
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLogs.map((log) => {
              const meta = CATEGORY_METADATA[log.category] || CATEGORY_METADATA.deep_work;
              return (
                <div
                  key={log.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-black border border-white/[0.08] hover:border-white/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-white/[0.04] border border-white/10 shrink-0 mt-0.5">
                      {meta.icon}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-sans font-medium text-white truncate">
                          {log.name}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[9px] font-mono-studio uppercase text-neutral-300">
                          {meta.label}
                        </span>

                        {log.circadianAlignment === 'peak_aligned' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono-studio text-emerald-400 uppercase font-bold">
                            ⚡ Peak Aligned
                          </span>
                        )}

                        {log.circadianAlignment === 'slump_protected' && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] font-mono-studio text-blue-400 uppercase font-bold">
                            🛡️ Slump Defended
                          </span>
                        )}
                      </div>

                      {log.notes && (
                        <p className="text-xs font-sans text-neutral-400 leading-relaxed truncate">
                          {log.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono-studio text-neutral-500">
                        <span>{log.durationMinutes} mins</span>
                        <span>·</span>
                        <span>Intensity: {log.qualityScore}/10</span>
                        <span>·</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t border-white/[0.04] sm:border-t-0">
                    <div className="text-right">
                      <span className="text-xs font-mono-studio font-bold text-white block">
                        +{log.impactFidelityDelta.toFixed(2)}%
                      </span>
                      <span className="text-[9px] font-mono-studio text-neutral-500 uppercase">
                        Twin Parity
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteHabit(log.id)}
                      className="p-2 text-neutral-500 hover:text-rose-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                      title="Delete telemetry record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Habit Log Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#0a0a0a] border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block">
                  TELEMETRY INGESTION
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-normal text-white">
                  Log Cognitive Habit
                </h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-neutral-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* Habit Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono-studio uppercase text-neutral-400 block">
                  Habit / Session Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. 75m Autonomous Agent Architecture Review"
                  className="w-full bg-black border border-white/[0.12] focus:border-white rounded-xl px-4 py-2.5 text-xs font-mono-studio text-white placeholder-neutral-500 focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono-studio uppercase text-neutral-400 block">
                  Cognitive Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_METADATA) as CognitiveHabitCategory[]).map((cat) => {
                    const meta = CATEGORY_METADATA[cat];
                    const isSelected = customCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setCustomCategory(cat)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-mono-studio transition-all flex items-center space-x-2 ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'bg-black border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className={isSelected ? 'text-black' : 'text-neutral-400'}>
                          {meta.icon}
                        </div>
                        <span className="truncate">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Duration & Quality Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono-studio">
                    <span className="uppercase text-neutral-400">Duration</span>
                    <span className="text-white font-bold">{customDuration} mins</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(parseInt(e.target.value, 10))}
                    className="w-full accent-white cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono-studio text-neutral-500">
                    <span>15m</span>
                    <span>60m</span>
                    <span>120m</span>
                    <span>180m</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono-studio">
                    <span className="uppercase text-neutral-400">Intensity / Quality</span>
                    <span className="text-white font-bold">{customQuality}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={customQuality}
                    onChange={(e) => setCustomQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-white cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono-studio text-neutral-500">
                    <span>1 (Distracted)</span>
                    <span>5 (Average)</span>
                    <span>10 (Peak Flow)</span>
                  </div>
                </div>
              </div>

              {/* Reflection Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono-studio uppercase text-neutral-400 block">
                  Tactical Reflection / Heuristics Discovered
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="What trade-offs or insights did you observe during this session?"
                  className="w-full bg-black border border-white/[0.12] focus:border-white rounded-xl p-3 text-xs font-mono-studio text-white placeholder-neutral-500 focus:outline-none resize-none"
                />
              </div>

              {/* Projected Parity Delta Badge */}
              <div className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between text-xs font-mono-studio">
                <span className="text-neutral-400">PROJECTED PARITY ACCELERATION:</span>
                <span className="text-emerald-400 font-bold">
                  +{projectedImpact.impactFidelityDelta.toFixed(2)}% ({projectedImpact.circadianAlignment})
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl border border-white/20 text-xs font-mono-studio text-neutral-400 hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  INGEST TELEMETRY
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
