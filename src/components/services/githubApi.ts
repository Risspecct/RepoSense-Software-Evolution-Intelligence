export async function fetchGitHubRepoData(repoUrl: string) {
  type GraphEdge = {
    id: string;
    source: string;
    target: string;
    type: string;
    style: { stroke: string; strokeWidth: number; strokeDasharray?: string };
    label?: string;
    labelStyle?: { fill: string; fontWeight: number; fontSize: number };
  };

  const defaultFallback = {
    repoName: 'RepoSense / Core',
    nodes: [
      {
        id: 'repo-root',
        type: 'customNode',
        data: { label: 'RepoSense Core', category: 'repo', subtext: 'Root Memory Engine' },
        position: { x: 380, y: 40 },
      },
      {
        id: 'mod-auth',
        type: 'customNode',
        data: { label: 'Auth Service', category: 'module', subtext: 'pkg/auth' },
        position: { x: 140, y: 160 },
      },
      {
        id: 'mod-[#104]',
        type: 'customNode',
        data: { label: 'PR #104', category: 'commit', subtext: 'JWT Refactor' },
        position: { x: 380, y: 220 },
      },
      {
        id: 'mod-payments',
        type: 'customNode',
        data: { label: 'Payments API', category: 'module', subtext: 'pkg/payments' },
        position: { x: 620, y: 160 },
      },
      {
        id: 'file-jwt',
        type: 'customNode',
        data: { label: 'jwt_verifier.py', category: 'file', risk: 'high', subtext: 'Auth Engine' },
        position: { x: 60, y: 320 },
      },
      {
        id: 'dev-alex',
        type: 'customNode',
        data: { label: 'Alex Rivera', category: 'developer', subtext: 'Staff Engineer' },
        position: { x: 340, y: 380 },
      },
      {
        id: 'issue-404',
        type: 'customNode',
        data: { label: 'Issue #404', category: 'issue', subtext: 'Auth Race Condition' },
        position: { x: 180, y: 480 },
      },
      {
        id: 'file-checkout',
        type: 'customNode',
        data: { label: 'checkout_session.py', category: 'file', subtext: 'Stripe Gateway' },
        position: { x: 580, y: 380 },
      },
    ],
    edges: [
      { id: 'e1', source: 'repo-root', target: 'mod-auth', type: 'default', style: { stroke: '#243B6B', strokeWidth: 2 } },
      { id: 'e2', source: 'repo-root', target: 'mod-payments', type: 'default', style: { stroke: '#243B6B', strokeWidth: 2 } },
      { id: 'e3', source: 'mod-auth', target: 'file-jwt', type: 'default', style: { stroke: '#B5442C', strokeWidth: 2, strokeDasharray: '4 4' }, label: 'MODIFIED' },
      { id: 'e4', source: 'mod-[#104]', target: 'file-jwt', type: 'default', style: { stroke: '#243B6B', strokeWidth: 2 } },
      { id: 'e5', source: 'dev-alex', target: 'mod-[#104]', type: 'default', style: { stroke: '#2E7D5B', strokeWidth: 2 }, label: 'AUTHORED' },
      { id: 'e6', source: 'file-jwt', target: 'issue-404', type: 'default', style: { stroke: '#B5442C', strokeWidth: 2 }, label: 'LINKED_TO' },
      { id: 'e7', source: 'mod-payments', target: 'file-checkout', type: 'default', style: { stroke: '#243B6B', strokeWidth: 2 }, label: 'IMPACTS' },
    ],
  };

  const match = repoUrl ? repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) : null;
  if (!match) return defaultFallback;

  const [, owner, repo] = match;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=12`);
    if (!response.ok) {
      console.warn(`GitHub API returned ${response.status}, using default graph structure.`);
      return defaultFallback;
    }

    const commits = await response.json();
    if (!Array.isArray(commits) || commits.length === 0) return defaultFallback;

    const COLUMNS = 3;
    const X_SPACING = 260;
    const Y_SPACING = 140;
    const START_X = 120;
    const START_Y = 160;

    const newNodes = [
      {
        id: 'repo-root',
        type: 'customNode',
        data: { label: `${owner}/${repo}`, category: 'repo', subtext: 'Active Repository' },
        position: { x: START_X + X_SPACING, y: 30 },
      },
      ...commits.map((c: any, index: number) => {
        const col = index % COLUMNS;
        const row = Math.floor(index / COLUMNS);
        const shortSha = c.sha.slice(0, 7);

        return {
          id: `commit-${shortSha}`,
          type: 'customNode',
          data: {
            label: `commit:${shortSha}`,
            category: 'commit',
            subtext: (c.commit?.message || 'Commit message').slice(0, 22) + '...',
            author: c.commit?.author?.name || 'Developer',
            risk: index === 0 ? 'high' : 'low',
          },
          position: {
            x: START_X + col * X_SPACING,
            y: START_Y + row * Y_SPACING,
          },
        };
      }),
      {
        id: `dev-main`,
        type: 'customNode',
        data: {
          label: commits[0]?.commit?.author?.name || 'Lead Contributor',
          category: 'developer',
          subtext: 'Primary Committer',
        },
        position: { x: START_X, y: START_Y + (Math.ceil(commits.length / COLUMNS) + 0.5) * Y_SPACING },
      },
      {
        id: 'file-core',
        type: 'customNode',
        data: { label: 'main.py / index.ts', category: 'file', risk: 'high', subtext: 'Core Application File' },
        position: { x: START_X + (COLUMNS - 1) * X_SPACING, y: START_Y + (Math.ceil(commits.length / COLUMNS) + 0.5) * Y_SPACING },
      }
    ];

    const newEdges = commits.map((c: any, index: number) => {
      const edgeStyle: { stroke: string; strokeWidth: number; strokeDasharray?: string } = {
        stroke: index === 0 ? '#B5442C' : '#243B6B',
        strokeWidth: 2,
      };

      if (index === 0) {
        edgeStyle.strokeDasharray = '4 4';
      }

      return {
        id: `e-commit-${index}`,
        source: 'repo-root',
        target: `commit-${c.sha.slice(0, 7)}`,
        type: 'default',
        style: edgeStyle,
      };
    });

    if (commits.length > 0) {
      newEdges.push(
        {
          id: 'e-dev-connect',
          source: 'dev-main',
          target: `commit-${commits[0].sha.slice(0, 7)}`,
          type: 'default',
          label: 'AUTHORED',
          labelStyle: { fill: '#2E7D5B', fontWeight: 700, fontSize: 10 },
          style: { stroke: '#2E7D5B', strokeWidth: 2 },
        },
        {
          id: 'e-file-connect',
          source: `commit-${commits[0].sha.slice(0, 7)}`,
          target: 'file-core',
          label: 'MODIFIED',
          labelStyle: { fill: '#B5442C', fontWeight: 700, fontSize: 10 },
          type: 'default',
          style: { stroke: '#B5442C', strokeWidth: 2 },
        }
      );
    }

    return { nodes: newNodes, edges: newEdges, repoName: `${owner}/${repo}` };
  } catch (error) {
    console.error('Failed to fetch from GitHub:', error);
    return defaultFallback;
  }
}