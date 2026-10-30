import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCircadianProfile,
  getOptimalProjectForHour,
  calculateFineTuningTrajectory,
  executeLoopUntilThreshold,
  scoreFeedRelevance,
  getTopPriorityProject,
  calculateDailyFocusProgress,
  syncProjectProgressWithMilestones,
  calculateHabitTelemetryImpact,
  aggregateHabitTelemetry,
  generateSessionTelemetryTrend,
  executeMCPToolCall,
  buildHarnessExecutionTrace,
  getIntendedFutureIntegrations,
  evaluateSourceUrlDedup,
  parseSeedScriptsMarkdown,
  sortReelQueueItems,
  exportWeeklyResultsMarkdown,
  estimateLocalStorageBytes,
  validateWorkspaceBackupSchema,
  ProjectItem,
} from './cogniLogic';

test('calculateCircadianProfile returns 24 hourly slots and respects adjustable custom routine windows', () => {
  const defaultProfile = calculateCircadianProfile(7, 23);
  assert.equal(defaultProfile.length, 24);

  // Default 10:00 is Peak Flow
  const peakSlot = defaultProfile.find(s => s.hour === 10);
  assert.ok(peakSlot);
  assert.equal(peakSlot.isPeak, true);
  assert.ok(peakSlot.energyLevel >= 80);

  // Default 14:00 is Slump
  const slumpSlot = defaultProfile.find(s => s.hour === 14);
  assert.ok(slumpSlot);
  assert.equal(slumpSlot.isSlump, true);
  assert.ok(slumpSlot.energyLevel <= 50);

  // Custom routine: shift morning peak to 06:00-09:00 and slump to 12:00-13:00
  const customProfile = calculateCircadianProfile(5, 22, {
    wakeHour: 5,
    sleepHour: 22,
    morningPeakStart: 6,
    morningPeakEnd: 9,
    slumpStart: 12,
    slumpEnd: 13,
    eveningPeakStart: 15,
    eveningPeakEnd: 18,
  });

  const customEarlyPeak = customProfile.find(s => s.hour === 7);
  assert.ok(customEarlyPeak);
  assert.equal(customEarlyPeak.isPeak, true);

  const customNoonSlump = customProfile.find(s => s.hour === 12);
  assert.ok(customNoonSlump);
  assert.equal(customNoonSlump.isSlump, true);
});

test('getOptimalProjectForHour assigns high-focus project during peak hours', () => {
  const sampleProjects: ProjectItem[] = [
    {
      id: 'p1',
      title: 'Autonomous Multi-Agent Core Engine',
      category: 'ongoing',
      priority: 'critical',
      progress: 65,
      energyRequirement: 'high_focus',
      tags: ['agent', 'gemini', 'architecture'],
      lastUpdated: '2026-10-22',
    },
    {
      id: 'p2',
      title: 'AI Video Transcription Paper Reading',
      category: 'study',
      priority: 'medium',
      progress: 20,
      energyRequirement: 'low_friction',
      tags: ['study', 'youtube', 'notes'],
      lastUpdated: '2026-10-22',
    },
  ];

  // Peak hour (10am)
  const peakResult = getOptimalProjectForHour(10, sampleProjects);
  assert.equal(peakResult.slot.isPeak, true);
  assert.equal(peakResult.recommendedProject?.id, 'p1');

  // Slump hour (2pm)
  const slumpResult = getOptimalProjectForHour(14, sampleProjects);
  assert.equal(slumpResult.slot.isSlump, true);
  assert.equal(slumpResult.recommendedProject?.id, 'p2');
});

