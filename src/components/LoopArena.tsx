import React, { useState } from 'react';
import { LoopIteration } from '../types';
import { ArrowUpRight } from 'lucide-react';
import { executeLoopUntilThreshold } from '../utils/cogniLogic';

interface LoopArenaProps {
  onRunLoopRefinement: (strategyText: string, initialScore: number) => Promise<any>;
}

export const LoopArena: React.FC<LoopArenaProps> = () => {
  const [draftStrategy, setDraftStrategy] = useState<string>(
    'Morning: Wake up and check social media notifications. Start coding on the multi-agent system when feeling energized. Afternoon: Browse YouTube for AI breakthroughs and reply to incoming client emails. Evening: Continue project backlog and study memory papers.'
  );
  const [initialScore, setInitialScore] = useState<number>(6.8);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [loopResult, setLoopResult] = useState<{
    iterations: LoopIteration[];
    finalApprovedStrategy: string;
    finalScore: number;
    totalLoops: number;
    isCapped: boolean;
    evaluationDisclaimer: string;
  } | null>(null);

  const handleStartLoop = async () => {
    setIsRunning(true);
    try {
      const res = executeLoopUntilThreshold(draftStrategy, initialScore, 9.5, 3);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setLoopResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3 text-[11px] font-mono-studio text-neutral-400 uppercase tracking-widest mb-3">
          <span className="text-neutral-500">PLANNING CHECKLIST</span>
          <span className="text-neutral-700">·</span>
          <span>HARD CAP: 3 PASSES MAX</span>
          <span className="text-neutral-700">·</span>
          <span className="text-amber-300">HEURISTIC ESTIMATE (NOT FORMAL PROOF)</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight leading-none">
              Capped Critique Checklist (Max 3 Passes)
            </h1>
            <p className="mt-3 text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Runs up to <strong className="text-white">3 structured critique passes</strong> to spot missing task boundaries, schedule overlaps, or unlinked project tasks. Scores are heuristic planning estimates—not formal verification or proof.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono-studio text-neutral-400">
            <span>
              LOOP CAP: <strong className="text-white">3 PASSES MAX</strong> · TARGET:{' '}
              <strong className="text-white">9.5 HEURISTIC</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Honest Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono-studio text-amber-200 leading-relaxed">
        <strong>Why Capped at 3 Passes:</strong> Unbounded self-critique loops inflate scores artificially. This tool is hard-capped at 3 passes and reports honestly if a low-scoring draft remains below 9.5 so you can revise the real plan yourself.
      </div>

      {/* Input Strategy & Controller */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-2">
          <span className="text-xs font-mono-studio uppercase text-neutral-400 tracking-wider">
            Candidate Daily Plan or Workflow Draft
          </span>
          <div className="flex items-center space-x-3 text-xs font-mono-studio text-neutral-400">
            <span>STARTING DRAFT SCORE:</span>
            <input
              type="number"
              step="0.1"
              min="1"
              max="9.4"
              value={initialScore}
              onChange={(e) => setInitialScore(parseFloat(e.target.value) || 6.5)}
              className="w-16 bg-black border border-white/20 rounded px-2 py-1 text-white font-mono-studio text-center font-bold"
            />
            <span className="text-neutral-600">/ 10</span>
          </div>
        </div>

        <textarea
          rows={4}
          value={draftStrategy}
          onChange={(e) => setDraftStrategy(e.target.value)}
          placeholder="Paste a daily schedule or project plan to check for routine conflicts and missing milestones..."
          className="w-full bg-black border border-white/[0.12] rounded-xl p-4 text-xs font-mono-studio text-neutral-200 focus:outline-none focus:border-white/50 leading-relaxed resize-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <span className="text-[11px] font-mono-studio text-neutral-500">
            CHECKS: 01. TASK BOUNDARIES · 02. FOCUS WINDOW OVERLAPS · 03. REPO MILESTONE LINKS
          </span>

          <button
            type="button"
            onClick={handleStartLoop}
            disabled={isRunning || !draftStrategy.trim()}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider transition-all disabled:opacity-40"
          >
            <span>
              {isRunning ? 'RUNNING CHECKLIST...' : 'RUN CRITIQUE CHECKLIST (MAX 3 PASSES)'}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Loop Trace Results */}
      {loopResult && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
            <span className="text-xs font-mono-studio uppercase text-neutral-400 tracking-wider">
              Critique Trace ({loopResult.totalLoops} of 3 Max Passes Used)
            </span>
            <div className="flex items-center space-x-2 text-xs font-mono-studio text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  loopResult.isCapped ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span>
                HEURISTIC SCORE: {loopResult.finalScore} / 10 ·{' '}
                {loopResult.isCapped
                  ? 'CAPPED AT 3 PASSES (NEEDS MANUAL EDIT)'
                  : 'CHECKLIST PASSED'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/[0.08] text-xs font-mono-studio text-neutral-400">
            {loopResult.evaluationDisclaimer}
          </div>

          <div className="space-y-3">
            {loopResult.iterations.map((iter) => (
              <div
                key={iter.iteration}
                className={`p-6 rounded-2xl border transition-all ${
                  iter.isApproved
                    ? 'bg-[#080808] border-white/40'
                    : 'bg-[#050505] border-white/[0.08]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono-studio gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-neutral-500">PASS 0{iter.iteration} / 03</span>
                    <span className="text-white font-bold">
                      HEURISTIC ESTIMATE: {iter.score} / 10
                    </span>
                  </div>

                  <span className={iter.isApproved ? 'text-emerald-400 font-bold' : 'text-neutral-400'}>
                    {iter.isApproved
                      ? 'THRESHOLD REACHED (>= 9.5)'
                      : 'BELOW THRESHOLD — SUGGESTING FIXES'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs font-sans">
                  <div>
                    <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block mb-1.5">
                      Checklist Findings:
                    </span>
                    <p className="text-neutral-300 p-3 rounded-xl bg-black border border-white/[0.06] leading-relaxed">
                      {iter.critique}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block mb-1.5">
                      Suggested Structural Edits:
                    </span>
                    <ul className="text-neutral-300 p-3 rounded-xl bg-black border border-white/[0.06] space-y-1.5 list-none">
                      {iter.upgradesApplied.map((up, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-neutral-500 font-mono">·</span>
                          <span>{up}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Revised Plan */}
          <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/[0.15] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-studio text-neutral-400 uppercase tracking-widest pb-3 border-b border-white/[0.08]">
              <span>Revised Plan Output (After {loopResult.totalLoops} Passes)</span>
              <span className="text-neutral-300">
                HEURISTIC PLANNING AID · NOT FORMAL PROOF
              </span>
            </div>
            <p className="text-xs text-neutral-200 font-sans leading-relaxed whitespace-pre-wrap pt-2">
              {loopResult.finalApprovedStrategy}
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
