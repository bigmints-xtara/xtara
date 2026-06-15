#!/usr/bin/env python3
"""
Debug script to test Kerala scraping
"""

import requests
import re
from bs4 import BeautifulSoup

def debug_kerala_scraping():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
    }
    
    url = 'https://collegedunia.com/kerala-colleges?page=1'
    print(f"Fetching: {url}")
    
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    
    soup = BeautifulSoup(response.text, 'html.parser')
    colleges = []
    duplicates = set()  # Simulate the duplicates set
    
    # Find college links - they're typically in divs with class containing 'clg-name-address'
    college_divs = soup.find_all('div', class_=lambda x: x and 'clg-name-address' in x)
    print(f"Found {len(college_divs)} clg-name-address divs")
    
    for i, div in enumerate(college_divs):
        link_elem = div.find('a', href=re.compile(r'/college/\d+'))
        if link_elem:
            href = link_elem['href']
            print(f"Div {i+1}: Found link -> {href}")
            
            # Extract college ID from URL
            college_id = href.split('/college/')[1].split('-')[0]
            print(f"  College ID: {college_id}")
            
            # Skip if already processed
            if college_id in duplicates:
                print(f"  Skipping duplicate: {college_id}")
                continue
            
            # Make URL absolute
            if href.startswith('/'):
                href = f"https://collegedunia.com{href}"
            
            college_name = link_elem.get_text(strip=True)
            print(f"  College name: {college_name}")
            
            colleges.append({
                'id': college_id,
                'url': href,
                'name': college_name
            })
            
            duplicates.add(college_id)
            print(f"  Added to colleges list. Total: {len(colleges)}")
        else:
            print(f"Div {i+1}: No college link found")
    
    print(f"\nFinal result: {len(colleges)} colleges found")
    for i, college in enumerate(colleges[:5], 1):
        print(f"  {i}. {college['name']} (ID: {college['id']})")
    
    return colleges

if __name__ == "__main__":
    colleges = debug_kerala_scraping()
