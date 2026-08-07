from pydantic import BaseModel, Field

from app.graph.models.graph_node import GraphNode
from app.graph.models.graph_relationship import GraphRelationship


class GraphDocument(BaseModel):
    nodes: list[GraphNode] = Field(default_factory=list)
    relationships: list[GraphRelationship] = Field(default_factory=list)

    def merge(
        self,
        other: "GraphDocument",
    ) -> None:
        """
        Merge another GraphDocument into this one.
        """

        self._merge_nodes(other.nodes)
        self._merge_relationships(other.relationships)

    def _merge_nodes(
        self,
        nodes: list[GraphNode],
    ) -> None:

        existing = {
            node.id
            for node in self.nodes
        }

        for node in nodes:

            if node.id not in existing:
                self.nodes.append(node)
                existing.add(node.id)

    def _merge_relationships(
        self,
        relationships: list[GraphRelationship],
    ) -> None:

        existing = {
            (
                relationship.source,
                relationship.type,
                relationship.target,
            )
            for relationship in self.relationships
        }

        for relationship in relationships:

            key = (
                relationship.source,
                relationship.type,
                relationship.target,
            )

            if key not in existing:
                self.relationships.append(relationship)
                existing.add(key)
