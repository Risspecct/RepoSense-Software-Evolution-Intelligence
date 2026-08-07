from pathlib import Path

from app.analysis.models.analysis_result import AnalysisResult
from app.graph.models.graph_document import GraphDocument
from app.graph.models.graph_node import GraphNode
from app.graph.models.graph_relationship import GraphRelationship
from app.analysis.models.class_info import ClassInfo
from app.analysis.models.method_info import MethodInfo
from app.analysis.models.field_info import FieldInfo
from app.graph.constants import (
    NodeLabel,
    RelationshipType,
)


class GraphBuilder:
    """
    Converts an AnalysisResult into a GraphDocument.
    """
    IGNORED_IMPORT_PREFIXES = (
        "java.",
        "javax.",
        "org.springframework.",
        "lombok.",
        "jakarta.",
    )

    def build(
        self,
        analysis: AnalysisResult,
        symbol_index: dict[str, str] | None = None,
    ) -> GraphDocument:

        if analysis.package is None:
            raise ValueError(
                "AnalysisResult must contain a package before building a graph."
            )

        graph = GraphDocument()
        symbol_index = symbol_index or {}
        class_nodes: dict[str, str] = {}

        if analysis.file_path is None:
            raise ValueError(
                "AnalysisResult must contain a file_path before building a graph."
            )

        #
        # File
        #
        file_node = self._build_file(
            analysis.file_path,
        )

        graph.nodes.append(file_node)

        #
        # Package
        #
        package_node = self._build_package(
            analysis.package,
        )

        graph.nodes.append(package_node)

        #
        # Classes
        #
        for cls in analysis.classes:

            class_node = self._build_class(
                analysis.package,
                cls,
            )

            class_nodes[cls.name] = class_node.id
            graph.nodes.append(class_node)

            graph.relationships.append(
                GraphRelationship(
                    source=package_node.id,
                    target=class_node.id,
                    type=RelationshipType.CONTAINS,
                )
            )

            graph.relationships.append(
                GraphRelationship(
                    source=file_node.id,
                    target=class_node.id,
                    type=RelationshipType.CONTAINS,
                )
            )

            #
            # Fields
            #
            for field in cls.fields:

                field_node = self._build_field(
                    class_node.id,
                    field,
                )

                graph.nodes.append(field_node)

                graph.relationships.append(
                    GraphRelationship(
                        source=class_node.id,
                        target=field_node.id,
                        type=RelationshipType.HAS_FIELD,
                    )
                )

            #
            # Methods
            #
            for method in cls.methods:

                method_node = self._build_method(
                    class_node.id,
                    method,
                )

                graph.nodes.append(method_node)

                graph.relationships.append(
                    GraphRelationship(
                        source=class_node.id,
                        target=method_node.id,
                        type=RelationshipType.DECLARES,
                    )
                )

        self._add_cross_file_relationships(
            graph=graph,
            analysis=analysis,
            class_nodes=class_nodes,
            symbol_index=symbol_index,
        )

        return graph

    def _build_package(
        self,
        package_name: str,
    ) -> GraphNode:
        """
        Creates a package node.
        """

        return GraphNode(
            id=package_name,
            label=NodeLabel.PACKAGE,
            properties={
                "name": package_name,
            },
        )

    def _build_file(
        self,
        file_path: str,
    ) -> GraphNode:
        """
        Creates a file node.
        """

        return GraphNode(
            id=f"file:{file_path}",
            label=NodeLabel.FILE,
            properties={
                "path": file_path,
                "name": Path(file_path).name,
            },
        )

    def _build_class(
        self,
        package_name: str,
        class_info: ClassInfo,
    ) -> GraphNode:
        """
        Creates a class node.
        """

        class_id = f"{package_name}.{class_info.name}"

        properties = {
            "name": class_info.name,
            "type": class_info.type.value,
            "modifiers": class_info.modifiers,
            "annotations": class_info.annotations,
            "extends": class_info.extends,
            "implements": class_info.implements,
        }

        if class_info.summary is not None:
            properties["summary"] = class_info.summary

        if class_info.embedding is not None:
            properties["embedding"] = class_info.embedding

        return GraphNode(
            id=class_id,
            label=NodeLabel.CLASS,
            properties=properties,
        )

    def _build_field(
        self,
        class_id: str,
        field: FieldInfo,
    ) -> GraphNode:
        """
        Creates a field node.
        """

        field_id = f"{class_id}#{field.name}"

        return GraphNode(
            id=field_id,
            label=NodeLabel.FIELD,
            properties={
                "name": field.name,
                "type": field.type,
                "modifiers": field.modifiers,
                "annotations": field.annotations,
                "initializer": field.initializer,
            },
        )

    def _build_method(
        self,
        class_id: str,
        method: MethodInfo,
    ) -> GraphNode:
        """
        Creates a method node.
        """

        parameter_signature = ",".join(
            parameter.type
            for parameter in method.parameters
        )

        method_id = (
            f"{class_id}"
            f"#{method.name}"
            f"({parameter_signature})"
        )
        properties = {
            "name": method.name,
            "modifiers": method.modifiers,
            "annotations": method.annotations,
            "is_constructor": method.is_constructor,
            "parameter_names": [
                parameter.name
                for parameter in method.parameters
            ],
            "parameter_types": [
                parameter.type
                for parameter in method.parameters
            ],
        }

        if method.return_type is not None:
            properties["return_type"] = method.return_type

        if method.summary is not None:
            properties["summary"] = method.summary

        if method.embedding is not None:
            properties["embedding"] = method.embedding

        return GraphNode(
            id=method_id,
            label=NodeLabel.METHOD,
            properties=properties,
        )

    def _add_cross_file_relationships(
        self,
        graph: GraphDocument,
        analysis: AnalysisResult,
        class_nodes: dict[str, str],
        symbol_index: dict[str, str],
    ) -> None:
        for cls in analysis.classes:
            class_id = class_nodes.get(cls.name)

            if class_id is None:
                continue

            if cls.extends:
                target_id = self._resolve_symbol(
                    raw_symbol=cls.extends,
                    package_name=analysis.package,
                    imports=analysis.imports,
                    symbol_index=symbol_index,
                )

                if target_id is not None:
                    graph.relationships.append(
                        GraphRelationship(
                            source=class_id,
                            target=target_id,
                            type=RelationshipType.EXTENDS,
                        )
                    )

            for interface_name in cls.implements:
                target_id = self._resolve_symbol(
                    raw_symbol=interface_name,
                    package_name=analysis.package,
                    imports=analysis.imports,
                    symbol_index=symbol_index,
                )

                if target_id is not None:
                    graph.relationships.append(
                        GraphRelationship(
                            source=class_id,
                            target=target_id,
                            type=RelationshipType.IMPLEMENTS,
                        )
                    )

            for import_name in analysis.imports:
                if self._should_ignore_import(import_name):
                    continue

                target_id = self._resolve_import(
                    import_name=import_name,
                    symbol_index=symbol_index,
                )

                if target_id is not None:
                    graph.relationships.append(
                        GraphRelationship(
                            source=class_id,
                            target=target_id,
                            type=RelationshipType.IMPORTS,
                        )
                    )

    def _resolve_symbol(
        self,
        raw_symbol: str,
        package_name: str | None,
        imports: list[str],
        symbol_index: dict[str, str],
    ) -> str | None:
        symbol = self._normalize_symbol_name(
            raw_symbol,
        )

        if not symbol:
            return None

        direct_target = symbol_index.get(symbol)

        if direct_target is not None:
            return direct_target

        for import_name in imports:
            normalized_import = self._normalize_import_name(
                import_name,
            )

            if normalized_import is None:
                continue

            if normalized_import.rsplit(".", 1)[-1] != symbol:
                continue

            target_id = symbol_index.get(normalized_import)

            if target_id is not None:
                return target_id

        if package_name is not None:
            local_target = symbol_index.get(
                f"{package_name}.{symbol}"
            )

            if local_target is not None:
                return local_target

        return None

    def _resolve_import(
        self,
        import_name: str,
        symbol_index: dict[str, str],
    ) -> str | None:
        normalized_import = self._normalize_import_name(
            import_name,
        )

        if normalized_import is None:
            return None

        return symbol_index.get(normalized_import)

    def _normalize_import_name(
        self,
        import_name: str,
    ) -> str | None:
        normalized_import = import_name.removeprefix(
            "static "
        ).strip()

        if normalized_import.endswith(".*"):
            return None

        return self._normalize_symbol_name(
            normalized_import,
        )

    def _normalize_symbol_name(
        self,
        symbol_name: str,
    ) -> str:
        normalized: list[str] = []
        generic_depth = 0

        for character in symbol_name.strip():
            if character == "<":
                generic_depth += 1
                continue

            if character == ">":
                generic_depth = max(0, generic_depth - 1)
                continue

            if generic_depth == 0:
                normalized.append(character)

        symbol = "".join(normalized).strip()

        if symbol.startswith("? extends "):
            symbol = symbol.removeprefix("? extends ").strip()
        elif symbol.startswith("? super "):
            symbol = symbol.removeprefix("? super ").strip()

        if "|" in symbol:
            symbol = symbol.split("|", 1)[0].strip()

        symbol = symbol.removesuffix("[]").removesuffix("...").strip()

        return symbol

    def _should_ignore_import(
        self,
        import_name: str,
    ) -> bool:
        normalized_import = import_name.removeprefix(
            "static "
        ).strip()

        return normalized_import.startswith(
            self.IGNORED_IMPORT_PREFIXES
        )
