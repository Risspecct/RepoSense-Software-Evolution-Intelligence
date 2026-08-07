import os
import shutil
import stat
from pathlib import Path

from app.config import settings
from app.graph.neo4j_client import Neo4jClient
from app.indexing.repository_indexer import RepositoryIndexer
from app.ingestion.repository_manager import RepositoryManager


class RepositoryService:

    def __init__(
        self,
        client: Neo4jClient,
    ) -> None:
        self.client = client
        self.repository_manager = RepositoryManager()
        self.indexer = RepositoryIndexer(client)
        self.repository_root = Path(
            settings.REPOSITORY_STORAGE
        )
        self.repository_root.mkdir(
            parents=True,
            exist_ok=True,
        )

    def index_repository(
        self,
        repository_url: str,
    ) -> str:
        _, repository_name = (
            self.repository_manager._extract_repository_info(
                repository_url,
            )
        )
        repository_path = self.repository_manager._get_repository_path(
            repository_name,
        )

        if repository_path.exists():
            self._remove_repository_path(
                repository_path,
            )

        try:
            self.repository_manager._clone(
                repository_url,
                repository_path,
            )
            self._clear_graph()

            self.indexer.index(repository_path)
            self.client.connect()

        except Exception:
            self.client.close()
            raise

        return repository_name

    def _clear_graph(
        self,
    ) -> None:
        self.client.connect()

        try:
            self.client.execute_query(
                """
                MATCH (n)
                DETACH DELETE n
                """
            )
        finally:
            self.client.close()

    def _remove_repository_path(
        self,
        repository_path: Path,
    ) -> None:
        try:
            shutil.rmtree(
                repository_path,
                onerror=self._handle_remove_readonly,
            )
        except OSError as error:
            raise RuntimeError(
                f"Failed to remove existing repository: {error}"
            ) from error

    def _handle_remove_readonly(
        self,
        func,
        path: str,
        exc_info,
    ) -> None:
        if not os.path.exists(path):
            return

        os.chmod(
            path,
            stat.S_IWRITE,
        )
        func(path)
