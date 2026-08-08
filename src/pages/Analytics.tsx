import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, PieChart, Pie } from 'recharts';
import { Users, Flame, ShieldAlert, Cpu } from 'lucide-react';
import { fetchChangeCoupling } from '../components/services/backendApi';

interface CouplingCardItem {
  name: string;
  role: string;
  primaryModule: string;
  ownershipData: Array<{ value: number; color: string }>;
  commits: number;
}

const mockCouplingData = [
  {
    file1: 'app.java',
    file2: 'main.java',
    count: 42,
    confidence: 0.78,
  },
  {
    file1: 'authservice.java',
    file2: 'usercontroller.java',
    count: 28,
    confidence: 0.64,
  },
  {
    file1: 'jsonparser.java',
    file2: 'xmlserializer.java',
    count: 15,
    confidence: 0.52,
  },
];

export const Analytics = () => {
  const [couplingData, setCouplingData] = useState<any[]>([]);
  const [isLoadingCouplings, setIsLoadingCouplings] = useState(true);
  const displayData = couplingData.length > 0 ? couplingData : mockCouplingData;

  useEffect(() => {
    const loadCouplings = async () => {
      setIsLoadingCouplings(true);
      try {
        const response = await fetchChangeCoupling();
        const rawData = response?.data ?? [];
        const mappedData = rawData.map((item: any) => ({
          file1: item.file1 || item.from_path || item["from_path"],
          file2: item.file2 || item.to_path || item["to_path"],
          count: item.count ?? Math.max(1, Math.round((item.confidence ?? item.strength ?? 0) * 100)),
          confidence: item.confidence ?? item.strength ?? 0,
        }));
        setCouplingData(mappedData);
      } catch {
        setCouplingData([]);
      } finally {
        setIsLoadingCouplings(false);
      }
    };

    loadCouplings();
  }, []);

  const hotspotData = useMemo(() => {
    return displayData.slice(0, 8).map((item) => ({
      name: `${item.file1.split('/').pop() || item.file1} ↔ ${item.file2.split('/').pop() || item.file2}`,
      changes: Math.max(1, Math.round(item.confidence * 100)),
    }));
  }, [displayData]);

  const ownershipCards = useMemo(() => {
    return displayData.slice(0, 4).map((item) => {
      const file1 = item.file1.split('/').pop() || item.file1;
      const file2 = item.file2.split('/').pop() || item.file2;
      return {
        name: file1,
        role: `Co-changed with ${file2}`,
        primaryModule: item.file1.split('/')[0] || 'repo',
        ownershipData: [
          { value: item.count, color: '#243B6B' },
          { value: Math.max(1, Math.round(item.confidence * 100)), color: '#06B6D4' },
        ],
        commits: item.count,
      } satisfies CouplingCardItem;
    });
  }, [displayData]);

  const hotspotCount = useMemo(() => {
    const uniqueFiles = new Set(displayData.flatMap((item) => [item.file1, item.file2]));
    return uniqueFiles.size;
  }, [displayData]);

  return (
    <div className="bg-[#F6F5F1] min-h-[calc(100vh-80px)] p-6 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top KPI Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono-code">
          <div className="bg-white p-5 rounded-xl border border-[#E4E1D8] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#5B5F6B] font-bold">Fragile Files (Hotspots)</span>
              <p className="text-2xl font-bold text-[#B5442C]">{hotspotCount} Files</p>
            </div>
            <div className="p-3 bg-[#B5442C]/10 rounded-xl text-[#B5442C]">
              <Flame className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E4E1D8] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#5B5F6B] font-bold">Bus Factor Risk</span>
              <p className="text-2xl font-bold text-[#B8862F]">Medium (1 Dev)</p>
            </div>
            <div className="p-3 bg-[#B8862F]/10 rounded-xl text-[#B8862F]">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E4E1D8] shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase text-[#5B5F6B] font-bold">Co-change Pairs</span>
              <p className="text-2xl font-bold text-[#243B6B]">{displayData.length} Pairs</p>
            </div>
            <div className="p-3 bg-[#243B6B]/10 rounded-xl text-[#243B6B]">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Fragile Code Hotspots Chart */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#171A21] flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#B5442C]" />
                  <span>Fragile Code Hotspots (High Churn)</span>
                </h3>
                <p className="text-xs text-[#5B5F6B] font-mono-code mt-0.5">Threshold cutoff: &gt;30 modifications</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono-code">
                <span className="w-3 h-3 bg-[#B5442C] rounded-sm inline-block"></span>
                <span className="text-[#171A21]">Hotspot</span>
                <span className="w-3 h-3 bg-[#243B6B] rounded-sm inline-block ml-2"></span>
                <span className="text-[#171A21]">Normal</span>
              </div>
            </div>

            <div className="h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hotspotData}>
                  <XAxis dataKey="name" stroke="#5B5F6B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#5B5F6B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#171A21', border: 'none', borderRadius: '8px', color: '#FFF' }}
                    itemStyle={{ color: '#FFF', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                  />
                  <ReferenceLine
                    y={30}
                    stroke="#B5442C"
                    strokeDasharray="4 4"
                    label={{ value: 'HOTSPOT THRESHOLD', fill: '#df9585', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  />
                  <Bar dataKey="changes" radius={[6, 6, 0, 0]}>
                    {hotspotData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.changes >= 30 ? '#B5442C' : '#243B6B'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Developer Ownership Map */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#171A21] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2E7D5B]" />
              <span>Developer Ownership Map</span>
            </h3>

            <div className="space-y-4">
              {isLoadingCouplings ? (
                <div className="p-4 text-sm text-[#5B5F6B] font-mono-code">Loading change-coupling data…</div>
              ) : ownershipCards.length === 0 ? (
                <div className="p-4 text-sm text-[#5B5F6B] font-mono-code">No change-coupling data available yet.</div>
              ) : ownershipCards.map((dev, idx) => (
                <div key={idx} className="p-4 bg-[#F8F7F4] border border-[#E4E1D8] rounded-xl flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-[#171A21]">{dev.name}</h4>
                    <p className="text-xs text-[#5B5F6B] font-mono-code">{dev.role}</p>
                    <div className="inline-block mt-2 px-2.5 py-1 bg-white border border-[#E4E1D8] rounded-lg text-[10px] font-mono-code text-[#171A21] font-bold">
                      Primary Domain: {dev.primaryModule}
                    </div>
                  </div>

                  {/* Donut Chart Visualizing Ownership */}
                  <div className="w-24 h-24 relative shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dev.ownershipData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={22}
                          outerRadius={36}
                          stroke="none"
                        >
                          {dev.ownershipData.map((entry, i) => (
                            <Cell key={`pie-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center font-mono-code text-[11px] font-bold text-[#171A21]">
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