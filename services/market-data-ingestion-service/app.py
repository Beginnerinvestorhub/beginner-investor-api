from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
import asyncio
from datetime import datetime

# Load environment variables
load_dotenv()

app = FastAPI(title="Market Data Service")

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
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/")
async def root():
    return {"message": "Market Data Ingestion Service"}

# Add market data ingestion background task
async def ingest_market_data():
    while True:
        try:
            # TODO: Implement data ingestion logic
            await asyncio.sleep(int(os.getenv("DATA_INGESTION_INTERVAL", 300)))
        except Exception as e:
            print(f"Error in market data ingestion: {e}")
            await asyncio.sleep(60)  # Wait before retry

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(ingest_market_data())

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8001)),
        reload=os.getenv("DEBUG", "false").lower() == "true"
    )
