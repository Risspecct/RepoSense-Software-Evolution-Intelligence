from app.intelligence.gemini_client import GeminiClient

from app.rag.context_builder import ContextBuilder
from app.rag.hybrid_retriever import HybridRetriever
from app.rag.prompt_builder import PromptBuilder
from app.rag.rag_models import RAGResponse


class RAGService:
    """
    End-to-end Repository RAG pipeline.

    Pipeline

    User Question
            ↓
    Hybrid Retrieval
            ↓
    Context Builder
            ↓
    Prompt Builder
            ↓
    Gemini
            ↓
    Structured Response
    """

    def __init__(
        self,
        hybrid_retriever: HybridRetriever | None = None,
        gemini_client: GeminiClient | None = None,
    ):

        self.hybrid = (
            hybrid_retriever or HybridRetriever()
        )

        self.gemini = (
            gemini_client or GeminiClient()
        )

    def answer(
        self,
        question: str,
        top_k: int = 3,
    ) -> RAGResponse:

        # ------------------------------------
        # Retrieve repository knowledge
        # ------------------------------------

        hybrid_result = self.hybrid.retrieve(
            question=question,
            top_k=top_k,
        )

        # ------------------------------------
        # Build repository context
        # ------------------------------------

        context_result = ContextBuilder.build(
            hybrid_result
        )

        # ------------------------------------
        # Build Gemini prompt
        # ------------------------------------

        prompt = PromptBuilder.build(
            question=context_result["question"],
            context=context_result["context"],
        )

        # ------------------------------------
        # Ask Gemini
        # ------------------------------------

        response = self.gemini.generate_structured(
            prompt=prompt,
            response_model=RAGResponse,
        )

        # ------------------------------------
        # Replace Gemini sources
        # with actual retrieved sources
        # ------------------------------------

        response.sources = context_result["sources"]

        return response