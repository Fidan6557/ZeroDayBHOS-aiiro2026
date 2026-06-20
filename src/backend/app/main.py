from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import health, scan, simulate, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        from app.seed import _seed
        await _seed()
    except Exception:
        pass
    yield


app = FastAPI(title="AgentShield API", version="1.0.0", lifespan=lifespan)

origins = []
for o in settings.cors_origins.split(","):
    o = o.strip()
    if not o:
        continue
    if not o.startswith("http"):
        o = f"https://{o}"
    origins.append(o)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(scan.router)
app.include_router(stats.router)
app.include_router(simulate.router)
