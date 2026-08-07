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
