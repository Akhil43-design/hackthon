import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_SOURCE_1_URL = os.getenv("API_SOURCE_1_URL", "https://api.example.com/source1")
API_KEY = os.getenv("API_SOURCE_1_KEY", "AIzaSyDlC6Kr5vpC61Ci9R82Ymy6kzYj87OhSgM")

def fetch_internships():
    """
    Fetches internships from Source 1 and formats them.
    This is called by the aggregated /api/internships route.
    """
    try:
        # Actual fetch logic (placeholder until real URL is active)
        # response = requests.get(API_SOURCE_1_URL, headers={"Authorization": f"Bearer {API_KEY}"})
        # if response.status_code == 200:
        #     data = response.json()
        
        # Mocking multiple results for API 1 to show immediate content
        mock_data = [
            {
                "job_title": "Full Stack Intern",
                "org": "Innovation Hub",
                "city": "Remote",
                "field": "Web Development",
                "end_date": "2026-06-15",
                "link": "https://example.com/hub1"
            },
            {
                "job_title": "AI Research Intern",
                "org": "Future AI",
                "city": "Bangalore",
                "field": "Artificial Intelligence",
                "end_date": "2026-05-30",
                "link": "https://example.com/ai1"
            }
        ]
        
        formatted_data = []
        for item in mock_data:
            formatted_data.append({
                "title": item.get("job_title"),
                "company": item.get("org"),
                "location": item.get("city"),
                "domain": item.get("field"),
                "deadline": item.get("end_date"),
                "apply_link": item.get("link"),
                "source": "API Source 1"
            })
        return formatted_data
    except Exception as e:
        print(f"Error fetching from API Source 1: {e}")
        return []
