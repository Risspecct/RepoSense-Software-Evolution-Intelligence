from pathlib import Path
from urllib.parse import urlparse

from git import GitCommandError, Repo

from app.config import settings
from app.models.repository import RepositoryInfo


class RepositoryManager:
    """
    Handles cloning and updating GitHub repositories.
    """

    def __init__(self) -> None:
        self.repository_root = Path(settings.REPOSITORY_STORAGE)
        self.repository_root.mkdir(parents=True, exist_ok=True)

    def connect(self, repository_url: str) -> RepositoryInfo:
        """
        Clone a repository if it does not exist locally.
        Otherwise, pull the latest changes.

        Args:
            repository_url: GitHub repository URL.

        Returns:
            RepositoryInfo containing repository metadata.
        """
        owner, repository_name = self._extract_repository_info(repository_url)

        repository_path = self._get_repository_path(repository_name)

        if repository_path.exists():
            self._pull(repository_path)
        else:
            self._clone(repository_url, repository_path)

        repo = Repo(repository_path)

        return RepositoryInfo(
            name=repository_name,
            owner=owner,
            branch=repo.active_branch.name,
            local_path=repository_path.as_posix(),
        )

    def _extract_repository_info(
        self,
        repository_url: str,
    ) -> tuple[str, str]:
        """
        Extract the repository owner and name from a GitHub URL.

        Raises:
            ValueError: If the URL is not a valid GitHub repository URL.
        """
        parsed_url = urlparse(repository_url)

        if parsed_url.netloc not in {"github.com", "www.github.com"}:
            raise ValueError("Only GitHub repositories are currently supported.")

        path_parts = parsed_url.path.strip("/").split("/")

        if len(path_parts) < 2:
            raise ValueError("Invalid GitHub repository URL.")

        owner = path_parts[0]
        repository_name = path_parts[1].removesuffix(".git")

        return owner, repository_name

    def _get_repository_path(self, repository_name: str) -> Path:
        """
        Returns the local path for the repository.
        """
        return self.repository_root / repository_name

    def _clone(
        self,
        repository_url: str,
        repository_path: Path,
    ) -> None:
        """
        Clone a repository.

        Raises:
            RuntimeError: If cloning fails.
        """
        try:
            Repo.clone_from(repository_url, repository_path)

        except GitCommandError as e:
            raise RuntimeError(
                f"Failed to clone repository: {e}"
            ) from e

    def _pull(
        self,
        repository_path: Path,
    ) -> None:
        """
        Pull the latest changes for an existing repository.

        Raises:
            RuntimeError: If pull fails.
        """
        try:
            repo = Repo(repository_path)
            repo.remotes.origin.pull()

        except GitCommandError as e:
            raise RuntimeError(
                f"Failed to update repository: {e}"
            ) from e
