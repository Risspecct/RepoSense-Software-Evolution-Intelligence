from app.graph.neo4j_client import neo4j_client

from app.rag.embedding_service import embedding_service
from app.rag.semantic_text_builder import SemanticTextBuilder


class EmbeddingPipeline:
    """
    Generates and stores semantic embeddings for repository
    Classes and Methods.
    """

    def __init__(self):
        neo4j_client.connect()

    def index_repository(self) -> None:
        """Index all supported repository entities."""

        class_count = self._index_classes()
        method_count = self._index_methods()

        print(
            f"Embedding indexing complete. "
            f"Classes: {class_count}, "
            f"Methods: {method_count}"
        )

    def _index_classes(self) -> int:

        query = """
        MATCH (c:Class)
        RETURN
            c.id AS id,
            c.name AS name,
            c.type AS type,
            c.annotations AS annotations,
            c.extends AS extends,
            c.implements AS implements,
            c.summary AS summary
        """

        classes = neo4j_client.execute_query(query)

        if not classes:
            return 0

        texts = [
            SemanticTextBuilder.build_class_text(cls)
            for cls in classes
        ]

        embeddings = embedding_service.embed_batch(texts)

        rows = [
            {
                "id": cls["id"],
                "embedding": embedding
            }
            for cls, embedding in zip(
                classes,
                embeddings
            )
        ]

        update_query = """
        UNWIND $rows AS row
        MATCH (c:Class {id: row.id})
        SET c.embedding = row.embedding
        """

        neo4j_client.execute_query(
            update_query,
            {"rows": rows}
        )

        return len(rows)

    def _index_methods(self) -> int:

        query = """
        MATCH (m:Method)
        RETURN
            m.id AS id,
            m.name AS name,
            m.annotations AS annotations,
            m.parameter_names AS parameter_names,
            m.parameter_types AS parameter_types,
            m.return_type AS return_type,
            m.summary AS summary
        """

        methods = neo4j_client.execute_query(query)

        if not methods:
            return 0

        texts = [
            SemanticTextBuilder.build_method_text(method)
            for method in methods
        ]

        embeddings = embedding_service.embed_batch(texts)

        rows = [
            {
                "id": method["id"],
                "embedding": embedding
            }
            for method, embedding in zip(
                methods,
                embeddings
            )
        ]

        update_query = """
        UNWIND $rows AS row
        MATCH (m:Method {id: row.id})
        SET m.embedding = row.embedding
        """

        neo4j_client.execute_query(
            update_query,
            {"rows": rows}
        )

        return len(rows)