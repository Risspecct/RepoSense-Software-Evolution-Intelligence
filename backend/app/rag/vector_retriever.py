from typing import Any

from app.graph.neo4j_client import neo4j_client
from app.rag.embedding_service import embedding_service


class VectorRetriever:
    """
    Performs semantic vector retrieval over repository
    Classes and Methods.
    """

    CLASS_INDEX = "class_vector_index"
    METHOD_INDEX = "method_vector_index"

    def __init__(self):
        neo4j_client.connect()

    def retrieve_seeds(
        self,
        question: str,
        top_k: int = 3
    ) -> list[dict[str, Any]]:
        """
        Convert the user's question into an embedding and
        retrieve the most semantically relevant Classes
        and Methods.
        """

        if not question or not question.strip():
            return []

        if top_k <= 0:
            return []

        # --------------------------------
        # 1. Embed user question
        # --------------------------------

        query_vector = embedding_service.embed(question)

        if not query_vector:
            return []

        # --------------------------------
        # 2. Search Class index
        # --------------------------------

        class_seeds = self._query_index(
            index_name=self.CLASS_INDEX,
            vector=query_vector,
            limit=top_k,
            seed_type="class",
        )

        # --------------------------------
        # 3. Search Method index
        # --------------------------------

        method_seeds = self._query_index(
            index_name=self.METHOD_INDEX,
            vector=query_vector,
            limit=top_k,
            seed_type="method",
        )

        # --------------------------------
        # 4. Combine candidates
        # --------------------------------

        seeds = class_seeds + method_seeds

        # --------------------------------
        # 5. Rank globally
        # --------------------------------

        seeds.sort(
            key=lambda seed: seed["score"],
            reverse=True
        )

        # --------------------------------
        # 6. Return final Top-K
        # --------------------------------

        return seeds[:top_k]

    def _query_index(
        self,
        index_name: str,
        vector: list[float],
        limit: int,
        seed_type: str,
    ) -> list[dict[str, Any]]:
        """
        Query a Neo4j vector index and return normalized
        semantic seed nodes.
        """

        query = """
        CALL db.index.vector.queryNodes(
            $index,
            $limit,
            $vector
        )
        YIELD node, score

        RETURN
            node.id AS id,
            node.name AS name,
            node.summary AS summary,
            score
        """

        params = {
            "index": index_name,
            "limit": limit,
            "vector": vector,
        }

        results = neo4j_client.execute_query(
            query,
            params
        )

        return [
            {
                "id": record["id"],
                "name": record["name"],
                "summary": record.get("summary"),
                "score": float(record["score"]),
                "seed_type": seed_type,
            }
            for record in results
        ]

# Example usage:
# retriever = VectorRetriever()
# seeds = retriever.retrieve_seeds("How is the user login handled?",top_k=3)
# for s in seeds:
#     print(seed)