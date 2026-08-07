from app.graph.neo4j_client import Neo4jClient
from app.graph.query.graph_query_service import GraphQueryService


def main() -> None:
    client = Neo4jClient()

    try:
        client.connect()

        service = GraphQueryService(client)
        class_id = input("Enter class id: ").strip()

        if not class_id:
            print("Class id is required.")
            return

        history = service.get_class_history(class_id)

        print("=" * 56)
        print("CLASS HISTORY")
        print("=" * 56)
        print()

        if not history:
            print(f"No history found for class: {class_id}")
            return

        for item in history:
            print(f"Class  : {class_id}")
            print()
            print(f"Commit : {item['message']}")
            print(f"Author : {item['author']}")
            print(f"Email  : {item['email']}")
            print(f"Date   : {item['timestamp']}")
            print(f"File   : {item['file_path']}")
            print()
            print("-" * 56)
            print()

    finally:
        client.close()


if __name__ == "__main__":
    main()
