#!/usr/bin/env python3
"""
Direct PSG Extractor
====================

Direct extraction from PSG Medical College website to capture all 41 courses.
This approach parses the HTML directly without over-processing.
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from typing import Dict, List, Optional

class DirectPSGExtractor:
    """Direct extractor for PSG Medical College"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def extract_all_courses(self, url: str) -> Dict:
        """Extract all courses directly from the website"""
        
        print(f"🔍 Direct extraction from: {url}")
        
        try:
            # Get page content
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract college info
            college_data = self._extract_college_info(soup, url)
            
            # Extract all courses using direct parsing
            all_courses = []
            
            # Method 1: Extract from fee table rows
            table_courses = self._extract_from_fee_tables(soup)
            all_courses.extend(table_courses)
            print(f"📋 Found {len(table_courses)} courses from tables")
            
            # Method 2: Extract from JSON data if present
            json_courses = self._extract_from_json_data(soup)
            all_courses.extend(json_courses)
            print(f"📋 Found {len(json_courses)} courses from JSON")
            
            # Method 3: Extract from course listings
            listing_courses = self._extract_from_course_listings(soup)
            all_courses.extend(listing_courses)
            print(f"📋 Found {len(listing_courses)} courses from listings")
            
            # Deduplicate and clean
            unique_courses = self._deduplicate_and_clean(all_courses)
            
            # Add courses to college data
            college_data['courses'] = unique_courses
            
            print(f"✅ Total unique courses extracted: {len(unique_courses)}")
            
            return college_data
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def _extract_college_info(self, soup: BeautifulSoup, url: str) -> Dict:
        """Extract college information"""
        
        # Get college name
        name = "PSG Institute of Medical Sciences and Research"
        title_elem = soup.find('h1')
        if title_elem:
            title_text = title_elem.get_text().strip()
            if 'PSG' in title_text:
                name = "PSG Institute of Medical Sciences and Research"
        
        return {
            'name': name,
            'aka': ['PSGIMSR'],
            'state': 'Tamil Nadu',
            'district': 'Coimbatore',
            'city': 'Coimbatore',
            'address': 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu',
            'contacts': {
                'phone': [],
                'email': [],
                'website': ['https://psgimsr.ac.in/']
            },
            'accreditations': [
                {'name': 'National Medical Council (NMC)', 'status': 'Accredited', 'since': None}
            ],
            'affiliations': ['Tamil Nadu Dr. M.G.R. Medical University, Chennai'],
            'campus_size': None,
            'entrance_exams': ['NEET'],
            'fees': {'from': None, 'to': None},
            'placements': [],
            'rankings': [],
            'scholarships': [],
            'notable_alumni': [],
            'enrichment_score': 0,
            'url': url
        }
    
    def _extract_from_fee_tables(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract courses from fee tables"""
        courses = []
        
        # Look for table rows with course information
        rows = soup.find_all('tr')
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 2:
                first_cell = cells[0].get_text().strip()
                
                # Skip header rows
                if first_cell.lower() in ['course', 'courses', 'program', 'degree']:
                    continue
                
                # Check if this looks like a course name
                if len(first_cell) > 3 and any(term in first_cell.lower() for term in 
                    ['mbbs', 'md', 'ms', 'dm', 'm.ch', 'b.sc', 'bachelor', 'master', 'doctorate']):
                    
                    # Extract fees from last cell
                    fees_text = cells[-1].get_text().strip()
                    
                    course = self._create_course_object(first_cell, fees_text)
                    if course:
                        courses.append(course)
        
        return courses
    
    def _extract_from_json_data(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract courses from embedded JSON data"""
        courses = []
        
        # Look for script tags with JSON data
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'offers' in data:
                    offers = data['offers']
                    if isinstance(offers, list):
                        for offer in offers:
                            if 'name' in offer:
                                course = self._create_course_object(offer['name'])
                                if course:
                                    courses.append(course)
            except:
                continue
        
        return courses
    
    def _extract_from_course_listings(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract courses from course listings and text"""
        courses = []
        
        # Look for specific course patterns in text
        page_text = soup.get_text()
        
        # Medical courses patterns
        medical_patterns = [
            r'MBBS',
            r'Doctorate of Medicine\s*\[?MD\]?\s*\(?([^)]*)\)?',
            r'Master of Surgery\s*\[?MS\]?\s*\(?([^)]*)\)?',
            r'Doctorate of Medicine\s*\[?DM\]?\s*\(?([^)]*)\)?',
            r'Master of Chirurgiae\s*\[?M\.?Ch\]?\s*\(?([^)]*)\)?',
            r'Post Graduate Diploma\s*in\s*([^,\n]+)',
        ]
        
        for pattern in medical_patterns:
            matches = re.finditer(pattern, page_text, re.I)
            for match in matches:
                course_name = match.group(0).strip()
                if len(course_name) > 3:
                    course = self._create_course_object(course_name)
                    if course:
                        courses.append(course)
        
        # B.Sc courses patterns
        bsc_patterns = [
            r'B\.?Sc\.?\s*\(?Nursing\)?',
            r'B\.?Sc\.?\s*\(?([^)]{3,30})\)?',
            r'Bachelor of Science\s*\[?B\.?Sc\.?\]?\s*\(?([^)]{3,30})\)?',
        ]
        
        for pattern in bsc_patterns:
            matches = re.finditer(pattern, page_text, re.I)
            for match in matches:
                course_name = match.group(0).strip()
                if len(course_name) > 3 and 'reviews' not in course_name.lower():
                    course = self._create_course_object(course_name)
                    if course:
                        courses.append(course)
        
        return courses
    
    def _create_course_object(self, course_name: str, fees_text: str = "") -> Optional[Dict]:
        """Create a standardized course object"""
        
        if not course_name or len(course_name.strip()) < 3:
            return None
        
        course_name = course_name.strip()
        
        # Skip invalid course names
        if any(invalid in course_name.lower() for invalid in 
            ['reviews', 'views', 'fees', 'admission', 'eligibility', 'cutoff']):
            return None
        
        # Determine stream
        stream = self._determine_stream(course_name)
        
        # Determine type
        course_type = self._determine_type(course_name)
        
        # Extract specialization
        specialization = self._extract_specialization(course_name)
        
        # Determine duration
        duration = self._determine_duration(course_name, course_type)
        
        # Parse fees
        fees = self._parse_fees(fees_text)
        
        return {
            'title': course_name,
            'name': course_name,
            'specialization': specialization,
            'stream': stream,
            'type': course_type,
            'duration': duration,
            'fees': fees,
            'entrance_exams': 'NEET' if stream == 'Medical' else '',
            'seats': None
        }
    
    def _determine_stream(self, course_name: str) -> str:
        """Determine course stream"""
        name_lower = course_name.lower()
        
        if any(term in name_lower for term in ['mbbs', 'md', 'ms', 'dm', 'm.ch', 'medical', 'medicine', 'surgery', 'nursing', 'pharmacy']):
            return 'Medical'
        elif any(term in name_lower for term in ['b.sc', 'bachelor of science', 'science']):
            return 'Science'
        elif any(term in name_lower for term in ['engineering', 'technology', 'b.tech', 'b.e']):
            return 'Engineering'
        elif any(term in name_lower for term in ['management', 'mba', 'business']):
            return 'Management'
        else:
            return 'General'
    
    def _determine_type(self, course_name: str) -> str:
        """Determine course type"""
        name_lower = course_name.lower()
        
        if any(term in name_lower for term in ['phd', 'ph.d', 'doctorate', 'doctoral']):
            return 'Doctorate'
        elif any(term in name_lower for term in ['md', 'ms', 'dm', 'm.ch', 'master', 'post graduate']):
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
            spec = paren_match.group(1).strip()
            if len(spec) > 2 and len(spec) < 100:
                return spec
        
        # Look for content in square brackets
        bracket_match = re.search(r'\[([^\]]+)\]', course_name)
        if bracket_match:
            content = bracket_match.group(1).strip()
            # Skip abbreviations like [MD], [MS]
            if len(content) > 4:
                return content
        
        # Look for content after "in"
        in_match = re.search(r'\bin\s+(.+)$', course_name, re.I)
        if in_match:
            spec = in_match.group(1).strip()
            if len(spec) > 2 and len(spec) < 100:
                return spec
        
        return None
    
    def _determine_duration(self, course_name: str, course_type: str) -> Optional[str]:
        """Determine course duration"""
        name_lower = course_name.lower()
        
        if 'mbbs' in name_lower:
            return '5.5 years'
        elif course_type == 'Postgraduate' and any(term in name_lower for term in ['md', 'ms', 'dm', 'm.ch']):
            return '3 years'
        elif 'b.sc' in name_lower or course_type == 'Undergraduate':
            return '3 years'
        elif 'diploma' in name_lower:
            return '2 years'
        
        return None
    
    def _parse_fees(self, fees_text: str) -> Dict:
        """Parse fees from text"""
        if not fees_text:
            return {'from': None, 'to': None}
        
        # Clean the text
        clean_text = re.sub(r'[₹,\s]', '', fees_text)
        
        # Extract numbers
        numbers = re.findall(r'\d+', clean_text)
        if numbers:
            if len(numbers) == 1:
                amount = numbers[0]
                return {'from': amount, 'to': amount}
            elif len(numbers) >= 2:
                return {'from': numbers[0], 'to': numbers[-1]}
        
        return {'from': None, 'to': None}
    
    def _deduplicate_and_clean(self, courses: List[Dict]) -> List[Dict]:
        """Remove duplicates and clean course data"""
        seen_names = set()
        unique_courses = []
        
        for course in courses:
            name = course.get('name', '').strip()
            name_key = name.lower()
            
            # Skip empty or very short names
            if len(name) < 3:
                continue
            
            # Skip duplicates
            if name_key in seen_names:
                continue
            
            seen_names.add(name_key)
            unique_courses.append(course)
        
        return unique_courses

def main():
    """Test the direct extractor"""
    extractor = DirectPSGExtractor()
    
    url = 'https://collegedunia.com/college/10810-psg-institute-of-medical-sciences-and-research-psgimsr-coimbatore/courses-fees'
    
    print("🚀 Testing Direct PSG Extractor...")
    print("=" * 60)
    
    result = extractor.extract_all_courses(url)
    
    if result:
        courses = result.get('courses', [])
        print(f"\n✅ Extraction Complete!")
        print(f"College: {result.get('name', 'N/A')}")
        print(f"Total courses: {len(courses)}")
        
        # Group by stream
        streams = {}
        for course in courses:
            stream = course.get('stream', 'Unknown')
            if stream not in streams:
                streams[stream] = []
            streams[stream].append(course)
        
        print(f"\n📊 Courses by Stream:")
        for stream, stream_courses in streams.items():
            print(f"  {stream}: {len(stream_courses)} courses")
        
        # Save result
        with open('direct_psg_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n📁 Result saved to: direct_psg_result.json")
    else:
        print("❌ Extraction failed!")

if __name__ == "__main__":
    main()
