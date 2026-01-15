import torch
import torch.nn.functional as F
import torch.nn as nn
import torchvision.models as models
import numpy as np
from PIL import Image
from pathlib import Path
import os

# TensorFlow
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import tensorflow as tf
from keras.preprocessing.image import load_img, img_to_array

# ---------------- CONFIG ----------------
BASE_DIR = Path(__file__).resolve().parent
PAINTING_MODEL_PATH = BASE_DIR/"models"/"isPainting.keras"
STYLE_MODEL_PATH    = BASE_DIR/"models"/"style_classifier.pt"

ERA_CLASSES = [
    "art_nouveau", "baroque", "expressionism",
    "impressionism", "post_impressionism", "realism",
    "renaissance", "romanticism", "surrealism", "ukiyo_e",
]

DEVICE = "cpu"

# ---------------- LAZY MODEL LOADERS ----------------

_painting_model = None
_style_model = None

def get_painting_model():
    global _painting_model
    if _painting_model is None:
        _painting_model = tf.keras.models.load_model(PAINTING_MODEL_PATH)
    return _painting_model

def get_style_model():
    global _style_model
    if _style_model is None:
        model = models.efficientnet_b3(weights=None)
        num_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(num_features, len(ERA_CLASSES))

        state_dict = torch.load(STYLE_MODEL_PATH, map_location="cpu")
        model.load_state_dict(state_dict)
        model.eval()
        _style_model = model
    return _style_model

# ---------------- PREPROCESSING ----------------

def preprocess_for_painting(img_path):
    img = load_img(img_path, target_size=(224, 224))
    x = img_to_array(img) / 255.0
    return np.expand_dims(x, axis=0)

def preprocess_for_style(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((224, 224))
    x = np.array(img) / 255.0

    mean = np.array([0.485, 0.456, 0.406])
    std  = np.array([0.229, 0.224, 0.225])

    x = (x - mean) / std
    x = np.transpose(x, (2, 0, 1))
    return torch.tensor(x, dtype=torch.float32).unsqueeze(0).to(DEVICE)

# ---------------- CORE INFERENCE FUNCTION ----------------

def predict(image_path: str):
    if not os.path.exists(image_path):
        raise FileNotFoundError("Image not found")

    # --- Painting detector ---
    x_paint = preprocess_for_painting(image_path)
    painting_model = get_painting_model()
    pred = painting_model.predict(x_paint, verbose=0)[0][0]


    is_painting = pred <= 0.7
    print(f"Painting Detector Confidence: {pred:.4f} -> isPainting: {is_painting}")
    if not is_painting:
        return { "isPainting": False }

    # --- Style classifier ---
    x_style = preprocess_for_style(image_path)

    style_model = get_style_model()
    with torch.no_grad():
        logits = style_model(x_style)
        probs = F.softmax(logits, dim=1)[0].cpu().numpy()
  
    top_indices = probs.argsort()[-2:][::-1]
    predictions = [
        {
            "era": ERA_CLASSES[i],
            "confidence": float(probs[i])
        }
        for i in top_indices
    ]
    return {
        "isPainting": True,
        "predictions": predictions
    }
