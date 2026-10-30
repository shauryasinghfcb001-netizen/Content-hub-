export type TabType =
  | 'focus'
  | 'projects'
  | 'circadian'
  | 'reels'
  | 'swarm'
  | 'mcp'
  | 'loop'
  | 'habits'
  | 'twin'
  | 'scout';

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
  cognitiveState:
    | 'Deep Flow'
    | 'High Energy'
    | 'Administrative'
    | 'Creative Wandering'
    | 'Slump / Rest'
    | 'Deep Sleep';
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

// ============================================================================
// FUTURE INTEGRATIONS (INTENDED, NOT CONNECTED)
// ============================================================================
export interface IntendedIntegration {
  id: 'jarvis' | 'codex' | 'claude' | 'minime' | 'hermes';
  name: string;
  roleDescription: string;
  status: 'intended_not_connected';
  statusLabel: 'Intended · Not Connected';
  activationRule: string;
}

// ============================================================================
// REEL HUB MODULE TYPES (ADDITIVE, MANUAL-FIRST, LOCALSTORAGE)
// ============================================================================
export type ReelContentFormat = 'reel' | 'carousel' | 'long_video' | 'x_clip';

export interface ReelCreatorSource {
  id: string;
  name: string;
  platform: 'YouTube' | 'X / Twitter' | 'Instagram' | 'Substack / Web' | 'Other';
  url: string;
  addedAt: string;
}

export interface ReelSourceInboxItem {
  id: string;
  sourceId?: string;
  sourceName: string;
  platform: ReelCreatorSource['platform'];
  url: string;
  note: string;
  capturedAt: string;
  isDuplicateUrl: boolean;
  duplicateOfItemId?: string;
}

export interface ReelIdeaItem {
  id: string;
  title: string;
  format: ReelContentFormat;
  sourceUrl: string;
  sourceName: string;
  dateCaptured: string;
  whatWasTaken: string;
  checkDone: string;
  checkDate: string;
  status: 'inbox_idea' | 'approved' | 'in_script' | 'queued';
  isDuplicateSourceUrl: boolean;
  angleIndex: number; // 1 for first angle from URL, 2 for second distinct angle from same URL, etc.
  linkedIdeaIds: string[];
}

export interface CarouselSlideItem {
  id: string;
  slideNumber: number;
  headline: string;
  body: string;
}

export type ReelScriptStatus = 'draft' | 'ready_to_shoot' | 'in_queue' | 'shot' | 'posted';

export interface ReelScriptItem {
  id: string;
  ideaId?: string;
  title: string;
  format: ReelContentFormat;
  hook: string;
  spokenScript: string;
  carouselSlides: CarouselSlideItem[];
  // Three mandatory governance fields on every script:
  status: ReelScriptStatus;
  checked: string; // What was verified
  checkedDate: string; // Date verified
  avoid: string; // What not to claim
  // Configurable / demo flags:
  needsToolRun: boolean;
  needsSourceCheck: boolean;
  isSeedDraft: boolean;
  targetDurationSec: number;
  carouselPatternLabel?: string;
  sourceUrl?: string;
  updatedAt: string;
}

export type ReelQueueStage = 'to_shoot' | 'to_edit' | 'ready_to_post' | 'blocked' | 'completed';

export interface ReelQueueItem {
  id: string;
  scriptId: string;
  title: string;
  format: ReelContentFormat;
  stage: ReelQueueStage;
  isTodayPriority: boolean;
  blockedReason: string; // Visible inline when stage === 'blocked' or when flags exist
  needsToolRun: boolean;
  needsSourceCheck: boolean;
  scheduledDate: string;
  notes: string;
}

export interface ReelResultLogItem {
  id: string;
  queueId?: string;
  scriptId?: string;
  title: string;
  format: ReelContentFormat;
  postedDate: string;
  platformUrl?: string;
  views: number;
  likes: number;
  comments: number;
  sends: number;
  hookUsed?: string;
  notes: string;
}

export interface ReelCadenceConfig {
  dailyReelsTarget: number; // default 1
  sprintDays: number; // default 30
  dailyCarouselsTarget: number; // default 2 (read from "consoles" - pending confirmation)
  carouselsTermConfirmed: boolean; // default false (shows pending confirmation note)
  weeklyLongVideosMin: number; // default 2
  weeklyLongVideosMax: number; // default 3
  defaultReelDurationSec: number; // default 60
  defaultCarouselSlidesCount: number; // default 6
  secondCarouselPattern: string; // default "Carousel #2: Rapid Checklist / Contrarian Take"
  xClipDestinationNote: string; // default "Unsettled (after LinkedIn retraction) — awaiting user input"
  llmConnectorEnabled: boolean; // ships disabled (false)
}

export interface ReelHubState {
  sources: ReelCreatorSource[]; // Starts empty per "The creator source list is still pending; do not invent sources."
  sourceItems: ReelSourceInboxItem[];
  ideas: ReelIdeaItem[];
  scripts: ReelScriptItem[];
  queue: ReelQueueItem[];
  results: ReelResultLogItem[];
  cadenceConfig: ReelCadenceConfig;
}

export interface CogniBrainBackupPayload {
  schemaVersion: 'cognibrain-backup-v1';
  exportedAt: string;
  projects: ProjectItem[];
  priorityProjectId: string;
  projectMilestones: Record<string, DailyFocusMilestone[]>;
  routine: UserRoutineConfig;
  habitLogs: CognitiveHabitLog[];
  reelHub: ReelHubState;
}
