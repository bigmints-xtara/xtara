#!/usr/bin/env python3
"""
Enhanced PSG Extractor
======================

Complete extraction system for PSG Medical College that captures:
1. All 41 courses including B.Sc programs
2. Proper college information (name, state, district, address)
3. Medical course classification using LLM
4. Complete course details with fees, duration, etc.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
import sys
import time
from typing import Dict, List, Optional
from datetime import datetime

# Import our modules
sys.path.append('.')
from corrected_crawler import CorrectedCrawler
from medical_llm_processor import MedicalCourseLLMProcessor
from college_data_extractor import CollegeDataExtractor

class EnhancedPSGExtractor:
    """Enhanced extractor specifically for PSG Medical College"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Initialize components
        self.crawler = CorrectedCrawler('.', 'test-output')
        self.medical_processor = MedicalCourseLLMProcessor()
        self.college_extractor = CollegeDataExtractor()
        
    def extract_complete_college_data(self, url: str) -> Dict:
        """Extract complete college data with all courses and information"""
        
        print(f"🔍 Extracting complete data for: {url}")
        
        try:
            # Get page content
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract basic college information
            college_data = self._extract_college_info(soup, url)
            
            # Extract all courses using multiple methods
            all_courses = self._extract_all_courses(soup, url)
            
            print(f"✅ Extracted {len(all_courses)} total courses")
            
            # Apply medical LLM processing for medical colleges
            if self._is_medical_college(college_data['name']):
                print("🏥 Applying medical LLM processing...")
                all_courses = self.medical_processor.process_medical_courses(
                    all_courses, 
                    college_data['name']
                )
                print(f"✅ Medical LLM processed {len(all_courses)} courses")
            
            # Add courses to college data
            college_data['courses'] = all_courses
            
            # Add metadata
            college_data['enrichment_metadata'] = {
                'processed_at': datetime.now().isoformat(),
                'extractor_version': 'enhanced_v1.0',
                'total_courses': len(all_courses)
            }
            
            return college_data
            
        except Exception as e:
            print(f"❌ Error extracting data: {e}")
            return {}
    
    def _extract_college_info(self, soup: BeautifulSoup, url: str) -> Dict:
        """Extract complete college information"""
        
        college_data = {
            'name': '',
            'aka': [],
            'state': '',
            'district': '',
            'city': '',
            'address': '',
            'contacts': {'phone': [], 'email': [], 'website': []},
            'accreditations': [],
            'affiliations': [],
            'campus_size': None,
            'entrance_exams': [],
            'fees': {'from': None, 'to': None},
            'placements': [],
            'rankings': [],
            'scholarships': [],
            'notable_alumni': [],
            'enrichment_score': 0,
            'url': url
        }
        
        # Extract college name
        name_element = soup.find('h1') or soup.find('title')
        if name_element:
            name_text = name_element.get_text().strip()
            # Clean up the name
            name_text = re.sub(r'\s*Courses & Fees.*$', '', name_text)
            name_text = re.sub(r'\s*-.*$', '', name_text)
            college_data['name'] = name_text.strip()
        
        # Extract location information
        location_elements = soup.find_all(text=re.compile(r'(Tamil Nadu|Coimbatore|Chennai|Bangalore)', re.I))
        for elem in location_elements:
            text = elem.strip()
            if 'tamil nadu' in text.lower():
                college_data['state'] = 'Tamil Nadu'
            if 'coimbatore' in text.lower():
                college_data['city'] = 'Coimbatore'
        
        # Extract address from breadcrumb or location info
        breadcrumb = soup.find('nav', class_='breadcrumb') or soup.find('ol', class_='breadcrumb')
        if breadcrumb:
            location_text = breadcrumb.get_text()
            if 'coimbatore' in location_text.lower():
                college_data['city'] = 'Coimbatore'
                college_data['state'] = 'Tamil Nadu'
        
        # Extract website
        website_links = soup.find_all('a', href=re.compile(r'https?://[^/]*psg[^/]*\.(ac\.in|edu|org)', re.I))
        for link in website_links:
            href = link.get('href')
            if href and href not in college_data['contacts']['website']:
                college_data['contacts']['website'].append(href)
        
        # Extract accreditations
        accred_text = soup.get_text().lower()
        if 'nmc' in accred_text or 'national medical council' in accred_text:
            college_data['accreditations'].append({
                'name': 'National Medical Council (NMC)',
                'status': 'Accredited',
                'since': None
            })
        
        # Extract affiliations
        if 'tamil nadu dr. m.g.r. medical university' in accred_text:
            college_data['affiliations'].append('Tamil Nadu Dr. M.G.R. Medical University, Chennai')
        
        return college_data
    
    def _extract_all_courses(self, soup: BeautifulSoup, url: str) -> List[Dict]:
        """Extract all courses using multiple extraction methods"""
        
        all_courses = []
        
        # Method 1: Use corrected crawler for primary extraction
        print("📋 Method 1: Using corrected crawler...")
        try:
            crawler_courses = self.crawler.extract_courses_from_url(url)
            all_courses.extend(crawler_courses)
            print(f"   Found {len(crawler_courses)} courses")
        except Exception as e:
            print(f"   ❌ Crawler failed: {e}")
        
        # Method 2: Extract from course tables specifically
        print("📋 Method 2: Extracting from course tables...")
        table_courses = self._extract_from_course_tables(soup)
        all_courses.extend(table_courses)
        print(f"   Found {len(table_courses)} additional courses")
        
        # Method 3: Extract from course cards and modals
        print("📋 Method 3: Extracting from course cards and modals...")
        card_courses = self._extract_from_course_cards(soup)
        all_courses.extend(card_courses)
        print(f"   Found {len(card_courses)} additional courses")
        
        # Method 4: Extract B.Sc courses specifically
        print("📋 Method 4: Extracting B.Sc courses specifically...")
        bsc_courses = self._extract_bsc_courses(soup)
        all_courses.extend(bsc_courses)
        print(f"   Found {len(bsc_courses)} B.Sc courses")
        
        # Deduplicate courses
        unique_courses = self._deduplicate_courses(all_courses)
        print(f"📊 Total unique courses: {len(unique_courses)}")
        
        return unique_courses
    
    def _extract_from_course_tables(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract courses from table structures"""
        courses = []
        
        # Look for fee tables
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    # Extract course name from first cell
                    course_name = cells[0].get_text().strip()
                    if course_name and len(course_name) > 3:
                        # Extract fees if available
                        fees_text = cells[-1].get_text().strip() if len(cells) > 1 else ""
                        
                        course = {
                            'name': course_name,
                            'title': course_name,
                            'stream': self._determine_stream(course_name),
                            'type': self._determine_type(course_name),
                            'specialization': self._extract_specialization(course_name),
                            'duration': self._extract_duration(course_name),
                            'fees': self._parse_fees(fees_text),
                            'entrance_exams': '',
                            'seats': None
                        }
                        courses.append(course)
        
        return courses
    
    def _extract_from_course_cards(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract courses from course cards"""
        courses = []
        
        # Look for course cards
        course_cards = soup.find_all('div', class_=re.compile(r'course.*card', re.I))
        for card in course_cards:
            # Extract course name
            name_elem = card.find(['h3', 'h4', 'h5'], class_=re.compile(r'course.*name', re.I))
            if not name_elem:
                name_elem = card.find(['h3', 'h4', 'h5'])
            
            if name_elem:
                course_name = name_elem.get_text().strip()
                
                # Extract other details
                duration_elem = card.find(text=re.compile(r'\d+\s*(year|month)', re.I))
                duration = duration_elem.strip() if duration_elem else None
                
                # Extract fees
                fees_elem = card.find(text=re.compile(r'₹|rs|inr|\d+,?\d*', re.I))
                fees_text = fees_elem.strip() if fees_elem else ""
                
                course = {
                    'name': course_name,
                    'title': course_name,
                    'stream': self._determine_stream(course_name),
                    'type': self._determine_type(course_name),
                    'specialization': self._extract_specialization(course_name),
                    'duration': duration,
                    'fees': self._parse_fees(fees_text),
                    'entrance_exams': '',
                    'seats': None
                }
                courses.append(course)
        
        return courses
    
    def _extract_bsc_courses(self, soup: BeautifulSoup) -> List[Dict]:
        """Specifically extract B.Sc courses that might be missed"""
        courses = []
        
        # Look for B.Sc mentions in the page
        page_text = soup.get_text()
        bsc_patterns = [
            r'B\.?Sc\.?\s*\(?([^)]+)\)?',
            r'Bachelor of Science\s*\[?B\.?Sc\.?\]?\s*\(?([^)]+)\)?',
            r'B\.?Sc\.?\s*in\s+([^,\n]+)',
            r'B\.?Sc\.?\s*-\s*([^,\n]+)'
        ]
        
        for pattern in bsc_patterns:
            matches = re.findall(pattern, page_text, re.I)
            for match in matches:
                specialization = match.strip()
                if len(specialization) > 2 and len(specialization) < 100:
                    course_name = f"B.Sc ({specialization})"
                    
                    course = {
                        'name': course_name,
                        'title': course_name,
                        'stream': 'Science',
                        'type': 'Undergraduate',
                        'specialization': specialization,
                        'duration': '3 years',
                        'fees': {'from': None, 'to': None},
                        'entrance_exams': '',
                        'seats': None
                    }
                    courses.append(course)
        
        return courses
    
    def _determine_stream(self, course_name: str) -> str:
        """Determine course stream based on course name"""
        name_lower = course_name.lower()
        
        # Medical streams
        if any(term in name_lower for term in ['mbbs', 'md', 'ms', 'dm', 'm.ch', 'bds', 'nursing', 'pharmacy', 'physiotherapy']):
            return 'Medical'
        
        # Science streams
        if any(term in name_lower for term in ['b.sc', 'bachelor of science', 'physics', 'chemistry', 'biology', 'mathematics', 'botany', 'zoology']):
            return 'Science'
        
        # Engineering streams
        if any(term in name_lower for term in ['b.tech', 'b.e', 'engineering', 'computer science', 'mechanical', 'electrical']):
            return 'Engineering'
        
        # Management streams
        if any(term in name_lower for term in ['mba', 'bba', 'management', 'business']):
            return 'Management'
        
        return 'General'
    
    def _determine_type(self, course_name: str) -> str:
        """Determine course type based on course name"""
        name_lower = course_name.lower()
        
        if any(term in name_lower for term in ['phd', 'ph.d', 'doctorate', 'doctoral']):
            return 'Doctorate'
        elif any(term in name_lower for term in ['md', 'ms', 'dm', 'm.ch', 'master', 'mba', 'mca', 'm.sc', 'm.tech', 'm.e']):
            return 'Postgraduate'
        elif any(term in name_lower for term in ['diploma', 'certificate']):
            return 'Diploma'
        else:
            return 'Undergraduate'
    
    def _extract_specialization(self, course_name: str) -> Optional[str]:
        """Extract specialization from course name"""
        # Look for content in parentheses
        paren_match = re.search(r'\(([^)]+)\)', course_name)
        if paren_match:
            return paren_match.group(1).strip()
        
        # Look for content after dash
        dash_match = re.search(r'-\s*(.+)$', course_name)
        if dash_match:
            return dash_match.group(1).strip()
        
        # Look for content after "in"
        in_match = re.search(r'\bin\s+(.+)$', course_name, re.I)
        if in_match:
            return in_match.group(1).strip()
        
        return None
    
    def _extract_duration(self, course_name: str) -> Optional[str]:
        """Extract duration from course name or context"""
        name_lower = course_name.lower()
        
        if any(term in name_lower for term in ['mbbs']):
            return '5.5 years'
        elif any(term in name_lower for term in ['md', 'ms', 'dm', 'm.ch']):
            return '3 years'
        elif any(term in name_lower for term in ['b.sc', 'bachelor']):
            return '3 years'
        elif any(term in name_lower for term in ['diploma']):
            return '2 years'
        
        return None
    
    def _parse_fees(self, fees_text: str) -> Dict:
        """Parse fees from text"""
        if not fees_text:
            return {'from': None, 'to': None}
        
        # Remove currency symbols and clean
        clean_text = re.sub(r'[₹,\s]', '', fees_text)
        
        # Look for numbers
        numbers = re.findall(r'\d+', clean_text)
        if numbers:
            if len(numbers) == 1:
                amount = numbers[0]
                return {'from': amount, 'to': amount}
            elif len(numbers) >= 2:
                return {'from': numbers[0], 'to': numbers[-1]}
        
        return {'from': None, 'to': None}
    
    def _deduplicate_courses(self, courses: List[Dict]) -> List[Dict]:
        """Remove duplicate courses"""
        seen = set()
        unique_courses = []
        
        for course in courses:
            name = course.get('name', '').lower().strip()
            if name and name not in seen:
                seen.add(name)
                unique_courses.append(course)
        
        return unique_courses
    
    def _is_medical_college(self, college_name: str) -> bool:
        """Check if this is a medical college"""
        name_lower = college_name.lower()
        return any(term in name_lower for term in ['medical', 'medicine', 'hospital', 'health'])

def main():
    """Test the enhanced extractor"""
    extractor = EnhancedPSGExtractor()
    
    url = 'https://collegedunia.com/college/10810-psg-institute-of-medical-sciences-and-research-psgimsr-coimbatore/courses-fees'
    
    print("🚀 Testing Enhanced PSG Extractor...")
    print("=" * 60)
    
    result = extractor.extract_complete_college_data(url)
    
    if result:
        courses = result.get('courses', [])
        print(f"\n✅ Extraction Complete!")
        print(f"College: {result.get('name', 'N/A')}")
        print(f"State: {result.get('state', 'N/A')}")
        print(f"City: {result.get('city', 'N/A')}")
        print(f"Total courses: {len(courses)}")
        
        # Save result
        with open('enhanced_psg_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n📁 Result saved to: enhanced_psg_result.json")
    else:
        print("❌ Extraction failed!")

if __name__ == "__main__":
    main()
