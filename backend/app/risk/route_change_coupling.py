from fastapi import APIRouter, HTTPException

from app.risk.change_coupling import calculate_change_coupling

router = APIRouter(
    prefix="/change-coupling",
    tags=["Change Coupling"],
)


@router.get("/")
def get_change_coupling():
    """
    Calculate and return change coupling analysis.
    """

    try:
        result = calculate_change_coupling()

        return {
            "status": "success",
            "count": len(result),
            "data": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )