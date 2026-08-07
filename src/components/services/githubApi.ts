export async function fetchGitHubRepoData(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  const [, owner, repo] = match;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=16`);
    if (!response.ok) return null;

    const commits = await response.json();
    const COLUMNS = 4;
    const X_SPACING = 240;
    const Y_SPACING = 120;
    const START_X = 100;
    const START_Y = 160;

    const newNodes = [
      {
        id: 'repo-root',
        type: 'customNode',
        data: { label: `${owner}/${repo}`, category: 'repo', subtext: 'Client Ingested Repository' },
        position: { x: START_X + ((COLUMNS - 1) * X_SPACING) / 2, y: 30 },
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
            subtext: c.commit.message.slice(0, 22) + '...',
            author: c.commit.author.name,
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
        data: { label: 'main.py / index.ts', category: 'file', risk: 'high', subtext: 'Core File' },
        position: { x: START_X + (COLUMNS - 1) * X_SPACING, y: START_Y + (Math.ceil(commits.length / COLUMNS) + 0.5) * Y_SPACING },
      }
    ];

    const newEdges = commits.map((c: any, index: number) => ({
      id: `e-commit-${index}`,
      source: 'repo-root',
      target: `commit-${c.sha.slice(0, 7)}`,
      type: 'default',
      style: {
        stroke: index === 0 ? '#B5442C' : '#243B6B',
        strokeWidth: 2,
        strokeDasharray: index === 0 ? '4 4' : 'none',
      },
    }));

    if (commits.length > 0) {
      newEdges.push(
        {
          id: 'e-dev-connect',
          source: 'dev-main',
          target: `commit-${commits[0].sha.slice(0, 7)}`,
          type: 'default',
          label: 'AUTHORED',
          labelStyle: { fill: '#2E7D5B', fontWeight: 700, fontSize: 10, fontFamily: 'JetBrains Mono' },
          labelBgStyle: { fill: '#FFFFFF', rx: 6, ry: 6 },
          labelBgPadding: [6, 4],
          style: { stroke: '#2E7D5B', strokeWidth: 2 },
        },
        {
          id: 'e-file-connect',
          source: `commit-${commits[0].sha.slice(0, 7)}`,
          target: 'file-core',
          label: 'MODIFIED',
          labelStyle: { fill: '#B5442C', fontWeight: 700, fontSize: 10, fontFamily: 'JetBrains Mono' },
          labelBgStyle: { fill: '#FFFFFF', rx: 6, ry: 6 },
          labelBgPadding: [6, 4],
          type: 'default',
          style: { stroke: '#B5442C', strokeWidth: 2 },
        }
      );
    }

    return { nodes: newNodes, edges: newEdges, repoName: `${owner}/${repo}` };
  } catch (error) {
    console.error('Failed to fetch from GitHub:', error);
    return null;
  }
}