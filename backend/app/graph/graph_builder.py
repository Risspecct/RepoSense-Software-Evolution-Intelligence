from app.analysis.models.analysis_result import AnalysisResult
from app.graph.models.graph_document import GraphDocument
from app.graph.models.graph_node import GraphNode
from app.graph.models.graph_relationship import GraphRelationship
from app.graph.constants import CONTAINS, DECLARES, HAS_FIELD, PACKAGE, CLASS, FIELD, METHOD
from app.analysis.models.class_info import ClassInfo
from app.analysis.models.method_info import MethodInfo
from app.analysis.models.field_info import FieldInfo


class GraphBuilder:
    """
    Converts an AnalysisResult into a GraphDocument.
    """
    def build(self, analysis: AnalysisResult,) -> GraphDocument:

        if analysis.package is None:
            raise ValueError(
                "AnalysisResult must contain a package before building a graph."
            )

        graph = GraphDocument()

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

            graph.nodes.append(class_node)

            graph.relationships.append(
                GraphRelationship(
                    source=package_node.id,
                    target=class_node.id,
                    type=CONTAINS,
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
                        type=HAS_FIELD,
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
                        type=DECLARES,
                    )
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
            label=PACKAGE,
            properties={
                "name": package_name,
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

        return GraphNode(
            id=class_id,
            label=CLASS,
            properties={
                "name": class_info.name,
                "type": class_info.type.value,
                "modifiers": class_info.modifiers,
                "annotations": class_info.annotations,
                "extends": class_info.extends,
                "implements": class_info.implements,
            },
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
            label=FIELD,
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

        return GraphNode(
            id=method_id,
            label=METHOD,
            properties={
                "name": method.name,
                "return_type": method.return_type,
                "modifiers": method.modifiers,
                "annotations": method.annotations,
                "is_constructor": method.is_constructor,
            },
        )

    def _add_relationship(
        self,
    ) -> GraphRelationship:
        raise NotImplementedError
