import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, X } from 'lucide-react';

interface CodifiedPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  codifiedPrompt: string;
}

export const CodifiedPromptModal: React.FC<CodifiedPromptModalProps> = ({
  isOpen,
  onClose,
  codifiedPrompt,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(codifiedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-black border border-white/[0.15] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono-studio text-neutral-500 uppercase tracking-widest mb-1">
              <span>SHAURYA STUDIO®</span>
              <span>·</span>
              <span>ARCHITECTURE SPECIFICATION</span>
            </div>
            <h2 className="font-display text-xl font-normal text-white">
              CogniBrain Master System Prompt & Topology
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono-studio font-bold uppercase tracking-wider transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY SPECIFICATION'}</span>
            </button>

            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-neutral-400 hover:text-white border border-white/10 hover:border-white/30"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Storage Architecture Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-[#050505] border-b border-white/[0.08] text-xs font-mono-studio">
          <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-1">
            <span className="text-[10px] uppercase text-neutral-500 block">
              (01) STORAGE TOPOLOGY
            </span>
            <span className="text-white font-bold block">Local-First Edge + Vector</span>
            <p className="text-neutral-400 font-sans text-[11px] leading-relaxed mt-1">
              Dual-tier storage: IndexedDB for private offline session telemetry + Qdrant / Cloud DB for semantic associative search.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-1">
            <span className="text-[10px] uppercase text-neutral-500 block">
              (02) ENGINE & REASONING
            </span>
            <span className="text-white font-bold block">Google Gemini Argon</span>
            <p className="text-neutral-400 font-sans text-[11px] leading-relaxed mt-1">
              Master supervisor model coordinating 5 specialized subagents with sub-second parallel tool execution.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black border border-white/[0.08] space-y-1">
            <span className="text-[10px] uppercase text-neutral-500 block">
              (03) QUALITY ENFORCEMENT
            </span>
            <span className="text-white font-bold block">Recursive Loop &gt;= 9.5</span>
            <p className="text-neutral-400 font-sans text-[11px] leading-relaxed mt-1">
              Evaluation-Critic gatekeeper tests every execution strategy on 5 vectors until certified &gt;= 9.5 rating.
            </p>
          </div>
        </div>

        {/* Codified Markdown Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono-studio text-xs text-neutral-300 bg-black leading-relaxed whitespace-pre-wrap select-text">
          {codifiedPrompt}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#050505] flex items-center justify-between text-xs font-mono-studio text-neutral-500">
          <span>SHAURYA STUDIO © 2026 · ALL RIGHTS RESERVED</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-white/20 text-white hover:border-white text-[11px] uppercase"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
