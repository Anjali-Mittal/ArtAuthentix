# ArtAuthentix

🔗 **Live Application**  
[ArtAuthentix](https://artauthentix.onrender.com/)

ArtAuthentix is a **production-ready, cloud-native full-stack application** that analyzes uploaded artworks using machine learning to determine whether an image is a painting and, if so, predicts its most likely art periods with confidence scores.

The system is built using a **decoupled, service-oriented architecture**, where a Render-hosted backend communicates securely over HTTPS with a Hugging Face–hosted ML inference service and Cloudinary-backed media storage to deliver a scalable, stateless user experience.

---


## 🌟 Core Functionalities

### 🔐 Authentication & Authorization
- User signup, login, and logout  
- Secure session-based authentication  
- Authorization enforced for:
  - Uploading paintings
  - Deleting paintings (owner only)
  - Upvoting paintings  

---

### 🖼️ Painting Upload & Validation
- Image uploads handled via **Multer**
- Strict validation pipeline:
  - Allowed formats: JPG, PNG, WEBP
  - File size limits enforced
- Images are uploaded to **Cloudinary** for persistent storage
- Automatic safeguards:
  - Non-painting images are rejected
  - Invalid uploads never reach the database

---

### 🧠 Machine Learning Inference (Deployed Microservice)
ArtAuthentix uses a **separately deployed FastAPI ML service**.

**Inference Pipeline**
1. Painting detection using a binary classifier  
2. Art period classification for confirmed paintings  
3. Top-2 predicted art periods returned with confidence scores  

The ML service is accessed via HTTPS and operates independently of the backend.

---

### 📊 Results Visualization
- Dedicated analysis page per painting
- Displays:
  - Uploaded artwork
  - Predicted art periods
  - Confidence bars
- Route:
```bash
  /painting/:id/results
```
---

### 🖼 Community Gallery
- Responsive card-based homepage layout
- Displays top paintings ranked by engagement
- Each card includes:
  - Artwork preview
  - Uploader name
  - Upload date
  - Upvote count
  - View Results button

---

### 🔼 Upvote System
- One upvote per user per painting
- Toggle-based interaction
- Backend-enforced vote integrity

---

### 🗑 Secure Deletion
- Only owners can delete paintings
- Deletion removes:
  - Database record
  - Image from Cloudinary using publicId

---

### ⏸ Rate Limiting
- Upload and authentication endpoints are rate-limited
- Prevents spam and abuse

---

## 🏗️ Tech Stack

**Frontend**
- EJS
- Bootstrap 5
- Vanilla JavaScript

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- Express-session
- Multer
- Cloudinary

**ML Service**
- FastAPI
- PyTorch
- TensorFlow / Keras
- PIL & NumPy

---

## 🚀 Deployment

- Backend: Render  
- ML Service: Hugging Face Spaces  
- Database: MongoDB Atlas  
- Image Storage: Cloudinary  

The system is fully cloud-hosted and stateless.

---

## 🧠 ML Service API

POST /infer

Request:
{
  "image_url": "https://res.cloudinary.com/.../image.jpg"
}

Response:
{
  "isPainting": true,
  "predictions": [
    { "era": "expressionism", "confidence": 0.88 },
    { "era": "surrealism", "confidence": 0.08 }
  ]
}

---

## 🔮 Future Enhancements
- Search and filtering by art period
- Public / private artwork visibility
- Comments and discussions
- Explainable ML predictions

---

## 🧾 License
MIT License © 2026 Anjali Mittal
Built with persistence, curiosity, and a lot of debugging ❤️ by [Anjali Mittal](https://github.com/Anjali-Mittal)
