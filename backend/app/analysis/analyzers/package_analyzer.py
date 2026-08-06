from tree_sitter import Node


class PackageAnalyzer:
    """
    Extracts the package declaration from a Java syntax tree.
    """

    def analyze(
        self,
        root_node: Node,
        source_code: bytes,
    ) -> str | None:
        for child in root_node.children:
            if child.type != "package_declaration":
                continue

            return (
                source_code[child.start_byte:child.end_byte]
                .decode("utf-8")
                .replace("package", "")
                .replace(";", "")
                .strip()
            )

        return None
