export async function fetchGitHubRepoData(repoUrl: string) {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error('Invalid GitHub URL');

    const [, owner, repo] = match;

    // Fetch up to 20 historical commits for a rich, balanced graph
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`);
    if (!response.ok) throw new Error('Repo not found');

    const commits = await response.json();

    // Balanced Layout Constants
    const COLUMNS = 4;
    const X_SPACING = 240;
    const Y_SPACING = 120;
    const START_X = 100;
    const START_Y = 160;

    const newNodes = [
      {
        id: 'repo-root',
        type: 'customNode',
        data: { label: `${owner}/${repo}`, category: 'repo', subtext: 'Active Repository Memory' },
        position: { x: START_X + ((COLUMNS - 1) * X_SPACING) / 2, y: 30 },
      },
      ...commits.map((c: any, index: number) => {
        const col = index % COLUMNS;
        const row = Math.floor(index / COLUMNS);

        return {
          id: `commit-${c.sha.slice(0, 7)}`,
          type: 'customNode',
          data: {
            label: `PR #${100 + index}`,
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
      animated: index === 0,
      type: 'smoothstep',
      style: { stroke: index === 0 ? '#B5442C' : '#243B6B', strokeWidth: 1.5 },
    }));

    if (commits.length > 0) {
      newEdges.push(
        {
          id: 'e-dev-connect',
          source: 'dev-main',
          target: `commit-${commits[0].sha.slice(0, 7)}`,
          type: 'smoothstep',
          style: { stroke: '#2E7D5B', strokeWidth: 1.5 },
        },
        {
          id: 'e-file-connect',
          source: `commit-${commits[0].sha.slice(0, 7)}`,
          target: 'file-core',
          label: 'MODIFIED',
          type: 'smoothstep',
          style: { stroke: '#B5442C', strokeWidth: 1.5 },
        }
      );
    }

    return { nodes: newNodes, edges: newEdges, repoName: `${owner}/${repo}` };
  } catch (error) {
    console.error('GitHub API error:', error);
    return null;
  }
}