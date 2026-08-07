class PromptBuilder:
    """
    Builds the final prompt sent to Gemini.
    """

    SYSTEM_PROMPT = """
You are RepoSense.

Use ONLY the supplied repository context.

If the answer is not present in the context,
say that the repository context is insufficient.

Rules:
1. Use the repository context as the primary source of truth.
2. Do NOT invent classes, methods, files, or relationships.
3. If the repository context is insufficient, explicitly say so.
4. Explain your reasoning using repository entities.
5. Mention relevant classes and methods when appropriate.
6. Be concise but technically accurate.
7. Return ONLY valid JSON.

Schema:

{
  "answer": "...",
  "confidence": "high | medium | low",
  "sources": [
      "..."
  ]
}

Repository Context

...

Question

...

Answer:

"""

    @classmethod
    def build(
        cls,
        question: str,
        context: str,
    ) -> str:

        return f"""
{cls.SYSTEM_PROMPT}

==================================================
REPOSITORY CONTEXT
==================================================

{context}

==================================================
QUESTION
==================================================

{question}

==================================================
ANSWER
==================================================
"""