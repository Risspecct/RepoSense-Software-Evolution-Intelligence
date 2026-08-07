import { useState } from 'react';
import { X, Route, ArrowRight } from 'lucide-react';

interface PathFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: any[];
  onFindPath: (fromId: string, toId: string) => void;
}

export const PathFinderModal = ({ isOpen, onClose, nodes, onFindPath }: PathFinderModalProps) => {
  const [fromNode, setFromNode] = useState('');
  const [toNode, setToNode] = useState('');

  if (!isOpen) return null;

  const handleSearch = () => {
    if (fromNode && toNode) {
      onFindPath(fromNode, toNode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E1D8] rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 text-[#171A21]">
        <div className="flex justify-between items-center pb-3 border-b border-[#E4E1D8]">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-[#243B6B]" />
            <h3 className="font-bold text-base">Dependency Path Finder</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#F1F0EC] rounded cursor-pointer">
            <X className="w-4 h-4 text-[#5B5F6B]" />
          </button>
        </div>

        <p className="text-xs text-[#5B5F6B]">
          Find the shortest dependency traversal path between any two components in the graph.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono-code font-bold uppercase text-[#5B5F6B] block mb-1">From Node</label>
            <select
              value={fromNode}
              onChange={(e) => setFromNode(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E4E1D8] bg-[#F8F7F4] text-xs font-mono-code focus:outline-none"
            >
              <option value="">Select origin node...</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.data.label} ({n.data.category})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-[#5B5F6B] rotate-90" />
          </div>

          <div>
            <label className="text-xs font-mono-code font-bold uppercase text-[#5B5F6B] block mb-1">To Node</label>
            <select
              value={toNode}
              onChange={(e) => setToNode(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[#E4E1D8] bg-[#F8F7F4] text-xs font-mono-code focus:outline-none"
            >
              <option value="">Select target node...</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.data.label} ({n.data.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={!fromNode || !toNode}
          className="w-full py-2.5 bg-[#243B6B] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Find Dependency Path
        </button>
      </div>
    </div>
  );
};