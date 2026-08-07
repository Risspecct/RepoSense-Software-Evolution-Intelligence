from abc import ABC

from tree_sitter import Parser, Tree
from tree_sitter_language_pack import get_language

from app.models.source_file import SourceFile
from app.parsers.base_parser import BaseParser


class TreeSitterParser(BaseParser, ABC):
    """
    Base implementation for all Tree-sitter based parsers.
    """

    LANGUAGE: str | None = None

    def __init__(self) -> None:
        if self.LANGUAGE is None:
            raise ValueError(
                "LANGUAGE must be defined by subclasses."
            )

        self.language = get_language(self.LANGUAGE)

        self.parser = Parser(self.language)

    def parse(
        self,
        source_file: SourceFile,
    ) -> Tree:
        """
        Parse a source file into a Tree-sitter syntax tree.
        """

        with open(source_file.path, "rb") as file:
            source_code = file.read()

        return self.parser.parse(source_code)
