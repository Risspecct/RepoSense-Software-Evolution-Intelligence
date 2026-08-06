from pathlib import Path

from app.ingestion.file_scanner import FileScanner
from app.ingestion.repository_manager import RepositoryManager
from app.models.source_file import SourceFile
from app.parsers.language_detector import LanguageDetector


class RepositoryService:
    def __init__(self) -> None:
        self.repo_cloner = RepositoryManager()
        self.file_scanner = FileScanner()
        self.language_detector = LanguageDetector()

    def connect(self, repository_url: str):
        return self.repo_cloner.connect(repository_url)

    def discover_files(self, repository_path: Path) -> list[SourceFile]:
        paths = self.file_scanner.scan(Path(repository_path))

        source_files: list[SourceFile] = []

        for path in paths:
            source_files.append(
                SourceFile(
                    path=path.as_posix(),
                    language=self.language_detector.detect_language(path),
                    size=path.stat().st_size,
                )
            )

        return source_files
