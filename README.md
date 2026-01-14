# ArtAuthentix

ArtAuthentix is a full-stack web application that analyzes uploaded artworks using machine learning to determine whether an image is a painting and, if so, predict its most likely art periods with confidence scores.

The platform combines **authentication**, **media handling**, **ML inference**, and **social interaction features** into a cohesive system.

---

## 🌟 Key Features

### 🔐 Authentication & Authorization
- User signup, login, and logout
- Session-based authentication
- Authorization enforced for:
  - Uploading paintings
  - Deleting paintings (owner only)
  - Upvoting paintings (one vote per user)

---

### 🖼️ Painting Upload & Validation
- Image uploads using **Multer**
- Strict file validation:
  - Only `.jpg` and `.png` allowed
- Automatic cleanup:
  - Non-painting images are deleted from storage
  - Files are removed on failed processing

---

### 🧠 Machine Learning Inference (Microservice)
A dedicated **FastAPI ML service** performs inference:
1. **Painting Detection**
   - Binary classifier checks if the image is a painting
2. **Art Period Classification**
   - Predicts top-2 art periods
   - Returns confidence scores

ML service is decoupled from the main backend and accessed via HTTP.

---

### 📊 Results Visualization
- Dedicated results page per painting
- Displays:
  - Uploaded image
  - Top predicted art periods
  - Confidence bars (percentage-based progress bars)
- Accessible via:
  ```bash
    /painting/:id/results
    ```

---

### 🖼 Homepage Gallery
- Responsive card-based grid layout
- Displays **Top paintings** instead of latest uploads
- Each card shows:
  - Painting preview
  - Uploader name
  - Upload date
  - Upvote count
  - View Results button
- Smooth hover animations for better UX

---

### 🔼 Upvotes System
- Users can upvote each painting **only once**
- Vote persistence stored in database
- UI feedback:
  - Button remains green if upvoted
  - Clicking again softly toggles state
  - Prevents duplicate upvotes at backend level

---

### 🗑 Secure Deletion
- Only the owner can delete the painting
- Deletion removes:
  - Database record
  - Physical image file from `/uploads`

---

### ⏸ Rate Limiting
- Upload requests are rate-limited
- Limits applied per authenticated user
- Prevents abuse and server overload

---

### 🚨 Error Handling & UX Safeguards
- Graceful error messages
- Clean empty states:
  - No paintings → user prompt
- Safe fallback rendering:
  - Missing user info
  - Deleted users
  - Defensive checks to avoid app crashes

---

## 🏗️ Tech Stack

### Frontend
- EJS templating
- Bootstrap 5
- Vanilla JavaScript (Fetch API)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Multer (file uploads)
- Express-session

### ML Service
- FastAPI
- PyTorch (style classifier)
- TensorFlow/Keras (painting detector)
- PIL / NumPy preprocessing

---

## 📂 Project Structure
```bash
ArtAuthentix/
├── backend/
│ ├── src/
│ │ ├── routes/
│ │ ├── models/
│ │ ├── views/
│ │ ├── middleware/
│ │ └── app.js
│ ├── uploads/
│ └── package.json
│
├── ML_Service/
│ ├── app.py
│ ├── inference.py
│ ├── models/
│ └── requirements.txt
```
## 🌐 Application Routes

### 👥 User Routes (`/user`)

| Method | Route    | Description            |
|------|------------|------------------------|
| GET  | /signin    | Login page             |
| POST | /signin    | Authenticate user      |
| GET  | /signup    | Signup page            |
| POST | /signup    | Register user          |
| POST | /logout    | Logout user            |
| DELETE | /:id     | Delete user account    |

---

### 🖼 Painting Routes (`/painting`)

| Method | Route               | Description                          |
|--------|---------------------|--------------------------------------|
| GET    | /upload             | Upload form                          |
| POST   | /upload             | Upload & analyze painting            |
| GET    | /:id/results        | View analysis results                |
| POST   | /:id/upvote         | Upvote a painting                    |
| DELETE | /:id                | Delete painting (owner only)         |

---

### Homepage (`/`)

| Method | Route | Description                 |
|------  |-------|-----------------------------|
| GET    | /     | View community paintings    |

---

## ML Service API

### POST `/infer`

**Request**
```json
{
  "image_path": "absolute/path/to/image.jpg"
}
```
Response

```json
Copy code
{
  "isPainting": true,
  "predictions": [
    { "era": "expressionism", "confidence": 0.88 },
    { "era": "surrealism", "confidence": 0.08 }
  ]
}
```

## 🚀 How It Works (High Level Flow)

1. User uploads an image
2. Image is validated and saved temporarily
3. Backend sends image path to ML service
4. ML service:
   - Checks if image is a painting
   - Predicts art periods
5. Results returned to backend
6. If valid painting:
   - Saved in DB
   - Shown on homepage and results page
7. If invalid:
   - File deleted
   - Error shown to user

---
## ▶️ Running the Project Locally

### 1️⃣ Start MongoDB

Make sure MongoDB is running locally on your system.

---

### 2️⃣ Start Backend (Node.js)

```bash
cd backend
npm install
npm run dev
```
Server runs at:
```bash
http://localhost:7000
```
3️⃣ Start ML Service (Python)
```bash
cd ML_Service
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```
ML API runs at:
```bash
http://127.0.0.1:8000
```

---
## 🚫 Ignored Files (Important)
### The following files and directories are intentionally excluded from version control:

- .env
- node_modules/
- backend/uploads/ (uploaded images)
- Python virtual environments (venv/, .venv/)
- ML model weights (.pt, .pth, .onnx)

---
## Future Enhancements
- Search / filter by art period
- Soft private/public painting visibility
- Comments & discussions on paintings
- ML model confidence explanations

---

## 💡 Why This Project Matters

ArtAuthentix demonstrates:
- Full-stack system design
- ML integration in production workflows
- Secure media handling
- Clean UX for AI-powered features
- Practical backend engineering patterns

---

## 🧾 License
Built with care, curiosity, and a lot of debugging.
### MIT License © 2026 Anjali Mittal  
Made with ❤️ by [Anjali Mittal](https://github.com/Anjali-Mittal)
