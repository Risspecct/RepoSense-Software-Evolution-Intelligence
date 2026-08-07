import pandas as pd
from app.graph.neo4j_client import neo4j_client

def calculate_change_risk(project_id: str, commit_id: str) -> dict:
    """
    Evaluates the risk of a specific commit by combining multiple intelligence signals.
    """
    neo4j_client.connect()

    # 1. Fetch all metadata for the files touched in this commit
    query = """
    MATCH (p:Project {id: $project_id})-[:CONTAINS]->(f:File)<-[:MODIFIED]-(c:Commit {id: $commit_id})
    OPTIONAL MATCH (c)-[:AUTHORED_BY]->(d:Developer)
    OPTIONAL MATCH (d)-[e:EXPERT_IN]->(f)
    
    // Get coupling info: Files that SHOULD have been changed with these files
    OPTIONAL MATCH (f)-[rel:CO_CHANGES_WITH]->(coupled:File)
    WHERE NOT (coupled)<-[:MODIFIED]-(c) AND rel.strength > 0.7
    
    RETURN 
        f.path AS path,
        f.hotspot_score AS hotspot_score,
        f.complexity AS complexity,
        e.score AS author_expertise,
        collect(coupled.path) AS missing_coupled_files,
        count(rel) AS impact_radius
    """
    
    params = {"project_id": project_id, "commit_id": commit_id}
    data = neo4j_client.execute_query(query, params)

    if not data:
        return {"commit_id": commit_id, "risk_score": 0, "reasons": ["No data found"]}

    # 2. Logic to calculate the score
    total_risk = 0
    risk_reasons = []
    
    for row in data:
        file_path = row['path']
        
        # Factor 1: Hotspot Penalty (Max +25)
        if row['hotspot_score'] and row['hotspot_score'] > 0.6:
            penalty = row['hotspot_score'] * 25
            total_risk += penalty
            risk_reasons.append(f"High-risk hotspot: {file_path}")

        # Factor 2: Expertise Penalty (Max +30)
        # If author expertise is low or 0
        expertise = row['author_expertise'] if row['author_expertise'] else 0
        if expertise < 0.3:
            total_risk += 30 * (1 - expertise)
            risk_reasons.append(f"Low author expertise on {file_path}")

        # Factor 3: Coupling Penalty (Max +20)
        # If there are files that usually change with this one, but were missed
        if row['missing_coupled_files']:
            total_risk += 20
            risk_reasons.append(f"Possible forgotten files: {row['missing_coupled_files']}")

        # Factor 4: Complexity/Impact Penalty (Max +25)
        if row['complexity'] and row['complexity'] > 100:
            total_risk += 15
            risk_reasons.append(f"High complexity in {file_path}")

    # 3. Finalize and Cap the score at 100
    final_score = min(total_risk, 100)
    
    # 4. Write the Risk Score back to the Commit Node
    write_query = """
    MATCH (c:Commit {id: $commit_id})
    SET c.risk_score = $risk_score,
        c.risk_reasons = $reasons
    """
    
    neo4j_client.execute_query(write_query, {
        "commit_id": commit_id, 
        "risk_score": float(final_score),
        "reasons": risk_reasons[:5] # Store top 5 reasons
    })

    return {
        "commit_id": commit_id,
        "risk_score": round(final_score, 2),
        "reasons": list(set(risk_reasons)) # Unique reasons only
    }

if __name__ == "__main__":
    # Simulate checking a new commit
    result = calculate_change_risk(
        project_id="repomind-backend", 
        commit_id="feat-auth-fix-001"
    )
    
    print(f"Risk Assessment for {result['commit_id']}: {result['risk_score']}/100")
    for reason in result['reasons']:
        print(f" - {reason}")