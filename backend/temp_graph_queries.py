from pprint import pprint

from app.graph.neo4j_client import neo4j_client
from app.graph.query.graph_query_service import GraphQueryService


DEMO_CLASS_NAMES = [
    "UserService",
    "BranchService",
    "User",
]

DEMO_METHOD_NAME = "getAuthorities"


def _print_section(
    title: str,
    value,
) -> None:
    print(f"\n=== {title} ===")
    pprint(value)


def _find_demo_class(
    service: GraphQueryService,
) -> dict | None:
    for class_name in DEMO_CLASS_NAMES:
        class_node = service.find_class(class_name)

        if class_node is not None:
            return class_node

    return None


def main() -> None:
    neo4j_client.connect()

    try:
        service = GraphQueryService(neo4j_client)

        class_node = _find_demo_class(service)

        _print_section(
            "find_class",
            class_node,
        )

        methods = service.find_method(
            DEMO_METHOD_NAME,
        )
        _print_section(
            "find_method",
            methods,
        )

        if class_node is None:
            print(
                "\nNo demo class was found in Neo4j. "
                "Skipping class-specific queries."
            )
            return

        class_id = class_node["id"]

        _print_section(
            "get_class_methods",
            service.get_class_methods(class_id),
        )
        _print_section(
            "get_class_fields",
            service.get_class_fields(class_id),
        )
        _print_section(
            "get_dependencies",
            service.get_dependencies(class_id),
        )
        _print_section(
            "get_dependents",
            service.get_dependents(class_id),
        )

    finally:
        neo4j_client.close()


if __name__ == "__main__":
    main()
