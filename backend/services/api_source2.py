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
    
    # Search for internships in India/Remote
    querystring = {
        "query": "internship in India, software engineering, web development",
        "page": "1",
        "num_pages": "1",
        "date_posted": "week"
    }

    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        if response.status_code == 200:
            data = response.json()
            jobs = data.get('data', [])
            
            formatted_data = []
            for job in jobs:
                # JSearch often provides direct apply links or job board links
                apply_link = job.get('job_apply_link') or job.get('job_google_link')
                
                formatted_data.append({
                    "title": job.get('job_title'),
                    "company": job.get('employer_name'),
                    "location": f"{job.get('job_city', '')}, {job.get('job_country', '')}".strip(', '),
                    "domain": job.get('job_employment_type', 'Internship'),
                    "deadline": job.get('job_offer_expiration_datetime_utc', 'ASAP')[:10] if job.get('job_offer_expiration_datetime_utc') else 'ASAP',
                    "apply_link": apply_link,
                    "source": "RapidAPI JSearch"
                })
            return formatted_data
        else:
            print(f"RapidAPI Error: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching from RapidAPI: {e}")
        return []
