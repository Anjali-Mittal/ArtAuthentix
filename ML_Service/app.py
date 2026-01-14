from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from inference import predict
import os

app = FastAPI()

class InferenceRequest(BaseModel):
    image_path: str

@app.post("/infer")
def infer(req: InferenceRequest):
    try:
        return predict(req.image_path)
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="Image not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run the app, use the command: uvicorn app:app --host 127.0.0.1 --port 8000
