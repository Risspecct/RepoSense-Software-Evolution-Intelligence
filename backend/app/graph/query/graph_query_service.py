from app.graph.neo4j_client import Neo4jClient
from app.graph.query.cypher_queries import (
    FIND_CLASS,
    FIND_CLASS_BY_ID,
    FIND_METHOD,
    GET_CLASS_FIELDS,
    GET_CLASS_HISTORY,
    GET_CLASS_METHODS,
    GET_DEPENDENCIES,
    GET_DEPENDENTS,
    GET_ALL_CLASSES,
    GET_ALL_METHODS,
    GET_METHOD_CONTEXT,
    GET_CLASS_SUMMARY_CONTEXT,
    UPDATE_METHOD_SUMMARY,
    UPDATE_CLASS_SUMMARY,
    GET_FILE_CODE_NODES,
    UPDATE_COMMIT_INTENT,    
)


class GraphQueryService:

    def __init__(
        self,
        client: Neo4jClient,
    ):
        self.client = client

    def find_class(
        self,
        class_name: str,
    ) -> dict | None:
        rows = self.client.execute_query(
            FIND_CLASS,
            {"name": class_name},
        )

        if not rows:
            return None

        return rows[0]["class"]

    def find_method(
        self,
        method_name: str,
    ) -> list[dict]:
        rows = self.client.execute_query(
            FIND_METHOD,
            {"name": method_name},
        )

        return [
            row["method"]
            for row in rows
        ]

    def get_class_methods(
        self,
        class_id: str,
    ) -> list[dict]:
        rows = self.client.execute_query(
            GET_CLASS_METHODS,
            {"class_id": class_id},
        )

        return [
            row["method"]
            for row in rows
        ]
    
    def get_all_classes(self) -> list[dict]:
        """
        Return all Class nodes available for summarization.
        """
        rows = self.client.execute_query(
            GET_ALL_CLASSES,
        )

        return [
            row["class"]
            for row in rows
        ]

    def get_all_methods(self) -> list[dict]:
        """
        Return all Method nodes together with their owning class.
        """
        rows = self.client.execute_query(
            GET_ALL_METHODS,
        )

        return [
            {
                "method": row["method"],
                "class_id": row["class_id"],
                "class_name": row["class_name"],
            }
            for row in rows
        ]

    def get_method_context(
        self,
        method_id: str,
    ) -> dict | None:
        """
        Return graph context required to summarize a Method.
        """
        rows = self.client.execute_query(
            GET_METHOD_CONTEXT,
            {"method_id": method_id},
        )

        if not rows:
            return None

        row = rows[0]

        return {
            "method": row["method"],
            "class": row["class"],
            "fields": [
                field
                for field in row["fields"]
                if field is not None
            ],
        }

    def get_class_summary_context(
        self,
        class_id: str,
    ) -> dict | None:
        """
        Return graph context required to summarize a Class.
        """
        rows = self.client.execute_query(
            GET_CLASS_SUMMARY_CONTEXT,
            {"class_id": class_id},
        )

        if not rows:
            return None

        row = rows[0]

        return {
            "class": row["class"],
            "methods": [
                method
                for method in row["methods"]
                if method is not None
            ],
            "dependencies": [
                dependency
                for dependency in row["dependencies"]
                if dependency is not None
            ],
        }

    def update_method_summary(
        self,
        method_id: str,
        summary: str,
    ) -> bool:
        """
        Update the summary stored on a Method node.
        """
        rows = self.client.execute_query(
            UPDATE_METHOD_SUMMARY,
            {
                "method_id": method_id,
                "summary": summary,
            },
        )

        return bool(rows)

    def update_class_summary(
        self,
        class_id: str,
        summary: str,
    ) -> bool:
        """
        Update the summary stored on a Class node.
        """
        rows = self.client.execute_query(
            UPDATE_CLASS_SUMMARY,
            {
                "class_id": class_id,
                "summary": summary,
            },
        )

        return bool(rows)
    def get_class_fields(
        self,
        class_id: str,
    ) -> list[dict]:
        rows = self.client.execute_query(
            GET_CLASS_FIELDS,
            {"class_id": class_id},
        )

        return [
            row["field"]
            for row in rows
        ]

    def get_class_history(
        self,
        class_id: str,
    ) -> list[dict]:
        rows = self.client.execute_query(
            GET_CLASS_HISTORY,
            {"class_id": class_id},
        )

        return [
            {
                "hash": row["hash"],
                "message": row["message"],
                "author": row["author"],
                "email": row["email"],
                "timestamp": row["timestamp"],
                "file_path": row["file_path"],
                "intent": row["intent"],
            }
            for row in rows
        ]

    def get_dependencies(
        self,
        class_id: str,
    ) -> dict:
        if not self._class_exists(class_id):
            return {}

        grouped = self._empty_dependency_groups()
        rows = self.client.execute_query(
            GET_DEPENDENCIES,
            {"class_id": class_id},
        )

        for row in rows:
            group_name = row["relationship_type"].lower()
            grouped[group_name] = row["nodes"]

        return grouped

    def get_dependents(
        self,
        class_id: str,
    ) -> dict:
        if not self._class_exists(class_id):
            return {}

        grouped = self._empty_dependency_groups()
        rows = self.client.execute_query(
            GET_DEPENDENTS,
            {"class_id": class_id},
        )

        for row in rows:
            group_name = row["relationship_type"].lower()
            grouped[group_name] = row["nodes"]

        return grouped

    def _class_exists(
        self,
        class_id: str,
    ) -> bool:
        rows = self.client.execute_query(
            FIND_CLASS_BY_ID,
            {"class_id": class_id},
        )
        return bool(rows)

    def _empty_dependency_groups(
        self,
    ) -> dict[str, list[dict]]:
        return {
            "imports": [],
            "extends": [],
            "implements": [],
        }
    
    def get_file_code_nodes(
        self,
        file_path: str,
    ) -> list[dict]:
        """
        Return all Class and Method nodes contained in a source file.

        A Java file may contain more than one Class, so every
        matched Class context is returned.
        """

        rows = self.client.execute_query(
            GET_FILE_CODE_NODES,
            {"file_path": file_path},
        )

        return [
            {
                "class": row["class"],
                "methods": [
                    method
                    for method in row["methods"]
                    if method is not None
                ],
            }
            for row in rows
        ]        
        
    def update_commit_intent(
        self,
        commit_hash: str,
        intent: str,
    ) -> bool:
        """
        Update the AI-generated intent stored on a Commit node.
        """
        rows = self.client.execute_query(
            UPDATE_COMMIT_INTENT,
            {
                "commit_hash": commit_hash,
                "intent": intent,
            },
        )

        return bool(rows)        