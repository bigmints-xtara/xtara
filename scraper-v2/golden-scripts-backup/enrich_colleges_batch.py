#!/usr/bin/env python3
"""
Batch College Data Enrichment Script
===================================

Processes colleges in batches of 10 with 10-second delays between batches.
Shows individual file statistics and supports stop/resume functionality.
"""

import json
import os
import sys
import time
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# Import our modules
from final_enrichment_script import FinalEnrichmentProcessor

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('batch_enrichment.log'),
        logging.StreamHandler()
    ]
)

class BatchEnrichmentProcessor:
    """Batch enrichment processor with rate limiting"""
    
    def __init__(self, 
                 input_dir="all-college-data", 
                 output_dir="/Users/pretheesh/Projects/project-xtara/scraper-v2/college-data-courses-refined",
                 batch_size=10,
                 delay_seconds=10):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.batch_size = batch_size
        self.delay_seconds = delay_seconds
        
        # Initialize processor
        self.processor = FinalEnrichmentProcessor(input_dir, output_dir, 1)
        
        # Statistics
        self.stats = {
            'total_files': 0,
            'processed_files': 0,
            'successful_files': 0,
            'failed_files': 0,
            'total_courses_before': 0,
            'total_courses_after': 0,
            'total_improvement': 0,
            'start_time': None,
            'current_batch': 0,
            'total_batches': 0
        }
        
        # Progress tracking
        self.progress_file = Path("batch_enrichment_progress.json")
        
        # Create output directory
        self.output_dir.mkdir(exist_ok=True)
        
        logging.info(f"Initialized BatchEnrichmentProcessor")
        logging.info(f"Batch size: {self.batch_size}")
        logging.info(f"Delay between batches: {self.delay_seconds} seconds")

    def load_progress(self):
        """Load progress from previous session"""
        if self.progress_file.exists():
            with open(self.progress_file, 'r') as f:
                progress = json.load(f)
                # Convert start_time back to datetime if it exists
                if progress.get('start_time'):
                    from datetime import datetime
                    progress['start_time'] = datetime.fromisoformat(progress['start_time'])
                self.stats.update(progress)
                logging.info(f"Resumed from batch {self.stats['current_batch']}/{self.stats['total_batches']}")
                return True
        return False

    def save_progress(self):
        """Save current progress"""
        # Convert datetime to string for JSON serialization
        stats_to_save = self.stats.copy()
        if stats_to_save.get('start_time'):
            stats_to_save['start_time'] = stats_to_save['start_time'].isoformat()
        
        with open(self.progress_file, 'w') as f:
            json.dump(stats_to_save, f, indent=2)

    def get_all_files(self) -> List[Path]:
        """Get all college files"""
        files = []
        for file_path in self.input_dir.rglob("*.json"):
            if file_path.is_file():
                files.append(file_path)
        return sorted(files)

    def process_single_file(self, file_path: Path) -> Dict:
        """Process a single college file"""
        try:
            logging.info(f"Processing: {file_path.name}")
            
            result = self.processor.process_single_college(file_path)
            
            # Update statistics
            self.stats['processed_files'] += 1
            self.stats['total_courses_before'] += result.get('courses_before', 0)
            self.stats['total_courses_after'] += result.get('courses_after', 0)
            self.stats['total_improvement'] += result.get('improvement_score', 0)
            
            if result['status'] == 'success':
                self.stats['successful_files'] += 1
                logging.info(f"✅ Success: {file_path.name}")
            else:
                self.stats['failed_files'] += 1
                logging.error(f"❌ Failed: {file_path.name}")
            
            # Print individual file statistics
            self.print_file_stats(result)
            
            return result
            
        except Exception as e:
            logging.error(f"Error processing {file_path}: {str(e)}")
            self.stats['failed_files'] += 1
            self.stats['processed_files'] += 1
            return {
                'file': str(file_path),
                'status': 'failed',
                'error': str(e),
                'courses_before': 0,
                'courses_after': 0,
                'improvement_score': 0
            }

    def print_file_stats(self, result: Dict):
        """Print individual file statistics"""
        file_name = Path(result['file']).name
        courses_before = result.get('courses_before', 0)
        courses_after = result.get('courses_after', 0)
        improvement = result.get('improvement_score', 0)
        status = result['status']
        
        print()
        print("┌─────────────────────────────────────────────────────────────┐")
        print("│                    FILE PROCESSING STATS                   │")
        print("├─────────────────────────────────────────────────────────────┤")
        print(f"│ File: {file_name:<50} │")
        print(f"│ Status: {status:<47} │")
        print(f"│ Courses Before: {courses_before:<42} │")
        print(f"│ Courses After: {courses_after:<43} │")
        print(f"│ Improvement: +{improvement:<45} │")
        print(f"│ Progress: {self.stats['processed_files']}/{self.stats['total_files']:<46} │")
        success_rate = (self.stats['successful_files'] * 100 // self.stats['processed_files']) if self.stats['processed_files'] > 0 else 0
        print(f"│ Success Rate: {success_rate}%{'':<42} │")
        print("└─────────────────────────────────────────────────────────────┘")
        print()

    def print_batch_stats(self, batch_num: int, batch_files: List[Path]):
        """Print batch statistics"""
        print()
        print("╔════════════════════════════════════════════════════════════════════════════════╗")
        print("║                              BATCH STATISTICS                                ║")
        print("╠════════════════════════════════════════════════════════════════════════════════╣")
        print(f"║ Batch: {batch_num}/{self.stats['total_batches']:<65} ║")
        print(f"║ Files in Batch: {len(batch_files):<60} ║")
        print(f"║ Total Processed: {self.stats['processed_files']}/{self.stats['total_files']:<58} ║")
        success_rate = (self.stats['successful_files'] * 100 // self.stats['processed_files']) if self.stats['processed_files'] > 0 else 0
        print(f"║ Success Rate: {success_rate}%{'':<62} ║")
        print(f"║ Total Courses Before: {self.stats['total_courses_before']:<52} ║")
        print(f"║ Total Courses After: {self.stats['total_courses_after']:<53} ║")
        print(f"║ Total Improvement: +{self.stats['total_improvement']:<58} ║")
        elapsed_time = datetime.now() - self.stats['start_time'] if self.stats['start_time'] else datetime.now() - datetime.now()
        print(f"║ Elapsed Time: {str(elapsed_time).split('.')[0]:<62} ║")
        print("╚════════════════════════════════════════════════════════════════════════════════╝")
        print()

    def process_batch(self, batch_files: List[Path], batch_num: int):
        """Process a batch of files"""
        logging.info(f"Processing batch {batch_num} with {len(batch_files)} files")
        
        for file_path in batch_files:
            self.process_single_file(file_path)
            self.save_progress()
        
        self.print_batch_stats(batch_num, batch_files)

    def process_all_batches(self):
        """Process all files in batches"""
        # Load progress if exists
        self.load_progress()
        
        # Get all files
        all_files = self.get_all_files()
        self.stats['total_files'] = len(all_files)
        self.stats['total_batches'] = (len(all_files) + self.batch_size - 1) // self.batch_size
        
        if not all_files:
            logging.error("No files found to process")
            return
        
        # Start processing
        self.stats['start_time'] = datetime.now()
        logging.info(f"Starting batch processing: {len(all_files)} files in {self.stats['total_batches']} batches")
        
        # Process files in batches
        for i in range(self.stats['current_batch'], self.stats['total_batches']):
            start_idx = i * self.batch_size
            end_idx = min(start_idx + self.batch_size, len(all_files))
            batch_files = all_files[start_idx:end_idx]
            
            self.stats['current_batch'] = i + 1
            
            try:
                # Process batch
                self.process_batch(batch_files, i + 1)
                
                # Wait between batches (except for the last batch)
                if i < self.stats['total_batches'] - 1:
                    logging.info(f"Waiting {self.delay_seconds} seconds before next batch...")
                    time.sleep(self.delay_seconds)
                
            except KeyboardInterrupt:
                logging.info("Process interrupted by user")
                self.save_progress()
                print(f"\n⚠️  Process interrupted. Progress saved.")
                print(f"Resume with: python3 enrich_colleges_batch.py --resume")
                return
            except Exception as e:
                logging.error(f"Error in batch {i + 1}: {str(e)}")
                continue
        
        # Final statistics
        self.print_final_stats()
        
        # Clean up progress file
        if self.progress_file.exists():
            self.progress_file.unlink()
        
        logging.info("Batch processing completed!")

    def print_final_stats(self):
        """Print final statistics"""
        elapsed_time = datetime.now() - self.stats['start_time'] if self.stats['start_time'] else datetime.now() - datetime.now()
        
        print()
        print("╔════════════════════════════════════════════════════════════════════════════════╗")
        print("║                              FINAL STATISTICS                                ║")
        print("╠════════════════════════════════════════════════════════════════════════════════╣")
        print(f"║ Total Files: {self.stats['total_files']:<65} ║")
        print(f"║ Processed: {self.stats['processed_files']:<67} ║")
        print(f"║ Successful: {self.stats['successful_files']:<65} ║")
        print(f"║ Failed: {self.stats['failed_files']:<69} ║")
        success_rate = (self.stats['successful_files'] * 100 // self.stats['processed_files']) if self.stats['processed_files'] > 0 else 0
        print(f"║ Success Rate: {success_rate}%{'':<62} ║")
        print(f"║ Total Courses Before: {self.stats['total_courses_before']:<52} ║")
        print(f"║ Total Courses After: {self.stats['total_courses_after']:<53} ║")
        print(f"║ Total Improvement: +{self.stats['total_improvement']:<58} ║")
        print(f"║ Elapsed Time: {str(elapsed_time).split('.')[0]:<62} ║")
        print("╚════════════════════════════════════════════════════════════════════════════════╝")
        print()

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Batch College Data Enrichment')
    parser.add_argument('--batch-size', type=int, default=10, help='Number of files per batch')
    parser.add_argument('--delay', type=int, default=10, help='Delay between batches in seconds')
    parser.add_argument('--resume', action='store_true', help='Resume from previous session')
    parser.add_argument('--clean', action='store_true', help='Clean progress and start fresh')
    
    args = parser.parse_args()
    
    if args.clean:
        progress_file = Path("batch_enrichment_progress.json")
        if progress_file.exists():
            progress_file.unlink()
            print("Progress file cleaned")
        return
    
    # Initialize processor
    processor = BatchEnrichmentProcessor(
        batch_size=args.batch_size,
        delay_seconds=args.delay
    )
    
    # Process all batches
    processor.process_all_batches()

if __name__ == "__main__":
    main()
