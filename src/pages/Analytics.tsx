import { mockAnalytics } from '../mockData/graphData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, PieChart, Pie } from 'recharts';
import { AlertTriangle, Users } from 'lucide-react';

export const Analytics = () => {
  return (
    <div className="bg-[#F6F5F1] min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#171A21]">Repository Hotspots & Bus-Factor Analytics</h2>
          <p className="text-xs text-[#5B5F6B] mt-1 font-mono-code">
            Code churn metrics and developer ownership breakdown across architectural modules
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hotspots Chart with Cutoff Line */}
          <div className="bg-white border border-[#E4E1D8] rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#171A21] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#B8862F]" />
                  <span>Fragile Code Hotspots (High Churn)</span>
                </h3>
                <p className="text-[11px] text-[#5B5F6B] font-mono-code mt-0.5">Threshold: &gt;30 modifications</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono-code">
                <span className="w-3 h-3 bg-[#B5442C] rounded-sm inline-block"></span>
                <span className="text-[#171A21]">Hotspot</span>
                <span className="w-3 h-3 bg-[#243B6B] rounded-sm inline-block ml-2"></span>
                <span className="text-[#171A21]">Normal</span>
              </div>
            </div>

            <div className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockAnalytics.hotspots}>
                  <XAxis dataKey="name" stroke="#5B5F6B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#5B5F6B" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171A21', border: 'none', borderRadius: '6px', color: '#FFF' }}
                    itemStyle={{ color: '#FFF', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                  />
                  {/* Dashed Threshold Cutoff Line */}
                  <ReferenceLine y={30} stroke="#B5442C" strokeDasharray="4 4" label={{ value: 'HOTSPOT THRESHOLD', fill: '#B5442C', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <Bar dataKey="changes" radius={[4, 4, 0, 0]}>
                    {mockAnalytics.hotspots.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.changes >= 30 ? '#B5442C' : '#243B6B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Developer Ownership Donut Heatmap */}
          <div className="bg-white border border-[#E4E1D8] rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#171A21] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E7D5B]" />
              <span>Developer Ownership Map</span>
            </h3>

            <div className="space-y-4">
              {mockAnalytics.developerExpertise.map((dev, idx) => (
                <div key={idx} className="p-4 bg-[#F8F7F4] border border-[#E4E1D8] rounded-lg flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-[#171A21]">{dev.name}</h4>
                    <p className="text-xs text-[#5B5F6B] font-mono-code">{dev.role}</p>
                    <div className="inline-block mt-1 px-2 py-0.5 bg-white border border-[#E4E1D8] rounded text-[10px] font-mono-code text-[#171A21]">
                      Primary: {dev.primaryModule}
                    </div>
                  </div>

                  {/* Donut Chart Visualizing Ownership */}
                  <div className="w-20 h-20 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dev.ownershipData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={18}
                          outerRadius={30}
                          stroke="none"
                        >
                          {dev.ownershipData.map((entry, i) => (
                            <Cell key={`pie-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center font-mono-code text-[10px] font-bold text-[#171A21]">
                      {dev.commits}c
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