"""
Progress tracking for resumable scraping operations
"""
import json
import time
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

class ProgressTracker:
    def __init__(self, progress_dir: Path):
        self.progress_dir = progress_dir
        self.progress_file = progress_dir / "scraping_progress.json"
        self.progress_data = self._load_progress()
    
    def _load_progress(self) -> Dict:
        """Load existing progress or create new progress data"""
        if self.progress_file.exists():
            try:
                with open(self.progress_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                pass
        
        return {
            "start_time": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "current_state": None,
            "current_page": 1,
            "completed_states": [],
            "completed_colleges": [],
            "failed_colleges": [],
            "state_progress": {},
            "total_colleges_scraped": 0,
            "errors": []
        }
    
    def save_progress(self):
        """Save current progress to file"""
        self.progress_data["last_updated"] = datetime.now().isoformat()
        with open(self.progress_file, 'w', encoding='utf-8') as f:
            json.dump(self.progress_data, f, indent=2, ensure_ascii=False)
    
    def set_current_state(self, state: str, page: int = 1):
        """Set the current state being processed"""
        self.progress_data["current_state"] = state
        self.progress_data["current_page"] = page
        if state not in self.progress_data["state_progress"]:
            self.progress_data["state_progress"][state] = {
                "current_page": page,
                "completed_colleges": [],
                "failed_colleges": [],
                "total_colleges": 0
            }
        self.save_progress()
    
    def add_completed_college(self, college_id: str, state: str):
        """Mark a college as successfully scraped"""
        if college_id not in self.progress_data["completed_colleges"]:
            self.progress_data["completed_colleges"].append(college_id)
            self.progress_data["total_colleges_scraped"] += 1
        
        if state in self.progress_data["state_progress"]:
            if college_id not in self.progress_data["state_progress"][state]["completed_colleges"]:
                self.progress_data["state_progress"][state]["completed_colleges"].append(college_id)
        
        self.save_progress()
    
    def add_failed_college(self, college_id: str, state: str, error: str):
        """Mark a college as failed to scrape"""
        if college_id not in self.progress_data["failed_colleges"]:
            self.progress_data["failed_colleges"].append(college_id)
        
        if state in self.progress_data["state_progress"]:
            if college_id not in self.progress_data["state_progress"][state]["failed_colleges"]:
                self.progress_data["state_progress"][state]["failed_colleges"].append(college_id)
        
        # Add error log
        self.progress_data["errors"].append({
            "college_id": college_id,
            "state": state,
            "error": error,
            "timestamp": datetime.now().isoformat()
        })
        
        self.save_progress()
    
    def complete_state(self, state: str):
        """Mark a state as completed"""
        if state not in self.progress_data["completed_states"]:
            self.progress_data["completed_states"].append(state)
        self.progress_data["current_state"] = None
        self.progress_data["current_page"] = 1
        self.save_progress()
    
    def get_resume_point(self) -> Optional[Dict]:
        """Get the point where scraping should resume"""
        if self.progress_data["current_state"]:
            return {
                "state": self.progress_data["current_state"],
                "page": self.progress_data["current_page"]
            }
        return None
    
    def is_college_processed(self, college_id: str) -> bool:
        """Check if a college has already been processed (success or failure)"""
        return (college_id in self.progress_data["completed_colleges"] or 
                college_id in self.progress_data["failed_colleges"])
    
    def get_progress_stats(self) -> Dict:
        """Get current progress statistics"""
        total_states = len(self.progress_data["state_progress"])
        completed_states = len(self.progress_data["completed_states"])
        
        return {
            "total_colleges_scraped": self.progress_data["total_colleges_scraped"],
            "total_colleges_failed": len(self.progress_data["failed_colleges"]),
            "states_completed": f"{completed_states}/{total_states}",
            "current_state": self.progress_data["current_state"],
            "current_page": self.progress_data["current_page"],
            "start_time": self.progress_data["start_time"],
            "last_updated": self.progress_data["last_updated"]
        }
    
    def print_progress_report(self):
        """Print a formatted progress report"""
        stats = self.get_progress_stats()
        print("\n" + "="*50)
        print("SCRAPING PROGRESS REPORT")
        print("="*50)
        print(f"Total Colleges Scraped: {stats['total_colleges_scraped']}")
        print(f"Total Colleges Failed: {stats['total_colleges_failed']}")
        print(f"States Progress: {stats['states_completed']}")
        print(f"Current State: {stats['current_state'] or 'None'}")
        print(f"Current Page: {stats['current_page']}")
        print(f"Started: {stats['start_time']}")
        print(f"Last Updated: {stats['last_updated']}")
        print("="*50 + "\n")
