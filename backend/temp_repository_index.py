from app.graph.neo4j_client import neo4j_client
from app.repository.repository_service import RepositoryService


def main() -> None:
    service = RepositoryService(
        neo4j_client,
    )
    service.index_repository(
        "https://github.com/Risspecct/LifeOS"
    )
    print("Repository indexed successfully!")


if __name__ == "__main__":
    main()
