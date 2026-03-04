import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Adzuna API Credentials (Placeholder - needs real ones from user)
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "ad61b1b4") # Placeholder ID
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "7d35443e6a2b8969415c911b306b5f48") # Placeholder Key

def fetch_internships():
    """
    Fetches internships from Adzuna API and formats them.
    """
    # Search parameters: internships in India (or worldwide)
    url = f"https://api.adzuna.com/v1/api/jobs/in/search/1?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}&results_per_page=10&what=internship&content-type=application/json"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            jobs = data.get('results', [])
            
            formatted_data = []
            for job in jobs:
                formatted_data.append({
                    "title": job.get('title'),
                    "company": job.get('company', {}).get('display_name', 'Unknown Company'),
                    "location": job.get('location', {}).get('display_name', 'Remote'),
                    "domain": job.get('category', {}).get('label', 'General'),
                    "deadline": "Not Specified",
                    "apply_link": job.get('redirect_url'),
                    "source": "Adzuna"
                })
            return formatted_data
        else:
            print(f"Adzuna API Error: {response.status_code}")
            return get_mock_data()
    except Exception as e:
        print(f"Error fetching from Adzuna: {e}")
        return get_mock_data()

def get_mock_data():
    """Fallback mock data if API fails or credentials invalid"""
    return [
        {
            "title": "Software Engineering Intern",
            "company": "Tech Solutions Inc.",
            "location": "Bangalore, India",
            "domain": "IT / Software",
            "deadline": "2026-05-01",
            "apply_link": "https://example.com/apply1",
            "source": "Mock API"
        },
        {
            "title": "UX Design Intern",
            "company": "Creative Agency",
            "location": "Remote",
            "domain": "Design",
            "deadline": "2026-04-15",
            "apply_link": "https://example.com/apply2",
            "source": "Mock API"
        }
    ]
