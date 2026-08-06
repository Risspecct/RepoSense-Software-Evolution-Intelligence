from enum import Enum

from pydantic import BaseModel


class ProgrammingLanguage(str, Enum):
    JAVA = "java"
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    TYPESCRIPT = "typescript"
    UNKNOWN = "unknown"


class SourceFile(BaseModel):
    path: str
    language: ProgrammingLanguage
    size: int
