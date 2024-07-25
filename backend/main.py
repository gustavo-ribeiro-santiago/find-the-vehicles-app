from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import torch
import uvicorn
from PIL import Image
import io

# Load YOLOv5 model
model = torch.hub.load("ultralytics/yolov5", "custom", path="model.pt", trust_repo=True)

app = FastAPI()

origins = [
  "http://localhost:3000",  # frontend URL
  "http://127.0.0.1:3000",
  "https://find-the-vehicles.vercel.app",
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

class Box(BaseModel):
  label: str
  confidence: float
  xmin: float
  ymin: float
  xmax: float
  ymax: float

@app.post("/predict/", response_model=List[Box])
async def predict(file: UploadFile = File(...)):
  contents = await file.read()
  image = Image.open(io.BytesIO(contents)).convert("RGB")
  results = model(image)

  boxes = []
  for result in results.xyxy[0].cpu().numpy():
    xmin, ymin, xmax, ymax, confidence, cls = result
    label = model.names[int(cls)]
    boxes.append(
      Box(
        label=label,
        confidence=confidence,
        xmin=xmin,
        ymin=ymin,
        xmax=xmax,
        ymax=ymax,
      )
    )

  return boxes

if __name__ == "__main__":
  uvicorn.run(app, host="0.0.0.0", port=8000)
