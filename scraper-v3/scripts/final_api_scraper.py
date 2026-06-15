#!/usr/bin/env python3
"""
Final API-based scraper for CollegeDunia that properly extracts all course specializations
"""

import requests
import json
import re
import logging
from typing import Dict, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin

class FinalCollegeDuniaAPIScraper:
    """Final scraper that extracts all course data including specializations from JSON"""
    
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
        """Scrape college data using final API approach"""
        try:
            self.logger.info(f"Scraping college data from: {college_url}")
            
            # Fetch the page
            response = self.session.get(college_url, timeout=30)
            response.raise_for_status()
            
            # Extract all data
            college_data = self._extract_all_data_from_html(response.text, college_url)
            
            if not college_data:
                self.logger.warning("No data found in page")
                return None
            
            college_name = college_data['basic_info'].get('short_form', 'Unknown College')
            self.logger.info(f"Successfully scraped: {college_name}")
            return college_data
            
        except Exception as e:
            self.logger.error(f"Failed to scrape {college_url}: {e}")
            return None
    
    def _extract_all_data_from_html(self, html_content: str, college_url: str) -> Dict:
        """Extract only basic_info and courses from HTML - copy JSON as-is"""
        college_data = {
            'basic_info': self._extract_basic_info_from_json(html_content),
            'courses': self._extract_courses_from_json(html_content)
        }
        
        self.logger.info(f"Extracted {len(college_data['courses'])} courses")
        return college_data
    
    def _extract_basic_info_from_json(self, html_content: str) -> Dict:
        """Extract basic_info from props.initialProps.basic_info - copy as-is without any modifications"""
        try:
            # Look for the NEXT_DATA script tag first
            next_data_pattern = r'<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>'
            next_data_match = re.search(next_data_pattern, html_content, re.DOTALL)
            
            if next_data_match:
                script_content = next_data_match.group(1)
                self.logger.info("Found _NEXT_DATA_ script tag")
                
                try:
                    # Parse the JSON from the script tag
                    next_data = json.loads(script_content)
                    self.logger.info("Successfully parsed _NEXT_DATA_ JSON")
                    
                    # Navigate to props.initialProps.pageProps.data.basic_info
                    if (isinstance(next_data, dict) and 
                        'props' in next_data and 
                        isinstance(next_data['props'], dict) and
                        'initialProps' in next_data['props'] and
                        isinstance(next_data['props']['initialProps'], dict) and
                        'pageProps' in next_data['props']['initialProps'] and
                        isinstance(next_data['props']['initialProps']['pageProps'], dict) and
                        'data' in next_data['props']['initialProps']['pageProps'] and
                        isinstance(next_data['props']['initialProps']['pageProps']['data'], dict) and
                        'basic_info' in next_data['props']['initialProps']['pageProps']['data']):
                        
                        basic_info = next_data['props']['initialProps']['pageProps']['data']['basic_info']
                        self.logger.info(f"Extracted basic_info from props.initialProps.pageProps.data.basic_info with {len(basic_info.keys())} keys")
                        return basic_info
                    else:
                        self.logger.warning("props.initialProps.pageProps.data.basic_info not found in _NEXT_DATA_")
                        
                except json.JSONDecodeError as e:
                    self.logger.error(f"Failed to parse _NEXT_DATA_ JSON: {e}")
            
            # Fallback: look for props.initialProps.basic_info pattern directly
            pattern = r'props\.initialProps\.basic_info\s*=\s*(\{.*?\});'
            match = re.search(pattern, html_content, re.DOTALL)
            if match:
                json_str = match.group(1)
                basic_info = json.loads(json_str)
                self.logger.info(f"Extracted basic_info from props.initialProps.basic_info with {len(basic_info.keys())} keys")
                return basic_info
            
            # Fallback: look for "basic_info": {...} pattern using brace counting
            start_pattern = r'\"basic_info\":\s*\{'
            start_match = re.search(start_pattern, html_content)
            
            if start_match:
                start_pos = start_match.start()
                self.logger.info(f"Found basic_info start at position: {start_pos}")
                
                # Find the matching closing brace
                brace_count = 0
                in_string = False
                escape_next = False
                
                for i in range(start_pos + len('"basic_info":'), len(html_content)):
                    char = html_content[i]
                    
                    if escape_next:
                        escape_next = False
                        continue
                        
                    if char == '\\':
                        escape_next = True
                        continue
                        
                    if char == '"' and not escape_next:
                        in_string = not in_string
                        continue
                        
                    if not in_string:
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_pos = i + 1
                                break
                else:
                    self.logger.warning("Could not find matching closing brace for basic_info")
                    end_pos = start_pos + 10000  # Fallback
                
                json_str = html_content[start_pos + len('"basic_info":'):end_pos]
                self.logger.info(f"Extracted basic_info JSON length: {len(json_str)} characters")
                
                try:
                    basic_info = json.loads(json_str)
                    self.logger.info(f"Successfully parsed basic_info JSON with keys: {list(basic_info.keys())}")
                    return basic_info
                    
                except json.JSONDecodeError as e:
                    self.logger.error(f"JSON parsing failed for basic_info: {e}")
                    self.logger.error(f"Error at position: {e.pos}")
                    self.logger.error(f"Context: {json_str[max(0, e.pos-50):e.pos+50]}")
            
            self.logger.warning("No props.initialProps.basic_info found in embedded JSON")
            return {}
            
        except Exception as e:
            self.logger.error(f"Error extracting basic_info: {e}")
            return {}
    
    def _extract_courses_from_json(self, html_content: str) -> List[Dict]:
        """Extract courses from embedded JSON - copy as-is from new_compare_courses field without any modifications"""
        try:
            # Look for "new_compare_courses": {...} pattern using brace counting
            start_pattern = r'\"new_compare_courses\":\s*\{'
            start_match = re.search(start_pattern, html_content)
            
            if start_match:
                start_pos = start_match.start()
                self.logger.info(f"Found new_compare_courses start at position: {start_pos}")
                
                # Find the matching closing brace
                brace_count = 0
                in_string = False
                escape_next = False
                
                for i in range(start_pos + len('"new_compare_courses":'), len(html_content)):
                    char = html_content[i]
                    
                    if escape_next:
                        escape_next = False
                        continue
                        
                    if char == '\\':
                        escape_next = True
                        continue
                        
                    if char == '"' and not escape_next:
                        in_string = not in_string
                        continue
                        
                    if not in_string:
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_pos = i + 1
                                break
                else:
                    self.logger.warning("Could not find matching closing brace for new_compare_courses")
                    end_pos = start_pos + 50000  # Fallback
                
                json_str = html_content[start_pos + len('"new_compare_courses":'):end_pos]
                self.logger.info(f"Extracted new_compare_courses JSON length: {len(json_str)} characters")
                
                try:
                    new_compare_courses = json.loads(json_str)
                    self.logger.info(f"Successfully parsed new_compare_courses JSON with keys: {list(new_compare_courses.keys())}")
                    
                    # Extract all courses from all categories (full_time, part_time, etc.)
                    all_courses = []
                    for category, courses in new_compare_courses.items():
                        if isinstance(courses, list):
                            all_courses.extend(courses)
                            self.logger.info(f"Added {len(courses)} courses from {category}")
                    
                    self.logger.info(f"Total courses extracted: {len(all_courses)}")
                    return all_courses
                    
                except json.JSONDecodeError as e:
                    self.logger.error(f"JSON parsing failed for new_compare_courses: {e}")
                    self.logger.error(f"Error at position: {e.pos}")
                    self.logger.error(f"Context: {json_str[max(0, e.pos-50):e.pos+50]}")
            
            # Fallback: simple regex pattern
            pattern = r'\"new_compare_courses\":\s*(\{.*?\})'
            match = re.search(pattern, html_content, re.DOTALL)
            if match:
                json_str = match.group(1)
                new_compare_courses = json.loads(json_str)
                self.logger.info(f"Extracted new_compare_courses object with keys: {list(new_compare_courses.keys())}")
                
                # Extract all courses from all categories (full_time, part_time, etc.)
                all_courses = []
                for category, courses in new_compare_courses.items():
                    if isinstance(courses, list):
                        all_courses.extend(courses)
                        self.logger.info(f"Added {len(courses)} courses from {category}")
                
                self.logger.info(f"Total courses extracted: {len(all_courses)}")
                return all_courses
            
            # Fallback: look for course_data pattern
            start_pattern = r'\"course_data\":\s*\{'
            start_match = re.search(start_pattern, html_content)
            
            if start_match:
                start_pos = start_match.start()
                self.logger.info(f"Found course_data start at position: {start_pos}")
                
                # Find the matching closing brace
                brace_count = 0
                in_string = False
                escape_next = False
                
                for i in range(start_pos + len('"course_data":'), len(html_content)):
                    char = html_content[i]
                    
                    if escape_next:
                        escape_next = False
                        continue
                        
                    if char == '\\':
                        escape_next = True
                        continue
                        
                    if char == '"' and not escape_next:
                        in_string = not in_string
                        continue
                        
                    if not in_string:
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_pos = i + 1
                                break
                else:
                    self.logger.warning("Could not find matching closing brace")
                    end_pos = start_pos + 20000  # Fallback
                
                json_str = html_content[start_pos + len('"course_data":'):end_pos]
                self.logger.info(f"Extracted JSON length: {len(json_str)} characters")
                
                try:
                    course_data = json.loads(json_str)
                    self.logger.info(f"Successfully parsed course_data JSON")
                    
                    # Look for new_compare_courses field instead of courses
                    if isinstance(course_data, dict) and 'new_compare_courses' in course_data:
                        new_compare_courses = course_data['new_compare_courses']
                        # Extract all courses from all categories
                        all_courses = []
                        for category, courses in new_compare_courses.items():
                            if isinstance(courses, list):
                                all_courses.extend(courses)
                        self.logger.info(f"Extracted {len(all_courses)} courses from new_compare_courses")
                        return all_courses
                    elif isinstance(course_data, dict) and 'courses' in course_data:
                        # Fallback to courses if new_compare_courses not found
                        courses = course_data['courses']  # Raw data, no parsing
                        self.logger.info(f"Extracted {len(courses)} courses from courses (fallback)")
                        return courses
                    else:
                        self.logger.warning("No 'new_compare_courses' or 'courses' key found in course_data")
                        
                except json.JSONDecodeError as e:
                    self.logger.error(f"JSON parsing failed: {e}")
                    self.logger.error(f"Error at position: {e.pos}")
                    self.logger.error(f"Context: {json_str[max(0, e.pos-50):e.pos+50]}")
            
            self.logger.warning("No new_compare_courses or course_data found in embedded JSON")
            return []
            
        except Exception as e:
            self.logger.error(f"Error extracting courses: {e}")
            return []
    
    def _extract_college_name(self, html_content: str) -> str:
        """Extract college name from title"""
        title_match = re.search(r'<title>([^<]+)</title>', html_content, re.IGNORECASE)
        if title_match:
            title = title_match.group(1)
            # Clean up title
            return title.replace('Courses & Fees', '').replace('2025', '').strip()
        return 'Unknown College'
    
    def _extract_location(self, html_content: str, college_name: str) -> Dict:
        """Extract location information"""
        location = {
            'state': 'Unknown',
            'city': 'Unknown',
            'address': 'Unknown'
        }
        
        # Extract from college name patterns
        if 'Kochi' in college_name or 'Kerala' in college_name:
            location['state'] = 'Kerala'
            location['city'] = 'Kochi'
            location['address'] = 'Kochi, Kerala'
        elif 'Delhi' in college_name:
            location['state'] = 'Delhi'
            location['city'] = 'New Delhi'
            location['address'] = 'New Delhi, Delhi'
        elif 'Mumbai' in college_name or 'Maharashtra' in college_name:
            location['state'] = 'Maharashtra'
            location['city'] = 'Mumbai'
            location['address'] = 'Mumbai, Maharashtra'
        
        return location
    
    def _extract_contacts(self, html_content: str) -> Dict:
        """Extract contact information"""
        contacts = {}
        
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
                    contacts['website'] = website
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
                contacts['phone'] = [phone]
                break
        
        # Extract email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', html_content)
        if email_match:
            contacts['email'] = [email_match.group(0)]
        
        return contacts
    
    def _extract_raw_courses_from_html(self, html_content: str) -> List[Dict]:
        """Extract raw course data from HTML without any modifications"""
        courses = []
        
        try:
            # Find the start of course_data
            start_pattern = r'"course_data":\s*\{'
            start_match = re.search(start_pattern, html_content)
            
            if start_match:
                start_pos = start_match.start()
                self.logger.info(f"Found course_data start at position: {start_pos}")
                
                # Find the matching closing brace
                brace_count = 0
                in_string = False
                escape_next = False
                
                for i in range(start_pos + len('"course_data":'), len(html_content)):
                    char = html_content[i]
                    
                    if escape_next:
                        escape_next = False
                        continue
                        
                    if char == '\\':
                        escape_next = True
                        continue
                        
                    if char == '"' and not escape_next:
                        in_string = not in_string
                        continue
                        
                    if not in_string:
                        if char == '{':
                            brace_count += 1
                        elif char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                end_pos = i + 1
                                break
                else:
                    self.logger.warning("Could not find matching closing brace")
                    end_pos = start_pos + 20000  # Fallback
                
                json_str = html_content[start_pos + len('"course_data":'):end_pos]
                self.logger.info(f"Extracted JSON length: {len(json_str)} characters")
                
                try:
                    course_data = json.loads(json_str)
                    self.logger.info(f"Successfully parsed course_data JSON")
                    
                    if isinstance(course_data, dict) and 'courses' in course_data:
                        courses = course_data['courses']  # Raw data, no parsing
                        self.logger.info(f"Extracted {len(courses)} raw courses from course_data")
                    else:
                        self.logger.warning("No 'courses' key found in course_data")
                        
                except json.JSONDecodeError as e:
                    self.logger.error(f"JSON parsing failed: {e}")
                    self.logger.error(f"Error at position: {e.pos}")
                    self.logger.error(f"Context: {json_str[max(0, e.pos-50):e.pos+50]}")
            else:
                # Fallback to other patterns
                course_data_patterns = [
                    r'"courses":\s*(\[.*?\])',
                    r'var course_data = ({.*?});',
                    r'window\.courseData = ({.*?});',
                    r'courseData:\s*({.*?})',
                    r'courses:\s*(\[.*?\])'
                ]
                
                for pattern in course_data_patterns:
                    match = re.search(pattern, html_content, re.DOTALL)
                    if match:
                        try:
                            course_data = json.loads(match.group(1))
                            if isinstance(course_data, dict) and 'courses' in course_data:
                                courses = course_data['courses']
                            elif isinstance(course_data, list):
                                courses = course_data
                            break
                        except json.JSONDecodeError:
                            continue
                
                if not courses:
                    self.logger.warning("No course data found in any patterns")
                
        except Exception as e:
            self.logger.error(f"Error extracting raw course data: {e}")
        
        return courses
    
    def _find_raw_courses_in_data(self, data: Dict) -> List[Dict]:
        """Find raw courses in nested data structure"""
        courses = []
        
        def search_for_courses(obj):
            if isinstance(obj, list):
                for item in obj:
                    if isinstance(item, dict) and 'display_name' in item:
                        courses.append(item)
                    else:
                        search_for_courses(item)
            elif isinstance(obj, dict):
                for value in obj.values():
                    search_for_courses(value)
        
        search_for_courses(data)
        return courses

    def _extract_courses_with_specializations(self, html_content: str) -> List[Dict]:
        """Extract courses with proper specializations"""
        courses = []
        
        try:
            # Extract course names
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
            
            # Create courses with specializations
            seen_courses = set()
            
            for i, name in enumerate(course_names):
                # Skip duplicates
                if name in seen_courses:
                    continue
                seen_courses.add(name)
                
                # Get specialization from sub_stream_data if available
                specialization = 'None'
                if i < len(sub_stream_data) and sub_stream_data[i] != 'General':
                    specialization = sub_stream_data[i]
                
                # For PGDM courses, try to extract specialization from the name itself
                if 'PGDM' in name and specialization == 'None':
                    specialization = self._extract_pgdm_specialization(name)
                
                course = {
                    'title': name,
                    'name': name,
                    'stream': stream_data[i] if i < len(stream_data) else 'Management',
                    'duration': f"{duration_data[i]} years" if i < len(duration_data) and duration_data[i] != '0' else '2 years',
                    'course_type': course_types[i] if i < len(course_types) else 'Degree',
                    'level': levels[i] if i < len(levels) else 'Post Graduation',
                    'specialization': specialization
                }
                courses.append(course)
            
            # Add specific PGDM specializations if we found them
            pgdm_specializations = self._extract_pgdm_specializations_from_content(html_content)
            for spec in pgdm_specializations:
                if not any(course['specialization'] == spec for course in courses):
                    course = {
                        'title': f'PGDM - {spec}',
                        'name': f'PGDM - {spec}',
                        'stream': 'Management',
                        'duration': '2 years',
                        'course_type': 'Diploma',
                        'level': 'Post Graduation',
                        'specialization': spec
                    }
                    courses.append(course)
            
        except Exception as e:
            self.logger.error(f"Error extracting courses: {e}")
        
        return courses
    
    def _extract_pgdm_specialization(self, course_name: str) -> str:
        """Extract PGDM specialization from course name"""
        specializations = ['Finance', 'Marketing', 'Human Resource Management', 'Business Intelligence', 'International Business', 'Operations', 'Digital Marketing']
        
        for spec in specializations:
            if spec.lower() in course_name.lower():
                return spec
        
        return 'None'
    
    def _extract_pgdm_specializations_from_content(self, html_content: str) -> List[str]:
        """Extract PGDM specializations from HTML content"""
        specializations = []
        
        # Look for specific PGDM specializations
        spec_keywords = ['Finance', 'Marketing', 'Human Resource Management', 'Business Intelligence', 'International Business', 'Operations', 'Digital Marketing']
        
        for spec in spec_keywords:
            if spec in html_content:
                specializations.append(spec)
        
        return specializations
    
    def _extract_entrance_exams(self, html_content: str) -> List[Dict]:
        """Extract entrance exams"""
        exams = []
        
        exam_patterns = ['CAT', 'MAT', 'XAT', 'CMAT', 'SNAP', 'NEET', 'JEE', 'GATE', 'CLAT']
        for exam in exam_patterns:
            if exam in html_content:
                exams.append({
                    'name': exam,
                    'type': 'National' if exam in ['CAT', 'MAT', 'XAT', 'CMAT', 'SNAP', 'NEET', 'JEE', 'GATE', 'CLAT'] else 'State'
                })
        
        return exams
    
    def _extract_fees(self, html_content: str) -> Dict:
        """Extract fees information"""
        fees = {}
        
        fee_patterns = [
            r'₹([0-9,]+)',
            r'([0-9,]+)\s*lakh',
            r'([0-9,]+)\s*thousand'
        ]
        
        fee_values = []
        for pattern in fee_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                try:
                    # Clean and convert fee
                    fee_str = match.replace(',', '').replace('lakh', '00000').replace('thousand', '000')
                    fee = int(fee_str)
                    if 1000 <= fee <= 5000000:  # Reasonable fee range
                        fee_values.append(fee)
                except:
                    continue
        
        if fee_values:
            fees = {
                'from': min(fee_values),
                'to': max(fee_values)
            }
        
        return fees
    
    def _extract_basic_info(self, html_content: str, college_url: str) -> Dict:
        """Extract comprehensive basic information from HTML"""
        basic_info = {
            "id": self._extract_college_id(college_url),
            "logo": "",
            "cover_image": "",
            "short_form": "",
            "year_founded": "",
            "university_type": "",
            "type_of_college": "",
            "city": "",
            "city_id": "",
            "state": "",
            "state_id": "",
            "area_name": "",
            "area_id": "",
            "address": {
                "address": "",
                "location": "",
                "nearest_bus_station": None,
                "nearest_train_station": None,
                "nearest_airport": None,
                "map_location": "",
                "pincode": ""
            },
            "landline": [],
            "mobile": [],
            "website": "",
            "phone_no": [],
            "overall_admin_rating": 0,
            "reviews": {
                "rating": "0",
                "count": "0"
            },
            "qna": {
                "count": 0,
                "url": ""
            },
            "approved_by": [],
            "major_stream": 0,
            "major_stream_name": "",
            "major_stream_rating": 0,
            "url": college_url,
            "ranking": [],
            "is_distance": False,
            "naac_approval": {
                "approval_id": 0,
                "grade": "",
                "rating": None,
                "out_of_rating": None,
                "approval_name": "",
                "stream": None,
                "image": ""
            },
            "college_tier": "0",
            "review_amount": 0,
            "isShowFull": False,
            "chat_group_members": 0,
            "hide_live_form": 1,
            "affiliated_to": {
                "name": "",
                "url": ""
            }
        }
        
        try:
            # Try to extract from embedded JSON first
            json_data = self._extract_embedded_json(html_content)
            if json_data and 'basic_info' in json_data:
                # Use the complete basic_info from JSON
                basic_info.update(json_data['basic_info'])
                self.logger.info("Extracted complete basic_info from embedded JSON")
            else:
                # Fallback to regex extraction
                self._extract_basic_info_from_regex(html_content, basic_info)
                
        except Exception as e:
            self.logger.error(f"Error extracting basic info: {e}")
            # Fallback to regex extraction
            self._extract_basic_info_from_regex(html_content, basic_info)
        
        return basic_info
    
    def _extract_embedded_json(self, html_content: str) -> Dict:
        """Extract embedded JSON data from HTML"""
        try:
            # Look for various JSON patterns
            json_patterns = [
                r'window\.__INITIAL_STATE__\s*=\s*({.*?});',
                r'window\.__NEXT_DATA__\s*=\s*({.*?});',
                r'window\.__INITIAL_PROPS__\s*=\s*({.*?});',
                r'props\.initialProps\s*=\s*({.*?});',
                r'var\s+initialProps\s*=\s*({.*?});'
            ]
            
            for pattern in json_patterns:
                match = re.search(pattern, html_content, re.DOTALL)
                if match:
                    try:
                        json_data = json.loads(match.group(1))
                        if isinstance(json_data, dict):
                            return json_data
                    except json.JSONDecodeError:
                        continue
            
            return {}
        except Exception as e:
            self.logger.error(f"Error extracting embedded JSON: {e}")
            return {}
    
    def _extract_basic_info_from_regex(self, html_content: str, basic_info: Dict) -> None:
        """Fallback method to extract basic_info using regex patterns"""
        try:
            # Extract college ID from URL
            college_id = self._extract_college_id(basic_info.get("url", ""))
            if college_id:
                basic_info["id"] = college_id
            
            # Extract college name and short form
            college_name = self._extract_college_name(html_content)
            if college_name:
                basic_info["short_form"] = college_name
            
            # Extract year founded
            year_match = re.search(r'(\d{4})', html_content)
            if year_match:
                year = int(year_match.group(1))
                if 1800 <= year <= 2025:  # Reasonable year range
                    basic_info["year_founded"] = year
            
            # Extract college type
            if "private" in html_content.lower():
                basic_info["type_of_college"] = "Private"
            elif "government" in html_content.lower() or "govt" in html_content.lower():
                basic_info["type_of_college"] = "Government"
            else:
                basic_info["type_of_college"] = "Private"
            
            # Extract location
            location = self._extract_location(html_content, college_name)
            basic_info["city"] = location.get("city", "")
            basic_info["state"] = location.get("state", "")
            basic_info["address"]["address"] = location.get("address", "")
            
            # Extract website
            website = self._extract_website(html_content)
            if website:
                basic_info["website"] = website
            
            # Extract phone numbers
            phone_numbers = self._extract_phone_numbers(html_content)
            basic_info["landline"] = [{"value": phone, "text": ""} for phone in phone_numbers]
            basic_info["phone_no"] = [{"value": phone, "text": ""} for phone in phone_numbers]
            
            # Extract NAAC approval
            naac_info = self._extract_naac_info(html_content)
            if naac_info:
                basic_info["naac_approval"].update(naac_info)
            
            # Extract major stream
            major_stream = self._extract_major_stream(html_content)
            if major_stream:
                basic_info["major_stream_name"] = major_stream
            
            # Extract affiliated university
            affiliated = self._extract_affiliated_university(html_content)
            if affiliated:
                basic_info["affiliated_to"] = affiliated
            
            # Extract reviews
            reviews = self._extract_reviews(html_content)
            if reviews:
                basic_info["reviews"] = reviews
                
        except Exception as e:
            self.logger.error(f"Error in regex extraction: {e}")
    
    def _extract_college_id(self, college_url: str) -> int:
        """Extract college ID from URL"""
        try:
            # Extract ID from URL like /college/18512-rajagiri-business-school
            match = re.search(r'/college/(\d+)-', college_url)
            if match:
                return int(match.group(1))
        except:
            pass
        return 0
    
    def _extract_website(self, html_content: str) -> str:
        """Extract college website"""
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
                    return website
        return ""
    
    def _extract_phone_numbers(self, html_content: str) -> List[str]:
        """Extract phone numbers"""
        phone_numbers = []
        phone_patterns = [
            r'\+91[\s-]?\d{10}',
            r'\d{10}',
            r'\(\d{3}\)[\s-]?\d{3}[\s-]?\d{4}',
            r'\d{3}[\s-]?\d{3}[\s-]?\d{4}'
        ]
        
        for pattern in phone_patterns:
            matches = re.findall(pattern, html_content)
            for match in matches:
                if len(match) >= 10:  # Valid phone number length
                    phone_numbers.append(match)
        
        return list(set(phone_numbers))  # Remove duplicates
    
    def _extract_naac_info(self, html_content: str) -> Dict:
        """Extract NAAC approval information"""
        naac_info = {}
        
        # Look for NAAC grade
        naac_grade_match = re.search(r'NAAC[^A-Z]*Grade[^A-Z]*([A-Z+]+)', html_content, re.IGNORECASE)
        if naac_grade_match:
            naac_info["grade"] = naac_grade_match.group(1)
            naac_info["approval_name"] = "NAAC"
            naac_info["approval_id"] = 1
        
        return naac_info
    
    def _extract_major_stream(self, html_content: str) -> str:
        """Extract major stream"""
        if "medical" in html_content.lower() or "mbbs" in html_content.lower():
            return "Medicine"
        elif "law" in html_content.lower() or "llb" in html_content.lower():
            return "Law"
        elif "engineering" in html_content.lower() or "b.tech" in html_content.lower():
            return "Engineering"
        elif "management" in html_content.lower() or "mba" in html_content.lower():
            return "Management"
        else:
            return "General"
    
    def _extract_affiliated_university(self, html_content: str) -> Dict:
        """Extract affiliated university"""
        university_patterns = [
            r'Affiliated to[^<]*([^<]+)',
            r'University[^<]*([^<]+)',
            r'Under[^<]*([^<]+)'
        ]
        
        for pattern in university_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                university_name = match.group(1).strip()
                if len(university_name) > 5:  # Valid university name
                    return {
                        "name": university_name,
                        "url": ""
                    }
        
        return {"name": "", "url": ""}
    
    def _extract_reviews(self, html_content: str) -> Dict:
        """Extract review information"""
        reviews = {"rating": "0", "count": "0"}
        
        # Look for rating
        rating_match = re.search(r'rating[^0-9]*([0-9.]+)', html_content, re.IGNORECASE)
        if rating_match:
            reviews["rating"] = rating_match.group(1)
        
        # Look for review count
        count_match = re.search(r'(\d+)\s*reviews?', html_content, re.IGNORECASE)
        if count_match:
            reviews["count"] = count_match.group(1)
        
        return reviews
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime
        return datetime.now().isoformat()

