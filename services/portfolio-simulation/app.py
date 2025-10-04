from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the main application from src/app
try:
    from src.app.main import app
except ImportError as e:
    print(f"Failed to import main application: {e}")
    print("Please ensure the src/app structure is correct")
    # Fallback to basic app if import fails
    app = FastAPI(title="Portfolio Simulation Service (Fallback)")

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "mode": "fallback"}

    @app.get("/")
    async def root():
        return {
            "message": "Portfolio Simulation Service (Fallback Mode)",
            "workers": os.getenv("SIMULATION_WORKERS", 2)
        }

if __name__ == "__main__":
    uvicorn.run(
        "src.app.main:app" if 'src.app.main' in str(type(app)) else "app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8004)),
        workers=int(os.getenv("SIMULATION_WORKERS", 2)),
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )
