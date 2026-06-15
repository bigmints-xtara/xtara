#!/usr/bin/env python3
"""
Dream Career Course Refiner
Maps dream career courses to actual college courses using Ollama AI
"""

import json
import os
import requests
import logging
from typing import Dict, List, Any
from pathlib import Path
from collections import defaultdict
import time
import re

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CourseRefiner:
    """Refines dream career courses to match actual college offerings"""
    
    def __init__(self):
        # Paths
        self.dream_careers_dir = Path(__file__).parent / "dream_careers"
        self.scraped_data_dir = Path("/Users/pretheesh/Projects/project-xtara/scraper-v3/outputs/scraped_data")
        self.output_dir = Path(__file__).parent / "refined_careers"
        
        # Create output directory
        self.output_dir.mkdir(exist_ok=True)
        
        # Load course database
        self._load_course_database()
    
    def _load_course_database(self):
        """Load college course data with full course structures"""
        logger.info("Loading course database...")
        
        # Store course display names and full course structures
        self.course_display_names = set()
        self.course_structures = {}  # display_name -> full course structure
        
        for state_dir in self.scraped_data_dir.iterdir():
            if not state_dir.is_dir():
                continue
                
            for college_file in state_dir.glob("*.json"):
                try:
                    with open(college_file, 'r', encoding='utf-8') as f:
                        college_data = json.load(f)
                    
                    for course in college_data.get('courses', []):
                        # Handle both "stream" and "streams" keys (different database formats)
                        streams_data = course.get('streams', []) or course.get('stream', [])
                        
                        # Handle courses with streams
                        if streams_data and len(streams_data) > 0:
                            for stream in streams_data:
                                display_name = stream.get('display_course_name', '').strip()
                                course_name = stream.get('course_name', '').strip()
                                
                                final_name = display_name or course_name
                                if final_name:
                                    self.course_display_names.add(final_name)
                                    
                                    # Store full course structure
                                    self.course_structures[final_name] = {
                                        'course': course.get('course', course.get('display_name', '')),
                                        'level': course.get('level', ''),
                                        'duration_year': course.get('duration_year', ''),
                                        'duration_month': course.get('duration_month', ''),
                                        'stream': [{
                                            'name': stream.get('name', ''),
                                            'course_name': course_name,
                                            'display_course_name': display_name,
                                            'custom_name': stream.get('custom_name', ''),
                                            'total_current_fee': stream.get('total_current_fee', {})
                                        }]
                                    }
                        
                        # Handle courses without streams
                        else:
                            course_name = course.get('course', course.get('display_name', '')).strip()
                            if course_name:
                                self.course_display_names.add(course_name)
                                
                                # Store course structure without streams
                                self.course_structures[course_name] = {
                                    'course': course_name,
                                    'level': course.get('level', ''),
                                    'duration_year': course.get('duration_year', ''),
                                    'duration_month': course.get('duration_month', ''),
                                    'course_type': course.get('course_type', ''),
                                    'degree_type': course.get('degree_type', ''),
                                    'eligibility': course.get('eligibility', ''),
                                    'fees_per_year': course.get('fees_per_year', ''),
                                    'grand_total': course.get('grand_total', '')
                                }
                                
                except Exception as e:
                    logger.error(f"Error processing {college_file}: {e}")
                    continue
        
        logger.info(f"Loaded {len(self.course_display_names)} unique courses with full structures")
    
    
    def _call_ollama(self, prompt: str) -> str:
        """Call Ollama for AI suggestions"""
        try:
            response = requests.post(
                f"http://localhost:11434/api/generate",
                json={"model": "gpt-oss:20b", "prompt": prompt, "stream": False},
                timeout=60
            )
            return response.json()['response'].strip()
        except Exception as e:
            logger.error(f"Ollama error: {e}")
            return ""
    
    def _find_course_matches(self, course_name: str, career_title: str) -> dict:
        """Find best course match using LLM with college database RAG"""
        
        # First try simple exact matches for obvious cases
        for display_name in self.course_display_names:
            # Check if it's a very close match
            if course_name.lower().replace(" - ", " (").replace(")", "") + ")" == display_name.lower():
                return self.course_structures[display_name]
        
        # Get relevant courses for this career domain with strict level matching
        career_keywords, required_level = self._extract_career_keywords(course_name, career_title)
        relevant_courses = self._filter_relevant_courses(career_keywords, required_level)[:20]  # Limit for prompt
        
        if not relevant_courses:
            logger.info(f"    No relevant {required_level} level courses found for {course_name}")
            return None  # No relevant courses found
        
        prompt = f"""You are an expert Indian education counselor. Find the BEST course mapping for "{course_name}" for a {career_title} career.

CRITICAL REQUIREMENTS - NO EXCEPTIONS:
1. ONLY return courses from the RAG database list below - NEVER invent or modify course names
2. The course MUST match the EXACT academic level: {required_level} level ONLY
3. The course MUST be directly relevant to {career_title} career
4. Return ONLY the exact course name as it appears in the list
5. If no suitable course exists, return "NO_MATCH"

RAG DATABASE - AVAILABLE COURSES ({required_level} level only):
{chr(10).join(f"- {course}" for course in relevant_courses)}

TASK: Map "{course_name}" to the MOST RELEVANT course from the RAG database above.

RESPONSE: Return ONLY the exact course name from the list, or "NO_MATCH".

Best mapping:"""

        ai_response = self._call_ollama(prompt)
        
        # Validate AI response - must be exact match from our RAG database
        if ai_response and ai_response != "NO_MATCH":
            # Check for exact match in our course list
            for course in relevant_courses:
                if ai_response.strip() == course.strip():
                    return self.course_structures[course]
            
            # Check for partial match as fallback
            for course in relevant_courses:
                if course.lower() in ai_response.lower():
                    logger.info(f"    Using partial match: {ai_response} → {course}")
                    return self.course_structures[course]
        
        logger.info(f"    LLM response '{ai_response}' not found in RAG database")
        return None  # Return None if no valid match found
    
    def _extract_course_level(self, course_name: str) -> str:
        """Extract academic level from course name"""
        course_lower = course_name.lower()
        if "certificate" in course_lower:
            return "10+2"  # Certificate courses are stored with level "10+2" in database
        elif "diploma" in course_lower:
            return "Diploma"  # Will look for both "Diploma" and "Post Graduation" levels
        elif "b." in course_lower or "bachelor" in course_lower:
            return "Graduation"
        elif "m." in course_lower or "master" in course_lower:
            return "Post Graduation"
        elif "phd" in course_lower or "doctorate" in course_lower:
            return "Doctorate"
        return "Unknown"
    
    def _extract_career_keywords(self, course_name: str, career_title: str) -> tuple:
        """Extract keywords and level for filtering relevant courses"""
        keywords = []
        
        # Add subject from course name
        if " - " in course_name:
            subject = course_name.split(" - ", 1)[1].lower()
            keywords.append(subject)
        
        # Add career-related keywords
        career_lower = career_title.lower()
        if "genetic" in career_lower:
            keywords.extend(["genetics", "biology", "biotechnology", "biochemistry"])
        elif "computer" in career_lower or "software" in career_lower:
            keywords.extend(["computer", "software", "information technology"])
        elif "engineer" in career_lower:
            keywords.extend(["engineering", "technology"])
        elif "medical" in career_lower or "doctor" in career_lower:
            keywords.extend(["medicine", "medical", "health"])
        elif "business" in career_lower or "management" in career_lower:
            keywords.extend(["business", "management", "administration"])
        
        # Extract required level
        required_level = self._extract_course_level(course_name)
        
        return keywords, required_level
    
    def _filter_relevant_courses(self, keywords: list, required_level: str) -> list:
        """Filter courses relevant to career keywords and academic level"""
        if not keywords:
            return list(self.course_display_names)[:50]  # Return sample if no keywords
        
        relevant = []
        for course_name in self.course_display_names:
            course_lower = course_name.lower()
            
            # First check if course matches the required academic level
            course_structure = self.course_structures.get(course_name, {})
            course_level = course_structure.get('level', '')
            
            # Level matching logic (handle database quirks)
            level_match = False
            if required_level == "Unknown":
                level_match = True
            elif required_level == "10+2":  # Certificate courses
                level_match = course_level == "10+2"
            elif required_level == "Diploma":  # Diploma courses might be stored as "Post Graduation" or "Diploma"
                level_match = (course_level == "Diploma" or 
                             (course_level == "Post Graduation" and "diploma" in course_name.lower()))
            else:
                level_match = course_level == required_level
            
            if not level_match:
                continue
            
            # Then check subject relevance
            for keyword in keywords:
                if keyword in course_lower:
                    relevant.append(course_name)
                    break
        
        return relevant
    
    def _remove_duplicates_and_generics(self, courses: List[dict]) -> List[dict]:
        """Remove duplicates and prefer specialized courses over generic ones"""
        # Remove None values first
        valid_courses = [course for course in courses if course is not None]
        
        # Remove duplicates based on course structure
        unique_courses = []
        seen_courses = set()
        
        for course in valid_courses:
            # Create a unique identifier for the course
            if 'stream' in course and course['stream']:
                # For courses with streams, use display_course_name
                course_id = course['stream'][0].get('display_course_name', '')
            else:
                # For courses without streams, use course name
                course_id = course.get('course', '')
            
            if course_id and course_id not in seen_courses:
                seen_courses.add(course_id)
                unique_courses.append(course)
        
        return unique_courses
    
    def refine_career(self, career_file: Path) -> bool:
        """Refine courses for a single career"""
        try:
            with open(career_file, 'r', encoding='utf-8') as f:
                career_data = json.load(f)
            
            career_title = career_data.get('title', 'Unknown')
            original_courses = career_data.get('courses', [])
            
            logger.info(f"Refining: {career_title}")
            
            refined_courses = []
            mapping_info = {}
            
            for course in original_courses:
                course_structure = self._find_course_matches(course, career_title)
                
                if course_structure:
                    refined_courses.append(course_structure)
                    
                    # Create mapping info for logging
                    if 'stream' in course_structure and course_structure['stream']:
                        mapped_name = course_structure['stream'][0].get('display_course_name', '')
                    else:
                        mapped_name = course_structure.get('course', '')
                    
                    mapping_info[course] = mapped_name
                    logger.info(f"  {course} → {mapped_name}")
                else:
                    # Keep original course name in simple format if no match found
                    logger.info(f"  {course} → No match found, keeping original")
                    mapping_info[course] = course
            
            # Remove duplicates and generic courses
            refined_courses = self._remove_duplicates_and_generics(refined_courses)
            
            # Process related careers courses
            if 'relatedCareers' in career_data:
                logger.info(f"  Processing {len(career_data['relatedCareers'])} related careers...")
                
                for related_career in career_data['relatedCareers']:
                    related_title = related_career.get('title', '')
                    related_courses = related_career.get('courses', [])
                    refined_related_courses = []
                    
                    logger.info(f"    Related career: {related_title}")
                    
                    for course_name in related_courses:
                        # Find best match using LLM + college database
                        mapped_course = self._find_course_matches(course_name, related_title)
                        
                        if mapped_course:
                            refined_related_courses.append(mapped_course)
                            
                            if 'stream' in mapped_course and mapped_course['stream']:
                                mapped_name = mapped_course['stream'][0].get('display_course_name', '')
                            else:
                                mapped_name = mapped_course.get('course', '')
                            
                            logger.info(f"      {course_name} → {mapped_name}")
                        else:
                            logger.info(f"      {course_name} → No mapping found")
                    
                    # Remove duplicates and generics for related courses
                    refined_related_courses = self._remove_duplicates_and_generics(refined_related_courses)
                    related_career['courses'] = refined_related_courses
            
            # Update career data
            career_data['courses'] = refined_courses
            career_data['_refined_at'] = time.strftime('%Y-%m-%dT%H:%M:%S')
            career_data['_refined_by'] = 'dream_career_refiner'
            career_data['_original_courses'] = original_courses
            career_data['_course_mappings'] = mapping_info
            
            # Save refined career
            output_file = self.output_dir / career_file.name
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(career_data, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            logger.error(f"Error refining {career_file}: {e}")
            return False
    
    def refine_all_careers(self):
        """Refine all dream careers"""
        career_files = list(self.dream_careers_dir.glob("*.json"))
        logger.info(f"Found {len(career_files)} dream career files")
        
        successful = 0
        for career_file in career_files:
            if self.refine_career(career_file):
                successful += 1
        
        logger.info(f"Successfully refined {successful}/{len(career_files)} careers")
        logger.info(f"Output saved to: {self.output_dir}")

def main():
    """Main function"""
    print("🔄 Dream Career Course Refiner")
    print("=" * 40)
    
    # Run refiner
    refiner = CourseRefiner()
    refiner.refine_all_careers()
    
    print("✅ Course refinement completed!")
    return 0

if __name__ == "__main__":
    exit(main())