test('calculateFineTuningTrajectory accurately tracks 16-week progression', () => {
  // Week 1 base
  const week1 = calculateFineTuningTrajectory(1, 10);
  assert.equal(week1.currentWeek, 1);
  assert.equal(week1.progressPercentage, 6);
  assert.equal(week1.digitalTwinFidelityScore, 35);
  assert.match(week1.activePersonaPhase, /Phase 1/);

  // Week 8 mid-way
  const week8 = calculateFineTuningTrajectory(8, 200);
  assert.equal(week8.currentWeek, 8);
  assert.equal(week8.progressPercentage, 50);
  assert.ok(week8.digitalTwinFidelityScore > 65);
  assert.match(week8.activePersonaPhase, /Phase 2/);

  // Week 16 mastery
  const week16 = calculateFineTuningTrajectory(16, 1000);
  assert.equal(week16.currentWeek, 16);
  assert.equal(week16.progressPercentage, 100);
  assert.ok(week16.digitalTwinFidelityScore >= 95);
  assert.match(week16.activePersonaPhase, /Phase 4/);
});

test('executeLoopUntilThreshold caps at 3 passes max and provides honest heuristic disclaimer', () => {
  const initialStrat = 'Initial draft: Check Twitter at 9am and work on project.';
  const result = executeLoopUntilThreshold(initialStrat, 6.8, 9.5, 3);

  assert.ok(result.totalLoops <= 3, `Total loops should be capped at 3, got ${result.totalLoops}`);
  assert.ok(result.finalScore >= 9.5, `Score starting at 6.8 should reach >= 9.5 within 3 passes, got ${result.finalScore}`);
  assert.equal(result.isCapped, false);
  assert.match(result.evaluationDisclaimer, /Heuristic checklist score/i);

  // Test low starting score (3.0) to verify hard cap at 3 passes without fake 9.6 override
  const cappedResult = executeLoopUntilThreshold(initialStrat, 3.0, 9.5, 5);
  assert.equal(cappedResult.totalLoops, 3);
  assert.equal(cappedResult.isCapped, true);
  assert.ok(cappedResult.finalScore < 9.5, 'Low starting score should honestly remain below 9.5 when capped at 3 passes');
});

test('syncProjectProgressWithMilestones deterministically calculates project progress from milestones', () => {
  const milestones = [
    { completed: true },
    { completed: true },
    { completed: true },
    { completed: false },
  ];
  assert.equal(syncProjectProgressWithMilestones(milestones, 20), 75);
  assert.equal(syncProjectProgressWithMilestones([], 42), 42);
});

test('scoreFeedRelevance calculates project impact from AI discoveries', () => {
  const result = scoreFeedRelevance(
    'New Gemini Argon Reasoning Agent Patterns Released',
    'Google announces breakthrough in multi-agent orchestration and fast parallel tool execution',
    ['gemini', 'agent', 'tooling']
  );

  assert.ok(result.score >= 70);
  assert.ok(result.matchedTags.includes('gemini'));
  assert.ok(result.matchedTags.includes('agent'));
  assert.match(result.actionableApplication, /Direct integration/);
});

test('getTopPriorityProject selects critical ongoing project first', () => {
  const projects: ProjectItem[] = [
    {
      id: 'p1',
      title: 'Backlog Item',
      category: 'unpending',
      priority: 'medium',
      progress: 90,
      energyRequirement: 'low_friction',
      tags: [],
      lastUpdated: '2026-10-22',
    },
    {
      id: 'p2',
      title: 'Top Ongoing Critical Build',
      category: 'ongoing',
      priority: 'critical',
      progress: 60,
      energyRequirement: 'high_focus',
      tags: [],
      lastUpdated: '2026-10-22',
    },
    {
      id: 'p3',
      title: 'Study Paper',
      category: 'study',
      priority: 'high',
      progress: 40,
      energyRequirement: 'creative',
      tags: [],
      lastUpdated: '2026-10-22',
    },
  ];

  const top = getTopPriorityProject(projects);
  assert.equal(top?.id, 'p2');
  assert.equal(top?.title, 'Top Ongoing Critical Build');
});

test('calculateDailyFocusProgress blends milestone completion and logged time', () => {
  const milestones = [
    { completed: true },
    { completed: true },
    { completed: false },
    { completed: false },
  ];

  const progress = calculateDailyFocusProgress(milestones, 90, 180);
  assert.equal(progress.progressPct, 50);
  assert.equal(progress.isGoalAchieved, false);

  const allDone = [
    { completed: true },
    { completed: true },
  ];
  const completedProgress = calculateDailyFocusProgress(allDone, 180, 180);
  assert.equal(completedProgress.progressPct, 100);
  assert.equal(completedProgress.isGoalAchieved, true);
});

