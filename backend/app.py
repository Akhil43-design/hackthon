from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import uuid
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from backend.services import api_source1, api_source2, featured_source
from backend.utils.storage_manager import storage

# Initialize Firebase Admin
# Note: Ensure serviceAccountKey.json exists in firebase_config/
# If not, the server will fall back to local storage only for aggregation
try:
    cred = credentials.Certificate('firebase_config/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db_admin = firestore.client()
    print("✅ Firebase Admin initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase Admin initialization failed: {e}")
    db_admin = None

app = Flask(__name__, static_folder='../static')
CORS(app)

# Serve Frontend
@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_frontend_files(path):
    # Search in order: frontend, static, firebase_config
    search_dirs = ['../frontend', '../static', '../firebase_config', '..']
    for d in search_dirs:
        if os.path.exists(os.path.join(d, path)):
            return send_from_directory(d, path)
    return "File not found", 404

# Global Error Handler to return JSON instead of HTML
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({
        "error": str(e),
        "type": type(e).__name__,
        "message": "Internal Server Error"
    }), 500

@app.route('/')
def health_check():
    return jsonify({"status": "InternHub Backend is running", "version": "1.0.0"})

@app.route('/hub/internships', methods=['GET'])
def get_internships():
    # Fetch from multiple sources
    results = []
    
    # 0. Fetch Featured Internships (GUARANTEED 10)
    results.extend(featured_source.fetch_internships())
    
    # 1. Fetch from RapidAPI (Source 2)
    results.extend(api_source2.fetch_internships())
    
    # 2. Fetch from AI Bot (Source 1)
    results.extend(api_source1.fetch_internships())
    
    # 3. Fetch from Community Submissions (Firestore)
    if db_admin:
        try:
            docs = db_admin.collection('internships_posted').stream()
            for doc in docs:
                data = doc.to_dict()
                results.append({
                    "title": data.get('title'),
                    "company": data.get('company'),
                    "location": data.get('location'),
                    "domain": data.get('domain'),
                    "description": data.get('description'),
                    "deadline": data.get('deadline'),
                    "apply_link": data.get('apply_link'),
                    "source": "Cloud Submission"
                })
        except Exception as e:
            print(f"⚠️ Failed to fetch from Firestore: {e}")

    # 4. Fetch from Community Submissions (Local Storage Fallback)
    local_submissions = storage.read('internships_posted.json') or []
    for data in local_submissions:
        results.append({
            "title": data.get('title'),
            "company": data.get('company'),
            "location": data.get('location'),
            "domain": data.get('domain'),
            "description": data.get('description'),
            "deadline": data.get('deadline'),
            "apply_link": data.get('apply_link'),
            "source": "Local Submission"
        })

    # Simple de-duplication based on title and company
    unique_results = []
    seen = set()
    for item in results:
        title = item.get('title', '').lower()
        company = item.get('company', '').lower()
        key = (title, company)
        
        if key not in seen:
            seen.add(key)
            unique_results.append(item)
            
    return jsonify(unique_results)

@app.route('/hub/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    
    if storage.get_user_by_email(email):
        return jsonify({"error": "User already exists"}), 400
        
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": email,
        "password": data.get('password'),
        "name": data.get('name'),
        "phone": data.get('phone'),
        "university": data.get('university'),
        "degree": data.get('degree'),
        "gradYear": data.get('gradYear'),
        "cgpa": data.get('cgpa'),
        "skills": data.get('skills'),
        "bio": data.get('bio'),
        "createdAt": datetime.now().isoformat()
    }
    
    storage.save_user(user_data)
    return jsonify({"message": "User created", "id": user_id, "name": user_data['name']}), 201

@app.route('/hub/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = storage.get_user_by_email(email)
    if user and user['password'] == password:
        return jsonify({"id": user['id'], "name": user['name'], "email": user['email']}), 200
        
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/hub/post-internship', methods=['POST'])
def post_internship():
    data = request.json
    storage.save_internship(data)
    return jsonify({"message": "Internship posted successfully"}), 201

@app.route('/hub/bookmarks', methods=['GET'])
def get_bookmarks():
    user_id = request.args.get('userId')
    if not user_id:
        return jsonify({"error": "UserId required"}), 400
    return jsonify(storage.get_bookmarks(user_id))

@app.route('/hub/bookmarks/toggle', methods=['POST'])
def toggle_bookmark():
    data = request.json
    user_id = data.get('userId')
    internship = data.get('internship')
    
    if not user_id or not internship:
        return jsonify({"error": "Missing data"}), 400
        
    is_added = storage.toggle_bookmark(user_id, internship)
    return jsonify({"is_added": is_added})

@app.route('/hub/recommendations', methods=['POST'])
def get_recommendations():
    user_data = request.json
    skills = [s.strip().lower() for s in user_data.get('skills', '').split(',')]
    preferred_domain = user_data.get('domain', '').lower()
    
    all_internships = get_internships().get_json()
    recommendations = []
    
    for intern in all_internships:
        score = 0
        # Check domain match
        if preferred_domain in intern['domain'].lower():
            score += 2
        
        # Check skill match (simulated by checking if skill is in title/domain)
        for skill in skills:
            if skill in intern['title'].lower() or skill in intern['domain'].lower():
                score += 1
        
        if score > 0:
            intern['recommendation_score'] = score
            recommendations.append(intern)
    
    # Sort by score descending
    recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
    
    return jsonify(recommendations)

@app.route('/hub/news', methods=['GET'])
def get_news():
    news = [
        {
            "title": "Generative AI: The 2024 Roadmap",
            "description": "Exploring how LLMs are reshaping the modern developer workflow and what to expect in the coming months.",
            "link": "https://techcrunch.com/category/artificial-intelligence/",
            "image": "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "title": "Quantum Supremacy Near?",
            "description": "New breakthroughs in error correction bring us closer to practical quantum computing use cases in cryptography.",
            "link": "https://www.wired.com/tag/quantum-computing/",
            "image": "https://images.unsplash.com/photo-1695634014410-db5c46f56822?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "title": "The Hybrid Work Debate",
            "description": "Top tech firms are re-evaluating their remote work policies for 2025, sparking new discussions on productivity.",
            "link": "https://www.theverge.com/tech",
            "image": "https://images.unsplash.com/photo-1732998486450-d0f8e5951460?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "title": "Technical Interview Tips",
            "description": "How to master system design interviews at FAANG companies using the latest architectural patterns.",
            "link": "https://medium.com/tag/software-engineering",
            "image": "https://images.unsplash.com/photo-1710770563074-6d9cc0d3e338?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "title": "Edge Computing Explosion",
            "description": "Why processing data at the edge is becoming critical for the next generation of smart IoT devices and cities.",
            "link": "https://www.zdnet.com/topic/edge-computing/",
            "image": "https://images.unsplash.com/photo-1695462131590-bdd41d1b21f1?auto=format&fit=crop&q=80&w=1000"
        },
        {
            "title": "Web3 & The Future of ID",
            "description": "Decentralized identity solutions are gaining traction as users demand more control over their personal data.",
            "link": "https://cointelegraph.com/tags/web3",
            "image": "https://images.unsplash.com/photo-1660836814985-8523a0d713b5?auto=format&fit=crop&q=80&w=1000"
        }
    ]
    return jsonify(news)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
