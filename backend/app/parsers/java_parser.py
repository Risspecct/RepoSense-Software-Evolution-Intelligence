from app.parsers.tree_sitter_parser import TreeSitterParser
from app.models.source_file import SourceFile


class JavaParser(TreeSitterParser):
    LANGUAGE = "java"

    def parse(self, source_file: SourceFile):
        return super().parse(source_file)
