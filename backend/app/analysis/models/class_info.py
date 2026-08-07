from enum import Enum

from pydantic import BaseModel, Field

from app.analysis.models.field_info import FieldInfo
from app.analysis.models.method_info import MethodInfo


class ClassType(str, Enum):
    """
    Represents the type of a Java type declaration.
    """

    CLASS = "class"
    INTERFACE = "interface"
    ENUM = "enum"
    RECORD = "record"


class ClassInfo(BaseModel):
    """
    Represents a Java type declaration.
    """

    name: str

    type: ClassType

    modifiers: list[str] = Field(default_factory=list)

    annotations: list[str] = Field(default_factory=list)

    extends: str | None = None

    implements: list[str] = Field(default_factory=list)

    fields: list[FieldInfo] = Field(default_factory=list)

    methods: list[MethodInfo] = Field(default_factory=list)

    summary: str | None = None
    
    embedding: list[float] | None = None