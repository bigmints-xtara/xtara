#!/usr/bin/env python3
"""
Course Standardization Rules
============================

Comprehensive course standardization system that follows the college.json data model structure.
Includes LLM-based grouping logic for course categorization.
"""

import re
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

@dataclass
class StandardizedCourse:
    """Standardized course structure following college.json data model"""
    title: str                    # Short form: "BA - Economics"
    name: str                    # Full name: "Bachelor of Arts - Economics"
    specialization: str          # Subject: "Economics"
    stream: str                  # Stream: "Arts", "Science", "Management", etc.
    type: str                    # "Undergraduate" or "Postgraduate"
    duration: str                # "3 years", "4 years", etc.
    fees: Dict[str, str]         # {"from": "100000", "to": "500000"}
    entrance_exams: str          # "JEE Main", "NEET", etc.
    seats: str                   # "100"

class CourseStandardizer:
    """Course standardization system with LLM-based grouping"""
    
    def __init__(self):
        # Course type mappings
        self.course_types = {
            'bachelor': 'Undergraduate',
            'bachelor of': 'Undergraduate',
            'ba': 'Undergraduate',
            'bsc': 'Undergraduate',
            'bcom': 'Undergraduate',
            'bba': 'Undergraduate',
            'bca': 'Undergraduate',
            'btech': 'Undergraduate',
            'be': 'Undergraduate',
            'bsw': 'Undergraduate',
            'bped': 'Undergraduate',
            'master': 'Postgraduate',
            'master of': 'Postgraduate',
            'ma': 'Postgraduate',
            'msc': 'Postgraduate',
            'mcom': 'Postgraduate',
            'mba': 'Postgraduate',
            'mca': 'Postgraduate',
            'mtech': 'Postgraduate',
            'me': 'Postgraduate',
            'msw': 'Postgraduate',
            'mped': 'Postgraduate',
            'phd': 'Doctorate',
            'doctorate': 'Doctorate'
        }
        
        # Stream mappings
        self.stream_mappings = {
            'arts': 'Arts',
            'humanities': 'Arts',
            'social science': 'Arts',
            'science': 'Science',
            'engineering': 'Engineering',
            'technology': 'Engineering',
            'management': 'Management',
            'commerce': 'Commerce',
            'computer': 'Computer Science',
            'it': 'Computer Science',
            'medical': 'Medical',
            'nursing': 'Medical',
            'pharmacy': 'Medical',
            'education': 'Education',
            'law': 'Law',
            'agriculture': 'Agriculture',
            'veterinary': 'Veterinary',
            'architecture': 'Architecture',
            'design': 'Design',
            'fine arts': 'Fine Arts',
            'mass communication': 'Mass Communication',
            'journalism': 'Mass Communication',
            'social work': 'Social Work',
            'physical education': 'Physical Education'
        }
        
        # Duration mappings
        self.duration_mappings = {
            '1 year': '1 year',
            '2 years': '2 years',
            '3 years': '3 years',
            '4 years': '4 years',
            '5 years': '5 years',
            '6 years': '6 years'
        }
        
        # Entrance exam mappings
        self.entrance_exam_mappings = {
            'jee main': 'JEE Main',
            'jee advanced': 'JEE Advanced',
            'neet': 'NEET',
            'cat': 'CAT',
            'mat': 'MAT',
            'xat': 'XAT',
            'gmat': 'GMAT',
            'gre': 'GRE',
            'gate': 'GATE',
            'upsc': 'UPSC',
            'ssc': 'SSC',
            'banking': 'Banking Exams',
            'railway': 'Railway Exams',
            'defense': 'Defense Exams'
        }

    def standardize_course(self, raw_course: Dict) -> StandardizedCourse:
        """Standardize a raw course to follow college.json structure"""
        
        # Extract basic information
        course_name = raw_course.get('name', '')
        fees = raw_course.get('fees', {})
        
        # Clean and standardize course name
        cleaned_name = self.clean_course_name(course_name)
        
        # Extract course type
        course_type = self.extract_course_type(cleaned_name)
        
        # Extract stream
        stream = self.extract_stream(cleaned_name, raw_course.get('stream', ''))
        
        # Extract specialization
        specialization = self.extract_specialization(cleaned_name)
        
        # Create title (short form)
        title = self.create_title(cleaned_name, specialization)
        
        # Group field removed as requested
        
        # Extract duration
        duration = self.extract_duration(raw_course.get('duration', ''))
        
        # Extract entrance exams
        entrance_exams = self.extract_entrance_exams(raw_course.get('entrance_exams', ''))
        
        # Extract seats
        seats = raw_course.get('seats', '')
        
        return StandardizedCourse(
            title=title,
            name=cleaned_name,
            specialization=specialization,
            stream=stream,
            type=course_type,
            duration=duration,
            fees=fees,
            entrance_exams=entrance_exams,
            seats=seats
        )

    def clean_course_name(self, name: str) -> str:
        """Clean and standardize course name"""
        if not name:
            return ""
        
        # Remove extra whitespace
        name = re.sub(r'\s+', ' ', name.strip())
        
        # Standardize common abbreviations
        name = re.sub(r'\bB\.A\.\b', 'Bachelor of Arts', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.Sc\.\b', 'Bachelor of Science', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.Com\.\b', 'Bachelor of Commerce', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.B\.A\.\b', 'Bachelor of Business Administration', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.C\.A\.\b', 'Bachelor of Computer Applications', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.Tech\.\b', 'Bachelor of Technology', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.E\.\b', 'Bachelor of Engineering', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.S\.W\.\b', 'Bachelor of Social Work', name, flags=re.IGNORECASE)
        name = re.sub(r'\bB\.P\.Ed\.\b', 'Bachelor of Physical Education', name, flags=re.IGNORECASE)
        
        name = re.sub(r'\bM\.A\.\b', 'Master of Arts', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.Sc\.\b', 'Master of Science', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.Com\.\b', 'Master of Commerce', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.B\.A\.\b', 'Master of Business Administration', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.C\.A\.\b', 'Master of Computer Applications', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.Tech\.\b', 'Master of Technology', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.E\.\b', 'Master of Engineering', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.S\.W\.\b', 'Master of Social Work', name, flags=re.IGNORECASE)
        name = re.sub(r'\bM\.P\.Ed\.\b', 'Master of Physical Education', name, flags=re.IGNORECASE)
        
        return name

    def extract_course_type(self, name: str) -> str:
        """Extract course type from course name"""
        name_lower = name.lower()
        
        for pattern, course_type in self.course_types.items():
            if pattern in name_lower:
                return course_type
        
        # Default to Undergraduate if not found
        return 'Undergraduate'

    def extract_stream(self, name: str, existing_stream: str = '') -> str:
        """Extract stream from course name or existing stream"""
        if existing_stream:
            return existing_stream
        
        name_lower = name.lower()
        
        for pattern, stream in self.stream_mappings.items():
            if pattern in name_lower:
                return stream
        
        # Default stream based on course type (check specific patterns first)
        if 'bachelor of business administration' in name_lower or 'bba' in name_lower:
            return 'Management'
        elif 'bachelor of computer applications' in name_lower or 'bca' in name_lower:
            return 'Computer Science'
        elif 'bachelor of social work' in name_lower or 'bsw' in name_lower:
            return 'Social Work'
        elif 'bachelor of physical education' in name_lower or 'bped' in name_lower:
            return 'Physical Education'
        elif 'bachelor of arts' in name_lower or 'ba' in name_lower:
            return 'Arts'
        elif 'bachelor of science' in name_lower or 'bsc' in name_lower:
            return 'Science'
        elif 'bachelor of commerce' in name_lower or 'bcom' in name_lower:
            return 'Commerce'
        elif 'bachelor of technology' in name_lower or 'btech' in name_lower:
            return 'Engineering'
        elif 'bachelor of engineering' in name_lower or 'be' in name_lower:
            return 'Engineering'
        else:
            return 'General'

    def extract_specialization(self, name: str) -> str:
        """Extract specialization from course name"""
        # Look for specialization in parentheses
        paren_match = re.search(r'\(([^)]+)\)', name)
        if paren_match:
            specialization = paren_match.group(1).strip()
            # Don't use the course abbreviation as specialization
            if specialization.upper() in ['BCA', 'BBA', 'BSW', 'MSW', 'MCA', 'B.P.ED', 'BPED', 'M.P.ED', 'MPED', 'B.ED', 'BED', 'BA', 'BSC', 'BCOM', 'BE', 'BTECH', 'MA', 'MSC', 'MCOM', 'ME', 'MTECH']:
                return ''
            return specialization
        
        # Look for specialization in brackets (like [B.Ed], [BA])
        bracket_match = re.search(r'\[([^\]]+)\]', name)
        if bracket_match:
            specialization = bracket_match.group(1).strip()
            # Don't use the course abbreviation as specialization
            if specialization.upper() in ['BCA', 'BBA', 'BSW', 'MSW', 'MCA', 'B.P.ED', 'BPED', 'M.P.ED', 'MPED', 'B.ED', 'BED', 'BA', 'BSC', 'BCOM', 'BE', 'BTECH', 'MA', 'MSC', 'MCOM', 'ME', 'MTECH']:
                return ''
            return specialization
        
        # Look for specialization after dash
        dash_match = re.search(r'-\s*([^-]+)$', name)
        if dash_match:
            specialization = dash_match.group(1).strip()
            # Don't use the course abbreviation as specialization
            if specialization.upper() in ['BCA', 'BBA', 'BSW', 'MSW', 'MCA', 'B.P.ED', 'BPED', 'M.P.ED', 'MPED', 'B.ED', 'BED', 'BA', 'BSC', 'BCOM', 'BE', 'BTECH', 'MA', 'MSC', 'MCOM', 'ME', 'MTECH']:
                return ''
            return specialization
        
        # Look for specialization after "in" or "of"
        in_match = re.search(r'\b(?:in|of)\s+([A-Z][^,]+)', name)
        if in_match:
            return in_match.group(1).strip()
        
        return ''

    def create_title(self, name: str, specialization: str) -> str:
        """Create short title for course"""
        # Extract base course name
        base_match = re.match(r'([A-Za-z\s]+?)(?:\s*-\s*|\s*\(|\s*in\s)', name)
        if base_match:
            base = base_match.group(1).strip()
        else:
            base = name
        
        # Create abbreviation
        if 'Bachelor of Arts' in base:
            abbr = 'BA'
        elif 'Bachelor of Science' in base:
            abbr = 'BSc'
        elif 'Bachelor of Commerce' in base:
            abbr = 'BCom'
        elif 'Bachelor of Business Administration' in base:
            abbr = 'BBA'
        elif 'Bachelor of Computer Applications' in base:
            abbr = 'BCA'
        elif 'Bachelor of Technology' in base:
            abbr = 'BTech'
        elif 'Bachelor of Engineering' in base:
            abbr = 'BE'
        elif 'Bachelor of Social Work' in base:
            abbr = 'BSW'
        elif 'Bachelor of Physical Education' in base:
            abbr = 'BPEd'
        elif 'Master of Arts' in base:
            abbr = 'MA'
        elif 'Master of Science' in base:
            abbr = 'MSc'
        elif 'Master of Commerce' in base:
            abbr = 'MCom'
        elif 'Master of Business Administration' in base:
            abbr = 'MBA'
        elif 'Master of Computer Applications' in base:
            abbr = 'MCA'
        elif 'Master of Technology' in base:
            abbr = 'MTech'
        elif 'Master of Engineering' in base:
            abbr = 'ME'
        elif 'Master of Social Work' in base:
            abbr = 'MSW'
        elif 'Master of Physical Education' in base:
            abbr = 'MPEd'
        else:
            abbr = base
        
        # Add specialization if exists
        if specialization:
            return f"{abbr} - {specialization}"
        else:
            return abbr

    def create_group(self, name: str, course_type: str, stream: str) -> str:
        """Create single group value for courses"""
        # Extract the main course abbreviation from the name
        name_lower = name.lower()
        
        # Check for specific course patterns first
        if 'bachelor of business administration' in name_lower or 'bba' in name_lower or 'b.b.a' in name_lower:
            return 'BBA'
        elif 'bachelor of computer applications' in name_lower or 'bca' in name_lower or 'b.c.a' in name_lower:
            return 'BCA'
        elif 'bachelor of social work' in name_lower or 'bsw' in name_lower or 'b.s.w' in name_lower:
            return 'BSW'
        elif 'bachelor of physical education' in name_lower or 'bped' in name_lower or 'b.p.ed' in name_lower:
            return 'BPEd'
        elif 'bachelor of education' in name_lower or 'bed' in name_lower or 'b.ed' in name_lower:
            return 'BEd'
        elif 'bachelor of technology' in name_lower or 'btech' in name_lower or 'b.tech' in name_lower:
            return 'BTech'
        elif 'bachelor of engineering' in name_lower or 'be' in name_lower or 'b.e' in name_lower:
            return 'BE'
        elif 'bachelor of science' in name_lower or 'bsc' in name_lower or 'b.sc' in name_lower:
            return 'BSc'
        elif 'bachelor of commerce' in name_lower or 'bcom' in name_lower or 'b.com' in name_lower:
            return 'BCom'
        elif 'bachelor of arts' in name_lower or 'ba' in name_lower or 'b.a' in name_lower:
            return 'BA'
        elif 'master of business administration' in name_lower or 'mba' in name_lower:
            return 'MBA'
        elif 'master of computer applications' in name_lower or 'mca' in name_lower:
            return 'MCA'
        elif 'master of social work' in name_lower or 'msw' in name_lower:
            return 'MSW'
        elif 'master of physical education' in name_lower or 'mped' in name_lower:
            return 'MPEd'
        elif 'master of education' in name_lower or 'med' in name_lower:
            return 'MEd'
        elif 'master of technology' in name_lower or 'mtech' in name_lower:
            return 'MTech'
        elif 'master of engineering' in name_lower or 'me' in name_lower:
            return 'ME'
        elif 'master of science' in name_lower or 'msc' in name_lower:
            return 'MSc'
        elif 'master of commerce' in name_lower or 'mcom' in name_lower:
            return 'MCom'
        elif 'master of arts' in name_lower or 'ma' in name_lower:
            return 'MA'
        elif course_type == 'Doctorate':
            return 'PhD'
        else:
            # Default based on course type
            return 'BA' if course_type == 'Undergraduate' else 'MA'

    def extract_duration(self, duration: str) -> str:
        """Extract and standardize duration"""
        if not duration:
            return '3 years'  # Default duration
        
        duration_lower = duration.lower()
        
        for pattern, standard_duration in self.duration_mappings.items():
            if pattern in duration_lower:
                return standard_duration
        
        return '3 years'  # Default duration

    def extract_entrance_exams(self, exams: str) -> str:
        """Extract and standardize entrance exams"""
        if not exams:
            return ''
        
        exams_lower = exams.lower()
        found_exams = []
        
        for pattern, standard_exam in self.entrance_exam_mappings.items():
            if pattern in exams_lower:
                found_exams.append(standard_exam)
        
        return ', '.join(found_exams) if found_exams else exams

    def standardize_courses_batch(self, courses: List[Dict]) -> List[StandardizedCourse]:
        """Standardize a batch of courses"""
        standardized = []
        
        for course in courses:
            try:
                standardized_course = self.standardize_course(course)
                standardized.append(standardized_course)
            except Exception as e:
                print(f"Error standardizing course {course.get('name', 'Unknown')}: {e}")
                continue
        
        return standardized

    def export_standardized_courses(self, standardized_courses: List[StandardizedCourse], output_file: str):
        """Export standardized courses to JSON file"""
        courses_data = []
        
        for course in standardized_courses:
            course_dict = {
                'title': course.title,
                'name': course.name,
                'specialization': course.specialization,
                'stream': course.stream,
                'type': course.type,
                'duration': course.duration,
                'fees': course.fees,
                'entrance_exams': course.entrance_exams,
                'seats': course.seats
            }
            courses_data.append(course_dict)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(courses_data, f, indent=2, ensure_ascii=False)
        
        print(f"Exported {len(courses_data)} standardized courses to {output_file}")

# Example usage
if __name__ == "__main__":
    # Test with sample courses
    sample_courses = [
        {
            'name': 'Bachelor of Arts [BA] (Mass Communication)',
            'stream': 'Arts',
            'fees': {'from': '50339', 'to': '50339'},
            'duration': '3 years',
            'entrance_exams': 'Direct Admission',
            'seats': '60'
        },
        {
            'name': 'Bachelor of Business Administration [BBA] (Tourism and Travel Management)',
            'stream': 'Management',
            'fees': {'from': '64554', 'to': '64554'},
            'duration': '3 years',
            'entrance_exams': 'AIMA UGAT',
            'seats': '40'
        }
    ]
    
    standardizer = CourseStandardizer()
    standardized = standardizer.standardize_courses_batch(sample_courses)
    
    for course in standardized:
        print(f"Title: {course.title}")
        print(f"Group: {course.group}")
        print(f"Name: {course.name}")
        print(f"Specialization: {course.specialization}")
        print(f"Stream: {course.stream}")
        print(f"Type: {course.type}")
        print(f"Duration: {course.duration}")
        print(f"Fees: {course.fees}")
        print(f"Entrance Exams: {course.entrance_exams}")
        print(f"Seats: {course.seats}")
        print("-" * 50)
