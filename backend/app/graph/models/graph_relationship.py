from pydantic import BaseModel, Field

from app.graph.constants import RelationshipType


class GraphRelationship(BaseModel):
    """
    Represents a relationship between two graph nodes.
    """

    source: str

    target: str

    type: RelationshipType

    properties: dict[str, str] = Field(default_factory=dict)
