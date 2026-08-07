from pathlib import Path


class FileScanner:
    """
    Scans a repository and discovers source files.
    """

    EXCLUDED_DIRECTORIES = {
        ".git",
        ".idea",
        ".vscode",
        "node_modules",
        "target",
        "build",
        "dist",
        "__pycache__",
        ".venv",
        "venv",
    }

    def scan(self, repository_path: Path) -> list[Path]:
        """
        Recursively scans a repository and returns all files.
        """
        source_files: list[Path] = []

        for path in repository_path.rglob("*"):
            if not path.is_file():
                continue

            if any(
                part in self.EXCLUDED_DIRECTORIES
                for part in path.parts
            ):
                continue

            source_files.append(path)

        return source_files
