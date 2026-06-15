#!/usr/bin/env python3
"""
Enhanced scraper with anti-blocking workarounds
"""

import requests
import time
import random
from bs4 import BeautifulSoup
import re
from pathlib import Path
import json
from datetime import datetime

class EnhancedScraper:
    def __init__(self):
        self.session = requests.Session()
        self.setup_session()
        
    def setup_session(self):
        """Setup session with anti-blocking measures"""
        # User agent rotation
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0'
        ]
        
        # Setup retry strategy
        from requests.adapters import HTTPAdapter
        from urllib3.util.retry import Retry
        
        retry_strategy = Retry(
            total=3,
            backoff_factor=2,
            status_forcelist=[429, 500, 502, 503, 504, 403],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
    def get_headers(self):
        """Get random headers for each request"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
        }
    
    def smart_delay(self):
        """Smart delay with jitter"""
        base_delay = random.uniform(3, 8)
        jitter = random.uniform(0.5, 2.0)
        delay = base_delay + jitter
        print(f"⏳ Waiting {delay:.1f} seconds...")
        time.sleep(delay)
    
    def fetch_page(self, url, max_retries=3):
        """Fetch page with retry logic"""
        for attempt in range(max_retries):
            try:
                self.smart_delay()
                
                response = self.session.get(
                    url, 
                    headers=self.get_headers(),
                    timeout=30
                )
                
                if response.status_code == 200:
                    return response
                elif response.status_code == 403:
                    print(f"🚫 Blocked (403) - Attempt {attempt + 1}/{max_retries}")
                    if attempt < max_retries - 1:
                        wait_time = (attempt + 1) * 60  # Exponential backoff
                        print(f"⏳ Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                else:
                    print(f"❌ HTTP {response.status_code} - Attempt {attempt + 1}/{max_retries}")
                    
            except Exception as e:
                print(f"❌ Error: {e} - Attempt {attempt + 1}/{max_retries}")
                if attempt < max_retries - 1:
                    time.sleep(30)
        
        return None
    
    def scrape_kerala_colleges(self):
        """Scrape Kerala colleges with enhanced methods"""
        url = "https://collegedunia.com/kerala-colleges?page=1"
        
        print(f"🎯 Fetching: {url}")
        response = self.fetch_page(url)
        
        if not response:
            print("❌ Failed to fetch page after all retries")
            return []
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try multiple methods to find colleges
        colleges = []
        
        # Method 1: Look for clg-name-address divs
        clg_divs = soup.find_all('div', class_=lambda x: x and 'clg-name-address' in x)
        print(f"Found {len(clg_divs)} clg-name-address divs")
        
        for div in clg_divs:
            link = div.find('a', href=re.compile(r'/college/\d+'))
            if link:
                colleges.append({
                    'name': link.get_text(strip=True),
                    'url': link.get('href'),
                    'method': 'clg-name-address'
                })
        
        # Method 2: Look for any college links
        if not colleges:
            print("Trying fallback method...")
            college_links = soup.find_all('a', href=re.compile(r'/college/\d+'))
            print(f"Found {len(college_links)} college links")
            
            for link in college_links:
                name = link.get_text(strip=True)
                if name and len(name) > 10:
                    colleges.append({
                        'name': name,
                        'url': link.get('href'),
                        'method': 'fallback'
                    })
        
        # Method 3: Look for any divs with college-related classes
        if not colleges:
            print("Trying alternative method...")
            college_divs = soup.find_all('div', class_=lambda x: x and any(
                keyword in x.lower() for keyword in ['college', 'university', 'institute']
            ))
            print(f"Found {len(college_divs)} college-related divs")
            
            for div in college_divs:
                link = div.find('a', href=re.compile(r'/college/\d+'))
                if link:
                    colleges.append({
                        'name': link.get_text(strip=True),
                        'url': link.get('href'),
                        'method': 'alternative'
                    })
        
        print(f"✅ Found {len(colleges)} colleges using various methods")
        return colleges

def main():
    scraper = EnhancedScraper()
    colleges = scraper.scrape_kerala_colleges()
    
    if colleges:
        print(f"\n🎉 Successfully found {len(colleges)} colleges:")
        for i, college in enumerate(colleges[:5], 1):
            print(f"  {i}. {college['name']} ({college['method']})")
    else:
        print("\n❌ No colleges found with any method")

if __name__ == "__main__":
    main()
