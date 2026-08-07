from pydantic import BaseModel, Field


class ClassResponse(BaseModel):
    id: str
    name: str
    type: str
    modifiers: list[str] = Field(default_factory=list)
    annotations: list[str] = Field(default_factory=list)
    extends: str | None = None
    implements: list[str] = Field(default_factory=list)


class MethodResponse(BaseModel):
    id: str
    name: str
    modifiers: list[str] = Field(default_factory=list)
    annotations: list[str] = Field(default_factory=list)
    is_constructor: bool = False
    parameter_names: list[str] = Field(default_factory=list)
    parameter_types: list[str] = Field(default_factory=list)
    return_type: str | None = None


class FieldResponse(BaseModel):
    id: str
    name: str
    type: str
    modifiers: list[str] = Field(default_factory=list)
    annotations: list[str] = Field(default_factory=list)
    initializer: str | None = None


class DependencyGroupResponse(BaseModel):
    imports: list[ClassResponse] = Field(default_factory=list)
    extends: list[ClassResponse] = Field(default_factory=list)
    implements: list[ClassResponse] = Field(default_factory=list)
