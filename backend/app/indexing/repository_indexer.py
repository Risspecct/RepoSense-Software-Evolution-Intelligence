from pathlib import Path

from app.analysis.analyzer_factory import AnalyzerFactory
from app.github.commit_graph_builder import CommitGraphBuilder
from app.github.git_history_extractor import GitHistoryExtractor
from app.graph.graph_builder import GraphBuilder
from app.graph.graph_writer import GraphWriter
from app.graph.models.graph_document import GraphDocument
from app.graph.neo4j_client import Neo4jClient
from app.ingestion.file_scanner import FileScanner
from app.models.source_file import ProgrammingLanguage, SourceFile
from app.parsers.parser_factory import ParserFactory


class RepositoryIndexer:
    """
    Indexes an entire repository into Neo4j.
    """

    def __init__(
        self,
        client: Neo4jClient,
    ) -> None:
        self.client = client

        self.scanner = FileScanner()
        self.parser_factory = ParserFactory()
        self.analyzer_factory = AnalyzerFactory()

        self.builder = GraphBuilder()
        self.writer = GraphWriter(client)

        self.commit_extractor = GitHistoryExtractor()
        self.commit_builder = CommitGraphBuilder()

    def index(
        self,
        repository_path: Path,
    ) -> None:
        """
        Index an entire repository into Neo4j.
        """

        graph = GraphDocument()

        analyses = []

        files = self.scanner.scan(repository_path)

        for file in files:

            if file.suffix != ".java":
                continue

            source_file = SourceFile(
                path=file.as_posix(),
                language=ProgrammingLanguage.JAVA,
                size=file.stat().st_size,
            )

            parser = self.parser_factory.get_parser(
                source_file.language,
            )

            tree = parser.parse(source_file)

            with open(source_file.path, "rb") as source:
                source_code = source.read()

            analyzer = self.analyzer_factory.get_analyzer(
                source_file.language,
            )

            analysis = analyzer.analyze(
                tree,
                source_code,
            )

            analyses.append(analysis)

        symbol_index = self._build_symbol_index(
            analyses,
        )

        # ----------------------------------
        # Build structural graph
        # ----------------------------------

        for analysis in analyses:

            file_graph = self.builder.build(
                analysis,
                symbol_index=symbol_index,
            )

            graph.merge(file_graph)

        # ----------------------------------
        # Build commit graph
        # ----------------------------------

        commits = self.commit_extractor.extract(
            repository_path,
        )

        commit_graph = self.commit_builder.build(
            commits,
        )

        graph.merge(commit_graph)

        # ----------------------------------
        # Persist graph
        # ----------------------------------

        self.client.connect()

        try:
            self.writer.write(graph)

        finally:
            self.client.close()

    def _build_symbol_index(
        self,
        analyses: list,
    ) -> dict[str, str]:

        symbol_index: dict[str, str] = {}

        for analysis in analyses:

            if analysis.package is None:
                continue

            for cls in analysis.classes:

                class_id = (
                    f"{analysis.package}.{cls.name}"
                )

                symbol_index[class_id] = class_id

        return symbol_index
