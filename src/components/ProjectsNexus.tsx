import React, { useState } from 'react';
import {
  ProjectItem,
  FineTuningCalibration,
  DailyFocusMilestone,
  UserRoutineConfig,
} from '../types';
import { Plus, X, Target, Check } from 'lucide-react';
import { FocusGoal } from './FocusGoal';

interface ProjectsNexusProps {
  projects: ProjectItem[];
  onAddProject: (project: Omit<ProjectItem, 'id' | 'lastUpdated'>) => void;
  onUpdateProjectCategory: (projectId: string, newCategory: ProjectItem['category']) => void;
  currentCalibration: FineTuningCalibration;
  onUpdateWeek: (week: number) => void;
  onLogTelemetryInteraction: () => void;
  currentHour?: number;
  onUpdateProjectProgress?: (projectId: string, progress: number) => void;
  onOpenCircadianMatrix?: () => void;
  priorityProjectId?: string;
  onSelectPriorityProject?: (projectId: string) => void;
  projectMilestones?: Record<string, DailyFocusMilestone[]>;
  onToggleMilestone?: (projectId: string, milestoneId: string) => void;
  onAddMilestone?: (projectId: string, title: string, estimatedMinutes: number) => void;
  onDeleteMilestone?: (projectId: string, milestoneId: string) => void;
  routine?: UserRoutineConfig;
  onUpdateRoutine?: (routine: UserRoutineConfig) => void;
  onOpenFocusTab?: () => void;
}

