import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { KnowledgeGraph } from './components/graph/KnowledgeGraph';
import { ClassSelector } from './components/graph/ClassSelector';
import { RepositoryExplorer } from './components/explorer/RepositoryExplorer';
import { PullRequests } from './pages/PullRequests';
import { Analytics } from './pages/Analytics';
import { RepoChatDrawer } from './components/chat/RepoChatDrawer';
import { 
  indexBackendRepository,
  fetchClassSubgraph 
} from './components/services/backendApi';

export function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [currentRepoName, setCurrentRepoName] = useState<string>('');

  const handleClassSelected = async (classId: string) => {
    console.log(`📊 Loading subgraph for class: ${classId}`);
    setIsLoading(true);
    setError(null);

    try {
      const graphData = await fetchClassSubgraph(classId, currentRepoName);
      
      if (graphData && graphData.nodes.length > 0) {
        console.log(`✅ Graph loaded: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges`);
        setNodes(graphData.nodes);
        setEdges(graphData.edges);
        setShowClassSelector(false);
        setActiveTab('graph');
      } else {
        setError('Failed to load subgraph for this class.');
      }
    } catch (err) {
      console.error('Failed to load class subgraph:', err);
      setError('Failed to load subgraph. Please try another class.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngestRepo = async (url: string) => {
    console.log(`🚀 Attempting backend ingestion for: ${url}`);
    setIsLoading(true);
    setError(null);
    setNodes([]);
    setEdges([]);
    setShowClassSelector(false);

    try {
      // Step 1: Index the repository (this clones and indexes into Neo4j)
      console.log('📥 Step 1: Indexing repository...');
      const indexResult = await indexBackendRepository(url);
      
      if (!indexResult) {
        throw new Error('Failed to index repository');
      }

      const repositoryName = indexResult.repository;
      setCurrentRepoName(repositoryName);
      console.log(`✅ Indexed successfully. Repository name: ${repositoryName}`);

      // Step 2: Show class selector for user to choose which class to explore
      console.log('✅ Indexing complete. Showing class selector...');
      setShowClassSelector(true);
      setActiveTab('graph');
      setIsLoading(false);

    } catch (err) {
      console.error('Backend indexing failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      if (errorMessage.includes('Backend network failure') || errorMessage.includes('Failed to fetch')) {
        setError('Backend service unavailable. Please check the backend server or network connection.');
      } else {
        setError(`Backend indexing failed: ${errorMessage}`);
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#171A21] flex flex-col font-mono-code">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onIngestRepo={handleIngestRepo}
        isLoading={isLoading}
      />

      <main className="flex-1 w-full">
        {activeTab === 'graph' && (
          <>
            {/* Error Banner */}
            {error && (
              <div className="bg-[#B5442C]/10 border-b border-[#B5442C]/30 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#B5442C] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[#B5442C]">Indexing Issue</h3>
                    <p className="text-xs text-[#171A21] mt-1">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-[#5B5F6B] hover:text-[#171A21] transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center text-center px-6">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-[#E4E1D8] rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#243B6B] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-lg font-semibold text-[#171A21]">
                  {showClassSelector ? 'Loading Graph...' : 'Indexing Repository...'}
                </p>
                <p className="mt-2 text-sm text-[#5B5F6B] max-w-lg">
                  {showClassSelector 
                    ? 'Fetching class subgraph from Neo4j...' 
                    : 'Cloning repository, parsing Java files, and building Neo4j knowledge graph. This may take 30-60 seconds.'}
                </p>
              </div>
            ) : showClassSelector ? (
              <ClassSelector onClassSelected={handleClassSelected} isLoading={isLoading} />
            ) : nodes.length > 0 ? (
              <KnowledgeGraph nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
            ) : (
              <div className="flex h-[calc(100vh-80px)] flex-col items-center justify-center text-center px-6">
                <svg className="w-16 h-16 text-[#243B6B] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-lg font-semibold text-[#171A21]">No Repository Loaded</p>
                <p className="mt-3 text-sm text-[#5B5F6B] max-w-lg">
                  Enter a GitHub repository URL above and click <strong>Ingest</strong> to analyze and visualize the codebase structure.
                </p>
              </div>
            )}
          </>
        )}
        {activeTab === 'explorer' && <RepositoryExplorer />}
        {activeTab === 'prs' && <PullRequests />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
      <RepoChatDrawer />
    </div>
  );
}

export default App;