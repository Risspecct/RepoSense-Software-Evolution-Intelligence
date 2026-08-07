import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { KnowledgeGraph } from './components/graph/KnowledgeGraph';
import { RepositoryExplorer } from './components/explorer/RepositoryExplorer';
import { PullRequests } from './pages/PullRequests';
import { Analytics } from './pages/Analytics';
import { 
  connectBackendRepository, 
  fetchBackendGraphData 
} from './components/services/backendApi';
import { fetchGitHubRepoData } from './components/services/githubApi';

export function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [, setRepoName] = useState('Spring-Course-Management-System');

  // Load initial graph on startup using your teammate's compatible Java repo
  useEffect(() => {
    const initialUrl = 'https://github.com/Risspecct/Spring-Course-Management-System';
    handleIngestRepo(initialUrl);
  }, []);

  const handleIngestRepo = async (url: string) => {
    console.log(`🚀 Attempting backend ingestion for: ${url}`);

    try {
      // 1. Send URL to backend /connect
      const connectRes = await connectBackendRepository(url);
      
      if (connectRes) {
        // 2. Fetch indexed graph from backend /index
        const backendGraph = await fetchBackendGraphData(url);
        if (backendGraph && backendGraph.nodes.length > 0) {
          setNodes(backendGraph.nodes);
          setEdges(backendGraph.edges);
          setRepoName(backendGraph.repoName);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend indexing skipped or offline, using fallback visualizer.');
    }

    // Fallback so canvas never breaks or stays blank
    const fallbackData = await fetchGitHubRepoData(url);
    if (fallbackData) {
      setNodes(fallbackData.nodes);
      setEdges(fallbackData.edges);
      setRepoName(fallbackData.repoName);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] text-[#171A21] flex flex-col font-mono-code">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setNodes={setNodes}
        setEdges={setEdges}
        setRepoName={setRepoName}
        onIngestRepo={handleIngestRepo}
      />

      <main className="flex-1 w-full">
        {activeTab === 'graph' && (
          <KnowledgeGraph nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />
        )}
        {activeTab === 'explorer' && <RepositoryExplorer />}
        {activeTab === 'prs' && <PullRequests />}
        {activeTab === 'analytics' && <Analytics />}
      </main>
    </div>
  );
}

export default App;