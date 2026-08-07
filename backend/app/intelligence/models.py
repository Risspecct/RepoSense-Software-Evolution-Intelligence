from pydantic import BaseModel, Field, model_validator


class NodeSummaryResult(BaseModel):
    node_id: str
    summary: str


class BatchSummaryResult(BaseModel):
    summaries: list[NodeSummaryResult] = Field(default_factory=list)
    

class NodeChangeResult(BaseModel):
    """
    AI analysis of a changed Class or Method.

    `significant` is transient and is not persisted in Neo4j.
    `summary` is only required when the change is significant.
    """

    node_id: str
    significant: bool
    summary: str | None = None

    @model_validator(mode="after")
    def validate_summary(self) -> "NodeChangeResult":
        if self.significant and not self.summary:
            raise ValueError(
                "A significant node change must include an updated summary."
            )

        return self


class CommitAnalysisResult(BaseModel):
    """
    Structured AI analysis for a commit.

    Intent is persisted on the Commit node.
    Change significance is only used to decide which summaries to overwrite.
    """

    intent: str
    changes: list[NodeChangeResult] = Field(default_factory=list)