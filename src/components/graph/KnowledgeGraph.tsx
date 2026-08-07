import { useState, useCallback, useEffect } from 'react';
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
import { X, Sparkles, AlertTriangle, FileCode, History, GitCommit, User, Loader2, Boxes, Braces } from 'lucide-react';
import { fetchClassFields, fetchClassHistory, fetchClassMethods } from '../services/backendApi';

const nodeTypes = { customNode: CustomNode };

interface KnowledgeGraphProps {
  nodes: any[];
  edges: any[];
  setNodes: React.Dispatch<React.SetStateAction<any[]>>;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
}

export const KnowledgeGraph = ({ nodes, edges, setNodes, setEdges }: KnowledgeGraphProps) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [theme, setTheme] = useState<ThemeConfig>(themes[0]);
  const [font, setFont] = useState('sans');
  
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isPathOpen, setIsPathOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'files' | 'history'>('info');
  const [commitHistory, setCommitHistory] = useState<any[]>([]);
  const [classMethods, setClassMethods] = useState<any[]>([]);
  const [classFields, setClassFields] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const activeNodes = nodes;
  const activeEdges = edges;

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

  useEffect(() => {
    if (selectedNode && selectedNode.data.category === 'class') {
      loadClassDetails(selectedNode.id);
    }
  }, [selectedNode]);

  useEffect(() => {
    if (activeTab === 'history' && selectedNode && selectedNode.data.category === 'class') {
      loadCommitHistory(selectedNode.id);
    }
  }, [activeTab, selectedNode]);

  const loadClassDetails = async (classId: string) => {
    setIsLoadingDetails(true);
    setDetailsError(null);
    setClassMethods([]);
    setClassFields([]);

    try {
      const [methodsData, fieldsData] = await Promise.all([
        fetchClassMethods(classId),
        fetchClassFields(classId),
      ]);

      setClassMethods(methodsData ?? []);
      setClassFields(fieldsData ?? []);
    } catch (err) {
      console.error('Failed to load class details:', err);
      setDetailsError('Failed to load class details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const loadCommitHistory = async (classId: string) => {
    setIsLoadingHistory(true);
    setHistoryError(null);
    setCommitHistory([]);

    try {
      console.log(`📜 Loading commit history for class: ${classId}`);
      const historyData = await fetchClassHistory(classId);
      
      if (historyData && historyData.history) {
        console.log(`✅ Loaded ${historyData.history.length} commits`);
        setCommitHistory(historyData.history);
      } else {
        setCommitHistory([]);
      }
    } catch (err) {
      console.error('Failed to load commit history:', err);
      setHistoryError('Failed to load commit history');
      setCommitHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };


  return (
    <div
      className="relative w-full h-[calc(100vh-80px)] overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: theme.bg, color: theme.text, fontFamily: `var(--font-${font})` }}
    >
      {/* Header Controls Bar */}
      <GraphHeaderBar
        onOpenPathModal={() => setIsPathOpen(true)}
        onOpenThemeModal={() => setIsThemeOpen(!isThemeOpen)}
        onStartTour={() => {}}
      />

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

      {/* Right Collapsible Panel (INFO / FILES / HISTORY) */}
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
          <button
            onClick={() => setActiveTab('history')}
            disabled={!selectedNode || selectedNode.data.category !== 'class'}
            className={`flex-1 py-1 text-center font-bold border-b-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'history' ? 'border-[#243B6B] text-[#243B6B]' : 'border-transparent text-[#5B5F6B]'
            }`}
          >
            HISTORY
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

        {activeTab === 'history' && (
          <div className="space-y-2 max-h-96 overflow-y-auto text-xs">
            {!selectedNode || selectedNode.data.category !== 'class' ? (
              <div className="p-4 text-center text-[#5B5F6B] font-mono-code">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a class node to view its commit history</p>
              </div>
            ) : isLoadingHistory ? (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-[#243B6B] mb-2" />
                <p className="text-[#5B5F6B] font-mono-code text-xs">Loading commit history...</p>
              </div>
            ) : historyError ? (
              <div className="p-4 bg-[#B5442C]/10 border border-[#B5442C]/30 rounded-xl text-center">
                <AlertTriangle className="w-6 h-6 mx-auto text-[#B5442C] mb-2" />
                <p className="text-[#B5442C] font-mono-code text-xs">{historyError}</p>
              </div>
            ) : commitHistory.length === 0 ? (
              <div className="p-4 text-center text-[#5B5F6B] font-mono-code">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No commit history found for this class</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] font-mono-code text-[#5B5F6B] uppercase font-bold mb-2">
                  {commitHistory.length} Commits Found
                </div>
                {commitHistory.map((commit, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F8F7F4] hover:bg-[#F1F0EC] border border-[#E4E1D8] rounded-lg space-y-2 transition"
                  >
                    {/* Commit Hash */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <GitCommit className="w-3 h-3 text-[#243B6B]" />
                        <span className="font-mono-code text-[10px] font-bold text-[#243B6B]">
                          {commit.hash.slice(0, 7)}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#5B5F6B] font-mono-code">
                        {new Date(commit.timestamp).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Commit Message */}
                    <p className="text-[11px] text-[#171A21] font-mono-code line-clamp-2">
                      {commit.message}
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-1.5 text-[10px] text-[#5B5F6B] font-mono-code">
                      <User className="w-3 h-3" />
                      <span>{commit.author}</span>
                    </div>

                    {/* File Path */}
                    <div className="flex items-center gap-1.5 text-[10px] text-[#5B5F6B] font-mono-code">
                      <FileCode className="w-3 h-3" />
                      <span className="truncate">{commit.file_path}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Node Context Drawer */}
      {selectedNode && (
        <div className="absolute top-20 right-90 w-72 max-h-[78vh] overflow-y-auto bg-white border border-[#E4E1D8] rounded-2xl p-4 shadow-2xl text-[#171A21] z-50">
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

            {selectedNode.data.category === 'class' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#E4E1D8] bg-[#F8F7F4] p-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold font-mono-code uppercase text-[#243B6B]">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>File / Class Info</span>
                  </div>
                  {isLoadingDetails ? (
                    <p className="text-[11px] text-[#5B5F6B] font-mono-code">Loading class details…</p>
                  ) : detailsError ? (
                    <p className="text-[11px] text-[#B5442C] font-mono-code">{detailsError}</p>
                  ) : (
                    <div className="space-y-2 text-[11px] font-mono-code text-[#171A21]">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#5B5F6B]">Name</span>
                        <strong className="text-right">{selectedNode.data.label}</strong>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#5B5F6B]">Type</span>
                        <strong className="text-right">{selectedNode.data.rawProperties?.type || 'class'}</strong>
                      </div>
                      {selectedNode.data.rawProperties?.package && (
                        <div className="flex justify-between gap-2">
                          <span className="text-[#5B5F6B]">Package</span>
                          <strong className="text-right">{selectedNode.data.rawProperties.package}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#E4E1D8] bg-white p-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold font-mono-code uppercase text-[#243B6B]">
                    <Braces className="w-3.5 h-3.5" />
                    <span>Methods</span>
                  </div>
                  {isLoadingDetails ? (
                    <p className="text-[11px] text-[#5B5F6B] font-mono-code">Loading methods…</p>
                  ) : classMethods.length === 0 ? (
                    <p className="text-[11px] text-[#5B5F6B] font-mono-code">No methods found for this class.</p>
                  ) : (
                    <ul className="space-y-1.5 text-[11px] font-mono-code text-[#171A21]">
                      {classMethods.slice(0, 8).map((method) => (
                        <li key={method.id} className="rounded-lg border border-[#E4E1D8] bg-[#F8F7F4] px-2 py-1.5">
                          <div className="font-bold">{method.name}</div>
                          <div className="text-[10px] text-[#5B5F6B]">
                            {method.return_type || 'void'}
                            {method.parameter_types?.length ? ` (${method.parameter_types.join(', ')})` : ''}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-[#E4E1D8] bg-white p-3">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-bold font-mono-code uppercase text-[#243B6B]">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Fields</span>
                  </div>
                  {isLoadingDetails ? (
                    <p className="text-[11px] text-[#5B5F6B] font-mono-code">Loading fields…</p>
                  ) : classFields.length === 0 ? (
                    <p className="text-[11px] text-[#5B5F6B] font-mono-code">No fields found for this class.</p>
                  ) : (
                    <ul className="space-y-1.5 text-[11px] font-mono-code text-[#171A21]">
                      {classFields.slice(0, 8).map((field) => (
                        <li key={field.id} className="rounded-lg border border-[#E4E1D8] bg-[#F8F7F4] px-2 py-1.5">
                          <div className="font-bold">{field.name}</div>
                          <div className="text-[10px] text-[#5B5F6B]">{field.type}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
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