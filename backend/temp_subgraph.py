from app.graph.neo4j_client import neo4j_client
from app.graph.query.subgraph_service import SubgraphService


CLASS_ID = "users.java.LifeOS.user.UserService"


def main() -> None:
    neo4j_client.connect()

    try:
        service = SubgraphService(
            neo4j_client,
        )
        graph = service.get_class_subgraph(
            CLASS_ID,
        )

        print("Nodes")
        for node in graph.nodes:
            print(
                f"{node.label.value}: {node.id}"
            )

        print("\nRelationships")
        for relationship in graph.relationships:
            print(
                f"{relationship.source} -[{relationship.type.value}]-> {relationship.target}"
            )

        print("\nCounts")
        print(f"Nodes: {len(graph.nodes)}")
        print(
            f"Relationships: {len(graph.relationships)}"
        )

    finally:
        neo4j_client.close()


if __name__ == "__main__":
    main()
