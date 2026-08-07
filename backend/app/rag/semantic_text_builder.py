class SemanticTextBuilder:
    """
    Converts repository entities into semantic text
    suitable for embedding.
    """

    @staticmethod
    def build_class_text(class_data: dict) -> str:

        name = class_data.get("name") or "Unknown"
        class_type = class_data.get("type") or "class"

        annotations = class_data.get("annotations") or []
        implements = class_data.get("implements") or []

        extends = class_data.get("extends")
        summary = class_data.get("summary")

        parts = [
            f"Class: {name}",
            f"Type: {class_type}",
        ]

        if annotations:
            parts.append(
                f"Annotations: {', '.join(annotations)}"
            )

        if extends:
            parts.append(
                f"Extends: {extends}"
            )

        if implements:
            parts.append(
                f"Implements: {', '.join(implements)}"
            )

        if summary:
            parts.append(
                f"Description: {summary}"
            )

        return "\n".join(parts)

    @staticmethod
    def build_method_text(method_data: dict) -> str:

        name = method_data.get("name") or "Unknown"

        parameter_names = (
            method_data.get("parameter_names") or []
        )

        parameter_types = (
            method_data.get("parameter_types") or []
        )

        return_type = (
            method_data.get("return_type") or "void"
        )

        annotations = (
            method_data.get("annotations") or []
        )

        summary = method_data.get("summary")

        parameters = []

        for index, param_type in enumerate(parameter_types):

            param_name = (
                parameter_names[index]
                if index < len(parameter_names)
                else f"param{index + 1}"
            )

            parameters.append(
                f"{param_type} {param_name}"
            )

        parts = [
            f"Method: {name}",
            f"Signature: ({', '.join(parameters)}) -> {return_type}",
        ]

        if annotations:
            parts.append(
                f"Annotations: {', '.join(annotations)}"
            )

        if summary:
            parts.append(
                f"Description: {summary}"
            )

        return "\n".join(parts)