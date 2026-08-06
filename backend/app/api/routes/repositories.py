from fastapi import APIRouter, HTTPException

from app.ingestion.repository_manager import RepositoryManager
from app.models.repository import (
    RepositoryConnectRequest,
    RepositoryConnectResponse,
    RepositoryStatus,
)

router = APIRouter(prefix="/repositories", tags=["Repositories"])

repository_manager = RepositoryManager()


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
