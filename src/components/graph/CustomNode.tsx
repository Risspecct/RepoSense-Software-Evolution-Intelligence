import { Handle, Position } from '@xyflow/react';
import { Database, FolderGit2, FileCode, GitCommit, User, Bug } from 'lucide-react';

export const CustomNode = ({ data }: { data: any }) => {
  const category = data.category || 'file';

  return (
    <div className="relative bg-white border border-[#E4E1D8] rounded-2xl shadow-md p-3.5 w-52 text-[#171A21] font-mono-code text-xs select-none hover:shadow-lg transition-all">
      {/* Subtle Top Incoming Connection Point */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-[#243B6B] !w-1.5 !h-1.5 opacity-40 hover:opacity-100 !-top-1"
      />

      {/* Root Node */}
      {category === 'repo' && (
        <div className="bg-[#243B6B] text-white -m-3.5 p-3.5 rounded-2xl text-center shadow-md">
          <div className="flex items-center justify-center gap-2 font-bold">
            <Database className="w-4 h-4 text-[#38BDF8] shrink-0" />
            <span className="truncate">{data.label}</span>
          </div>
          {data.subtext && <p className="text-[10px] text-[#94A3B8] font-normal truncate mt-0.5">{data.subtext}</p>}
        </div>
      )}

      {/* Module Node */}
      {category === 'module' && (
        <div className="flex items-center gap-2.5 font-bold text-[#171A21]">
          <div className="p-1.5 bg-[#243B6B]/10 rounded-lg text-[#243B6B]">
            <FolderGit2 className="w-4 h-4 shrink-0" />
          </div>
          <div className="overflow-hidden">
            <span className="block truncate">{data.label}</span>
            {data.subtext && <span className="text-[10px] text-[#5B5F6B] font-normal block truncate">{data.subtext}</span>}
          </div>
        </div>
      )}

      {/* File Node */}
      {category === 'file' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-[#171A21]">
            <FileCode className="w-4 h-4 text-[#06B6D4] shrink-0" />
            <span className="truncate">{data.label}</span>
          </div>
          {data.risk === 'high' && (
            <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#B5442C]/10 text-[#B5442C] border border-[#B5442C]/30">
              HIGH RISK
            </span>
          )}
        </div>
      )}

      {/* Commit Node */}
      {category === 'commit' && (
        <div className="flex items-center gap-2 font-bold text-[#171A21]">
          <GitCommit className="w-4 h-4 text-[#6366F1] shrink-0" />
          <div className="overflow-hidden">
            <span className="block truncate">{data.label}</span>
            {data.subtext && <span className="text-[10px] text-[#5B5F6B] font-normal block truncate">{data.subtext}</span>}
          </div>
        </div>
      )}

      {/* Developer Node */}
      {category === 'developer' && (
        <div className="flex items-center gap-2 font-bold text-[#171A21]">
          <div className="w-6 h-6 rounded-full bg-[#2E7D5B] flex items-center justify-center text-white shrink-0">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="overflow-hidden">
            <span className="block truncate">{data.label}</span>
            {data.subtext && <span className="text-[10px] text-[#2E7D5B] font-normal block truncate">{data.subtext}</span>}
          </div>
        </div>
      )}

      {/* Issue Node */}
      {category === 'issue' && (
        <div className="flex items-center gap-2 font-bold text-[#B5442C]">
          <Bug className="w-4 h-4 text-[#B5442C] shrink-0" />
          <div className="overflow-hidden">
            <span className="block truncate">{data.label}</span>
            {data.subtext && <span className="text-[10px] text-[#5B5F6B] font-normal block truncate">{data.subtext}</span>}
          </div>
        </div>
      )}

      {/* Subtle Bottom Outgoing Connection Point */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-[#243B6B] !w-1.5 !h-1.5 opacity-40 hover:opacity-100 !-bottom-1"
      />
    </div>
  );
};