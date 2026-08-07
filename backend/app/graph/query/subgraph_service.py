from app.graph.constants import NodeLabel, RelationshipType
from app.graph.models.graph_document import GraphDocument
from app.graph.models.graph_node import GraphNode
from app.graph.models.graph_relationship import GraphRelationship
from app.graph.neo4j_client import Neo4jClient
from app.graph.query.cypher_queries import GET_CLASS_SUBGRAPH


class SubgraphService:

    def __init__(
        self,
        client: Neo4jClient,
    ) -> None:
        self.client = client

    def get_class_subgraph(
        self,
        class_id: str,
    ) -> GraphDocument:
        rows = self.client.execute_query(
            GET_CLASS_SUBGRAPH,
            {"class_id": class_id},
        )

        if not rows:
            return GraphDocument()

        row = rows[0]

        nodes = [
            GraphNode(
                id=node["id"],
                label=NodeLabel(node["label"]),
                properties=node["properties"],
            )
            for node in row["nodes"]
        ]
        relationships = [
            GraphRelationship(
                source=relationship["source"],
                target=relationship["target"],
                type=RelationshipType(
                    relationship["type"]
                ),
            )
            for relationship in row["relationships"]
        ]

        graph = GraphDocument(
            nodes=sorted(
                nodes,
                key=lambda node: (
                    node.label.value,
                    node.id,
                ),
            ),
            relationships=sorted(
                relationships,
                key=lambda relationship: (
                    relationship.type.value,
                    relationship.source,
                    relationship.target,
                ),
            ),
        )

        return graph
