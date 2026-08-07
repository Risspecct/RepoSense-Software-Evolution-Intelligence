import { useState } from 'react';
import { Cpu, Network, FileCode, BarChart3, Search, GitBranch, Loader2, FolderGit2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onIngestRepo: (url: string) => Promise<void>;
  isLoadingRepo: boolean;
}

export const Navbar = ({ activeTab, setActiveTab, onIngestRepo, isLoadingRepo }: NavbarProps) => {
  const [repoUrl, setRepoUrl] = useState('');

  const navItems = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'explorer', label: 'Repository Explorer', icon: FolderGit2 },
    { id: 'prs', label: 'PR Insights', icon: FileCode },
    { id: 'analytics', label: 'Analytics & Hotspots', icon: BarChart3 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onIngestRepo(repoUrl);
    }
  };

  return (
    <header className="bg-[#12141A] border-b border-[#262A34] px-6 py-3.5 flex flex-col lg:flex-row justify-between items-center gap-4 sticky top-0 z-50">
      {/* Brand Section */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#6366F1] rounded-lg shadow-md shadow-indigo-500/20">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-[#E8E9ED]">RepoSense</h1>
            <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#262A34] text-[#94A3B8]">
              v1.0-live
            </span>
          </div>
          <p className="text-[11px] text-[#8E95A5] font-mono-code">Software Evolution Intelligence</p>
        </div>
      </div>

      {/* GitHub Repo Ingestion Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-[#1A1D26] border border-[#262A34] px-3 py-1.5 rounded-lg w-full max-w-md">
        <GitBranch className="w-4 h-4 text-[#8E95A5] shrink-0" />
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Paste GitHub Repo URL (e.g. https://github.com/facebook/react)"
          className="bg-transparent text-xs text-[#E8E9ED] placeholder-[#5B5F6B] focus:outline-none flex-1 font-mono-code"
        />
        <button
          type="submit"
          disabled={isLoadingRepo}
          className="px-3 py-1 bg-[#6366F1] hover:bg-indigo-500 text-white font-bold text-xs rounded transition flex items-center gap-1 cursor-pointer"
        >
          {isLoadingRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          <span>{isLoadingRepo ? 'Ingesting...' : 'Ingest'}</span>
        </button>
      </form>

      {/* Navigation Pills */}
      <nav className="flex items-center bg-[#1A1D26] p-1 rounded-lg border border-[#262A34]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#243B6B] text-white shadow-sm'
                  : 'text-[#8E95A5] hover:text-[#E8E9ED] hover:bg-[#222632]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};