from pydantic import BaseModel, Field

from app.analysis.models.parameter_info import ParameterInfo


class MethodInfo(BaseModel):
    name: str

    return_type: str | None = None

    modifiers: list[str] = Field(default_factory=list)

    annotations: list[str] = Field(default_factory=list)

    parameters: list[ParameterInfo] = Field(default_factory=list)

    is_constructor: bool = False

    summary: str | None = None

    embedding: list[float] | None = None
