from pydantic import BaseModel, Field, model_validator


class NodeSummaryResult(BaseModel):
    """
    Summary generated for a single Class or Method node.
    """

    node_id: str
    summary: str


class BatchSummaryResult(BaseModel):
    """
    Structured response for batched node summarization.
    """

    summaries: list[NodeSummaryResult] = Field(
        default_factory=list,
    )


class NodeChangeResult(BaseModel):
    """
    AI analysis of a changed Method.

    `significant` is transient and is not persisted in Neo4j.
    `summary` is required only when the change is significant.
    """

    node_id: str
    significant: bool
    summary: str | None = None

    @model_validator(mode="after")
    def validate_summary(self) -> "NodeChangeResult":
        if self.significant and not self.summary:
            raise ValueError(
                "A significant node change must include "
                "an updated summary."
            )

        return self


class CommitAnalysisResult(BaseModel):
    """
    Structured AI analysis for a new commit.

    Intent is persisted on the Commit node.
    Change significance is used only to determine whether
    Method summaries should be replaced.
    """

    intent: str
    changes: list[NodeChangeResult] = Field(
        default_factory=list,
    )


class CommitIntentItem(BaseModel):
    """
    AI-generated intent for a single historical commit.
    """

    commit_hash: str
    intent: str


class BatchCommitIntentResult(BaseModel):
    """
    Structured response for batched historical commit
    intent generation.
    """

    commits: list[CommitIntentItem] = Field(
        default_factory=list,
    )