test('calculateHabitTelemetryImpact yields higher boost for peak-aligned deep work', () => {
  const peakDeepWork = calculateHabitTelemetryImpact({
    category: 'deep_work',
    durationMinutes: 90,
    hour: 10,
    qualityScore: 9,
  });

  assert.equal(peakDeepWork.circadianAlignment, 'peak_aligned');
  assert.ok(peakDeepWork.impactFidelityDelta >= 0.5, `Expected >= 0.5, got ${peakDeepWork.impactFidelityDelta}`);

  const slumpRest = calculateHabitTelemetryImpact({
    category: 'rest',
    durationMinutes: 30,
    hour: 14,
    qualityScore: 8,
  });

  assert.equal(slumpRest.circadianAlignment, 'slump_protected');
  assert.ok(slumpRest.impactFidelityDelta > 0.2);
});

test('aggregateHabitTelemetry accurately computes cumulative fidelity boost and sync rate', () => {
  const habits = [
    {
      category: 'deep_work' as const,
      durationMinutes: 90,
      impactFidelityDelta: 0.65,
      circadianAlignment: 'peak_aligned' as const,
    },
    {
      category: 'reading' as const,
      durationMinutes: 45,
      impactFidelityDelta: 0.35,
      circadianAlignment: 'peak_aligned' as const,
    },
    {
      category: 'rest' as const,
      durationMinutes: 20,
      impactFidelityDelta: 0.30,
      circadianAlignment: 'slump_protected' as const,
    },
    {
      category: 'reflection' as const,
      durationMinutes: 15,
      impactFidelityDelta: 0.20,
      circadianAlignment: 'neutral' as const,
    },
  ];

  const summary = aggregateHabitTelemetry(habits);
  assert.equal(summary.totalHabitsCount, 4);
  assert.equal(summary.totalMinutesLogged, 170);
  assert.equal(summary.cumulativeFidelityBoost, 1.5);
  assert.equal(summary.circadianSyncPercentage, 75);
  assert.equal(summary.habitsByCategory.deep_work, 1);
  assert.equal(summary.habitsByCategory.reading, 1);
  assert.equal(summary.habitsByCategory.rest, 1);
  assert.equal(summary.habitsByCategory.reflection, 1);
});

test('generateSessionTelemetryTrend returns 10 historical sessions correlating totalInteractions and avgDispatchRating', () => {
  const trend = generateSessionTelemetryTrend(350, 9.8);
  assert.equal(trend.sessions.length, 10);
  assert.equal(trend.sessions[0].session, 'S-01');
  assert.equal(trend.sessions[9].session, 'S-10');
  assert.equal(trend.sessions[9].totalInteractions, 350);
  assert.ok(trend.sessions[9].avgDispatchRating >= 9.8);
  assert.ok(trend.interactionGrowthDelta > 0);
  assert.ok(trend.meanDispatchRating >= 9.4);
  assert.ok(trend.avgCritiqueLift > 1.0);
});

test('executeMCPToolCall returns valid JSON-RPC 2.0 request and response for Notion MCP server', () => {
  const rpc = executeMCPToolCall('notion', 'notion_query_database', {
    database_id: 'ntn_db_second_brain_roadmap',
  });

  assert.equal(rpc.request.jsonrpc, '2.0');
  assert.equal(rpc.request.method, 'tools/call');
  assert.equal(rpc.request.params.name, 'notion_query_database');
  assert.equal(rpc.response.result.isError, false);
  assert.equal(rpc.response.result.metadata.serverId, 'notion');
  assert.match(rpc.summary, /Notion database/i);
});

test('buildHarnessExecutionTrace generates 4-step agent harness trace with Notion MCP and 9.5 gatekeeper', () => {
  const steps = buildHarnessExecutionTrace(
    'Sync Notion tasks and plan peak coding',
    'daily_pulse',
    ['notion', 'github'],
    [],
    10
  );

  assert.equal(steps.length, 4);
  assert.equal(steps[0].agentOrServer, 'MCP · Notion');
  assert.equal(steps[3].status, 'verified');
});

