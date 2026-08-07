from enum import StrEnum


class NodeLabel(StrEnum):
    PACKAGE = "Package"
    CLASS = "Class"
    FIELD = "Field"
    METHOD = "Method"
    COMMIT = "Commit"
    FILE = "File"


class RelationshipType(StrEnum):
    CONTAINS = "CONTAINS"
    DECLARES = "DECLARES"
    HAS_FIELD = "HAS_FIELD"
    EXTENDS = "EXTENDS"
    IMPLEMENTS = "IMPLEMENTS"
    IMPORTS = "IMPORTS"
    MODIFIED = "MODIFIED"
