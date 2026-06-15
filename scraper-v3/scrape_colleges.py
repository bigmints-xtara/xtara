#!/usr/bin/env python3
"""
CollegeDunia Scraper - Single Comprehensive Script
Scrapes college data from CollegeDunia with state-wise organization
"""

import sys
import os
import json
import time
import requests
import argparse
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set
import logging

# Add scripts directory to path
sys.path.append('scripts')
from scripts.final_api_scraper import FinalCollegeDuniaAPIScraper

class CollegeScraper:
    def __init__(self, outputs_dir: str = "outputs"):
        self.outputs_dir = Path(outputs_dir)
        self.scraped_data_dir = self.outputs_dir / "scraped_data"
        self.progress_dir = self.outputs_dir / "progress"
        self.duplicates_file = self.outputs_dir / "duplicates.json"
        self.pause_file = self.outputs_dir / "pause_requested"
        
        # Create directories
        self.scraped_data_dir.mkdir(parents=True, exist_ok=True)
        self.progress_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize scraper
        self.scraper = FinalCollegeDuniaAPIScraper()
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.outputs_dir / "scraping.log"),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Load progress and duplicates
        self.progress = self._load_progress()
        self.duplicates = self._load_duplicates()
        
        # Gentle crawling settings
        self.request_delay = 2  # 5 seconds between requests
        self.page_delay = 8     # 8 seconds between pages
        self.error_delay = 15   # 15 seconds after errors
        
        # Fields to clean up from scraped data
        self.fields_to_remove = {
            'stream_id', 'id', 'short_head_two', 'admission', 'reviews', 
            'fees_data', 'previous_fees_data', 'academic_year', 'cutoff',
            'is_discontinued', 'previous_year_fees', 'click_stats', 
            'monthly_click_stats', 'monthly_leads_stats', 'priority_score',
            'tuitionFeesData', 'course_tag_id', 'tuition_fee', 'url',
            'lead_params', 'ranking_stats_key', 'rankingStats',
            # Additional fields to remove
            'logo', 'cover_image', 'city_id', 'state_id', 'area_id', 'area_name',
            'overall_admin_rating', 'qna', 'major_stream', 'major_stream_rating',
            'ranking', 'is_distance', 'naac_approval', 'college_tier',
            'review_amount', 'isShowFull', 'chat_group_members', 'hide_live_form',
            # Fee-related fields to remove
            'exam_fee', 'training_and_placement_fees', 'miscellaneous_fees'
        }
        
        # Indian states for scraping
        self.indian_states = [
            "andhra-pradesh", "arunachal-pradesh", "assam", "bihar", "chhattisgarh",
            "goa", "gujarat", "haryana", "himachal-pradesh", "jharkhand",
            "karnataka", "kerala", "madhya-pradesh", "maharashtra", "manipur",
            "meghalaya", "mizoram", "nagaland", "odisha", "punjab",
            "rajasthan", "sikkim", "tamil-nadu", "telangana", "tripura",
            "uttar-pradesh", "uttarakhand", "west-bengal", "delhi", "jammu-kashmir"
        ]
        
        # Special URL mappings for states with different CollegeDunia URL patterns
        self.state_url_mapping = {
            "jammu-kashmir": "jammu",
            "delhi": "delhi",
            "mizoram": "mizoram",  # May have very limited data
            "sikkim": "sikkim",
            "manipur": "manipur",
            "tripura": "tripura",
            "nagaland": "nagaland",
            "meghalaya": "meghalaya"
        }
    
    def _load_progress(self) -> Dict:
        """Load scraping progress"""
        progress_file = self.progress_dir / "progress.json"
        if progress_file.exists():
            with open(progress_file, 'r') as f:
                return json.load(f)
        return {"completed_states": [], "current_state": None, "current_page": 1}
    
    def _save_progress(self):
        """Save scraping progress"""
        progress_file = self.progress_dir / "progress.json"
        with open(progress_file, 'w') as f:
            json.dump(self.progress, f, indent=2)
    
    def _load_duplicates(self) -> Set[str]:
        """Load duplicate college IDs from both file and existing scraped data"""
        duplicates = set()
        
        # Load from duplicates file
        if self.duplicates_file.exists():
            with open(self.duplicates_file, 'r') as f:
                duplicates.update(json.load(f))
        
        # Also check existing scraped files for college IDs
        self.logger.info("🔍 Scanning existing files for duplicate college IDs...")
        existing_count = 0
        for state_dir in self.scraped_data_dir.iterdir():
            if state_dir.is_dir():
                for json_file in state_dir.glob("*.json"):
                    if not json_file.name.endswith("_summary.json"):
                        try:
                            with open(json_file, 'r', encoding='utf-8') as f:
                                data = json.load(f)
                            
                            # Extract college ID from metadata or filename
                            college_id = None
                            if 'metadata' in data and 'college_dunia_url' in data['metadata']:
                                url = data['metadata']['college_dunia_url']
                                if '/college/' in url:
                                    college_id = url.split('/college/')[1].split('-')[0]
                            
                            # Fallback: extract from filename
                            if not college_id and '_' in json_file.stem:
                                parts = json_file.stem.split('_')
                                for part in parts:
                                    if part.isdigit() and len(part) >= 4:
                                        college_id = part
                                        break
                            
                            if college_id:
                                duplicates.add(college_id)
                                existing_count += 1
                                
                        except Exception as e:
                            self.logger.warning(f"Error reading {json_file}: {e}")
        
        self.logger.info(f"📊 Found {len(duplicates)} unique college IDs ({existing_count} from existing files)")
        return duplicates
    
    def _save_duplicates(self):
        """Save duplicate college IDs"""
        with open(self.duplicates_file, 'w') as f:
            json.dump(list(self.duplicates), f, indent=2)
    
    def _is_duplicate(self, college_id: str, college_name: str, state: str) -> bool:
        """Enhanced duplicate checking with multiple criteria"""
        # Check by college ID (primary method)
        if college_id in self.duplicates:
            return True
        
        # Check by college name and state (secondary method)
        state_dir = self.scraped_data_dir / state.replace('-', '_')
        if state_dir.exists():
            for json_file in state_dir.glob("*.json"):
                if not json_file.name.endswith("_summary.json"):
                    try:
                        with open(json_file, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                        
                        # Check by name match
                        if 'basic_info' in data:
                            existing_name = data['basic_info'].get('name', '').strip().lower()
                            existing_short_form = data['basic_info'].get('short_form', '').strip().lower()
                            current_name = college_name.strip().lower()
                            
                            # Check for exact name match
                            if existing_name == current_name or existing_short_form == current_name:
                                self.logger.info(f"🔄 Duplicate found by name: {college_name}")
                                return True
                                
                    except Exception as e:
                        self.logger.warning(f"Error checking duplicate in {json_file}: {e}")
        
        return False
    
    def _check_pause_request(self):
        """Check if pause has been requested"""
        return self.pause_file.exists()
    
    def _request_pause(self):
        """Request a pause by creating pause file"""
        self.pause_file.touch()
        self.logger.info("🛑 Pause requested. Will pause after current college.")
    
    def _clear_pause_request(self):
        """Clear pause request"""
        if self.pause_file.exists():
            self.pause_file.unlink()
    
    def _gentle_delay(self, delay_type="request"):
        """Apply gentle delays based on type"""
        if delay_type == "request":
            delay = self.request_delay
        elif delay_type == "page":
            delay = self.page_delay
        elif delay_type == "error":
            delay = self.error_delay
        else:
            delay = 1
        
        self.logger.info(f"⏳ Waiting {delay} seconds to be gentle with the server...")
        time.sleep(delay)
    
    def _cleanup_data(self, data):
        """Recursively remove unwanted fields from the data"""
        if isinstance(data, dict):
            # Create a new dict without unwanted fields
            cleaned = {}
            for key, value in data.items():
                if key not in self.fields_to_remove:
                    cleaned[key] = self._cleanup_data(value)
            return cleaned
        elif isinstance(data, list):
            # Clean each item in the list
            return [self._cleanup_data(item) for item in data]
        else:
            # Return primitive values as-is
            return data
    
    def get_college_links_from_state_page(self, state: str, page: int) -> List[Dict]:
        """Get college links from a state page"""
        # Use URL mapping for special cases, otherwise use state as-is
        url_state = self.state_url_mapping.get(state, state)
        url = f"https://collegedunia.com/{url_state}-colleges?page={page}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        try:
            # Gentle delay before request
            self._gentle_delay("request")
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            
            colleges = []
            
            # Find college links - they're typically in divs with class containing 'clg-name-address'
            college_divs = soup.find_all('div', class_=lambda x: x and 'clg-name-address' in x)
            self.logger.info(f"Found {len(college_divs)} clg-name-address divs")
            
            for i, div in enumerate(college_divs):
                self.logger.info(f"Processing div {i+1}/{len(college_divs)}")
                link_elem = div.find('a', href=re.compile(r'/college/\d+'))
                if link_elem:
                    self.logger.info(f"Found college link in div {i+1}")
                    href = link_elem['href']
                    # Extract college ID from URL
                    college_id = href.split('/college/')[1].split('-')[0]
                    
                    # Note: Duplicate checking is now done in the main loop
                    
                    # Make URL absolute
                    if href.startswith('/'):
                        href = f"https://collegedunia.com{href}"
                    
                    college_name = link_elem.get_text(strip=True)
                    colleges.append({
                        'id': college_id,
                        'url': href,
                        'name': college_name
                    })
                    self.logger.info(f"Found college: {college_name} (ID: {college_id})")
                else:
                    self.logger.info(f"No college link found in div {i+1}")
            
            self.logger.info(f"Total colleges found in clg-name-address divs: {len(colleges)}")
            
            # Fallback: look for any college links if no named divs found
            if not colleges:
                self.logger.info("No colleges found in clg-name-address divs, trying fallback method")
                college_links = soup.find_all('a', href=re.compile(r'/college/\d+'))
                for link in college_links:
                    href = link.get('href', '')
                    college_name = link.get_text(strip=True)
                    
                    # Filter out non-college-name links
                    if (college_name and len(college_name) > 10 and 
                        not college_name.startswith('₹') and 
                        'Based on' not in college_name and
                        '#' not in college_name and
                        'Reviews' not in college_name):
                        
                        # Extract college ID from URL
                        college_id = href.split('/college/')[1].split('-')[0]
                        
                        # Make URL absolute
                        if href.startswith('/'):
                            href = f"https://collegedunia.com{href}"
                        
                        colleges.append({
                            'id': college_id,
                            'url': href,
                            'name': college_name
                        })
            
            self.logger.info(f"Found {len(colleges)} colleges on {state} page {page}")
            return colleges
            
        except Exception as e:
            self.logger.error(f"Error getting colleges from {state} page {page}: {e}")
            self._gentle_delay("error")  # Extra delay after error
            return []
    
    def scrape_single_college(self, url: str) -> Dict:
        """Scrape a single college by URL"""
        self.logger.info(f"Scraping single college: {url}")
        
        try:
            college_data = self.scraper.scrape_college_data(url)
            
            if college_data:
                # Clean up unwanted fields
                self.logger.info("🧹 Cleaning up unwanted fields...")
                college_data = self._cleanup_data(college_data)
                
                # Add metadata
                college_data['metadata'] = {
                    'college_dunia_url': url,
                    'processed_at': datetime.now().isoformat(),
                    'extractor_version': '1.0'
                }
                
                # Get state from basic_info and create state directory
                state = college_data.get('basic_info', {}).get('state', 'unknown')
                state_dir = self.scraped_data_dir / state.replace(' ', '_').lower()
                state_dir.mkdir(exist_ok=True)
                
                # Save individual college file in state directory
                college_name = college_data.get('basic_info', {}).get('short_form', 'Unknown College')
                safe_name = college_name.replace(' ', '_').replace(',', '').replace('.', '').replace('-', '_')
                safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '_')
                filename = f"{safe_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                filepath = state_dir / filename
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(college_data, f, indent=2, ensure_ascii=False)
                
                self.logger.info(f"✅ Successfully scraped and cleaned: {college_name}")
                self.logger.info(f"📁 Saved to: {filepath}")
                return college_data
            else:
                self.logger.error(f"❌ Failed to scrape college from {url}")
                return None
                
        except Exception as e:
            self.logger.error(f"❌ Error scraping college from {url}: {e}")
            return None
    
    def scrape_state_colleges(self, state: str, max_colleges: int = 1000) -> Dict:
        """Scrape colleges for a specific state"""
        self.logger.info(f"Starting to scrape colleges for state: {state}")
        
        state_dir = self.scraped_data_dir / state.replace('-', '_')
        state_dir.mkdir(exist_ok=True)
        
        scraped_count = 0
        page = 1
        max_pages = 500  # 500 pages to get maximum colleges available (increased from 100)
        
        state_summary = {
            'state': state,
            'total_colleges': 0,
            'successful_scrapes': 0,
            'failed_scrapes': 0,
            'duplicates_skipped': 0,
            'colleges': []
        }
        
        consecutive_empty_pages = 0
        max_consecutive_empty = 10  # Stop after 10 consecutive empty pages (increased from 5)
        
        while page <= max_pages:
            self.logger.info(f"Scraping {state} - Page {page}/{max_pages} (Target: {max_colleges} colleges, Current: {scraped_count})")
            
            # Get college links from this page
            colleges = self.get_college_links_from_state_page(state, page)
            
            if not colleges:
                consecutive_empty_pages += 1
                self.logger.warning(f"No colleges found on {state} page {page} (consecutive empty: {consecutive_empty_pages})")
                
                if consecutive_empty_pages >= max_consecutive_empty:
                    self.logger.info(f"Stopping after {consecutive_empty_pages} consecutive empty pages")
                    break
            else:
                consecutive_empty_pages = 0  # Reset counter when colleges are found
            
            # Check if we've already reached the target
            if scraped_count >= max_colleges:
                self.logger.info(f"Target of {max_colleges} colleges reached for {state}. Stopping.")
                break
            
            # Process each college
            new_colleges_found = 0
            for college in colleges:
                if scraped_count >= max_colleges:
                    break
                
                # Check for pause request
                if self._check_pause_request():
                    self.logger.info("🛑 Pause requested. Saving progress and stopping...")
                    self._save_progress()
                    self._save_duplicates()
                    return state_summary
                
                college_id = college['id']
                college_url = college['url']
                college_name = college['name']
                
                # Enhanced duplicate checking
                if self._is_duplicate(college_id, college_name, state):
                    state_summary['duplicates_skipped'] += 1
                    self.logger.info(f"⏭️  Skipping duplicate: {college_name} (ID: {college_id})")
                    continue
                
                new_colleges_found += 1
                
                self.logger.info(f"Scraping college {scraped_count + 1}/{max_colleges}: {college_name}")
                
                try:
                    # Gentle delay before scraping
                    self._gentle_delay("request")
                    
                    # Scrape college data
                    college_data = self.scraper.scrape_college_data(college_url)
                    
                    if college_data:
                        # Clean up unwanted fields
                        self.logger.info("🧹 Cleaning up unwanted fields...")
                        college_data = self._cleanup_data(college_data)
                        
                        # Add metadata
                        college_data['metadata'] = {
                            'college_dunia_url': college_url,
                            'processed_at': datetime.now().isoformat(),
                            'extractor_version': '1.0',
                            'state': state,
                            'scraped_page': page
                        }
                        
                        # Save individual college file
                        safe_name = college_name.replace(' ', '_').replace(',', '').replace('.', '').replace('-', '_')
                        safe_name = ''.join(c for c in safe_name if c.isalnum() or c == '_')
                        filename = f"{safe_name}_{college_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                        filepath = state_dir / filename
                        
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(college_data, f, indent=2, ensure_ascii=False)
                        
                        # Mark as processed
                        self.duplicates.add(college_id)
                        state_summary['successful_scrapes'] += 1
                        state_summary['colleges'].append({
                            'id': college_id,
                            'name': college_name,
                            'file': filename,
                            'url': college_url
                        })
                        
                        self.logger.info(f"✅ Successfully scraped and cleaned: {college_name}")
                        
                    else:
                        state_summary['failed_scrapes'] += 1
                        self.logger.error(f"❌ Failed to scrape: {college_name}")
                        self._gentle_delay("error")  # Extra delay after failure
                    
                    scraped_count += 1
                    
                    # Update progress after each college
                    self.progress['current_state'] = state
                    self.progress['current_page'] = page
                    self.progress['colleges_scraped'] = scraped_count
                    self._save_progress()
                    self._save_duplicates()
                    
                except Exception as e:
                    state_summary['failed_scrapes'] += 1
                    self.logger.error(f"❌ Error scraping {college_name}: {e}")
                    self._gentle_delay("error")  # Extra delay after error
                    continue
            
            # Log if no new colleges found on this page
            if new_colleges_found == 0:
                self.logger.info(f"No new colleges found on {state} page {page} (all were duplicates) - continuing to next page")
            
            page += 1
            
            # Gentle delay between pages
            if page <= max_pages:
                self._gentle_delay("page")
            
            # Update progress
            self.progress['current_state'] = state
            self.progress['current_page'] = page
            self._save_progress()
            self._save_duplicates()
        
        state_summary['total_colleges'] = scraped_count
        
        # Save state summary
        summary_file = state_dir / f"{state}_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(state_summary, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Completed scraping {state}: {state_summary['successful_scrapes']} successful, {state_summary['failed_scrapes']} failed, {state_summary['duplicates_skipped']} duplicates skipped")
        
        return state_summary
    
    def scrape_all_states(self, max_colleges_per_state: int = 2000):
        """Scrape colleges for all Indian states"""
        self.logger.info(f"Starting to scrape colleges for all states (max {max_colleges_per_state} per state)")
        
        total_summary = {
            'started_at': datetime.now().isoformat(),
            'max_colleges_per_state': max_colleges_per_state,
            'states': []
        }
        
        for state in self.indian_states:
            # Check if state has been fully scraped (reached target or 100 pages)
            if self._is_state_fully_scraped(state, max_colleges_per_state):
                self.logger.info(f"Skipping {state} - already fully scraped")
                continue
            
            try:
                state_summary = self.scrape_state_colleges(state, max_colleges_per_state)
                total_summary['states'].append(state_summary)
                
                # Mark state as completed
                self.progress['completed_states'].append(state)
                self._save_progress()
                
                self.logger.info(f"✅ Completed state: {state}")
                
            except Exception as e:
                self.logger.error(f"❌ Error processing state {state}: {e}")
                continue
        
        total_summary['completed_at'] = datetime.now().isoformat()
        
        # Save total summary
        summary_file = self.outputs_dir / "total_scraping_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(total_summary, f, indent=2, ensure_ascii=False)
        
        self.logger.info("🎉 Completed scraping all states!")
        return total_summary
    
    def scrape_incomplete_states(self, max_colleges: int = 2000) -> Dict:
        """Scrape only states that have less than 20 files"""
        self.logger.info("Starting to scrape incomplete states")
        
        # Get list of incomplete states
        incomplete_states = self._get_incomplete_states()
        
        if not incomplete_states:
            self.logger.info("No incomplete states found")
            return {
                'total_states': 0,
                'successful_states': 0,
                'failed_states': 0,
                'total_colleges': 0,
                'successful_scrapes': 0,
                'failed_scrapes': 0,
                'states': []
            }
        
        self.logger.info(f"Found {len(incomplete_states)} incomplete states: {', '.join(incomplete_states)}")
        
        total_summary = {
            'total_states': len(incomplete_states),
            'successful_states': 0,
            'failed_states': 0,
            'total_colleges': 0,
            'successful_scrapes': 0,
            'failed_scrapes': 0,
            'states': []
        }
        
        for state in incomplete_states:
            self.logger.info(f"Scraping incomplete state: {state}")
            try:
                state_summary = self.scrape_state_colleges(state, max_colleges)
                total_summary['states'].append(state_summary)
                total_summary['total_colleges'] += state_summary['total_colleges']
                total_summary['successful_scrapes'] += state_summary['successful_scrapes']
                total_summary['failed_scrapes'] += state_summary['failed_scrapes']
                
                if state_summary['successful_scrapes'] > 0:
                    total_summary['successful_states'] += 1
                else:
                    total_summary['failed_states'] += 1
                    
            except Exception as e:
                self.logger.error(f"Error scraping state {state}: {e}")
                total_summary['failed_states'] += 1
        
        return total_summary
    
    def _is_state_fully_scraped(self, state: str, target_colleges: int) -> bool:
        """Check if a state has been fully scraped (reached target or 500 pages)"""
        state_dir = self.scraped_data_dir / state.replace('-', '_')
        
        if not state_dir.exists():
            return False
        
        # Count college files (excluding summary files)
        json_files = list(state_dir.glob("*.json"))
        college_files = [f for f in json_files if not f.name.endswith("_summary.json")]
        current_count = len(college_files)
        
        # Check if we've reached the target number of colleges
        if current_count >= target_colleges:
            self.logger.info(f"State {state}: {current_count} colleges (target: {target_colleges}) - FULLY SCRAPED")
            return True
        
        # Check if we've scraped 500 pages by looking at metadata
        max_page_scraped = 0
        for json_file in college_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                if 'metadata' in data and 'scraped_page' in data['metadata']:
                    page = data['metadata']['scraped_page']
                    if isinstance(page, int) and page > max_page_scraped:
                        max_page_scraped = page
            except:
                continue
        
        if max_page_scraped >= 500:
            self.logger.info(f"State {state}: {current_count} colleges, {max_page_scraped} pages - FULLY SCRAPED")
            return True
        
        self.logger.info(f"State {state}: {current_count} colleges, {max_page_scraped} pages - NEEDS MORE SCRAPING")
        return False
    
    def _get_incomplete_states(self) -> List[str]:
        """Get list of states with less than 20 files"""
        incomplete_states = []
        
        for state in self.indian_states:
            state_dir = self.scraped_data_dir / state.replace('-', '_')
            if state_dir.exists():
                json_files = list(state_dir.glob("*.json"))
                # Exclude summary files from the count
                college_files = [f for f in json_files if not f.name.endswith("_summary.json")]
                if len(college_files) < 20:
                    incomplete_states.append(state)
            else:
                # State directory doesn't exist, so it's incomplete
                incomplete_states.append(state)
        
        return incomplete_states

