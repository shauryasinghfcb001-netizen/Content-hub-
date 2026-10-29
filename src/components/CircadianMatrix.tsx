import React, { useState, useEffect } from 'react';
import { CircadianSlot, ProjectItem, UserRoutineConfig } from '../types';
import { Sliders } from 'lucide-react';
import { getOptimalProjectForHour } from '../utils/cogniLogic';

interface CircadianMatrixProps {
  circadianProfile: CircadianSlot[];
  currentHour: number;
  projects: ProjectItem[];
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

export const CircadianMatrix: React.FC<CircadianMatrixProps> = ({
  circadianProfile,
  currentHour,
  projects,
  routine = DEFAULT_ROUTINE,
  onUpdateRoutine,
}) => {
  const [selectedHour, setSelectedHour] = useState<number>(currentHour);
  const [localRoutine, setLocalRoutine] = useState<UserRoutineConfig>(routine);

  useEffect(() => {
    setLocalRoutine(routine);
  }, [routine]);

  const activeRoutine = onUpdateRoutine ? routine : localRoutine;

  const handleRoutineFieldChange = (field: keyof UserRoutineConfig, value: number) => {
    const clamped = Math.max(0, Math.min(23, value));
    const updated = { ...localRoutine, [field]: clamped };
    setLocalRoutine(updated);
    if (onUpdateRoutine) {
      onUpdateRoutine(updated);
    }
  };

  const fallbackSlot: CircadianSlot = {
    hour: selectedHour,
    label: `${selectedHour.toString().padStart(2, '0')}:00`,
    cognitiveState: 'High Energy',
    energyLevel: 75,
    recommendedAction: 'Execute core roadmap milestones with disciplined focus blocks.',
    isPeak:
      (selectedHour >= activeRoutine.morningPeakStart &&
        selectedHour <= activeRoutine.morningPeakEnd) ||
      (selectedHour >= activeRoutine.eveningPeakStart &&
        selectedHour <= activeRoutine.eveningPeakEnd),
    isSlump:
      selectedHour >= activeRoutine.slumpStart && selectedHour <= activeRoutine.slumpEnd,
  };

  const activeSlot: CircadianSlot =
    circadianProfile?.find((s) => s.hour === selectedHour) ||
    circadianProfile?.[0] ||
    fallbackSlot;

  const optimalProjectResult = getOptimalProjectForHour(
    selectedHour,
    projects || [],
    activeRoutine
  );

  const formatHour = (h: number) => `${h.toString().padStart(2, '0')}:00`;

  const triageFeed = [
    {
      id: 'msg-1',
      sender: 'DevOps / CI Cluster',
      type: 'SAMPLE SYSTEM MONITOR',
      subject: 'Autonomous Agent Sweep: 3 reasoning papers indexed',
      time: `${formatHour(activeRoutine.slumpStart)}`,
      action: `Batch review during ${formatHour(activeRoutine.slumpStart)}–${formatHour(
        activeRoutine.slumpEnd
      )} slump window`,
    },
    {
      id: 'msg-2',
      sender: 'Research Mentor (Prof. Vance)',
      type: 'SAMPLE EMAIL INQUIRY',
      subject: 'Feedback on 16-Week Calibration Methodology',
      time: `${formatHour(activeRoutine.morningPeakStart + 1)}`,
      action: `Held during ${formatHour(activeRoutine.morningPeakStart)}–${formatHour(
        activeRoutine.morningPeakEnd
      )} peak; queued for ${formatHour(activeRoutine.slumpStart)}`,
    },
    {
      id: 'msg-3',
      sender: 'X / Mentions Digest',
      type: 'SAMPLE SOCIAL RADAR',
      subject: '@shaurya_builds: 14 replies on Multi-Agent Orchestration thread',
      time: `${formatHour(activeRoutine.slumpEnd)}`,
      action: `Key takeaways extracted; detailed review queued for ${formatHour(
        activeRoutine.slumpEnd
      )}`,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Section Header */}
      <section className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3 text-[11px] font-mono-studio text-neutral-400 uppercase tracking-widest mb-3">
          <span className="text-neutral-500">ROUTINE &amp; SCHEDULE</span>
          <span className="text-neutral-700">·</span>
          <span>CUSTOMIZABLE 24H FOCUS WINDOWS</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight leading-none">
              Routine &amp; Focus Windows (24h)
            </h1>
            <p className="mt-3 text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Customize your wake, peak focus, and slump windows to match your real routine. High-focus projects map to your peak windows while admin tasks map to your slump window.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono-studio text-neutral-400">
            <span>
              CURRENT HOUR:{' '}
              <strong className="text-white">{formatHour(currentHour)}</strong>
            </span>
            <button
              type="button"
              onClick={() => setSelectedHour(currentHour)}
              className="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white text-white text-[10px] uppercase tracking-widest transition-all"
            >
              Reset to Now
            </button>
          </div>
        </div>
      </section>

      {/* Customizable Routine Controls */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#060606] border border-white/[0.1] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs font-mono-studio text-white font-semibold">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>01. Adjust Your Personal Routine Windows (24-Hour Clock)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLocalRoutine(DEFAULT_ROUTINE);
              if (onUpdateRoutine) onUpdateRoutine(DEFAULT_ROUTINE);
            }}
            className="text-xs font-mono-studio text-neutral-400 hover:text-white underline self-start sm:self-auto"
          >
            Reset to Default Routine
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono-studio">
          <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
            <div className="text-white font-bold">Primary Peak Window</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Start</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.morningPeakStart}
                  onChange={(e) =>
                    handleRoutineFieldChange('morningPeakStart', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">End</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.morningPeakEnd}
                  onChange={(e) =>
                    handleRoutineFieldChange('morningPeakEnd', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
            <div className="text-neutral-200 font-bold">Slump &amp; Triage Window</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Start</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.slumpStart}
                  onChange={(e) =>
                    handleRoutineFieldChange('slumpStart', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">End</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.slumpEnd}
                  onChange={(e) =>
                    handleRoutineFieldChange('slumpEnd', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
            <div className="text-white font-bold">Secondary Peak Window</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Start</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.eveningPeakStart}
                  onChange={(e) =>
                    handleRoutineFieldChange('eveningPeakStart', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">End</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.eveningPeakEnd}
                  onChange={(e) =>
                    handleRoutineFieldChange('eveningPeakEnd', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2">
            <div className="text-neutral-200 font-bold">Wake &amp; Sleep Hours</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Wake</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.wakeHour}
                  onChange={(e) =>
                    handleRoutineFieldChange('wakeHour', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-500 mb-1">Sleep</label>
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={activeRoutine.sleepHour}
                  onChange={(e) =>
                    handleRoutineFieldChange('sleepHour', Number(e.target.value))
                  }
                  className="w-full bg-[#080808] border border-white/[0.15] rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 24-Hour Minimalist Heatmap Strip */}
      <section className="p-4 sm:p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono-studio text-neutral-400 uppercase tracking-wider gap-2">
          <span>02. 24-Hour Schedule Map (Click Any Hour)</span>
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] text-neutral-500">
            <span className="text-white">■ PEAK FOCUS</span>
            <span className="text-neutral-400">■ STEADY</span>
            <span className="text-neutral-600">■ SLUMP TRIAGE</span>
            <span className="text-neutral-800">■ SLEEP</span>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 lg:grid-cols-24 gap-1.5 pt-1">
          {circadianProfile.map((slot) => {
            const isSelected = selectedHour === slot.hour;
            const isCurrent = currentHour === slot.hour;

            let borderStyle = 'border-white/[0.06] text-neutral-500 bg-black';
            if (slot.isPeak) borderStyle = 'border-white text-white bg-white/[0.08] font-bold';
            else if (slot.isSlump) borderStyle = 'border-neutral-700 text-neutral-300 bg-neutral-900/60';
            else if (slot.energyLevel >= 65) borderStyle = 'border-neutral-600 text-neutral-200 bg-neutral-900/30';

            return (
              <button
                type="button"
                key={slot.hour}
                onClick={() => setSelectedHour(slot.hour)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all min-h-[44px] ${borderStyle} ${
                  isSelected ? 'ring-1 ring-white bg-white text-black' : 'hover:border-white/40'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 studio-glow-emerald" />
                )}
                <span className={`text-[11px] font-mono-studio font-bold ${isSelected ? 'text-black' : ''}`}>
                  {slot.hour}:00
                </span>
                <span className={`text-[9px] font-mono-studio mt-0.5 ${isSelected ? 'text-black/80' : 'opacity-70'}`}>
                  {slot.energyLevel}%
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Selected Hour Details & Guardrails */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block mb-1">
                03. SELECTED HOUR GUIDANCE
              </span>
              <h3 className="font-display text-2xl font-normal text-white">
                {activeSlot.label} — {activeSlot.cognitiveState}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 block">
                EST. ENERGY
              </span>
              <span className="text-2xl font-mono-studio font-bold text-white">
                {activeSlot.energyLevel}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-mono-studio uppercase text-neutral-400 tracking-wider block mb-1.5">
                Recommended Focus Action
              </span>
              <p className="text-xs text-neutral-200 font-sans leading-relaxed p-3.5 rounded-xl bg-black border border-white/[0.08]">
                {activeSlot.recommendedAction}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono-studio uppercase text-neutral-400 tracking-wider block mb-1.5">
                Matched Project for This Window
              </span>
              {optimalProjectResult.recommendedProject ? (
                <div className="p-3.5 rounded-xl bg-black border border-white/[0.1] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      {optimalProjectResult.recommendedProject.title}
                    </span>
                    <span className="text-[9px] font-mono-studio uppercase px-2 py-0.5 rounded border border-white/20 text-neutral-300">
                      {optimalProjectResult.recommendedProject.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-sans">
                    {optimalProjectResult.rationale}
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-black border border-white/[0.06] text-xs font-mono-studio text-neutral-500">
                  Rest / sleep cycle. No deep cognitive builds scheduled.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-5">
          <div className="pb-3 border-b border-white/[0.06]">
            <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block mb-1">
              04. ROUTINE GUARDRAILS
            </span>
            <h3 className="font-display text-2xl font-normal text-white">
              Peak Focus vs. Slump Triage Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black border border-white/[0.1] space-y-2">
              <span className="text-[10px] font-mono-studio uppercase text-white font-bold tracking-widest block mb-1">
                PEAK WINDOWS
              </span>
              <p className="text-[10px] font-mono-studio text-emerald-400 mb-2">
                {formatHour(activeRoutine.morningPeakStart)}–
                {formatHour(activeRoutine.morningPeakEnd)} &amp;{' '}
                {formatHour(activeRoutine.eveningPeakStart)}–
                {formatHour(activeRoutine.eveningPeakEnd)}
              </p>
              <ul className="text-xs text-neutral-300 space-y-2 font-sans list-none">
                <li className="flex items-start space-x-1.5">
                  <span className="text-neutral-500 font-mono">·</span>
                  <span>Execute Today&apos;s Priority milestones.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-neutral-500 font-mono">·</span>
                  <span>Hardest architectural coding and core logic.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-neutral-500 font-mono">·</span>
                  <span>Defer non-urgent messages until slump window.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/[0.1] space-y-2">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-400 font-bold tracking-widest block mb-1">
                SLUMP WINDOW
              </span>
              <p className="text-[10px] font-mono-studio text-amber-300 mb-2">
                {formatHour(activeRoutine.slumpStart)}–{formatHour(activeRoutine.slumpEnd)}
              </p>
              <ul className="text-xs text-neutral-400 space-y-2 font-sans list-none">
                <li className="flex items-start space-x-1.5">
                  <span className="text-neutral-600 font-mono">·</span>
                  <span>Avoid starting complex refactoring from scratch.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-neutral-600 font-mono">·</span>
                  <span>Batch reply to emails, messages, and admin items.</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-neutral-600 font-mono">·</span>
                  <span>Review reading notes or take a short rest reset.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Clearly Labelled Simulated Message Triage Preview */}
      <section className="p-6 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
          <div>
            <span className="text-[10px] font-mono-studio uppercase text-amber-300 tracking-wider block mb-1">
              SIMULATED TRIAGE PREVIEW · SAMPLE INBOX ROUTING RULES
            </span>
            <h3 className="font-display text-xl font-normal text-white">
              How Incoming Messages Route Around Your Peak Windows
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono-studio text-neutral-400">
            <span>
              Simulated Release Window: {formatHour(activeRoutine.slumpStart)} –{' '}
              {formatHour(activeRoutine.slumpEnd)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {triageFeed.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono-studio text-neutral-500">
                <span>{item.type}</span>
                <span>{item.time}</span>
              </div>
              <h4 className="text-xs font-semibold text-white font-sans">{item.subject}</h4>
              <p className="text-[11px] text-neutral-400 font-sans pt-1 border-t border-white/[0.06]">
                <strong className="text-neutral-300 font-mono-studio">RULE:</strong> {item.action}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
