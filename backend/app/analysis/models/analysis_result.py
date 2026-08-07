from pydantic import BaseModel, Field
from app.analysis.models.class_info import ClassInfo


class AnalysisResult(BaseModel):
    """
    Represents the semantic information extracted from a source file.
    """

    package: str | None = None
    imports: list[str] = Field(default_factory=list)
    classes: list[ClassInfo] = Field(default_factory=list)
    file_path: str | None = None
