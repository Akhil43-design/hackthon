import firebase_admin
from firebase_admin import credentials, firestore
import os

# 1. Initialize Firebase Admin
def initialize_db():
    try:
        if not firebase_admin._apps:
            # Look for the service account key in the project root or relevant folders
            paths_to_try = [
                'firebase_config/serviceAccountKey.json',
                'backend/firebase_config/serviceAccountKey.json',
                'serviceAccountKey.json'
            ]
            
            cert_path = None
            for p in paths_to_try:
                if os.path.exists(p):
                    cert_path = p
                    break
            
            if not cert_path:
                print("❌ Service account key not found.")
                print("⚠️ Please place your 'serviceAccountKey.json' in c:\\Users\\Akhil\\OneDrive\\Desktop\\Hackthon\\firebase_config\\")
                return None
                
            cred = credentials.Certificate(cert_path)
            firebase_admin.initialize_app(cred)
            return firestore.client()
    except Exception as e:
        print(f"❌ Firestore Initialization Error: {e}")
        return None

# 2. Add 5 Professional Sample Users
def seed_users(db):
    if not db:
        print("❌ Cannot seed users: Database not connected.")
        return

    users = [
        {
            "email": "aarav.sharma@iitd.ac.in",
            "password": "password123",
            "name": "Aarav Sharma",
            "phone": "+91 98765 43210",
            "linkedin": "linkedin.com/in/aaravsharma",
            "github": "github.com/aaravs",
            "university": "IIT Delhi",
            "degree": "B.Tech Computer Science",
            "gradYear": "2026",
            "cgpa": "9.2/10",
            "skills": "React, Python, Machine Learning, Node.js",
            "bio": "Passionate about building scalable AI systems and full-stack applications. Looking for summer 2025 opportunities in high-growth startups."
        },
        {
            "email": "ananya.iyer@nitt.edu",
            "password": "password123",
            "name": "Ananya Iyer",
            "phone": "+91 98765 43211",
            "linkedin": "linkedin.com/in/ananyaiyer",
            "github": "github.com/aniyer",
            "university": "NIT Trichy",
            "degree": "B.Tech Data Science",
            "gradYear": "2025",
            "cgpa": "8.9/10",
            "skills": "R, SQL, Tableau, Statistics, Pytorch",
            "bio": "Data enthusiast focused on predictive modeling and business intelligence. Experience with multiple EDA projects and market analytics."
        },
        {
            "email": "ishaan.verma@nid.edu",
            "password": "password123",
            "name": "Ishaan Verma",
            "phone": "+91 98765 43212",
            "linkedin": "linkedin.com/in/ishaanverma",
            "github": "github.com/ishaanv",
            "university": "NID Ahmedabad",
            "degree": "B.Des Product Design",
            "gradYear": "2026",
            "cgpa": "8.5/10",
            "skills": "Figma, Adobe XD, Blender, UX Research",
            "bio": "Digital product designer with a passion for user-centric interfaces. I love turning complex problems into simple, beautiful experiences."
        },
        {
            "email": "riya.gupta@dtu.ac.in",
            "password": "password123",
            "name": "Riya Gupta",
            "phone": "+91 98765 43213",
            "linkedin": "linkedin.com/in/riyagupta",
            "github": "github.com/riyadev",
            "university": "Delhi Technological University",
            "degree": "B.Tech Software Engineering",
            "gradYear": "2025",
            "cgpa": "9.0/10",
            "skills": "HTML/CSS, JavaScript, Vue.js, Firebase",
            "bio": "Frontend focused software engineer with 2 successful internships and multiple open-source contributions."
        },
        {
            "email": "kabir.singh@bits-pilani.ac.in",
            "password": "password123",
            "name": "Kabir Singh",
            "phone": "+91 98765 43214",
            "linkedin": "linkedin.com/in/kabirsingh",
            "github": "github.com/kabirsec",
            "university": "BITS Pilani",
            "degree": "B.E. Computer Science",
            "gradYear": "2026",
            "cgpa": "8.8/10",
            "skills": "Cybersecurity, Ethical Hacking, Cloud Ops, Go",
            "bio": "Security researcher interested in cloud vulnerability and infrastructure protection. Active participant in CTFs and security bug bounties."
        }
    ]

    print("🚀 Seeding 5 professional sample users to Firestore...")
    for user_data in users:
        try:
            # Check if user already exists to avoid duplicates
            existing = db.collection('users').where('email', '==', user_data['email']).get()
            if not existing:
                db.collection('users').add(user_data)
                print(f"✅ Created user: {user_data['name']}")
            else:
                print(f"ℹ️ User already exists: {user_data['name']}")
        except Exception as e:
            print(f"❌ Error seeding {user_data['name']}: {e}")

if __name__ == "__main__":
    db = initialize_db()
    if db:
        seed_users(db)
        print("🎉 Database seeding complete!")
    else:
        print("\n\ufffd\ufe0f  STEP REQUIRED:")
        print("1. Downlaod your Service Account JSON from Firebase Console")
        print("2. Save it as 'serviceAccountKey.json' in c:\\Users\\Akhil\\OneDrive\\Desktop\\Hackthon\\firebase_config\\")
        print("3. Run this script again.")
