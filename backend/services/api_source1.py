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
    Act as a high-precision internship recruitment bot. 
    Search for and identify 10 CURRENT and SPECIFIC internship openings for 2025-2026. 
    Target: Software Engineering, Frontend/Backend, Data Science, and DevOps.
    
    CRITICAL REQUIREMENT: 
    YOU MUST PROVIDE DIRECT LINKS TO THE APPLICATION FORM. 
    - EXAMPLE OF CORRECT LINK: https://www.google.com/about/careers/applications/apply/e7f1c162-3290-48ed-8d32-666ded8ce757/form
    - AVOID: General careers pages, search results, or homepages.
    - PREFER: URLs ending in /form, /apply, or containing specific job UUIDs/IDs.
    - THE LINK MUST TAKE THE USER DIRECTLY TO THE START OF THE APPLICATION PROCESS.
    
    For each internship, provide:
    1. title (Job Title)
    2. company (Company Name)
    3. location (City, Country or Remote)
    4. domain (Specific tech stack or field)
    5. deadline (Specific date or 'ASAP')
    6. apply_link (The DIRECT APPLICATION FORM URL)
    
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
        "source": "AI Direct-Form Bot"
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
        
        # Validate and filter: Ensure links look like direct application forms
        final_list = []
        for item in internships:
            link = item.get('apply_link', '')
            # Filter out general homepages and simple LinkedIn search links
            # Direct form links are usually longer and specific
            is_generic = len(link) < 40 or any(x in link.lower() for x in ['/careers', '/jobs', '?q=', 'search']) and not any(y in link.lower() for y in ['/apply', '/form', '/jobs/'])
            
            if link and not "example.com" in link and not is_generic:
                item['source'] = "AI Direct-Form Bot"
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
