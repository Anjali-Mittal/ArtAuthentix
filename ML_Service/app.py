from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import tempfile
import os

from inference import predict

app = FastAPI()

class InferenceRequest(BaseModel):
    image_url: str

@app.post("/infer")
def infer(req: InferenceRequest):
    try:
        # Download image from URL
        response = requests.get(req.image_url, timeout=10)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image")

        # Save to temp file (HF-safe)
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            tmp.write(response.content)
            temp_path = tmp.name

        # Run prediction
        result = predict(temp_path)

        # Cleanup
        os.remove(temp_path)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# To run the app, use the command: uvicorn app:app --host 127.0.0.1 --port 8000
