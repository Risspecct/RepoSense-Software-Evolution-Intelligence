import { Route, Palette, Compass } from 'lucide-react';

interface GraphHeaderBarProps {
  onOpenPathModal: () => void;
  onOpenThemeModal: () => void;
  onStartTour: () => void;
}

export const GraphHeaderBar = ({
  onOpenPathModal,
  onOpenThemeModal,
  onStartTour,
}: GraphHeaderBarProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-40 flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-[#E4E1D8] shadow-md text-xs font-mono-code">
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-[#243B6B] text-white text-[11px] font-bold tracking-[0.15em] uppercase">
          Structural View
        </span>
        <span className="text-[#475569] text-[11px]">Polished interactive graph mode</span>
      </div>

      {/* Feature Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStartTour}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E1D8] hover:bg-[#F8F7F4] font-bold text-[#171A21] cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-[#6366F1]" />
          <span>Project Tour</span>
        </button>

        <button
          onClick={onOpenPathModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E1D8] hover:bg-[#F8F7F4] font-bold text-[#171A21] cursor-pointer"
        >
          <Route className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>Path Finder</span>
        </button>

        <button
          onClick={onOpenThemeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E4E1D8] hover:bg-[#F8F7F4] font-bold text-[#171A21] cursor-pointer"
        >
          <Palette className="w-3.5 h-3.5 text-[#EAB308]" />
          <span>Theme</span>
        </button>
      </div>
    </div>
  );
};