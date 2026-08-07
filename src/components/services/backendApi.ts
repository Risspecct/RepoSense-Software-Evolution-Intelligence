const BACKEND_URL = 'http://127.0.0.1:8000';

// 1. Health check for Neo4j status
export async function checkBackendHealth(): Promise<{ status: string; neo4j: boolean }> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (!res.ok) return { status: 'offline', neo4j: false };
    const data = await res.json();
    return {
      status: data.status,
      neo4j: data.neo4j === 'connected' || data.status === 'healthy',
    };
  } catch (error) {
    return { status: 'offline', neo4j: false };
  }
}

// 2. Connect repository
export async function connectBackendRepository(repoUrl: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/repositories/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: repoUrl }),
    });
    if (!response.ok) throw new Error(`Connect error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error('Error connecting repo:', error);
    return null;
  }
}

// 3. Index Repository & Fetch Neo4j Graph Nodes + Relationships
export async function fetchBackendGraphData(repoUrl: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/repositories/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repository_url: repoUrl }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Map Backend Neo4j format to React Flow format
    if (data && data.nodes && Array.isArray(data.nodes)) {
      const formattedNodes = data.nodes.map((node: any, index: number) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        return {
          id: node.id || `node-${index}`,
          type: 'customNode',
          data: {
            label: node.properties?.name || node.id || 'Class/Package',
            category: (node.label || 'class').toLowerCase(),
            subtext: node.properties?.package || node.label || 'Entity',
            modifiers: node.properties?.modifiers || [],
            annotations: node.properties?.annotations || [],
          },
          position: { x: 120 + col * 260, y: 120 + row * 150 },
        };
      });

      const formattedEdges = (data.relationships || []).map((rel: any, index: number) => ({
        id: `rel-${index}`,
        source: rel.source,
        target: rel.target,
        type: 'default',
        label: rel.type || 'CONTAINS',
        style: { stroke: '#243B6B', strokeWidth: 2 },
      }));

      return {
        nodes: formattedNodes,
        edges: formattedEdges,
        repoName: data.repository || 'Connected Repo',
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch indexed backend graph:', error);
    return null;
  }
}

// 4. Inspect Class Details
export async function fetchClassDetails(className: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(className)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching class details:', error);
    return null;
  }
}

// 5. Inspect Methods inside a Class
export async function fetchClassMethods(controllerOrClassName: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/methods/${encodeURIComponent(controllerOrClassName)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching method details:', error);
    return null;
  }
}