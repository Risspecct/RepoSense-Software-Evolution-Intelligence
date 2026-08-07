import logging

from fastapi import APIRouter, Depends, HTTPException
from neo4j.exceptions import Neo4jError

from app.api.graph_models import (
    ClassResponse,
    DependencyGroupResponse,
    FieldResponse,
    MethodResponse,
)
from app.graph.models.graph_document import GraphDocument
from app.graph.neo4j_client import neo4j_client
from app.graph.query.graph_query_service import GraphQueryService
from app.graph.query.subgraph_service import SubgraphService


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/graph",
    tags=["Graph"],
)

graph_query_service = GraphQueryService(
    neo4j_client,
)
subgraph_service = SubgraphService(
    neo4j_client,
)


def get_graph_query_service() -> GraphQueryService:
    return graph_query_service


def get_subgraph_service() -> SubgraphService:
    return subgraph_service


def _raise_query_error(
    error: Exception,
) -> None:
    logger.exception(
        "Graph query request failed.",
        exc_info=error,
    )
    raise HTTPException(
        status_code=500,
        detail="Failed to query graph.",
    )


def _require_class(
    class_id: str,
    service: GraphQueryService,
) -> None:
    try:
        if not service._class_exists(class_id):
            raise HTTPException(
                status_code=404,
                detail="Class not found.",
            )
    except HTTPException:
        raise
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)


@router.get(
    "/classes/{class_name}",
    response_model=ClassResponse,
    summary="Find class",
    description="Return a class node by class name.",
)
def find_class(
    class_name: str,
    service: GraphQueryService = Depends(
        get_graph_query_service,
    ),
) -> ClassResponse:
    try:
        class_node = service.find_class(class_name)
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)

    if class_node is None:
        raise HTTPException(
            status_code=404,
            detail="Class not found.",
        )

    return ClassResponse.model_validate(
        class_node,
    )


@router.get(
    "/methods/{method_name}",
    response_model=list[MethodResponse],
    summary="Find methods",
    description="Return every method that matches the given method name.",
)
def find_methods(
    method_name: str,
    service: GraphQueryService = Depends(
        get_graph_query_service,
    ),
) -> list[MethodResponse]:
    try:
        methods = service.find_method(method_name)
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)

    return [
        MethodResponse.model_validate(
            method,
        )
        for method in methods
    ]


@router.get(
    "/classes/{class_id}/methods",
    response_model=list[MethodResponse],
    summary="Get class methods",
    description="Return methods declared by the given class.",
)
def get_class_methods(
    class_id: str,
    service: GraphQueryService = Depends(
        get_graph_query_service,
    ),
) -> list[MethodResponse]:
    _require_class(
        class_id,
        service,
    )

    try:
        methods = service.get_class_methods(class_id)
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)

    return [
        MethodResponse.model_validate(
            method,
        )
        for method in methods
    ]


@router.get(
    "/classes/{class_id}/fields",
    response_model=list[FieldResponse],
    summary="Get class fields",
    description="Return fields declared by the given class.",
)
def get_class_fields(
    class_id: str,
    service: GraphQueryService = Depends(
        get_graph_query_service,
    ),
) -> list[FieldResponse]:
    _require_class(
        class_id,
        service,
    )

    try:
        fields = service.get_class_fields(class_id)
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)

    return [
        FieldResponse.model_validate(
            field,
        )
        for field in fields
    ]


@router.get(
    "/classes/{class_id}/dependencies",
    response_model=DependencyGroupResponse,
    summary="Get dependencies",
    description="Return grouped outgoing dependencies for the given class.",
)
def get_dependencies(
    class_id: str,
    service: GraphQueryService = Depends(
        get_graph_query_service,
    ),
) -> DependencyGroupResponse:
    _require_class(
        class_id,
        service,
    )

    try:
        dependencies = service.get_dependencies(class_id)
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)

    return DependencyGroupResponse.model_validate(
        dependencies,
    )


@router.get(
    "/classes/{class_id}/dependents",
    response_model=DependencyGroupResponse,
    summary="Get dependents",
    description="Return grouped incoming dependencies for the given class.",
)
def get_dependents(
    class_id: str,
    service: GraphQueryService = Depends(
        get_graph_query_service,
    ),
) -> DependencyGroupResponse:
    _require_class(
        class_id,
        service,
    )

    try:
        dependents = service.get_dependents(class_id)
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)

    return DependencyGroupResponse.model_validate(
        dependents,
    )


@router.get(
    "/classes/{class_id}/subgraph",
    response_model=GraphDocument,
    summary="Get class subgraph",
    description="Return a one-hop neighborhood around the given class.",
)
def get_class_subgraph(
    class_id: str,
    service: GraphQueryService = Depends(
        get_graph_query_service,
    ),
    subgraph_service: SubgraphService = Depends(
        get_subgraph_service,
    ),
) -> GraphDocument:
    _require_class(
        class_id,
        service,
    )

    try:
        return subgraph_service.get_class_subgraph(
            class_id,
        )
    except (Neo4jError, RuntimeError) as error:
        _raise_query_error(error)
