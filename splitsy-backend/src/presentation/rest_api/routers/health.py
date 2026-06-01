from fastapi import APIRouter
from fastapi_health import health

router = APIRouter()


def healthy_condition() -> dict:
    return {"application": "online"}


router.add_api_route(
    "/_health",
    health(conditions=[healthy_condition]),
    summary="Health check",
)
