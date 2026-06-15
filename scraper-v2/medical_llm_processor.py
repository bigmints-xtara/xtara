
import requests
import json
import logging
from typing import List, Dict, Any

class MedicalCourseLLMProcessor:
    def __init__(self, model_name="gpt-oss:20b", base_url="http://localhost:11434"):
        self.model_name = model_name
        self.base_url = base_url
        self.api_url = f"{base_url}/api/generate"
        
    def process_medical_courses(self, raw_courses: List[Dict], college_name: str = "") -> List[Dict]:
        """Process medical courses using LLM with medical domain knowledge"""
        
        # Create focused prompt for medical courses
        prompt = self._create_medical_prompt(raw_courses, college_name)
        
        try:
            # Call Ollama API with shorter timeout for focused task
            response = self._call_ollama(prompt)
            
            # Parse LLM response
            processed_courses = self._parse_llm_response(response)
            
            if processed_courses:
                return processed_courses
            else:
                # Fallback to rule-based processing
                return self._fallback_medical_processing(raw_courses)
            
        except Exception as e:
            logging.error(f"Medical LLM processing failed: {e}")
            # Fallback to rule-based processing
            return self._fallback_medical_processing(raw_courses)
    
    def _create_medical_prompt(self, raw_courses: List[Dict], college_name: str) -> str:
        """Create a focused prompt for medical course processing"""
        
        # Take only first 20 courses to avoid timeout
        courses_sample = raw_courses[:20]
        courses_json = json.dumps(courses_sample, indent=2)
        
        prompt = f"""
You are a medical education expert. Clean and classify these medical courses from {college_name}.

MEDICAL COURSE RULES:
1. Stream Classification:
   - MBBS, BDS, Nursing, Pharmacy, Physiotherapy → "Medical"
   - MD, MS, DM, M.Ch specializations → "Medical" 
   - All medical specialties → "Medical"

2. Course Type:
   - MBBS, BDS, B.Sc Nursing, BPT, B.Pharma → "Undergraduate"
   - MD, MS, DM, M.Ch, M.Sc → "Postgraduate"
   - Diplomas → "Diploma"
   - Fellowships → "Fellowship"

3. Remove Generic Courses:
   - Remove "M.D" and "M.S" without specializations
   - Keep only specialized MD/MS courses
   - Remove duplicate MBBS entries

Raw courses:
{courses_json}

Return ONLY a JSON array of properly classified medical courses. Fix streams, types, and remove generics.
"""
        return prompt
    
    def _call_ollama(self, prompt: str) -> str:
        """Call Ollama API with shorter timeout"""
        
        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "max_tokens": 2000
            }
        }
        
        response = requests.post(self.api_url, json=payload, timeout=60)
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
    
    def _fallback_medical_processing(self, raw_courses: List[Dict]) -> List[Dict]:
        """Fallback rule-based medical course processing"""
        
        processed = []
        
        for course in raw_courses:
            name = course.get('name', '').lower()
            
            # Skip generic MD/MS without specializations
            if name in ['m.d', 'md', 'm.s', 'ms'] and not course.get('specialization'):
                continue
                
            # Fix medical course classifications
            if any(term in name for term in ['md', 'mbbs', 'bds', 'nursing', 'pharmacy', 'physiotherapy', 'ms', 'dm', 'm.ch']):
                course['stream'] = 'Medical'
            
            if any(term in name for term in ['md', 'ms', 'dm', 'm.ch', 'master', 'doctorate']):
                course['type'] = 'Postgraduate'
            elif any(term in name for term in ['mbbs', 'bds', 'bachelor', 'b.sc', 'bpt', 'b.pharma']):
                course['type'] = 'Undergraduate'
            
            processed.append(course)
            
        return processed
