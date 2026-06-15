#!/usr/bin/env python3
"""
API-based scraper for CollegeDunia that extracts course data from JSON embedded in HTML
"""

import requests
import json
import re
import logging
from typing import Dict, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin

class CollegeDuniaAPIScraper:
    """Scraper that extracts data from JSON embedded in CollegeDunia pages"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://collegedunia.com/'
        })
    
    def scrape_college_data(self, college_url: str) -> Optional[Dict]:
        """Scrape college data using API approach"""
        try:
            self.logger.info(f"Scraping college data from: {college_url}")
            
            # Fetch the page
            response = self.session.get(college_url, timeout=30)
            response.raise_for_status()
            
            # Extract JSON data from HTML
            course_data = self._extract_course_data_from_html(response.text)
            college_info = self._extract_college_info_from_html(response.text, college_url)
            
            if not course_data and not college_info:
                self.logger.warning("No data found in page")
                return None
            
            # Combine the data
            result = {
                'name': college_info.get('name', 'Unknown College'),
                'state': college_info.get('state', 'Unknown'),
                'city': college_info.get('city', 'Unknown'),
                'address': college_info.get('address', 'Unknown'),
                'contacts': college_info.get('contacts', {}),
                'courses': course_data.get('courses', []),
                'entrance_exams': course_data.get('entrance_exams', []),
                'fees': course_data.get('fees', {}),
                'metadata': {
                    'url': college_url,
                    'processed_at': self._get_current_timestamp(),
                    'extractor_version': '2.0.0-api'
                }
            }
            
            self.logger.info(f"Successfully scraped: {result['name']}")
            return result
            
        except Exception as e:
            self.logger.error(f"Failed to scrape {college_url}: {e}")
            return None
    
    def _extract_course_data_from_html(self, html_content: str) -> Dict:
        """Extract course data from JSON embedded in HTML"""
        course_data = {
            'courses': [],
            'entrance_exams': [],
            'fees': {}
        }
        
        try:
            # Extract course names - get ALL courses, not just the first few
            course_names = re.findall(r'"display_name":"([^"]+)"', html_content)
            
            # Extract stream data
            stream_data = re.findall(r'"stream_data":\{"name":"([^"]+)"', html_content)
            
            # Extract duration data
            duration_data = re.findall(r'"duration_year":"([^"]+)"', html_content)
            
            # Extract course types
            course_types = re.findall(r'"course_type":"([^"]+)"', html_content)
            
            # Extract level data
            levels = re.findall(r'"level":"([^"]+)"', html_content)
            
            # Extract sub-stream data for specializations
            sub_stream_data = re.findall(r'"sub_stream_data":\{"name":"([^"]+)"', html_content)
            
            # Combine the data into courses
            for i, name in enumerate(course_names):
                # Skip duplicate course names
                if i > 0 and name == course_names[i-1]:
                    continue
                    
                # Get specialization from sub_stream_data if available
                specialization = 'None'
                if i < len(sub_stream_data) and sub_stream_data[i] != 'General':
                    specialization = sub_stream_data[i]
                
                course = {
                    'title': name,
                    'name': name,
                    'stream': stream_data[i] if i < len(stream_data) else 'Unknown',
                    'duration': f"{duration_data[i]} years" if i < len(duration_data) and duration_data[i] != '0' else 'Unknown',
                    'course_type': course_types[i] if i < len(course_types) else 'Unknown',
                    'level': levels[i] if i < len(levels) else 'Unknown',
                    'specialization': specialization
                }
                course_data['courses'].append(course)
            
            # Extract entrance exams
            exam_patterns = ['CAT', 'MAT', 'XAT', 'CMAT', 'SNAP', 'NEET', 'JEE', 'GATE', 'CLAT']
            for exam in exam_patterns:
                if exam in html_content:
                    course_data['entrance_exams'].append({
                        'name': exam,
                        'type': 'National' if exam in ['CAT', 'MAT', 'XAT', 'CMAT', 'SNAP', 'NEET', 'JEE', 'GATE', 'CLAT'] else 'State'
                    })
            
            # Extract fees
            fee_patterns = [
                r'₹([0-9,]+)',
                r'([0-9,]+)\s*lakh',
                r'([0-9,]+)\s*thousand'
            ]
            
            fees = []
            for pattern in fee_patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                for match in matches:
                    try:
                        # Clean and convert fee
                        fee_str = match.replace(',', '').replace('lakh', '00000').replace('thousand', '000')
                        fee = int(fee_str)
                        if 1000 <= fee <= 5000000:  # Reasonable fee range
                            fees.append(fee)
                    except:
                        continue
            
            if fees:
                course_data['fees'] = {
                    'from': min(fees),
                    'to': max(fees)
                }
            
            self.logger.info(f"Extracted {len(course_data['courses'])} courses, {len(course_data['entrance_exams'])} exams")
            
        except Exception as e:
            self.logger.error(f"Error extracting course data: {e}")
        
        return course_data
    
    def _extract_college_info_from_html(self, html_content: str, college_url: str) -> Dict:
        """Extract basic college information from HTML"""
        college_info = {
            'name': 'Unknown College',
            'state': 'Unknown',
            'city': 'Unknown',
            'address': 'Unknown',
            'contacts': {}
        }
        
        try:
            # Extract college name from title or h1
            title_match = re.search(r'<title>([^<]+)</title>', html_content, re.IGNORECASE)
            if title_match:
                title = title_match.group(1)
                # Clean up title
                college_info['name'] = title.replace('Courses & Fees', '').replace('2025', '').strip()
            
            # Extract location from college name patterns
            if 'Kochi' in college_info['name'] or 'Kerala' in college_info['name']:
                college_info['state'] = 'Kerala'
                college_info['city'] = 'Kochi'
                college_info['address'] = 'Kochi, Kerala'
            
            # Extract website
            website_patterns = [
                r'https?://[a-zA-Z0-9.-]+\.(edu\.in|ac\.in|gov\.in)',
                r'https?://[a-zA-Z0-9.-]+\.com',
                r'https?://[a-zA-Z0-9.-]+\.org'
            ]
            
            for pattern in website_patterns:
                website_match = re.search(pattern, html_content)
                if website_match:
                    website = website_match.group(0)
                    # Filter out unwanted domains
                    if not any(domain in website for domain in ['doubleclick.net', 'cdquestions.com', 'play.google.com', 'itunes.apple.com']):
                        college_info['contacts']['website'] = website
                        break
            
            # Extract phone numbers
            phone_patterns = [
                r'\+91[\s-]?\d{10}',
                r'\d{10}',
                r'\(\d{3}\)[\s-]?\d{3}[\s-]?\d{4}'
            ]
            
            for pattern in phone_patterns:
                phone_match = re.search(pattern, html_content)
                if phone_match:
                    phone = phone_match.group(0)
                    college_info['contacts']['phone'] = [phone]
                    break
            
            # Extract email
            email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', html_content)
            if email_match:
                college_info['contacts']['email'] = [email_match.group(0)]
            
        except Exception as e:
            self.logger.error(f"Error extracting college info: {e}")
        
        return college_info
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()

# Test the API scraper
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    scraper = CollegeDuniaAPIScraper()
    test_url = 'https://collegedunia.com/college/18512-rajagiri-business-school-rbs-kochi/courses-fees'
    
    print("=== TESTING API SCRAPER ===")
    result = scraper.scrape_college_data(test_url)
    
    if result:
        print(f"✅ SUCCESS: {result['name']}")
        print(f"📚 Courses: {len(result['courses'])}")
        print(f"📍 Location: {result['city']}, {result['state']}")
        print(f"🎯 Exams: {len(result['entrance_exams'])}")
        print(f"💰 Fees: {result['fees']}")
        
        print("\n📚 COURSES:")
        for i, course in enumerate(result['courses'][:10]):
            print(f"  {i+1}. {course['title']} ({course['stream']}) - {course['duration']}")
    else:
        print("❌ FAILED: No data extracted")
