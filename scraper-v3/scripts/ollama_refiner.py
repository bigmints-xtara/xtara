"""
Ollama integration for content refinement using gpt-oss model
"""
import requests
import json
import logging
from typing import Dict, List, Optional
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from utils.config import Config

class OllamaRefiner:
    def __init__(self):
        self.base_url = Config.OLLAMA_BASE_URL
        self.model = Config.OLLAMA_MODEL
        self.logger = logging.getLogger(__name__)
        
        # Check if Ollama is available
        self.available = self._check_ollama_availability()
    
    def _check_ollama_availability(self) -> bool:
        """Check if Ollama service is available"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.RequestException:
            self.logger.warning("Ollama service not available. Content refinement will be skipped.")
            return False
    
    def refine_college_data(self, college_data: Dict) -> Dict:
        """Refine college data using LLM"""
        if not self.available:
            return college_data
        
        try:
            # Create refinement prompts for different parts of the data
            refined_data = college_data.copy()
            
            # Preserve metadata during refinement
            original_metadata = college_data.get('metadata', {})
            
            # Refine college name and basic info
            refined_data = self._refine_basic_info(refined_data)
            
            # Refine address and location
            refined_data = self._refine_location(refined_data)
            
            # Refine courses
            if refined_data.get('courses'):
                refined_data['courses'] = self._refine_courses(refined_data['courses'])
            
            # Always preserve metadata
            refined_data['metadata'] = original_metadata
            
            return refined_data
            
        except Exception as e:
            self.logger.error(f"Error refining college data: {e}")
            return college_data
    
    def _refine_basic_info(self, college_data: Dict) -> Dict:
        """Refine basic college information"""
        prompt = f"""
        Please clean and standardize the following college information:
        
        College Name: {college_data.get('name', '')}
        Address: {college_data.get('address', '')}
        
        Tasks:
        1. Standardize the college name (remove extra spaces, fix capitalization)
        2. Clean the address format
        3. Extract state, district, and city if not already present
        
        Respond only with a JSON object containing:
        {{
            "name": "cleaned college name",
            "address": "cleaned address",
            "state": "state name",
            "district": "district name", 
            "city": "city name"
        }}
        """
        
        response = self._call_ollama(prompt)
        if response:
            try:
                refined = json.loads(response)
                college_data.update(refined)
            except json.JSONDecodeError:
                self.logger.warning("Failed to parse LLM response for basic info")
        
        return college_data
    
    def _refine_location(self, college_data: Dict) -> Dict:
        """Refine location information"""
        address = college_data.get('address', '')
        if not address:
            return college_data
        
        prompt = f"""
        Extract location components from this address: "{address}"
        
        Respond only with a JSON object:
        {{
            "state": "full state name",
            "district": "district name",
            "city": "city name"
        }}
        
        Use proper capitalization and full names (e.g., "Tamil Nadu" not "TN").
        """
        
        response = self._call_ollama(prompt)
        if response:
            try:
                location = json.loads(response)
                college_data.update(location)
            except json.JSONDecodeError:
                self.logger.warning("Failed to parse LLM response for location")
        
        return college_data
    
    def _refine_courses(self, courses: List[Dict]) -> List[Dict]:
        """Refine course information"""
        refined_courses = []
        
        for course in courses:
            try:
                refined_course = self._refine_single_course(course)
                refined_courses.append(refined_course)
            except Exception as e:
                self.logger.warning(f"Failed to refine course: {e}")
                refined_courses.append(course)
        
        return refined_courses
    
    def _refine_single_course(self, course: Dict) -> Dict:
        """Refine a single course"""
        prompt = f"""
        Clean and standardize this course information:
        
        Title: {course.get('title', '')}
        Name: {course.get('name', '')}
        Specialization: {course.get('specialization', '')}
        
        Tasks:
        1. Standardize course title and name
        2. Clean specialization name
        3. Determine the correct stream (Engineering, Medical, Arts, Science, Commerce, etc.)
        4. Determine course type (Undergraduate, Postgraduate, Doctorate, Diploma)
        
        Respond only with JSON:
        {{
            "title": "standardized title",
            "name": "standardized name", 
            "specialization": "cleaned specialization",
            "stream": "stream name",
            "type": "course type"
        }}
        """
        
        response = self._call_ollama(prompt)
        if response:
            try:
                refined = json.loads(response)
                course.update(refined)
            except json.JSONDecodeError:
                self.logger.warning("Failed to parse LLM response for course")
        
        return course
    
    def _call_ollama(self, prompt: str) -> Optional[str]:
        """Make a call to Ollama API"""
        if not self.available:
            return None
        
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,  # Low temperature for consistent output
                    "top_p": 0.9,
                    "top_k": 40
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                self.logger.error(f"Ollama API error: {response.status_code}")
                return None
                
        except requests.RequestException as e:
            self.logger.error(f"Failed to call Ollama: {e}")
            return None
    
    def validate_and_fix_json_structure(self, college_data: Dict) -> Dict:
        """Validate and fix the JSON structure to match expected schema"""
        if not self.available:
            return college_data
        
        # Define expected structure based on the college.json model
        expected_structure = {
            "name": "",
            "otherNames": [],
            "state": "",
            "district": "",
            "city": "",
            "address": "",
            "contacts": {"phone": [], "email": [], "website": ""},
            "entrance_exams": [],
            "rankings": [],
            "campus_size": "",
            "fees": {"from": "", "to": ""},
            "accreditations": [],
            "affiliations": [],
            "courses": [],
            "articles": [],
            "placements": [],
            "notable_alumni": [],
            "metadata": {"url": "", "processed_at": "", "extractor_version": ""}
        }
        
        prompt = f"""
        Validate and fix this college data structure to match the expected format:
        
        Current data: {json.dumps(college_data, indent=2)}
        
        Expected structure: {json.dumps(expected_structure, indent=2)}
        
        Tasks:
        1. Ensure all required fields are present
        2. Fix data types (arrays should be arrays, objects should be objects)
        3. Clean and standardize field values
        4. Remove any invalid or malformed data
        
        Respond only with the corrected JSON structure.
        """
        
        response = self._call_ollama(prompt)
        if response:
            try:
                # Try to extract JSON from the response
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_str = response[json_start:json_end]
                    validated_data = json.loads(json_str)
                    
                    # Ensure metadata is preserved from original data
                    if 'metadata' not in validated_data and 'metadata' in college_data:
                        validated_data['metadata'] = college_data['metadata']
                    
                    return validated_data
            except (json.JSONDecodeError, ValueError):
                self.logger.warning("Failed to parse LLM validation response")
        
        return college_data
