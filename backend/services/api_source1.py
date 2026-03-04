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
    Act as a professional internship aggregation bot. 
    Find 10 real and current internship opportunities in the fields of Software Engineering, Data Science, and UI/UX Design.
    For each internship, provide:
    1. title (Job Title)
    2. company (Company Name)
    3. location (e.g., 'Remote', 'Bangalore, India')
    4. domain (e.g., 'Web Development', 'UI/UX')
    5. deadline (e.g., '2026-05-15' or 'ASAP')
    6. apply_link (A real or verifiable URL)
    
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
        # Clean up the response text in case it includes markdown code blocks
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        internships = json.loads(text)
        
        # Ensure 'source' is set
        for item in internships:
            item['source'] = "AI Search Bot"
            
        return internships
    except Exception as e:
        print(f"Error fetching from AI API: {e}")
        return get_mock_ai_data()

def get_mock_ai_data():
    """Fallback if AI API fails or hits quota"""
    return [
        {
            "title": "Junior AI Engineer Intern",
            "company": "DeepMind Explorer",
            "location": "Remote",
            "domain": "Artificial Intelligence",
            "deadline": "2026-04-30",
            "apply_link": "https://example.com/ai-intern",
            "source": "AI Bot Fallback"
        },
        {
            "title": "Frontend Developer Intern",
            "company": "WebX Studio",
            "location": "Hyderabad, India",
            "domain": "Web Development",
            "deadline": "2026-05-10",
            "apply_link": "https://example.com/web-intern",
            "source": "AI Bot Fallback"
        }
    ]
