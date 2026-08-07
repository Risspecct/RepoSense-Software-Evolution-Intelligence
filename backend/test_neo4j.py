from app.graph.neo4j_client import Neo4jClient


def main():
    client = Neo4jClient()

    try:
        client.connect()

        print("\n[PASS] Connected to Neo4j")

        # ----------------------------------
        # Node counts
        # ----------------------------------

        counts = client.execute_query(
            """
            MATCH (n)
            RETURN
                labels(n) AS labels,
                count(*) AS count
            ORDER BY count DESC
            """
        )

        print("\nNODE COUNTS")
        print("=" * 60)

        for row in counts:
            print(
                f"{row['labels']}: {row['count']}"
            )

        # ----------------------------------
        # Sample Methods
        # ----------------------------------

        methods = client.execute_query(
            """
            MATCH (m:Method)
            RETURN
                m.id AS id,
                m.name AS name,
                m.summary AS summary
            LIMIT 10
            """
        )

        print("\nMETHODS")
        print("=" * 60)

        for method in methods:
            print(f"\nID      : {method['id']}")
            print(f"Name    : {method['name']}")
            print(f"Summary : {method['summary']}")

        # ----------------------------------
        # Sample Classes
        # ----------------------------------

        classes = client.execute_query(
            """
            MATCH (c:Class)
            RETURN
                c.id AS id,
                c.name AS name,
                c.summary AS summary
            LIMIT 10
            """
        )

        print("\nCLASSES")
        print("=" * 60)

        for cls in classes:
            print(f"\nID      : {cls['id']}")
            print(f"Name    : {cls['name']}")
            print(f"Summary : {cls['summary']}")

        # ----------------------------------
        # Sample Commits
        # ----------------------------------

        commits = client.execute_query(
            """
            MATCH (c:Commit)
            RETURN
                c.hash AS hash,
                c.message AS message,
                c.intent AS intent
            ORDER BY c.timestamp DESC
            LIMIT 10
            """
        )

        print("\nCOMMITS")
        print("=" * 60)

        for commit in commits:
            print(f"\nHash    : {commit['hash']}")
            print(f"Message : {commit['message']}")
            print(f"Intent  : {commit['intent']}")

    finally:
        client.close()


if __name__ == "__main__":
    main()