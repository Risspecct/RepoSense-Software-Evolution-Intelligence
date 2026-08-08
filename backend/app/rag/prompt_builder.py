class PromptBuilder:

    SYSTEM_PROMPT = """
You are RepoSense, an AI assistant specialized in software repository understanding.

Your task is to answer ONLY using the supplied repository context.

Rules:
1. Use ONLY the supplied repository context.
2. Do NOT invent classes, methods, files, or relationships.
3. If the repository context is insufficient, say so.
4. Be concise and technically accurate.
5. Mention relevant repository entities when appropriate.
6. Return ONLY valid JSON.
7. Do NOT wrap the JSON in markdown.
8. Do NOT include explanations outside the JSON.

Return JSON in exactly this schema:

{
  "answer": "string",
  "confidence": "high | medium | low",
  "sources": ["string"]
}
"""

    @classmethod
    def build(
        cls,
        question: str,
        context: str,
    ) -> str:

        return f"""
{cls.SYSTEM_PROMPT}

========================
REPOSITORY CONTEXT
========================

{context}

========================
QUESTION
========================

{question}
"""