export const ProjectsNexus: React.FC<ProjectsNexusProps> = ({
  projects,
  onAddProject,
  onUpdateProjectCategory,
  currentCalibration,
  onUpdateWeek,
  onLogTelemetryInteraction,
  currentHour = new Date().getHours(),
  onUpdateProjectProgress = () => {},
  onOpenCircadianMatrix,
  priorityProjectId,
  onSelectPriorityProject,
  projectMilestones,
  onToggleMilestone,
  onAddMilestone,
  onDeleteMilestone,
  routine,
  onUpdateRoutine,
  onOpenFocusTab,
}) => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'focus' | 'calibration'>('kanban');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ProjectItem['category']>('ongoing');
  const [newPriority, setNewPriority] = useState<ProjectItem['priority']>('high');
  const [newEnergy, setNewEnergy] = useState<ProjectItem['energyRequirement']>('high_focus');
  const [newTags] = useState('agent, gemini');
  const [newNotes, setNewNotes] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddProject({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      progress: 0,
      energyRequirement: newEnergy,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      cogniNotes: newNotes.trim() || 'Tracked in Projects Board with milestone completion sync.',
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const columns: Array<{
    id: ProjectItem['category'];
    number: string;
    label: string;
    description: string;
  }> = [
    {
      id: 'ongoing',
      number: '01',
      label: 'ONGOING BUILDS',
      description: 'Active in-flight execution & deep focus',
    },
    {
      id: 'pending',
      number: '02',
      label: 'PENDING MILESTONES',
      description: 'Queued for prerequisite completion',
    },
    {
      id: 'unpending',
      number: '03',
      label: 'UNPENDING ARCHIVE',
      description: 'Revived & unblocked from backlog',
    },
    {
      id: 'study',
      number: '04',
      label: 'STUDIES & RESEARCH',
      description: 'Theoretical AI papers & synthesis',
    },
  ];

  const activePriorityProject =
    projects.find((p) => p.id === priorityProjectId) || projects[0];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3 text-[11px] font-mono-studio text-neutral-400 uppercase tracking-widest mb-3">
          <span className="text-neutral-500">CORE WORKFLOW</span>
          <span className="text-neutral-700">·</span>
          <span>01. PROJECTS → 02. TODAY&apos;S PRIORITY → 03. MILESTONE COMPLETION</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight leading-none">
              Projects Board &amp; Priority Pipeline
            </h1>
            <p className="mt-3 text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Manage ongoing, pending, unpending, and study builds. Promote any project to <strong className="text-white">Today&apos;s Priority</strong> to execute its milestones and automatically track completion.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider transition-all min-h-[42px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW BUILD / STUDY</span>
            </button>
          </div>
        </div>

        {/* View Switcher Sub-nav */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono-studio tracking-wider overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] shrink-0 ${
                activeTab === 'kanban'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              01. Project Kanban ({projects.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('focus')}
              className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] flex items-center space-x-2 shrink-0 ${
                activeTab === 'focus'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>02. Today&apos;s Priority &amp; Milestones</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calibration')}
              className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap min-h-[40px] shrink-0 ${
                activeTab === 'calibration'
                  ? 'bg-white text-black font-bold'
                  : 'text-neutral-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              03. 16-Week Heuristic Log (W{currentCalibration.currentWeek})
            </button>
          </div>

          {activePriorityProject && (
            <div className="flex items-center gap-2 text-xs font-mono-studio text-neutral-400">
              <span>Today&apos;s Priority:</span>
              <span className="text-white font-semibold">{activePriorityProject.title}</span>
              <span className="text-emerald-400">({activePriorityProject.progress}%)</span>
            </div>
          )}
        </div>
      </section>

      {/* View 1: Project Kanban Columns */}
      {activeTab === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const columnProjects = projects.filter((p) => p.category === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl bg-[#050505] border border-white/[0.08] p-5 space-y-4 min-h-[500px]"
              >
                <div className="pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs font-mono-studio">
                    <span className="font-bold text-white tracking-wider">
                      {col.number}. {col.label}
                    </span>
                    <span className="text-neutral-400">
                      [{columnProjects.length}]
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-sans mt-1">{col.description}</p>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnProjects.map((p) => {
                    const isPriority = activePriorityProject?.id === p.id;
                    const milestonesForProj = projectMilestones?.[p.id] || [];
                    const doneMilestones = milestonesForProj.filter((m) => m.completed).length;

                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-xl bg-black border space-y-3 transition-all ${
                          isPriority
                            ? 'border-white shadow-md shadow-white/5'
                            : 'border-white/[0.08] hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono-studio">
                          <span className="text-neutral-400 uppercase tracking-wider">
                            PRIORITY: <strong className="text-white">{p.priority}</strong>
                          </span>
                          <span className="text-white font-bold">{p.progress}%</span>
                        </div>

                        <h4 className="text-xs font-semibold text-white font-sans leading-snug">
                          {p.title}
                        </h4>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isPriority ? 'bg-emerald-400' : 'bg-white'
                            }`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>

                        {milestonesForProj.length > 0 && (
                          <div className="text-[10px] font-mono-studio text-neutral-400 flex items-center justify-between">
                            <span>Milestones:</span>
                            <span className="text-neutral-200">
                              {doneMilestones}/{milestonesForProj.length} completed
                            </span>
                          </div>
                        )}

                        {p.cogniNotes && (
                          <div className="text-[11px] text-neutral-400 font-sans bg-[#080808] p-2.5 rounded border border-white/[0.06] leading-relaxed">
                            {p.cogniNotes}
                          </div>
                        )}

                        {/* Direct Priority Action Button */}
                        <div className="pt-1">
                          {isPriority ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenFocusTab) {
                                  onOpenFocusTab();
                                } else {
                                  setActiveTab('focus');
                                }
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 text-[10px] font-mono-studio font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Check className="w-3 h-3" />
                              <span>Active Priority — Open Milestones →</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (onSelectPriorityProject) {
                                  onSelectPriorityProject(p.id);
                                }
                                if (onOpenFocusTab) {
                                  onOpenFocusTab();
                                } else {
                                  setActiveTab('focus');
                                }
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white hover:text-black text-neutral-200 text-[10px] font-mono-studio font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                            >
                              <Target className="w-3 h-3" />
                              <span>Set as Today&apos;s Priority</span>
                            </button>
                          )}
                        </div>

                        {/* Stage Move Controls */}
                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono-studio">
                          <span className="text-neutral-500">STAGE:</span>
                          <div className="flex space-x-1">
                            {col.id !== 'ongoing' && (
                              <button
                                type="button"
                                onClick={() => onUpdateProjectCategory(p.id, 'ongoing')}
                                className="px-1.5 py-0.5 rounded border border-white/10 text-neutral-400 hover:text-white"
                              >
                                ONGOING
                              </button>
                            )}
                            {col.id !== 'pending' && (
                              <button
                                type="button"
                                onClick={() => onUpdateProjectCategory(p.id, 'pending')}
                                className="px-1.5 py-0.5 rounded border border-white/10 text-neutral-400 hover:text-white"
                              >
                                PENDING
                              </button>
                            )}
                            {col.id !== 'unpending' && (
                              <button
                                type="button"
                                onClick={() => onUpdateProjectCategory(p.id, 'unpending')}
                                className="px-1.5 py-0.5 rounded border border-white/10 text-neutral-400 hover:text-white"
                              >
                                UNPEND
                              </button>
                            )}
                            {col.id !== 'study' && (
                              <button
                                type="button"
                                onClick={() => onUpdateProjectCategory(p.id, 'study')}
                                className="px-1.5 py-0.5 rounded border border-white/10 text-neutral-400 hover:text-white"
                              >
                                STUDY
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {columnProjects.length === 0 && (
                    <div className="p-6 text-center text-xs font-mono-studio text-neutral-600 border border-dashed border-white/[0.06] rounded-xl">
                      NO BUILDS IN THIS STAGE
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Today's Priority & Milestones */}
      {activeTab === 'focus' && (
        <FocusGoal
          projects={projects}
          currentHour={currentHour}
          onUpdateProjectProgress={onUpdateProjectProgress}
          onOpenCircadianMatrix={onOpenCircadianMatrix}
          onOpenProjectsBoard={() => setActiveTab('kanban')}
          priorityProjectId={priorityProjectId}
          onSelectPriorityProject={onSelectPriorityProject}
          projectMilestones={projectMilestones}
          onToggleMilestone={onToggleMilestone}
          onAddMilestone={onAddMilestone}
          onDeleteMilestone={onDeleteMilestone}
          routine={routine}
          onUpdateRoutine={onUpdateRoutine}
        />
      )}

      {/* View 3: 16-Week Heuristic Calibration Log */}
      {activeTab === 'calibration' && (
        <section className="p-6 sm:p-8 rounded-2xl bg-[#050505] border border-white/[0.08] space-y-6">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono-studio text-amber-200">
            <strong>Simulation &amp; Heuristic Notice:</strong> The 16-week percentage below is an estimated heuristic index based on logged habits and interaction count—not formal proof of cognitive equivalence.
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 tracking-wider block mb-1">
                HEURISTIC CALIBRATION LOG · 16 WEEKS
              </span>
              <h3 className="font-display text-2xl font-normal text-white">
                16-Week Persona &amp; Habit Index
              </h3>
            </div>

            <button
              type="button"
              onClick={onLogTelemetryInteraction}
              className="px-5 py-2.5 rounded-xl border border-white/20 hover:border-white text-xs font-mono-studio uppercase tracking-wider text-white transition-all"
            >
              LOG TELEMETRY INTERACTION (+0.2%)
            </button>
          </div>

          {/* Week Scrubber */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono-studio">
              <span className="text-neutral-400">
                CALIBRATION STAGE:{' '}
                <strong className="text-white">WEEK {currentCalibration.currentWeek}</strong> OF 16
              </span>
              <span className="text-white font-bold">
                {currentCalibration.digitalTwinFidelityScore}% HEURISTIC ALIGNMENT (EST.)
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={currentCalibration.currentWeek}
              onChange={(e) => onUpdateWeek(parseInt(e.target.value, 10))}
              className="w-full accent-white cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono-studio text-neutral-500 uppercase tracking-wider">
              <span>W1. Observation</span>
              <span>W5. Heuristics</span>
              <span>W9. Co-Pilot</span>
              <span>W16. Calibrated Preset</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-5 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 block">
                ESTIMATED ALIGNMENT
              </span>
              <span className="text-3xl font-mono-studio font-bold text-white">
                {currentCalibration.digitalTwinFidelityScore}%
              </span>
              <span className="text-[10px] font-mono-studio text-neutral-500 block">
                Heuristic curve (not proof)
              </span>
            </div>

            <div className="p-5 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 block">
                LOGGED HABITS
              </span>
              <span className="text-3xl font-mono-studio font-bold text-white">
                {currentCalibration.learnedHabitsCount}
              </span>
              <span className="text-[10px] font-mono-studio text-neutral-500 block">
                Recorded sessions
              </span>
            </div>

            <div className="p-5 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 block">
                STYLE PRESET SYNC
              </span>
              <span className="text-3xl font-mono-studio font-bold text-white">
                {currentCalibration.communicationStyleSync}%
              </span>
              <span className="text-[10px] font-mono-studio text-neutral-500 block">
                Template rule match
              </span>
            </div>

            <div className="p-5 rounded-xl bg-black border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-500 block">
                HEURISTIC RULES
              </span>
              <span className="text-3xl font-mono-studio font-bold text-white">
                {currentCalibration.decisionHeuristicsTrained}
              </span>
              <span className="text-[10px] font-mono-studio text-neutral-500 block">
                Priority trade-off rules
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-black border border-white/[0.15] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-mono-studio uppercase text-neutral-400 tracking-wider">
                NEW REPO / STUDY BUILD
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs font-mono-studio">
              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Memory Agent on Kubernetes"
                  className="w-full bg-[#050505] border border-white/[0.12] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1.5 uppercase">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ProjectItem['category'])}
                    className="w-full bg-[#050505] border border-white/[0.12] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                  >
                    <option value="ongoing">Ongoing Build</option>
                    <option value="pending">Pending</option>
                    <option value="unpending">Unpending</option>
                    <option value="study">Study / Academic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1.5 uppercase">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ProjectItem['priority'])}
                    className="w-full bg-[#050505] border border-white/[0.12] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase">Energy Requirement</label>
                <select
                  value={newEnergy}
                  onChange={(e) =>
                    setNewEnergy(e.target.value as ProjectItem['energyRequirement'])
                  }
                  className="w-full bg-[#050505] border border-white/[0.12] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-white/50"
                >
                  <option value="high_focus">High Focus (Peak Window)</option>
                  <option value="moderate">Moderate Energy</option>
                  <option value="creative">Creative Synthesis (Secondary Window)</option>
                  <option value="low_friction">Low Friction (Slump Window)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1.5 uppercase">Initial Notes</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key milestones or architecture notes..."
                  className="w-full bg-[#050505] border border-white/[0.12] rounded-lg px-3.5 py-2 text-white resize-none focus:outline-none focus:border-white/50 font-sans"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-white/15 text-neutral-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-white text-black font-bold uppercase tracking-wider hover:bg-neutral-200"
                >
                  SAVE BUILD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
