import { Handle, Position } from '@xyflow/react';
import { Database, FolderGit2, FileCode, GitPullRequest, User, Bug } from 'lucide-react';

export const CustomNode = ({ data }: { data: any }) => {
  const category = data.category;

  return (
    <div className="relative group">
      {/* Subtle Connection Handles */}
      <Handle type="target" position={Position.Top} className="!bg-[#243B6B] !w-2 !h-2 !-top-1 opacity-60" />
      <Handle type="target" position={Position.Left} className="!bg-[#243B6B] !w-2 !h-2 !-left-1 opacity-60" />

      {/* Root Node */}
      {category === 'repo' && (
        <div className="px-5 py-3 rounded-xl bg-[#243B6B] text-white shadow-md border border-[#171A21] min-w-[200px] text-center">
          <div className="flex items-center justify-center gap-2">
            <Database className="w-4 h-4 text-[#38BDF8]" />
            <span className="font-bold text-xs tracking-wide font-mono-code">{data.label}</span>
          </div>
          <p className="text-[10px] font-mono-code text-[#94A3B8] mt-0.5">{data.subtext}</p>
        </div>
      )}

      {/* Module Node */}
      {category === 'module' && (
        <div className="px-4 py-2.5 rounded-lg bg-white border border-[#E4E1D8] border-l-4 border-l-[#243B6B] shadow-sm min-w-[160px]">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-3.5 h-3.5 text-[#243B6B]" />
            <span className="font-bold text-xs text-[#171A21]">{data.label}</span>
          </div>
          <p className="text-[10px] font-mono-code text-[#5B5F6B] mt-0.5">{data.subtext}</p>
        </div>
      )}

      {/* File Node */}
      {category === 'file' && (
        <div className="px-3.5 py-2 rounded-lg bg-white border border-[#E4E1D8] shadow-sm min-w-[150px] flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FileCode className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="font-mono-code text-xs text-[#171A21] font-bold">{data.label}</span>
          </div>
          {data.risk === 'high' && (
            <span className="text-[9px] font-mono-code font-bold px-1.5 py-0.5 rounded bg-[#B5442C]/10 text-[#B5442C] border border-[#B5442C]/30 w-max">
              HIGH RISK
            </span>
          )}
        </div>
      )}

      {/* Commit / PR Node */}
      {category === 'commit' && (
        <div className="px-3.5 py-2 rounded-lg bg-white border border-[#E4E1D8] shadow-sm hover:border-[#243B6B] transition-all min-w-[160px]">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-3.5 h-3.5 text-[#6366F1]" />
            <div>
              <div className="font-mono-code text-xs font-bold text-[#171A21]">{data.label}</div>
              <div className="text-[9px] font-mono-code text-[#5B5F6B] truncate max-w-[110px]">{data.subtext}</div>
            </div>
          </div>
        </div>
      )}

      {/* Developer Node */}
      {category === 'developer' && (
        <div className="px-3 py-1.5 rounded-full bg-white border border-[#E4E1D8] shadow-sm flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#2E7D5B] flex items-center justify-center text-white text-[9px] font-bold">
            <User className="w-3 h-3 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#171A21]">{data.label}</div>
            <div className="text-[9px] text-[#2E7D5B] font-mono-code">{data.subtext}</div>
          </div>
        </div>
      )}

      {/* Issue Node */}
      {category === 'issue' && (
        <div className="px-3 py-2 rounded-lg bg-[#B5442C]/5 border border-[#B5442C]/30 shadow-sm min-w-[140px]">
          <div className="flex items-center gap-2">
            <Bug className="w-3.5 h-3.5 text-[#B5442C]" />
            <div>
              <div className="font-mono-code text-xs font-bold text-[#B5442C]">{data.label}</div>
              <div className="text-[9px] text-[#5B5F6B]">{data.subtext}</div>
            </div>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-[#243B6B] !w-2 !h-2 !-bottom-1 opacity-60" />
      <Handle type="source" position={Position.Right} className="!bg-[#243B6B] !w-2 !h-2 !-right-1 opacity-60" />
    </div>
  );
};