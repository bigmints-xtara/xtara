"""
Duplicate detection utility for college data
"""
import hashlib
import json
from pathlib import Path
from typing import Dict, List, Set
from difflib import SequenceMatcher

class DuplicateDetector:
    def __init__(self, outputs_dir: Path):
        self.outputs_dir = outputs_dir
        self.seen_colleges: Set[str] = set()
        self.college_hashes: Dict[str, str] = {}
        self._load_existing_colleges()
    
    def _load_existing_colleges(self):
        """Load existing colleges to check for duplicates"""
        colleges_dir = self.outputs_dir / "colleges"
        if not colleges_dir.exists():
            return
        
        for state_file in colleges_dir.glob("*.json"):
            try:
                with open(state_file, 'r', encoding='utf-8') as f:
                    colleges = json.load(f)
                    for college in colleges:
                        college_id = self._generate_college_id(college)
                        self.seen_colleges.add(college_id)
                        self.college_hashes[college_id] = self._generate_hash(college)
            except (json.JSONDecodeError, KeyError):
                continue
    
    def _generate_college_id(self, college: Dict) -> str:
        """Generate a unique ID for a college based on name and location"""
        name = college.get('name', '').lower().strip()
        city = college.get('city', '').lower().strip()
        state = college.get('state', '').lower().strip()
        
        # Clean name of common variations
        name = self._normalize_college_name(name)
        
        return f"{name}_{city}_{state}"
    
    def _normalize_college_name(self, name: str) -> str:
        """Normalize college name for better duplicate detection"""
        # Remove common suffixes and variations
        suffixes_to_remove = [
            ', autonomous', ', autonomus', ' autonomous', ' autonomus',
            ', deemed university', ' deemed university',
            ', university', ' university',
            ', college', ' college',
            ', institute', ' institute',
            ', academy', ' academy',
            ' (autonomous)', '(autonomous)',
            ' [autonomous]', '[autonomous]'
        ]
        
        normalized = name.lower()
        for suffix in suffixes_to_remove:
            normalized = normalized.replace(suffix, '')
        
        # Remove extra spaces and punctuation
        normalized = ' '.join(normalized.split())
        normalized = normalized.replace('-', ' ').replace('.', ' ')
        normalized = ' '.join(normalized.split())
        
        return normalized.strip()
    
    def _generate_hash(self, college: Dict) -> str:
        """Generate a hash of key college attributes"""
        key_attrs = {
            'name': self._normalize_college_name(college.get('name', '')),
            'city': college.get('city', '').lower().strip(),
            'state': college.get('state', '').lower().strip(),
            'address': college.get('address', '').lower().strip()[:100]  # First 100 chars
        }
        
        # Sort by keys to ensure consistent hashing
        sorted_attrs = json.dumps(key_attrs, sort_keys=True)
        return hashlib.md5(sorted_attrs.encode('utf-8')).hexdigest()
    
    def is_duplicate(self, college: Dict) -> bool:
        """Check if a college is a duplicate"""
        college_id = self._generate_college_id(college)
        
        # Check exact ID match
        if college_id in self.seen_colleges:
            return True
        
        # Check similar names in same city/state
        college_name = self._normalize_college_name(college.get('name', ''))
        college_city = college.get('city', '').lower().strip()
        college_state = college.get('state', '').lower().strip()
        
        for existing_id in self.seen_colleges:
            existing_name, existing_city, existing_state = existing_id.split('_', 2)
            
            # Same city and state
            if existing_city == college_city and existing_state == college_state:
                # Check name similarity
                similarity = SequenceMatcher(None, college_name, existing_name).ratio()
                if similarity > 0.85:  # 85% similarity threshold
                    return True
        
        return False
    
    def add_college(self, college: Dict) -> str:
        """Add a college to the seen set and return its ID"""
        college_id = self._generate_college_id(college)
        college_hash = self._generate_hash(college)
        
        self.seen_colleges.add(college_id)
        self.college_hashes[college_id] = college_hash
        
        return college_id
    
    def get_duplicate_stats(self) -> Dict:
        """Get statistics about duplicates found"""
        return {
            "total_unique_colleges": len(self.seen_colleges),
            "total_hashes": len(self.college_hashes)
        }
    
    def find_potential_duplicates_in_data(self, colleges: List[Dict]) -> List[Dict]:
        """Find potential duplicates within a dataset"""
        duplicates = []
        seen_in_batch = {}
        
        for i, college in enumerate(colleges):
            college_id = self._generate_college_id(college)
            
            if college_id in seen_in_batch:
                duplicates.append({
                    "index_1": seen_in_batch[college_id],
                    "index_2": i,
                    "college_1": colleges[seen_in_batch[college_id]]['name'],
                    "college_2": college['name'],
                    "reason": "identical_id"
                })
            else:
                seen_in_batch[college_id] = i
        
        return duplicates
