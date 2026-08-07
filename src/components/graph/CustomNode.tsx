import { Handle, Position } from '@xyflow/react';

const categoryStyles: Record<string, string> = {
  repo: 'bg-[#ECF7FF] border border-[#B7E0FF] text-[#0F172A] shadow-[0_14px_36px_-22px_rgba(56,189,248,0.28)]',
  module: 'bg-[#F5F8FF] border border-[#93C5FD] text-[#0F172A] shadow-[0_14px_36px_-22px_rgba(59,130,246,0.22)]',
  file: 'bg-[#ECFEFF] border border-[#A5F3FC] text-[#0F172A] shadow-[0_14px_36px_-22px_rgba(14,165,233,0.2)]',
  commit: 'bg-[#F8F4FF] border border-[#C4B5FD] text-[#0F172A] shadow-[0_14px_36px_-22px_rgba(124,58,237,0.18)]',
  developer: 'bg-[#EFF6FF] border border-[#A5B4FC] text-[#0F172A] shadow-[0_14px_36px_-22px_rgba(59,130,246,0.18)]',
  issue: 'bg-[#FEF2F2] border border-[#FECACA] text-[#0F172A] shadow-[0_14px_36px_-22px_rgba(239,68,68,0.16)]',
  default: 'bg-[#FFFFFF] border border-[#E2E8F0] text-[#0F172A] shadow-[0_14px_36px_-22px_rgba(15,23,42,0.08)]',
};

const friendlyCategoryLabel = (category: string) => {
  const normalized = category?.toString().trim().toLowerCase();
  if (normalized === 'class') return 'Class';
  if (normalized === 'method') return 'Method';
  if (normalized === 'file') return 'File';
  if (normalized === 'commit') return 'Commit';
  if (normalized === 'developer') return 'Developer';
  if (normalized === 'issue') return 'Issue';
  return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Entity';
};

const normalizeLabel = (label: string) => {
  return label
    .replace(/^\s*#+\s*/g, '')
    .replace(/\s*Class$/i, '')
    .replace(/\s*Interface$/i, '')
    .trim();
};

export const CustomNode = ({ data }: { data: any }) => {
  const category = data.category || 'default';
  const rawLabel = data.label || data.id || 'Unnamed Entity';
  const title = normalizeLabel(rawLabel);
  const typeLabel = friendlyCategoryLabel(category);
  const subtext = data.subtext || data.description || (category === 'class' ? 'Class' : '');

  return (
    <div className={`relative rounded-2xl p-3 min-w-[14rem] max-w-[17rem] text-[#0F172A] font-mono-code text-sm select-none transition-all ${categoryStyles[category] ?? categoryStyles.default}`}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-current !w-2 !h-2 opacity-90 hover:opacity-100 !-top-1"
      />

      <div className="absolute -top-3 left-3 w-10 h-10 rounded-full bg-white/50 blur-2xl opacity-80" />

      <div className="space-y-2 px-1">
        <div className="text-base font-semibold leading-snug break-words whitespace-normal text-[#0F172A]">{title}</div>
        <div className="inline-flex items-center rounded-full bg-white/80 px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-[#475569] border border-white/80">
          {typeLabel}
        </div>
        {subtext && (
          <div className="text-[12px] leading-relaxed text-[#475569] break-words whitespace-normal">
            {subtext}
          </div>
        )}
      </div>

      {(data.author || data.risk) && (
        <div className="mt-3 flex flex-wrap gap-2 px-1">
          {data.author && <span className="rounded-full bg-white/80 px-2 py-1 border border-white/80 text-[11px] text-[#0F172A]">{data.author}</span>}
          {data.risk && (
            <span className="rounded-full bg-[#FEF2F2] px-2 py-1 text-[11px] text-[#B91C1C] border border-[#FECACA]">{data.risk.toString().toUpperCase()}</span>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-current !w-2.5 !h-2.5 opacity-90 hover:opacity-100 !-bottom-1"
      />
    </div>
  );
};
