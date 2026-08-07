const BACKEND_URL = 'http://127.0.0.1:8000';

// ---------------------------------------------------------------------------
// TYPES (Strictly matching your OpenAPI Schemas)
// ---------------------------------------------------------------------------
export interface ClassResponse {
  id: string;
  name: string;
  type: string;
  modifiers: string[];
  annotations: string[];
  extends: string | null;
  implements: string[];
}

export interface MethodResponse {
  id: string;
  name: string;
  modifiers: string[];
  annotations: string[];
  is_constructor: boolean;
  parameter_names: string[];
  parameter_types: string[];
  return_type: string | null;
}

export interface FieldResponse {
  id: string;
  name: string;
  type: string;
  modifiers: string[];
  annotations: string[];
  initializer: string | null;
}

export interface ClassHistoryResponse {
  class_id: string;
  history: {
    hash: string;
    message: string;
    author: string;
    email: string;
    timestamp: string;
    file_path: string;
  }[];
}

export interface DependencyGroupResponse {
  imports: ClassResponse[];
  extends: ClassResponse[];
  implements: ClassResponse[];
}

// ---------------------------------------------------------------------------
// 1. Health & Ingestion
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 2. Fetch Full Repository Graph (POST /repositories/index)
// ---------------------------------------------------------------------------
export async function fetchBackendGraphData(repoUrl: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/repositories/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repository_url: repoUrl }),
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data && data.nodes && Array.isArray(data.nodes)) {
      return parseGraphDocument(data);
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch indexed backend graph:', error);
    return null;
  }
}

// Helper to convert OpenAPI GraphDocument -> React Flow Nodes & Edges
function parseGraphDocument(data: any) {
  const COLUMNS = 4;
  const X_SPACING = 280;
  const Y_SPACING = 160;

  const formattedNodes = data.nodes.map((node: any, index: number) => {
    const col = index % COLUMNS;
    const row = Math.floor(index / COLUMNS);
    const props = node.properties || {};
    const labelName = props.name || props.id || node.id;

    return {
      id: String(node.id),
      type: 'customNode',
      data: {
        label: labelName,
        category: String(node.label || props.type || 'class').toLowerCase(),
        subtext: props.package || node.label || 'Entity',
        modifiers: props.modifiers || [],
        annotations: props.annotations || [],
        rawProperties: props,
      },
      position: { x: 100 + col * X_SPACING, y: 100 + row * Y_SPACING },
    };
  });

  const formattedEdges = (data.relationships || []).map((rel: any, index: number) => ({
    id: `rel-${index}`,
    source: String(rel.source),
    target: String(rel.target),
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

// ---------------------------------------------------------------------------
// 3. Class & Method Lookups
// ---------------------------------------------------------------------------
export async function fetchClassByName(className: string): Promise<ClassResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(className)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchMethodsByName(methodName: string): Promise<MethodResponse[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/methods/${encodeURIComponent(methodName)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 4. Class Deep Insights (Endpoints using class_id)
// ---------------------------------------------------------------------------
export async function fetchClassMethods(classId: string): Promise<MethodResponse[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(classId)}/methods`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchClassFields(classId: string): Promise<FieldResponse[] | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(classId)}/fields`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchClassHistory(classId: string): Promise<ClassHistoryResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(classId)}/history`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchClassDependencies(classId: string): Promise<DependencyGroupResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(classId)}/dependencies`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchClassDependents(classId: string): Promise<DependencyGroupResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(classId)}/dependents`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchClassSubgraph(classId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/graph/classes/${encodeURIComponent(classId)}/subgraph`);
    if (!res.ok) return null;
    const data = await res.json();
    return parseGraphDocument(data);
  } catch {
    return null;
  }
}