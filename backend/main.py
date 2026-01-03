from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services import DataLoader
from typing import List
from app.models import NarrativeNode

app = FastAPI(title="Secular Forum Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all. In prod, lock this down.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Secular Forum API is running", "status": "ok"}

@app.get("/api/outlooks")
async def get_outlooks():
    data = DataLoader.get_outlooks()
    return data

@app.get("/api/narrative-river", response_model=List[NarrativeNode])
async def get_narrative_river():
    return DataLoader.get_narrative_river_data()


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
