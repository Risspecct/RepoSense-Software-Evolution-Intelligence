from enum import Enum

from pydantic import BaseModel, Field


class ClassType(str, Enum):
    CLASS = "class"
    INTERFACE = "interface"
    ENUM = "enum"
    RECORD = "record"


class ClassInfo(BaseModel):
    name: str

    type: ClassType

    modifiers: list[str] = Field(default_factory=list)

    extends: str | None = None

    implements: list[str] = Field(default_factory=list)

    annotations: list[str] = Field(default_factory=list)
