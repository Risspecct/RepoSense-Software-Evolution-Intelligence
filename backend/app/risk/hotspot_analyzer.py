import pandas as pd
from app.graph.neo4j_client import get_db

def calculate_hotspots(project_id: str):
    '''Calculates the hotspot scores for files within a specific project based on their churn (no. of time file was updated) and complexity.
    The hotspot score is a weighted combination of normalized churn and complexity values.'''
    
    query = """
    MATCH (p:Project {id: $project_id})-[:CONTAINS]->(f:File)
    OPTIONAL MATCH (f)<-[:MODIFIED]-(c:Commit)
    RETURN f.path AS path, f.complexity AS complexity, count(c) AS churn
    """
    
    with get_db() as session:
        # We pass project_id as a parameter to keep it secure and fast
        records = session.run(query, project_id=project_id)
        data = [dict(r) for r in records]

    if not data:
        return []

    df = pd.DataFrame(data)

    # Normalization (Same as before, but now within the project scope)
    df['churn_norm'] = (df['churn'] - df['churn'].min()) / (df['churn'].max() - df['churn'].min() + 1e-9)
    df['comp_norm'] = (df['complexity'] - df['complexity'].min()) / (df['complexity'].max() - df['complexity'].min() + 1e-9)
    df['hotspot_score'] = (df['churn_norm'] * 0.7) + (df['comp_norm'] * 0.3)

    # Write back only to files within this project
    write_query = """
    MATCH (p:Project {id: $project_id})-[:CONTAINS]->(f:File {path: row.path})
    SET f.hotspot_score = row.hotspot_score
    """
    
    with get_db() as session:
        for index, row in df.iterrows():
            session.run(write_query, project_id=project_id, row=row)

    return df.sort_values(by='hotspot_score', ascending=False).to_dict('records')