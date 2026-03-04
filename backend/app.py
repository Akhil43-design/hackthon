from backend.services import api_source1, api_source2
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
try:
    if not firebase_admin._apps:
        # Check multiple possible paths for the service account key
        paths_to_try = [
            'backend/firebase_config/serviceAccountKey.json',
            'firebase_config/serviceAccountKey.json',
            'serviceAccountKey.json'
        ]
        cert_path = None
        for p in paths_to_try:
            if os.path.exists(p):
                cert_path = p
                break
                
        if cert_path:
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print(f"Firestore initialized successfully from {cert_path}")
        else:
            print("Warning: Service account key not found. Using default app or skipping Firestore.")
            try:
                firebase_admin.initialize_app()
                db = firestore.client()
            except:
                db = None
except Exception as e:
    print(f"Firestore Initialization Error: {e}")
    db = None

app = Flask(__name__)
CORS(app)

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

@app.route('/api/internships', methods=['GET'])
def get_internships():
    # Fetch from multiple sources
    results = []
    
    # 1. Fetch from RapidAPI (Source 2)
    results.extend(api_source2.fetch_internships())
    
    # 2. Fetch from AI Bot (Source 1)
    results.extend(api_source1.fetch_internships())
    
    # 3. Fetch from Community Submissions (Firestore)
    if db:
        try:
            submissions_ref = db.collection('internships_posted')
            docs = submissions_ref.stream()
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
                    "source": "Company Submission"
                })
        except Exception as e:
            print(f"Error fetching from Firestore: {e}")

    # Simple de-duplication based on title and company
    unique_results = []
    seen = set()
    for item in results:
        # Some items might not have title or company if corrupted
        title = item.get('title', '').lower()
        company = item.get('company', '').lower()
        key = (title, company)
        
        if key not in seen:
            seen.add(key)
            unique_results.append(item)
            
    return jsonify(unique_results)

@app.route('/api/internships/search', methods=['GET'])
def search_internships():
    query = request.args.get('q', '').lower()
    domain = request.args.get('domain', '').lower()
    location = request.args.get('location', '').lower()
    
    all_internships = get_internships().get_json()
    
    filtered = [
        item for item in all_internships
        if (query in item['title'].lower() or query in item['company'].lower())
        and (not domain or domain in item['domain'].lower())
        and (not location or location in item['location'].lower())
    ]
    
    return jsonify(filtered)

@app.route('/api/bookmarks', methods=['GET', 'POST'])
def manage_bookmarks():
    # Placeholder for Firestore logic
    if request.method == 'POST':
        data = request.json
        # db.collection('bookmarks').add(data)
        return jsonify({"message": "Bookmark saved successfully"}), 201
    
    # Mock return for GET
    return jsonify([])

@app.route('/api/recommendations', methods=['POST'])
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

@app.route('/api/news', methods=['GET'])
def get_news():
    news = [
        {
            "title": "Quantum Computing Breakthrough",
            "description": "Researchers achieve stable qubits at room temperature, paving the way for practical quantum systems.",
            "link": "https://example.com/news1"
        },
        {
            "title": "Green Energy in Tech",
            "description": "Major tech companies commit to 100% renewable energy by 2030 in new sustainability pact.",
            "link": "https://example.com/news2"
        },
        {
            "title": "The Rise of Edge AI",
            "description": "Why processing data at the edge is becoming critical for the next generation of IoT devices.",
            "link": "https://example.com/news3"
        }
    ]
    return jsonify(news)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