def main():
    """Main function with command line interface"""
    parser = argparse.ArgumentParser(description='CollegeDunia Scraper - Single Comprehensive Script')
    parser.add_argument('--mode', choices=['test', 'single', 'state', 'all', 'incomplete'], default='all',
                       help='Scraping mode: test (Kerala, 10 colleges), single (one URL), state (one state), all (all states), incomplete (only states with < 20 files)')
    parser.add_argument('--url', type=str, help='College URL for single mode')
    parser.add_argument('--state', type=str, help='State name for state mode (e.g., kerala, tamil-nadu)')
    parser.add_argument('--max', type=int, default=2000, help='Maximum colleges per state (default: 2000)')
    parser.add_argument('--output', type=str, default='outputs', help='Output directory (default: outputs)')
    
    args = parser.parse_args()
    
    # Initialize scraper
    scraper = CollegeScraper(args.output)
    
    print("=== COLLEGEDUNIA SCRAPER ===")
    print("Single comprehensive script for college data extraction")
    print(f"Output directory: {scraper.outputs_dir.absolute()}")
    print()
    
    if args.mode == 'test':
        print("🧪 TEST MODE: Scraping Kerala with 10 colleges")
        summary = scraper.scrape_state_colleges('kerala', 10)
        print(f"✅ Test completed: {summary['successful_scrapes']} colleges scraped")
        
    elif args.mode == 'single':
        if not args.url:
            print("❌ ERROR: --url required for single mode")
            print("Example: python scrape_colleges.py --mode single --url 'https://collegedunia.com/college/...'")
            sys.exit(1)
        
        print(f"🎯 SINGLE MODE: Scraping college from URL")
        result = scraper.scrape_single_college(args.url)
        if result:
            print("✅ Single college scraped successfully")
        else:
            print("❌ Failed to scrape single college")
            sys.exit(1)
            
    elif args.mode == 'state':
        if not args.state:
            print("❌ ERROR: --state required for state mode")
            print("Example: python scrape_colleges.py --mode state --state kerala")
            sys.exit(1)
        
        print(f"🎯 STATE MODE: Scraping {args.state} with {args.max} colleges")
        summary = scraper.scrape_state_colleges(args.state, args.max)
        print(f"✅ State completed: {summary['successful_scrapes']} colleges scraped")
        
    elif args.mode == 'incomplete':
        print(f"🔧 INCOMPLETE STATES MODE: Scraping only states with < 20 files, {args.max} colleges each")
        summary = scraper.scrape_incomplete_states(args.max)
        print("✅ Incomplete states completed")
        
    elif args.mode == 'all':
        print(f"🌍 ALL STATES MODE: Scraping all states with {args.max} colleges each")
        summary = scraper.scrape_all_states(args.max)
        print("✅ All states completed")
    
    print()
    print("🎯 Data Structure:")
    print("  - basic_info: Complete college information (35 fields)")
    print("  - courses: All available courses and specializations")
    print("  - metadata: URL, timestamp, extractor version")
    print("  - State-wise organization: outputs/scraped_data/{state}/")
    print("  - Progress tracking: Resume from where you left off")
    print()
    print("🎉 Scraping completed!")

if __name__ == "__main__":
    main()
