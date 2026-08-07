import json

from app.graph.query.graph_query_service import GraphQueryService
from app.intelligence.gemini_client import GeminiClient
from app.intelligence.models import BatchSummaryResult


class SummaryService:
    """
    Generates and persists AI summaries for Method and Class nodes.

    Methods are summarized first so their summaries can be used
    as context when generating Class summaries.
    """

    def __init__(
        self,
        graph_query_service: GraphQueryService,
        gemini_client: GeminiClient,
        batch_size: int = 20,
    ) -> None:
        if batch_size <= 0:
            raise ValueError("batch_size must be greater than 0.")

        self.graph_query_service = graph_query_service
        self.gemini_client = gemini_client
        self.batch_size = batch_size

    def summarize_repository(self) -> None:
        """
        Generate summaries for the complete repository.

        Order:
        1. Methods
        2. Classes
        """
        self.summarize_methods()
        self.summarize_classes()

    def summarize_methods(self) -> None:
        """
        Generate Method summaries in batches and persist them.
        """
        methods = self.graph_query_service.get_all_methods()

        contexts: list[dict] = []

        for item in methods:
            method = item["method"]
            method_id = method["id"]

            context = self.graph_query_service.get_method_context(
                method_id,
            )

            if context is not None:
                contexts.append(context)

        for batch in self._create_batches(contexts):
            self._summarize_method_batch(batch)

    def summarize_classes(self) -> None:
        """
        Generate Class summaries in batches and persist them.

        This runs after Method summarization so generated Method
        summaries are available in the Class context.
        """
        classes = self.graph_query_service.get_all_classes()

        contexts: list[dict] = []

        for class_node in classes:
            class_id = class_node["id"]

            context = (
                self.graph_query_service.get_class_summary_context(
                    class_id,
                )
            )

            if context is not None:
                contexts.append(context)

        for batch in self._create_batches(contexts):
            self._summarize_class_batch(batch)
  
    def generate_class_summary(
      self,
        context: dict,
    ) -> str:
        """
        Generate a summary for a single Class.

        Used when a Class must be refreshed after a significant
        Method change.
        """
        result = self.gemini_client.generate_structured(
            prompt=self._build_class_batch_prompt([context]),
            response_model=BatchSummaryResult,
        )

        if len(result.summaries) != 1:
            raise RuntimeError(
                "Gemini did not return exactly one Class summary."
            )

        item = result.summaries[0]
        expected_id = context["class"]["id"]

        if item.node_id != expected_id:
            raise RuntimeError(
                "Gemini returned an unexpected Class node ID: "
                f"'{item.node_id}'."
            )

        summary = item.summary.strip()

        if not summary:
            raise RuntimeError(
                f"Gemini returned an empty summary for "
                f"Class '{expected_id}'."
            )

        return summary

    def _summarize_method_batch(
        self,
        contexts: list[dict],
    ) -> None:
        prompt = self._build_method_batch_prompt(contexts)

        result = self.gemini_client.generate_structured(
            prompt=prompt,
            response_model=BatchSummaryResult,
        )

        expected_ids = {
            context["method"]["id"]
            for context in contexts
        }

        self._persist_method_summaries(
            result=result,
            expected_ids=expected_ids,
        )

    def _summarize_class_batch(
        self,
        contexts: list[dict],
    ) -> None:
        prompt = self._build_class_batch_prompt(contexts)

        result = self.gemini_client.generate_structured(
            prompt=prompt,
            response_model=BatchSummaryResult,
        )

        expected_ids = {
            context["class"]["id"]
            for context in contexts
        }

        self._persist_class_summaries(
            result=result,
            expected_ids=expected_ids,
        )

    def _persist_method_summaries(
        self,
        result: BatchSummaryResult,
        expected_ids: set[str],
    ) -> None:
        returned_ids: set[str] = set()

        for item in result.summaries:
            if item.node_id not in expected_ids:
                raise RuntimeError(
                    "Gemini returned an unexpected Method node ID: "
                    f"'{item.node_id}'."
                )

            if item.node_id in returned_ids:
                raise RuntimeError(
                    "Gemini returned a duplicate Method node ID: "
                    f"'{item.node_id}'."
                )

            summary = item.summary.strip()

            if not summary:
                raise RuntimeError(
                    f"Gemini returned an empty summary for "
                    f"Method '{item.node_id}'."
                )

            returned_ids.add(item.node_id)

            updated = (
                self.graph_query_service.update_method_summary(
                    method_id=item.node_id,
                    summary=summary,
                )
            )

            if not updated:
                raise RuntimeError(
                    f"Failed to update Method '{item.node_id}'."
                )

        missing_ids = expected_ids - returned_ids

        if missing_ids:
            raise RuntimeError(
                "Gemini did not return summaries for Methods: "
                f"{sorted(missing_ids)}"
            )

    def _persist_class_summaries(
        self,
        result: BatchSummaryResult,
        expected_ids: set[str],
    ) -> None:
        returned_ids: set[str] = set()

        for item in result.summaries:
            if item.node_id not in expected_ids:
                raise RuntimeError(
                    "Gemini returned an unexpected Class node ID: "
                    f"'{item.node_id}'."
                )

            if item.node_id in returned_ids:
                raise RuntimeError(
                    "Gemini returned a duplicate Class node ID: "
                    f"'{item.node_id}'."
                )

            summary = item.summary.strip()

            if not summary:
                raise RuntimeError(
                    f"Gemini returned an empty summary for "
                    f"Class '{item.node_id}'."
                )

            returned_ids.add(item.node_id)

            updated = (
                self.graph_query_service.update_class_summary(
                    class_id=item.node_id,
                    summary=summary,
                )
            )

            if not updated:
                raise RuntimeError(
                    f"Failed to update Class '{item.node_id}'."
                )

        missing_ids = expected_ids - returned_ids

        if missing_ids:
            raise RuntimeError(
                "Gemini did not return summaries for Classes: "
                f"{sorted(missing_ids)}"
            )

    def _build_method_batch_prompt(
        self,
        contexts: list[dict],
    ) -> str:
        context_json = json.dumps(
            contexts,
            indent=2,
            ensure_ascii=False,
        )

        return f"""
You are analyzing Java methods for a software repository
code-intelligence system.

Generate one concise semantic summary for every Method provided.

The summaries will later be used for semantic retrieval in a RAG system.

Requirements:
- Preserve the exact node_id of every Method.
- Return exactly one summary for every provided Method.
- Describe what each Method appears responsible for.
- Use the method name, parameters, return type, owning Class,
  and available fields.
- Do not invent behavior unsupported by the provided context.
- If exact behavior cannot be determined, describe the apparent
  responsibility based on the available structural information.
- Keep each summary concise, preferably one sentence.
- Do not include markdown.

Return only valid JSON in exactly this structure:

{{
  "summaries": [
    {{
      "node_id": "exact method id",
      "summary": "concise method summary"
    }}
  ]
}}

Methods:

{context_json}
""".strip()

    def _build_class_batch_prompt(
        self,
        contexts: list[dict],
    ) -> str:
        context_json = json.dumps(
            contexts,
            indent=2,
            ensure_ascii=False,
        )

        return f"""
You are analyzing Java classes for a software repository
code-intelligence system.

Generate one concise semantic summary for every Class provided.

The summaries will later be used for semantic retrieval in a RAG system.

Requirements:
- Preserve the exact node_id of every Class.
- Return exactly one summary for every provided Class.
- Describe the primary responsibility of each Class.
- Use its type, inheritance information, implemented interfaces,
  dependencies, and Method summaries.
- Give strong importance to Method summaries when determining
  the Class responsibility.
- Do not invent behavior unsupported by the provided context.
- Keep each summary concise, preferably one or two sentences.
- Do not include markdown.

Return only valid JSON in exactly this structure:

{{
  "summaries": [
    {{
      "node_id": "exact class id",
      "summary": "concise class summary"
    }}
  ]
}}

Classes:

{context_json}
""".strip()

    def _create_batches(
        self,
        items: list[dict],
    ) -> list[list[dict]]:
        return [
            items[index:index + self.batch_size]
            for index in range(0, len(items), self.batch_size)
        ]