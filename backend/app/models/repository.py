from pydantic import BaseModel, HttpUrl
from enum import Enum


class RepositoryStatus(str, Enum):
    READY = "ready"
    CLONING = "cloning"
    FAILED = "failed"


class RepositoryConnectRequest(BaseModel):
    url: HttpUrl


class RepositoryIndexRequest(BaseModel):
    repository_url: HttpUrl


class RepositoryInfo(BaseModel):
    name: str
    owner: str
    branch: str
    local_path: str


class RepositoryConnectResponse(BaseModel):
    status: RepositoryStatus
    repository: RepositoryInfo


class RepositoryIndexResponse(BaseModel):
    status: str
    repository: str