test('getIntendedFutureIntegrations returns all 5 future integrations marked intended_not_connected', () => {
  const list = getIntendedFutureIntegrations();
  assert.equal(list.length, 5);
  const ids = list.map((i) => i.id);
  assert.deepEqual(ids, ['jarvis', 'codex', 'claude', 'minime', 'hermes']);
  for (const item of list) {
    assert.equal(item.status, 'intended_not_connected');
    assert.equal(item.statusLabel, 'Intended · Not Connected');
  }
});

test('evaluateSourceUrlDedup flags exact same URL re-paste while allowing linked multi-angles', () => {
  const existingInbox = [
    {
      id: 'src-item-1',
      sourceName: 'Manual Capture',
      platform: 'YouTube' as const,
      url: 'https://youtube.com/watch?v=abc123/',
      note: 'First capture note',
      capturedAt: '2026-10-30',
      isDuplicateUrl: false,
    },
  ];
  const existingIdeas = [
    {
      id: 'idea-1',
      title: 'Angle 1: Local harness architecture',
      format: 'reel' as const,
      sourceUrl: 'https://youtube.com/watch?v=abc123',
      sourceName: 'Manual Capture',
      dateCaptured: '2026-10-30',
      whatWasTaken: 'Architecture breakdown',
      checkDone: 'Checked repo structure',
      checkDate: '2026-10-30',
      status: 'approved' as const,
      isDuplicateSourceUrl: false,
      angleIndex: 1,
      linkedIdeaIds: [],
    },
  ];

  // Exact same URL (even with trailing slash or uppercase) is flagged
  const dupCheck = evaluateSourceUrlDedup(
    'HTTPS://youtube.com/watch?v=abc123',
    existingInbox,
    existingIdeas
  );
  assert.equal(dupCheck.isDuplicateInInbox, true);
  assert.equal(dupCheck.matchingInboxItemId, 'src-item-1');
  assert.equal(dupCheck.isDuplicateInIdeas, true);
  assert.deepEqual(dupCheck.matchingIdeaIds, ['idea-1']);
  assert.equal(dupCheck.nextAngleIndex, 2);

  // Distinct URL is not flagged
  const freshCheck = evaluateSourceUrlDedup(
    'https://x.com/example/status/999',
    existingInbox,
    existingIdeas
  );
  assert.equal(freshCheck.isDuplicateInInbox, false);
  assert.equal(freshCheck.isDuplicateInIdeas, false);
  assert.equal(freshCheck.nextAngleIndex, 1);
});

test('parseSeedScriptsMarkdown preserves draft status and [needs tool run] / [needs source check] flags', () => {
  const sampleMarkdown = `
# Why Unbounded Agent Loops Fail [draft] [needs tool run]
Format: reel
Hook: If your AI critic scores its own homework 9.9/10, it is lying to you.
Script: Most agent loops have no hard cap. Cap your critique loop at 3 passes max and verify real outputs.
Checked: Verified against 3-pass cap test suite
Avoid: Do not claim a 9.5 score is formal proof

---

# 6-Slide Breakdown: Local-First Second Brain [carousel] [needs source check]
Hook: Stop putting your entire workflow behind an unverified cloud wrapper.
Script: Carousel walkthrough of local-first JSON backup + manual source provenance.
- Slide 1: Cover Hook | Local-first beats black-box automation
- Slide 2: Provenance | Track source URL, what was taken, and check date
Checked: Pending source check on browser storage quota
Avoid: Do not claim unlimited browser storage
`;

  const parsed = parseSeedScriptsMarkdown(sampleMarkdown, 6, 60);
  assert.equal(parsed.length, 2);

  assert.equal(parsed[0].title, 'Why Unbounded Agent Loops Fail');
  assert.equal(parsed[0].status, 'draft');
  assert.equal(parsed[0].isSeedDraft, true);
  assert.equal(parsed[0].needsToolRun, true);
  assert.equal(parsed[0].needsSourceCheck, false);
  assert.match(parsed[0].avoid, /formal proof/i);

  assert.equal(parsed[1].title, '6-Slide Breakdown: Local-First Second Brain');
  assert.equal(parsed[1].format, 'carousel');
  assert.equal(parsed[1].status, 'draft');
  assert.equal(parsed[1].isSeedDraft, true);
  assert.equal(parsed[1].needsSourceCheck, true);
  assert.equal(parsed[1].carouselSlides.length, 2);
});

