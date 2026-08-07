from pathlib import Path

from app.graph.neo4j_client import neo4j_client
from app.indexing.repository_indexer import RepositoryIndexer

indexer = RepositoryIndexer(neo4j_client)

indexer.index(
    Path("data/repositories/LifeOS"),
)

print("Repository indexed successfully!")