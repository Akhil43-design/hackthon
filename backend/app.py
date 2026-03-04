from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from services import api_source1, api_source2

app = Flask(__name__)
CORS(app)

@app.route('/')
def health_check():
    return jsonify({"status": "InternHub Backend is running", "version": "1.0.0"})

@app.route('/api/internships', methods=['GET'])
def get_internships():
    # Fetch from multiple sources
    results = []
    results.extend(api_source1.fetch_internships())
    results.extend(api_source2.fetch_internships())
    
    # Simple de-duplication based on title and company
    unique_results = []
    seen = set()
    for item in results:
        key = (item['title'].lower(), item['company'].lower())
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
