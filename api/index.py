# quantum-routing-simulator/api/index.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import httpx, os

COMPUTE_SERVER_URL = os.getenv("COMPUTE_SERVER_URL_Q", "http://14.232.208.84:8888")
app = FastAPI(title="PoC#4 Vercel Proxy")

@app.post("/api/solve-routing")
async def proxy_solve_routing(request: Request):
    try:
        payload = await request.json()
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{COMPUTE_SERVER_URL}/solve-routing", json=payload, timeout=15.0)
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))

@app.get("/api/get-status/{task_id}")
async def proxy_get_status(task_id: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{COMPUTE_SERVER_URL}/get-status/{task_id}", timeout=10.0)
        response.raise_for_status()
        return JSONResponse(content=response.json())
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
