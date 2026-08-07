from pydantic import BaseModel, Field

from app.graph.models.graph_node import GraphNode
from app.graph.models.graph_relationship import GraphRelationship


class GraphDocument(BaseModel):
    """
    Represents the complete graph generated from a source file.
    """

    nodes: list[GraphNode] = Field(default_factory=list)

    relationships: list[GraphRelationship] = Field(default_factory=list)
