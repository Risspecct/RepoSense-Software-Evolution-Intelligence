import pandas as pd
from datetime import datetime
from app.graph.neo4j_client import neo4j_client

def calculate_developer_expertise(project_id: str) -> list[dict]:
    """
    Calculates expertise scores for developers on specific files.
    Uses time-decay to prioritize recent contributions over historical ones.
    """
    neo4j_client.connect()

    # 1. Fetch Developers, Files, and Commit Timestamps
    query = """
    MATCH (p:Project {id: $project_id})-[:CONTAINS]->(f:File)
    MATCH (f)<-[:MODIFIED]-(c:Commit)-[:AUTHORED_BY]->(d:Developer)
    RETURN 
        d.name AS developer_name,
        f.path AS file_path,
        c.timestamp AS timestamp
    """
    
    data = neo4j_client.execute_query(query, {"project_id": project_id})

    if not data:
        return []

    # 2. Convert to DataFrame
    df = pd.DataFrame(data)

    # 3. Calculate "Days Since Commit"
    # Convert ISO string or timestamp to datetime object
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    now = datetime.now()
    
    # Calculate days difference
    df['days_ago'] = (now - df['timestamp']).dt.days
    # Ensure no negative days (in case of server clock mismatch)
    df['days_ago'] = df['days_ago'].apply(lambda x: max(x, 0))

    # 4. Apply Time-Decay Formula
    # Recent commits = higher weight
    df['knowledge_weight'] = 1 / (df['days_ago'] + 1)

    # 5. Aggregate: Sum weights per Developer per File
    expertise_df = df.groupby(['file_path', 'developer_name'])['knowledge_weight'].sum().reset_index()

    # 6. Normalize scores (0 to 1) per file
    # This shows who is the expert RELATIVE to others on that specific file
    expertise_df['expertise_score'] = expertise_df.groupby('file_path')['knowledge_weight'].transform(
        lambda x: (x / x.max()) if x.max() > 0 else 0
    )

    # 7. Prepare for Neo4j (Write back the EXPERT_IN relationship)
    expertise_data = expertise_df.to_dict("records")
    
    # Convert numpy types to native Python types for Neo4j
    for row in expertise_data:
        row["expertise_score"] = float(row["expertise_score"])

    # We create a relationship between Developer and File
    write_query = """
    UNWIND $data AS row
    MATCH (p:Project {id: $project_id})
    MATCH (p)-[:CONTAINS]->(f:File {path: row.file_path})
    MATCH (d:Developer {name: row.developer_name})
    
    MERGE (d)-[r:EXPERT_IN]->(f)
    SET r.score = row.expertise_score,
        r.last_updated = datetime()
    """

    neo4j_client.execute_query(
        write_query, 
        {"project_id": project_id, "data": expertise_data}
    )

    return expertise_data

if __name__ == "__main__":
    expertise = calculate_developer_expertise(project_id="repomind-backend")
    
    print(f"Mapped {len(expertise)} expertise relationships\n")
    
    # Show top experts for a specific file (example)
    for row in expertise[:10]:
        print(f"Dev: {row['developer_name']} | File: {row['file_path']} | Score: {row['expertise_score']:.2f}")