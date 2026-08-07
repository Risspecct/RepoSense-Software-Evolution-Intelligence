from pydantic import BaseModel, Field


class GraphRelationship(BaseModel):
    """
    Represents a relationship between two graph nodes.
    """

    source: str

    target: str

    type: str

    properties: dict[str, str] = Field(default_factory=dict)
