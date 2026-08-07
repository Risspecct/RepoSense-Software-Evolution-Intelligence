from app.models.source_file import ProgrammingLanguage

from app.parsers.java_parser import JavaParser
from app.parsers.python_parser import PythonParser
from app.parsers.javascript_parser import JavaScriptParser
from app.parsers.typescript_parser import TypeScriptParser


class ParserFactory:

    def __init__(self):
        self.parsers = {
            ProgrammingLanguage.JAVA: JavaParser(),
            ProgrammingLanguage.PYTHON: PythonParser(),
            ProgrammingLanguage.JAVASCRIPT: JavaScriptParser(),
            ProgrammingLanguage.TYPESCRIPT: TypeScriptParser(),
        }

    def get_parser(self, language: ProgrammingLanguage):
        parser = self.parsers.get(language)

        if parser is None:
            raise ValueError(f"No parser registered for {language}")

        return parser
