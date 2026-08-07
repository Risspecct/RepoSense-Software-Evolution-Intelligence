<div align="center">

# 🚀 RepoSense
### Software Evolution Intelligence Platform

<p>
Transforming software repositories into a living architectural knowledge graph.
</p>

<img src="architecture-flow.jpg" width="90%" alt="RepoSense Architecture"/>

<br>

![Python](https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![Neo4j](https://img.shields.io/badge/Neo4j-4581C3?style=for-the-badge&logo=neo4j)
![Gemini](https://img.shields.io/badge/Gemini-AI-blueviolet?style=for-the-badge)
![GraphRAG](https://img.shields.io/badge/GraphRAG-Knowledge%20Reasoning-success?style=for-the-badge)
![Tree-sitter](https://img.shields.io/badge/Tree--sitter-AST-orange?style=for-the-badge)

</div>

---

# 📖 Overview

RepoSense is an **AI-powered Software Evolution Intelligence Platform** that transforms Git repositories into a continuously evolving **Knowledge Graph**.

Instead of treating source code as isolated files, RepoSense preserves the **architectural memory** of an entire software project by combining:

- Git History
- Pull Requests
- AST Parsing
- Repository Structure
- Developer Intent
- Knowledge Graphs
- GraphRAG

The result is an intelligent system capable of explaining **what changed, why it changed, what it impacts, and how the architecture evolved over time.**

---

# ❓ Problem Statement

Modern repositories lose valuable architectural knowledge over time.

Common challenges include:

- Git records **what changed**, not **why**
- Architectural decisions disappear when developers leave
- AI coding assistants lack repository-wide architectural understanding
- Code reviews focus on changed lines rather than historical impact
- Hidden downstream dependencies remain invisible until production failures

RepoSense addresses these challenges by preserving architectural intent as a continuously evolving graph.

---

# 💡 Solution

RepoSense converts repository artifacts into an interconnected Knowledge Graph where:

- Every file becomes connected
- APIs know their dependencies
- Developers retain architectural context
- Historical reasoning is preserved
- AI retrieves grounded answers using GraphRAG instead of relying solely on LLM memory

Unlike traditional AI coding assistants, deterministic parsing constructs repository memory while the LLM focuses on interpretation.

---

# ⚙️ Architecture

```
                GitHub Repository
                        │
                        ▼
          Repository Intelligence Layer
      ┌─────────────────────────────────┐
      │                                 │
Git History                    Static Code Parsing
(PyDriller)                   (Tree-sitter / JavaParser)
      │                                 │
      └──────────────┬──────────────────┘
                     ▼
              Graph Builder Engine
                     │
                     ▼
             Neo4j Knowledge Graph
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Graph APIs     Analytics      AI Reasoning
                     │
                     ▼
             FastAPI Backend APIs
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Dashboard      Graph Viewer     AI Chat
```

---

# ⭐ Core Features

<table>

<tr>

<th width="25%">Feature</th>
<th>Description</th>

</tr>

<tr>

<td><b>Interactive Knowledge Graph</b></td>

<td>

Visualize repository architecture through an interactive graph of files, classes, APIs, developers, and dependencies.

</td>

</tr>

<tr>

<td><b>Intent Extraction</b></td>

<td>

Recover architectural reasoning and design intent from commits and pull requests using GraphRAG.

</td>

</tr>

<tr>

<td><b>Impact Analysis</b></td>

<td>

Predict downstream effects of source code changes before merging pull requests.

</td>

</tr>

<tr>

<td><b>Regression Intelligence</b></td>

<td>

Identify code hotspots, flaky tests, regression patterns, and long-term architectural risks.

</td>

</tr>

</table>

---

# 📊 Technology Stack

<table>

<tr>

<th>Layer</th>
<th>Technology</th>

</tr>

<tr>

<td>Frontend</td>

<td>React, TailwindCSS, React Flow / Cytoscape.js</td>

</tr>

<tr>

<td>Backend</td>

<td>FastAPI, Python</td>

</tr>

<tr>

<td>Graph Database</td>

<td>Neo4j, Cypher</td>

</tr>

<tr>

<td>Repository Mining</td>

<td>PyDriller</td>

</tr>

<tr>

<td>Static Analysis</td>

<td>Tree-sitter, JavaParser</td>

</tr>

<tr>

<td>Knowledge Graph</td>

<td>Neo4j</td>

</tr>

<tr>

<td>AI</td>

<td>Gemini API</td>

</tr>

<tr>

<td>Reasoning</td>

<td>GraphRAG</td>

</tr>

</table>

---

# 🔮 Future Roadmap

- Multi-language repository support
- Automatic architecture diagrams
- Repository timeline visualization
- AI-generated design documentation
- CI/CD integration
- GitHub App deployment
- Pull Request Copilot
- Enterprise multi-repository knowledge graph

---

# 👥 Team

<div align="center">

### Team Pav Bhaji
**RepoSense — Software Evolution Intelligence Platform**<br>

**Team Members:**<br>
Rishik Garg | Shresth Agarwal | Disha Kaushal | Trisha Soni

<br>

</div>

---

# 📄 License

This project is developed for **Quantum Arena '26 Hackathon**.

---

<div align="center">

### ⭐ Don't Search Code. Search Knowledge.

</div>
