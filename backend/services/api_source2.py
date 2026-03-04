import requests
import os

API_SOURCE_2_URL = os.getenv("API_SOURCE_2_URL", "https://api.example.com/source2")
API_KEY = os.getenv("API_SOURCE_2_KEY", "placeholder_key")

def fetch_internships():
    """
    Fetches internships from Source 2 and formats them.
    """
    try:
        # response = requests.get(API_SOURCE_2_URL, params={"key": API_KEY})
        # data = response.json()
        
        # Mocking data for now
        mock_data = [
            {
                "position": "Frontend Developer Intern",
                "company_name": "Web Design Co",
                "loc": "Remote",
                "category": "Design",
                "closing_date": "2026-04-20",
                "application_url": "https://example.com/job2"
            }
        ]
        
        formatted_data = []
        for item in mock_data:
            formatted_data.append({
                "title": item.get("position"),
                "company": item.get("company_name"),
                "location": item.get("loc"),
                "domain": item.get("category"),
                "deadline": item.get("closing_date"),
                "apply_link": item.get("application_url"),
                "source": "Source 2"
            })
        return formatted_data
    except Exception as e:
        print(f"Error fetching from Source 2: {e}")
        return []
