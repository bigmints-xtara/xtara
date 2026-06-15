"""
State manager for coordinating state-wise college scraping
"""
import json
import time
from pathlib import Path
from typing import List, Dict, Optional
import logging
from concurrent.futures import ThreadPoolExecutor
import signal
import sys

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from utils.config import Config
from utils.progress_tracker import ProgressTracker
from utils.duplicate_detector import DuplicateDetector
from scripts.core_scraper import CollegeDuniaScraper
from scripts.ollama_refiner import OllamaRefiner

class StateManager:
    def __init__(self):
        Config.ensure_directories()
        
        self.progress_tracker = ProgressTracker(Config.PROGRESS_DIR)
        self.duplicate_detector = DuplicateDetector(Config.OUTPUTS_DIR)
        self.scraper = CollegeDuniaScraper(self.progress_tracker, self.duplicate_detector)
        self.refiner = OllamaRefiner()
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(Config.LOGS_DIR / 'state_manager.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Handle graceful shutdown
        self.should_stop = False
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle graceful shutdown"""
        self.logger.info("Received shutdown signal. Saving progress...")
        self.should_stop = True
        self.progress_tracker.save_progress()
    
    def run_scraping(self, states: Optional[List[str]] = None, resume: bool = False, 
                    max_pages: int = Config.MAX_PAGES_PER_STATE):
        """Run the complete scraping process"""
        try:
            if resume:
                resume_point = self.progress_tracker.get_resume_point()
                if resume_point:
                    self.logger.info(f"Resuming from state: {resume_point['state']}, page: {resume_point['page']}")
                    states = [resume_point['state']] + [s for s in (states or Config.INDIAN_STATES) 
                                                     if s != resume_point['state']]
                    # Update starting page for resumed state
                    self._scrape_state(resume_point['state'], resume_point['page'], max_pages)
                    states = states[1:]  # Remove the resumed state from the list
            
            states_to_process = states or Config.INDIAN_STATES
            
            for state in states_to_process:
                if self.should_stop:
                    self.logger.info("Stopping due to shutdown signal")
                    break
                
                if state in self.progress_tracker.progress_data['completed_states']:
                    self.logger.info(f"Skipping already completed state: {state}")
                    continue
                
                self.logger.info(f"Starting scraping for state: {state}")
                self._scrape_state(state, 1, max_pages)
                
                if not self.should_stop:
                    self.progress_tracker.complete_state(state)
            
            if not self.should_stop:
                self.logger.info("Scraping completed successfully!")
                self._generate_final_report()
            
        except KeyboardInterrupt:
            self.logger.info("Scraping interrupted by user")
        except Exception as e:
            self.logger.error(f"Scraping failed: {e}")
        finally:
            self.progress_tracker.save_progress()
    
    def _scrape_state(self, state: str, start_page: int = 1, max_pages: int = Config.MAX_PAGES_PER_STATE):
        """Scrape colleges for a specific state"""
        colleges_scraped = 0
        
        for page in range(start_page, max_pages + 1):
            if self.should_stop:
                break
            
            self.logger.info(f"Scraping {state} - Page {page}")
            self.progress_tracker.set_current_state(state, page)
            
            # Get college list for this page
            state_url = Config.get_state_url(state, page)
            soup = self.scraper.get_page(state_url)
            
            if not soup:
                self.logger.warning(f"Failed to fetch page {page} for {state}")
                continue
            
            # Extract college links
            college_links = self.scraper.extract_college_links_from_page(soup)
            
            if not college_links:
                self.logger.info(f"No more colleges found for {state} on page {page}")
                break
            
            # Scrape each college ONE BY ONE
            for college_info in college_links:
                if self.should_stop:
                    break
                
                college_id = college_info['id']
                
                # Skip if already processed
                if self.progress_tracker.is_college_processed(college_id):
                    continue
                
                try:
                    self.logger.info(f"Scraping college: {college_info['name']}")
                    
                    # Scrape college details
                    college_data = self.scraper.scrape_college_details(college_info)
                    
                    if college_data:
                        # Refine data using LLM
                        if self.refiner.available:
                            college_data = self.refiner.refine_college_data(college_data)
                            college_data = self.refiner.validate_and_fix_json_structure(college_data)
                        
                        # SAVE IMMEDIATELY after processing each college
                        self._save_single_college(state, college_data)
                        colleges_scraped += 1
                        self.progress_tracker.add_completed_college(college_id, state)
                        
                        self.logger.info(f"Successfully processed and saved college: {college_data['name']}")
                    else:
                        self.progress_tracker.add_failed_college(college_id, state, "Failed to scrape details")
                        self.logger.warning(f"Failed to scrape college: {college_info['name']}")
                
                except Exception as e:
                    error_msg = f"Error processing college {college_id}: {e}"
                    self.logger.error(error_msg)
                    self.progress_tracker.add_failed_college(college_id, state, str(e))
                
                # Add small delay between colleges
                time.sleep(1)
            
            # Break if we've reached the target number of colleges
            if colleges_scraped >= Config.MAX_COLLEGES_PER_STATE:
                self.logger.info(f"Reached target of {Config.MAX_COLLEGES_PER_STATE} colleges for {state}")
                break
        
        self.logger.info(f"Completed scraping {state}: {colleges_scraped} colleges")
    
    def _save_single_college(self, state: str, college_data: Dict):
        """Save a single college immediately after processing"""
        # Convert state name to proper format (Kerala instead of kerala)
        state_title = state.replace('-', ' ').title()
        state_dir = Config.COLLEGES_DIR / state_title
        
        # Create state directory if it doesn't exist
        state_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate filename from college name
        college_name = college_data.get('name', 'unknown_college')
        
        # Clean college name for filename
        safe_name = self._generate_safe_filename(college_name)
        
        # Add timestamp for uniqueness
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_name}_{timestamp}.json"
        
        college_file = state_dir / filename
        
        # Save individual college file
        try:
            with open(college_file, 'w', encoding='utf-8') as f:
                json.dump(college_data, f, indent=2, ensure_ascii=False)
            self.logger.info(f"💾 Saved: {college_name} -> {filename}")
        except Exception as e:
            self.logger.error(f"Failed to save college {college_name}: {e}")
            raise e
    
    def _generate_safe_filename(self, college_name: str) -> str:
        """Generate a safe filename from college name"""
        import re
        
        # Convert to lowercase and clean
        safe_name = college_name.lower()
        
        # Remove common college suffixes for cleaner names
        suffixes_to_remove = [
            ', autonomous', ' autonomous', '(autonomous)', '[autonomous]',
            ', deemed university', ' deemed university',
            ', university', ' university', ', college', ' college',
            ', institute', ' institute', ', academy', ' academy',
            ' - [', ']', '[', ']', '(', ')', ',', '.'
        ]
        
        for suffix in suffixes_to_remove:
            safe_name = safe_name.replace(suffix, '')
        
        # Replace spaces and special characters with underscores
        safe_name = re.sub(r'[^a-z0-9]+', '_', safe_name)
        
        # Remove leading/trailing underscores and limit length
        safe_name = safe_name.strip('_')[:50]
        
        return safe_name if safe_name else 'college'
    
    def _get_college_id(self, college: Dict) -> str:
        """Generate a unique identifier for a college"""
        name = college.get('name', '').lower().strip()
        city = college.get('city', '').lower().strip()
        return f"{name}_{city}"
    
    def _generate_final_report(self):
        """Generate final scraping report"""
        stats = self.progress_tracker.get_progress_stats()
        duplicate_stats = self.duplicate_detector.get_duplicate_stats()
        
        report = {
            "scraping_stats": stats,
            "duplicate_stats": duplicate_stats,
            "files_generated": []
        }
        
        # List generated files by state directories
        for state_dir in Config.COLLEGES_DIR.iterdir():
            if state_dir.is_dir():
                college_files = list(state_dir.glob("*.json"))
                if college_files:
                    report["files_generated"].append({
                        "state": state_dir.name,
                        "directory": str(state_dir),
                        "colleges_count": len(college_files)
                    })
        
        # Save report
        report_file = Config.OUTPUTS_DIR / "scraping_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Final report saved to {report_file}")
        
        # Print summary
        print("\n" + "="*60)
        print("SCRAPING COMPLETED - FINAL SUMMARY")
        print("="*60)
        print(f"Total Colleges Scraped: {stats['total_colleges_scraped']}")
        print(f"Total Colleges Failed: {stats['total_colleges_failed']}")
        print(f"Total Unique Colleges: {duplicate_stats['total_unique_colleges']}")
        print(f"Files Generated: {len(report['files_generated'])}")
        print("="*60)
        
        for file_info in report['files_generated']:
            print(f"{file_info['state'].title()}: {file_info['colleges_count']} colleges")
        
        print("="*60 + "\n")
    
    def scrape_specific_states(self, states: List[str], max_pages: int = Config.MAX_PAGES_PER_STATE):
        """Scrape specific states only"""
        self.logger.info(f"Starting scraping for specific states: {states}")
        self.run_scraping(states=states, max_pages=max_pages)
    
    def resume_scraping(self):
        """Resume scraping from last checkpoint"""
        self.logger.info("Resuming scraping from last checkpoint")
        self.run_scraping(resume=True)
    
    def get_progress_report(self):
        """Get and display current progress report"""
        self.progress_tracker.print_progress_report()
        return self.progress_tracker.get_progress_stats()
