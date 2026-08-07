from app.analysis.java_analyzer import JavaAnalyzer
from app.graph.graph_builder import GraphBuilder
from app.graph.models import GraphDocument
from app.graph.graph_writer import GraphWriter
from app.parsers.parser_factory import ParserFactory
from app.ingestion.file_scanner import FileScanner


class IngestionService:

    def __init__(self):
        self.scanner = FileScanner()
        self.parser_factory = ParserFactory()
        self.analyzer = JavaAnalyzer()
        self.graph_builder = GraphBuilder()
        self.graph_writer = GraphWriter()

    def ingest(self, repository_path: str) -> None:
        source_files = self.scanner.scan(repository_path)

        repository_graph = GraphDocument()

        for source_file in source_files:

            parser = self.parser_factory.get_parser(source_file.language)

            syntax_tree = parser.parse(source_file)

            analysis_result = self.analyzer.analyze(syntax_tree)

            graph = self.graph_builder.build(analysis_result)

            repository_graph.merge(graph)

        self.graph_writer.write(repository_graph)
