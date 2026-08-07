from fastapi.testclient import TestClient

from app.main import app


DEMO_CLASS_NAME = "UserService"
DEMO_CLASS_ID = "users.java.LifeOS.user.UserService"
DEMO_METHOD_NAME = "getAuthorities"


def _print_response(
    label: str,
    response,
) -> None:
    print(f"\n=== {label} ===")
    print(f"status_code={response.status_code}")
    print(response.json())


def main() -> None:
    with TestClient(app) as client:
        _print_response(
            "find_class",
            client.get(
                f"/graph/classes/{DEMO_CLASS_NAME}"
            ),
        )
        _print_response(
            "find_methods",
            client.get(
                f"/graph/methods/{DEMO_METHOD_NAME}"
            ),
        )
        _print_response(
            "get_class_methods",
            client.get(
                f"/graph/classes/{DEMO_CLASS_ID}/methods"
            ),
        )
        _print_response(
            "get_class_fields",
            client.get(
                f"/graph/classes/{DEMO_CLASS_ID}/fields"
            ),
        )
        _print_response(
            "get_dependencies",
            client.get(
                f"/graph/classes/{DEMO_CLASS_ID}/dependencies"
            ),
        )
        _print_response(
            "get_dependents",
            client.get(
                f"/graph/classes/{DEMO_CLASS_ID}/dependents"
            ),
        )


if __name__ == "__main__":
    main()
