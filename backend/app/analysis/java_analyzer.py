from tree_sitter import Tree, Node

from app.analysis.base_analyzer import BaseAnalyzer
from app.analysis.models.analysis_result import AnalysisResult
from app.analysis.models.class_info import ClassInfo, ClassType
from app.analysis.models.parameter_info import ParameterInfo
from app.analysis.models.method_info import MethodInfo
from app.analysis.models.field_info import FieldInfo


class JavaAnalyzer(BaseAnalyzer):
    """
    Performs semantic analysis on Java syntax trees.
    """

    def analyze(self, tree: Tree, source_code: bytes,) -> AnalysisResult:
        result = AnalysisResult()

        result.package = self._extract_package(
            tree,
            source_code,
        )

        result.imports = self._extract_imports(
            tree,
            source_code,
        )

        result.classes = self._extract_classes(
            tree,
            source_code,
        )

        return result

    def _extract_package(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> str | None:

        root = tree.root_node

        for child in root.children:

            if child.type != "package_declaration":
                continue

            return (
                source_code[
                    child.start_byte:child.end_byte
                ]
                .decode("utf-8")
                .replace("package", "")
                .replace(";", "")
                .strip()
            )

        return None

    def _extract_imports(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> list[str]:

        imports: list[str] = []

        root = tree.root_node

        for child in root.children:

            if child.type != "import_declaration":
                continue

            import_name = (
                source_code[
                    child.start_byte:child.end_byte
                ]
                .decode("utf-8")
                .replace("import", "")
                .replace(";", "")
                .strip()
            )

            imports.append(import_name)

        return imports

    def _extract_classes(
        self,
        tree: Tree,
        source_code: bytes,
    ) -> list[ClassInfo]:

        classes: list[ClassInfo] = []

        declaration_types = {
            "class_declaration": ClassType.CLASS,
            "interface_declaration": ClassType.INTERFACE,
            "enum_declaration": ClassType.ENUM,
            "record_declaration": ClassType.RECORD,
        }

        for node in tree.root_node.children:

            class_type = declaration_types.get(node.type)

            if class_type is None:
                continue

            class_info = ClassInfo(
                name="",
                type=class_type,
            )

            #
            # Walk children of the declaration
            #
            for child in node.children:

                #
                # Class name
                #
                if child.type == "identifier":

                    class_info.name = (
                        source_code[
                            child.start_byte:child.end_byte
                        ]
                        .decode("utf-8")
                    )

                #
                # Modifiers + annotations
                #
                elif child.type == "modifiers":

                    (
                        class_info.modifiers,
                        class_info.annotations,
                    ) = self._extract_modifiers_and_annotations(
                        child,
                        source_code,
                    )
                #
                # Future grammars / files
                #
                elif child.type == "superclass":

                    class_info.extends = (
                        source_code[
                            child.start_byte:child.end_byte
                        ]
                        .decode("utf-8")
                        .replace("extends", "")
                        .strip()
                    )
                elif child.type == "class_body":
                    self._extract_class_members(
                        child,
                        class_info,
                        source_code,
                    )
                elif child.type == "super_interfaces":

                    text = (
                        source_code[
                            child.start_byte:child.end_byte
                        ]
                        .decode("utf-8")
                        .replace("implements", "")
                    )

                    class_info.implements = [
                        interface.strip()
                        for interface in text.split(",")
                        if interface.strip()
                    ]

            classes.append(class_info)

        return classes

    def _node_text(
        self,
        node: Node,
        source_code: bytes,
    ) -> str:
        """
        Returns the source text represented by a Tree-sitter node.
        """
        return source_code[
            node.start_byte:node.end_byte
        ].decode("utf-8")

    def _extract_modifiers_and_annotations(
        self,
        modifiers_node: Node,
        source_code: bytes,
    ) -> tuple[list[str], list[str]]:
        """
        Extracts Java modifiers and annotations.
        """

        modifiers = set()
        annotations = set()

        for child in modifiers_node.children:

            text = self._node_text(
                child,
                source_code,
            ).strip()

            if child.type in (
                "annotation",
                "marker_annotation",
            ):
                annotations.add(text)

            elif text in {
                "public",
                "private",
                "protected",
                "static",
                "final",
                "abstract",
                "sealed",
                "non-sealed",
                "strictfp",
            }:
                modifiers.add(text)

        return (
            sorted(modifiers),
            sorted(annotations),
        )

    def _extract_parameters(
        self,
        parameters_node: Node,
        source_code: bytes,
    ) -> list[ParameterInfo]:
        """
        Extracts method or constructor parameters.
        """
        parameters: list[ParameterInfo] = []

        for parameter in parameters_node.children:

            if parameter.type != "formal_parameter":
                continue

            parameter_type: str | None = None
            parameter_name: str | None = None

            for child in parameter.children:

                if child.type == "identifier":
                    parameter_name = self._node_text(
                        child,
                        source_code,
                    )

                elif child.type not in {
                    "modifiers",
                    ",",
                }:
                    parameter_type = self._node_text(
                        child,
                        source_code,
                    )

            if parameter_name and parameter_type:

                parameters.append(
                    ParameterInfo(
                        name=parameter_name,
                        type=parameter_type,
                    )
                )

        return parameters

    from tree_sitter import Node

    def _extract_method(
        self,
        method_node: Node,
        source_code: bytes,
        class_name: str,
    ) -> MethodInfo:
        """
        Extracts a Java method or constructor.
        """

        method = MethodInfo(
            name="",
        )

        #
        # Constructor?
        #
        method.is_constructor = (
            method_node.type == "constructor_declaration"
        )

        for child in method_node.children:

            #
            # Modifiers / Annotations
            #
            if child.type == "modifiers":

                (
                    method.modifiers,
                    method.annotations,
                ) = self._extract_modifiers_and_annotations(
                    child,
                    source_code,
                )

            #
            # Parameters
            #
            elif child.type == "formal_parameters":

                method.parameters = (
                    self._extract_parameters(
                        child,
                        source_code,
                    )
                )

            #
            # Method / Constructor name
            #
            elif child.type == "identifier":

                method.name = self._node_text(
                    child,
                    source_code,
                )

            #
            # Return type
            #
            elif (
                not method.is_constructor and method.return_type is None and child.type not in {
                    "modifiers",
                    "formal_parameters",
                    "block",
                    "throws",
                }
            ):

                method.return_type = self._node_text(
                    child,
                    source_code,
                )

        #
        # Constructors have no return type
        #
        if method.is_constructor:
            method.return_type = None

        return method

    def _extract_field(
        self,
        field_node: Node,
        source_code: bytes,
    ) -> FieldInfo:
        """
        Extracts a Java field declaration.
        """

        field = FieldInfo(
            name="",
            type="",
        )

        for child in field_node.children:

            #
            # Modifiers / annotations
            #
            if child.type == "modifiers":

                (
                    field.modifiers,
                    field.annotations,
                ) = self._extract_modifiers_and_annotations(
                    child,
                    source_code,
                )

            #
            # Type
            #
            elif (
                field.type == ""
                and child.type
                not in {
                    "modifiers",
                    "variable_declarator",
                    ";",
                }
            ):

                field.type = self._node_text(
                    child,
                    source_code,
                )

            #
            # Variable
            #
            elif child.type == "variable_declarator":

                for node in child.children:

                    #
                    # Name
                    #
                    if node.type == "identifier":

                        field.name = self._node_text(
                            node,
                            source_code,
                        )

                    #
                    # Initializer
                    #
                    elif node.type == "=":
                        continue

                    else:

                        if field.initializer is None:

                            field.initializer = (
                                self._node_text(
                                    node,
                                    source_code,
                                )
                            )

        return field

    def _extract_class_members(
        self,
        class_body: Node,
        class_info: ClassInfo,
        source_code: bytes,
    ) -> None:
        """
        Extracts fields and methods from a class body.
        """

        for child in class_body.children:

            if child.type == "field_declaration":

                class_info.fields.append(
                    self._extract_field(
                        child,
                        source_code,
                    )
                )

            elif child.type in {
                "method_declaration",
                "constructor_declaration",
            }:

                class_info.methods.append(
                    self._extract_method(
                        child,
                        source_code,
                        class_info.name,
                    )
                )