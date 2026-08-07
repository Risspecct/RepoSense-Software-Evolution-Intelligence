import json
from typing import TypeVar

import google.generativeai as genai
from pydantic import BaseModel, ValidationError

from app.config import settings


T = TypeVar("T", bound=BaseModel)


class GeminiClient:
    """
    Thin wrapper around the Gemini API.

    Responsibilities:
    - Configure Gemini authentication.
    - Send prompts to Gemini.
    - Request JSON responses.
    - Validate responses against Pydantic models.

    RepoSense-specific logic such as summary generation and
    commit analysis should not live in this class.
    """

    def __init__(
        self,
        model_name: str = "gemini-3.6-flash",
    ) -> None:
        if not settings.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is not configured."
            )

        genai.configure(
            api_key=settings.GEMINI_API_KEY,
        )

        self.model = genai.GenerativeModel(
            model_name=model_name,
        )

    def generate_structured(
        self,
        prompt: str,
        response_model: type[T],
    ) -> T:
        """
        Generate a structured Gemini response and validate it
        using the provided Pydantic model.

        Args:
            prompt:
                Prompt sent to Gemini.

            response_model:
                Pydantic model used to validate Gemini's JSON response.

        Returns:
            Validated instance of response_model.

        Raises:
            RuntimeError:
                If Gemini returns an empty response, invalid JSON,
                or data that does not match the expected schema.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                ),
            )

            if not response.text:
                raise RuntimeError(
                    "Gemini returned an empty response."
                )

            data = json.loads(response.text)

            return response_model.model_validate(data)

        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "Gemini returned invalid JSON."
            ) from exc

        except ValidationError as exc:
            raise RuntimeError(
                f"Gemini response did not match "
                f"{response_model.__name__}."
            ) from exc

        except RuntimeError:
            raise

        except Exception as exc:
            raise RuntimeError(
                f"Gemini API request failed: {exc}"
            ) from exc