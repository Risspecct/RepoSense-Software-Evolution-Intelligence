from app.graph.neo4j_client import Neo4jClient
from app.graph.query.graph_query_service import GraphQueryService
from app.intelligence.gemini_client import GeminiClient
from app.intelligence.summary_service import SummaryService
from app.intelligence.commit_analysis_service import CommitAnalysisService
from app.github.models.commit_info import CommitInfo


def seed_test_graph(client: Neo4jClient) -> None:
    """
    Create a small controlled graph for testing AI enrichment.
    """

    print("\n[1] Clearing existing test graph...")

    client.execute_query(
        """
        MATCH (n)
        DETACH DELETE n
        """
    )

    print("[2] Creating test File/Class/Method nodes...")

    client.execute_query(
        """
        CREATE (f:File {
            path: 'src/main/java/com/example/UserService.java'
        })

        CREATE (c:Class {
            id: 'com.example.UserService',
            name: 'UserService',
            type: 'class',
            modifiers: ['public'],
            annotations: []
        })

        CREATE (m1:Method {
            id: 'com.example.UserService.createUser',
            name: 'createUser',
            modifiers: ['public'],
            annotations: [],
            is_constructor: false,
            parameter_names: ['name', 'email'],
            parameter_types: ['String', 'String'],
            return_type: 'User'
        })

        CREATE (m2:Method {
            id: 'com.example.UserService.deleteUser',
            name: 'deleteUser',
            modifiers: ['public'],
            annotations: [],
            is_constructor: false,
            parameter_names: ['userId'],
            parameter_types: ['Long'],
            return_type: 'void'
        })

        CREATE (f)-[:CONTAINS]->(c)
        CREATE (c)-[:DECLARES]->(m1)
        CREATE (c)-[:DECLARES]->(m2)
        """
    )

    print("[3] Creating historical Commit node...")

    client.execute_query(
        """
        MATCH (f:File {
            path: 'src/main/java/com/example/UserService.java'
        })

        CREATE (commit:Commit {
            hash: 'abc123',
            message: 'Add user management service',
            author: 'Test Developer',
            email: 'test@example.com',
            timestamp: '2026-08-01T10:00:00'
        })

        CREATE (commit)-[:MODIFIED]->(f)
        """
    )


def print_method_summaries(
    client: Neo4jClient,
) -> None:
    rows = client.execute_query(
        """
        MATCH (m:Method)
        RETURN
            m.id AS id,
            m.summary AS summary
        ORDER BY m.id
        """
    )

    print("\nMETHOD SUMMARIES")
    print("=" * 70)

    for row in rows:
        print(f"\n{row['id']}")
        print(f"  {row['summary']}")


def print_class_summary(
    client: Neo4jClient,
) -> None:
    rows = client.execute_query(
        """
        MATCH (c:Class {
            id: 'com.example.UserService'
        })
        RETURN c.summary AS summary
        """
    )

    print("\nCLASS SUMMARY")
    print("=" * 70)

    if rows:
        print(rows[0]["summary"])


def print_commit_intent(
    client: Neo4jClient,
) -> None:
    rows = client.execute_query(
        """
        MATCH (c:Commit {
            hash: 'abc123'
        })
        RETURN c.intent AS intent
        """
    )

    print("\nCOMMIT INTENT")
    print("=" * 70)

    if rows:
        print(rows[0]["intent"])


def verify_results(
    client: Neo4jClient,
) -> None:
    print("\nVERIFYING RESULTS")
    print("=" * 70)

    methods = client.execute_query(
        """
        MATCH (m:Method)
        RETURN
            m.id AS id,
            m.summary AS summary
        """
    )

    assert len(methods) == 2, (
        f"Expected 2 Methods, found {len(methods)}"
    )

    for method in methods:
        assert method["summary"], (
            f"Method {method['id']} has no summary."
        )

    print("[PASS] Both Methods have summaries.")

    classes = client.execute_query(
        """
        MATCH (c:Class {
            id: 'com.example.UserService'
        })
        RETURN c.summary AS summary
        """
    )

    assert classes, "UserService Class was not found."

    assert classes[0]["summary"], (
        "UserService has no summary."
    )

    print("[PASS] Class has a summary.")

    commits = client.execute_query(
        """
        MATCH (c:Commit {
            hash: 'abc123'
        })
        RETURN c.intent AS intent
        """
    )

    assert commits, "Test Commit was not found."

    assert commits[0]["intent"], (
        "Historical Commit has no intent."
    )

    print("[PASS] Historical Commit has an intent.")


def main():
    client = Neo4jClient()

    print("=" * 70)
    print("RepoSense AI + Neo4j Integration Test")
    print("=" * 70)

    try:
        # ----------------------------------
        # Connect
        # ----------------------------------

        print("\nConnecting to Neo4j...")

        client.connect()

        assert client.is_connected()

        print("[PASS] Neo4j connection successful.")

        # ----------------------------------
        # Seed controlled graph
        # ----------------------------------

        seed_test_graph(client)

        graph_query_service = GraphQueryService(
            client,
        )

        gemini_client = GeminiClient()

        summary_service = SummaryService(
            graph_query_service=graph_query_service,
            gemini_client=gemini_client,
        )

        commit_analysis_service = CommitAnalysisService(
            graph_query_service=graph_query_service,
            gemini_client=gemini_client,
            summary_service=summary_service,
        )

        # ----------------------------------
        # Test summaries
        # ----------------------------------

        print(
            "\n[4] Running SummaryService..."
        )

        summary_service.summarize_repository()

        print_method_summaries(client)
        print_class_summary(client)

        # ----------------------------------
        # Test historical intent
        # ----------------------------------

        print(
            "\n[5] Running historical commit intent generation..."
        )

        test_commit = CommitInfo(
            hash="abc123",
            message="Add user management service",
            author="Test Developer",
            email="test@example.com",
            timestamp="2026-08-01T10:00:00",
            modified_files=[
                "src/main/java/com/example/UserService.java"
            ],
            file_diffs={
                "src/main/java/com/example/UserService.java": """
+ public class UserService {
+
+     public User createUser(String name, String email) {
+         return repository.save(
+             new User(name, email)
+         );
+     }
+
+     public void deleteUser(Long userId) {
+         repository.deleteById(userId);
+     }
+ }
""".strip()
            },
        )

        commit_analysis_service.generate_historical_intents(
            [test_commit],
        )

        print_commit_intent(client)

        # ----------------------------------
        # Verify
        # ----------------------------------

        verify_results(client)

        print("\n" + "=" * 70)
        print("ALL INITIAL AI + NEO4J TESTS PASSED")
        print("=" * 70)

    except Exception as exc:
        print("\n" + "=" * 70)
        print("TEST FAILED")
        print("=" * 70)

        print(f"\nError type: {type(exc).__name__}")
        print(f"Error: {exc}")

        raise

    finally:
        client.close()
        print("\nNeo4j connection closed.")


if __name__ == "__main__":
    main()