test('sortReelQueueItems places Today Priority first and keeps blocked items visible with reason', () => {
  const queue = [
    {
      id: 'q1',
      scriptId: 's1',
      title: 'Blocked Demo Reel',
      format: 'reel' as const,
      stage: 'blocked' as const,
      isTodayPriority: false,
      blockedReason: 'Waiting on local tool run verification',
      needsToolRun: true,
      needsSourceCheck: false,
      scheduledDate: '2026-10-30',
      notes: '',
    },
    {
      id: 'q2',
      scriptId: 's2',
      title: 'Today Priority Reel #1',
      format: 'reel' as const,
      stage: 'to_shoot' as const,
      isTodayPriority: true,
      blockedReason: '',
      needsToolRun: false,
      needsSourceCheck: false,
      scheduledDate: '2026-10-30',
      notes: '',
    },
  ];

  const sorted = sortReelQueueItems(queue);
  assert.equal(sorted.length, 2, 'Blocked item must never be dropped');
  assert.equal(sorted[0].id, 'q2', 'Today priority item comes first');
  assert.equal(sorted[1].id, 'q1');
  assert.equal(sorted[1].blockedReason, 'Waiting on local tool run verification');
});

test('exportWeeklyResultsMarkdown & validateWorkspaceBackupSchema round-trip cleanly', () => {
  const cadence = {
    dailyReelsTarget: 1,
    sprintDays: 30,
    dailyCarouselsTarget: 2,
    carouselsTermConfirmed: false,
    weeklyLongVideosMin: 2,
    weeklyLongVideosMax: 3,
    defaultReelDurationSec: 60,
    defaultCarouselSlidesCount: 6,
    secondCarouselPattern: 'Carousel #2: Rapid Checklist',
    xClipDestinationNote: 'Unsettled after LinkedIn retraction',
    llmConnectorEnabled: false,
  };

  const md = exportWeeklyResultsMarkdown(
    [
      {
        id: 'res-1',
        title: 'Day 1 Original Reel',
        format: 'reel',
        postedDate: '2026-10-30',
        views: 1200,
        likes: 95,
        comments: 14,
        sends: 28,
        notes: 'Strong retention on 3-pass cap hook',
      },
    ],
    cadence
  );
  assert.match(md, /1,200/);
  assert.match(md, /Read from "consoles" — pending confirmation/);

  const validBackup = JSON.stringify({
    schemaVersion: 'cognibrain-backup-v1',
    exportedAt: '2026-10-30T10:00:00Z',
    projects: [],
    priorityProjectId: 'proj-1',
    projectMilestones: {},
    routine: {
      wakeHour: 7,
      sleepHour: 23,
      morningPeakStart: 9,
      morningPeakEnd: 12,
      slumpStart: 13,
      slumpEnd: 15,
      eveningPeakStart: 16,
      eveningPeakEnd: 19,
    },
    habitLogs: [],
    reelHub: {
      sources: [],
      sourceItems: [],
      ideas: [],
      scripts: [],
      queue: [],
      results: [],
      cadenceConfig: cadence,
    },
  });

  const checkValid = validateWorkspaceBackupSchema(validBackup);
  assert.equal(checkValid.valid, true);
  assert.equal(checkValid.payload?.schemaVersion, 'cognibrain-backup-v1');

  const checkInvalid = validateWorkspaceBackupSchema('{"schemaVersion": "wrong"}');
  assert.equal(checkInvalid.valid, false);
  assert.match(checkInvalid.error || '', /schemaVersion/);

  const storageEst = estimateLocalStorageBytes({ key1: validBackup });
  assert.ok(storageEst.usedBytes > 100);
  assert.equal(storageEst.limitKB, 5120);
});

