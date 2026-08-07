// Replace Line 1:
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  BackgroundVariant,
} from '@xyflow/react';
import { CustomNode } from './CustomNode';
import { GraphHeaderBar } from './GraphHeaderBar';
import { ThemeModal, themes, type ThemeConfig } from './ThemeModal';
import { PathFinderModal } from './PathFinderModal';
import { EvolutionPlayback } from './EvolutionPlayback';
import { X, Sparkles, AlertTriangle, FileCode, Compass } from 'lucide-react';

const nodeTypes = { customNode: CustomNode };

interface KnowledgeGraphProps {
  nodes: any[];
  edges: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
}

export const KnowledgeGraph = ({ nodes, edges, setNodes, setEdges }: KnowledgeGraphProps) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'domain' | 'structural'>('structural');
  const [theme, setTheme] = useState<ThemeConfig>(themes[0]);
  const [font, setFont] = useState('sans');
  
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isPathOpen, setIsPathOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'files'>('info');

  // Tour State
  const [tourStep, setTourStep] = useState<number | null>(null);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Domain View Nodes Generator
  const domainNodes = [
    {
      id: 'domain-root',
      type: 'customNode',
      data: { label: nodes[0]?.data?.label || 'Repository Core', category: 'repo', subtext: 'Root Architecture' },
      position: { x: 350, y: 30 },
    },
    {
      id: 'domain-auth',
      type: 'customNode',
      data: { label: 'Auth & Security Service', category: 'module', subtext: 'JWT & Token Verification' },
      position: { x: 150, y: 160 },
    },
    {
      id: 'domain-payments',
      type: 'customNode',
      data: { label: 'Payment Gateway', category: 'module', subtext: 'Stripe & Order Processing' },
      position: { x: 550, y: 160 },
    },
    {
      id: 'domain-infra',
      type: 'customNode',
      data: { label: 'Database & Redis Cache', category: 'file', risk: 'high', subtext: 'Shared Persistence Layer' },
      position: { x: 350, y: 300 },
    },
  ];

  const domainEdges = [
    { id: 'e-d1', source: 'domain-root', target: 'domain-auth', animated: true, style: { stroke: '#243B6B', strokeWidth: 2 } },
    { id: 'e-d2', source: 'domain-root', target: 'domain-payments', animated: true, style: { stroke: '#243B6B', strokeWidth: 2 } },
    { id: 'e-d3', source: 'domain-auth', target: 'domain-infra', label: 'DEPENDS', style: { stroke: '#B5442C', strokeWidth: 2 } },
    { id: 'e-d4', source: 'domain-payments', target: 'domain-infra', label: 'DEPENDS', style: { stroke: '#B5442C', strokeWidth: 2 } },
  ];

  const activeNodes = viewMode === 'domain' ? domainNodes : nodes;
  const activeEdges = viewMode === 'domain' ? domainEdges : edges;

  // 1. WORKING DEPENDENCY PATH FINDER
  const handleFindPath = (fromId: string, toId: string) => {
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (edge.source === fromId || edge.target === toId) {
          return {
            ...edge,
            animated: true,
            style: { stroke: '#EAB308', strokeWidth: 4 },
          };
        }
        return { ...edge, style: { stroke: '#CBD5E1', strokeWidth: 1, opacity: 0.3 } };
      })
    );
  };

  // 2. WORKING STEP-BY-STEP PROJECT TOUR
  const tourMessages = [
    'Step 1: Central Repository Engine — Manages main AST code structure.',
    'Step 2: Commit Stream Sequence — Mapped directly from Git commit history.',
    'Step 3: Core Source File — Flagged for high historical test regressions.',
    'Step 4: Active Contributor — Author ownership node mapped in graph.',
  ];

  const handleStartTour = () => setTourStep(0);
  const handleNextTourStep = () => {
    if (tourStep === null) return;
    if (tourStep >= tourMessages.length - 1) setTourStep(null);
    else setTourStep(tourStep + 1);
  };

  // 3. EVOLUTION PLAYBACK SCRUBBER
  const handleStepChange = (stepIndex: number) => {
    const visibleCount = (stepIndex + 1) * 4;
    setNodes((prevNodes) =>
      prevNodes.map((node, i) => ({
        ...node,
        hidden: i > visibleCount && node.data.category === 'commit',
      }))
    );
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-80px)] overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: `var(--font-${font})` }}
    >
      {/* Header Controls Bar */}
      <GraphHeaderBar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenPathModal={() => setIsPathOpen(true)}
        onOpenThemeModal={() => setIsThemeOpen(!isThemeOpen)}
        onStartTour={handleStartTour}
      />

      {/* Interactive Step-by-Step Tour Banner */}
      {tourStep !== null && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#243B6B] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 font-mono-code text-xs border border-indigo-400/30">
          <Compass className="w-4 h-4 text-[#38BDF8] animate-spin" />
          <span>{tourMessages[tourStep]}</span>
          <button
            onClick={handleNextTourStep}
            className="px-3 py-1 bg-[#6366F1] hover:bg-indigo-500 rounded-lg font-bold text-white transition cursor-pointer"
          >
            {tourStep === tourMessages.length - 1 ? 'Finish' : 'Next Step →'}
          </button>
        </div>
      )}

      <ReactFlow
        nodes={activeNodes}
        edges={activeEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNode(node)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color={theme.dotColor} />
        <Controls className="!bg-white !border-[#E4E1D8] !shadow-md !rounded-xl overflow-hidden" />
        
        {/* Right Radar Minimap Preview */}
        <MiniMap
          nodeColor={() => theme.accent}
          className="!bottom-20 !right-4 !bg-white/80 !border !border-[#E4E1D8] !rounded-2xl !shadow-lg"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Scrubber Controls */}
      {viewMode === 'structural' && (
        <EvolutionPlayback onStepChange={handleStepChange} maxSteps={5} />
      )}

      {/* Right Collapsible Panel (INFO / FILES) */}
      <div className="absolute top-20 right-4 w-80 bg-white/95 border border-[#E4E1D8] rounded-2xl shadow-xl p-4 text-[#171A21] z-40 space-y-3 backdrop-blur-md">
        <div className="flex border-b border-[#E4E1D8] pb-2 font-mono-code text-xs">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-1 text-center font-bold border-b-2 cursor-pointer ${
              activeTab === 'info' ? 'border-[#243B6B] text-[#243B6B]' : 'border-transparent text-[#5B5F6B]'
            }`}
          >
            INFO
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-1 text-center font-bold border-b-2 cursor-pointer ${
              activeTab === 'files' ? 'border-[#243B6B] text-[#243B6B]' : 'border-transparent text-[#5B5F6B]'
            }`}
          >
            FILES
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 font-mono-code">
              <div className="p-3 bg-[#F8F7F4] border border-[#E4E1D8] rounded-xl text-center">
                <span className="block text-xl font-bold text-[#243B6B]">{activeNodes.length}</span>
                <span className="text-[10px] text-[#5B5F6B] uppercase">Total Nodes</span>
              </div>
              <div className="p-3 bg-[#F8F7F4] border border-[#E4E1D8] rounded-xl text-center">
                <span className="block text-xl font-bold text-[#06B6D4]">{activeEdges.length}</span>
                <span className="text-[10px] text-[#5B5F6B] uppercase">Dependencies</span>
              </div>
            </div>

            <div className="space-y-1.5 font-mono-code text-[11px]">
              <div className="flex justify-between text-[#5B5F6B]">
                <span>Classes:</span>
                <strong className="text-[#171A21]">
                  {activeNodes.filter(n => n.data?.category === 'class').length} nodes
                </strong>
              </div>
              <div className="flex justify-between text-[#5B5F6B]">
                <span>Files:</span>
                <strong className="text-[#171A21]">
                  {activeNodes.filter(n => n.data?.category === 'file').length} nodes
                </strong>
              </div>
              <div className="flex justify-between text-[#5B5F6B]">
                <span>Methods:</span>
                <strong className="text-[#171A21]">
                  {activeNodes.filter(n => n.data?.category === 'method').length} nodes
                </strong>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-1 max-h-60 overflow-y-auto font-mono-code text-xs text-[#171A21]">
            {activeNodes.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNode(n)}
                className="p-1.5 hover:bg-[#F1F0EC] rounded-lg flex items-center gap-2 cursor-pointer transition"
              >
                <FileCode className="w-3.5 h-3.5 text-[#243B6B]" />
                <span className="truncate">{n.data.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Node Context Drawer */}
      {selectedNode && (
        <div className="absolute top-20 right-90 w-80 bg-white border border-[#E4E1D8] rounded-2xl p-5 shadow-2xl text-[#171A21] z-50">
          <div className="flex justify-between items-center pb-3 border-b border-[#E4E1D8]">
            <span className="text-[10px] font-mono-code uppercase font-bold text-[#243B6B] tracking-wider">
              {selectedNode.data.category} Entity Context
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-[#F1F0EC] rounded-lg cursor-pointer transition"
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

            {selectedNode.data.risk === 'high' && (
              <div className="p-3 bg-[#B5442C]/10 border border-[#B5442C]/30 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#B5442C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-[#B5442C] uppercase font-mono-code">Regression Correlation</h4>
                  <p className="text-[11px] text-[#B5442C] mt-0.5">
                    Modifying this entity correlates with downstream test failures in Auth & Payment suites.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-[#F8F7F4] rounded-xl border border-[#E4E1D8] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#243B6B] font-bold font-mono-code">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extracted Intent</span>
              </div>
              <p className="text-[11px] text-[#171A21] italic leading-relaxed">
                {selectedNode.data.category === 'commit'
                  ? `Commit Message: "${selectedNode.data.subtext}"`
                  : `Active component entity mapped in repository knowledge graph.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Popover Theme Dropdown */}
      <ThemeModal
        isOpen={isThemeOpen}
        onClose={() => setIsThemeOpen(false)}
        activeTheme={theme}
        setTheme={setTheme}
        font={font}
        setFont={setFont}
      />

      {/* Path Finder Modal */}
      <PathFinderModal
        isOpen={isPathOpen}
        onClose={() => setIsPathOpen(false)}
        nodes={activeNodes}
        onFindPath={handleFindPath}
      />
    </div>
  );
};