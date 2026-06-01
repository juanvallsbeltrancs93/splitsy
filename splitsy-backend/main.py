import uvicorn


def run():
    uvicorn.run(
        "src.presentation.rest_api.main:app", host="0.0.0.0", port=8000, reload=True
    )
