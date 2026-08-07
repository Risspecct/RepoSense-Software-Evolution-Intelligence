from typing import Any

from app.graph.neo4j_client import neo4j_client


class GraphRetriever:
    """
    Expands semantic seed nodes using structural
    relationships stored in the repository graph.
    """

    def __init__(self):
        neo4j_client.connect()

    def expand_seeds(
        self,
        seeds: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """
        Expand Class and Method seed nodes into
        relevant structural graph context.
        """

        if not seeds:
            return []

        expanded_results = []

        for seed in seeds:

            seed_id = seed.get("id")
            seed_type = seed.get("seed_type")

            if not seed_id:
                continue

            if seed_type == "class":
                context = self._expand_class(seed_id)

            elif seed_type == "method":
                context = self._expand_method(seed_id)

            else:
                continue

            if context:
                expanded_results.append({
                    "seed": seed,
                    "context": context,
                })

        return expanded_results

    def _expand_class(
        self,
        class_id: str
    ) -> dict[str, Any]:
        """
        Expand a Class seed.

        Retrieves:
        - class metadata
        - declared methods
        - parent classes
        - implemented interfaces/classes
        - imported repository classes
        """

        query = """
        MATCH (c:Class {id: $id})

        OPTIONAL MATCH (c)-[:DECLARES]->(m:Method)

        OPTIONAL MATCH (c)-[:EXTENDS]->(parent:Class)

        OPTIONAL MATCH (c)-[:IMPLEMENTS]->(implemented:Class)

        OPTIONAL MATCH (c)-[:IMPORTS]->(imported:Class)

        RETURN
            c.id AS id,
            c.name AS name,
            c.type AS type,
            c.summary AS summary,
            c.extends AS extends,
            c.implements AS implements,

            collect(DISTINCT {
                id: m.id,
                name: m.name,
                summary: m.summary,
                return_type: m.return_type,
                parameter_types: m.parameter_types
            }) AS methods,

            collect(DISTINCT {
                id: parent.id,
                name: parent.name
            }) AS parents,

            collect(DISTINCT {
                id: implemented.id,
                name: implemented.name
            }) AS implemented_types,

            collect(DISTINCT {
                id: imported.id,
                name: imported.name
            }) AS imports
        """

        results = neo4j_client.execute_query(
            query,
            {"id": class_id}
        )

        if not results:
            return {}

        return dict(results[0])

    def _expand_method(
        self,
        method_id: str
    ) -> dict[str, Any]:
        """
        Expand a Method seed.

        Retrieves:
        - method metadata
        - declaring class
        - sibling methods
        - class inheritance
        - class implementations
        - imported repository classes
        """

        query = """
        MATCH (m:Method {id: $id})

        OPTIONAL MATCH (c:Class)-[:DECLARES]->(m)

        OPTIONAL MATCH (c)-[:DECLARES]->(sibling:Method)
        WHERE sibling.id <> m.id

        OPTIONAL MATCH (c)-[:EXTENDS]->(parent:Class)

        OPTIONAL MATCH (c)-[:IMPLEMENTS]->(implemented:Class)

        OPTIONAL MATCH (c)-[:IMPORTS]->(imported:Class)

        RETURN
            m.id AS id,
            m.name AS name,
            m.summary AS summary,
            m.annotations AS annotations,
            m.parameter_names AS parameter_names,
            m.parameter_types AS parameter_types,
            m.return_type AS return_type,

            {
                id: c.id,
                name: c.name,
                summary: c.summary,
                type: c.type
            } AS declaring_class,

            collect(DISTINCT {
                id: sibling.id,
                name: sibling.name,
                summary: sibling.summary
            }) AS sibling_methods,

            collect(DISTINCT {
                id: parent.id,
                name: parent.name
            }) AS parents,

            collect(DISTINCT {
                id: implemented.id,
                name: implemented.name
            }) AS implemented_types,

            collect(DISTINCT {
                id: imported.id,
                name: imported.name
            }) AS imports
        """

        results = neo4j_client.execute_query(
            query,
            {"id": method_id}
        )

        if not results:
            return {}

        return dict(results[0])