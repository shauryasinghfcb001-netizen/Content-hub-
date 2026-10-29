import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CogniBrain Kernel Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear note:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black text-white flex items-center justify-center p-6 selection:bg-white selection:text-black">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[#090909] border border-white/20 shadow-2xl space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono-studio font-bold uppercase tracking-wider">
                KERNEL SAFE MODE
              </span>
              <h1 className="font-display text-2xl font-normal text-white">
                CogniBrain Workspace Recovered
              </h1>
              <p className="text-xs font-sans text-neutral-400 leading-relaxed">
                An unexpected runtime condition occurred. Safe mode prevented a system crash. You can reload or reset the session buffer.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left p-3 rounded-lg bg-black border border-white/10 text-[11px] font-mono-studio text-neutral-400 overflow-x-auto max-h-32">
                <span className="text-rose-400 font-bold">Error:</span> {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-white text-black text-xs font-mono-studio font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 min-h-[42px] px-4 py-2 rounded-xl bg-neutral-900 border border-white/20 hover:border-white text-xs font-mono-studio text-neutral-300 hover:text-white transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
