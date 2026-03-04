import requests
import os

API_SOURCE_1_URL = os.getenv("API_SOURCE_1_URL", "https://api.example.com/source1")
API_KEY = os.getenv("API_SOURCE_1_KEY", "placeholder_key")

def fetch_internships():
    """
    Fetches internships from Source 1 and formats them.
    """
    try:
        # response = requests.get(API_SOURCE_1_URL, headers={"Authorization": f"Bearer {API_KEY}"})
        # data = response.json()
        
        # Mocking data for now
        mock_data = [
            {
                "job_title": "Backend Intern",
                "org": "AI Solutions",
                "city": "San Francisco",
                "field": "Engineering",
                "end_date": "2026-05-01",
                "link": "https://example.com/job1"
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
                "source": "Source 1"
            })
        return formatted_data
    except Exception as e:
        print(f"Error fetching from Source 1: {e}")
        return []
