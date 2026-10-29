/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { SwarmDeck } from './components/SwarmDeck';
import { CircadianMatrix } from './components/CircadianMatrix';
import { ScoutHub } from './components/ScoutHub';
import { ProjectsNexus } from './components/ProjectsNexus';
import { FocusGoal } from './components/FocusGoal';
import { MCPHub } from './components/MCPHub';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DigitalTwinStudio } from './components/views/DigitalTwinStudio';
import { CognitiveHabitLogger } from './components/CognitiveHabitLogger';
import { LoopArena } from './components/LoopArena';
import { CommandPalette } from './components/CommandPalette';
import { ParallelAgentModal } from './components/ParallelAgentModal';
import { CodifiedPromptModal } from './components/CodifiedPromptModal';
import {
  TabType,
  ProjectItem,
  CircadianSlot,
  FineTuningCalibration,
  ScoutItem,
  OrchestratorDispatchResult,
  LoopIteration,
  CognitiveHabitLog,
  DailyFocusMilestone,
  UserRoutineConfig,
  MCPServerConfig,
  NotionPageItem,
} from './types';
import {
  calculateCircadianProfile,
  calculateFineTuningTrajectory,
  executeLoopUntilThreshold,
  calculateHabitTelemetryImpact,
  aggregateHabitTelemetry,
  syncProjectProgressWithMilestones,
} from './utils/cogniLogic';

const INITIAL_MILESTONES: Record<string, DailyFocusMilestone[]> = {
  'proj-1': [
    {
      id: 'ms-101',
      title: 'Lock Projects → Priority → Milestone state sync pipeline',
      completed: true,
      estimatedMinutes: 45,
    },
    {
      id: 'ms-102',
      title: 'Wire Notion MCP JSON-RPC 2.0 sandbox tool definitions',
      completed: true,
      estimatedMinutes: 35,
    },
    {
      id: 'ms-103',
      title: 'Enforce 3-pass hard cap & honest heuristic labels on Critique Checklist',
      completed: true,
      estimatedMinutes: 30,
    },
    {
      id: 'ms-104',
      title: 'Verify custom user routine focus windows across 24h schedule',
      completed: false,
      estimatedMinutes: 40,
    },
  ],
  'proj-2': [
    {
      id: 'ms-201',
      title: 'Configure deduplication filter for Twitter & YouTube feed items',
      completed: true,
      estimatedMinutes: 30,
    },
    {
      id: 'ms-202',
      title: 'Map scraped research notes to active project tickets',
      completed: true,
      estimatedMinutes: 30,
    },
    {
      id: 'ms-203',
      title: 'Batch low-priority social links into afternoon slump window',
      completed: false,
      estimatedMinutes: 25,
    },
  ],
  'proj-3': [
    {
      id: 'ms-301',
      title: 'Summarize episodic vs semantic memory consolidation patterns',
      completed: true,
      estimatedMinutes: 50,
    },
    {
      id: 'ms-302',
      title: 'Benchmark context retrieval latency on local SQLite index',
      completed: false,
      estimatedMinutes: 45,
    },
  ],
  'proj-4': [
    {
      id: 'ms-401',
      title: 'Draft slump-window batching rules for non-urgent threads',
      completed: true,
      estimatedMinutes: 25,
    },
    {
      id: 'ms-402',
      title: 'Test VIP sender allowlist during morning peak hours',
      completed: false,
      estimatedMinutes: 30,
    },
    {
      id: 'ms-403',
      title: 'Verify auto-quarantine tags on simulated inbox stream',
      completed: false,
      estimatedMinutes: 20,
    },
  ],
  'proj-5': [
    {
      id: 'ms-501',
      title: 'Define Docker Compose spec for local Qdrant container',
      completed: false,
      estimatedMinutes: 35,
    },
    {
      id: 'ms-502',
      title: 'Write embedding migration script for markdown notes',
      completed: false,
      estimatedMinutes: 45,
    },
  ],
};

const INITIAL_ROUTINE: UserRoutineConfig = {
  wakeHour: 7,
  sleepHour: 23,
  morningPeakStart: 9,
  morningPeakEnd: 12,
  slumpStart: 13,
  slumpEnd: 15,
  eveningPeakStart: 16,
  eveningPeakEnd: 19,
};

