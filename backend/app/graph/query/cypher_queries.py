CLASS_PROJECTION = """
{
    id: c.id,
    name: c.name,
    type: c.type,
    modifiers: c.modifiers,
    annotations: c.annotations,
    extends: c.extends,
    implements: c.implements
}
"""

METHOD_PROJECTION = """
{
    id: m.id,
    name: m.name,
    modifiers: m.modifiers,
    annotations: m.annotations,
    is_constructor: m.is_constructor,
    parameter_names: m.parameter_names,
    parameter_types: m.parameter_types,
    return_type: m.return_type
}
"""

FIELD_PROJECTION = """
{
    id: f.id,
    name: f.name,
    type: f.type,
    modifiers: f.modifiers,
    annotations: f.annotations,
    initializer: f.initializer
}
"""

DEPENDENCY_CLASS_PROJECTION = """
{
    id: dependency.id,
    name: dependency.name,
    type: dependency.type,
    modifiers: dependency.modifiers,
    annotations: dependency.annotations,
    extends: dependency.extends,
    implements: dependency.implements
}
"""

DEPENDENT_CLASS_PROJECTION = """
{
    id: dependent.id,
    name: dependent.name,
    type: dependent.type,
    modifiers: dependent.modifiers,
    annotations: dependent.annotations,
    extends: dependent.extends,
    implements: dependent.implements
}
"""

FIND_CLASS = f"""
MATCH (c:Class {{name: $name}})
RETURN {CLASS_PROJECTION} AS class
LIMIT 1
"""

FIND_CLASS_BY_ID = """
MATCH (c:Class {id: $class_id})
RETURN c.id AS class_id
LIMIT 1
"""

GET_CLASS_HISTORY = """
MATCH (c:Class {id: $class_id})<-[:CONTAINS]-(f:File)<-[:MODIFIED]-(commit:Commit)
RETURN
    commit.hash AS hash,
    commit.message AS message,
    commit.author AS author,
    commit.email AS email,
    commit.timestamp AS timestamp,
    f.path AS file_path
ORDER BY commit.timestamp DESC
"""

FIND_METHOD = f"""
MATCH (m:Method {{name: $name}})
RETURN {METHOD_PROJECTION} AS method
ORDER BY method.id
"""

GET_CLASS_METHODS = f"""
MATCH (:Class {{id: $class_id}})-[:DECLARES]->(m:Method)
RETURN {METHOD_PROJECTION} AS method
ORDER BY method.name, method.id
"""

GET_CLASS_FIELDS = f"""
MATCH (:Class {{id: $class_id}})-[:HAS_FIELD]->(f:Field)
RETURN {FIELD_PROJECTION} AS field
ORDER BY field.name, field.id
"""

GET_DEPENDENCIES = f"""
MATCH (c:Class {{id: $class_id}})-[r:IMPORTS|EXTENDS|IMPLEMENTS]->(dependency:Class)
WITH type(r) AS relationship_type, dependency
ORDER BY dependency.name, dependency.id
RETURN relationship_type, collect({DEPENDENCY_CLASS_PROJECTION}) AS nodes
"""

GET_DEPENDENTS = f"""
MATCH (dependent:Class)-[r:IMPORTS|EXTENDS|IMPLEMENTS]->(:Class {{id: $class_id}})
WITH type(r) AS relationship_type, dependent
ORDER BY dependent.name, dependent.id
RETURN relationship_type, collect({DEPENDENT_CLASS_PROJECTION}) AS nodes
"""

GET_CLASS_SUBGRAPH = """
MATCH (class:Class {id: $class_id})

OPTIONAL MATCH (class)-[outgoing:DECLARES|HAS_FIELD|IMPORTS|EXTENDS|IMPLEMENTS]->(outgoing_node)

OPTIONAL MATCH (incoming_node:Class)-[incoming:IMPORTS|EXTENDS|IMPLEMENTS]->(class)

WITH
    collect(DISTINCT class) +
    collect(DISTINCT outgoing_node) +
    collect(DISTINCT incoming_node) AS nodes,

    collect(DISTINCT outgoing) +
    collect(DISTINCT incoming) AS relationships

RETURN
[
    node IN nodes
    WHERE node IS NOT NULL |
    {
        id: node.id,
        label: head(labels(node)),
        properties: properties(node)
    }
] AS nodes,

[
    relationship IN relationships
    WHERE relationship IS NOT NULL |
    {
        source: startNode(relationship).id,
        target: endNode(relationship).id,
        type: type(relationship)
    }
] AS relationships
"""
