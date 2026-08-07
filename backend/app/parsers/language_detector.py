from pathlib import Path

from app.models.source_file import ProgrammingLanguage


class LanguageDetector:
    """
    Detects the programming language of a source file
    based on its file extension.
    """

    EXTENSION_MAP = {
        ".java": ProgrammingLanguage.JAVA,
        ".py": ProgrammingLanguage.PYTHON,
        ".js": ProgrammingLanguage.JAVASCRIPT,
        ".ts": ProgrammingLanguage.TYPESCRIPT,
    }

    def detect_language(self, file_path: Path) -> ProgrammingLanguage:
        """
        Detect the programming language of a file.

        Args:
            file_path: Path to the source file.

        Returns:
            ProgrammingLanguage
        """
        return self.EXTENSION_MAP.get(
            file_path.suffix.lower(),
            ProgrammingLanguage.UNKNOWN,
        )
