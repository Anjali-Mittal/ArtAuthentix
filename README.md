# 🎨 ArtAuthentix

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
/painting/:id/results

yaml
Copy code

---

### 🏠 Homepage Gallery
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

### 👍 Upvotes System
- Users can upvote each painting **only once**
- Vote persistence stored in database
- UI feedback:
- Button remains green if upvoted
- Clicking again softly toggles state
- Prevents duplicate upvotes at backend level

---

### 🗑️ Secure Deletion
- Only the owner of a painting can delete it
- Deletion removes:
- Database record
- Physical image file from `/uploads`
- Uses RESTful `DELETE` requests (no method override hacks)

---

### ⚡ Rate Limiting
- Upload requests are rate-limited
- Limits applied per authenticated user
- Prevents abuse and server overload

---

### 🧩 Error Handling & UX Safeguards
- Graceful error messages (no raw stack traces)
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

## 📂 Project Structure (Simplified)
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

---

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

## 🔮 Planned Enhancements
- User profiles with personal galleries
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

This is not just a demo — it’s an end-to-end application.

---

## 🧑‍💻 Author
**Anjali Mittal**  
Built with care, curiosity, and a lot of debugging.
