from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from .database import Base, engine
from .routes import plays, auth, actors, tickets, directors, showtimes, seats, showtime_prices

app = FastAPI(
    title="Sierra Leone Concert Association API",
    description="REST API for managing concerts, plays, actors, tickets, and more.",
    version="1.0.0"
)

# ✅ Add CORS settings
import logging

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_origin_regex=".*",  # Allow all localhost origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    logging.info(f"CORS preflight for: {rest_of_path}")
    return {"message": "CORS preflight OK"}


# Create database tables
Base.metadata.create_all(bind=engine)

# Mount the routers
app.include_router(auth.router)
app.include_router(plays.router)
app.include_router(actors.router)
app.include_router(tickets.router)
app.include_router(directors.router)
app.include_router(showtimes.router)
app.include_router(seats.router)
app.include_router(showtime_prices.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Sierra Leone Concert Association API"}
