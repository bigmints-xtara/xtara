"""
Course parser for extracting and processing course information from CollegeDunia
"""
import re
from bs4 import BeautifulSoup
from typing import Dict, List
import logging

class CourseParser:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Course type mappings
        self.course_type_map = {
            'b.': 'Undergraduate',
            'bachelor': 'Undergraduate',
            'm.': 'Postgraduate',
            'master': 'Postgraduate',
            'phd': 'Doctorate',
            'diploma': 'Diploma',
            'certificate': 'Certificate'
        }
        
        # Stream mappings
        self.stream_map = {
            'engineering': 'Engineering',
            'medicine': 'Medical',
            'arts': 'Arts',
            'science': 'Science',
            'commerce': 'Commerce',
            'management': 'Management',
            'law': 'Law',
            'education': 'Education',
            'pharmacy': 'Pharmacy',
            'agriculture': 'Agriculture',
            'architecture': 'Architecture',
            'design': 'Design'
        }
    
    def parse_courses(self, soup: BeautifulSoup, base_url: str = None) -> List[Dict]:
        """Parse courses from the courses-fees page"""
        courses = []
        
        # Store base URL for constructing absolute URLs
        self.base_url = base_url
        
        # Find course sections/tables
        course_sections = self._find_course_sections(soup)
        
        for section in course_sections:
            parsed_courses = self._parse_course_section(section)
            courses.extend(parsed_courses)
        
        # Remove duplicates
        courses = self._remove_duplicate_courses(courses)
        
        self.logger.info(f"Parsed {len(courses)} unique courses")
        return courses
    
    def _find_course_sections(self, soup: BeautifulSoup) -> List:
        """Find sections containing course information"""
        sections = []
        
        # Look for tables with course information
        course_tables = soup.find_all('table', class_=re.compile(r'course|fee'))
        sections.extend(course_tables)
        
        # Look for div sections with course listings
        course_divs = soup.find_all('div', class_=re.compile(r'course|program|fee'))
        sections.extend(course_divs)
        
        # Look for sections with course-related headers
        headers = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5'], 
                                text=re.compile(r'course|program|fee', re.IGNORECASE))
        for header in headers:
            # Get the next sibling elements that might contain course data
            next_elements = header.find_next_siblings(['div', 'table', 'ul', 'ol'])
            sections.extend(next_elements[:3])  # Limit to next 3 elements
        
        return sections
    
    def _parse_course_section(self, section) -> List[Dict]:
        """Parse courses from a specific section"""
        courses = []
        
        if section.name == 'table':
            courses = self._parse_course_table(section)
        else:
            courses = self._parse_course_list(section)
        
        return courses
    
    def _parse_course_table(self, table) -> List[Dict]:
        """Parse courses from a table format"""
        courses = []
        rows = table.find_all('tr')
        
        # Parse all rows (including first row which might have course data)
        for row in rows:
            cells = row.find_all(['td', 'th'])
            if len(cells) >= 1:
                first_cell_text = cells[0].get_text(strip=True)
                
                # Check if this is a specialization group (e.g., "M.D4Courses")
                if self._is_specialization_group(first_cell_text):
                    # Extract specializations from this group
                    specializations = self._extract_specializations_from_group(row, table)
                    courses.extend(specializations)
                # Check if this looks like a regular course name
                elif self._is_course_name(first_cell_text):
                    course_list = self._extract_course_from_row(cells, [])
                    if course_list:
                        courses.extend(course_list)
        
        return courses
    
    def _parse_course_list(self, section) -> List[Dict]:
        """Parse courses from a list/div format"""
        courses = []
        
        # Look for course titles in various formats
        course_elements = []
        
        # Method 1: Look for elements with course-like text
        text_elements = section.find_all(['p', 'div', 'li', 'span'], 
                                       text=re.compile(r'\b(B\.|M\.|Bachelor|Master|Diploma|Certificate)\b', re.IGNORECASE))
        course_elements.extend(text_elements)
        
        # Method 2: Look for elements containing common course patterns
        pattern_elements = section.find_all(['p', 'div', 'li'], 
                                          text=re.compile(r'\[B\.\w+\]|\[M\.\w+\]', re.IGNORECASE))
        course_elements.extend(pattern_elements)
        
        for element in course_elements:
            course_text = element.get_text(strip=True)
            course_data = self._parse_course_text(course_text)
            if course_data:
                courses.append(course_data)
        
        return courses
    
    def _extract_course_from_row(self, cells, headers: List[str]) -> List[Dict]:
        """Extract course information from a table row"""
        if not cells:
            return []
        
        # Get course title from first cell
        course_title = cells[0].get_text(strip=True)
        if not course_title or len(course_title) < 3:
            return []
        
        course_data = self._parse_course_text(course_title)
        if not course_data:
            return []
        
        # Handle both single course and list of courses (specializations)
        if isinstance(course_data, list):
            courses = course_data
        else:
            courses = [course_data]
        
        # Extract additional information from other cells and apply to all courses
        for i, cell in enumerate(cells[1:], 1):
            cell_text = cell.get_text(strip=True)
            
            # Look for fees in any cell (₹ symbol or "Lakhs")
            if ('₹' in cell_text or 'lakh' in cell_text.lower()) and cell_text:
                fees = self._extract_fees(cell_text)
                if fees:
                    for course in courses:
                        course['fees'] = fees
            
            # Look for eligibility/entrance exams
            elif any(exam in cell_text.upper() for exam in ['CLAT', 'JEE', 'NEET', 'CAT', 'MAT', '+2', '10+2']) and cell_text:
                for course in courses:
                    course['entrance_exams'] = cell_text
            
            # Look for duration patterns
            elif any(duration in cell_text for duration in ['year', 'Year', 'semester', 'Semester']) and cell_text:
                for course in courses:
                    course['duration'] = cell_text
        
        return courses
    
    def _parse_course_text(self, course_text: str) -> Dict:
        """Parse course information from text"""
        if not course_text or len(course_text.strip()) < 3:
            return None
        
        # Handle specializations - key requirement from the prompt
        specializations = self._extract_specializations(course_text)
        
        if specializations:
            # If specializations found, create individual courses
            base_course = self._parse_base_course(course_text)
            courses = []
            
            for spec in specializations:
                course = base_course.copy()
                course['specialization'] = spec
                course['title'] = f"{course['name']} - {spec}"
                courses.append(course)
            
            return courses  # Return list for specializations
        else:
            # Single course without specializations
            return self._parse_base_course(course_text)
    
    def _extract_specializations(self, course_text: str) -> List[str]:
        """Extract specializations from course text"""
        specializations = []
        
        # Pattern 1: Text in parentheses after course name
        paren_pattern = r'\((.*?)\)'
        paren_matches = re.findall(paren_pattern, course_text)
        
        for match in paren_matches:
            if ',' in match or ' and ' in match.lower() or ' & ' in match:
                # Multiple specializations
                specs = re.split(r',|\band\b|\&', match)
                specializations.extend([s.strip() for s in specs if s.strip()])
            elif len(match.strip()) > 2:
                specializations.append(match.strip())
        
        # Pattern 2: Specializations listed after dash or colon
        dash_pattern = r'(?:[-:])\s*(.+)'
        dash_match = re.search(dash_pattern, course_text)
        if dash_match:
            spec_text = dash_match.group(1)
            if ',' in spec_text:
                specs = [s.strip() for s in spec_text.split(',')]
                specializations.extend(specs)
            else:
                specializations.append(spec_text.strip())
        
        # Clean up and validate specializations
        cleaned_specs = []
        for spec in specializations:
            spec = spec.strip()
            if len(spec) > 2 and spec.lower() not in ['etc', 'others', 'various']:
                cleaned_specs.append(spec)
        
        return cleaned_specs
    
    def _parse_base_course(self, course_text: str) -> Dict:
        """Parse basic course information"""
        course_data = {
            "title": course_text.strip(),
            "group": "",
            "name": "",
            "specialization": "",
            "stream": "",
            "type": "",
            "duration": "",
            "fees": {
                "from": "",
                "to": ""
            },
            "entrance_exams": "",
            "seats": ""
        }
        
        # Extract course name and determine type
        course_data['name'] = self._extract_course_name(course_text)
        course_data['type'] = self._determine_course_type(course_text)
        course_data['stream'] = self._determine_stream(course_text)
        course_data['group'] = self._determine_group(course_data['type'])
        
        # Extract duration if present
        duration_match = re.search(r'(\d+)\s*(?:year|yr)s?', course_text, re.IGNORECASE)
        if duration_match:
            course_data['duration'] = f"{duration_match.group(1)} years"
        
        # Special handling for law courses
        if 'llb' in course_text.lower() or 'law' in course_text.lower():
            course_data['stream'] = 'Law'
            # BBA LLB and BA LLB are typically 5-year courses
            if any(prefix in course_text.upper() for prefix in ['BBALLB', 'BA LLB', 'BBA LLB']):
                course_data['duration'] = '5 years'
        
        return course_data
    
    def _is_specialization_group(self, text: str) -> bool:
        """Check if text indicates a specialization group (e.g., 'M.D4Courses', 'PGDM6Courses')"""
        text_upper = text.upper()
        
        # Look for patterns like "M.D4Courses", "B.Tech3Courses", "PGDM6Courses", etc.
        specialization_patterns = [
            r'[A-Z]+\.?[A-Z]*\d+COURSES',
            r'[A-Z]+\.?[A-Z]*\s*\d+\s*COURSES',
            r'[A-Z]+\.?[A-Z]*\s*COURSES',
            r'PGDM\d+COURSES?',
            r'PGD\d+COURSES?',
            r'MBA\d+COURSES?',
            r'MCA\d+COURSES?',
            # Add specific patterns for Rajagiri Business School
            r'\(170VIEWS\)PGDM6COURSES',
            r'\(47VIEWS\)FELLOWSHIP',
            r'PGDM6COURSES',
            r'FELLOWSHIP'
        ]
        
        for pattern in specialization_patterns:
            if re.search(pattern, text_upper):
                return True
        
        return False
    
    def _extract_specializations_from_group(self, group_row, table) -> List[Dict]:
        """Extract specializations from a specialization group"""
        specializations = []
        
        # Get the base course name (e.g., "M.D" from "M.D4Courses")
        group_text = group_row.find_all(['td', 'th'])[0].get_text(strip=True)
        base_course = self._extract_base_course_name(group_text)
        
        if not base_course:
            return specializations
        
        # Look for the specialization URL in the group row
        specialization_url = self._find_specialization_url(group_row)
        
        if specialization_url:
            # Make sure base_url is available
            if not hasattr(self, 'base_url') or not self.base_url:
                self.base_url = 'https://collegedunia.com'
            
            # Fetch the specializations from the URL
            specializations = self._fetch_specializations_from_url(specialization_url, base_course)
        
        return specializations
    
    def _extract_base_course_name(self, group_text: str) -> str:
        """Extract base course name from group text (e.g., 'M.D' from 'M.D4Courses')"""
        # Remove numbers and "courses" text
        cleaned = re.sub(r'\d+COURSES?', '', group_text, flags=re.IGNORECASE).strip()
        
        # Common base course patterns
        base_courses = ['M.D', 'M.S', 'B.Tech', 'B.E', 'M.Tech', 'M.E', 'MBA', 'MCA', 'PGDM', 'PGD']
        
        for course in base_courses:
            if course.upper() in cleaned.upper():
                return course
        
        return cleaned
    
    def _find_specialization_url(self, group_row) -> str:
        """Find the URL to fetch specializations from"""
        # Look for links in the group row
        links = group_row.find_all('a')
        
        for link in links:
            href = link.get('href', '')
            if href and ('course' in href.lower() or 'specialization' in href.lower()):
                return href
        
        return None
    
    def _fetch_specializations_from_url(self, url: str, base_course: str) -> List[Dict]:
        """Fetch specializations from a specific URL"""
        import requests
        from bs4 import BeautifulSoup
        
        specializations = []
        
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            # Make URL absolute if needed
            if url.startswith('/'):
                if self.base_url:
                    # Extract base domain from base_url
                    from urllib.parse import urlparse
                    parsed_base = urlparse(self.base_url)
                    base_domain = f"{parsed_base.scheme}://{parsed_base.netloc}"
                    url = f"{base_domain}{url}"
                else:
                    url = f"https://collegedunia.com{url}"
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for specialization table
            tables = soup.find_all('table')
            
            for table in tables:
                rows = table.find_all('tr')
                
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 1:
                        first_cell_text = cells[0].get_text(strip=True)
                        
                        # Check if this looks like a specialization name
                        if self._is_specialization_name(first_cell_text, base_course):
                            specialization_data = self._create_specialization_course(
                                first_cell_text, base_course, cells
                            )
                            if specialization_data:
                                specializations.append(specialization_data)
            
        except Exception as e:
            self.logger.warning(f"Failed to fetch specializations from {url}: {e}")
        
        return specializations
    
    def _is_specialization_name(self, text: str, base_course: str) -> bool:
        """Check if text looks like a specialization name"""
        # Skip header rows
        if text.upper() in ['COURSE', 'COURSES', 'EVENTS', 'RANKING AGENCY']:
            return False
        
        # Skip empty or very short text
        if len(text.strip()) < 3:
            return False
        
        # Skip if it's the base course name itself
        if base_course.upper() in text.upper() and len(text.strip()) <= len(base_course) + 5:
            return False
        
        # Clean the text by removing common suffixes
        cleaned_text = re.sub(r'\s*(Compare|View|Details|More)\s*$', '', text, flags=re.IGNORECASE).strip()
        
        # Look for common specialization patterns
        specialization_indicators = [
            'medicine', 'surgery', 'pathology', 'microbiology', 'forensic',
            'community', 'pediatrics', 'gynecology', 'orthopedics', 'cardiology',
            'neurology', 'dermatology', 'psychiatry', 'radiology', 'anesthesia'
        ]
        
        cleaned_text_lower = cleaned_text.lower()
        return any(indicator in cleaned_text_lower for indicator in specialization_indicators)
    
    def _create_specialization_course(self, specialization_name: str, base_course: str, cells) -> Dict:
        """Create a course data structure for a specialization"""
        # Clean the specialization name
        cleaned_specialization = re.sub(r'\s*(Compare|View|Details|More)\s*$', '', specialization_name, flags=re.IGNORECASE).strip()
        
        course_data = {
            "title": f"{base_course} in {cleaned_specialization}",
            "group": base_course,
            "name": f"{base_course} in {cleaned_specialization}",
            "specialization": cleaned_specialization,
            "stream": self._determine_stream_from_specialization(cleaned_specialization),
            "type": self._determine_course_type(base_course),
            "duration": self._extract_duration_from_cells(cells),
            "fees": self._extract_fees_from_cells(cells),
            "entrance_exams": self._extract_entrance_exams_from_cells(cells),
            "seats": ""
        }
        
        return course_data
    
    def _determine_stream_from_specialization(self, specialization: str) -> str:
        """Determine stream based on specialization name"""
        specialization_lower = specialization.lower()
        
        if any(term in specialization_lower for term in ['medicine', 'surgery', 'pathology', 'microbiology', 'forensic', 'community']):
            return 'Medical'
        elif any(term in specialization_lower for term in ['engineering', 'technology', 'computer', 'mechanical', 'civil', 'electrical']):
            return 'Engineering'
        elif any(term in specialization_lower for term in ['management', 'business', 'administration']):
            return 'Management'
        else:
            return 'Medical'  # Default for medical specializations
    
    def _extract_duration_from_cells(self, cells) -> str:
        """Extract duration from table cells"""
        for cell in cells:
            text = cell.get_text(strip=True)
            duration_match = re.search(r'(\d+)\s*(?:year|yr)s?', text, re.IGNORECASE)
            if duration_match:
                return f"{duration_match.group(1)} years"
        return ""
    
    def _extract_fees_from_cells(self, cells) -> Dict:
        """Extract fees from table cells"""
        fees = {"from": "", "to": ""}
        
        for cell in cells:
            text = cell.get_text(strip=True)
            # Look for fee patterns like "₹1,64,410" or "₹4.56 Lakhs"
            fee_match = re.search(r'₹([\d,]+(?:\.\d+)?\s*(?:Lakhs?|K|Thousand)?)', text, re.IGNORECASE)
            if fee_match:
                fee_value = fee_match.group(1)
                # Clean up the fee value - remove extra digits and normalize
                fee_value = re.sub(r'\s+', ' ', fee_value).strip()
                # Remove any trailing digits that might be concatenated
                fee_value = re.sub(r'(\d+)\1+$', r'\1', fee_value)
                fees["from"] = fee_value
                break
        
        return fees
    
    def _extract_entrance_exams_from_cells(self, cells) -> str:
        """Extract entrance exams from table cells"""
        for cell in cells:
            text = cell.get_text(strip=True)
            # Look for common entrance exam patterns
            exam_patterns = ['NEET', 'JEE', 'GATE', 'CAT', 'MAT', 'XAT', 'CMAT']
            for pattern in exam_patterns:
                if pattern in text.upper():
                    return pattern
        return ""

    def _is_course_name(self, text: str) -> bool:
        """Check if text looks like a course name"""
        text_upper = text.upper()
        
        # Skip if too long to be a course name
        if len(text) > 100:
            return False
        
        # Skip FAQ text and non-course content
        skip_patterns = [
            'QUES.', 'QUESTION', 'WHAT IS', 'HOW TO', 'ELIGIBILITY',
            'FEES AT', 'COST OF', 'PRICE OF', 'ADMISSION',
            'COURSES OFFERED AT', 'PROGRAMS AT', 'DEGREES AT',
            'FACULTY', 'DEPARTMENT', 'SCHOOL OF', 'COLLEGE OF',
            'UNIVERSITY OF', 'INSTITUTE OF', 'CAMPUS', 'LOCATION',
            'ADDRESS', 'CONTACT', 'PHONE', 'EMAIL', 'WEBSITE',
            'APPLICATION', 'FORM', 'PROCESS', 'PROCEDURE',
            'REQUIREMENTS', 'CRITERIA', 'CUTOFF', 'RANKING',
            'PLACEMENT', 'SALARY', 'JOB', 'CAREER', 'FUTURE',
            'SCOPE', 'OPPORTUNITIES', 'PROSPECTS', 'GROWTH'
        ]
        
        # Check if text contains skip patterns
        if any(pattern in text_upper for pattern in skip_patterns):
            return False
        
        # Common course patterns
        course_indicators = [
            'B.', 'M.', 'PHD', 'DIPLOMA', 'CERTIFICATE',
            'BACHELOR', 'MASTER', 'BTECH', 'BE', 'BA', 'BSC', 'BCOM',
            'MTECH', 'ME', 'MA', 'MSC', 'MCOM', 'MBA', 'MCA',
            'LLB', 'BBA', 'BBALLB', 'BALLB', 'MBBS', 'BDS', 'MD', 'MS',
            'PGDM', 'PGD', 'FELLOWSHIP', 'EXECUTIVE'
        ]
        
        return any(indicator in text_upper for indicator in course_indicators)
    
    def _extract_course_name(self, course_text: str) -> str:
        """Extract the full course name"""
        # Handle specific course patterns
        text_upper = course_text.upper()
        
        # Map common abbreviations to full names
        course_name_map = {
            'BBALLB': 'Bachelor of Business Administration + Bachelor of Laws',
            'BA LLB': 'Bachelor of Arts + Bachelor of Laws', 
            'BBA LLB': 'Bachelor of Business Administration + Bachelor of Laws',
            'BALLB': 'Bachelor of Arts + Bachelor of Laws',
            'LLB': 'Bachelor of Laws',
            'MBBS': 'Bachelor of Medicine and Bachelor of Surgery',
            'BDS': 'Bachelor of Dental Surgery',
            'B.TECH': 'Bachelor of Technology',
            'BE': 'Bachelor of Engineering',
            'BSC': 'Bachelor of Science',
            'BA': 'Bachelor of Arts',
            'BCOM': 'Bachelor of Commerce',
            'MBA': 'Master of Business Administration',
            'MCA': 'Master of Computer Applications'
        }
        
        # Check for exact matches (considering {Hons.} suffixes)
        base_course = re.sub(r'\s*\{[^}]*\}', '', course_text.strip()).upper()
        
        if base_course in course_name_map:
            full_name = course_name_map[base_course]
            # Add honors designation if present
            if '{hons' in course_text.lower() or '(hons' in course_text.lower():
                full_name += ' (Honours)'
            return full_name
        
        # Fallback: clean up the original text
        base_name = re.sub(r'\([^)]*\)', '', course_text)  # Remove parentheses
        base_name = re.sub(r'[-:].+', '', base_name)  # Remove specialization after dash/colon
        
        return base_name.strip()
    
    def _determine_course_type(self, course_text: str) -> str:
        """Determine course type (Undergraduate, Postgraduate, etc.)"""
        text_lower = course_text.lower()
        
        for key, course_type in self.course_type_map.items():
            if key in text_lower:
                return course_type
        
        return "Unknown"
    
    def _determine_stream(self, course_text: str) -> str:
        """Determine the academic stream"""
        text_lower = course_text.lower()
        
        # Priority check for law courses first
        if 'llb' in text_lower or 'law' in text_lower:
            return "Law"
        
        for key, stream in self.stream_map.items():
            if key in text_lower:
                return stream
        
        # Default logic based on course patterns
        if any(term in text_lower for term in ['tech', 'engineering', 'be', 'b.tech']):
            return "Engineering"
        elif any(term in text_lower for term in ['arts', 'ba', 'b.a']):
            return "Arts"
        elif any(term in text_lower for term in ['science', 'bsc', 'b.sc']):
            return "Science"
        elif any(term in text_lower for term in ['commerce', 'bcom', 'b.com']):
            return "Commerce"
        
        return "General"
    
    def _determine_group(self, course_type: str) -> str:
        """Determine course group"""
        if course_type == "Undergraduate":
            return "BA / B.Tech/ B.Sc / BE etc"
        elif course_type == "Postgraduate":
            return "MA / M.Tech/ M.Sc / ME etc"
        elif course_type == "Doctorate":
            return "PhD / Doctorate"
        else:
            return "Others"
    
    def _extract_fees(self, fee_text: str) -> Dict:
        """Extract fee information from text"""
        fees = {"from": "", "to": ""}
        
        # Look for fee amounts
        fee_pattern = r'₹?\s*([0-9,]+)'
        fee_matches = re.findall(fee_pattern, fee_text.replace(',', ''))
        
        if fee_matches:
            amounts = []
            for match in fee_matches:
                try:
                    amount = int(match.replace(',', ''))
                    amounts.append(amount)
                except ValueError:
                    continue
            
            if amounts:
                fees['from'] = str(min(amounts))
                fees['to'] = str(max(amounts))
        
        return fees
    
    def _remove_duplicate_courses(self, courses: List[Dict]) -> List[Dict]:
        """Remove duplicate courses"""
        seen = set()
        unique_courses = []
        
        for course in courses:
            # Create a unique identifier for the course
            identifier = f"{course.get('name', '')}_{course.get('specialization', '')}"
            
            if identifier not in seen:
                seen.add(identifier)
                unique_courses.append(course)
        
        return unique_courses