const INITIAL_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'notion',
    name: 'Notion Workspace MCP',
    package: '@modelcontextprotocol/server-notion',
    category: 'knowledge',
    status: 'connected',
    transport: 'stdio',
    endpointOrCommand: 'npx -y @modelcontextprotocol/server-notion',
    workspaceName: 'Shaurya Second Brain HQ',
    lastSynced: '2 mins ago',
    syncedItemsCount: 24,
    tools: [
      {
        name: 'notion_query_database',
        description: 'Query Notion workspace pages and databases by title or status filter.',
        sampleArgs: { database_id: 'ntn_db_second_brain_roadmap', filter: 'ongoing' },
      },
      {
        name: 'notion_append_block',
        description: 'Append structured markdown or milestone checklists to a Notion page.',
        sampleArgs: { page_id: 'ntn_page_kernel_spec', markdown: '- [x] Sync priority milestone' },
      },
      {
        name: 'notion_create_page',
        description: 'Create a tracked Notion page inside Projects Roadmap or Daily Focus Journal.',
        sampleArgs: { database: 'Projects Roadmap', title: 'New Architecture Spec' },
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub Repository MCP',
    package: '@modelcontextprotocol/server-github',
    category: 'engineering',
    status: 'connected',
    transport: 'stdio',
    endpointOrCommand: 'npx -y @modelcontextprotocol/server-github',
    workspaceName: 'shaurya-builds/cognibrain-kernel',
    lastSynced: '8 mins ago',
    syncedItemsCount: 14,
    tools: [
      {
        name: 'github_list_prs',
        description: 'Fetch open pull requests and CI check statuses for active repository.',
        sampleArgs: { repo: 'shaurya-builds/cognibrain-kernel', state: 'open' },
      },
      {
        name: 'github_create_issue',
        description: 'Create a tracked GitHub issue directly from a priority milestone.',
        sampleArgs: { title: 'Verify custom routine focus windows', labels: ['priority', 'core'] },
      },
    ],
  },
  {
    id: 'gcal',
    name: 'Google Calendar Chronos MCP',
    package: '@cognibrain/mcp-calendar-chronos',
    category: 'calendar',
    status: 'connected',
    transport: 'sse',
    endpointOrCommand: 'http://localhost:3000/api/mcp/gcal',
    workspaceName: 'Primary Focus Calendar',
    lastSynced: '14 mins ago',
    syncedItemsCount: 8,
    tools: [
      {
        name: 'gcal_block_focus_window',
        description: 'Block calendar slots matching your configured Primary Peak routine hours.',
        sampleArgs: { startHour: 9, endHour: 12, title: 'Deep Work: CogniBrain Kernel' },
      },
    ],
  },
  {
    id: 'linear',
    name: 'Linear Sprint Tracker MCP',
    package: '@modelcontextprotocol/server-linear',
    category: 'engineering',
    status: 'disconnected',
    transport: 'stdio',
    endpointOrCommand: 'npx -y @modelcontextprotocol/server-linear',
    workspaceName: 'CogniBrain Core Team',
    lastSynced: 'Paused',
    syncedItemsCount: 0,
    tools: [
      {
        name: 'linear_sync_issue',
        description: 'Sync milestone completion state with Linear cycle issues.',
        sampleArgs: { issueId: 'COG-104', state: 'In Progress' },
      },
    ],
  },
];

