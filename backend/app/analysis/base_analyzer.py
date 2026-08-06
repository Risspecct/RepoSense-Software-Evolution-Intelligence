from abc import ABC, abstractmethod

from tree_sitter import Tree

from app.analysis.models.analysis_result import AnalysisResult


class BaseAnalyzer(ABC):
    """
    Base contract for all language analyzers.
    """

    @abstractmethod
    def analyze(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> AnalysisResult:
        """
        Analyze a syntax tree and return semantic information.
        """
        pass
