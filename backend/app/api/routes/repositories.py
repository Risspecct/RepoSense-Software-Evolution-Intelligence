from fastapi import APIRouter, HTTPException

from app.ingestion.repository_manager import RepositoryManager
from app.graph.neo4j_client import neo4j_client
from app.models.repository import (
    RepositoryConnectRequest,
    RepositoryConnectResponse,
    RepositoryIndexRequest,
    RepositoryIndexResponse,
    RepositoryStatus,
)
from app.repository.repository_service import RepositoryService

router = APIRouter(prefix="/repositories", tags=["Repositories"])

repository_manager = RepositoryManager()
repository_service = RepositoryService(
    neo4j_client,
)


@router.post(
    "/connect",
    response_model=RepositoryConnectResponse,
)
def connect_repository(
    request: RepositoryConnectRequest,
) -> RepositoryConnectResponse:
    """
    Clone a repository or update it if it already exists.
    """
    try:
        repository = repository_manager.connect(str(request.url))

        return RepositoryConnectResponse(
            status=RepositoryStatus.READY,
            repository=repository,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/index",
    response_model=RepositoryIndexResponse,
)
def index_repository(
    request: RepositoryIndexRequest,
) -> RepositoryIndexResponse:
    """
    Clone a GitHub repository and index it into Neo4j.
    """
    try:
        repository_name = (
            repository_service.index_repository(
                str(request.repository_url)
            )
        )

        return RepositoryIndexResponse(
            status="success",
            repository=repository_name,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
