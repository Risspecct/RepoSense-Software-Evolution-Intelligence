from tree_sitter import Tree

from app.analysis.base_analyzer import BaseAnalyzer
from app.analysis.models.analysis_result import AnalysisResult
from app.analysis.models.class_info import ClassInfo, ClassType


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

    def _extract_classes(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> list[ClassInfo]:

        classes: list[ClassInfo] = []

        declaration_types = {
            "class_declaration": ClassType.CLASS,
            "interface_declaration": ClassType.INTERFACE,
            "enum_declaration": ClassType.ENUM,
            "record_declaration": ClassType.RECORD,
        }

        for node in tree.root_node.children:

            class_type = declaration_types.get(node.type)

            if class_type is None:
                continue

            class_info = ClassInfo(
                name="",
                type=class_type,
            )

            #
            # Walk children of the declaration
            #
            for child in node.children:

                #
                # Class name
                #
                if child.type == "identifier":

                    class_info.name = (
                        source_code[
                            child.start_byte:child.end_byte
                        ]
                        .decode("utf-8")
                    )

                #
                # Modifiers + annotations
                #
                elif child.type == "modifiers":
                            
                    modifiers: set[str] = set()
                    annotations: set[str] = set()

                    for modifier in child.children:
                    
                        text = (
                            source_code[
                                modifier.start_byte:modifier.end_byte
                            ]
                            .decode("utf-8")
                            .strip()
                        )

                        if modifier.type in (
                            "annotation",
                            "marker_annotation",
                        ):
                            annotations.add(text)

                        elif text in {
                            "public",
                            "private",
                            "protected",
                            "static",
                            "final",
                            "abstract",
                            "sealed",
                            "non-sealed",
                            "strictfp",
                        }:
                            modifiers.add(text)

                    class_info.modifiers = sorted(modifiers)
                    class_info.annotations = sorted(annotations)
                #
                # Future grammars / files
                #
                elif child.type == "superclass":

                    class_info.extends = (
                        source_code[
                            child.start_byte:child.end_byte
                        ]
                        .decode("utf-8")
                        .replace("extends", "")
                        .strip()
                    )

                elif child.type == "super_interfaces":

                    text = (
                        source_code[
                            child.start_byte:child.end_byte
                        ]
                        .decode("utf-8")
                        .replace("implements", "")
                    )

                    class_info.implements = [
                        interface.strip()
                        for interface in text.split(",")
                        if interface.strip()
                    ]

            classes.append(class_info)

        return classes