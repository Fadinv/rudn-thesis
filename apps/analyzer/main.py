from fastapi import FastAPI
from routers.optimization_routes import router as optimization_router

app = FastAPI()

app.include_router(optimization_router)