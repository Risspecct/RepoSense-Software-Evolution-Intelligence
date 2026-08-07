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
from app.graph.query.graph_query_service import GraphQueryService
from app.intelligence.gemini_client import GeminiClient
from app.intelligence.summary_service import SummaryService
from app.intelligence.commit_analysis_service import CommitAnalysisService

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
        
        self.graph_query_service = GraphQueryService(client)
        self.gemini_client = GeminiClient()

        self.summary_service = SummaryService(
            graph_query_service=self.graph_query_service,
            gemini_client=self.gemini_client,
        )
        self.commit_analysis_service = CommitAnalysisService(
            graph_query_service=self.graph_query_service,
            gemini_client=self.gemini_client,
            summary_service=self.summary_service,
        )

        self.commit_extractor = GitHistoryExtractor()
        self.commit_builder = CommitGraphBuilder()

    def _build_structural_graph(
        self,
        repository_path: Path,
    ) -> GraphDocument:
        """
        Parse the repository's current source state and build
        the structural Class/Method/File graph.
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

            analysis.file_path = (
                file.relative_to(repository_path).as_posix()
            )

            analyses.append(analysis)

        symbol_index = self._build_symbol_index(
            analyses,
        )

        for analysis in analyses:
            file_graph = self.builder.build(
                analysis,
                symbol_index=symbol_index,
            )

            graph.merge(file_graph)

        return graph
    
    def update(
        self,
        repository_path: Path,
        commits: list,
    ) -> None:
        """
        Process newly introduced commits for an already indexed repository.

        For each new commit:
        1. Persist its Commit node and MODIFIED relationships.
        2. Analyze its intent and semantic significance.
        3. Update significant Method summaries.
        4. Regenerate affected Class summaries.

        After commit intelligence has been processed, refresh the current
        structural graph from the repository's latest source state.
        """

        if not commits:
            return

        # Build graph containing only the newly introduced commits.
        commit_graph = self.commit_builder.build(
            commits,
        )

        self.client.connect()

        try:
            # Persist new Commit nodes before AI analysis so intent can
            # be written back to those nodes.
            self.writer.write(commit_graph)

            for commit in commits:
                self.commit_analysis_service.analyze_commit(
                    commit,
                )

        finally:
            self.client.close()
    def _build_structural_graph(
        self,
        repository_path: Path,
    ) -> GraphDocument:
        """
        Parse the repository's current source state and build
        the structural Class/Method/File graph.
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

            analysis.file_path = (
                file.relative_to(repository_path).as_posix()
            )

            analyses.append(analysis)

        symbol_index = self._build_symbol_index(
            analyses,
        )

        for analysis in analyses:
            file_graph = self.builder.build(
                analysis,
                symbol_index=symbol_index,
            )

            graph.merge(file_graph)

        return graph        
    
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
