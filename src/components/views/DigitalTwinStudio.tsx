import React, { useState } from 'react';
import { FineTuningCalibration, DigitalTwinSimulation, CognitiveHabitLog } from '../../types';
import { ArrowUpRight, Sparkles, RefreshCw, Check, ShieldCheck, Zap, Activity, Brain } from 'lucide-react';
import { CognitiveHabitLogger } from '../CognitiveHabitLogger';
import { aggregateHabitTelemetry } from '../../utils/cogniLogic';

interface DigitalTwinStudioProps {
  calibration: FineTuningCalibration;
  onUpdateWeek: (week: number) => void;
  onLogTelemetryInteraction: () => void;
  habitLogs?: CognitiveHabitLog[];
  onLogHabit?: (habit: Omit<CognitiveHabitLog, 'id' | 'timestamp' | 'impactFidelityDelta' | 'circadianAlignment'>) => void;
  onDeleteHabit?: (habitId: string) => void;
  currentHour?: number;
}

export const DigitalTwinStudio: React.FC<DigitalTwinStudioProps> = ({
  calibration,
  onUpdateWeek,
  onLogTelemetryInteraction,
  habitLogs = [],
  onLogHabit = () => {},
  onDeleteHabit = () => {},
  currentHour = new Date().getHours(),
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'simulation' | 'habits'>('simulation');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [customScenario, setCustomScenario] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isCalibrationExpanded, setIsCalibrationExpanded] = useState<boolean>(false);

  const telemetry = aggregateHabitTelemetry(habitLogs);


  const scenarioPresets = [
    {
      label: 'Unscheduled Peak Meeting',
      scenario: 'An enterprise lead emails: "Can we jump on a quick 30-min Zoom call at 10:30 AM today to discuss a high-budget build?"',
    },
    {
      label: 'WhatsApp Rush Request',
      scenario: 'A startup founder messages on WhatsApp (+91 9263878030): "Can your studio ship a full WhatsApp Cloud API and voice agent automation in 48 hours?"',
    },
    {
      label: 'Twitter AI Framework Hype',
      scenario: 'A viral thread on Twitter hypes a new multi-agent memory framework: "Should we drop our current architecture and rewrite using this library?"',
    },
  ];

  const [simulationResult, setSimulationResult] = useState<DigitalTwinSimulation>({
    scenario: scenarioPresets[0].scenario,
    genericResponse: `Subject: Re: Quick Zoom Call\n\nHi,\n\nThank you for reaching out! Yes, I can make 10:30 AM work. Please send over the Zoom link and an agenda so I can be prepared.\n\nBest regards,\nAssistant`,
    cogniTwinResponse: `Subject: Re: High-Budget Build — Alignment & Window\n\nHey,\n\nThanks for reaching out. 10:30 AM sits in the middle of my deep architecture & code execution window (09:00–12:30), so I protect that block to ensure production systems ship with zero drift.\n\nI can take a 20-min architectural qualification call during my communication window at 14:15 or 16:30 today. Alternatively, feel free to send the scope constraints here or on WhatsApp (+91 9263878030) and I'll review it during the 14:00 triage sweep.\n\nBest,\nShaurya Singh · Founder & CEO, Shaurya Studio\n[Drafted autonomously via CogniBrain Twin · Week 6/16 Calibration (78.4% Parity)]`,
    twinFidelity: calibration.digitalTwinFidelityScore,
    currentWeek: calibration.currentWeek,
    decisionHeuristics: [
      'Strictly defends 09:00 - 12:30 peak flow from unscheduled meetings.',
      'Offers alternative slots in the 14:00 - 15:30 slump triage window.',
      'Provides asynchronous WhatsApp escalation path (+91 9263878030).',
      'Sign-off reflects Shaurya Studio Founder & CEO persona.',
    ],
  });

  const handleSimulate = async () => {
    setIsSimulating(true);
    const activeScenarioText = customScenario.trim() || scenarioPresets[selectedScenarioIndex].scenario;

    try {
      const res = await fetch('/api/twin/simulate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: activeScenarioText }),
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err) {
      console.warn('Simulation note:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="pb-6 border-b border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-studio text-neutral-400 uppercase tracking-widest mb-3">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
            CONCEPT / SIMULATION ONLY
          </span>
          <span className="text-neutral-700">·</span>
          <span className="text-amber-300">16-WEEK CALIBRATION MECHANISM NOT YET DEFINED</span>
          <span className="text-neutral-700">·</span>
          <span>NOT A WORKING FEATURE YET</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight leading-none">
              Persona Sandbox (Concept Preview)
            </h1>
            <p className="mt-3 text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Concept preview for how routine rules and logged habits could shape drafted replies in the future. Because the 16-week calibration mechanism is not implemented yet, it is collapsed by default below and shown strictly as a concept.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsCalibrationExpanded((prev) => !prev)}
              className="px-4 py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-mono-studio uppercase tracking-wider text-amber-200 transition-all"
            >
              {isCalibrationExpanded
                ? 'Collapse 16-Week Concept'
                : 'Expand 16-Week Concept (Collapsed by Default)'}
            </button>
          </div>
        </div>

        {/* Honest Concept Notice */}
        <div
          data-testid="persona-concept-banner"
          className="mt-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono-studio text-amber-200"
        >
          <strong>Concept Status Label:</strong> The 16-week Digital Twin calibration has no live training or fine-tuning mechanism yet—it is retained as a vision concept (collapsed by default) while manual habit logging remains active.
        </div>

        {/* Week Scrubber (Collapsed by Default) */}
        {isCalibrationExpanded && (
          <div className="mt-6 pt-5 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-studio">
              <span className="text-neutral-400">
                CONCEPT STAGE PREVIEW: <strong className="text-white">WEEK {calibration.currentWeek}</strong> OF 16
              </span>
              <span className="text-amber-300 font-bold">
                {calibration.digitalTwinFidelityScore}% CONCEPT INDEX (SIMULATED)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={calibration.currentWeek}
              onChange={(e) => onUpdateWeek(parseInt(e.target.value, 10))}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono-studio text-neutral-500 uppercase tracking-wider">
              <span>W1. Baseline (35%)</span>
              <span>W5. Rules (65%)</span>
              <span>W9. Co-Pilot (80%)</span>
              <span>W16. Full Preset (98.6%)</span>
            </div>
          </div>
        )}

        {/* Sub-Navigation: Simulation vs Habit Telemetry */}
        <div className="flex flex-wrap items-center gap-2 pt-6">
          <button
            type="button"
            onClick={() => setActiveSubTab('simulation')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-mono-studio uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeSubTab === 'simulation'
                ? 'bg-white text-black font-bold'
                : 'bg-black border border-white/[0.1] text-neutral-400 hover:text-white hover:border-white/30'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>01. Simulated Reply Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('habits')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-mono-studio uppercase tracking-wider transition-all flex items-center space-x-2 ${
              activeSubTab === 'habits'
                ? 'bg-white text-black font-bold'
                : 'bg-black border border-white/[0.1] text-neutral-400 hover:text-white hover:border-white/30'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>02. Cognitive Habit Logger</span>
            {telemetry.cumulativeFidelityBoost > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                +{telemetry.cumulativeFidelityBoost.toFixed(1)}%
              </span>
            )}
          </button>
        </div>
      </section>

      {/* View Branching: Cognitive Habit Logger vs Scenario Simulator */}
      {activeSubTab === 'habits' ? (
        <CognitiveHabitLogger
          habitLogs={habitLogs}
          onLogHabit={onLogHabit}
          onDeleteHabit={onDeleteHabit}
          calibration={calibration}
          currentHour={currentHour}
          onNavigateToTwinStudio={() => setActiveSubTab('simulation')}
        />
      ) : (
        <>
          {/* Telemetry Acceleration Notice Banner */}
          {telemetry.totalHabitsCount > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-white/[0.04] to-black border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div className="text-xs font-mono-studio text-neutral-300">
                  <span className="text-white font-bold">TELEMETRY SYNC ACTIVE:</span> Ingested{' '}
                  <strong className="text-white">{telemetry.totalHabitsCount} cognitive habits</strong> ({Math.floor(telemetry.totalMinutesLogged / 60)}h {telemetry.totalMinutesLogged % 60}m). Accelerated Twin Parity by{' '}
                  <strong className="text-emerald-400">+{telemetry.cumulativeFidelityBoost.toFixed(1)}%</strong>.
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('habits')}
                className="text-xs font-mono-studio text-white underline hover:opacity-80 shrink-0"
              >
                Open Habit Logger →
              </button>
            </div>
          )}

          {/* Interactive Scenario Tester */}
          <section className="p-8 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
              <span className="text-xs font-mono-studio uppercase text-neutral-400 tracking-wider">
                Test Twin Decision Mimicry (Pick or Enter Scenario)
              </span>
              <span className="text-[11px] font-mono-studio text-neutral-500">
                TESTING WEEK {calibration.currentWeek} HEURISTICS
              </span>
            </div>


        {/* Scenario Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {scenarioPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedScenarioIndex(idx);
                setCustomScenario('');
              }}
              className={`p-3.5 rounded-xl border text-left text-xs font-mono-studio transition-all ${
                selectedScenarioIndex === idx && !customScenario
                  ? 'bg-white text-black font-bold'
                  : 'bg-black border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span className="text-[10px] block opacity-70 mb-1">(0{idx + 1})</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div>
          <label className="block text-[11px] font-mono-studio uppercase text-neutral-400 mb-1.5">
            Or Test Custom Communication / Decision Prompt
          </label>
          <input
            type="text"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="e.g. A developer asks to push an unreviewed pull request during late night..."
            className="w-full bg-black border border-white/[0.12] rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 font-mono-studio"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-widest transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'EVALUATING TWIN...' : 'RUN SIDE-BY-SIDE SIMULATION'}</span>
          </button>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.06]">
          {/* Left: Raw Generic AI Response */}
          <div className="p-6 rounded-2xl bg-black border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-mono-studio">
              <span className="text-neutral-500 uppercase">(A) GENERIC RAW LLM</span>
              <span className="text-neutral-600">UNCONSTRAINED</span>
            </div>
            <p className="text-xs text-neutral-400 font-sans leading-relaxed whitespace-pre-wrap">
              {simulationResult.genericResponse}
            </p>
            <div className="pt-2 text-[10px] font-mono-studio text-neutral-600">
              Risks breaking deep work focus; obliging and uncalibrated to biological rhythm.
            </div>
          </div>

          {/* Right: Calibrated CogniBrain Twin */}
          <div className="p-6 rounded-2xl bg-black border border-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.1] text-xs font-mono-studio">
              <span className="text-white uppercase font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>(B) COGNIBRAIN DIGITAL TWIN (WEEK {calibration.currentWeek})</span>
              </span>
              <span className="text-emerald-400 font-bold">{calibration.digitalTwinFidelityScore}% PARITY</span>
            </div>
            <p className="text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-wrap">
              {simulationResult.cogniTwinResponse}
            </p>
            <div className="pt-3 border-t border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-400 block">
                Decision Heuristics Activated:
              </span>
              <ul className="text-[11px] text-neutral-300 font-sans space-y-1 list-none">
                {simulationResult.decisionHeuristics.map((h, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      </>
      )}
    </div>
  );
};

