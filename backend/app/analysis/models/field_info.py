from pydantic import BaseModel, Field


class FieldInfo(BaseModel):
    """
    Represents a Java field declaration.
    """

    name: str

    type: str

    modifiers: list[str] = Field(default_factory=list)

    annotations: list[str] = Field(default_factory=list)

    initializer: str | None = None
