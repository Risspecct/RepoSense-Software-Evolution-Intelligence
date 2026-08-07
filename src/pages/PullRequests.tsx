import { useState } from 'react';
import { mockPRs } from '../mockData/graphData';
import { Sparkles, ArrowRight, AlertCircle, GitPullRequest, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

const RadialRiskGauge = ({ score, color }: { score: number; color: string }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r={radius} stroke="#E4E1D8" strokeWidth="7" fill="transparent" />
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
  const [selectedPR, setSelectedPR] = useState(mockPRs[0].id);

  return (
    <div className="bg-[#F6F5F1] min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono-code">
          <div className="bg-white p-4 rounded-xl border border-[#E4E1D8] shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-[#243B6B]/10 rounded-lg text-[#243B6B]">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#5B5F6B] font-bold">Active PRs</span>
              <p className="text-xl font-bold text-[#171A21]">{mockPRs.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E4E1D8] shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-[#B5442C]/10 rounded-lg text-[#B5442C]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#5B5F6B] font-bold">High Risk PRs</span>
              <p className="text-xl font-bold text-[#B5442C]">1 Detected</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E4E1D8] shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-[#2E7D5B]/10 rounded-lg text-[#2E7D5B]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#5B5F6B] font-bold">Safe to Merge</span>
              <p className="text-xl font-bold text-[#2E7D5B]">1 Approved</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E4E1D8] shadow-sm flex items-center gap-3">
            <div className="p-2.5 bg-[#06B6D4]/10 rounded-lg text-[#06B6D4]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#5B5F6B] font-bold">Modules Changed</span>
              <p className="text-xl font-bold text-[#171A21]">4 Total</p>
            </div>
          </div>
        </div>

        {/* PR Cards Grid */}
        <div className="grid grid-cols-1 gap-6">
          {mockPRs.map((pr) => {
            const isSelected = selectedPR === pr.id;
            return (
              <div
                key={pr.id}
                onClick={() => setSelectedPR(pr.id)}
                className={`bg-white border rounded-2xl p-6 shadow-sm transition-all cursor-pointer ${
                  isSelected ? 'border-[#243B6B] ring-2 ring-[#243B6B]/10' : 'border-[#E4E1D8] hover:border-[#243B6B]/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                  
                  {/* Left PR Info */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono-code text-xs font-bold px-2.5 py-1 bg-[#171A21] text-white rounded-lg">
                        {pr.id}
                      </span>
                      <h3 className="text-lg font-bold text-[#171A21]">{pr.title}</h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#5B5F6B] font-mono-code">
                      <span>Author: <strong className="text-[#171A21]">{pr.author}</strong></span>
                      <span>•</span>
                      <span>{pr.authorRole}</span>
                    </div>

                    {/* AI Intent Summary Box */}
                    <div className="p-4 bg-[#F8F7F4] border border-[#E4E1D8] rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#243B6B] font-mono-code">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Extracted PR Intent Summary</span>
                      </div>
                      <p className="text-xs text-[#171A21] leading-relaxed">{pr.summary}</p>
                    </div>

                    {/* Impacted Pipeline */}
                    <div>
                      <h4 className="text-[10px] font-mono-code uppercase font-bold text-[#5B5F6B] mb-2">
                        Impacted Module Pipeline
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {pr.impactedModules.map((m, idx) => (
                          <span
                            key={idx}
                            className={`px-3 py-1 text-xs font-mono-code rounded-lg border flex items-center gap-1.5 ${
                              m.isDriver
                                ? 'bg-[#B5442C]/10 text-[#B5442C] border-[#B5442C]/30 font-bold'
                                : 'bg-[#F8F7F4] text-[#171A21] border-[#E4E1D8]'
                            }`}
                          >
                            <ArrowRight className="w-3 h-3 text-[#5B5F6B]" />
                            <span>{m.name}</span>
                            <span className="text-[9px] opacity-75">({m.severity})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Regression Correlation Box */}
                    {pr.historicalFailures.length > 0 && (
                      <div className="p-4 bg-[#B5442C]/5 border border-[#B5442C]/20 rounded-xl space-y-2">
                        <h5 className="text-xs font-mono-code font-bold text-[#B5442C] flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Historical Regression Correlation</span>
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {pr.historicalFailures.map((f, i) => (
                            <div key={i} className="p-2.5 bg-white border border-[#E4E1D8] rounded-lg text-xs flex justify-between items-center font-mono-code">
                              <span className="text-[#171A21] font-medium">{f.test}</span>
                              <span className="text-[10px] text-[#B5442C] font-bold px-2 py-0.5 bg-[#B5442C]/10 rounded">
                                {f.failRate}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Risk Meter Card */}
                  <div className="w-full lg:w-56 p-6 bg-[#F8F7F4] border border-[#E4E1D8] rounded-2xl flex flex-col items-center text-center justify-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono-code uppercase font-bold text-[#5B5F6B] tracking-wider">
                      Predicted Risk Score
                    </span>

                    <RadialRiskGauge score={pr.riskScore} color={pr.riskColor} />

                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-mono-code font-bold uppercase tracking-wider text-white shadow-sm"
                      style={{ backgroundColor: pr.riskColor }}
                    >
                      {pr.riskLevel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};