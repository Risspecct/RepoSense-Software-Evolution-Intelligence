from app.github.models.commit_info import CommitInfo
from app.graph.constants import NodeLabel, RelationshipType
from app.graph.models.graph_document import GraphDocument
from app.graph.models.graph_node import GraphNode
from app.graph.models.graph_relationship import GraphRelationship


class CommitGraphBuilder:
    """
    Builds a graph from Git commit history.
    """

    def build(
        self,
        commits: list[CommitInfo],
    ) -> GraphDocument:

        graph = GraphDocument()

        commit_nodes: dict[str, GraphNode] = {}
        relationships: set[tuple[str, str, str]] = set()

        for commit in commits:

            commit_id = f"commit:{commit.hash}"

            if commit_id not in commit_nodes:
                commit_nodes[commit_id] = self._build_commit(commit)

            for file_path in commit.modified_files:

                file_id = f"file:{file_path}"

                relationships.add(
                    (
                        commit_id,
                        file_id,
                        RelationshipType.MODIFIED,
                    )
                )

        graph.nodes.extend(commit_nodes.values())

        graph.relationships.extend(
            GraphRelationship(
                source=source,
                target=target,
                type=RelationshipType.MODIFIED,
            )
            for source, target, relationship_type in relationships
        )

        return graph

    def _build_file(
        self,
        path: str,
    ) -> GraphNode:

        return GraphNode(
            id=f"file:{path}",
            label=NodeLabel.FILE,
            properties={
                "path": path,
            },
        )

    def _build_commit(
        self,
        commit: CommitInfo,
    ) -> GraphNode:

        return GraphNode(
            id=f"commit:{commit.hash}",
            label=NodeLabel.COMMIT,
            properties={
                "hash": commit.hash,
                "author": commit.author,
                "email": commit.email,
                "message": commit.message,
                "timestamp": commit.timestamp.isoformat(),
            },
        )
