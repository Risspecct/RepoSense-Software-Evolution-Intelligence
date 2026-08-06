from tree_sitter import Tree

from app.analysis.base_analyzer import BaseAnalyzer
from app.analysis.models.analysis_result import AnalysisResult


class JavaAnalyzer(BaseAnalyzer):
    """
    Performs semantic analysis on Java syntax trees.
    """

    def analyze(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> AnalysisResult:

        result = AnalysisResult()

        result.package = self._extract_package(
            tree,
            source_code,
        )

        return result

    def _extract_package(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> str | None:

        root = tree.root_node

        for child in root.children:

            if child.type != "package_declaration":
                continue

            return (
                source_code[
                    child.start_byte : child.end_byte
                ]
                .decode("utf-8")
                .replace("package", "")
                .replace(";", "")
                .strip()
            )

        return None
