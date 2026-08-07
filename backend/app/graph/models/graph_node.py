from pydantic import BaseModel, Field
from app.graph.constants import NodeLabel
from typing import TypeAlias

PropertyValue: TypeAlias = (
    str | int | float | bool | list[str] | list[str] | None
)


class GraphNode(BaseModel):
    id: str
    label: NodeLabel
    properties: dict[str, PropertyValue] = Field(default_factory=dict)
