import { useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

export interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  cardBg: string;
  border: string;
  text: string;
  dotColor: string;
  accent: string;
}

export const themes: ThemeConfig[] = [
  { id: 'light', name: 'Light Minimal', bg: '#F6F5F1', cardBg: '#FFFFFF', border: '#E4E1D8', text: '#171A21', dotColor: '#CBD5E1', accent: '#243B6B' },
  { id: 'dark-gold', name: 'Dark Gold', bg: '#12131C', cardBg: '#1A1C28', border: '#2A2D3D', text: '#E2E8F0', dotColor: '#33384B', accent: '#EAB308' },
  { id: 'dark-ocean', name: 'Dark Ocean', bg: '#0F172A', cardBg: '#1E293B', border: '#334155', text: '#F8FAFC', dotColor: '#334155', accent: '#38BDF8' },
  { id: 'dark-forest', name: 'Dark Forest', bg: '#0A1A14', cardBg: '#12291F', border: '#1E3E30', text: '#ECFDF5', dotColor: '#1E3E30', accent: '#10B981' },
  { id: 'dark-rose', name: 'Dark Rose', bg: '#1C0D13', cardBg: '#2A141E', border: '#3D1E2C', text: '#FFF1F2', dotColor: '#3D1E2C', accent: '#FB7185' },
];

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  setTheme: (t: ThemeConfig) => void;
  font: string;
  setFont: (f: string) => void;
}

export const ThemeModal = ({ isOpen, onClose, activeTheme, setTheme, font, setFont }: ThemeModalProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-16 right-4 z-50 bg-white/95 backdrop-blur-md border border-[#E4E1D8] rounded-2xl shadow-2xl p-4 w-64 text-[#171A21] space-y-3"
    >
      <div className="flex justify-between items-center pb-2 border-b border-[#E4E1D8]">
        <span className="text-[10px] font-mono-code font-bold uppercase text-[#5B5F6B] tracking-wider">
          Canvas Theme & Font
        </span>
        <button onClick={onClose} className="p-1 hover:bg-[#F1F0EC] rounded-lg cursor-pointer">
          <X className="w-3.5 h-3.5 text-[#5B5F6B]" />
        </button>
      </div>

      {/* Theme Presets */}
      <div className="space-y-1">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTheme(t);
              onClose(); // Automatically closes box after selecting!
            }}
            onMouseEnter={() => setTheme(t)} // Live preview on hover
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono-code transition cursor-pointer ${
              activeTheme.id === t.id
                ? 'bg-[#243B6B] text-white font-bold shadow-sm'
                : 'hover:bg-[#F1F0EC] text-[#171A21]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: t.bg }} />
              <span>{t.name}</span>
            </div>
            {activeTheme.id === t.id && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        ))}
      </div>

      {/* Font Selector Restored */}
      <div className="pt-2 border-t border-[#E4E1D8] space-y-1.5">
        <label className="text-[10px] font-mono-code font-bold uppercase text-[#5B5F6B]">Heading Font</label>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono-code">
          {['sans', 'serif', 'mono'].map((f) => (
            <button
              key={f}
              onClick={() => setFont(f)}
              className={`py-1 rounded-lg border capitalize transition cursor-pointer font-bold ${
                font === f ? 'bg-[#243B6B] text-white border-[#243B6B]' : 'border-[#E4E1D8] hover:bg-[#F8F7F4]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};