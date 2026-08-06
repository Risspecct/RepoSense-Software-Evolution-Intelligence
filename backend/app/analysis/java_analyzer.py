from tree_sitter import Tree

from app.analysis.base_analyzer import BaseAnalyzer
from app.analysis.models.analysis_result import AnalysisResult
from app.analysis.models.class_info import ClassInfo


class JavaAnalyzer(BaseAnalyzer):
    """
    Performs semantic analysis on Java syntax trees.
    """

    def analyze(self, tree: Tree, source_code: bytes,) -> AnalysisResult:
        result = AnalysisResult()

        result.package = self._extract_package(
            tree,
            source_code,
        )

        result.imports = self._extract_imports(
            tree,
            source_code,
        )

        result.classes = self._extract_classes(
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
                    child.start_byte:child.end_byte
                ]
                .decode("utf-8")
                .replace("package", "")
                .replace(";", "")
                .strip()
            )

        return None

    def _extract_imports(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> list[str]:

        imports: list[str] = []

        root = tree.root_node

        for child in root.children:

            if child.type != "import_declaration":
                continue

            import_name = (
                source_code[
                    child.start_byte:child.end_byte
                ]
                .decode("utf-8")
                .replace("import", "")
                .replace(";", "")
                .strip()
            )

            imports.append(import_name)

        return imports

    def _extract_classes(self, tree: Tree, source_code: bytes,) -> list[ClassInfo]:
        """
        Extract Java class, interface, enum and record declarations.
        """
        return []
