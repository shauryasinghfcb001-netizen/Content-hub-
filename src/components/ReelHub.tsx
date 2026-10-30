import React, { useState, useMemo } from 'react';
import {
  ReelHubState,
  ReelCreatorSource,
  ReelSourceInboxItem,
  ReelIdeaItem,
  ReelScriptItem,
  CarouselSlideItem,
  ReelQueueItem,
  ReelResultLogItem,
  ReelCadenceConfig,
  ReelContentFormat,
} from '../types';
import {
  evaluateSourceUrlDedup,
  parseSeedScriptsMarkdown,
  sortReelQueueItems,
  exportWeeklyResultsMarkdown,
} from '../utils/cogniLogic';
import {
  Film,
  Inbox,
  Lightbulb,
  FileEdit,
  ListChecks,
  BarChart3,
  HardDriveDownload,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Trash2,
  Sliders,
  ShieldAlert,
  Link2,
  Star,
  Download,
  Upload,
} from 'lucide-react';

interface ReelHubProps {
  reelHub: ReelHubState;
  onUpdateReelHub: (updated: ReelHubState) => void;
  storageStats: {
    usedBytes: number;
    usedKB: number;
    limitKB: number;
    usagePercent: number;
  };
  onExportBackupJson: () => string;
  onImportBackupJson: (rawJson: string) => { valid: boolean; error?: string };
  onShowToast: (msg: string) => void;
}

type ReelSubTab = 'inbox' | 'ideas' | 'scripts' | 'queue' | 'results' | 'backup';

const SAMPLE_SEED_MARKDOWN = `# Why Unbounded Agent Critique Loops Fail [draft] [needs tool run]
Format: reel
Hook: If your AI agent grades its own homework 9.9/10, you built an echo chamber, not an evaluator.
Script: Unbounded self-critique loops inflate scores until they pass. In CogniBrain, we hard-cap critique passes at 3 and keep low-scoring drafts flagged instead of faking a 9.6.
Checked: Verified against 3-pass unit test cap in cogniLogic.test.ts
Avoid: Do not claim heuristic checklist scores are formal verification proof
Source: https://arxiv.org/abs/2610.00001

---

# 6-Slide Breakdown: Manual-First Content Provenance [carousel] [needs source check]
Format: carousel
Hook: Stop letting black-box scrapers flood your content pipeline with unverified claims.
Script: Every sourced idea should record four things: exact URL, capture date, what was taken, and what check you ran.
- Slide 1: Cover Hook | Manual provenance beats automated slop
- Slide 2: Source Inbox | Capture link + raw note without auto-scraping
- Slide 3: Dedup & Multi-Angle | Flag exact URL re-pastes, link distinct angles
- Slide 4: 3 Mandatory Script Fields | Status, Checked (with date), and Avoid
Checked: Pending source check on creator list
Avoid: Do not claim automatic feed scraping is active`;

