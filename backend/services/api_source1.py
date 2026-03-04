import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure the AI API
API_KEY = os.getenv("API_SOURCE_1_KEY")
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

def fetch_internships():
    """
    Uses Gemini AI to 'search' and fetch latest internship details.
    Acts as an AI bot to aggregate information.
    """
    prompt = """
    Act as a professional internship discovery bot. 
    Find 10 ACTIVE and REAL internship opportunities for 2026/2027 in India or Remote. 
    Focus on Software Engineering, Web Development, and Data Science roles.
    
    CRITICAL: YOU MUST PROVIDE REAL, DIRECT APPLICATION LINKS (e.g., from LinkedIn, Indeed, Glassdoor, or company career portals). 
    DO NOT provide placeholder 'example.com' links. If you cannot find a link for a specific role, skip it and find another.
    
    For each internship, provide:
    1. title (Job Title)
    2. company (Company Name)
    3. location (e.g., 'Remote', 'Bangalore, India')
    4. domain (e.g., 'Web Development', 'AI/ML')
    5. deadline (e.g., '2026-06-30' or 'Open till filled')
    6. apply_link (A REAL URLs only - must start with http or https)
    
    Return the result ONLY as a JSON list of objects.
    Format:
    [
      {
        "title": "Role",
        "company": "Company",
        "location": "Loc",
        "domain": "Domain",
        "deadline": "YYYY-MM-DD",
        "apply_link": "URL",
        "source": "AI Search Bot"
      }
    ]
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Robust JSON cleaning
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        internships = json.loads(text)
        
        # Validate and filter out low-quality links
        final_list = []
        for item in internships:
            link = item.get('apply_link', '')
            if link and not "example.com" in link:
                item['source'] = "AI Discovery Bot"
                final_list.append(item)
            
        return final_list if final_list else get_mock_ai_data()
    except Exception as e:
        print(f"Error fetching from AI API: {e}")
        return get_mock_ai_data()

def get_mock_ai_data():
    """Fallbacks that actually point to real career portals if AI fails"""
    return [
        {
            "title": "Software Engineering Intern",
            "company": "Google",
            "location": "Bangalore / Remote",
            "domain": "SWE",
            "deadline": "2026-12-31",
            "apply_link": "https://www.google.com/about/careers/applications/jobs/results/?q=intern",
            "source": "Career Portal Bot"
        },
        {
            "title": "Frontend Developer Intern",
            "company": "Microsoft",
            "location": "Hyderabad / Remote",
            "domain": "Web",
            "deadline": "2026-11-30",
            "apply_link": "https://careers.microsoft.com/us/en/search-results?keywords=intern",
            "source": "Career Portal Bot"
        },
        {
            "title": "Intern - Emerging Talent",
            "company": "Amazon",
            "location": "Global",
            "domain": "General Info",
            "deadline": "Ongoing",
            "apply_link": "https://www.amazon.jobs/en/teams/internships-for-students",
            "source": "Career Portal Bot"
        }
    ]
