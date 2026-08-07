from pathlib import Path

from app.graph.neo4j_client import neo4j_client
from app.indexing.repository_indexer import RepositoryIndexer

REPOSITORY = Path(
    "data/repositories/Spring-Course-Management-System"
)

print(f"Indexing repository: {REPOSITORY}")

indexer = RepositoryIndexer(
    neo4j_client,
)

indexer.index(REPOSITORY)

print("\nRepository indexed successfully!")

neo4j_client.connect()

try:

    print("\n" + "=" * 80)
    print("GRAPH COUNTS")
    print("=" * 80)

    queries = {
        "Packages": "MATCH (n:Package) RETURN count(n) AS count",
        "Files": "MATCH (n:File) RETURN count(n) AS count",
        "Classes": "MATCH (n:Class) RETURN count(n) AS count",
        "Methods": "MATCH (n:Method) RETURN count(n) AS count",
        "Fields": "MATCH (n:Field) RETURN count(n) AS count",
        "Commits": "MATCH (n:Commit) RETURN count(n) AS count",
        "MODIFIED": "MATCH ()-[r:MODIFIED]->() RETURN count(r) AS count",
        "CONTAINS(File)": """
            MATCH (:File)-[r:CONTAINS]->(:Class)
            RETURN count(r) AS count
        """,
    }

    for title, query in queries.items():
        result = neo4j_client.execute_query(query)
        print(f"{title:<20}: {result[0]['count']}")

    print("\n")
    print("=" * 80)
    print("EVOLUTION GRAPH")
    print("=" * 80)

    result = neo4j_client.execute_query(
        """
        MATCH (commit:Commit)
              -[:MODIFIED]->
              (file:File)
              -[:CONTAINS]->
              (class:Class)

        RETURN
            commit.message AS message,
            file.name AS file,
            class.name AS class

        LIMIT 15
        """
    )

    for row in result:
        print("-" * 80)
        print(f"Commit : {row['message']}")
        print(f"File   : {row['file']}")
        print(f"Class  : {row['class']}")

    print("\n")
    print("=" * 80)
    print("LATEST CHANGES TO A CLASS")
    print("=" * 80)

    result = neo4j_client.execute_query(
        """
        MATCH (class:Class)
              <-[:CONTAINS]-
              (file:File)
              <-[:MODIFIED]-
              (commit:Commit)

        RETURN
            class.name AS class,
            commit.message AS message,
            commit.author AS author,
            commit.timestamp AS timestamp

        ORDER BY timestamp DESC

        LIMIT 15
        """
    )

    for row in result:
        print("-" * 80)
        print(f"Class     : {row['class']}")
        print(f"Commit    : {row['message']}")
        print(f"Author    : {row['author']}")
        print(f"Timestamp : {row['timestamp']}")

finally:
    neo4j_client.close()