export const ReelHub: React.FC<ReelHubProps> = ({
  reelHub,
  onUpdateReelHub,
  storageStats,
  onExportBackupJson,
  onImportBackupJson,
  onShowToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ReelSubTab>('inbox');
  const [showCadenceConfig, setShowCadenceConfig] = useState<boolean>(false);

  // 1. Source Inbox state
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourcePlatform, setNewSourcePlatform] =
    useState<ReelCreatorSource['platform']>('YouTube');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  const [selectedSourceId, setSelectedSourceId] = useState<string>('manual');
  const [pasteUrl, setPasteUrl] = useState('');
  const [pasteNote, setPasteNote] = useState('');

  // 2. Idea List state
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaFormat, setIdeaFormat] = useState<ReelContentFormat>('reel');
  const [ideaSourceUrl, setIdeaSourceUrl] = useState('');
  const [ideaSourceName, setIdeaSourceName] = useState('');
  const [ideaWhatTaken, setIdeaWhatTaken] = useState('');
  const [ideaCheckDone, setIdeaCheckDone] = useState('');
  const [ideaCheckDate, setIdeaCheckDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // 3. Script Editor state
  const [editingScriptId, setEditingScriptId] = useState<string | null>(
    reelHub.scripts[0]?.id || null
  );
  const [scriptTitle, setScriptTitle] = useState(reelHub.scripts[0]?.title || '');
  const [scriptFormat, setScriptFormat] = useState<ReelContentFormat>(
    reelHub.scripts[0]?.format || 'reel'
  );
  const [scriptHook, setScriptHook] = useState(reelHub.scripts[0]?.hook || '');
  const [scriptBody, setScriptBody] = useState(
    reelHub.scripts[0]?.spokenScript || ''
  );
  const [scriptSlides, setScriptSlides] = useState<CarouselSlideItem[]>(
    reelHub.scripts[0]?.carouselSlides || [
      { id: 'sl-1', slideNumber: 1, headline: 'Cover Hook', body: 'Core takeaway' },
      { id: 'sl-2', slideNumber: 2, headline: 'Problem / Context', body: 'What breaks today' },
      { id: 'sl-3', slideNumber: 3, headline: 'Step-by-Step Fix', body: 'Concrete implementation' },
    ]
  );
  const [scriptStatus, setScriptStatus] = useState<ReelScriptItem['status']>(
    reelHub.scripts[0]?.status || 'draft'
  );
  const [scriptChecked, setScriptChecked] = useState(
    reelHub.scripts[0]?.checked || ''
  );
  const [scriptCheckedDate, setScriptCheckedDate] = useState(
    reelHub.scripts[0]?.checkedDate || new Date().toISOString().split('T')[0]
  );
  const [scriptAvoid, setScriptAvoid] = useState(reelHub.scripts[0]?.avoid || '');
  const [scriptNeedsToolRun, setScriptNeedsToolRun] = useState<boolean>(
    reelHub.scripts[0]?.needsToolRun ?? false
  );
  const [scriptNeedsSourceCheck, setScriptNeedsSourceCheck] = useState<boolean>(
    reelHub.scripts[0]?.needsSourceCheck ?? false
  );
  const [scriptIsSeedDraft, setScriptIsSeedDraft] = useState<boolean>(
    reelHub.scripts[0]?.isSeedDraft ?? false
  );
  const [scriptSourceUrl, setScriptSourceUrl] = useState<string>(
    reelHub.scripts[0]?.sourceUrl || ''
  );

  // 5. Results Log state
  const [resTitle, setResTitle] = useState('');
  const [resFormat, setResFormat] = useState<ReelContentFormat>('reel');
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resViews, setResViews] = useState<number>(0);
  const [resLikes, setResLikes] = useState<number>(0);
  const [resComments, setResComments] = useState<number>(0);
  const [resSends, setResSends] = useState<number>(0);
  const [resNotes, setResNotes] = useState('');
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  // 6. Seed Import & Backup state
  const [seedMarkdownInput, setSeedMarkdownInput] = useState('');
  const [backupJsonText, setBackupJsonText] = useState('');
  const [backupValidationMsg, setBackupValidationMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Dedup check for Source Inbox paste box
  const inboxDedupPreview = useMemo(
    () =>
      evaluateSourceUrlDedup(pasteUrl, reelHub.sourceItems, reelHub.ideas),
    [pasteUrl, reelHub.sourceItems, reelHub.ideas]
  );

  // Dedup check for Idea List form
  const ideaDedupPreview = useMemo(
    () =>
      evaluateSourceUrlDedup(ideaSourceUrl, reelHub.sourceItems, reelHub.ideas),
    [ideaSourceUrl, reelHub.sourceItems, reelHub.ideas]
  );

  const sortedQueue = useMemo(
    () => sortReelQueueItems(reelHub.queue),
    [reelHub.queue]
  );

  const weeklyMarkdown = useMemo(
    () => exportWeeklyResultsMarkdown(reelHub.results, reelHub.cadenceConfig),
    [reelHub.results, reelHub.cadenceConfig]
  );

  const loadScriptIntoEditor = (script: ReelScriptItem) => {
    setEditingScriptId(script.id);
    setScriptTitle(script.title);
    setScriptFormat(script.format);
    setScriptHook(script.hook);
    setScriptBody(script.spokenScript);
    setScriptSlides(script.carouselSlides);
    setScriptStatus(script.status);
    setScriptChecked(script.checked);
    setScriptCheckedDate(script.checkedDate);
    setScriptAvoid(script.avoid);
    setScriptNeedsToolRun(script.needsToolRun);
    setScriptNeedsSourceCheck(script.needsSourceCheck);
    setScriptIsSeedDraft(script.isSeedDraft);
    setScriptSourceUrl(script.sourceUrl || '');
  };

  const resetScriptEditorForNew = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditingScriptId(null);
    setScriptTitle('');
    setScriptFormat('reel');
    setScriptHook('');
    setScriptBody('');
    setScriptSlides(
      Array.from(
        { length: reelHub.cadenceConfig.defaultCarouselSlidesCount || 6 },
        (_, idx) => ({
          id: `new-sl-${idx + 1}`,
          slideNumber: idx + 1,
          headline: idx === 0 ? 'Slide 1: Hook' : `Slide ${idx + 1} Point`,
          body: idx === 0 ? 'Opening statement' : 'Supporting detail',
        })
      )
    );
    setScriptStatus('draft');
    setScriptChecked('');
    setScriptCheckedDate(today);
    setScriptAvoid('');
    setScriptNeedsToolRun(false);
    setScriptNeedsSourceCheck(false);
    setScriptIsSeedDraft(false);
    setScriptSourceUrl('');
  };

  // --- Handlers: 1. Source Inbox ---
  const handleAddCreatorSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    const created: ReelCreatorSource = {
      id: `src-${Date.now()}`,
      name: newSourceName.trim(),
      platform: newSourcePlatform,
      url: newSourceUrl.trim(),
      addedAt: new Date().toISOString().split('T')[0],
    };
    onUpdateReelHub({
      ...reelHub,
      sources: [created, ...reelHub.sources],
    });
    setNewSourceName('');
    setNewSourceUrl('');
    onShowToast(`Added creator source: ${created.name}`);
  };

  const handleDeleteCreatorSource = (id: string) => {
    onUpdateReelHub({
      ...reelHub,
      sources: reelHub.sources.filter((s) => s.id !== id),
    });
    onShowToast('Removed creator source');
  };

  const handlePasteSourceItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteUrl.trim() || !pasteNote.trim()) return;
    const matchedSource = reelHub.sources.find((s) => s.id === selectedSourceId);
    const dedup = evaluateSourceUrlDedup(
      pasteUrl,
      reelHub.sourceItems,
      reelHub.ideas
    );

    const newItem: ReelSourceInboxItem = {
      id: `inbox-${Date.now()}`,
      sourceId: matchedSource?.id,
      sourceName: matchedSource ? matchedSource.name : 'Manual Link Capture',
      platform: matchedSource ? matchedSource.platform : 'Other',
      url: pasteUrl.trim(),
      note: pasteNote.trim(),
      capturedAt: new Date().toISOString().split('T')[0],
      isDuplicateUrl: dedup.isDuplicateInInbox || dedup.isDuplicateInIdeas,
      duplicateOfItemId: dedup.matchingInboxItemId,
    };

    onUpdateReelHub({
      ...reelHub,
      sourceItems: [newItem, ...reelHub.sourceItems],
    });
    setPasteUrl('');
    setPasteNote('');
    onShowToast(
      newItem.isDuplicateUrl
        ? 'Captured item (Exact URL re-paste flagged for multi-angle tracking)'
        : 'Captured item in Source Inbox'
    );
  };

  const handlePromoteInboxItemToIdea = (item: ReelSourceInboxItem) => {
    setIdeaTitle(item.note.slice(0, 64));
    setIdeaSourceUrl(item.url);
    setIdeaSourceName(item.sourceName);
    setIdeaWhatTaken(item.note);
    setIdeaCheckDone('Verified original link & context manually');
    setIdeaCheckDate(new Date().toISOString().split('T')[0]);
    setActiveSubTab('ideas');
    onShowToast('Loaded source item into Idea form — review provenance & save');
  };

  // --- Handlers: 2. Sourced Ideas ---
  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || !ideaSourceUrl.trim() || !ideaWhatTaken.trim()) return;

    const dedup = evaluateSourceUrlDedup(
      ideaSourceUrl,
      reelHub.sourceItems,
      reelHub.ideas
    );
    const newId = `idea-${Date.now()}`;

    const newIdea: ReelIdeaItem = {
      id: newId,
      title: ideaTitle.trim(),
      format: ideaFormat,
      sourceUrl: ideaSourceUrl.trim(),
      sourceName: ideaSourceName.trim() || 'Manual Source',
      dateCaptured: new Date().toISOString().split('T')[0],
      whatWasTaken: ideaWhatTaken.trim(),
      checkDone: ideaCheckDone.trim() || 'Pending verification check',
      checkDate: ideaCheckDate || new Date().toISOString().split('T')[0],
      status: 'approved',
      isDuplicateSourceUrl: dedup.isDuplicateInIdeas || dedup.isDuplicateInInbox,
      angleIndex: dedup.nextAngleIndex,
      linkedIdeaIds: dedup.matchingIdeaIds,
    };

    // Also link existing ideas from the same source back to this new angle
    const updatedExistingIdeas = reelHub.ideas.map((existing) =>
      dedup.matchingIdeaIds.includes(existing.id)
        ? {
            ...existing,
            isDuplicateSourceUrl: true,
            linkedIdeaIds: Array.from(new Set([...existing.linkedIdeaIds, newId])),
          }
        : existing
    );

    onUpdateReelHub({
      ...reelHub,
      ideas: [newIdea, ...updatedExistingIdeas],
    });

    setIdeaTitle('');
    setIdeaWhatTaken('');
    setIdeaCheckDone('');
    onShowToast(
      dedup.isDuplicateInIdeas
        ? `Saved as Linked Angle #${dedup.nextAngleIndex} from same source URL`
        : 'Added sourced idea with provenance'
    );
  };

  const handleOpenIdeaInScriptEditor = (idea: ReelIdeaItem) => {
    const today = new Date().toISOString().split('T')[0];
    setEditingScriptId(null);
    setScriptTitle(idea.title);
    setScriptFormat(idea.format);
    setScriptHook(`Hook: ${idea.title}`);
    setScriptBody(
      `Core angle from source (${idea.sourceName}):\n${idea.whatWasTaken}\n\n1. Context\n2. Walkthrough\n3. Practical takeaway`
    );
    setScriptSlides([
      { id: `sl-${Date.now()}-1`, slideNumber: 1, headline: idea.title, body: 'Cover hook' },
      { id: `sl-${Date.now()}-2`, slideNumber: 2, headline: 'What Was Taken', body: idea.whatWasTaken },
      { id: `sl-${Date.now()}-3`, slideNumber: 3, headline: 'Verification Check', body: idea.checkDone },
    ]);
    setScriptStatus('draft');
    setScriptChecked(idea.checkDone);
    setScriptCheckedDate(idea.checkDate || today);
    setScriptAvoid('Do not overclaim beyond what was verified in source check');
    setScriptNeedsToolRun(false);
    setScriptNeedsSourceCheck(!idea.checkDone || idea.checkDone.toLowerCase().includes('pending'));
    setScriptIsSeedDraft(false);
    setScriptSourceUrl(idea.sourceUrl);

    const updatedIdeas = reelHub.ideas.map((i) =>
      i.id === idea.id ? { ...i, status: 'in_script' as const } : i
    );
    onUpdateReelHub({ ...reelHub, ideas: updatedIdeas });
    setActiveSubTab('scripts');
    onShowToast(`Opened "${idea.title}" in Script Editor`);
  };

  // --- Handlers: 3. Script Editor ---
  const handleSaveScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];

    const record: ReelScriptItem = {
      id: editingScriptId || `script-${Date.now()}`,
      title: scriptTitle.trim(),
      format: scriptFormat,
      hook: scriptHook.trim() || 'Draft hook',
      spokenScript: scriptBody.trim() || 'Draft spoken script',
      carouselSlides: scriptSlides,
      status: scriptStatus,
      checked: scriptChecked.trim() || 'Pending verification check',
      checkedDate: scriptCheckedDate || today,
      avoid: scriptAvoid.trim() || 'Avoid unverified claims',
      needsToolRun: scriptNeedsToolRun,
      needsSourceCheck: scriptNeedsSourceCheck,
      isSeedDraft: scriptIsSeedDraft,
      targetDurationSec: reelHub.cadenceConfig.defaultReelDurationSec,
      carouselPatternLabel:
        scriptFormat === 'carousel'
          ? reelHub.cadenceConfig.secondCarouselPattern
          : undefined,
      sourceUrl: scriptSourceUrl || undefined,
      updatedAt: today,
    };

    const exists = reelHub.scripts.some((s) => s.id === record.id);
    const updatedScripts = exists
      ? reelHub.scripts.map((s) => (s.id === record.id ? record : s))
      : [record, ...reelHub.scripts];

    setEditingScriptId(record.id);
    onUpdateReelHub({
      ...reelHub,
      scripts: updatedScripts,
    });
    onShowToast(`Saved script "${record.title}" (${record.status.toUpperCase()})`);
  };

  const handleSendScriptToQueue = (script: ReelScriptItem) => {
    const hasBlocker = script.needsToolRun || script.needsSourceCheck;
    const defaultBlockedReason = [
      script.needsToolRun ? 'Flagged: needs tool run before shoot' : '',
      script.needsSourceCheck ? 'Flagged: needs source check before shoot' : '',
    ]
      .filter(Boolean)
      .join(' · ');

    const newQueueItem: ReelQueueItem = {
      id: `queue-${Date.now()}`,
      scriptId: script.id,
      title: script.title,
      format: script.format,
      stage: hasBlocker ? 'blocked' : 'to_shoot',
      isTodayPriority: reelHub.queue.length === 0,
      blockedReason: defaultBlockedReason,
      needsToolRun: script.needsToolRun,
      needsSourceCheck: script.needsSourceCheck,
      scheduledDate: new Date().toISOString().split('T')[0],
      notes: `Hook: ${script.hook.slice(0, 80)}`,
    };

    const updatedScripts = reelHub.scripts.map((s) =>
      s.id === script.id ? { ...s, status: 'in_queue' as const } : s
    );

    onUpdateReelHub({
      ...reelHub,
      scripts: updatedScripts,
      queue: [newQueueItem, ...reelHub.queue],
    });
    setActiveSubTab('queue');
    onShowToast(
      hasBlocker
        ? `Added to Queue (Marked BLOCKED inline: ${defaultBlockedReason})`
        : `Added "${script.title}" to Shoot/Edit Queue`
    );
  };

  // --- Handlers: 4. Shoot/Edit Queue ---
  const handleToggleQueuePriority = (queueId: string) => {
    const updated = reelHub.queue.map((q) =>
      q.id === queueId ? { ...q, isTodayPriority: !q.isTodayPriority } : q
    );
    onUpdateReelHub({ ...reelHub, queue: updated });
  };

  const handleUpdateQueueStage = (
    queueId: string,
    stage: ReelQueueItem['stage']
  ) => {
    const updated = reelHub.queue.map((q) => {
      if (q.id !== queueId) return q;
      return {
        ...q,
        stage,
        blockedReason:
          stage === 'blocked' && !q.blockedReason
            ? 'Blocked: specify blocker reason inline'
            : q.blockedReason,
      };
    });
    onUpdateReelHub({ ...reelHub, queue: updated });
  };

  const handleUpdateQueueBlockedReason = (queueId: string, reason: string) => {
    const updated = reelHub.queue.map((q) =>
      q.id === queueId ? { ...q, blockedReason: reason } : q
    );
    onUpdateReelHub({ ...reelHub, queue: updated });
  };

  const handlePromoteQueueToResult = (q: ReelQueueItem) => {
    setResTitle(q.title);
    setResFormat(q.format);
    setResDate(new Date().toISOString().split('T')[0]);
    setResNotes(q.notes || '');
    const updatedQueue = reelHub.queue.map((item) =>
      item.id === q.id ? { ...item, stage: 'completed' as const } : item
    );
    onUpdateReelHub({ ...reelHub, queue: updatedQueue });
    setActiveSubTab('results');
    onShowToast(`Loaded "${q.title}" into Results Log`);
  };

  // --- Handlers: 5. Results Log ---
  const handleAddResultLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim()) return;
    const newRes: ReelResultLogItem = {
      id: `res-${Date.now()}`,
      title: resTitle.trim(),
      format: resFormat,
      postedDate: resDate || new Date().toISOString().split('T')[0],
      views: Math.max(0, Number(resViews) || 0),
      likes: Math.max(0, Number(resLikes) || 0),
      comments: Math.max(0, Number(resComments) || 0),
      sends: Math.max(0, Number(resSends) || 0),
      notes: resNotes.trim(),
    };
    onUpdateReelHub({
      ...reelHub,
      results: [newRes, ...reelHub.results],
    });
    setResTitle('');
    setResViews(0);
    setResLikes(0);
    setResComments(0);
    setResSends(0);
    setResNotes('');
    onShowToast(`Logged posted metrics for "${newRes.title}"`);
  };

  const handleCopyWeeklyMarkdown = () => {
    navigator.clipboard.writeText(weeklyMarkdown);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
    onShowToast('Copied Weekly Results Markdown to clipboard');
  };

  const handleDownloadWeeklyMarkdown = () => {
    const blob = new Blob([weeklyMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reel-hub-weekly-results-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded Weekly Results Markdown file');
  };

  // --- Handlers: 6. Seed Import & Backup ---
  const handleImportSeedMarkdown = () => {
    const parsedScripts = parseSeedScriptsMarkdown(
      seedMarkdownInput,
      reelHub.cadenceConfig.defaultCarouselSlidesCount,
      reelHub.cadenceConfig.defaultReelDurationSec
    );
    if (parsedScripts.length === 0) {
      onShowToast('Paste valid Markdown draft scripts first');
      return;
    }
    const updatedScripts = [...parsedScripts, ...reelHub.scripts];
    onUpdateReelHub({
      ...reelHub,
      scripts: updatedScripts,
    });
    loadScriptIntoEditor(parsedScripts[0]);
    setSeedMarkdownInput('');
    onShowToast(
      `Imported ${parsedScripts.length} seed draft script(s) with all draft/demo flags preserved`
    );
  };

  const handleGenerateBackupSnapshot = () => {
    const json = onExportBackupJson();
    setBackupJsonText(json);
    onShowToast('Generated full workspace JSON backup');
  };

  const handleDownloadBackupFile = () => {
    const json = onExportBackupJson();
    setBackupJsonText(json);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognibrain-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Downloaded full workspace backup (.json)');
  };

  const handleRestoreFromBackupJson = () => {
    const result = onImportBackupJson(backupJsonText);
    if (result.valid) {
      setBackupValidationMsg({
        type: 'success',
        text: 'Schema validated (cognibrain-backup-v1) & full workspace state restored to localStorage.',
      });
    } else {
      setBackupValidationMsg({
        type: 'error',
        text: result.error || 'Backup validation failed.',
      });
    }
  };

  const updateCadenceField = <K extends keyof ReelCadenceConfig>(
    key: K,
    value: ReelCadenceConfig[K]
  ) => {
    onUpdateReelHub({
      ...reelHub,
      cadenceConfig: {
        ...reelHub.cadenceConfig,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Module Header & Cadence Bar */}
      <div className="p-6 rounded-2xl bg-[#080808] border border-white/[0.1] space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-studio uppercase tracking-widest">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                ADDITIVE MODULE · MANUAL-FIRST
              </span>
              <span className="px-2.5 py-0.5 rounded bg-white/[0.05] text-neutral-300 border border-white/10">
                LOCALSTORAGE PERSISTED ({storageStats.usedKB} KB / {storageStats.limitKB} KB)
              </span>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                LLM CONNECTOR: OPTIONAL · SHIPPED DISABLED
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Film className="w-6 h-6 text-emerald-400" />
              <span>Reel Hub Content Pipeline</span>
            </h2>
            <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
              Source Inbox → Sourced Ideas (with provenance & URL dedup) → Original Scripts & Carousels → Shoot/Edit Queue (with visible blockers) → Real Metrics Results Log & Backup.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCadenceConfig((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-mono-studio text-white transition-all"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configure Cadence & Formats</span>
            </button>
            <button
              onClick={() => setActiveSubTab('backup')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold transition-all"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>Seed Import & Backup</span>
            </button>
          </div>
        </div>

        {/* Settled Cadence Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/[0.06] text-xs font-mono-studio">
          <div className="p-3 rounded-xl bg-black border border-white/[0.07]">
            <span className="text-[10px] text-neutral-500 uppercase block">
              SELF-SHOT ORIGINAL REELS
            </span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {reelHub.cadenceConfig.dailyReelsTarget} / day · {reelHub.cadenceConfig.sprintDays}-day sprint
            </span>
            <span className="text-[10px] text-neutral-400">
              Default target: {reelHub.cadenceConfig.defaultReelDurationSec}s spoken
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black border border-amber-500/25">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 uppercase">
                DAILY CAROUSELS (&quot;CONSOLES&quot;)
              </span>
              <button
                onClick={() =>
                  updateCadenceField(
                    'carouselsTermConfirmed',
                    !reelHub.cadenceConfig.carouselsTermConfirmed
                  )
                }
                className="text-[10px] underline text-amber-400 hover:text-white"
              >
                {reelHub.cadenceConfig.carouselsTermConfirmed
                  ? 'Confirmed'
                  : 'Confirm term'}
              </button>
            </div>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {reelHub.cadenceConfig.dailyCarouselsTarget} / day ({reelHub.cadenceConfig.defaultCarouselSlidesCount} slides default)
            </span>
            <span className="text-[10px] text-amber-300/80">
              {reelHub.cadenceConfig.carouselsTermConfirmed
                ? 'Confirmed: 2 carousels/day'
                : 'Read from "consoles" — unconfirmed'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black border border-white/[0.07]">
            <span className="text-[10px] text-neutral-500 uppercase block">
              LONG-FORM VIDEOS
            </span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              {reelHub.cadenceConfig.weeklyLongVideosMin}–{reelHub.cadenceConfig.weeklyLongVideosMax} / week
            </span>
            <span className="text-[10px] text-neutral-400">
              2/wk baseline, optional 3rd deep-dive
            </span>
          </div>

          <div className="p-3 rounded-xl bg-black border border-white/[0.07]">
            <span className="text-[10px] text-neutral-500 uppercase block">
              X-FIND COMMENTARY CLIPS
            </span>
            <span className="text-xs font-bold text-amber-300 mt-0.5 block truncate">
              {reelHub.cadenceConfig.xClipDestinationNote}
            </span>
            <span className="text-[10px] text-neutral-400">
              Configurable in Cadence drawer
            </span>
          </div>
        </div>

        {/* Configurable Cadence & Format Defaults Drawer */}
        {showCadenceConfig && (
          <div className="p-4 rounded-xl bg-black border border-emerald-500/30 space-y-4 font-mono-studio text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 uppercase">
                CONFIGURABLE CADENCE & SCRIPT DEFAULTS (NOT FIXED RULES)
              </span>
              <button
                onClick={() => setShowCadenceConfig(false)}
                className="text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Daily Original Reels Target
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={reelHub.cadenceConfig.dailyReelsTarget}
                  onChange={(e) =>
                    updateCadenceField('dailyReelsTarget', Number(e.target.value) || 1)
                  }
                  className="w-full px-3 py-1.5 rounded bg-[#0c0c0c] border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Daily Carousels Target
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={reelHub.cadenceConfig.dailyCarouselsTarget}
                  onChange={(e) =>
                    updateCadenceField(
                      'dailyCarouselsTarget',
                      Number(e.target.value) || 2
                    )
                  }
                  className="w-full px-3 py-1.5 rounded bg-[#0c0c0c] border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Default Carousel Slide Count
                </label>
                <input
                  type="number"
                  min={2}
                  max={15}
                  value={reelHub.cadenceConfig.defaultCarouselSlidesCount}
                  onChange={(e) =>
                    updateCadenceField(
                      'defaultCarouselSlidesCount',
                      Number(e.target.value) || 6
                    )
                  }
                  className="w-full px-3 py-1.5 rounded bg-[#0c0c0c] border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Default Reel Duration (Seconds)
                </label>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={reelHub.cadenceConfig.defaultReelDurationSec}
                  onChange={(e) =>
                    updateCadenceField(
                      'defaultReelDurationSec',
                      Number(e.target.value) || 60
                    )
                  }
                  className="w-full px-3 py-1.5 rounded bg-[#0c0c0c] border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Second-Carousel Pattern Default
                </label>
                <input
                  type="text"
                  value={reelHub.cadenceConfig.secondCarouselPattern}
                  onChange={(e) =>
                    updateCadenceField('secondCarouselPattern', e.target.value)
                  }
                  className="w-full px-3 py-1.5 rounded bg-[#0c0c0c] border border-white/15 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  X-Find Commentary Clips Destination
                </label>
                <input
                  type="text"
                  value={reelHub.cadenceConfig.xClipDestinationNote}
                  onChange={(e) =>
                    updateCadenceField('xClipDestinationNote', e.target.value)
                  }
                  className="w-full px-3 py-1.5 rounded bg-[#0c0c0c] border border-white/15 text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6-Piece Pipeline Sub-Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          {[
            {
              id: 'inbox' as const,
              label: '01. Source Inbox',
              count: `${reelHub.sources.length} src · ${reelHub.sourceItems.length} items`,
              icon: <Inbox className="w-4 h-4" />,
            },
            {
              id: 'ideas' as const,
              label: '02. Sourced Ideas',
              count: `${reelHub.ideas.length} ideas`,
              icon: <Lightbulb className="w-4 h-4" />,
            },
            {
              id: 'scripts' as const,
              label: '03. Script Editor',
              count: `${reelHub.scripts.length} scripts`,
              icon: <FileEdit className="w-4 h-4" />,
            },
            {
              id: 'queue' as const,
              label: '04. Shoot/Edit Queue',
              count: `${reelHub.queue.length} queued`,
              icon: <ListChecks className="w-4 h-4" />,
            },
            {
              id: 'results' as const,
              label: '05. Results Log',
              count: `${reelHub.results.length} posted`,
              icon: <BarChart3 className="w-4 h-4" />,
            },
            {
              id: 'backup' as const,
              label: '06. Seed & Backup',
              count: `${storageStats.usedKB} KB used`,
              icon: <HardDriveDownload className="w-4 h-4" />,
            },
          ].map((tab) => {
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`reel-tab-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id)}
                className={`p-3 rounded-xl border text-left transition-all font-mono-studio ${
                  active
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-black text-neutral-300 border-white/[0.08] hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  {tab.icon}
                  <span
                    className={`text-[10px] ${
                      active ? 'text-black/70' : 'text-neutral-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </div>
                <div className="text-xs mt-1.5 truncate">{tab.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================================
          PIECE 1: SOURCE INBOX
         ===================================================================== */}
      {activeSubTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Creator Sources Column */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-studio uppercase text-amber-400 block">
                  CREATOR SOURCE LIST (MANUAL-ONLY)
                </span>
                <h3 className="text-base font-bold text-white">
                  Your Creator Sources ({reelHub.sources.length})
                </h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
              <strong>Pending Creator List Notice:</strong> Per spec, no creator sources are invented or pre-populated. Add your YouTuber / X / creator sources below. No scraping or automatic feed pulling runs in the background.
            </div>

            <form onSubmit={handleAddCreatorSource} className="space-y-3 font-mono-studio text-xs">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Creator / Channel Name
                </label>
                <input
                  data-testid="source-name-input"
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g., Andrej Karpathy"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Platform
                  </label>
                  <select
                    value={newSourcePlatform}
                    onChange={(e) =>
                      setNewSourcePlatform(
                        e.target.value as ReelCreatorSource['platform']
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="X / Twitter">X / Twitter</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Substack / Web">Substack / Web</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Channel / Profile URL
                  </label>
                  <input
                    data-testid="source-url-input"
                    type="text"
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    placeholder="https://youtube.com/@..."
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>
              <button
                data-testid="add-source-btn"
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Creator Source</span>
              </button>
            </form>

            <div className="space-y-2 pt-2">
              {reelHub.sources.length === 0 ? (
                <div className="p-4 rounded-xl bg-black border border-dashed border-white/10 text-center text-xs text-neutral-500 font-mono-studio">
                  0 creator sources added yet. Awaiting your creator list.
                </div>
              ) : (
                reelHub.sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 rounded-xl bg-black border border-white/[0.08] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">
                          {src.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono-studio text-neutral-300">
                          {src.platform}
                        </span>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline truncate block font-mono-studio"
                      >
                        {src.url}
                      </a>
                    </div>
                    <button
                      onClick={() => handleDeleteCreatorSource(src.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400"
                      title="Delete source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Paste Source Item Column */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-emerald-400 block">
                MANUAL LINK + NOTE CAPTURE
              </span>
              <h3 className="text-base font-bold text-white">
                Paste Source Item to Inbox ({reelHub.sourceItems.length})
              </h3>
            </div>

            <form onSubmit={handlePasteSourceItem} className="space-y-3 font-mono-studio text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Source Attribution
                  </label>
                  <select
                    value={selectedSourceId}
                    onChange={(e) => setSelectedSourceId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  >
                    <option value="manual">Manual Link Capture</option>
                    {reelHub.sources.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.platform})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Specific Post / Video URL
                  </label>
                  <input
                    data-testid="paste-item-url"
                    type="text"
                    value={pasteUrl}
                    onChange={(e) => setPasteUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://x.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>

              {/* Dedup Warning Banner */}
              {(inboxDedupPreview.isDuplicateInInbox ||
                inboxDedupPreview.isDuplicateInIdeas) && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Exact Same URL Re-Paste Flagged:</strong> This URL is already captured. You can still save it to explore a <strong>distinct angle (#{inboxDedupPreview.nextAngleIndex})</strong>—it will be linked rather than silently dropped.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Raw Capture Note (What stood out / angle idea)
                </label>
                <textarea
                  data-testid="paste-item-note"
                  rows={2}
                  value={pasteNote}
                  onChange={(e) => setPasteNote(e.target.value)}
                  placeholder="What specific insight, benchmark, or contrarian angle do you want to take from this link?"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              <button
                data-testid="paste-item-btn"
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Paste Item to Source Inbox</span>
              </button>
            </form>

            {/* Inbox Items List */}
            <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
              {reelHub.sourceItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-black border border-white/[0.08] space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-studio">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.sourceName}</span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300">
                        {item.platform}
                      </span>
                      <span className="text-neutral-500">{item.capturedAt}</span>
                      {item.isDuplicateUrl && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                          DUPLICATE URL FLAGGED
                        </span>
                      )}
                    </div>
                    <button
                      data-testid="promote-to-idea-btn"
                      onClick={() => handlePromoteInboxItemToIdea(item)}
                      className="px-2.5 py-1 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 flex items-center gap-1"
                    >
                      <span>Create Sourced Idea</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-200">{item.note}</p>
                  <div className="text-[11px] font-mono-studio text-emerald-400 truncate">
                    {item.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PIECE 2: SOURCED IDEA LIST (PROVENANCE + DEDUP + MULTI-ANGLE)
         ===================================================================== */}
      {activeSubTab === 'ideas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-emerald-400 block">
                PROVENANCE & VERIFICATION RECORD
              </span>
              <h3 className="text-base font-bold text-white">
                Approve Sourced Idea
              </h3>
            </div>

            <form onSubmit={handleAddIdea} className="space-y-3 font-mono-studio text-xs">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Idea Angle / Working Title
                </label>
                <input
                  data-testid="idea-title-input"
                  type="text"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="e.g., Why 3-Pass Capped Critique Beats Unbounded Agent Loops"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Target Format
                  </label>
                  <select
                    value={ideaFormat}
                    onChange={(e) =>
                      setIdeaFormat(e.target.value as ReelContentFormat)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  >
                    <option value="reel">Original Reel (1/day)</option>
                    <option value="carousel">Carousel (2/day)</option>
                    <option value="long_video">Long Video (2-3/wk)</option>
                    <option value="x_clip">X-Find Clip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Source Label
                  </label>
                  <input
                    type="text"
                    value={ideaSourceName}
                    onChange={(e) => setIdeaSourceName(e.target.value)}
                    placeholder="e.g., Paper / Creator Name"
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Source URL (Provenance Link)
                </label>
                <input
                  data-testid="idea-source-url-input"
                  type="text"
                  value={ideaSourceUrl}
                  onChange={(e) => setIdeaSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              {ideaDedupPreview.isDuplicateInIdeas && (
                <div
                  data-testid="idea-dedup-banner"
                  className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1"
                >
                  <div className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>
                      Same Source URL Detected — Will Link as Distinct Angle #{ideaDedupPreview.nextAngleIndex}
                    </span>
                  </div>
                  <p className="text-[11px]">
                    Already used in {ideaDedupPreview.matchingIdeaIds.length} idea(s). Saving will flag the shared URL and link both angles together.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  What Was Taken (Core Premise / Data Point)
                </label>
                <textarea
                  data-testid="idea-what-taken-input"
                  rows={2}
                  value={ideaWhatTaken}
                  onChange={(e) => setIdeaWhatTaken(e.target.value)}
                  placeholder="Specify what insight or structure was taken from the source..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Check Done (What you verified)
                  </label>
                  <input
                    data-testid="idea-check-done-input"
                    type="text"
                    value={ideaCheckDone}
                    onChange={(e) => setIdeaCheckDone(e.target.value)}
                    placeholder="e.g., Tested 3-pass cap locally"
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Check Date
                  </label>
                  <input
                    type="date"
                    value={ideaCheckDate}
                    onChange={(e) => setIdeaCheckDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>

              <button
                data-testid="approve-idea-btn"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all"
              >
                Approve & Save Sourced Idea
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-neutral-400 block">
                PROVENANCE-TRACKED IDEA BACKLOG
              </span>
              <h3 className="text-base font-bold text-white">
                Sourced Ideas ({reelHub.ideas.length})
              </h3>
            </div>

            <div className="space-y-3">
              {reelHub.ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-4 rounded-xl bg-black border border-white/[0.09] space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono-studio uppercase">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                        {idea.format}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300">
                        STATUS: {idea.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] text-neutral-400">
                        ANGLE #{idea.angleIndex}
                      </span>
                      {idea.isDuplicateSourceUrl && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                          SHARED SOURCE URL · {idea.linkedIdeaIds.length + 1} LINKED ANGLES
                        </span>
                      )}
                    </div>

                    <button
                      data-testid="idea-to-script-btn"
                      onClick={() => handleOpenIdeaInScriptEditor(idea)}
                      className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-mono-studio font-bold hover:bg-neutral-200 flex items-center gap-1"
                    >
                      <span>Draft Script / Carousel</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-white">{idea.title}</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#090909] border border-white/[0.05] text-xs">
                    <div>
                      <span className="text-[10px] font-mono-studio text-neutral-500 uppercase block">
                        WHAT WAS TAKEN ({idea.dateCaptured})
                      </span>
                      <span className="text-neutral-200">{idea.whatWasTaken}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono-studio text-emerald-400 uppercase block">
                        CHECK DONE ({idea.checkDate})
                      </span>
                      <span className="text-neutral-200">{idea.checkDone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono-studio text-neutral-400">
                    <span className="truncate max-w-md text-emerald-400">
                      Source: {idea.sourceUrl}
                    </span>
                    <span>{idea.sourceName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PIECE 3: SCRIPT & CAROUSEL EDITOR
         ===================================================================== */}
      {activeSubTab === 'scripts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Saved Scripts List */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-studio uppercase text-neutral-400 block">
                  ORIGINAL SCRIPTS & CAROUSELS
                </span>
                <h3 className="text-base font-bold text-white">
                  Scripts ({reelHub.scripts.length})
                </h3>
              </div>
              <button
                onClick={resetScriptEditorForNew}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono-studio text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {reelHub.scripts.map((sc) => {
                const isSelected = sc.id === editingScriptId;
                return (
                  <div
                    key={sc.id}
                    onClick={() => loadScriptIntoEditor(sc)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'bg-white/[0.08] border-white'
                        : 'bg-black border-white/[0.08] hover:border-white/25'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-studio uppercase">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                        {sc.format}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                        {sc.status}
                      </span>
                      {sc.isSeedDraft && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          SEED DRAFT
                        </span>
                      )}
                      {sc.needsToolRun && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          needs tool run
                        </span>
                      )}
                      {sc.needsSourceCheck && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          needs source check
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white">{sc.title}</div>
                    <div className="text-[11px] text-neutral-400 line-clamp-2">
                      {sc.hook}
                    </div>
                    <div className="pt-1 flex justify-end">
                      <button
                        data-testid="script-to-queue-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendScriptToQueue(sc);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-500 text-black text-[11px] font-mono-studio font-bold hover:bg-emerald-400 flex items-center gap-1"
                      >
                        <span>Send to Shoot Queue</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Script & Carousel Form */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono-studio uppercase text-emerald-400 block">
                  HOOK · SPOKEN SCRIPT · CAROUSEL SLIDES · 3 MANDATORY GOVERNANCE FIELDS
                </span>
                <h3 className="text-base font-bold text-white">
                  {editingScriptId ? 'Edit Script / Carousel' : 'Create New Script / Carousel'}
                </h3>
              </div>
              {scriptIsSeedDraft && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono-studio font-bold">
                  IMPORTED SEED DRAFT — PRESERVED DRAFT LABEL
                </span>
              )}
            </div>

            <form onSubmit={handleSaveScript} className="space-y-4 font-mono-studio text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Script Title
                  </label>
                  <input
                    data-testid="script-title-input"
                    type="text"
                    value={scriptTitle}
                    onChange={(e) => setScriptTitle(e.target.value)}
                    placeholder="Script or Carousel title..."
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Format
                  </label>
                  <select
                    value={scriptFormat}
                    onChange={(e) =>
                      setScriptFormat(e.target.value as ReelContentFormat)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  >
                    <option value="reel">Original Reel</option>
                    <option value="carousel">Carousel</option>
                    <option value="long_video">Long Video</option>
                    <option value="x_clip">X-Find Clip</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Opening Hook (First 3 Seconds / Cover Slide)
                </label>
                <input
                  data-testid="script-hook-input"
                  type="text"
                  value={scriptHook}
                  onChange={(e) => setScriptHook(e.target.value)}
                  placeholder="Punchy, honest opening hook..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Spoken Script / Talking Points (Default target: {reelHub.cadenceConfig.defaultReelDurationSec}s)
                </label>
                <textarea
                  data-testid="script-body-input"
                  rows={4}
                  value={scriptBody}
                  onChange={(e) => setScriptBody(e.target.value)}
                  placeholder="Spoken camera script..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              {/* Three Mandatory Governance Fields: Status, Checked (+Date), Avoid */}
              <div className="p-4 rounded-xl bg-black border border-emerald-500/30 space-y-3">
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  MANDATORY GOVERNANCE FIELDS (STATUS · CHECKED + DATE · AVOID)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                      1. Script Status
                    </label>
                    <select
                      value={scriptStatus}
                      onChange={(e) =>
                        setScriptStatus(e.target.value as ReelScriptItem['status'])
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#0b0b0b] border border-white/15 text-white"
                    >
                      <option value="draft">draft (Draft Label Active)</option>
                      <option value="ready_to_shoot">ready_to_shoot</option>
                      <option value="in_queue">in_queue</option>
                      <option value="shot">shot</option>
                      <option value="posted">posted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                      2. Checked (What Was Verified)
                    </label>
                    <input
                      data-testid="script-checked-input"
                      type="text"
                      value={scriptChecked}
                      onChange={(e) => setScriptChecked(e.target.value)}
                      placeholder="What fact/code did you verify?"
                      className="w-full px-3 py-2 rounded-lg bg-[#0b0b0b] border border-white/15 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                      Verification Date
                    </label>
                    <input
                      type="date"
                      value={scriptCheckedDate}
                      onChange={(e) => setScriptCheckedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0b0b0b] border border-white/15 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-amber-300 uppercase mb-1">
                    3. Avoid (What NOT to claim or exaggerate)
                  </label>
                  <input
                    data-testid="script-avoid-input"
                    type="text"
                    value={scriptAvoid}
                    onChange={(e) => setScriptAvoid(e.target.value)}
                    placeholder="e.g., Do not claim a 9.5 critique score is formal proof; do not claim live MCP sync if sandboxed"
                    className="w-full px-3 py-2 rounded-lg bg-[#0b0b0b] border border-amber-500/30 text-white"
                  />
                </div>

                {/* Demo-Dependent Flags */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200">
                    <input
                      type="checkbox"
                      checked={scriptNeedsToolRun}
                      onChange={(e) => setScriptNeedsToolRun(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                      Flag: &quot;needs tool run&quot;
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-200">
                    <input
                      type="checkbox"
                      checked={scriptNeedsSourceCheck}
                      onChange={(e) => setScriptNeedsSourceCheck(e.target.checked)}
                      className="rounded border-white/20"
                    />
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Flag: &quot;needs source check&quot;
                    </span>
                  </label>
                </div>
              </div>

              {/* Carousel Slides Section */}
              <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase block">
                      CAROUSEL SLIDES ({scriptSlides.length} SLIDES · CONFIGURABLE)
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Pattern: {reelHub.cadenceConfig.secondCarouselPattern}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setScriptSlides((prev) => [
                        ...prev,
                        {
                          id: `sl-${Date.now()}`,
                          slideNumber: prev.length + 1,
                          headline: `Slide ${prev.length + 1} Headline`,
                          body: 'Key point',
                        },
                      ])
                    }
                    className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slide</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {scriptSlides.map((slide, sIdx) => (
                    <div
                      key={slide.id}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <span className="col-span-1 text-[11px] text-neutral-500 font-bold">
                        #{sIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={slide.headline}
                        onChange={(e) =>
                          setScriptSlides((prev) =>
                            prev.map((s, i) =>
                              i === sIdx ? { ...s, headline: e.target.value } : s
                            )
                          )
                        }
                        className="col-span-4 px-2.5 py-1.5 rounded bg-[#0c0c0c] border border-white/10 text-white text-xs"
                        placeholder="Slide headline"
                      />
                      <input
                        type="text"
                        value={slide.body}
                        onChange={(e) =>
                          setScriptSlides((prev) =>
                            prev.map((s, i) =>
                              i === sIdx ? { ...s, body: e.target.value } : s
                            )
                          )
                        }
                        className="col-span-6 px-2.5 py-1.5 rounded bg-[#0c0c0c] border border-white/10 text-white text-xs"
                        placeholder="Slide body text"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setScriptSlides((prev) =>
                            prev.filter((_, i) => i !== sIdx)
                          )
                        }
                        className="col-span-1 text-neutral-500 hover:text-red-400 flex justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  data-testid="save-script-btn"
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 transition-all"
                >
                  Save Script & Governance Fields
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          PIECE 4: SHOOT / EDIT QUEUE (TODAY'S PRIORITY FIRST + VISIBLE BLOCKERS)
         ===================================================================== */}
      {activeSubTab === 'queue' && (
        <div className="p-6 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-emerald-400 block">
                TODAY&apos;S PRIORITY FIRST · BLOCKED ITEMS ALWAYS VISIBLE INLINE
              </span>
              <h3 className="text-lg font-bold text-white">
                Shoot / Edit Queue ({sortedQueue.length} Items)
              </h3>
            </div>
            <div className="text-xs font-mono-studio text-neutral-400">
              Nothing is hidden or dropped when blocked — blocker reasons stay inline.
            </div>
          </div>

          <div className="space-y-3">
            {sortedQueue.map((q) => {
              const isBlocked =
                q.stage === 'blocked' ||
                Boolean(q.blockedReason.trim()) ||
                q.needsToolRun ||
                q.needsSourceCheck;
              return (
                <div
                  key={q.id}
                  data-testid={`queue-item-${q.id}`}
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    q.isTodayPriority
                      ? 'bg-emerald-950/15 border-emerald-500/40'
                      : isBlocked
                      ? 'bg-amber-950/10 border-amber-500/40'
                      : 'bg-black border-white/[0.08]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleToggleQueuePriority(q.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-studio font-bold flex items-center gap-1 border ${
                          q.isTodayPriority
                            ? 'bg-emerald-500 text-black border-emerald-400'
                            : 'bg-white/[0.05] text-neutral-300 border-white/10 hover:text-white'
                        }`}
                      >
                        <Star className="w-3 h-3" />
                        <span>
                          {q.isTodayPriority
                            ? "TODAY'S PRIORITY #1"
                            : 'Set Today Priority'}
                        </span>
                      </button>

                      <span className="px-2 py-0.5 rounded bg-white/[0.07] text-[10px] font-mono-studio uppercase text-white">
                        {q.format}
                      </span>

                      {q.needsToolRun && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono-studio font-bold">
                          needs tool run
                        </span>
                      )}
                      {q.needsSourceCheck && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono-studio font-bold">
                          needs source check
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 font-mono-studio text-xs">
                      <select
                        value={q.stage}
                        onChange={(e) =>
                          handleUpdateQueueStage(
                            q.id,
                            e.target.value as ReelQueueItem['stage']
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-black border border-white/15 text-white"
                      >
                        <option value="to_shoot">Stage: To Shoot</option>
                        <option value="to_edit">Stage: To Edit</option>
                        <option value="ready_to_post">Stage: Ready to Post</option>
                        <option value="blocked">Stage: BLOCKED (Visible Inline)</option>
                        <option value="completed">Stage: Completed</option>
                      </select>

                      <button
                        data-testid="queue-to-result-btn"
                        onClick={() => handlePromoteQueueToResult(q)}
                        className="px-3 py-1.5 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 flex items-center gap-1"
                      >
                        <span>Log Posted Result</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{q.title}</h4>
                    {q.notes && (
                      <p className="text-xs text-neutral-400 mt-0.5">{q.notes}</p>
                    )}
                  </div>

                  {/* Inline Blocked Reason Banner & Editor (Always visible when blocked or flagged) */}
                  <div className="p-3 rounded-lg bg-black/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono-studio">
                    <div className="flex items-center gap-1.5 text-amber-400 shrink-0 font-bold">
                      <ShieldAlert className="w-4 h-4" />
                      <span>INLINE BLOCKER / STATUS NOTE:</span>
                    </div>
                    <input
                      type="text"
                      value={q.blockedReason}
                      onChange={(e) =>
                        handleUpdateQueueBlockedReason(q.id, e.target.value)
                      }
                      placeholder="If blocked, keep reason visible inline here (e.g., Waiting on local benchmark run)..."
                      className="flex-1 px-2.5 py-1 rounded bg-[#0c0c0c] border border-white/10 text-amber-200"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          PIECE 5: RESULTS LOG + WEEKLY MARKDOWN EXPORT
         ===================================================================== */}
      {activeSubTab === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-emerald-400 block">
                MANUAL REAL METRICS ENTRY (NO AUTO-SCRAPING)
              </span>
              <h3 className="text-base font-bold text-white">
                Log Posted Reel / Carousel Result
              </h3>
            </div>

            <form onSubmit={handleAddResultLog} className="space-y-3 font-mono-studio text-xs">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Posted Piece Title
                </label>
                <input
                  data-testid="result-title-input"
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="Title of posted reel or carousel..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Format
                  </label>
                  <select
                    value={resFormat}
                    onChange={(e) =>
                      setResFormat(e.target.value as ReelContentFormat)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  >
                    <option value="reel">Original Reel</option>
                    <option value="carousel">Carousel</option>
                    <option value="long_video">Long Video</option>
                    <option value="x_clip">X-Find Clip</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Posted Date
                  </label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Views
                  </label>
                  <input
                    data-testid="result-views-input"
                    type="number"
                    min={0}
                    value={resViews}
                    onChange={(e) => setResViews(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Likes
                  </label>
                  <input
                    data-testid="result-likes-input"
                    type="number"
                    min={0}
                    value={resLikes}
                    onChange={(e) => setResLikes(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Comments
                  </label>
                  <input
                    data-testid="result-comments-input"
                    type="number"
                    min={0}
                    value={resComments}
                    onChange={(e) => setResComments(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                    Sends
                  </label>
                  <input
                    data-testid="result-sends-input"
                    type="number"
                    min={0}
                    value={resSends}
                    onChange={(e) => setResSends(Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-lg bg-black border border-white/15 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase mb-1">
                  Retention / Hook Observation Notes
                </label>
                <input
                  data-testid="result-notes-input"
                  type="text"
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  placeholder="What worked or dropped off?"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-white"
                />
              </div>

              <button
                data-testid="add-result-btn"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all"
              >
                Log Real Result Metrics
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono-studio uppercase text-neutral-400 block">
                  POSTED METRICS & WEEKLY MARKDOWN REPORT
                </span>
                <h3 className="text-base font-bold text-white">
                  Logged Results ({reelHub.results.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  data-testid="copy-weekly-md-btn"
                  onClick={handleCopyWeeklyMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-mono-studio font-bold hover:bg-neutral-200 flex items-center gap-1.5"
                >
                  {copiedMarkdown ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedMarkdown ? 'Copied Markdown' : 'Copy Weekly .MD'}</span>
                </button>
                <button
                  onClick={handleDownloadWeeklyMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] text-white text-xs font-mono-studio hover:bg-white/[0.15] flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .MD</span>
                </button>
              </div>
            </div>

            {/* Logged Results Table */}
            <div className="space-y-2">
              {reelHub.results.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-black border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-studio"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{r.title}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] uppercase">
                        {r.format}
                      </span>
                      <span className="text-neutral-500 text-[10px]">
                        {r.postedDate}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="text-[11px] text-neutral-400 mt-1">{r.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">VIEWS</span>
                      <span className="font-bold text-white">{r.views}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">LIKES</span>
                      <span className="font-bold text-white">{r.likes}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">COMMENTS</span>
                      <span className="font-bold text-white">{r.comments}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block">SENDS</span>
                      <span className="font-bold text-emerald-400">{r.sends}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Markdown Export Preview */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-mono-studio uppercase text-neutral-400 block">
                LIVE WEEKLY MARKDOWN EXPORT PREVIEW
              </span>
              <pre
                data-testid="weekly-markdown-preview"
                className="p-3.5 rounded-xl bg-black border border-white/10 text-[11px] font-mono-studio text-neutral-300 overflow-x-auto max-h-56"
              >
                {weeklyMarkdown}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PIECE 6: SEED MARKDOWN IMPORT & LOCALSTORAGE BACKUP (SCHEMA VALIDATED)
         ===================================================================== */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Seed Markdown Draft Importer */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-studio uppercase text-amber-400 block">
                  PRESERVES DRAFT & DEMO FLAGS ([draft], [needs tool run], [needs source check])
                </span>
                <h3 className="text-base font-bold text-white">
                  Import Seed Markdown (Draft Scripts)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSeedMarkdownInput(SAMPLE_SEED_MARKDOWN)}
                className="px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-mono-studio text-neutral-200"
              >
                Load Format Template
              </button>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Paste your Markdown of draft scripts below. Every imported script keeps its <code>draft</code> status, <code>SEED DRAFT</code> badge, and any <code>[needs tool run]</code> or <code>[needs source check]</code> flags intact.
            </p>

            <textarea
              data-testid="seed-markdown-input"
              rows={9}
              value={seedMarkdownInput}
              onChange={(e) => setSeedMarkdownInput(e.target.value)}
              placeholder="# Script Title [draft] [needs tool run]&#10;Format: reel&#10;Hook: ...&#10;Script: ...&#10;Checked: ...&#10;Avoid: ..."
              className="w-full p-3 rounded-xl bg-black border border-white/15 font-mono-studio text-xs text-white"
            />

            <button
              data-testid="import-seed-btn"
              type="button"
              onClick={handleImportSeedMarkdown}
              className="w-full py-2.5 rounded-xl bg-white text-black font-mono-studio text-xs font-bold hover:bg-neutral-200 transition-all"
            >
              Import Markdown Drafts into Script Editor
            </button>
          </div>

          {/* LocalStorage Limit Meter & Full JSON Backup / Restore */}
          <div className="lg:col-span-6 p-5 rounded-2xl bg-[#080808] border border-white/[0.09] space-y-4">
            <div>
              <span className="text-[10px] font-mono-studio uppercase text-emerald-400 block">
                LOCAL-ONLY STORAGE NOTICE & SCHEMA-VALIDATED BACKUP
              </span>
              <h3 className="text-base font-bold text-white">
                Workspace LocalStorage Meter & Backup
              </h3>
            </div>

            {/* Storage Limit Meter */}
            <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2 font-mono-studio">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-bold">
                  Browser LocalStorage Footprint
                </span>
                <span className="text-emerald-400 font-bold">
                  {storageStats.usedKB} KB / {storageStats.limitKB} KB (~5 MB Browser Cap)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.max(2, storageStats.usagePercent)}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                All projects, milestones, routine windows, habits, and Reel Hub items live strictly in your browser&apos;s local storage (no cloud database or paid backend). Export a JSON backup below so clearing browser data never loses your board.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono-studio text-xs">
              <button
                data-testid="export-backup-btn"
                type="button"
                onClick={handleGenerateBackupSnapshot}
                className="px-3.5 py-2 rounded-xl bg-white text-black font-bold hover:bg-neutral-200 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Generate Backup JSON</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadBackupFile}
                className="px-3.5 py-2 rounded-xl bg-white/[0.08] text-white hover:bg-white/[0.15] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .JSON File</span>
              </button>

              <button
                data-testid="import-backup-btn"
                type="button"
                onClick={handleRestoreFromBackupJson}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Validate & Restore JSON</span>
              </button>
            </div>

            {backupValidationMsg && (
              <div
                data-testid="backup-validation-status"
                className={`p-3 rounded-xl border text-xs font-mono-studio flex items-center gap-2 ${
                  backupValidationMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {backupValidationMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{backupValidationMsg.text}</span>
              </div>
            )}

            <textarea
              data-testid="backup-json-textarea"
              rows={7}
              value={backupJsonText}
              onChange={(e) => setBackupJsonText(e.target.value)}
              placeholder='Click "Generate Backup JSON" to inspect your full state snapshot, or paste a saved cognibrain-backup-v1 JSON payload here to validate & restore...'
              className="w-full p-3 rounded-xl bg-black border border-white/15 font-mono-studio text-[11px] text-neutral-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};
