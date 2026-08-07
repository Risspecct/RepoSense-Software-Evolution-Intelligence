import os
import shutil
import stat
from pathlib import Path

from app.config import settings
from app.graph.neo4j_client import Neo4jClient
from app.indexing.repository_indexer import RepositoryIndexer
from app.ingestion.repository_manager import RepositoryManager
from app.github.git_history_extractor import GitHistoryExtractor
from app.intelligence.commit_analysis_service import CommitAnalysisService

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
        self.commit_extractor = GitHistoryExtractor()

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
        
    def update_repository(
        self,
        repository_url: str,
    ) -> dict:
        """
        Pull new commits for an already indexed repository and
        process only the newly introduced commits.

        This method does not perform initial indexing. If the repository
        has not previously been cloned, the caller should use
        index_repository() first.
        """

        repository_info, old_head, new_head = (
            self.repository_manager.update(
                repository_url,
            )
        )

        if old_head is None:
            raise RuntimeError(
                "Repository has not been indexed yet. "
                "Run initial indexing first."
            )

        if old_head == new_head:
            return {
                "repository": repository_info.name,
                "updated": False,
                "new_commits": 0,
            }

        repository_path = Path(
            repository_info.local_path,
        )

        commits = self.commit_extractor.extract_between(
            repository_path=repository_path,
            old_head=old_head,
            new_head=new_head,
        )

        if not commits:
            return {
                "repository": repository_info.name,
                "updated": False,
                "new_commits": 0,
            }

        self._process_new_commits(
            repository_path=repository_path,
            commits=commits,
        )

        return {
            "repository": repository_info.name,
            "updated": True,
            "new_commits": len(commits),
        }
    
    def _process_new_commits(
        self,
        repository_path: Path,
        commits: list,
    ) -> None:
        """
        Process newly pulled commits.

        The detailed structural graph refresh is delegated to the
        RepositoryIndexer so parsing/analyzer logic is not duplicated
        in RepositoryService.
        """

        self.indexer.update(
            repository_path=repository_path,
            commits=commits,
        )