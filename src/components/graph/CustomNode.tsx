import { Handle, Position } from '@xyflow/react';
import { Database, FolderGit2, FileCode, GitCommit, User, Bug } from 'lucide-react';

const categoryStyles: Record<string, string> = {
  repo: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 border border-[#38BDF8]/40 text-white shadow-[0_28px_80px_-48px_rgba(15,23,42,0.9)]',
  module: 'bg-[#EFF6FF] border border-[#93C5FD] shadow-[0_20px_60px_-32px_rgba(59,130,246,0.3)]',
  file: 'bg-[#ECFEFF] border border-[#22D3EE] shadow-[0_20px_60px_-32px_rgba(14,165,233,0.2)]',
  commit: 'bg-[#F5F3FF] border border-[#A78BFA] shadow-[0_20px_60px_-32px_rgba(124,58,237,0.25)]',
  developer: 'bg-[#ECFDF5] border border-[#34D399] shadow-[0_20px_60px_-32px_rgba(16,185,129,0.25)]',
  issue: 'bg-[#FEF2F2] border border-[#FCA5A5] shadow-[0_20px_60px_-32px_rgba(239,68,68,0.25)]',
  default: 'bg-white border border-[#E4E1D8] shadow-[0_20px_60px_-32px_rgba(15,23,42,0.1)]',
};

const iconMap: Record<string, JSX.Element> = {
  repo: <Database className="w-5 h-5 text-[#38BDF8]" />,
  module: <FolderGit2 className="w-5 h-5 text-[#2563EB]" />,
  file: <FileCode className="w-5 h-5 text-[#0EA5E9]" />,
  commit: <GitCommit className="w-5 h-5 text-[#7C3AED]" />,
  developer: <User className="w-5 h-5 text-[#10B981]" />,
  issue: <Bug className="w-5 h-5 text-[#EF4444]" />,
};

const defaultIcon = <FileCode className="w-5 h-5 text-[#0EA5E9]" />;

export const CustomNode = ({ data }: { data: any }) => {
  const category = data.category || 'default';
  const label = data.label || data.id || 'Unnamed Entity';
  const subtext = data.subtext || data.description || data.type || '';

  return (
    <div className={`relative rounded-2xl p-2.5 min-w-[12rem] max-w-[15rem] text-[#0F172A] font-mono-code text-xs select-none transition-all ${categoryStyles[category] ?? categoryStyles.default}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-current !w-2 !h-2 opacity-90 hover:opacity-100 !-top-1"
      />

      <div className="absolute -top-3 left-3 w-9 h-9 rounded-full bg-white/10 blur-2xl opacity-70" />
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/70 shadow-lg" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid place-items-center w-12 h-12 rounded-3xl bg-white/20 text-white shadow-inner">
            {iconMap[category] || iconMap.default}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight truncate">{label}</p>
            {subtext && <p className="text-[12px] text-[#475569] truncate mt-0.5">{subtext}</p>}
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-[0.24em] font-semibold text-[#334155] bg-white/80 px-2 py-1 rounded-full border border-white/80">
          {category}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-[12px]">
        {(data.author || data.risk || data.status) && (
          <div className="grid gap-1">
            {data.author && (
              <span className="inline-flex items-center gap-2 text-[#0F172A] font-medium">
                <User className="w-3.5 h-3.5 text-[#10B981]" />
                {data.author}
              </span>
            )}
            {data.risk && (
              <span className="inline-flex items-center gap-2 text-[#B91C1C] font-semibold">
                <span className="inline-flex h-5 items-center rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] text-[#B91C1C]">
                  {data.risk.toString().toUpperCase()}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-current !w-2.5 !h-2.5 opacity-90 hover:opacity-100 !-bottom-1"
      />
    </div>
  );
};
