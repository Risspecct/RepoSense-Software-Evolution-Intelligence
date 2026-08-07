from app.analysis.java_analyzer import JavaAnalyzer
from app.models.source_file import ProgrammingLanguage


class AnalyzerFactory:
    """
    Returns the appropriate analyzer for a programming language.
    """

    def __init__(self) -> None:
        self.analyzers = {
            ProgrammingLanguage.JAVA: JavaAnalyzer(),
        }

    def get_analyzer(
        self,
        language: ProgrammingLanguage,
    ):
        analyzer = self.analyzers.get(language)

        if analyzer is None:
            raise ValueError(
                f"No analyzer registered for {language}"
            )

        return analyzer
