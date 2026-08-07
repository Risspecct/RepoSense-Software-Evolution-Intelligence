import { useEffect, useState } from 'react';
import { 
  Folder, FileCode, Search, User, Clock, 
  ChevronRight, ChevronDown
} from 'lucide-react';
import { fetchClassByName, fetchClassHistory } from '../services/backendApi';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  path: string;
  size?: string;
  risk?: 'high' | 'low';
  children?: FileNode[];
}

const sampleFileTree: FileNode[] = [
  {
    name: 'src',
    type: 'folder',
    path: 'src',
    children: [
      {
        name: 'auth',
        type: 'folder',
        path: 'src/auth',
        children: [
          { name: 'jwt_verifier.py', type: 'file', path: 'src/auth/jwt_verifier.py', size: '4.2 KB', risk: 'high' },
          { name: 'session_manager.py', type: 'file', path: 'src/auth/session_manager.py', size: '2.8 KB', risk: 'low' },
        ],
      },
      {
        name: 'payments',
        type: 'folder',
        path: 'src/payments',
        children: [
          { name: 'checkout_session.py', type: 'file', path: 'src/payments/checkout_session.py', size: '6.1 KB', risk: 'high' },
          { name: 'stripe_adapter.py', type: 'file', path: 'src/payments/stripe_adapter.py', size: '3.4 KB', risk: 'low' },
        ],
      },
      { name: 'main.py', type: 'file', path: 'src/main.py', size: '1.2 KB', risk: 'low' },
    ],
  },
  { name: 'Dockerfile', type: 'file', path: 'Dockerfile', size: '850 B', risk: 'low' },
  { name: 'README.md', type: 'file', path: 'README.md', size: '2.1 KB', risk: 'low' },
];

interface CommitTimelineItem {
  hash: string;
  title: string;
  author: string;
  time: string;
  risk: 'high' | 'low';
  changes: string;
  filesTouched: string[];
}

export const RepositoryExplorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ 'src': true, 'src/auth': true });
  const [commitTimeline, setCommitTimeline] = useState<CommitTimelineItem[]>([]);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);

  useEffect(() => {
    const loadTimeline = async () => {
      if (!selectedFile) {
        setCommitTimeline([]);
        return;
      }

      const fileName = selectedFile.path.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, '');
      if (!fileName) {
        setCommitTimeline([]);
        return;
      }

      setIsLoadingTimeline(true);
      try {
        const classData = await fetchClassByName(fileName);
        if (!classData?.id) {
          setCommitTimeline([]);
          return;
        }

        const historyData = await fetchClassHistory(classData.id);
        const mappedTimeline: CommitTimelineItem[] = (historyData?.history ?? []).map((entry) => ({
          hash: entry.hash.slice(0, 7),
          title: entry.message || 'Repository update',
          author: entry.author || 'Unknown author',
          time: new Date(entry.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          risk: (entry.file_path ? 'high' : 'low') as 'high' | 'low',
          changes: entry.file_path ? '1 file touched' : 'history entry',
          filesTouched: entry.file_path ? [entry.file_path] : [],
        }));

        setCommitTimeline(mappedTimeline);
      } catch {
        setCommitTimeline([]);
      } finally {
        setIsLoadingTimeline(false);
      }
    };

    loadTimeline();
  }, [selectedFile]);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderFileTree = (nodes: FileNode[]) => {
    return nodes.map((node) => {
      if (node.type === 'folder') {
        const isOpen = !!openFolders[node.path];
        return (
          <div key={node.path} className="space-y-0.5">
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F1F0EC] text-xs font-mono-code font-bold text-[#171A21] transition cursor-pointer"
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#5B5F6B]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#5B5F6B]" />}
              <Folder className="w-4 h-4 text-[#243B6B]" />
              <span>{node.name}</span>
            </button>
            {isOpen && node.children && <div className="pl-4 space-y-0.5">{renderFileTree(node.children)}</div>}
          </div>
        );
      }

      const isSelected = selectedFile?.path === node.path;
      return (
        <button
          key={node.path}
          onClick={() => setSelectedFile(node)}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono-code transition cursor-pointer ${
            isSelected ? 'bg-[#243B6B] text-white font-bold shadow-sm' : 'hover:bg-[#F1F0EC] text-[#171A21]'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#06B6D4]'}`} />
            <span className="truncate">{node.name}</span>
          </div>
          {node.risk === 'high' && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#B5442C]/10 text-[#B5442C]'}`}>
              RISK
            </span>
          )}
        </button>
      );
    });
  };

  return (
    <div className="bg-[#F6F5F1] min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-[#E4E1D8] shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#171A21]">Repository File & Commit Explorer</h2>
            <p className="text-xs text-[#5B5F6B] font-mono-code">Inspect repository directory tree, file dependencies, and commit log timeline</p>
          </div>

          <div className="flex items-center gap-2 bg-[#F8F7F4] border border-[#E4E1D8] px-3 py-1.5 rounded-xl w-full md:w-80">
            <Search className="w-4 h-4 text-[#5B5F6B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter files or commits..."
              className="bg-transparent text-xs font-mono-code focus:outline-none w-full text-[#171A21]"
            />
          </div>
        </div>

        {/* Explorer Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* File Tree Panel */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-mono-code uppercase font-bold text-[#5B5F6B] tracking-wider pb-2 border-b border-[#E4E1D8]">
              Directory Structure
            </h3>
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {renderFileTree(sampleFileTree)}
            </div>
          </div>

          {/* Commit Timeline Panel */}
          <div className="lg:col-span-2 bg-white border border-[#E4E1D8] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-mono-code uppercase font-bold text-[#5B5F6B] tracking-wider pb-2 border-b border-[#E4E1D8] flex items-center justify-between">
              <span>Commit History Timeline</span>
              <span className="text-[10px] text-[#243B6B] bg-[#243B6B]/10 px-2 py-0.5 rounded">{isLoadingTimeline ? 'Loading…' : `${commitTimeline.length} Commits Logged`}</span>
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E1D8]">
              {isLoadingTimeline ? (
                <div className="p-4 text-sm text-[#5B5F6B] font-mono-code">Loading live commit history…</div>
              ) : commitTimeline.length === 0 ? (
                <div className="p-4 text-sm text-[#5B5F6B] font-mono-code">No commit history available for the selected file yet.</div>
              ) : commitTimeline.map((commit, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[19px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                    commit.risk === 'high' ? 'border-[#B5442C]' : 'border-[#2E7D5B]'
                  }`} />

                  <div className="bg-[#F8F7F4] border border-[#E4E1D8] group-hover:border-[#243B6B] p-4 rounded-xl transition-all space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code text-xs font-bold px-2 py-0.5 bg-[#171A21] text-white rounded">
                          {commit.hash}
                        </span>
                        <h4 className="text-sm font-bold text-[#171A21]">{commit.title}</h4>
                      </div>
                      <span className="text-[11px] font-mono-code text-[#5B5F6B] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {commit.time}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono-code pt-1">
                      <div className="flex items-center gap-2 text-[#5B5F6B]">
                        <User className="w-3.5 h-3.5 text-[#243B6B]" />
                        <span>{commit.author}</span>
                      </div>
                      <span className="text-[#2E7D5B] font-bold">{commit.changes}</span>
                    </div>

                    {/* Touched Files Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {commit.filesTouched.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono-code px-2 py-0.5 bg-white border border-[#E4E1D8] text-[#171A21] rounded flex items-center gap-1">
                          <FileCode className="w-3 h-3 text-[#06B6D4]" />
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};