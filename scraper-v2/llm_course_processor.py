
import requests
import json
import logging
from typing import List, Dict, Any

class LLMCourseProcessor:
    def __init__(self, model_name="gpt-oss:20b", base_url="http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self.api_url = f"{base_url}/api/generate"
        
    def process_courses(self, raw_courses: List[Dict], college_name: str = "") -> List[Dict]:
        """Process raw courses using LLM to extract proper courses and remove generics"""
        
        # Create prompt for LLM
        prompt = self._create_course_processing_prompt(raw_courses, college_name)
        
        try:
            # Call Ollama API
            response = self._call_ollama(prompt)
            
            # Parse LLM response
            processed_courses = self._parse_llm_response(response)
            
            return processed_courses
            
        except Exception as e:
            logging.error(f"LLM processing failed: {e}")
            # Fallback to original courses if LLM fails
            return raw_courses
    
    def _create_course_processing_prompt(self, raw_courses: List[Dict], college_name: str) -> str:
        """Create a detailed prompt for course processing"""
        
        courses_json = json.dumps(raw_courses, indent=2)
        
        prompt = f"""
You are a course data processor. Given raw course data from {college_name}, clean and standardize it.

RULES:
1. Remove generic courses (like "B.Sc", "M.Sc", "B.Com") if specific specializations exist
2. Keep only courses with clear specializations or standalone programs
3. For B.Com: Only keep specializations like "Taxation and Finance", "Computer Applications", etc.
4. For B.Sc/M.Sc: Only keep with specific subjects like "Computer Science", "Physics", "Chemistry"
5. Standardize course names and titles
6. Ensure proper stream categorization
7. Keep all original data fields but clean the content

Raw courses data:
{courses_json}

Return ONLY a valid JSON array of cleaned courses. No explanation, just the JSON.
"""
        return prompt
    
    def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API"""
        
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "max_tokens": 4000
            }
        }
        
        response = requests.post(self.api_url, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
    
    def _parse_llm_response(self, response: str) -> List[Dict]:
        """Parse LLM response and extract JSON"""
        
        try:
            # Try to find JSON in the response
            start_idx = response.find('[')
            end_idx = response.rfind(']') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response[start_idx:end_idx]
                courses = json.loads(json_str)
                return courses
            else:
                logging.error("No JSON array found in LLM response")
                return []
                
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse LLM JSON response: {e}")
            return []
