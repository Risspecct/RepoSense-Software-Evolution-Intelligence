from app.parsers.base_parser import BaseParser
from app.models.source_file import SourceFile


class JavaParser(BaseParser):

    def parse(self, source_file: SourceFile):
        raise NotImplementedError
