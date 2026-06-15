#!/usr/bin/env python3
"""
Auto-fix incomplete states in the scraper
Identifies states with low file counts and resumes scraping
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Tuple

class IncompleteStateFixer:
    def __init__(self, scraped_data_dir: str = "outputs/scraped_data"):
        self.scraped_data_dir = Path(scraped_data_dir)
        self.min_files_threshold = 20  # Minimum files per state
        self.max_files_per_state = 100  # Maximum files to scrape per state
        
    def analyze_states(self) -> Dict[str, int]:
        """Analyze all states and return file counts"""
        state_counts = {}
        
        if not self.scraped_data_dir.exists():
            print(f"❌ Scraped data directory not found: {self.scraped_data_dir}")
            return state_counts
            
        for state_dir in self.scraped_data_dir.iterdir():
            if state_dir.is_dir():
                state_name = state_dir.name
                # Count JSON files excluding summary files
                json_files = list(state_dir.glob("*.json"))
                summary_files = list(state_dir.glob("*_summary.json"))
                file_count = len(json_files) - len(summary_files)
                state_counts[state_name] = file_count
                
        return state_counts
    
    def identify_incomplete_states(self, state_counts: Dict[str, int]) -> List[Tuple[str, int]]:
        """Identify states that need more files"""
        incomplete = []
        
        for state, count in state_counts.items():
            if count < self.min_files_threshold:
                incomplete.append((state, count))
                
        # Sort by file count (ascending)
        incomplete.sort(key=lambda x: x[1])
        return incomplete
    
    def fix_state(self, state_name: str, target_files: int = None) -> bool:
        """Fix a specific state by resuming scraping"""
        if target_files is None:
            target_files = self.max_files_per_state
            
        print(f"🔧 Fixing state: {state_name} (target: {target_files} files)")
        
        # Convert state name to scraper format
        scraper_state = state_name.replace('_', '-')
        
        try:
            # Run the scraper for this specific state
            cmd = [
                sys.executable, "scrape_colleges.py",
                "--mode", "state",
                "--state", scraper_state,
                "--max", str(target_files)
            ]
            
            print(f"   Running: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
            
            if result.returncode == 0:
                print(f"   ✅ Successfully scraped {state_name}")
                return True
            else:
                print(f"   ❌ Failed to scrape {state_name}: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"   ⏰ Timeout while scraping {state_name}")
            return False
        except Exception as e:
            print(f"   ❌ Error scraping {state_name}: {e}")
            return False
    
    def fix_all_incomplete_states(self, dry_run: bool = False) -> Dict[str, bool]:
        """Fix all incomplete states"""
        print("🔍 Analyzing states...")
        state_counts = self.analyze_states()
        
        if not state_counts:
            print("❌ No states found to analyze")
            return {}
            
        incomplete_states = self.identify_incomplete_states(state_counts)
        
        if not incomplete_states:
            print("✅ All states have sufficient files!")
            return {}
            
        print(f"\n📊 Found {len(incomplete_states)} incomplete states:")
        for state, count in incomplete_states:
            print(f"   - {state}: {count} files (need {self.min_files_threshold - count} more)")
            
        if dry_run:
            print("\n🔍 DRY RUN - No actual scraping will be performed")
            return {}
            
        print(f"\n🔧 Starting to fix incomplete states...")
        results = {}
        
        for state, current_count in incomplete_states:
            needed_files = self.min_files_threshold - current_count
            target_files = min(needed_files + 10, self.max_files_per_state)  # Add buffer
            
            print(f"\n--- Fixing {state} ---")
            success = self.fix_state(state, target_files)
            results[state] = success
            
            if success:
                # Verify the fix
                new_counts = self.analyze_states()
                new_count = new_counts.get(state, 0)
                print(f"   📈 {state}: {current_count} → {new_count} files")
            
        return results
    
    def print_summary(self):
        """Print a summary of all states"""
        print("\n" + "="*60)
        print("STATE ANALYSIS SUMMARY")
        print("="*60)
        
        state_counts = self.analyze_states()
        if not state_counts:
            print("❌ No data found")
            return
            
        # Sort by file count
        sorted_states = sorted(state_counts.items(), key=lambda x: x[1])
        
        print(f"{'State':<20} {'Files':<8} {'Status'}")
        print("-" * 60)
        
        for state, count in sorted_states:
            if count == 0:
                status = "❌ EMPTY"
            elif count < 10:
                status = "⚠️  CRITICAL"
            elif count < self.min_files_threshold:
                status = "⚠️  LOW"
            else:
                status = "✅ GOOD"
                
            print(f"{state:<20} {count:<8} {status}")
            
        total_files = sum(state_counts.values())
        total_states = len(state_counts)
        avg_files = total_files / total_states if total_states > 0 else 0
        
        print("-" * 60)
        print(f"Total files: {total_files}")
        print(f"Total states: {total_states}")
        print(f"Average files per state: {avg_files:.1f}")
        print("="*60)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Fix incomplete states in scraper")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be done without actually doing it")
    parser.add_argument("--state", help="Fix a specific state only")
    parser.add_argument("--min-files", type=int, default=20, help="Minimum files per state (default: 20)")
    parser.add_argument("--max-files", type=int, default=100, help="Maximum files to scrape per state (default: 100)")
    parser.add_argument("--summary", action="store_true", help="Show summary only")
    
    args = parser.parse_args()
    
    fixer = IncompleteStateFixer()
    fixer.min_files_threshold = args.min_files
    fixer.max_files_per_state = args.max_files
    
    if args.summary:
        fixer.print_summary()
        return
        
    if args.state:
        # Fix specific state
        state_counts = fixer.analyze_states()
        current_count = state_counts.get(args.state, 0)
        print(f"🔍 State {args.state}: {current_count} files")
        
        if current_count < args.min_files:
            success = fixer.fix_state(args.state, args.max_files)
            if success:
                print(f"✅ Fixed {args.state}")
            else:
                print(f"❌ Failed to fix {args.state}")
        else:
            print(f"✅ {args.state} already has sufficient files")
    else:
        # Fix all incomplete states
        results = fixer.fix_all_incomplete_states(dry_run=args.dry_run)
        
        if results:
            print(f"\n📊 Results Summary:")
            successful = sum(1 for success in results.values() if success)
            total = len(results)
            print(f"   ✅ Successful: {successful}/{total}")
            print(f"   ❌ Failed: {total - successful}/{total}")
        
        # Show final summary
        fixer.print_summary()

if __name__ == "__main__":
    main()
