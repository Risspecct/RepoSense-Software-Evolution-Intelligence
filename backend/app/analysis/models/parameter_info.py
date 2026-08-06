from pydantic import BaseModel


class ParameterInfo(BaseModel):
    """
    Represents a method or constructor parameter.
    """

    name: str

    type: str
