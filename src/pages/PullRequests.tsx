import { mockPRs } from '../mockData/graphData';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react'; 

// Radial SVG Risk Gauge Component
const RadialRiskGauge = ({ score, color }: { score: number; color: string }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="#E4E1D8"
          strokeWidth="7"
          fill="transparent"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono-code text-[#171A21]">{score}</span>
        <span className="text-[9px] font-mono-code text-[#5B5F6B] uppercase font-semibold">/ 100</span>
      </div>
    </div>
  );
};

export const PullRequests = () => {
  return (
    <div className="bg-[#F6F5F1] min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#171A21]">Pull Request Risk & Evolution Analysis</h2>
          <p className="text-xs text-[#5B5F6B] mt-1 font-mono-code">
            Real-time change impact prediction driven by historical commit graphs
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {mockPRs.map((pr) => (
            <div
              key={pr.id}
              className={`bg-white border border-[#E4E1D8] rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start border-l-4 ${
                pr.riskScore > 50 ? 'border-l-[#B5442C]' : 'border-l-[#2E7D5B]'
              }`}
            >
              {/* Main Content Info */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono-code text-xs font-bold px-2.5 py-1 bg-[#171A21] text-white rounded">
                    {pr.id}
                  </span>
                  <h3 className="text-lg font-bold text-[#171A21]">{pr.title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#5B5F6B] font-mono-code">
                  <span>Author: <strong className="text-[#171A21]">{pr.author}</strong></span>
                  <span>•</span>
                  <span>{pr.authorRole}</span>
                </div>

                {/* AI Summary Box */}
                <div className="p-4 bg-[#F8F7F4] border border-[#E4E1D8] rounded-lg space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#243B6B]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extracted Intent Summary</span>
                  </div>
                  <p className="text-xs text-[#171A21] leading-relaxed">{pr.summary}</p>
                </div>

                {/* Impacted Modules */}
                <div>
                  <h4 className="text-[11px] font-mono-code uppercase font-bold text-[#5B5F6B] mb-2">
                    Impacted Component Pipeline
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pr.impactedModules.map((m, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 text-xs font-mono-code rounded border flex items-center gap-1.5 ${
                          m.isDriver
                            ? 'bg-[#B5442C]/10 text-[#B5442C] border-[#B5442C]/30 font-bold'
                            : 'bg-[#F1F0EC] text-[#171A21] border-[#E4E1D8]'
                        }`}
                      >
                        <ArrowRight className="w-3 h-3 text-[#5B5F6B]" />
                        <span>{m.name}</span>
                        <span className="text-[9px] opacity-75">({m.severity})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Historical Failures Section */}
                {pr.historicalFailures.length > 0 && (
                  <div className="p-3.5 bg-[#B5442C]/5 border border-[#B5442C]/20 rounded-lg space-y-2">
                    <h5 className="text-xs font-mono-code font-bold text-[#B5442C] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Historical Regression Correlation</span>
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {pr.historicalFailures.map((f, i) => (
                        <div key={i} className="p-2 bg-white border border-[#E4E1D8] rounded text-xs flex justify-between items-center">
                          <span className="font-mono-code text-[#171A21] font-medium">{f.test}</span>
                          <span className="font-mono-code text-[10px] text-[#B5442C] font-bold">{f.failRate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Radial Risk Gauge */}
              <div className="w-full md:w-52 p-5 bg-[#F8F7F4] border border-[#E4E1D8] rounded-xl flex flex-col items-center text-center justify-center gap-2 shrink-0">
                <span className="text-[10px] font-mono-code uppercase font-bold text-[#5B5F6B] tracking-wider">
                  Risk Level Score
                </span>

                <RadialRiskGauge score={pr.riskScore} color={pr.riskColor} />

                <span
                  className="px-3 py-0.5 rounded-full text-[10px] font-mono-code font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: pr.riskColor }}
                >
                  {pr.riskLevel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};