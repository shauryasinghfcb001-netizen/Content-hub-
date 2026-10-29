export type TabType = 'swarm' | 'mcp' | 'circadian' | 'scout' | 'projects' | 'focus' | 'twin' | 'habits' | 'loop';



export type CognitiveHabitCategory =
  | 'deep_work'
  | 'reading'
  | 'rest'
  | 'coding'
  | 'reflection'
  | 'bio_sync';

export interface CognitiveHabitLog {
  id: string;
  name: string;
  category: CognitiveHabitCategory;
  durationMinutes: number;
  timestamp: string;
  hour: number;
  circadianAlignment: 'peak_aligned' | 'slump_protected' | 'neutral';
  impactFidelityDelta: number; // e.g. 0.35 (+0.35% fidelity)
  qualityScore: number; // 1 to 10
  notes: string;
  tags: string[];
}

export interface HabitTelemetrySummary {
  totalHabitsCount: number;
  totalMinutesLogged: number;
  cumulativeFidelityBoost: number;
  circadianSyncPercentage: number;
  habitsByCategory: Record<CognitiveHabitCategory, number>;
}

export interface DailyFocusMilestone {

  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface DailyFocusGoal {
  projectId: string;
  projectTitle: string;
  todayTargetMinutes: number;
  minutesLogged: number;
  dailyProgressPct: number;
  milestones: DailyFocusMilestone[];
  dailyNote: string;
  streakDays: number;
  isGoalAchieved: boolean;
  lastUpdated: string;
}

export interface UserRoutineConfig {
  wakeHour: number;
  sleepHour: number;
  morningPeakStart: number;
  morningPeakEnd: number;
  slumpStart: number;
  slumpEnd: number;
  eveningPeakStart: number;
  eveningPeakEnd: number;
}


export interface CircadianSlot {
  hour: number;
  label: string;
  energyLevel: number;
  cognitiveState: 'Deep Flow' | 'High Energy' | 'Administrative' | 'Creative Wandering' | 'Slump / Rest' | 'Deep Sleep';
  recommendedAction: string;
  isPeak: boolean;
  isSlump: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'ongoing' | 'pending' | 'unpending' | 'study';
  priority: 'critical' | 'high' | 'medium' | 'low';
  progress: number;
  energyRequirement: 'high_focus' | 'moderate' | 'creative' | 'low_friction';
  tags: string[];
  lastUpdated: string;
  cogniNotes?: string;
}

export interface FineTuningCalibration {
  currentWeek: number;
  totalWeeks: 16;
  progressPercentage: number;
  digitalTwinFidelityScore: number;
  learnedHabitsCount: number;
  communicationStyleSync: number;
  decisionHeuristicsTrained: number;
  activePersonaPhase: string;
}

export interface SubagentInfo {
  id: string;
  name: string;
  codename: string;
  role: string;
  status: 'active' | 'standby' | 'syncing' | 'looping';
  cadence: string;
  lastExecution: string;
  tasksCompleted: number;
  resonance: number;
  color: string;
}

export interface ScoutItem {
  id: string;
  author?: string;
  channel?: string;
  source: 'Twitter / X' | 'YouTube';
  title: string;
  duration?: string;
  snippet: string;
  timestamp: string;
  relevanceScore: number;
  matchedProject: string;
  actionableTip: string;
}

export interface LoopIteration {
  iteration: number;
  score: number;
  critique: string;
  weaknesses: string[];
  upgradesApplied: string[];
  refinedStrategyText: string;
  isApproved: boolean;
}

export interface OrchestratorDispatchResult {
  summary: string;
  circadianVerdict: string;
  twitterInsights: string[];
  youtubeBreakdowns: string[];
  projectAlignments: Array<{ projectTitle: string; recommendedUpgrade: string; source: string }>;
  inboxStrat: string;
  digitalTwinCalibration: string;
  preliminaryStrategy: string;
}

export interface ParallelAgentExecutionLane {
  agentId: string;
  agentName: string;
  role: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'APPROVED';
  durationMs: number;
  tokensUsed: number;
  output: string;
  metrics: Record<string, any>;
}

export interface DigitalTwinSimulation {
  scenario: string;
  genericResponse: string;
  cogniTwinResponse: string;
  twinFidelity: number;
  currentWeek: number;
  decisionHeuristics: string[];
}

export interface SwarmSessionHistoryPoint {
  session: string;
  sessionNumber: number;
  totalInteractions: number;
  avgDispatchRating: number;
  baselineRating: number;
  loopIterations: number;
  timestamp: string;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  sampleArgs: Record<string, any>;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  package: string;
  category: 'knowledge' | 'engineering' | 'calendar' | 'intelligence' | 'storage';
  status: 'connected' | 'disconnected' | 'syncing';
  transport: 'stdio' | 'sse';
  endpointOrCommand: string;
  workspaceName: string;
  lastSynced: string;
  syncedItemsCount: number;
  tools: MCPToolDefinition[];
}

export interface NotionPageItem {
  id: string;
  title: string;
  database: 'Projects Roadmap' | 'Daily Focus Journal' | 'AI Research Vault' | 'Habit Telemetry';
  status: 'Synced' | 'Modified' | 'Exported';
  lastEdited: string;
  url: string;
  linkedProjectId?: string;
}

export interface HarnessStepLog {
  id: string;
  stepNumber: number;
  agentOrServer: string;
  toolName: string;
  inputArgs: string;
  outputSummary: string;
  durationMs: number;
  status: 'running' | 'completed' | 'verified';
}


