from pydantic import BaseModel, Field


class CodeStructure(BaseModel):
    package: str | None = None

    imports: list[str] = Field(default_factory=list)

    classes: list[str] = Field(default_factory=list)

    interfaces: list[str] = Field(default_factory=list)

    enums: list[str] = Field(default_factory=list)

    records: list[str] = Field(default_factory=list)