const INITIAL_NOTION_PAGES: NotionPageItem[] = [
  {
    id: 'notion-page-1',
    title: 'CogniBrain Kernel — Architecture & Milestone Spec',
    database: 'Projects Roadmap',
    status: 'Synced',
    lastEdited: 'Today, 09:40 AM',
    url: 'https://notion.so/shaurya/cognibrain-kernel-spec',
    linkedProjectId: 'proj-1',
  },
  {
    id: 'notion-page-2',
    title: 'Weekly AI Research Synthesis & Paper Notes',
    database: 'AI Research Vault',
    status: 'Synced',
    lastEdited: 'Yesterday, 06:15 PM',
    url: 'https://notion.so/shaurya/ai-research-synthesis',
    linkedProjectId: 'proj-3',
  },
  {
    id: 'notion-page-3',
    title: 'Routine & Focus Window Calibration Log',
    database: 'Daily Focus Journal',
    status: 'Modified',
    lastEdited: '2 days ago',
    url: 'https://notion.so/shaurya/routine-focus-log',
    linkedProjectId: 'proj-4',
  },
];

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'CogniBrain Autonomous Multi-Agent Kernel',
    category: 'ongoing',
    priority: 'critical',
    progress: syncProjectProgressWithMilestones(INITIAL_MILESTONES['proj-1'], 75),
    energyRequirement: 'high_focus',
    tags: ['gemini', 'agent', 'orchestration', 'mcp'],
    lastUpdated: '2026-10-29',
    cogniNotes: 'Core priority pipeline: Projects → Today’s Priority → Milestones with Notion MCP sandbox.',
  },
  {
    id: 'proj-2',
    title: 'Real-Time Twitter & YouTube Feed Harvester',
    category: 'ongoing',
    priority: 'high',
    progress: syncProjectProgressWithMilestones(INITIAL_MILESTONES['proj-2'], 67),
    energyRequirement: 'high_focus',
    tags: ['twitter', 'youtube', 'scout', 'ai-news'],
    lastUpdated: '2026-10-28',
    cogniNotes: 'Filtering high-signal AI engineering releases and attaching notes to active builds.',
  },
  {
    id: 'proj-3',
    title: 'Academic Research on Transformer Long-Term Memory',
    category: 'study',
    priority: 'high',
    progress: syncProjectProgressWithMilestones(INITIAL_MILESTONES['proj-3'], 50),
    energyRequirement: 'creative',
    tags: ['study', 'memory', 'embeddings', 'cognition'],
    lastUpdated: '2026-10-27',
    cogniNotes: 'Focusing on episodic memory compression and local index retrieval.',
  },
  {
    id: 'proj-4',
    title: 'Autonomous Email & Slack Triage Agent',
    category: 'pending',
    priority: 'medium',
    progress: syncProjectProgressWithMilestones(INITIAL_MILESTONES['proj-4'], 33),
    energyRequirement: 'low_friction',
    tags: ['mail', 'slack', 'triage', 'productivity'],
    lastUpdated: '2026-10-25',
    cogniNotes: 'Batches notifications into the configurable afternoon slump window.',
  },
  {
    id: 'proj-5',
    title: 'Self-Hosting Local Vector Vault (Qdrant/Chroma)',
    category: 'unpending',
    priority: 'low',
    progress: syncProjectProgressWithMilestones(INITIAL_MILESTONES['proj-5'], 0),
    energyRequirement: 'moderate',
    tags: ['storage', 'local', 'vector', 'privacy'],
    lastUpdated: '2026-10-20',
    cogniNotes: 'Local-first semantic storage backlog item.',
  },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Default to 'focus' so Projects -> Today's Priority -> Milestone Completion is front and center
  const [currentTab, setCurrentTab] = useState<TabType>('focus');
  const [currentHour] = useState<number>(new Date().getHours());
  const [currentWeek, setCurrentWeek] = useState<number>(6);
  const [totalInteractions, setTotalInteractions] = useState<number>(342);

  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [showArchModal, setShowArchModal] = useState<boolean>(false);
  const [showParallelModal, setShowParallelModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [codifiedPromptText, setCodifiedPromptText] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [userHandles, setUserHandles] = useState<{ twitter: string; youtube: string }>({
    twitter: '@shaurya_builds',
    youtube: '@ShauryaAI',
  });

  const [projects, setProjects] = useState<ProjectItem[]>(() =>
    loadFromStorage('cognibrain_projects_v2', INITIAL_PROJECTS)
  );
  const [priorityProjectId, setPriorityProjectId] = useState<string>(() =>
    loadFromStorage('cognibrain_priority_project_v2', 'proj-1')
  );
  const [projectMilestones, setProjectMilestones] = useState<Record<string, DailyFocusMilestone[]>>(() =>
    loadFromStorage('cognibrain_milestones_v2', INITIAL_MILESTONES)
  );
  const [routine, setRoutine] = useState<UserRoutineConfig>(() =>
    loadFromStorage('cognibrain_routine_v2', INITIAL_ROUTINE)
  );
  const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>(() =>
    loadFromStorage('cognibrain_mcp_servers_v2', INITIAL_MCP_SERVERS)
  );
  const [notionPages, setNotionPages] = useState<NotionPageItem[]>(() =>
    loadFromStorage('cognibrain_notion_pages_v2', INITIAL_NOTION_PAGES)
  );

  useEffect(() => {
    try {
      localStorage.setItem('cognibrain_projects_v2', JSON.stringify(projects));
    } catch (e) {
      console.warn('Storage save note:', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem('cognibrain_priority_project_v2', JSON.stringify(priorityProjectId));
    } catch (e) {
      console.warn('Storage save note:', e);
    }
  }, [priorityProjectId]);

  useEffect(() => {
    try {
      localStorage.setItem('cognibrain_milestones_v2', JSON.stringify(projectMilestones));
    } catch (e) {
      console.warn('Storage save note:', e);
    }
  }, [projectMilestones]);

  useEffect(() => {
    try {
      localStorage.setItem('cognibrain_routine_v2', JSON.stringify(routine));
    } catch (e) {
      console.warn('Storage save note:', e);
    }
  }, [routine]);

  useEffect(() => {
    try {
      localStorage.setItem('cognibrain_mcp_servers_v2', JSON.stringify(mcpServers));
    } catch (e) {
      console.warn('Storage save note:', e);
    }
  }, [mcpServers]);

  useEffect(() => {
    try {
      localStorage.setItem('cognibrain_notion_pages_v2', JSON.stringify(notionPages));
    } catch (e) {
      console.warn('Storage save note:', e);
    }
  }, [notionPages]);

  const [scoutItems, setScoutItems] = useState<ScoutItem[]>([
    {
      id: 'tw-1',
      author: '@AIExplained',
      source: 'Twitter / X',
      title: 'Gemini Argon benchmarks reveal unprecedented agentic reasoning depth',
      snippet: 'New evaluations show Argon handles 10-step recursive tool chains without drift. Ideal for structured agent harnesses.',
      timestamp: '2 hours ago (Simulated Feed)',
      relevanceScore: 96,
      matchedProject: 'CogniBrain Autonomous Multi-Agent Kernel',
      actionableTip: 'Use Argon as the supervisor router; delegate deterministic schema checks to lightweight tools.',
    },
    {
      id: 'tw-2',
      author: '@Karpathy',
      source: 'Twitter / X',
      title: 'Why curated daily decision logs beat raw telemetry dumps',
      snippet: 'High-signal human feedback over 90-120 days captures prioritization trade-offs and focus cadence.',
      timestamp: '4 hours ago (Simulated Feed)',
      relevanceScore: 94,
      matchedProject: 'Academic Research on Transformer Long-Term Memory',
      actionableTip: 'Log daily decision trade-offs and completed milestones rather than passive metrics.',
    },
    {
      id: 'tw-3',
      author: '@HuggingFace',
      source: 'Twitter / X',
      title: 'Bounded Critique Loops: Why capping self-refinement at 3 passes prevents reward hacking',
      snippet: 'Unbounded LLM self-critique loops often inflate their own scores. Hard-capping at 3 passes keeps checklists grounded.',
      timestamp: '7 hours ago (Simulated Feed)',
      relevanceScore: 92,
      matchedProject: 'CogniBrain Autonomous Multi-Agent Kernel',
      actionableTip: 'Cap automated critique loops at 3 iterations and treat scores as heuristic planning aids.',
    },
    {
      id: 'yt-1',
      channel: 'Matthew Berman',
      source: 'YouTube',
      title: 'Model Context Protocol (MCP) in Practice: Connecting Notion & GitHub to Local Harnesses',
      duration: '18:42',
      snippet: 'Walkthrough of JSON-RPC 2.0 tool calls bridging local developer harnesses with Notion databases.',
      timestamp: 'Today at 09:15 AM (Simulated)',
      relevanceScore: 91,
      matchedProject: 'Real-Time Twitter & YouTube Feed Harvester',
      actionableTip: 'Expose explicit read/write tool schemas so every Notion sync is inspectable.',
    },
    {
      id: 'yt-2',
      channel: 'Yannic Kilcher',
      source: 'YouTube',
      title: 'Paper Explained: Scalable Second Brain Architectures with Episodic-Semantic Memory',
      duration: '24:10',
      snippet: 'Detailed breakdown of local-first vs cloud storage topologies for personal knowledge systems.',
      timestamp: 'Yesterday at 08:30 PM (Simulated)',
      relevanceScore: 89,
      matchedProject: 'Self-Hosting Local Vector Vault',
      actionableTip: 'Use dual-tier storage: SQLite/localStorage locally for low latency + vector index for deep search.',
    },
  ]);

  const [latestDispatch, setLatestDispatch] = useState<OrchestratorDispatchResult | null>({
    summary: 'Agent Harness executed tool trace across Notion MCP & Routine Planner.',
    circadianVerdict: `Primary Peak window configured (${String(routine.morningPeakStart).padStart(2, '0')}:00 - ${String(routine.morningPeakEnd).padStart(2, '0')}:00). Deep work protection active.`,
    twitterInsights: [
      'Capped 3-pass critique loops prevent self-congratulatory score inflation in agent harnesses.',
      'Structured milestone checklists provide stronger execution signal than passive dashboard scores.',
    ],
    youtubeBreakdowns: [
      'MCP JSON-RPC 2.0 bridges allow clean two-way sync between local priority boards and Notion.',
    ],
    projectAlignments: [
      {
        projectTitle: 'CogniBrain Autonomous Multi-Agent Kernel',
        recommendedUpgrade: 'Keep Projects → Today’s Priority → Milestones as the primary daily workflow.',
        source: 'Harness Architecture Review',
      },
    ],
    inboxStrat: `Batch incoming emails and low-friction triage during your ${String(routine.slumpStart).padStart(2, '0')}:00 - ${String(routine.slumpEnd).padStart(2, '0')}:00 slump window.`,
    digitalTwinCalibration: 'Week 6 heuristic index: 78.4% habit consistency across 117 logged sessions.',
    preliminaryStrategy: `Focus on Today's Priority milestones during ${String(routine.morningPeakStart).padStart(2, '0')}:00 - ${String(routine.morningPeakEnd).padStart(2, '0')}:00. Sync progress to Notion MCP.`,
  });

  const [latestLoop, setLatestLoop] = useState<{
    iterations: LoopIteration[];
    finalApprovedStrategy: string;
    finalScore: number;
  } | null>(() => {
    const initialRun = executeLoopUntilThreshold(
      'Protect primary peak focus hours for active project milestones, batch triage into slump window, and sync milestone status to Notion MCP.',
      7.4,
      9.5,
      3
    );
    return {
      iterations: initialRun.iterations,
      finalApprovedStrategy: initialRun.finalApprovedStrategy,
      finalScore: initialRun.finalScore,
    };
  });

  // Cognitive Habit Telemetry state
  const [habitLogs, setHabitLogs] = useState<CognitiveHabitLog[]>([
    {
      id: 'habit-1',
      name: 'Morning Peak Multi-Agent Kernel Coding',
      category: 'coding',
      durationMinutes: 90,
      timestamp: 'Today at 09:30 AM',
      hour: 9,
      circadianAlignment: 'peak_aligned',
      impactFidelityDelta: 0.65,
      qualityScore: 10,
      notes: 'Completed 3 priority milestones with zero context switching.',
      tags: ['coding', 'gemini', 'kernel'],
    },
    {
      id: 'habit-2',
      name: 'arXiv Paper: Episodic Memory in Long-Context LLMs',
      category: 'reading',
      durationMinutes: 45,
      timestamp: 'Today at 11:15 AM',
      hour: 11,
      circadianAlignment: 'peak_aligned',
      impactFidelityDelta: 0.40,
      qualityScore: 9,
      notes: 'Extracted key principles of episodic decay vs permanent heuristic consolidation.',
      tags: ['reading', 'research'],
    },
    {
      id: 'habit-3',
      name: 'Slump-Window Non-Sleep Deep Rest (NSDR)',
      category: 'rest',
      durationMinutes: 25,
      timestamp: 'Today at 02:15 PM',
      hour: 14,
      circadianAlignment: 'slump_protected',
      impactFidelityDelta: 0.35,
      qualityScore: 8,
      notes: 'Quarantined incoming messages; completed recovery reset.',
      tags: ['rest', 'recovery'],
    },
    {
      id: 'habit-4',
      name: 'Subagent Dispatch Trade-Off Reflection',
      category: 'reflection',
      durationMinutes: 20,
      timestamp: 'Yesterday at 08:30 PM',
      hour: 20,
      circadianAlignment: 'neutral',
      impactFidelityDelta: 0.25,
      qualityScore: 9,
      notes: 'Logged daily decision heuristics for priority ordering.',
      tags: ['reflection', 'heuristics'],
    },
  ]);

  const habitTelemetry = aggregateHabitTelemetry(habitLogs);
  const circadianProfile: CircadianSlot[] = calculateCircadianProfile(
    routine.wakeHour,
    routine.sleepHour,
    routine
  );
  const calibration: FineTuningCalibration = calculateFineTuningTrajectory(
    currentWeek,
    totalInteractions,
    habitTelemetry.cumulativeFidelityBoost,
    113 + habitLogs.length
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.trajectory) setCurrentWeek(data.trajectory.currentWeek);
        if (data.userHandle) setUserHandles(data.userHandle);
      })
      .catch((err) => console.warn('Backend sync note:', err));

    fetch('/api/codified-prompt')
      .then((res) => res.json())
      .then((data) => {
        if (data.codifiedPrompt) setCodifiedPromptText(data.codifiedPrompt);
      })
      .catch((err) => console.warn('Codified prompt fetch note:', err));

    // Global keyboard listener for shortcuts (1-9, ⌘K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if (
        !e.metaKey &&
        !e.ctrlKey &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        if (e.key === '1') setCurrentTab('focus');
        else if (e.key === '2') setCurrentTab('projects');
        else if (e.key === '3') setCurrentTab('circadian');
        else if (e.key === '4') setCurrentTab('swarm');
        else if (e.key === '5') setCurrentTab('mcp');
        else if (e.key === '6') setCurrentTab('loop');
        else if (e.key === '7') setCurrentTab('habits');
        else if (e.key === '8') setCurrentTab('twin');
        else if (e.key === '9') setCurrentTab('scout');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const syncStore = (updatedProjects = projects, updatedWeek = currentWeek) => {
    fetch('/api/store/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userHandle: userHandles,
        projects: updatedProjects,
        currentWeek: updatedWeek,
      }),
    }).catch((err) => console.warn('Store update note:', err));
  };

  // Milestone handlers that deterministically update Project completion %
  const handleToggleMilestone = (projectId: string, milestoneId: string) => {
    const currentList = projectMilestones[projectId] || [];
    const updatedList = currentList.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const updatedMilestonesMap = {
      ...projectMilestones,
      [projectId]: updatedList,
    };
    setProjectMilestones(updatedMilestonesMap);

    const targetProj = projects.find((p) => p.id === projectId);
    const newProgress = syncProjectProgressWithMilestones(
      updatedList,
      targetProj?.progress ?? 0
    );
    const updatedProjects = projects.map((p) =>
      p.id === projectId
        ? { ...p, progress: newProgress, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    );
    setProjects(updatedProjects);
    syncStore(updatedProjects, currentWeek);
    showToast(`Milestone updated • Project completion synced to ${newProgress}%`);
  };

  const handleAddMilestone = (
    projectId: string,
    title: string,
    estimatedMinutes: number
  ) => {
    const newMs: DailyFocusMilestone = {
      id: `ms-${Date.now()}`,
      title,
      completed: false,
      estimatedMinutes,
    };
    const currentList = projectMilestones[projectId] || [];
    const updatedList = [...currentList, newMs];
    setProjectMilestones({
      ...projectMilestones,
      [projectId]: updatedList,
    });

    const targetProj = projects.find((p) => p.id === projectId);
    const newProgress = syncProjectProgressWithMilestones(
      updatedList,
      targetProj?.progress ?? 0
    );
    const updatedProjects = projects.map((p) =>
      p.id === projectId
        ? { ...p, progress: newProgress, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    );
    setProjects(updatedProjects);
    syncStore(updatedProjects, currentWeek);
    showToast(`Added milestone • Project completion now ${newProgress}%`);
  };

  const handleDeleteMilestone = (projectId: string, milestoneId: string) => {
    const currentList = projectMilestones[projectId] || [];
    const updatedList = currentList.filter((m) => m.id !== milestoneId);
    setProjectMilestones({
      ...projectMilestones,
      [projectId]: updatedList,
    });

    const targetProj = projects.find((p) => p.id === projectId);
    const newProgress = syncProjectProgressWithMilestones(
      updatedList,
      targetProj?.progress ?? 0
    );
    const updatedProjects = projects.map((p) =>
      p.id === projectId
        ? { ...p, progress: newProgress, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    );
    setProjects(updatedProjects);
    syncStore(updatedProjects, currentWeek);
    showToast(`Removed milestone • Project completion synced to ${newProgress}%`);
  };

  const handleSelectPriorityProject = (projectId: string) => {
    setPriorityProjectId(projectId);
    const target = projects.find((p) => p.id === projectId);
    if (target) {
      showToast(`Set Today's Priority: ${target.title}`);
    }
  };

  const handleUpdateRoutine = (newRoutine: UserRoutineConfig) => {
    setRoutine(newRoutine);
    showToast(
      `Routine updated: Peak ${String(newRoutine.morningPeakStart).padStart(2, '0')}:00–${String(newRoutine.morningPeakEnd).padStart(2, '0')}:00`
    );
  };

  // MCP & Notion Handlers
  const handleToggleMCPServer = (serverId: string) => {
    setMcpServers((prev) =>
      prev.map((s) => {
        if (s.id === serverId) {
          const nextStatus = s.status === 'connected' ? 'disconnected' : 'connected';
          showToast(
            `${s.name}: ${nextStatus === 'connected' ? 'Connected to Sandbox' : 'Disconnected'}`
          );
          return {
            ...s,
            status: nextStatus,
            lastSynced: nextStatus === 'connected' ? 'Just now' : 'Paused',
          };
        }
        return s;
      })
    );
  };

  const handleCreateNotionPage = (
    title: string,
    database: NotionPageItem['database']
  ) => {
    const newPage: NotionPageItem = {
      id: `notion-page-${Date.now()}`,
      title,
      database,
      status: 'Synced',
      lastEdited: 'Just now (Sandbox)',
      url: `https://notion.so/shaurya/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      linkedProjectId: priorityProjectId,
    };
    setNotionPages((prev) => [newPage, ...prev]);
    setTotalInteractions((prev) => prev + 1);
    showToast(`Created Notion sandbox page: ${newPage.title}`);
  };

  const handleSyncNotion = async (workspaceName: string, databaseId: string) => {
    try {
      await fetch('/api/mcp/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName,
          databaseId,
          projectsCount: projects.length,
        }),
      });
    } catch {
      // Local sandbox fallback
    }

    const syncedPages: NotionPageItem[] = projects.slice(0, 3).map((proj, idx) => ({
      id: `ntn-sync-${proj.id}`,
      title: `${proj.title} (${proj.progress}% Complete)`,
      database: idx === 0 ? 'Projects Roadmap' : idx === 1 ? 'AI Research Vault' : 'Daily Focus Journal',
      status: 'Synced',
      lastEdited: 'Synced just now',
      url: `https://notion.so/shaurya/${proj.id}`,
      linkedProjectId: proj.id,
    }));

    setNotionPages(syncedPages);
    setMcpServers((prev) =>
      prev.map((s) =>
        s.id === 'notion'
          ? {
              ...s,
              workspaceName,
              lastSynced: 'Just now',
              syncedItemsCount: syncedPages.length + 21,
              status: 'connected',
            }
          : s
      )
    );
    setTotalInteractions((prev) => prev + 1);
    showToast(`Synced ${projects.length} projects with Notion MCP (${workspaceName})`);
  };

  const handleDispatch = async (mode = 'daily_pulse', goal = '') => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/orchestrator/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          customGoal: goal,
          currentHour,
          activeWeek: currentWeek,
        }),
      });
      const data = await res.json();
      if (data.dispatch) setLatestDispatch(data.dispatch);
      if (data.loopResult) setLatestLoop(data.loopResult);
      setTotalInteractions((prev) => prev + 1);
      showToast('Agent Harness completed tool trace & critique check');
    } catch (err) {
      console.error('Dispatch failed, executing local loop:', err);
      const localLoop = executeLoopUntilThreshold(
        goal || 'Daily priority milestone verification and routine schedule sync.',
        7.2,
        9.5,
        3
      );
      setLatestLoop(localLoop);
      showToast(`Local critique check complete (Score: ${localLoop.finalScore}/10, max 3 passes)`);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleTriggerManualSweep = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scout/feeds');
      const data = await res.json();
      if (data.twitterItems && data.youtubeItems) {
        setScoutItems([...data.twitterItems, ...data.youtubeItems]);
        showToast('Refreshed simulated research radar feed');
      }
    } catch (err) {
      console.warn('Scout sweep fetch note:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddProject = (newProj: Omit<ProjectItem, 'id' | 'lastUpdated'>) => {
    const newId = `proj-${Date.now()}`;
    const defaultMilestones: DailyFocusMilestone[] = [
      {
        id: `ms-${Date.now()}-1`,
        title: `Define initial scope & acceptance criteria for ${newProj.title}`,
        completed: false,
        estimatedMinutes: 30,
      },
      {
        id: `ms-${Date.now()}-2`,
        title: `Execute core implementation sprint`,
        completed: false,
        estimatedMinutes: 60,
      },
    ];
    const item: ProjectItem = {
      ...newProj,
      id: newId,
      progress: newProj.progress || 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    const updated = [item, ...projects];
    setProjects(updated);
    setProjectMilestones((prev) => ({
      ...prev,
      [newId]: defaultMilestones,
    }));
    syncStore(updated, currentWeek);
    showToast(`Added project: ${item.title}`);
  };

  const handleUpdateProjectCategory = (projectId: string, newCategory: ProjectItem['category']) => {
    const updated = projects.map((p) =>
      p.id === projectId
        ? { ...p, category: newCategory, lastUpdated: new Date().toISOString().split('T')[0] }
        : p
    );
    setProjects(updated);
    syncStore(updated, currentWeek);
    showToast(`Moved project to ${newCategory.toUpperCase()}`);
  };

  const handleApplyUpgradeToProject = (projectId: string, upgradeNote: string) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          cogniNotes: `${p.cogniNotes ? p.cogniNotes + ' • ' : ''}${upgradeNote}`,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });
    setProjects(updated);
    syncStore(updated, currentWeek);
    showToast('Attached note to project ticket');
  };

  const handleLogTelemetryInteraction = () => {
    setTotalInteractions((prev) => prev + 1);
    showToast('Logged habit interaction (+0.2% heuristic consistency)');
  };

  const handleLogHabit = (
    habitData: Omit<CognitiveHabitLog, 'id' | 'timestamp' | 'impactFidelityDelta' | 'circadianAlignment'>
  ) => {
    const impact = calculateHabitTelemetryImpact({
      category: habitData.category,
      durationMinutes: habitData.durationMinutes,
      hour: habitData.hour,
      qualityScore: habitData.qualityScore,
    });

    const newLog: CognitiveHabitLog = {
      ...habitData,
      id: `habit-${Date.now()}`,
      timestamp: 'Just now',
      impactFidelityDelta: impact.impactFidelityDelta,
      circadianAlignment: impact.circadianAlignment,
    };

    setHabitLogs((prev) => [newLog, ...prev]);
    setTotalInteractions((prev) => prev + 1);
    showToast(`Logged habit: ${newLog.name} (+${impact.impactFidelityDelta.toFixed(2)}% index)`);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabitLogs((prev) => prev.filter((h) => h.id !== habitId));
    showToast('Removed habit log entry');
  };

  const handleUpdateProjectProgress = (projectId: string, progress: number) => {
    const updated = projects.map((p) => {
      if (p.id === projectId) {
        return {
          ...p,
          progress,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    });
    setProjects(updated);
    syncStore(updated, currentWeek);
    showToast(`Updated project completion to ${progress}%`);
  };

  const handleRunLoopRefinement = async (strategyText: string, initialScore: number) => {
    try {
      const res = await fetch('/api/orchestrator/loop-refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyText, initialRating: initialScore }),
      });
      const data = await res.json();
      showToast(
        `Critique check finished (${data.iterations?.length || 1}/3 passes, Score: ${data.finalScore}/10)`
      );
      return data;
    } catch {
      const fallback = executeLoopUntilThreshold(strategyText, initialScore, 9.5, 3);
      showToast(
        `Critique check finished (${fallback.iterations.length}/3 passes, Score: ${fallback.finalScore}/10)`
      );
      return fallback;
    }
  };

  const priorityProject =
    projects.find((p) => p.id === priorityProjectId) || projects[0];

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-white selection:text-black">
      {/* Sectioned Agent Harness Sidebar */}
      <AppSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        calibration={calibration}
        onOpenParallelModal={() => setShowParallelModal(true)}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        isDispatching={isDispatching}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top App Bar with Breadcrumbs & Status */}
        <AppHeader
          currentTab={currentTab}
          calibration={calibration}
          currentHour={currentHour}
          onOpenParallelModal={() => setShowParallelModal(true)}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onOpenArchitecture={() => setShowArchModal(true)}
          isDispatching={isDispatching}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-8 pb-28 lg:pb-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {currentTab === 'focus' && (
              <FocusGoal
                projects={projects}
                priorityProjectId={priorityProjectId}
                onSelectPriorityProject={handleSelectPriorityProject}
                projectMilestones={projectMilestones}
                onToggleMilestone={handleToggleMilestone}
                onAddMilestone={handleAddMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                routine={routine}
                onUpdateRoutine={handleUpdateRoutine}
                currentHour={currentHour}
                onUpdateProjectProgress={handleUpdateProjectProgress}
                onOpenCircadianMatrix={() => setCurrentTab('circadian')}
                onOpenProjectsBoard={() => setCurrentTab('projects')}
              />
            )}

            {currentTab === 'projects' && (
              <ProjectsNexus
                projects={projects}
                priorityProjectId={priorityProjectId}
                onSelectPriorityProject={handleSelectPriorityProject}
                projectMilestones={projectMilestones}
                onToggleMilestone={handleToggleMilestone}
                onAddMilestone={handleAddMilestone}
                onDeleteMilestone={handleDeleteMilestone}
                routine={routine}
                onUpdateRoutine={handleUpdateRoutine}
                onAddProject={handleAddProject}
                onUpdateProjectCategory={handleUpdateProjectCategory}
                currentCalibration={calibration}
                onUpdateWeek={(w) => {
                  setCurrentWeek(w);
                  syncStore(projects, w);
                }}
                onLogTelemetryInteraction={handleLogTelemetryInteraction}
                currentHour={currentHour}
                onUpdateProjectProgress={handleUpdateProjectProgress}
                onOpenCircadianMatrix={() => setCurrentTab('circadian')}
                onOpenFocusTab={() => setCurrentTab('focus')}
              />
            )}

            {currentTab === 'circadian' && (
              <CircadianMatrix
                circadianProfile={circadianProfile}
                currentHour={currentHour}
                projects={projects}
                routine={routine}
                onUpdateRoutine={handleUpdateRoutine}
              />
            )}

            {currentTab === 'swarm' && (
              <SwarmDeck
                onDispatch={handleDispatch}
                isDispatching={isDispatching}
                latestDispatch={latestDispatch}
                latestLoop={latestLoop}
                onOpenLoopArena={() => setCurrentTab('loop')}
                onOpenScoutHub={() => setCurrentTab('scout')}
                onOpenFocusGoal={() => setCurrentTab('focus')}
                onOpenMCPHub={() => setCurrentTab('mcp')}
                topProject={priorityProject}
                totalInteractions={totalInteractions}
                mcpServers={mcpServers}
              />
            )}

            {currentTab === 'mcp' && (
              <MCPHub
                mcpServers={mcpServers}
                onToggleServer={handleToggleMCPServer}
                notionPages={notionPages}
                onSyncNotion={handleSyncNotion}
                onCreateNotionPage={handleCreateNotionPage}
                projects={projects}
                onRecordInteraction={handleLogTelemetryInteraction}
              />
            )}

            {currentTab === 'scout' && (
              <ScoutHub
                scoutItems={scoutItems}
                userHandles={userHandles}
                onUpdateHandles={(handles) => {
                  setUserHandles(handles);
                  syncStore(projects, currentWeek);
                }}
                onApplyUpgradeToProject={handleApplyUpgradeToProject}
                projects={projects}
                onTriggerManualSweep={handleTriggerManualSweep}
                isScanning={isScanning}
                lastSyncTime="Simulated feed"
              />
            )}

            {currentTab === 'twin' && (
              <DigitalTwinStudio
                calibration={calibration}
                onUpdateWeek={(w) => {
                  setCurrentWeek(w);
                  syncStore(projects, w);
                }}
                onLogTelemetryInteraction={handleLogTelemetryInteraction}
                habitLogs={habitLogs}
                onLogHabit={handleLogHabit}
                onDeleteHabit={handleDeleteHabit}
                currentHour={currentHour}
              />
            )}

            {currentTab === 'habits' && (
              <CognitiveHabitLogger
                habitLogs={habitLogs}
                onLogHabit={handleLogHabit}
                onDeleteHabit={handleDeleteHabit}
                calibration={calibration}
                currentHour={currentHour}
                onNavigateToTwinStudio={() => setCurrentTab('twin')}
              />
            )}

            {currentTab === 'loop' && (
              <LoopArena onRunLoopRefinement={handleRunLoopRefinement} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Parallel Agent Execution Modal */}
      <ParallelAgentModal
        isOpen={showParallelModal}
        onClose={() => setShowParallelModal(false)}
        onApplyDirective={() => {
          showToast('Directive applied to your active priority plan');
        }}
      />

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectTab={setCurrentTab}
        onTriggerParallelModal={() => setShowParallelModal(true)}
        onTriggerSocialSweep={handleTriggerManualSweep}
        onOpenArchitecture={() => setShowArchModal(true)}
      />

      {/* Codified Architecture & Prompt Specification Modal */}
      <CodifiedPromptModal
        isOpen={showArchModal}
        onClose={() => setShowArchModal(false)}
        codifiedPrompt={
          codifiedPromptText ||
          `# COGNIBRAIN: AGENT & TOOL HARNESS ARCHITECTURE SPECIFICATION
=============================================================================
AUTHOR: Shaurya Studio (Shaurya Singh)
CORE WORKFLOW: 01. Projects -> 02. Today's Priority -> 03. Milestone Completion
CRITIQUE PROTOCOL: Bounded 3-Pass Heuristic Checklist (Non-Proof Planning Aid)

## 1. CORE EXECUTION HARNESS
- [01. Core Workflow] Projects Board -> Today's Priority -> Milestone Checklist
- [02. Routine Config] Adjustable Focus Windows (Primary Peak, Slump Triage, Secondary Peak)
- [03. MCP Sandbox] Local JSON-RPC 2.0 tool bridge for Notion, GitHub, and Calendar

## 2. HONEST TELEMETRY & SIMULATION BOUNDARIES
- Critique scores and habit consistency percentages are heuristic planning aids, never formal proof.
- External feeds and MCP tool calls run in a deterministic local sandbox unless live credentials are provided.`
        }
      />

      {/* Minimalist Studio Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white text-black text-xs font-mono-studio font-bold shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
