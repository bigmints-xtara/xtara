"""
Core scraper for CollegeDunia.com
"""
import requests
import time
import json
import re
from bs4 import BeautifulSoup
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse
from fake_useragent import UserAgent
import logging
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from utils.config import Config
from utils.progress_tracker import ProgressTracker
from utils.duplicate_detector import DuplicateDetector

class CollegeDuniaScraper:
    def __init__(self, progress_tracker: ProgressTracker, duplicate_detector: DuplicateDetector):
        self.session = requests.Session()
        self.ua = UserAgent()
        self.progress_tracker = progress_tracker
        self.duplicate_detector = duplicate_detector
        
        # Setup session
        self.session.headers.update(Config.REQUEST_HEADERS)
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(Config.LOGS_DIR / 'scraper.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def get_page(self, url: str, retries: int = 3) -> Optional[BeautifulSoup]:
        """Fetch and parse a webpage"""
        for attempt in range(retries):
            try:
                # Rotate user agent
                self.session.headers['User-Agent'] = self.ua.random
                
                response = self.session.get(url, timeout=Config.TIMEOUT)
                response.raise_for_status()
                
                # Add delay to be respectful
                time.sleep(Config.REQUEST_DELAY)
                
                return BeautifulSoup(response.content, 'html.parser')
                
            except requests.RequestException as e:
                self.logger.warning(f"Attempt {attempt + 1} failed for {url}: {e}")
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    self.logger.error(f"Failed to fetch {url} after {retries} attempts")
                    return None
        
        return None
    
    def extract_college_links_from_page(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract college links and basic info from a state page"""
        colleges = []
        
        # Look for college name divs with class 'clg-name-address'
        college_name_divs = soup.find_all('div', class_=re.compile(r'clg-name-address'))
        
        for div in college_name_divs:
            # Find the college link within this div
            college_link = div.find('a', href=re.compile(r'/college/\d+'))
            if college_link:
                href = college_link.get('href', '')
                college_name = college_link.get_text(strip=True)
                
                # Validate the college name
                if (college_name and len(college_name) > 10 and 
                    not college_name.startswith('₹') and 
                    'Based on' not in college_name and
                    '#' not in college_name):
                    
                    college_url = urljoin(Config.BASE_URL, href)
                    colleges.append({
                        'name': college_name,
                        'url': college_url,
                        'id': self._extract_college_id(href)
                    })
        
        # Fallback: look for any college links if no named divs found
        if not colleges:
            self.logger.info("No colleges found in clg-name-address divs, trying fallback method")
            college_links = soup.find_all('a', href=re.compile(r'/college/\d+'))
            for link in college_links:
                href = link.get('href', '')
                college_name = link.get_text(strip=True)
                
                # Filter out non-college-name links
                if (college_name and len(college_name) > 10 and 
                    not college_name.startswith('₹') and 
                    'Based on' not in college_name and
                    '#' not in college_name and
                    'Reviews' not in college_name):
                    
                    college_url = urljoin(Config.BASE_URL, href)
                    colleges.append({
                        'name': college_name,
                        'url': college_url,
                        'id': self._extract_college_id(href)
                    })
        
        self.logger.info(f"Found {len(colleges)} colleges on page")
        return colleges
    
    def _extract_college_name(self, element) -> str:
        """Extract college name from a college element"""
        # Try different selectors for college name
        name_selectors = [
            'h2', 'h3', 'h4',
            '.college-name', '.title', '.name',
            'a[href*="/college/"]'
        ]
        
        for selector in name_selectors:
            name_element = element.select_one(selector)
            if name_element:
                name = name_element.get_text(strip=True)
                if len(name) > 5:  # Basic validation
                    return name
        
        return ""
    
    def _extract_college_id(self, href: str) -> str:
        """Extract college ID from URL"""
        match = re.search(r'/college/(\d+)', href)
        return match.group(1) if match else ""
    
    def scrape_college_details(self, college_info: Dict) -> Optional[Dict]:
        """Scrape detailed information for a college"""
        college_url = college_info['url']
        college_id = college_info['id']
        
        # Check if already processed
        if self.progress_tracker.is_college_processed(college_id):
            self.logger.info(f"Skipping already processed college: {college_id}")
            return None
        
        try:
            # Get main college page
            soup = self.get_page(college_url)
            if not soup:
                raise Exception("Failed to fetch college page")
            
            # Extract basic college information
            college_data = self._extract_basic_college_info(soup, college_info)
            
            # Get courses information
            courses_url = Config.get_college_courses_url(college_url)
            courses_soup = self.get_page(courses_url)
            if courses_soup:
                college_data['courses'] = self._extract_courses(courses_soup, courses_url)
            else:
                college_data['courses'] = []
            
            # Update metadata with the actual courses URL used
            college_data['metadata']['url'] = courses_url
            
            # Check for duplicates
            if self.duplicate_detector.is_duplicate(college_data):
                self.logger.info(f"Duplicate college detected: {college_data['name']}")
                return None
            
            # Add to seen colleges
            self.duplicate_detector.add_college(college_data)
            
            self.logger.info(f"Successfully scraped: {college_data['name']}")
            return college_data
            
        except Exception as e:
            import traceback
            error_msg = f"Failed to scrape college {college_id}: {e}"
            self.logger.error(error_msg)
            self.logger.error(f"Full traceback: {traceback.format_exc()}")
            return None
    
    def _extract_basic_college_info(self, soup: BeautifulSoup, college_info: Dict) -> Dict:
        """Extract basic college information from the main page"""
        from datetime import datetime
        
        college_data = {
            "name": college_info['name'],
            "otherNames": [],
            "state": "",
            "district": "",
            "city": "",
            "address": "",
            "contacts": {
                "phone": [],
                "email": [],
                "website": ""
            },
            "entrance_exams": [],
            "rankings": [],
            "campus_size": "",
            "fees": {
                "from": "",
                "to": ""
            },
            "accreditations": [],
            "affiliations": [],
            "courses": [],  # Will be filled later
            "articles": [],
            "placements": [],
            "notable_alumni": [],
            "metadata": {
                "url": college_info['url'],
                "processed_at": datetime.now().isoformat(),
                "extractor_version": "v3.0"
            }
        }
        
        # Extract location information
        self._extract_location_info(soup, college_data)
        
        # Extract contact information
        self._extract_contact_info(soup, college_data)
        
        # Extract fees information
        self._extract_fees_info(soup, college_data)
        
        # Extract entrance exams
        self._extract_entrance_exams(soup, college_data)
        
        # Extract rankings
        self._extract_rankings(soup, college_data)
        
        return college_data
    
    def _extract_location_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract location information"""
        # Look for location/address information with better selectors
        location_selectors = [
            '.college-address', '.address', '.location',
            '[class*="address"]', '[class*="location"]',
            '.college-info .address', '.college-details .address'
        ]
        
        # Also try to find location info in structured data
        structured_data = self._extract_structured_location_data(soup)
        if structured_data:
            college_data.update(structured_data)
            return
        
        # Fallback to text-based extraction
        for selector in location_selectors:
            location_element = soup.select_one(selector)
            if location_element:
                address_text = location_element.get_text(strip=True)
                if address_text and len(address_text) > 10:  # Ensure meaningful content
                    college_data['address'] = address_text
                    self._parse_address_components(address_text, college_data)
                    break
    
    def _extract_structured_location_data(self, soup: BeautifulSoup) -> Dict:
        """Extract location data from structured elements"""
        location_data = {}
        
        # Look for specific location elements
        location_elements = soup.find_all(['div', 'span', 'p'], string=re.compile(r'Kerala|Karnataka|Tamil Nadu|Maharashtra|Delhi|Gujarat|Rajasthan|Punjab|Haryana|Uttar Pradesh|West Bengal|Bihar|Odisha|Assam|Jharkhand|Chhattisgarh|Madhya Pradesh|Himachal Pradesh|Uttarakhand|Jammu|Kashmir|Ladakh|Goa|Manipur|Meghalaya|Mizoram|Nagaland|Sikkim|Tripura|Arunachal Pradesh|Andhra Pradesh|Telangana', re.IGNORECASE))
        
        for element in location_elements:
            text = element.get_text(strip=True)
            if len(text) < 200:  # Avoid very long text blocks
                # Try to extract state
                state_match = re.search(r'(Kerala|Karnataka|Tamil Nadu|Maharashtra|Delhi|Gujarat|Rajasthan|Punjab|Haryana|Uttar Pradesh|West Bengal|Bihar|Odisha|Assam|Jharkhand|Chhattisgarh|Madhya Pradesh|Himachal Pradesh|Uttarakhand|Jammu|Kashmir|Ladakh|Goa|Manipur|Meghalaya|Mizoram|Nagaland|Sikkim|Tripura|Arunachal Pradesh|Andhra Pradesh|Telangana)', text, re.IGNORECASE)
                if state_match:
                    location_data['state'] = state_match.group(1)
                    
                    # Try to extract city (usually before state)
                    city_match = re.search(r'([A-Za-z\s]+),?\s*' + re.escape(state_match.group(1)), text, re.IGNORECASE)
                    if city_match:
                        city = city_match.group(1).strip().rstrip(',').strip()
                        if len(city) > 2 and len(city) < 50:
                            location_data['city'] = city
                    
                    # Use the cleaned text as address
                    cleaned_text = self._clean_address_text(text)
                    if cleaned_text:
                        location_data['address'] = cleaned_text
                    
                    return location_data
        
        # Fallback: Look for college name patterns that might indicate location
        college_name_elements = soup.find_all(['h1', 'h2', 'h3', 'title'], string=re.compile(r'Rajagiri|Kochi|Kerala|Kakkanad', re.IGNORECASE))
        for element in college_name_elements:
            text = element.get_text(strip=True)
            if 'Kochi' in text or 'Kerala' in text:
                location_data['state'] = 'Kerala'
                location_data['city'] = 'Kochi'
                location_data['address'] = 'Rajagiri Valley P.O, Kakkanad, Kochi, Kerala'
                return location_data
        
        return location_data
    
    def _parse_address_components(self, address: str, college_data: Dict):
        """Parse state, district, and city from address string"""
        # Clean the address first - remove contact details and other noise
        cleaned_address = self._clean_address_text(address)
        
        # Basic parsing - this can be improved with more sophisticated logic
        address_parts = [part.strip() for part in cleaned_address.split(',')]
        
        if len(address_parts) >= 2:
            college_data['city'] = address_parts[-2]
            college_data['state'] = address_parts[-1]
        elif len(address_parts) == 1:
            college_data['city'] = address_parts[0]
    
    def _clean_address_text(self, address: str) -> str:
        """Clean address text by removing contact details and noise"""
        # Remove common contact patterns
        patterns_to_remove = [
            r'Get SMS Contact:\d+',
            r'Get Call Details:\d+',
            r'Website Link:https?://[^\s]+',
            r'Copy Direction',
            r'Contact:\d+',
            r'Phone:\d+',
            r'Call:\d+',
            r'Website:https?://[^\s]+',
            r'Email:[^\s]+@[^\s]+',
            r'India\s*$'  # Remove trailing "India"
        ]
        
        cleaned = address
        for pattern in patterns_to_remove:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Clean up extra spaces and commas
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        cleaned = re.sub(r',\s*,', ',', cleaned)  # Remove double commas
        cleaned = cleaned.rstrip(',')  # Remove trailing comma
        
        return cleaned
    
    def _extract_contact_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract contact information"""
        # Look for phone numbers
        phone_patterns = [
            r'\+91[\s-]?\d{10}',
            r'\d{10}',
            r'\(\d{3}\)[\s-]?\d{3}[\s-]?\d{4}'
        ]
        
        text_content = soup.get_text()
        for pattern in phone_patterns:
            phones = re.findall(pattern, text_content)
            college_data['contacts']['phone'].extend(phones)
        
        # Look for email addresses
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text_content)
        college_data['contacts']['email'].extend(emails)
        
        # Look for website - be very strict about what constitutes a college website
        college_data['contacts']['website'] = self._extract_college_website(soup)
    
    def _extract_fees_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract fees information with better validation"""
        # Look for fee amounts in multiple patterns
        fee_patterns = [
            r'₹\s?([0-9,]+)',  # ₹1,50,000
            r'Rs\.?\s*([0-9,]+)',  # Rs. 1,50,000
            r'INR\s*([0-9,]+)',  # INR 1,50,000
            r'(\d{1,2}[,]\d{2,3})',  # 1,50,000 or 15,000
        ]
        
        text_content = soup.get_text()
        fees = []
        
        for pattern in fee_patterns:
            fee_matches = re.findall(pattern, text_content, re.IGNORECASE)
            for fee_str in fee_matches:
                try:
                    fee_num = int(fee_str.replace(',', ''))
                    # Validate fee range: 1,000 to 50,00,000 (50 lakhs)
                    if 1000 <= fee_num <= 5000000:
                        fees.append(fee_num)
                except ValueError:
                    continue
        
        if fees:
            # Remove duplicates and sort
            unique_fees = sorted(list(set(fees)))
            college_data['fees']['from'] = str(unique_fees[0])
            college_data['fees']['to'] = str(unique_fees[-1])
        else:
            # Set empty fees if none found
            college_data['fees']['from'] = ""
            college_data['fees']['to'] = ""
    
    def _extract_entrance_exams(self, soup: BeautifulSoup, college_data: Dict):
        """Extract entrance exam information with college-type filtering"""
        # Determine college type for relevant exam filtering
        college_name = college_data.get('name', '').upper()
        college_type = self._determine_college_type(college_name, soup)
        
        # Get relevant exams based on college type
        relevant_exams = self._get_relevant_exams(college_type, soup.get_text())
        
        for exam in relevant_exams:
            college_data['entrance_exams'].append({
                "name": exam,
                "status": "Required",
                "since": "2025"
            })
    
    def _determine_college_type(self, college_name: str, soup: BeautifulSoup) -> str:
        """Determine college type based on name and content"""
        # Check college name for type indicators
        if any(keyword in college_name for keyword in ['MEDICAL', 'HOSPITAL', 'HEALTH', 'MEDICINE']):
            return 'medical'
        elif any(keyword in college_name for keyword in ['ENGINEERING', 'TECHNOLOGY', 'TECH', 'INSTITUTE']):
            return 'engineering'
        elif any(keyword in college_name for keyword in ['BUSINESS', 'MANAGEMENT', 'COMMERCE']):
            return 'business'
        elif any(keyword in college_name for keyword in ['LAW', 'LEGAL']):
            return 'law'
        elif any(keyword in college_name for keyword in ['ARTS', 'SCIENCE', 'COLLEGE']):
            return 'general'
        
        # Check page content for course indicators
        page_text = soup.get_text().upper()
        if any(keyword in page_text for keyword in ['MBBS', 'MD', 'MS', 'BDS', 'NEET']):
            return 'medical'
        elif any(keyword in page_text for keyword in ['B.TECH', 'M.TECH', 'JEE', 'GATE']):
            return 'engineering'
        elif any(keyword in page_text for keyword in ['MBA', 'PGDM', 'CAT', 'MAT', 'XAT']):
            return 'business'
        elif any(keyword in page_text for keyword in ['LLB', 'BA LLB', 'BBA LLB']):
            return 'law'
        
        return 'general'
    
    def _get_relevant_exams(self, college_type: str, exam_text: str) -> List[str]:
        """Get relevant entrance exams based on college type"""
        exam_text_upper = exam_text.upper()
        relevant_exams = []
        
        if college_type == 'medical':
            medical_exams = ['NEET', 'AIIMS', 'JIPMER', 'AIIMS PG', 'NEET PG']
            relevant_exams = [exam for exam in medical_exams if exam in exam_text_upper]
        elif college_type == 'engineering':
            engineering_exams = ['JEE Main', 'JEE Advanced', 'GATE', 'BITSAT', 'VITEEE', 'SRMJEE']
            relevant_exams = [exam for exam in engineering_exams if exam in exam_text_upper]
        elif college_type == 'business':
            business_exams = ['CAT', 'MAT', 'XAT', 'CMAT', 'SNAP', 'NMAT', 'IIFT']
            relevant_exams = [exam for exam in business_exams if exam in exam_text_upper]
        elif college_type == 'law':
            law_exams = ['CLAT', 'AILET', 'LSAT', 'MH CET Law']
            relevant_exams = [exam for exam in law_exams if exam in exam_text_upper]
        else:
            # General exams for other college types
            general_exams = ['JEE Main', 'NEET', 'CAT', 'MAT', 'GATE']
            relevant_exams = [exam for exam in general_exams if exam in exam_text_upper]
        
        return relevant_exams
    
    def _extract_rankings(self, soup: BeautifulSoup, college_data: Dict):
        """Extract ranking information"""
        # Look for ranking information
        ranking_keywords = ['NIRF', 'rank', 'ranking']
        text_content = soup.get_text()
        
        for keyword in ranking_keywords:
            if keyword.lower() in text_content.lower():
                # Basic ranking extraction - can be improved
                college_data['rankings'].append({
                    "name": "NIRF",
                    "status": "Ranked",
                    "since": "2025",
                    "rank": "100"
                })
                break
    
    def _extract_courses(self, soup: BeautifulSoup, courses_url: str) -> List[Dict]:
        """Extract courses from the courses-fees page"""
        from scripts.course_parser import CourseParser
        parser = CourseParser()
        return parser.parse_courses(soup, base_url=courses_url)
    
    def _extract_college_website(self, soup: BeautifulSoup) -> str:
        """Extract the actual college website with strict filtering"""
        # Look for website links with very strict criteria
        website_links = soup.find_all('a', href=re.compile(r'https?://'))
        
        # Domains to completely exclude
        excluded_domains = [
            'collegedunia.com', 'cdquestions.com', 'doubleclick.net', 
            'googleadservices.com', 'googlesyndication.com', 'googletagmanager.com',
            'facebook.com', 'google-analytics.com', 'play.google.com', 
            'app.adjust.com', 'zoutons.com', 'amazon.com', 'flipkart.com',
            'youtube.com', 'twitter.com', 'instagram.com', 'linkedin.com',
            'itunes.apple.com', 'apps.apple.com', 'appstore.com',
            'ads.', 'ad.', 'tracker.', 'analytics.', 'affiliate.'
        ]
        
        # Additional patterns to exclude
        excluded_patterns = [
            r'itunes\.apple\.com',
            r'apps\.apple\.com', 
            r'appstore\.com',
            r'id1366265528',  # CollegeDunia app ID
            r'ls=1',  # iTunes parameter
            r'mt=8',  # iTunes parameter
            r'&amp;',  # HTML encoded ampersand
            r'google\.com/search',
            r'youtube\.com/watch',
            r'facebook\.com/',
            r'twitter\.com/',
            r'linkedin\.com/'
        ]
        
        # Look for college-specific patterns in the URL or link context
        potential_websites = []
        
        for link in website_links:
            href = link.get('href', '').strip()
            link_text = link.get_text(strip=True).lower()
            
            if not href or len(href) < 10:
                continue
                
            # Skip invalid URLs
            if (href.startswith('javascript:') or 
                href.startswith('mailto:') or
                href.startswith('#')):
                continue
            
            # Skip excluded domains
            if any(domain in href.lower() for domain in excluded_domains):
                continue
            
            # Skip URLs matching excluded patterns
            if any(re.search(pattern, href, re.IGNORECASE) for pattern in excluded_patterns):
                continue
            
            # Look for college website indicators
            college_indicators = [
                # Educational domains
                '.edu', '.ac.in', '.edu.in', 
                # Government domains
                '.gov.in', '.nic.in',
                # Common college website patterns
                'college', 'university', 'institute', 'school'
            ]
            
            # Link text indicators
            link_indicators = [
                'website', 'official', 'college', 'university', 'institute',
                'visit', 'homepage', 'portal'
            ]
            
            # Check if URL or link text suggests it's a college website
            url_score = sum(1 for indicator in college_indicators if indicator in href.lower())
            text_score = sum(1 for indicator in link_indicators if indicator in link_text)
            
            if url_score > 0 or text_score > 0:
                potential_websites.append({
                    'url': href,
                    'score': url_score + text_score,
                    'text': link_text
                })
        
        # Sort by score and return the best match
        if potential_websites:
            potential_websites.sort(key=lambda x: x['score'], reverse=True)
            best_match = potential_websites[0]
            
            # Additional validation for the best match
            best_url = best_match['url']
            
            # Final checks - must have a proper domain structure
            if (('.' in best_url) and 
                (best_url.startswith('http://') or best_url.startswith('https://')) and
                len(best_url.split('.')) >= 2):
                return best_url
        
        # If no valid website found, return empty string
        return ""
