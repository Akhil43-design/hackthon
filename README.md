# InternHub – Smart Internship Aggregation Platform

InternHub is a full-stack web application that aggregates internship listings from multiple sources, provides technology news, and offers personalized recommendations based on user profiles.

## Features
- **Internship Aggregation**: Fetches and de-duplicates listings from multiple APIs.
- **Dual-Panel Home**: View latest tech news and internships side-by-side.
- **User Authentication**: Signup and Login via Firebase (configured for future integration).
- **Recommendation System**: Smart matching based on skills and domain preferences.
- **Bookmark System**: Save internships for later viewing.
- **Deadline Alerts**: Dynamic labels for upcoming application deadlines.

## Technology Stack
- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Backend**: Python, Flask
- **Database**: Firebase Firestore (Ready for integration)
- **Deployment**: Vercel

## Project Structure
```text
internhub
├── backend
│   ├── app.py (Main entry point)
│   ├── services/ (API integration logic)
├── frontend
│   ├── index.html, login.html, etc.
├── static
│   ├── css/styles.css
│   ├── js/main.js
├── firebase_config
│   └── config.js (Firebase placeholders)
├── vercel.json (Deployment config)
└── requirements.txt
```

## Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd internhub
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run locally**:
   ```bash
   python backend/app.py
   ```
   The backend will run on `http://localhost:5000`. Open `frontend/index.html` in your browser.

## Deployment on Vercel
1. Push your code to GitHub.
2. Connect your GitHub repository to Vercel.
3. Configure Environment Variables:
   - `API_SOURCE_1_URL`
   - `API_SOURCE_2_URL`
   - `API_SOURCE_1_KEY`
   - `API_SOURCE_2_KEY`
4. Deploy!

## API Integration Note
The backend is designed to be extensible. To add a new source, create a new file in `backend/services/` and register it in `backend/app.py`.
