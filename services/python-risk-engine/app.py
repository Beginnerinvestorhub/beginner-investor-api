from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import the main application from src
from src.app import app

if __name__ == "__main__":
    uvicorn.run(
        "src.app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8003)),
        workers=int(os.getenv("RISK_CALCULATION_WORKERS", 4)),
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )
