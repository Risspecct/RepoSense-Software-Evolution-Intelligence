from typing import Any


class ContextBuilder:
    """
    Converts HybridRetriever output into
    clean repository context suitable for LLMs.
    """

    @staticmethod
    def build(hybrid_result: dict[str, Any]) -> dict[str, Any]:
        """
        Returns

        {
            "question": "...",
            "context": "...",
            "sources": [...]
        }
        """

        graph_context = hybrid_result.get("graph_context", [])

        sections = []
        sources = set()

        for item in graph_context:

            context = item.get("context", {})

            if not context:
                continue

            # ------------------------------------
            # Method Context
            # ------------------------------------

            if "declaring_class" in context:

                section = ContextBuilder._build_method_context(context)

            # ------------------------------------
            # Class Context
            # ------------------------------------

            else:

                section = ContextBuilder._build_class_context(context)

            sections.append(section)

            if context.get("id"):
                sources.add(context["id"])

        return {
            "question": hybrid_result["question"],
            "context": "\n\n".join(sections),
            "sources": sorted(list(sources))
        }

    # ==========================================================
    # Method Context
    # ==========================================================

    @staticmethod
    def _build_method_context(method: dict[str, Any]) -> str:

        lines = []

        lines.append(f"Method: {method.get('name')}")

        declaring = method.get("declaring_class")

        if declaring and declaring.get("name"):

            lines.append(
                f"Belongs To: {declaring['name']}"
            )

        params = method.get("parameter_types") or []

        if params:
            lines.append(
                f"Parameters: {', '.join(params)}"
            )

        if method.get("return_type"):

            lines.append(
                f"Returns: {method['return_type']}"
            )

        siblings = [
            s["name"]
            for s in method.get("sibling_methods", [])
            if s.get("name")
        ]

        if siblings:

            lines.append(
                f"Sibling Methods: {', '.join(siblings)}"
            )

        parents = [
            p["name"]
            for p in method.get("parents", [])
            if p.get("name")
        ]

        if parents:

            lines.append(
                f"Parent Classes: {', '.join(parents)}"
            )

        implemented = [
            i["name"]
            for i in method.get("implemented_types", [])
            if i.get("name")
        ]

        if implemented:

            lines.append(
                f"Implements: {', '.join(implemented)}"
            )

        imports = [
            i["name"]
            for i in method.get("imports", [])
            if i.get("name")
        ]

        if imports:

            lines.append(
                f"Imports: {', '.join(imports)}"
            )

        if method.get("summary"):

            lines.append(
                f"Summary: {method['summary']}"
            )

        return "\n".join(lines)

    # ==========================================================
    # Class Context
    # ==========================================================

    @staticmethod
    def _build_class_context(cls: dict[str, Any]) -> str:

        lines = []

        lines.append(f"Class: {cls.get('name')}")

        if cls.get("type"):

            lines.append(
                f"Type: {cls['type']}"
            )

        if cls.get("extends"):

            lines.append(
                f"Extends: {cls['extends']}"
            )

        implements = cls.get("implements") or []

        if implements:

            lines.append(
                f"Implements: {', '.join(implements)}"
            )

        methods = []

        for method in cls.get("methods", []):

            if method.get("name"):

                methods.append(method["name"])

        if methods:

            lines.append("Methods:")

            for m in methods:
                lines.append(f"  - {m}")

        imports = [
            i["name"]
            for i in cls.get("imports", [])
            if i.get("name")
        ]

        if imports:

            lines.append(
                f"Imports: {', '.join(imports)}"
            )

        if cls.get("summary"):

            lines.append(
                f"Summary: {cls['summary']}"
            )

        return "\n".join(lines)