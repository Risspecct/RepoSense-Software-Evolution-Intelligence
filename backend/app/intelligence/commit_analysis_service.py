import json

from app.github.models.commit_info import CommitInfo
from app.graph.query.graph_query_service import GraphQueryService
from app.intelligence.gemini_client import GeminiClient
from app.intelligence.models import CommitAnalysisResult, BatchCommitIntentResult
from app.intelligence.summary_service import SummaryService


class CommitAnalysisService:
    """
    Performs AI-based semantic analysis of Git commits.

    Responsibilities:
    - Determine the intent of a commit.
    - Determine whether candidate Method nodes changed significantly.
    - Replace summaries of significantly changed Methods.
    - Regenerate summaries of Classes containing changed Methods.

    Change significance itself is transient and is not persisted.
    """

    def __init__(
        self,
        graph_query_service: GraphQueryService,
        gemini_client: GeminiClient,
        summary_service: SummaryService,
    ) -> None:
        self.graph_query_service = graph_query_service
        self.gemini_client = gemini_client
        self.summary_service = summary_service

    def analyze_commits(
        self,
        commits: list[CommitInfo],
    ) -> None:
        """
        Analyze all supplied commits individually.
        """
        for commit in commits:
            self.analyze_commit(commit)

    def analyze_commit(
        self,
        commit: CommitInfo,
    ) -> None:
        """
        Analyze one commit and persist its semantic information.
        """
        changed_files = self._build_changed_file_contexts(
           commit,
        )

        if not changed_files:
            self._generate_commit_intent_only(commit)
            return

        candidate_method_ids = self._collect_candidate_method_ids(
            changed_files,
        )

        prompt = self._build_commit_prompt(
            commit=commit,
            changed_files=changed_files,
        )

        result = self.gemini_client.generate_structured(
            prompt=prompt,
            response_model=CommitAnalysisResult,
        )

        self._validate_result(
            result=result,
            candidate_method_ids=candidate_method_ids,
        )

        intent = result.intent.strip()

        if not intent:
            raise RuntimeError(
                f"Gemini returned an empty intent for "
                f"commit '{commit.hash}'."
            )

        updated = self.graph_query_service.update_commit_intent(
            commit_hash=commit.hash,
            intent=intent,
        )

        if not updated:
            raise RuntimeError(
                f"Failed to update intent for commit "
                f"'{commit.hash}'."
            )

        affected_class_ids: set[str] = set()

        for change in result.changes:
            if not change.significant:
                continue

            # Guaranteed by NodeChangeResult validation.
            summary = change.summary

            if summary is None:
                continue

            summary = summary.strip()

            updated = (
                self.graph_query_service.update_method_summary(
                    method_id=change.node_id,
                    summary=summary,
                )
            )

            if not updated:
                raise RuntimeError(
                    f"Failed to update Method "
                    f"'{change.node_id}'."
                )

            class_id = self._find_parent_class_id(
                changed_files=changed_files,
                method_id=change.node_id,
            )

            if class_id is not None:
                affected_class_ids.add(class_id)

        self._regenerate_affected_classes(
            affected_class_ids,
        )

    def _build_changed_file_contexts(
        self,
        commit: CommitInfo,
    ) -> list[dict]:
        """
        Build Gemini context for Java files modified by a commit.
        """
        contexts: list[dict] = []

        for file_path in commit.modified_files:
            if not file_path.endswith(".java"):
                continue

            graph_contexts = (
                self.graph_query_service.get_file_code_nodes(
                    file_path,
                )
            )

            if not graph_contexts:
                continue
            for graph_context in graph_contexts:
                contexts.append(
                    {
                        "file_path": file_path,
                        "diff": commit.file_diffs.get(
                            file_path,
                            "",
                        ),
                        "class": graph_context["class"],
                        "methods": graph_context["methods"],
                    }
                )

        return contexts

    def _collect_candidate_method_ids(
        self,
        changed_files: list[dict],
    ) -> set[str]:
        method_ids: set[str] = set()

        for file_context in changed_files:
            for method in file_context["methods"]:
                method_ids.add(method["id"])

        return method_ids

    def _validate_result(
        self,
        result: CommitAnalysisResult,
        candidate_method_ids: set[str],
    ) -> None:
        """
        Ensure Gemini returns exactly one analysis for every
        candidate Method supplied in the commit context.
        """

        returned_ids: set[str] = set()

        for change in result.changes:
            if change.node_id not in candidate_method_ids:
                raise RuntimeError(
                    "Gemini returned an unexpected Method "
                    f"node ID: '{change.node_id}'."
                )

            if change.node_id in returned_ids:
                raise RuntimeError(
                    "Gemini returned duplicate analysis for "
                    f"Method '{change.node_id}'."
                )

            returned_ids.add(change.node_id)

        missing_ids = candidate_method_ids - returned_ids

        if missing_ids:
            raise RuntimeError(
                "Gemini did not return analysis for Methods: "
                f"{sorted(missing_ids)}"
            )
    
    def _find_parent_class_id(
        self,
        changed_files: list[dict],
        method_id: str,
    ) -> str | None:
        for file_context in changed_files:
            for method in file_context["methods"]:
                if method["id"] == method_id:
                    return file_context["class"]["id"]

        return None

    def _regenerate_affected_classes(
        self,
        class_ids: set[str],
    ) -> None:
        """
        Regenerate Class summaries after significant child
        Method summaries have changed.
        """
        for class_id in class_ids:
            context = (
                self.graph_query_service.get_class_summary_context(
                    class_id,
                )
            )

            if context is None:
                continue

            summary = (
                self.summary_service.generate_class_summary(
                    context,
                )
            )

            updated = (
                self.graph_query_service.update_class_summary(
                    class_id=class_id,
                    summary=summary,
                )
            )

            if not updated:
                raise RuntimeError(
                    f"Failed to regenerate Class "
                    f"'{class_id}'."
                )

    def _build_commit_prompt(
        self,
        commit: CommitInfo,
        changed_files: list[dict],
    ) -> str:
        context = {
            "commit": {
                "hash": commit.hash,
                "message": commit.message,
            },
            "changed_files": changed_files,
        }

        context_json = json.dumps(
            context,
            indent=2,
            ensure_ascii=False,
        )

        return f"""
You are analyzing a Git commit for a software repository
code-intelligence system.

Perform two tasks:

1. Determine the overall intent of the commit.
2. Determine which supplied Java Methods changed significantly.

A Method change is significant when its existing semantic summary
would become inaccurate or meaningfully incomplete after the change.

Examples of significant changes:
- Changed behavior or business logic.
- Added or removed responsibility.
- Changed return behavior.
- Changed validation or error-handling behavior.
- Meaningful control-flow or algorithm changes.
- Meaningful changes to how dependencies or fields are used.

Examples of insignificant changes:
- Formatting or whitespace.
- Comments only.
- Simple renaming that does not change responsibility.
- Import reordering.
- Logging-only changes.
- Refactoring that preserves the Method's semantic responsibility.

For every Method you identify as significantly changed, generate an
updated concise summary representing the Method after the commit.

Important requirements:
- Use the provided Git diff as the primary evidence of what changed.
- Use the existing Method summary to determine whether it became stale.
- Only return node IDs that appear in the supplied Methods.
- Preserve node IDs exactly.
- Do not invent code behavior.
- The intent should describe why the commit appears to have been made,
  not merely repeat the commit message.
- Keep the intent concise.
- Keep Method summaries concise, preferably one sentence.
- Do not include markdown.

Return only valid JSON matching this structure:

{{
  "intent": "concise commit intent",
  "changes": [
    {{
      "node_id": "exact method id",
      "significant": true,
      "summary": "updated summary"
    }},
    {{
      "node_id": "exact method id",
      "significant": false,
      "summary": null
    }}
  ]
}}

Commit context:

{context_json}
""".strip()

    def _generate_commit_intent_only(
        self,
        commit: CommitInfo,
    ) -> None:
        """
        Generate commit intent when there are no mapped Java Methods
        available for significance analysis.
        """

        context = {
            "hash": commit.hash,
            "message": commit.message,
            "modified_files": commit.modified_files,
            "file_diffs": commit.file_diffs,
        }

        prompt = f"""
You are analyzing a Git commit for a software repository
code-intelligence system.

Determine the primary intent of this commit.

Requirements:
- Describe why the change appears to have been made.
- Use the commit message, modified files, and Git diff as evidence.
- Do not merely repeat the commit message.
- Do not invent unsupported motivations.
- Keep the intent concise, preferably one sentence.
- Do not include markdown.

Return only valid JSON in exactly this structure:

{{
  "commits": [
    {{
      "commit_hash": "{commit.hash}",
      "intent": "concise commit intent"
    }}
  ]
}}

Commit:

{json.dumps(context, indent=2, ensure_ascii=False)}
""".strip()

        result = self.gemini_client.generate_structured(
            prompt=prompt,
            response_model=BatchCommitIntentResult,
        )

        if len(result.commits) != 1:
            raise RuntimeError(
                f"Gemini did not return exactly one intent for "
                f"commit '{commit.hash}'."
            )

        item = result.commits[0]

        if item.commit_hash != commit.hash:
            raise RuntimeError(
                "Gemini returned an unexpected commit hash: "
                f"'{item.commit_hash}'."
            )

        intent = item.intent.strip()

        if not intent:
            raise RuntimeError(
                f"Gemini returned an empty intent for "
                f"commit '{commit.hash}'."
            )

        updated = self.graph_query_service.update_commit_intent(
            commit_hash=commit.hash,
            intent=intent,
        )

        if not updated:
            raise RuntimeError(
                f"Failed to update intent for commit "
                f"'{commit.hash}'."
            )

    def generate_historical_intents(
        self,
        commits: list[CommitInfo],
        batch_size: int = 20,
    ) -> None:
        """
        Generate intents for historical commits during initial indexing.

        Historical commits must not trigger summary regeneration because
        the graph represents the repository's current state.
        """

        if batch_size <= 0:
            raise ValueError(
                "batch_size must be greater than 0."
            )

        for index in range(
            0,
            len(commits),
            batch_size,
        ):
            batch = commits[
                index:index + batch_size
            ]

            self._generate_intent_batch(
                batch,
            )

    def _generate_intent_batch(
        self,
        commits: list[CommitInfo],
    ) -> None:
        """
        Generate and persist intents for one batch of commits.
        """

        if not commits:
            return

        commit_context = [
            {
                "commit_hash": commit.hash,
                "message": commit.message,
                "modified_files": commit.modified_files,
                "file_diffs": commit.file_diffs,
            }
            for commit in commits
        ]

        prompt = f"""
You are analyzing Git commits for a software repository
code-intelligence system.

Determine the primary intent of every commit provided.

Requirements:
- Preserve each commit_hash exactly.
- Return exactly one intent for every commit.
- Describe why the change appears to have been made.
- Use the commit message, modified files, and diff as evidence.
- Do not merely repeat the commit message.
- Do not invent unsupported motivations.
- Keep each intent concise, preferably one sentence.
- Do not include markdown.

Return only valid JSON in exactly this structure:

{{
  "commits": [
    {{
      "commit_hash": "exact commit hash",
      "intent": "concise intent"
    }}
  ]
}}

Commits:

{json.dumps(
    commit_context,
    indent=2,
    ensure_ascii=False,
)}
""".strip()

        result = self.gemini_client.generate_structured(
            prompt=prompt,
            response_model=BatchCommitIntentResult,
        )

        expected_hashes = {
            commit.hash
            for commit in commits
        }

        returned_hashes: set[str] = set()

        for item in result.commits:
            if item.commit_hash not in expected_hashes:
                raise RuntimeError(
                    "Gemini returned an unexpected commit hash: "
                    f"'{item.commit_hash}'."
                )

            if item.commit_hash in returned_hashes:
                raise RuntimeError(
                    "Gemini returned a duplicate commit hash: "
                    f"'{item.commit_hash}'."
                )

            intent = item.intent.strip()

            if not intent:
                raise RuntimeError(
                    "Gemini returned an empty intent for "
                    f"commit '{item.commit_hash}'."
                )

            returned_hashes.add(
                item.commit_hash,
            )

            updated = (
                self.graph_query_service.update_commit_intent(
                    commit_hash=item.commit_hash,
                    intent=intent,
                )
            )

            if not updated:
                raise RuntimeError(
                    "Failed to update intent for commit "
                    f"'{item.commit_hash}'."
                )

        missing_hashes = (
            expected_hashes - returned_hashes
        )

        if missing_hashes:
            raise RuntimeError(
                "Gemini did not return intents for commits: "
                f"{sorted(missing_hashes)}"
            )