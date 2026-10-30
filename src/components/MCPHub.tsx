import React, { useState } from 'react';
import { MCPServerConfig, NotionPageItem, ProjectItem } from '../types';
import { executeMCPToolCall, MCPJsonRpcPayload } from '../utils/cogniLogic';
import {
  Database,
  Check,
  RefreshCw,
  Play,
  Plus,
  Terminal,
  Link2,
  FolderGit2,
  Calendar,
  Layers,
  Radio,
  HardDrive,
  ArrowUpRight,
} from 'lucide-react';

interface MCPHubProps {
  mcpServers: MCPServerConfig[];
  onToggleServer: (serverId: string) => void;
  notionPages: NotionPageItem[];
  onSyncNotion: (workspaceName: string, databaseId: string) => Promise<void>;
  onCreateNotionPage: (title: string, database: NotionPageItem['database']) => void;
  projects: ProjectItem[];
  onRecordInteraction: () => void;
}

export const MCPHub: React.FC<MCPHubProps> = ({
  mcpServers,
  onToggleServer,
  notionPages,
  onSyncNotion,
  onCreateNotionPage,
  projects,
  onRecordInteraction,
}) => {
  const [activeSection, setActiveSection] = useState<'servers' | 'notion' | 'inspector'>('servers');
  const [selectedServerId, setSelectedServerId] = useState<string>('notion');
  const [selectedToolName, setSelectedToolName] = useState<string>('notion_query_database');
  const [customArgsText, setCustomArgsText] = useState<string>(
    JSON.stringify({ database_id: 'ntn_db_second_brain_roadmap', filter: 'ongoing' }, null, 2)
  );
  const [isSyncingNotion, setIsSyncingNotion] = useState<boolean>(false);
  const [isRunningRpc, setIsRunningRpc] = useState<boolean>(false);

  // Notion config state
  const [notionWorkspace, setNotionWorkspace] = useState<string>('Shaurya Studio · Second Brain OS');
  const [notionDatabaseId, setNotionDatabaseId] = useState<string>('ntn_db_second_brain_roadmap');
  const [notionTokenMasked, setNotionTokenMasked] = useState<string>('ntn_live_98a7f6c2e4b1...89d0');
  const [newPageTitle, setNewPageTitle] = useState<string>('');
  const [newPageDb, setNewPageDb] = useState<NotionPageItem['database']>('Projects Roadmap');

  const selectedServer =
    mcpServers.find((s) => s.id === selectedServerId) || mcpServers[0];

  const [rpcTrace, setRpcTrace] = useState<MCPJsonRpcPayload>(() =>
    executeMCPToolCall(
      'notion',
      'notion_query_database',
      { database_id: 'ntn_db_second_brain_roadmap', filter: 'ongoing' },
      projects
    )
  );

  const handleSelectServerForInspector = (server: MCPServerConfig) => {
    setSelectedServerId(server.id);
    const firstTool = server.tools[0];
    if (firstTool) {
      setSelectedToolName(firstTool.name);
      setCustomArgsText(JSON.stringify(firstTool.sampleArgs, null, 2));
    }
  };

  const handleRunTool = async () => {
    setIsRunningRpc(true);
    let parsedArgs: Record<string, any> = {};
    try {
      parsedArgs = JSON.parse(customArgsText);
    } catch {
      parsedArgs = { raw: customArgsText };
    }

    try {
      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: selectedServer.id,
          toolName: selectedToolName,
          args: parsedArgs,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setRpcTrace(data);
      } else {
        setRpcTrace(executeMCPToolCall(selectedServer.id, selectedToolName, parsedArgs, projects));
      }
    } catch {
      setRpcTrace(executeMCPToolCall(selectedServer.id, selectedToolName, parsedArgs, projects));
    } finally {
      onRecordInteraction();
      setIsRunningRpc(false);
    }
  };

  const handleTriggerNotionSync = async () => {
    setIsSyncingNotion(true);
    try {
      await onSyncNotion(notionWorkspace, notionDatabaseId);
      const updatedTrace = executeMCPToolCall(
        'notion',
        'notion_sync_workspace',
        { workspaceName: notionWorkspace, databaseId: notionDatabaseId },
        projects
      );
      setRpcTrace(updatedTrace);
    } finally {
      setIsSyncingNotion(false);
    }
  };

  const handleAddNotionPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    onCreateNotionPage(newPageTitle.trim(), newPageDb);
    setNewPageTitle('');
  };

  const getServerIcon = (id: string) => {
    switch (id) {
      case 'notion':
        return <Database className="w-4 h-4 text-white" />;
      case 'github':
        return <FolderGit2 className="w-4 h-4 text-neutral-300" />;
      case 'gcal':
        return <Calendar className="w-4 h-4 text-neutral-300" />;
      case 'linear':
        return <Layers className="w-4 h-4 text-neutral-300" />;
      case 'scout':
        return <Radio className="w-4 h-4 text-neutral-300" />;
      default:
        return <HardDrive className="w-4 h-4 text-neutral-300" />;
    }
  };

  const connectedCount = mcpServers.filter((s) => s.status === 'connected').length;

  return (
    <div className="space-y-8">
      {/* Top Section Header & Segmented Switcher */}
      <section className="pb-6 border-b border-white/[0.08] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-studio text-neutral-400">
            <span>Model Context Protocol (MCP)</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">{connectedCount} of {mcpServers.length} Servers Active</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">Local Sandbox JSON-RPC 2.0 Preview</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal text-white tracking-tight">
            MCP Connectors &amp; Notion Bridge
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Configure MCP servers and test JSON-RPC 2.0 tool calls against your local workspace state. In this browser preview, Notion and GitHub calls execute against a local sandbox synced with your Projects Board.
          </p>
        </div>

        {/* Clean Segmented Control Bar */}
        <div className="flex items-center gap-1 p-1 bg-[#0a0a0a] border border-white/[0.08] rounded-xl self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveSection('servers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
              activeSection === 'servers'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            01. MCP Servers ({connectedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('notion')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
              activeSection === 'notion'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            02. Notion Workspace ({notionPages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('inspector')}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono-studio transition-all ${
              activeSection === 'inspector'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            03. Tool Inspector
          </button>
        </div>
      </section>

      {/* P0 Honest Status Banner: MCP & Notion Simulation Notice */}
      <div
        data-testid="mcp-simulation-banner"
        className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-studio text-amber-200"
      >
        <div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold mr-2 uppercase">
            SIMULATION / DEMO
          </span>
          <strong>Honest Status Label:</strong> MCP server toggles, Notion two-way sync, page creation, and the JSON-RPC 2.0 inspector are local simulations. Live external connections are deferred until explicitly authorized.
        </div>
        <span className="text-[10px] text-amber-300/80 uppercase shrink-0">
          STATUS: SIMULATED SANDBOX
        </span>
      </div>

      {/* SECTION 01: MCP SERVER REGISTRY & QUICK NOTION BRIDGE */}
      {activeSection === 'servers' && (
        <div className="space-y-8">
          {/* Featured Notion Quick-Connect Banner */}
          <div className="p-6 rounded-2xl bg-[#070707] border border-white/[0.12] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-studio text-emerald-400">
                <Database className="w-3.5 h-3.5" />
                <span>NOTION MCP BRIDGE (LOCAL SANDBOX)</span>
                <span className="text-neutral-600">·</span>
                <span className="text-neutral-400">@modelcontextprotocol/server-notion</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {notionWorkspace}
              </h2>
              <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                Bidirectional sync enabled for <strong className="text-neutral-200">Projects Nexus</strong>, <strong className="text-neutral-200">Daily Focus Sprints</strong>, and <strong className="text-neutral-200">Cognitive Habit Telemetry</strong>. Changes in your harness automatically update your Notion database rows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleTriggerNotionSync}
                disabled={isSyncingNotion}
                className="px-4 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold transition-all flex items-center gap-2 min-h-[42px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNotion ? 'animate-spin' : ''}`} />
                <span>{isSyncingNotion ? 'Syncing Notion...' : 'Sync Notion Now'}</span>
              </button>
              <button
                onClick={() => setActiveSection('notion')}
                className="px-4 py-2.5 rounded-xl border border-white/[0.15] hover:border-white/40 text-xs font-mono-studio text-white transition-all flex items-center gap-1.5 min-h-[42px]"
              >
                <span>Configure Notion</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* MCP Servers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mcpServers.map((server, idx) => {
              const isConnected = server.status === 'connected';
              return (
                <div
                  key={server.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-5 ${
                    isConnected
                      ? 'bg-[#060606] border-white/[0.12]'
                      : 'bg-black border-white/[0.06] opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                          {getServerIcon(server.id)}
                        </div>
                        <div>
                          <div className="text-xs font-mono-studio text-neutral-500">
                            0{idx + 1}. {server.transport.toUpperCase()}
                          </div>
                          <h3 className="text-sm font-semibold text-white">{server.name}</h3>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleServer(server.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-mono-studio transition-all min-h-[32px] ${
                          isConnected
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-white/[0.06] text-neutral-400 border border-white/[0.1] hover:text-white'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>

                    <div className="text-[11px] font-mono-studio text-neutral-400 truncate">
                      {server.package}
                    </div>

                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <div className="text-[11px] font-mono-studio text-neutral-500">
                        Exposed Tools ({server.tools.length}):
                      </div>
                      <div className="text-xs font-mono-studio text-neutral-300 leading-relaxed">
                        {server.tools.map((t) => t.name).join(' · ')}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono-studio text-neutral-400">
                    <span>
                      {server.syncedItemsCount} objects · {server.lastSynced}
                    </span>
                    <button
                      onClick={() => {
                        handleSelectServerForInspector(server);
                        setActiveSection('inspector');
                      }}
                      className="text-white hover:underline flex items-center gap-1"
                    >
                      <span>Test Tools</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 02: NOTION WORKSPACE CONFIGURATION & LIVE SYNCED PAGES */}
      {activeSection === 'notion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Notion Connection Settings & New Page Creator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#060606] border border-white/[0.08] space-y-4">
              <div className="border-b border-white/[0.06] pb-3">
                <div className="text-xs font-mono-studio text-neutral-400">
                  01. Notion MCP Configuration
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Workspace & Database Binding
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                    Notion Workspace Name
                  </label>
                  <input
                    type="text"
                    value={notionWorkspace}
                    onChange={(e) => setNotionWorkspace(e.target.value)}
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs font-mono-studio text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                    Target Database ID
                  </label>
                  <input
                    type="text"
                    value={notionDatabaseId}
                    onChange={(e) => setNotionDatabaseId(e.target.value)}
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs font-mono-studio text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                    MCP Integration Token (STDIO Env)
                  </label>
                  <input
                    type="text"
                    value={notionTokenMasked}
                    onChange={(e) => setNotionTokenMasked(e.target.value)}
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs font-mono-studio text-neutral-300 focus:outline-none focus:border-white/40"
                  />
                </div>

                <button
                  onClick={handleTriggerNotionSync}
                  disabled={isSyncingNotion}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold transition-all flex items-center justify-center gap-2 min-h-[42px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNotion ? 'animate-spin' : ''}`} />
                  <span>{isSyncingNotion ? 'Syncing Database...' : 'Save & Sync Notion Database'}</span>
                </button>
              </div>
            </div>

            {/* Create & Push New Page to Notion */}
            <form
              onSubmit={handleAddNotionPage}
              className="p-6 rounded-2xl bg-[#060606] border border-white/[0.08] space-y-4"
            >
              <div className="border-b border-white/[0.06] pb-3">
                <div className="text-xs font-mono-studio text-neutral-400">
                  02. Push Page via notion_create_page
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Create Notion Page from Harness
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="e.g. Architecture Spec: MCP Tool Harness v2"
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs font-mono-studio text-white placeholder-neutral-500 focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                    Target Notion Database
                  </label>
                  <select
                    value={newPageDb}
                    onChange={(e) => setNewPageDb(e.target.value as NotionPageItem['database'])}
                    className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2 text-xs font-mono-studio text-white focus:outline-none"
                  >
                    <option value="Projects Roadmap">Projects Roadmap</option>
                    <option value="Daily Focus Journal">Daily Focus Journal</option>
                    <option value="AI Research Vault">AI Research Vault</option>
                    <option value="Habit Telemetry">Habit Telemetry</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newPageTitle.trim()}
                  className="w-full py-2.5 px-4 rounded-xl border border-white/20 hover:border-white text-xs font-mono-studio text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 min-h-[42px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Push New Page to Notion</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Synced Notion Pages Table */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#060606] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <div className="text-xs font-mono-studio text-neutral-400">
                  03. Live Notion Database Records
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  Synced Pages ({notionPages.length})
                </h3>
              </div>
              <span className="text-xs font-mono-studio text-emerald-400">
                Auto-Sync Enabled
              </span>
            </div>

            <div className="divide-y divide-white/[0.06]">
              {notionPages.map((page) => (
                <div
                  key={page.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {page.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono-studio text-neutral-400">
                      <span>{page.database}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-400">{page.status}</span>
                      <span aria-hidden="true">·</span>
                      <span>Edited {page.lastEdited}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedServerId('notion');
                        setSelectedToolName('notion_query_database');
                        setCustomArgsText(
                          JSON.stringify({ page_id: page.id, title: page.title }, null, 2)
                        );
                        setActiveSection('inspector');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-white/[0.1] hover:border-white/30 text-xs font-mono-studio text-neutral-300 hover:text-white transition-all"
                    >
                      Inspect JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 03: INTERACTIVE MCP JSON-RPC 2.0 TOOL INSPECTOR */}
      {activeSection === 'inspector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tool Selection & Arguments */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#060606] border border-white/[0.08] space-y-4">
            <div className="border-b border-white/[0.06] pb-3">
              <div className="text-xs font-mono-studio text-neutral-400">
                01. MCP Tool Call Builder
              </div>
              <h3 className="text-base font-semibold text-white mt-0.5">
                Execute JSON-RPC 2.0 Method
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                  Target MCP Server
                </label>
                <select
                  value={selectedServer.id}
                  onChange={(e) => {
                    const srv = mcpServers.find((s) => s.id === e.target.value);
                    if (srv) handleSelectServerForInspector(srv);
                  }}
                  className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs font-mono-studio text-white focus:outline-none"
                >
                  {mcpServers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.package})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                  MCP Tool Name
                </label>
                <select
                  value={selectedToolName}
                  onChange={(e) => {
                    setSelectedToolName(e.target.value);
                    const found = selectedServer.tools.find((t) => t.name === e.target.value);
                    if (found) {
                      setCustomArgsText(JSON.stringify(found.sampleArgs, null, 2));
                    }
                  }}
                  className="w-full bg-black border border-white/[0.12] rounded-xl px-3.5 py-2.5 text-xs font-mono-studio text-white focus:outline-none"
                >
                  {selectedServer.tools.map((tool) => (
                    <option key={tool.name} value={tool.name}>
                      {tool.name} — {tool.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono-studio text-neutral-400 mb-1">
                  Tool Arguments (JSON)
                </label>
                <textarea
                  rows={5}
                  value={customArgsText}
                  onChange={(e) => setCustomArgsText(e.target.value)}
                  className="w-full bg-black border border-white/[0.12] rounded-xl p-3 text-xs font-mono-studio text-neutral-200 focus:outline-none focus:border-white/40 resize-none"
                />
              </div>

              <button
                onClick={handleRunTool}
                disabled={isRunningRpc}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold transition-all flex items-center justify-center gap-2 min-h-[42px]"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunningRpc ? 'Executing RPC...' : 'Run MCP Tool Call'}</span>
              </button>
            </div>
          </div>

          {/* Right: Live JSON-RPC Request & Response Trace */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#060606] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <div className="text-xs font-mono-studio text-neutral-400">
                  02. Protocol Wire Trace
                </div>
                <h3 className="text-base font-semibold text-white mt-0.5">
                  {rpcTrace.summary}
                </h3>
              </div>
              <span className="text-xs font-mono-studio text-emerald-400">
                {rpcTrace.response.result.metadata.latencyMs}ms
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono-studio text-neutral-400">
                  JSON-RPC 2.0 Request
                </div>
                <pre className="p-3.5 rounded-xl bg-black border border-white/[0.08] text-[11px] font-mono-studio text-neutral-300 overflow-x-auto max-h-72">
                  {JSON.stringify(rpcTrace.request, null, 2)}
                </pre>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-mono-studio text-emerald-400">
                  JSON-RPC 2.0 Result Payload
                </div>
                <pre className="p-3.5 rounded-xl bg-black border border-white/[0.08] text-[11px] font-mono-studio text-emerald-300/90 overflow-x-auto max-h-72">
                  {rpcTrace.response.result.content[0]?.text}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
