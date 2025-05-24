from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import sys
import os

# Add the root directory to Python path to import AI_features
from HandleChromaDB import HandleChromaDB
from Rag import Rag
from PriceAdvisor import PriceAdvisor

# Load environment variables
load_dotenv()

app = FastAPI(
    title="MARK-ED-PLACE RAG Backend",
    description="Backend API for product search, price estimation, and Q&A using RAG",
    version="1.0.0"
)

# Initialize the components
chroma_handler = HandleChromaDB()
rag = Rag()
price_advisor = PriceAdvisor()

class SearchQuery(BaseModel):
    query: str
    k: Optional[int] = 3

class PriceEstimateRequest(BaseModel):
    item_title: str
    item_description: str
    condition: str

class QuestionRequest(BaseModel):
    question: str

@app.post("/search")
async def search_products(query: SearchQuery):
    """
    Search for products using vector similarity search
    """
    try:
        results = rag.retrieve_all_queried_products(query.query, k=query.k)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/price-estimate")
async def get_price_estimate(request: PriceEstimateRequest):
    """
    Get a price estimate for a product based on its condition
    """
    try:
        estimate = price_advisor.get_price_estimate(
            request.item_title,
            request.item_description,
            request.condition
        )
        return {"estimate": estimate}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    """
    Ask a question about products using the RAG system
    """
    try:
        response = rag.ask_question(request.question)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    """
    Initialize the vector database on startup
    """
    try:
        chroma_handler.sync_to_chroma()
    except Exception as e:
        print(f"Error during startup: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 