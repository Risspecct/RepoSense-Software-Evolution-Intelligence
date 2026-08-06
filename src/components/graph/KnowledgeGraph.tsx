import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react';
import { CustomNode } from './CustomNode';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

const nodeTypes = { customNode: CustomNode };

interface KnowledgeGraphProps {
  nodes: any[];
  edges: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
}

export const KnowledgeGraph = ({ nodes, edges, setNodes, setEdges }: KnowledgeGraphProps) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-[#F6F5F1] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNode(node)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#CBD5E1" />
        <Controls className="!bg-white !border-[#E4E1D8] !shadow-md !rounded-lg overflow-hidden [&>button]:!bg-white [&>button]:!border-b-[#E4E1D8] [&>button]:!text-[#171A21]" />
      </ReactFlow>

      {/* Floating Node Context Drawer - Light Paper Style */}
      {selectedNode && (
        <div className="absolute top-6 right-6 w-96 bg-white border border-[#E4E1D8] rounded-xl p-5 shadow-xl text-[#171A21] z-50">
          <div className="flex justify-between items-center pb-3 border-b border-[#E4E1D8]">
            <span className="text-[10px] font-mono-code uppercase font-bold text-[#243B6B] tracking-wider">
              {selectedNode.data.category} Entity Context
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-[#F1F0EC] rounded cursor-pointer transition"
            >
              <X className="w-4 h-4 text-[#5B5F6B]" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-base font-bold font-mono-code">{selectedNode.data.label}</h3>
              <p className="text-xs text-[#5B5F6B] mt-0.5">{selectedNode.data.subtext || selectedNode.id}</p>
            </div>

            {selectedNode.data.author && (
              <div className="text-xs text-[#243B6B] font-mono-code">
                Author: <strong className="text-[#171A21]">{selectedNode.data.author}</strong>
              </div>
            )}

            {selectedNode.data.description && (
              <p className="text-xs text-[#171A21] leading-relaxed bg-[#F8F7F4] p-3 rounded border border-[#E4E1D8]">
                {selectedNode.data.description}
              </p>
            )}

            {selectedNode.data.risk === 'high' && (
              <div className="p-3 bg-[#B5442C]/10 border border-[#B5442C]/30 rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B5442C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-[#B5442C] uppercase font-mono-code">Regression Correlation</h4>
                  <p className="text-[11px] text-[#B5442C] mt-0.5">
                    Modifying this entity correlates with downstream test failures in Auth & Payment suites.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-[#F8F7F4] rounded-lg border border-[#E4E1D8] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#243B6B] font-bold font-mono-code">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extracted Intent</span>
              </div>
              <p className="text-[11px] text-[#171A21] italic leading-relaxed">
                {selectedNode.data.category === 'commit'
                  ? `Commit Intent: "${selectedNode.data.subtext}"`
                  : `Active component entity mapped in repository knowledge graph.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};