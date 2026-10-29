import React, { useState } from 'react';
import { ScoutItem, ProjectItem } from '../types';
import { ArrowUpRight, Check } from 'lucide-react';

interface ScoutHubProps {
  scoutItems: ScoutItem[];
  userHandles: { twitter: string; youtube: string };
  onUpdateHandles: (handles: { twitter: string; youtube: string }) => void;
  onApplyUpgradeToProject: (projectId: string, upgradeNote: string) => void;
  projects: ProjectItem[];
  onTriggerManualSweep: () => Promise<void>;
  isScanning: boolean;
  lastSyncTime: string;
}

export const ScoutHub: React.FC<ScoutHubProps> = ({
  scoutItems,
  userHandles,
  onUpdateHandles,
  onApplyUpgradeToProject,
  projects,
  onTriggerManualSweep,
  isScanning,
  lastSyncTime,
}) => {
  const [filter, setFilter] = useState<'all' | 'twitter' | 'youtube' | 'high_impact'>('all');
  const [appliedItems, setAppliedItems] = useState<Record<string, string>>({});
  const [twitterHandle, setTwitterHandle] = useState(userHandles.twitter);
  const [youtubeHandle, setYoutubeHandle] = useState(userHandles.youtube);
  const [isEditingHandles, setIsEditingHandles] = useState(false);

  const handleSaveHandles = () => {
    onUpdateHandles({ twitter: twitterHandle, youtube: youtubeHandle });
    setIsEditingHandles(false);
  };

  const handleApply = (item: ScoutItem) => {
    const targetProject =
      projects.find((p) => p.title.toLowerCase().includes(item.matchedProject.toLowerCase())) ||
      projects[0];

    if (targetProject) {
      onApplyUpgradeToProject(
        targetProject.id,
        `[Auto-Synced from ${item.source} (${item.author || item.channel})]: ${item.actionableTip}`
      );
      setAppliedItems((prev) => ({ ...prev, [item.id]: targetProject.title }));
    }
  };

  const filteredItems = scoutItems.filter((item) => {
    if (filter === 'twitter') return item.source === 'Twitter / X';
    if (filter === 'youtube') return item.source === 'YouTube';
    if (filter === 'high_impact') return item.relevanceScore >= 92;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <section className="pb-6 border-b border-white/[0.08]">
        <div className="flex items-center space-x-3 text-[11px] font-mono-studio text-neutral-400 uppercase tracking-widest mb-3">
          <span className="text-neutral-500">RESEARCH RADAR</span>
          <span className="text-neutral-700">·</span>
          <span className="text-amber-300">SIMULATED FEED PREVIEW</span>
          <span className="text-neutral-700">·</span>
          <span>ATTACH NOTES TO PROJECTS</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-normal text-white tracking-tight leading-none">
              AI Research &amp; Radar Feed (Simulated)
            </h1>
            <p className="mt-3 text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Curated sample digest of AI papers and engineering threads. Click <strong className="text-white">Apply to My Project</strong> on any item to attach its implementation note directly to your project card.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onTriggerManualSweep}
              disabled={isScanning}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <span>{isScanning ? 'REFRESHING SAMPLE FEED...' : 'REFRESH SAMPLE FEED'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Schedule & Handles Status Strip */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-mono-studio text-neutral-400">
          <div className="flex items-center space-x-6 flex-wrap gap-y-2">
            <div>
              <span>TARGET X: </span>
              <strong className="text-white">{userHandles.twitter}</strong>
              <span className="text-neutral-500 ml-1.5">(3X / DAY)</span>
            </div>
            <div>
              <span>TARGET YOUTUBE: </span>
              <strong className="text-white">{userHandles.youtube}</strong>
              <span className="text-neutral-500 ml-1.5">(2X / DAY)</span>
            </div>
            <span className="text-neutral-600">·</span>
            <span>LAST HARVEST: {lastSyncTime}</span>
          </div>

          <button
            onClick={() => setIsEditingHandles(!isEditingHandles)}
            className="text-white hover:underline uppercase text-[11px]"
          >
            {isEditingHandles ? 'CANCEL' : 'CONFIGURE HANDLES ↗'}
          </button>
        </div>

        {/* Edit Handles Form */}
        {isEditingHandles && (
          <div className="mt-4 p-4 rounded-xl bg-[#050505] border border-white/[0.1] flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={twitterHandle}
              onChange={(e) => setTwitterHandle(e.target.value)}
              placeholder="Twitter handle (@...)"
              className="px-3.5 py-2 rounded-lg bg-black border border-white/[0.12] text-xs font-mono-studio text-white focus:outline-none focus:border-white/40"
            />
            <input
              type="text"
              value={youtubeHandle}
              onChange={(e) => setYoutubeHandle(e.target.value)}
              placeholder="YouTube handle (@...)"
              className="px-3.5 py-2 rounded-lg bg-black border border-white/[0.12] text-xs font-mono-studio text-white focus:outline-none focus:border-white/40"
            />
            <button
              onClick={handleSaveHandles}
              className="px-5 py-2 rounded-lg bg-white text-black font-mono-studio font-bold text-xs uppercase"
            >
              SAVE HANDLES
            </button>
          </div>
        )}
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-2">
          {(
            [
              { id: 'all', number: '01', label: 'ALL INTELLIGENCE' },
              { id: 'twitter', number: '02', label: 'TWITTER / X (3X)' },
              { id: 'youtube', number: '03', label: 'YOUTUBE RELEASES (2X)' },
              { id: 'high_impact', number: '04', label: 'HIGH IMPACT (>90%)' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono-studio uppercase tracking-wider transition-all ${
                filter === t.id
                  ? 'bg-white text-black font-bold'
                  : 'bg-black text-neutral-400 border border-white/[0.08] hover:border-white/30 hover:text-white'
              }`}
            >
              <span className="text-neutral-500 mr-1.5">({t.number})</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <span className="text-xs font-mono-studio text-neutral-500">
          INDEX: {filteredItems.length} CURATED FINDINGS
        </span>
      </div>

      {/* Feed Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, i) => {
          const isApplied = Boolean(appliedItems[item.id]);

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between p-6 rounded-2xl bg-[#050505] border border-white/[0.08] hover:border-white/30 transition-all space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs font-mono-studio">
                  <div className="flex items-center space-x-2 text-neutral-400">
                    <span className="text-neutral-600">(0{i + 1})</span>
                    <span className="text-white uppercase font-bold">{item.source}</span>
                    <span className="text-neutral-600">·</span>
                    <span>{item.author || item.channel}</span>
                  </div>
                  <span className="text-neutral-300 font-bold">{item.relevanceScore}% MATCH</span>
                </div>

                <h3 className="font-display text-lg font-normal text-white mt-4 leading-snug group-hover:text-neutral-200">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-neutral-400 font-sans leading-relaxed">
                  {item.snippet}
                </p>

                {/* Direct Cross-Reference to Active Projects */}
                <div className="mt-4 p-3 rounded-xl bg-black border border-white/[0.08] space-y-1">
                  <div className="text-[10px] font-mono-studio uppercase text-neutral-500">
                    MAPPED TO: <strong className="text-neutral-200">{item.matchedProject}</strong>
                  </div>
                  <p className="text-[11px] text-neutral-300 font-sans">
                    <strong className="text-white font-mono-studio">APPLICATION:</strong> {item.actionableTip}
                  </p>
                </div>
              </div>

              {/* Action Button: Apply Upgrade */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] font-mono-studio text-neutral-500">{item.timestamp}</span>

                <button
                  onClick={() => handleApply(item)}
                  disabled={isApplied}
                  className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-mono-studio uppercase tracking-wider transition-all ${
                    isApplied
                      ? 'bg-white/10 text-neutral-300 border border-white/20'
                      : 'bg-white text-black hover:bg-neutral-200 font-bold'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>APPLIED TO PROJECT</span>
                    </>
                  ) : (
                    <>
                      <span>APPLY TO MY PROJECT</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
