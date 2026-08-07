from pathlib import Path

from git import Repo
from git.objects.commit import Commit

from app.github.models.commit_info import CommitInfo


class GitHistoryExtractor:

    def extract(
        self,
        repository_path: Path,
        limit: int = 50,
    ) -> list[CommitInfo]:
        repo = Repo(repository_path)

        commits: list[CommitInfo] = []

        for commit in repo.iter_commits(
            max_count=limit,
        ):
            commits.append(
                self._build_commit_info(commit)
            )

        return commits

    def _build_commit_info(
        self,
        commit: Commit,
    ) -> CommitInfo:

        return CommitInfo(
            hash=commit.hexsha,
            author=commit.author.name or "",
            email=commit.author.email or "",
            message=commit.message.strip(),
            timestamp=commit.committed_datetime,
            modified_files=list(
                commit.stats.files.keys()
            ),
            file_diffs=self._extract_file_diffs(
                commit,
            ),
        )

    def _extract_file_diffs(
        self,
        commit: Commit,
    ) -> dict[str, str]:
        """
        Extract textual patches for files modified by a commit.

        Root commits are compared against an empty tree.
        Normal commits are compared against their first parent.
        """

        if commit.parents:
            diffs = commit.parents[0].diff(
                commit,
                create_patch=True,
            )
        else:
            diffs = commit.diff(
                None,
                create_patch=True,
            )

        file_diffs: dict[str, str] = {}

        for diff in diffs:
            file_path = (
                diff.b_path
                or diff.a_path
            )

            if not file_path:
                continue

            patch = self._decode_patch(
                diff.diff,
            )

            if not patch:
                continue

            file_diffs[file_path] = patch

        return file_diffs

    @staticmethod
    def _decode_patch(
        patch: bytes | str | None,
    ) -> str:
        if patch is None:
            return ""

        if isinstance(patch, str):
            return patch

        return patch.decode(
            "utf-8",
            errors="replace",
        )