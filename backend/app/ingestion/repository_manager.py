from pathlib import Path
from urllib.parse import urlparse
import shutil

from git import Repo
from git.exc import GitCommandError, InvalidGitRepositoryError

from app.config import settings
from app.models.repository import RepositoryInfo


class RepositoryManager:
    """
    Handles cloning and updating GitHub repositories.
    """

    def __init__(self) -> None:
        self.repository_root = Path(settings.REPOSITORY_STORAGE)
        self.repository_root.mkdir(
            parents=True,
            exist_ok=True,
        )

    def connect(
        self,
        repository_url: str,
    ) -> RepositoryInfo:
        """
        Clone a repository if it does not exist locally.
        Otherwise, pull the latest changes.
        If the local repository is corrupted, delete it and clone again.
        """

        owner, repository_name = self._extract_repository_info(
            repository_url,
        )

        repository_path = self._get_repository_path(
            repository_name,
        )

        if repository_path.exists():
            try:
                # Validate that this is actually a Git repository
                Repo(repository_path)

                # Pull latest changes
                self._pull(repository_path)

            except InvalidGitRepositoryError:
                print(
                    f"Invalid repository detected at "
                    f"{repository_path}. Re-cloning..."
                )

                shutil.rmtree(repository_path)

                self._clone(
                    repository_url,
                    repository_path,
                )

        else:
            self._clone(
                repository_url,
                repository_path,
            )

        repo = Repo(repository_path)

        return RepositoryInfo(
            name=repository_name,
            owner=owner,
            branch=repo.active_branch.name,
            local_path=repository_path.as_posix(),
        )

    def update(
        self,
        repository_url: str,
    ) -> tuple[RepositoryInfo, str | None, str]:
        """
        Update an existing repository and return the Git state
        before and after the pull.

        Returns:
            repository_info
            old_head
            new_head

        old_head is None when the repository did not previously exist.
        """

        owner, repository_name = self._extract_repository_info(
            repository_url,
        )

        repository_path = self._get_repository_path(
            repository_name,
        )

        old_head: str | None = None

        if repository_path.exists():
            repo = Repo(repository_path)
            old_head = repo.head.commit.hexsha

            self._pull(repository_path)

        else:
            self._clone(
                repository_url,
                repository_path,
            )

        repo = Repo(repository_path)
        new_head = repo.head.commit.hexsha

        repository_info = RepositoryInfo(
            name=repository_name,
            owner=owner,
            branch=repo.active_branch.name,
            local_path=repository_path.as_posix(),
        )

        return (
            repository_info,
            old_head,
            new_head,
        )
    
    def _extract_repository_info(
        self,
        repository_url: str,
    ) -> tuple[str, str]:
        parsed_url = urlparse(repository_url)

        if parsed_url.netloc not in {
            "github.com",
            "www.github.com",
        }:
            raise ValueError(
                "Only GitHub repositories are currently supported."
            )

        path_parts = parsed_url.path.strip("/").split("/")

        if len(path_parts) < 2:
            raise ValueError(
                "Invalid GitHub repository URL."
            )

        owner = path_parts[0]
        repository_name = path_parts[1].removesuffix(".git")

        return owner, repository_name

    def _get_repository_path(
        self,
        repository_name: str,
    ) -> Path:
        return self.repository_root / repository_name

    def _clone(
        self,
        repository_url: str,
        repository_path: Path,
    ) -> None:
        try:
            print(f"Cloning repository: {repository_url}")

            Repo.clone_from(
                repository_url,
                repository_path,
            )

            print("Repository cloned successfully.")

        except GitCommandError as error:
            raise RuntimeError(
                f"Failed to clone repository: {error}"
            ) from error

    def _pull(
        self,
        repository_path: Path,
    ) -> None:
        try:
            repo = Repo(repository_path)

            origin = repo.remotes.origin

            print(
                f"Pulling latest changes for "
                f"{repository_path.name}"
            )

            origin.pull()

        except InvalidGitRepositoryError:
            raise

        except GitCommandError as error:
            raise RuntimeError(
                f"Failed to update repository: {error}"
            ) from error