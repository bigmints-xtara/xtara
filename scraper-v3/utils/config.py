"""
Configuration management for CollegeDunia scraper
"""
import os
from pathlib import Path

class Config:
    # Base URLs
    BASE_URL = "https://collegedunia.com"
    STATE_COLLEGES_URL = "{base_url}/{state}-colleges"
    COLLEGE_COURSES_URL = "{college_url}/courses-fees"
    
    # Scraping parameters
    MAX_PAGES_PER_STATE = 200  # Increased from 10 to 200 for more comprehensive scraping
    MAX_COLLEGES_PER_STATE = 2000  # Increased from 100 to 2000 for more colleges per state
    REQUEST_DELAY = 1  # seconds between requests
    MAX_RETRIES = 3
    TIMEOUT = 30
    
    # Indian states for scraping
    INDIAN_STATES = [
        'andhra-pradesh', 'arunachal-pradesh', 'assam', 'bihar', 'chhattisgarh',
        'goa', 'gujarat', 'haryana', 'himachal-pradesh', 'jharkhand', 'karnataka',
        'kerala', 'madhya-pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
        'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil-nadu',
        'telangana', 'tripura', 'uttar-pradesh', 'uttarakhand', 'west-bengal'
    ]
    
    # File paths
    PROJECT_ROOT = Path(__file__).parent.parent
    OUTPUTS_DIR = PROJECT_ROOT / "outputs"
    COLLEGES_DIR = OUTPUTS_DIR / "colleges"
    LOGS_DIR = OUTPUTS_DIR / "logs"
    PROGRESS_DIR = OUTPUTS_DIR / "progress"
    
    # LLM Configuration (Ollama)
    OLLAMA_BASE_URL = "http://localhost:11434"
    OLLAMA_MODEL = "gpt-oss:20b"
    
    # Headers for requests
    REQUEST_HEADERS = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist"""
        for dir_path in [cls.COLLEGES_DIR, cls.LOGS_DIR, cls.PROGRESS_DIR]:
            dir_path.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_state_url(cls, state: str, page: int = 1) -> str:
        """Get the URL for a specific state and page"""
        base_url = cls.STATE_COLLEGES_URL.format(base_url=cls.BASE_URL, state=state)
        return f"{base_url}?page={page}"
    
    @classmethod
    def get_college_courses_url(cls, college_url: str) -> str:
        """Get the courses URL for a college"""
        if college_url.startswith('http'):
            # Check if URL already ends with courses-fees
            if college_url.endswith('/courses-fees'):
                return college_url
            else:
                return f"{college_url}/courses-fees"
        else:
            return f"{cls.BASE_URL}{college_url}/courses-fees"
