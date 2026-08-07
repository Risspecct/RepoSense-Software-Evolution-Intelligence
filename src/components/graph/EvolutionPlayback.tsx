import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

interface EvolutionPlaybackProps {
  onStepChange: (stepIndex: number) => void;
  maxSteps: number;
}

export const EvolutionPlayback = ({ onStepChange, maxSteps }: EvolutionPlaybackProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          onStepChange(next);
          return next;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxSteps, onStepChange]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    onStepChange(0);
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-[#E4E1D8] shadow-2xl rounded-2xl p-3 px-6 flex items-center gap-6 text-[#171A21]">
      <div className="flex items-center gap-2 border-r border-[#E4E1D8] pr-4">
        <Sparkles className="w-4 h-4 text-[#243B6B]" />
        <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#243B6B]">
          Evolution Playback
        </span>
      </div>

      {/* Play Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          className="p-2 hover:bg-[#F1F0EC] rounded-lg transition cursor-pointer text-[#5B5F6B] hover:text-[#171A21]"
          title="Reset to initial state"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2.5 bg-[#243B6B] hover:bg-slate-800 text-white rounded-xl transition shadow-md cursor-pointer flex items-center justify-center"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <input
          type="range"
          min={0}
          max={maxSteps - 1}
          value={currentStep}
          onChange={(e) => {
            const val = Number(e.target.value);
            setCurrentStep(val);
            onStepChange(val);
          }}
          className="w-full accent-[#243B6B] cursor-pointer"
        />
        <span className="text-xs font-mono-code font-bold text-[#243B6B] shrink-0">
          Step {currentStep + 1} / {maxSteps}
        </span>
      </div>
    </div>
  );
};