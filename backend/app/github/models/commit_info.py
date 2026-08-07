from datetime import datetime

from pydantic import BaseModel


class CommitInfo(BaseModel):
    hash: str
    author: str
    email: str
    message: str
    timestamp: datetime
    modified_files: list[str]
