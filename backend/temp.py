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

indexer.index(
    REPOSITORY,
)

print("\nRepository indexed successfully!")

neo4j_client.connect()

try:

    print("\n" + "=" * 60)
    print("COMMIT NODES")
    print("=" * 60)

    result = neo4j_client.execute_query(
        """
        MATCH (c:Commit)
        RETURN count(c) AS commits
        """
    )

    print(f"Commit Nodes: {result[0]['commits']}")

    print("\n" + "=" * 60)
    print("FILE NODES")
    print("=" * 60)

    result = neo4j_client.execute_query(
        """
        MATCH (f:File)
        RETURN count(f) AS files
        """
    )

    print(f"File Nodes: {result[0]['files']}")

    print("\n" + "=" * 60)
    print("MODIFIED RELATIONSHIPS")
    print("=" * 60)

    result = neo4j_client.execute_query(
        """
        MATCH ()-[r:MODIFIED]->()
        RETURN count(r) AS modified
        """
    )

    print(f"MODIFIED Relationships: {result[0]['modified']}")

    print("\n" + "=" * 60)
    print("SAMPLE COMMITS")
    print("=" * 60)

    result = neo4j_client.execute_query(
        """
        MATCH (c:Commit)-[:MODIFIED]->(f:File)
        RETURN
            c.hash AS hash,
            c.message AS message,
            f.path AS file
        LIMIT 10
        """
    )

    for row in result:
        print("-" * 60)
        print(f"Commit : {row['hash'][:8]}")
        print(f"Message: {row['message']}")
        print(f"File   : {row['file']}")

finally:
    neo4j_client.close()
