from abc import ABC, abstractmethod

from app.models.source_file import SourceFile


class BaseParser(ABC):
    """
    Base contract for all language parsers.
    """

    @abstractmethod
    def parse(self, source_file: SourceFile):
        """
        Parse a source file and return its syntax tree.
        """
        pass
