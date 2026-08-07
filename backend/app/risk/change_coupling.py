import pandas as pd
from itertools import combinations
from collections import Counter
from app.graph.neo4j_client import neo4j_client

def analyze_change_coupling(project_id: str, threshold: float = 0.4) -> list[dict]:
    """
    Identifies files that frequently change together in the same commits.
    Uses Association Rule Mining (Confidence) to establish logical coupling.
    """
    neo4j_client.connect()

    # 1. Fetch all commits and their files for this specific project
    query = """
    MATCH (p:Project {id: $project_id})-[:CONTAINS]->(f:File)<-[:MODIFIED]-(c:Commit)
    RETURN 
        c.id AS commit_id, 
        f.path AS file_path
    """
    
    data = neo4j_client.execute_query(query, {"project_id": project_id})

    if not data:
        return []

    # 2. Group files by commit and count individual file occurrences
    commits = {}
    file_counts = Counter()
    
    for row in data:
        cid = row["commit_id"]
        path = row["file_path"]
        
        if cid not in commits:
            commits[cid] = []
        commits[cid].append(path)
        file_counts[path] += 1

    # 3. Count co-occurrences (pairs) across all commits
    pair_counts = Counter()
    for cid, files in commits.items():
        # Optimization: Ignore 'Giant Commits' (> 25 files) to avoid false noise
        if len(files) > 25:
            continue
        
        # Sort files to ensure (FileA, FileB) is the same as (FileB, FileA)
        for pair in combinations(sorted(files), 2):
            pair_counts[pair] += 1

    # 4. Calculate coupling strength (Confidence)
    coupling_data = []
    for (file_a, file_b), shared_count in pair_counts.items():
        # Confidence A -> B: In what % of A's changes did B also change?
        conf_a = shared_count / file_counts[file_a]
        # Confidence B -> A: In what % of B's changes did A also change?
        conf_b = shared_count / file_counts[file_b]

        if conf_a >= threshold:
            coupling_data.append({
                "from_path": file_a, 
                "to_path": file_b, 
                "strength": float(conf_a)
            })
        if conf_b >= threshold:
            coupling_data.append({
                "from_path": file_b, 
                "to_path": file_a, 
                "strength": float(conf_b)
            })

    # 5. Write logical coupling relationships back to the graph
    # We use MERGE to avoid duplicate edges
    write_query = """
    UNWIND $data AS row
    MATCH (p:Project {id: $project_id})
    MATCH (p)-[:CONTAINS]->(a:File {path: row.from_path})
    MATCH (p)-[:CONTAINS]->(b:File {path: row.to_path})
    
    MERGE (a)-[r:CO_CHANGES_WITH]->(b)
    SET r.strength = row.strength
    """

    neo4j_client.execute_query(
        write_query, 
        {"project_id": project_id, "data": coupling_data}
    )

    return coupling_data

if __name__ == "__main__":
    # Example usage
    couplings = analyze_change_coupling(project_id="repomind-backend")
    
    print(f"Detected {len(couplings)} logical couplings\n")
    
    for link in couplings[:10]:
        print(f"{link['from_path']} -> {link['to_path']} (Strength: {link['strength']:.2f})")