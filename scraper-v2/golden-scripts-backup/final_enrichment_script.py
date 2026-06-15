#!/usr/bin/env python3
"""
Final Enrichment Script
=======================

Complete script to enrich all college documents using corrected crawler and course standardization.
This script processes all 2,794 colleges with enhanced course extraction and standardization.
"""

import json
import os
import sys
import time
import logging
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional

# Import our modules
from corrected_crawler import CorrectedCrawler
from course_standardization_rules import CourseStandardizer, StandardizedCourse

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('final_enrichment.log'),
        logging.StreamHandler()
    ]
)

class FinalEnrichmentProcessor:
    """Final enrichment processor that combines corrected crawling with standardization"""
    
    def __init__(self, 
                 input_dir="all-college-data", 
                 output_dir="/Users/pretheesh/Projects/project-xtara/scraper-v2/college-data-courses-refined",
                 max_workers=5):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.max_workers = max_workers
        
        # Initialize components
        self.crawler = CorrectedCrawler(input_dir, output_dir)
        self.standardizer = CourseStandardizer()
        
        # Statistics
        self.stats = {
            'total_processed': 0,
            'successful': 0,
            'failed': 0,
            'total_courses_extracted': 0,
            'total_courses_standardized': 0,
            'improvement_scores': [],
            'start_time': None,
            'end_time': None
        }
        
        # Create output directory
        self.output_dir.mkdir(exist_ok=True)
        
        logging.info(f"Initialized FinalEnrichmentProcessor")
        logging.info(f"Input directory: {self.input_dir}")
        logging.info(f"Output directory: {self.output_dir}")
        logging.info(f"Max workers: {self.max_workers}")

    def process_single_college(self, file_path: Path) -> Dict:
        """Process a single college file with full enrichment pipeline"""
        try:
            logging.info(f"Processing: {file_path.name}")
            
            # Load original data
            original_data = self.crawler.load_college_data(str(file_path))
            if not original_data:
                return {
                    'file': str(file_path),
                    'status': 'failed',
                    'error': 'Failed to load original data',
                    'courses_before': 0,
                    'courses_after': 0,
                    'improvement_score': 0
                }
            
            # Extract courses using corrected crawler
            courses_before = len(original_data.get('courses', []))
            
            # Get college URL for enhanced crawling
            college_url = original_data.get('url', '')
            if not college_url:
                college_url = original_data.get('college_url', '')
            if not college_url:
                college_url = f"https://collegedunia.com/college/{original_data.get('college_id', '')}"
            
            # Use corrected crawler to get enhanced courses from live website
            enhanced_courses = self.crawler.extract_courses_from_url(college_url)
            
            if not enhanced_courses:
                # Fallback to original courses if enhanced extraction fails
                enhanced_courses = original_data.get('courses', [])
            
            courses_after = len(enhanced_courses)
            improvement_score = courses_after - courses_before
            
            # Standardize courses using our standardization rules
            standardized_courses = self.standardizer.standardize_courses_batch(enhanced_courses)
            
            # Create enriched data structure
            enriched_data = original_data.copy()
            enriched_data['courses'] = []
            
            # Convert standardized courses to dictionary format
            for course in standardized_courses:
                course_dict = {
                    'title': course.title,
                    'name': course.name,
                    'specialization': course.specialization,
                    'stream': course.stream,
                    'type': course.type,
                    'duration': course.duration,
                    'fees': course.fees,
                    'entrance_exams': course.entrance_exams,
                    'seats': course.seats
                }
                enriched_data['courses'].append(course_dict)
            
            # Add enrichment metadata
            enriched_data['enrichment_metadata'] = {
                'processed_at': datetime.now().isoformat(),
                'courses_before': courses_before,
                'courses_after': courses_after,
                'improvement_score': improvement_score,
                'standardization_applied': True,
                'crawler_version': 'corrected_v2',
                'standardizer_version': 'v1.0'
            }
            
            # Save enriched data
            output_file = self.output_dir / file_path.relative_to(self.input_dir)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(enriched_data, f, indent=2, ensure_ascii=False)
            
            return {
                'file': str(file_path),
                'status': 'success',
                'courses_before': courses_before,
                'courses_after': courses_after,
                'improvement_score': improvement_score,
                'standardized_courses': len(standardized_courses),
                'output_file': str(output_file)
            }
            
        except Exception as e:
            logging.error(f"Error processing {file_path}: {str(e)}")
            return {
                'file': str(file_path),
                'status': 'failed',
                'error': str(e),
                'courses_before': 0,
                'courses_after': 0,
                'improvement_score': 0
            }

    def process_all_colleges(self) -> Dict:
        """Process all colleges with parallel processing"""
        logging.info("Starting final enrichment process...")
        self.stats['start_time'] = datetime.now()
        
        # Get all college files
        college_files = list(self.input_dir.rglob("*.json"))
        total_files = len(college_files)
        
        logging.info(f"Found {total_files} college files to process")
        
        # Process files in parallel
        results = []
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all tasks
            future_to_file = {
                executor.submit(self.process_single_college, file_path): file_path 
                for file_path in college_files
            }
            
            # Process completed tasks
            for future in as_completed(future_to_file):
                file_path = future_to_file[future]
                try:
                    result = future.result()
                    results.append(result)
                    
                    # Update statistics
                    self.stats['total_processed'] += 1
                    if result['status'] == 'success':
                        self.stats['successful'] += 1
                        self.stats['total_courses_extracted'] += result['courses_after']
                        self.stats['total_courses_standardized'] += result['standardized_courses']
                        self.stats['improvement_scores'].append(result['improvement_score'])
                    else:
                        self.stats['failed'] += 1
                    
                    # Log progress
                    if self.stats['total_processed'] % 100 == 0:
                        logging.info(f"Processed {self.stats['total_processed']}/{total_files} files")
                        logging.info(f"Success: {self.stats['successful']}, Failed: {self.stats['failed']}")
                    
                except Exception as e:
                    logging.error(f"Error processing {file_path}: {str(e)}")
                    self.stats['failed'] += 1
                    results.append({
                        'file': str(file_path),
                        'status': 'failed',
                        'error': str(e)
                    })
        
        self.stats['end_time'] = datetime.now()
        
        # Generate final report
        self.generate_final_report(results)
        
        return {
            'results': results,
            'stats': self.stats
        }

    def generate_final_report(self, results: List[Dict]):
        """Generate comprehensive final report"""
        logging.info("Generating final report...")
        
        # Calculate additional statistics
        successful_results = [r for r in results if r['status'] == 'success']
        failed_results = [r for r in results if r['status'] == 'failed']
        
        total_improvement = sum(r['improvement_score'] for r in successful_results)
        avg_improvement = total_improvement / len(successful_results) if successful_results else 0
        
        # Create report
        report = {
            'enrichment_summary': {
                'total_files_processed': self.stats['total_processed'],
                'successful_enrichments': self.stats['successful'],
                'failed_enrichments': self.stats['failed'],
                'success_rate': f"{(self.stats['successful'] / self.stats['total_processed'] * 100):.2f}%",
                'total_courses_extracted': self.stats['total_courses_extracted'],
                'total_courses_standardized': self.stats['total_courses_standardized'],
                'average_improvement_per_college': f"{avg_improvement:.2f}",
                'total_improvement_score': total_improvement
            },
            'processing_time': {
                'start_time': self.stats['start_time'].isoformat(),
                'end_time': self.stats['end_time'].isoformat(),
                'total_duration': str(self.stats['end_time'] - self.stats['start_time'])
            },
            'improvement_distribution': {
                'positive_improvements': len([r for r in successful_results if r['improvement_score'] > 0]),
                'zero_improvements': len([r for r in successful_results if r['improvement_score'] == 0]),
                'negative_improvements': len([r for r in successful_results if r['improvement_score'] < 0]),
                'max_improvement': max([r['improvement_score'] for r in successful_results]) if successful_results else 0,
                'min_improvement': min([r['improvement_score'] for r in successful_results]) if successful_results else 0
            },
            'failed_files': [
                {
                    'file': r['file'],
                    'error': r.get('error', 'Unknown error')
                } for r in failed_results
            ],
            'top_improvements': sorted(
                [r for r in successful_results if r['improvement_score'] > 0],
                key=lambda x: x['improvement_score'],
                reverse=True
            )[:10]
        }
        
        # Save report
        report_file = self.output_dir / 'enrichment_report.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Print summary
        print("\n" + "="*80)
        print("FINAL ENRICHMENT REPORT")
        print("="*80)
        print(f"Total files processed: {self.stats['total_processed']}")
        print(f"Successful enrichments: {self.stats['successful']}")
        print(f"Failed enrichments: {self.stats['failed']}")
        print(f"Success rate: {(self.stats['successful'] / self.stats['total_processed'] * 100):.2f}%")
        print(f"Total courses extracted: {self.stats['total_courses_extracted']}")
        print(f"Total courses standardized: {self.stats['total_courses_standardized']}")
        print(f"Average improvement per college: {avg_improvement:.2f}")
        print(f"Total improvement score: {total_improvement}")
        print(f"Processing time: {self.stats['end_time'] - self.stats['start_time']}")
        print("="*80)
        
        logging.info(f"Final report saved to: {report_file}")

def main():
    """Main function to run the final enrichment process"""
    print("Starting Final Enrichment Process...")
    print("="*50)
    
    # Initialize processor
    processor = FinalEnrichmentProcessor(
        input_dir="all-college-data",
        output_dir="final-enriched-data",
        max_workers=5
    )
    
    # Process all colleges
    results = processor.process_all_colleges()
    
    print("\nFinal enrichment process completed!")
    print(f"Results saved to: {processor.output_dir}")
    print(f"Report saved to: {processor.output_dir}/enrichment_report.json")

if __name__ == "__main__":
    main()
