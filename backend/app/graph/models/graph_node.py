from pydantic import BaseModel, Field
from typing import Any


class GraphNode(BaseModel):
    """
    Represents a node in the repository graph.
    """

    id: str

    label: str

    properties: dict[str, Any] = Field(default_factory=dict)
