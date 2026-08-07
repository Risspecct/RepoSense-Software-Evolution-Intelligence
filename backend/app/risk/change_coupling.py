from itertools import combinations

import pandas as pd

from app.graph.neo4j_client import neo4j_client


def calculate_change_coupling() -> list[dict]:
    neo4j_client.connect()

    # --------------------------------------------------
    # 1. Fetch every commit with its modified files
    # --------------------------------------------------

    query = """
    MATCH (c:Commit)-[:MODIFIED]->(f:File)

    RETURN
        c.hash AS commit,
        collect(f.path) AS files
    """

    commits = neo4j_client.execute_query(query)

    if not commits:
        return []

    # --------------------------------------------------
    # 2. Fetch churn of every file
    # --------------------------------------------------

    churn_query = """
    MATCH (f:File)

    OPTIONAL MATCH (f)<-[:MODIFIED]-(c:Commit)

    RETURN
        f.path AS path,
        count(c) AS churn
    """

    churn_data = neo4j_client.execute_query(churn_query)

    churn_lookup = {
        row["path"]: row["churn"]
        for row in churn_data
    }

    # --------------------------------------------------
    # 3. Count file pairs
    # --------------------------------------------------

    pair_counts = {}

    for commit in commits:

        files = sorted(set(commit["files"]))

        if len(files) < 2:
            continue

        for pair in combinations(files, 2):

            pair_counts[pair] = pair_counts.get(pair, 0) + 1

    if not pair_counts:
        return []

    # --------------------------------------------------
    # 4. Build dataframe
    # --------------------------------------------------

    rows = []

    for (file1, file2), count in pair_counts.items():

        churn1 = churn_lookup.get(file1, 0)
        churn2 = churn_lookup.get(file2, 0)

        denominator = min(churn1, churn2)

        confidence = (
            count / denominator
            if denominator > 0
            else 0.0
        )

        rows.append(
            {
                "file1": file1,
                "file2": file2,
                "count": int(count),
                "confidence": float(confidence),
            }
        )

    df = pd.DataFrame(rows)

    # --------------------------------------------------
    # 5. Write relationships back to Neo4j
    # --------------------------------------------------

    delete_query = """
    MATCH ()-[r:CO_CHANGED_WITH]->()
    DELETE r
    """

    neo4j_client.execute_query(delete_query)

    relationship_data = df.to_dict("records")

    write_query = """
    UNWIND $data AS row

    MATCH (a:File {path: row.file1})
    MATCH (b:File {path: row.file2})

    MERGE (a)-[r:CO_CHANGED_WITH]->(b)

    SET
        r.count = row.count,
        r.confidence = row.confidence,
        r.last_updated = datetime()
    """

    neo4j_client.execute_query(
        write_query,
        {"data": relationship_data},
    )

    result = (
        df.sort_values(
            by=["confidence", "count"],
            ascending=False,
        )
        .to_dict("records")
    )

    return result


if __name__ == "__main__":

    couplings = calculate_change_coupling()

    print(f"\nFound {len(couplings)} coupled file pairs\n")

    for coupling in couplings[:20]:
        print(coupling)