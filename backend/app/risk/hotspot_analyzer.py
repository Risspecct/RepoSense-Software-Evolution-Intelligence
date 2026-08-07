import pandas as pd

from app.graph.neo4j_client import neo4j_client


def calculate_hotspots() -> list[dict]:
    neo4j_client.connect()
    # 1. Get complexity + calculate churn from Neo4j
    query = """
    MATCH (f:File)
    OPTIONAL MATCH (f)<-[:MODIFIED]-(c:Commit)
    RETURN
        f.path AS path,
        f.complexity AS complexity,
        count(c) AS churn
    """

    data = neo4j_client.execute_query(query)

    if not data:
        return []

    # 2. Convert Neo4j result into DataFrame
    df = pd.DataFrame(data)

    # Handle missing complexity values
    df["complexity"] = df["complexity"].fillna(0)

    # 3. Normalize churn
    churn_min = df["churn"].min()
    churn_max = df["churn"].max()

    df["churn_norm"] = (
        (df["churn"] - churn_min)
        / (churn_max - churn_min + 1e-9)
    )

    # 4. Normalize complexity
    comp_min = df["complexity"].min()
    comp_max = df["complexity"].max()

    df["comp_norm"] = (
        (df["complexity"] - comp_min)
        / (comp_max - comp_min + 1e-9)
    )

    # 5. Calculate hotspot score
    df["hotspot_score"] = (
        df["churn_norm"] * 0.7
        + df["comp_norm"] * 0.3
    )

    # 6. Prepare values for Neo4j
    hotspot_data = df[
        ["path", "hotspot_score"]
    ].to_dict("records")

    # Convert numpy floats into normal Python floats
    for row in hotspot_data:
        row["hotspot_score"] = float(row["hotspot_score"])

    # 7. Write hotspot scores back to File nodes
    write_query = """
    UNWIND $data AS row

    MATCH (f:File {path: row.path})

    SET f.hotspot_score = row.hotspot_score
    """

    neo4j_client.execute_query(
        write_query,
        {"data": hotspot_data},
    )
    result = (
        df.sort_values(
            by="hotspot_score",
            ascending=False,
        )
        .to_dict("records")
    )
    return result

if __name__ == "__main__":
    hotspots = calculate_hotspots()

    print(f"Found {len(hotspots)} hotspots\n")

    for hotspot in hotspots[:10]:
        print(hotspot)