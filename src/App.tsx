import { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { KnowledgeGraph } from './components/graph/KnowledgeGraph';
import { PullRequests } from './pages/PullRequests';
import { Analytics } from './pages/Analytics';
import { RepoChatDrawer } from './components/chat/RepoChatDrawer';
import { fetchGitHubRepoData } from './components/services/githubApi';
import { initialNodes, initialEdges } from './mockData/graphData';
import { RepositoryExplorer } from './components/explorer/RepositoryExplorer';

export function App() {
  const [activeTab, setActiveTab] = useState('graph');
  const [nodes, setNodes] = useState<any[]>(initialNodes);
  const [edges, setEdges] = useState<any[]>(initialEdges);
  const [isLoadingRepo, setIsLoadingRepo] = useState(false);

  const handleIngestRepo = async (url: string) => {
    setIsLoadingRepo(true);
    const data = await fetchGitHubRepoData(url);
    setIsLoadingRepo(false);

    if (data) {
      setNodes(data.nodes);
      setEdges(data.edges);
      setActiveTab('graph');
    } else {
      alert('Could not parse repository. Please ensure it is a public GitHub URL.');
    }
  };

  return (
    <div className="min-h-screen bg-[#12141A] flex flex-col">
      {/* Navbar with live GitHub Ingestion */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onIngestRepo={handleIngestRepo}
        isLoadingRepo={isLoadingRepo}
      />

      {/* Main Canvas View */}
      // Inside src/App.tsx wrapper:
     <main className="w-full min-h-[calc(100vh-80px)] bg-[#F6F5F1]">
        {activeTab === 'graph' && <KnowledgeGraph nodes={nodes} edges={edges} setNodes={setNodes} setEdges={setEdges} />}
        {activeTab === 'explorer' && <RepositoryExplorer />}
        {activeTab === 'prs' && <PullRequests />}
        {activeTab === 'analytics' && <Analytics />}
     </main>

      {/* Floating GraphRAG AI Chat Assistant */}
      <RepoChatDrawer />
    </div>
  );
}

export default App;