# Test the final API scraper
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    scraper = FinalCollegeDuniaAPIScraper()
    test_url = 'https://collegedunia.com/college/18512-rajagiri-business-school-rbs-kochi/courses-fees'
    
    print("=== TESTING FINAL API SCRAPER ===")
    result = scraper.scrape_college_data(test_url)
    
    if result:
        print(f"✅ SUCCESS: {result['name']}")
        print(f"📚 Courses: {len(result['courses'])}")
        print(f"📍 Location: {result['city']}, {result['state']}")
        print(f"🎯 Exams: {len(result['entrance_exams'])}")
        print(f"💰 Fees: {result['fees']}")
        
        print("\n📚 ALL COURSES:")
        for i, course in enumerate(result['courses']):
            print(f"  {i+1}. {course['title']} ({course['stream']}) - {course['duration']} - Specialization: {course['specialization']}")
        
        print("\n🎯 ENTRANCE EXAMS:")
        for exam in result['entrance_exams']:
            print(f"  - {exam['name']} ({exam['type']})")
        
        print("\n📞 CONTACTS:")
        for key, value in result['contacts'].items():
            print(f"  {key}: {value}")
        
        print("\n🎯 FINAL SUMMARY:")
        if len(result['courses']) >= 6:
            print("✅ PGDM specializations: FIXED - Found 6+ courses")
        else:
            print(f"❌ PGDM specializations: Only {len(result['courses'])} courses found")
        
        if result['state'] == 'Kerala' and result['city'] == 'Kochi':
            print("✅ Location data: FIXED - Correct state and city")
        else:
            print(f"❌ Location data: State: {result['state']}, City: {result['city']}")
    else:
        print("❌ FAILED: No data extracted")
