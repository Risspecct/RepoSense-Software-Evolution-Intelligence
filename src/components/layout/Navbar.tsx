import { useState, useEffect } from 'react';
import { 
  Network, FolderGit2, FileCode, BarChart3, 
  GitBranch, Database, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { checkBackendHealth } from '../services/backendApi';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onIngestRepo?: (url: string) => Promise<void>;
  isLoading?: boolean;
}

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  onIngestRepo,
  isLoading: isLoadingProp
}: NavbarProps) => {
  // Inside src/components/layout/Navbar.tsx:
  const [inputUrl, setInputUrl] = useState('');
  const [neo4jOnline, setNeo4jOnline] = useState(false);

  // Use prop if provided, otherwise false
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : false;

  // Check Neo4j Health on initial mount
  useEffect(() => {
    checkBackendHealth().then((res) => {
      setNeo4jOnline(res.neo4j);
    });
  }, []);

  const handleIngest = async () => {
    if (!inputUrl.trim()) return;
    
    if (onIngestRepo) {
      await onIngestRepo(inputUrl);
    }
  };

  const navItems = [
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'explorer', label: 'Repository Explorer', icon: FolderGit2 },
    { id: 'prs', label: 'PR Insights', icon: FileCode },
    { id: 'analytics', label: 'Analytics & Hotspots', icon: BarChart3 },
  ];

  return (
    <header className="h-20 bg-[#171A21] border-b border-[#2A2D3D] px-6 flex items-center justify-between text-white font-mono-code z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#243B6B] rounded-xl text-[#38BDF8] shadow-md">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base tracking-wide text-white">RepoSense</h1>
            <span className="text-[10px] px-2 py-0.5 bg-[#243B6B] text-[#38BDF8] rounded-full font-bold">
              v1.0
            </span>
            {/* Health Status Badge */}
            <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              neo4jOnline 
                ? 'bg-[#2E7D5B]/20 text-[#2E7D5B] border border-[#2E7D5B]/40' 
                : 'bg-[#B5442C]/20 text-[#B5442C] border border-[#B5442C]/40'
            }`}>
              {neo4jOnline ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
              {neo4jOnline ? 'NEO4J CONNECTED' : 'NEO4J OFFLINE'}
            </span>
          </div>
          <p className="text-[10px] text-[#94A3B8]">Software Evolution Intelligence</p>
        </div>
      </div>

      {/* Ingest Input Bar */}
      <div className="flex items-center gap-2 bg-[#1A1C28] border border-[#2A2D3D] p-1.5 rounded-2xl w-full max-w-md shadow-inner">
        <GitBranch className="w-4 h-4 text-[#94A3B8] ml-2 shrink-0" />
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Paste GitHub Repo URL..."
          className="bg-transparent text-xs text-white focus:outline-none w-full font-mono-code placeholder-[#5B5F6B]"
        />
        <button
          onClick={handleIngest}
          disabled={isLoading || !inputUrl.trim()}
          className="px-4 py-1.5 bg-[#243B6B] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Ingest'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#1A1C28] p-1 rounded-2xl border border-[#2A2D3D]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isActive ? 'bg-[#243B6B] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};