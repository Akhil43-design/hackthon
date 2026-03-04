import requests
import os
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY", "647a837d66mshc9df1e2eaa0d48ep107d0bjsn72d91a7e5c23")
RAPIDAPI_HOST = "jsearch.p.rapidapi.com"

def fetch_internships():
    """
    Fetches internships from JSearch API (via RapidAPI) and formats them.
    JSearch aggregates from LinkedIn, Indeed, Glassdoor, etc.
    """
    url = "https://jsearch.p.rapidapi.com/search"
    
    # Broader search for internships to get more results
    querystring = {
        "query": "internships India 2025-2026 software data design",
        "page": "1",
        "num_pages": "1", # Increase pages to get more results
        "date_posted": "all"
    }

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }

    try:
        print(f"Fetching from RapidAPI JSearch... Key ending in: {RAPIDAPI_KEY[-5:]}")
        response = requests.get(url, headers=headers, params=querystring)
        print(f"RapidAPI Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            jobs = data.get('data', [])
            print(f"RapidAPI found {len(jobs)} jobs")
            
            formatted_data = []
            for job in jobs:
                apply_link = job.get('job_apply_link') or job.get('job_google_link')
                
                formatted_data.append({
                    "title": job.get('job_title'),
                    "company": job.get('employer_name'),
                    "location": f"{job.get('job_city', '')}, {job.get('job_country', '')}".strip(', ') or "Remote",
                    "domain": job.get('job_employment_type', 'Internship'),
                    "deadline": job.get('job_offer_expiration_datetime_utc', 'ASAP')[:10] if job.get('job_offer_expiration_datetime_utc') else 'ASAP',
                    "apply_link": apply_link,
                    "source": "RapidAPI JSearch"
                })
            return formatted_data
        else:
            print(f"RapidAPI Error Details: {response.text}")
            return []
    except Exception as e:
        print(f"Error calling RapidAPI: {e}")
        return []
