from pathlib import Path

from git import Repo

from app.github.models.commit_info import CommitInfo


class GitHistoryExtractor:

    def extract(self, repository_path: Path, limit: int = 50,) -> list[CommitInfo]:
        repo = Repo(repository_path)
        commits = []

        for commit in repo.iter_commits(max_count=limit):
            commit_info = CommitInfo(
                hash=commit.hexsha,
                author=commit.author.name,
                email=commit.author.email,
                message=commit.message.strip(),
                timestamp=commit.committed_datetime,
                modified_files=list(commit.stats.files.keys())
            )
            commits.append(commit_info)

        return commits
