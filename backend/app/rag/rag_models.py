from pydantic import BaseModel


class RAGResponse(BaseModel):
    answer: str
    confidence: str
    sources: list[str]