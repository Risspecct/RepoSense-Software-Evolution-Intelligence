from sentence_transformers import SentenceTransformer
from typing import List

class EmbeddingService:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        # This model runs locally on your CPU/GPU
        # Output dimension: 384
        self.model = SentenceTransformer(model_name)

    def embed(self, text: str) -> List[float]:
        """Converts a single string into a vector."""
        if not text or not text.strip():
            return []
        embedding = self.model.encode(text,normalize_embeddings=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Converts a list of strings into a list of vectors efficiently."""
        if not texts:
            return []
        embeddings = self.model.encode(texts,normalize_embeddings=True)
        return embeddings.tolist()

# Global instance to avoid re-loading the model in every file
embedding_service = EmbeddingService()