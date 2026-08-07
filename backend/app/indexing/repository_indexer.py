from pathlib import Path

from app.analysis.analyzer_factory import AnalyzerFactory
from app.graph.neo4j_client import Neo4jClient
from app.graph.graph_builder import GraphBuilder
from app.graph.graph_writer import GraphWriter
from app.graph.models.graph_document import GraphDocument
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

    def index(
        self,
        repository_path: Path,
    ) -> None:
        """
        Index an entire repository into Neo4j.
        """

        graph = GraphDocument()

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

            file_graph = self.builder.build(
                analysis,
            )

            graph.merge(file_graph)

        self.client.connect()

        try:
            self.writer.write(graph)

        finally:
            self.client.close()