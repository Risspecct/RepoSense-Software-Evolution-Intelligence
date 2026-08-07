from neo4j import Session

from app.graph.neo4j_client import Neo4jClient
from app.graph.models.graph_document import GraphDocument


class GraphWriter:
    """
    Persists a GraphDocument into Neo4j.
    """

    def __init__(
        self,
        client: Neo4jClient,
    ) -> None:
        self.client = client

    def write(
        self,
        graph: GraphDocument,
    ) -> None:
        """
        Persist an entire GraphDocument.
        """

        with self.client.get_session() as session:

            self._write_nodes(
                session,
                graph,
            )

            self._write_relationships(
                session,
                graph,
            )

    def _write_nodes(
        self,
        session: Session,
        graph: GraphDocument,
    ) -> None:
        """
        Persists all graph nodes into Neo4j.
        """

        query = """
        MERGE (n:%LABEL% {id: $id})
        SET n += $properties
        """

        for node in graph.nodes:

            session.run(
                query.replace(
                    "%LABEL%",
                    node.label.value,
                ),
                id=node.id,
                properties=node.properties,
            )

    def _write_relationships(
        self,
        session: Session,
        graph: GraphDocument,
    ) -> None:
        """
        Persists all graph relationships into Neo4j.
        """

        query = """
        MATCH (source {id: $source})
        MATCH (target {id: $target})

        MERGE (source)-[r:%TYPE%]->(target)

        SET r += $properties
        """

        for relationship in graph.relationships:

            session.run(
                query.replace(
                    "%TYPE%",
                    relationship.type.value,
                ),
                source=relationship.source,
                target=relationship.target,
                properties=relationship.properties,
            )
