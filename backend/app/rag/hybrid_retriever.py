from typing import Any

from app.rag.vector_retriever import VectorRetriever
from app.rag.graph_retriever import GraphRetriever


class HybridRetriever:
    """
    Combines semantic vector retrieval with structural
    graph expansion.

    Pipeline:
        Question
            ↓
        VectorRetriever
            ↓
        Semantic seed nodes
            ↓
        GraphRetriever
            ↓
        Expanded repository context
    """

    def __init__(
        self,
        vector_retriever: VectorRetriever | None = None,
        graph_retriever: GraphRetriever | None = None,
    ):
        self.vector_retriever = (
            vector_retriever or VectorRetriever()
        )

        self.graph_retriever = (
            graph_retriever or GraphRetriever()
        )

    def retrieve(
        self,
        question: str,
        top_k: int = 3,
    ) -> dict[str, Any]:
        """
        Perform hybrid retrieval for a user question.

        Returns:
        - original question
        - semantic seed nodes
        - graph-expanded context
        """

        if not question or not question.strip():
            return {
                "question": question,
                "seeds": [],
                "graph_context": [],
            }

        if top_k <= 0:
            return {
                "question": question,
                "seeds": [],
                "graph_context": [],
            }

        # --------------------------------
        # Step 1: Semantic retrieval
        # --------------------------------

        seeds = self.vector_retriever.retrieve_seeds(
            question=question,
            top_k=top_k,
        )

        if not seeds:
            return {
                "question": question,
                "seeds": [],
                "graph_context": [],
            }

        # --------------------------------
        # Step 2: Structural expansion
        # --------------------------------

        graph_context = (
            self.graph_retriever.expand_seeds(seeds)
        )

        # --------------------------------
        # Step 3: Return hybrid result
        # --------------------------------

        return {
            "question": question,
            "seeds": seeds,
            "graph_context": graph_context,
        }