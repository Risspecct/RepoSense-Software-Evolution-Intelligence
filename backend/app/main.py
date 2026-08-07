from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI

from app.config import settings
from app.graph.neo4j_client import neo4j_client
from app.api.graph_router import router as graph_router
from app.api.routes.repositories import router as repository_router


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    neo4j_client.connect()
    logger.info("Connected to Neo4j")

    yield

    # Shutdown
    neo4j_client.close()
    logger.info("Disconnected from Neo4j")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
)


app.include_router(repository_router)
app.include_router(graph_router)


@app.get("/")
async def root():
    return {
        "project": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy" if neo4j_client.is_connected() else "unhealthy",
        "neo4j": "connected" if neo4j_client.is_connected() else "disconnected",
    }
