from app.intelligence.gemini_client import GeminiClient
from app.intelligence.models import BatchSummaryResult


def test_gemini():
    print("Starting Gemini test...")

    client = GeminiClient()

    prompt = """
You are generating semantic summaries for methods in a software repository.

Generate one concise summary for EVERY method provided.

Requirements:
- Preserve node_id exactly.
- Generate exactly one summary per method.
- Describe the semantic responsibility of the method.
- Keep each summary concise and preferably one sentence.
- Do not include markdown.
- Do not invent behavior not supported by the provided metadata.

Return only valid JSON in exactly this structure:

{
  "summaries": [
    {
      "node_id": "exact method id",
      "summary": "concise semantic summary"
    }
  ]
}

Methods:

[
  {
    "node_id": "com.example.UserService.createUser",
    "name": "createUser",
    "modifiers": ["public"],
    "annotations": [],
    "is_constructor": false,
    "parameter_names": ["name", "email"],
    "parameter_types": ["String", "String"],
    "return_type": "User"
  },
  {
    "node_id": "com.example.UserService.deleteUser",
    "name": "deleteUser",
    "modifiers": ["public"],
    "annotations": [],
    "is_constructor": false,
    "parameter_names": ["userId"],
    "parameter_types": ["Long"],
    "return_type": "void"
  },
  {
    "node_id": "com.example.UserService.findUser",
    "name": "findUser",
    "modifiers": ["public"],
    "annotations": [],
    "is_constructor": false,
    "parameter_names": ["userId"],
    "parameter_types": ["Long"],
    "return_type": "User"
  }
]
""".strip()

    try:
        result = client.generate_structured(
            prompt=prompt,
            response_model=BatchSummaryResult,
        )

        print("\nGemini API call successful!")
        print("=" * 60)

        print(f"\nReturned summaries: {len(result.summaries)}")

        for index, item in enumerate(
            result.summaries,
            start=1,
        ):
            print(f"\nSummary {index}")
            print(f"Node ID : {item.node_id}")
            print(f"Summary : {item.summary}")

        print("\n" + "=" * 60)

        expected_ids = {
            "com.example.UserService.createUser",
            "com.example.UserService.deleteUser",
            "com.example.UserService.findUser",
        }

        returned_ids = {
            item.node_id
            for item in result.summaries
        }

        if returned_ids != expected_ids:
            print("\nWARNING: Gemini did not return the expected node IDs.")
            print(f"Expected: {expected_ids}")
            print(f"Returned: {returned_ids}")
            return

        for item in result.summaries:
            if not item.summary.strip():
                print(
                    f"\nWARNING: Empty summary returned for "
                    f"{item.node_id}"
                )
                return

        print("\nTEST PASSED")
        print("Gemini structured summary generation is working.")

    except Exception as exc:
        print("\nTEST FAILED")
        print(f"Error type: {type(exc).__name__}")
        print(f"Error: {exc}")

        raise


if __name__ == "__main__":
    test_gemini()