#!/usr/bin/env python3
"""
College Data Extractor
======================

Extracts comprehensive college information from Collegedunia pages.
This includes all fields needed for the college.json data model.
"""

import requests
import json
import re
import time
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Any
from datetime import datetime

class CollegeDataExtractor:
    """Extracts comprehensive college data from Collegedunia pages"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def extract_college_data(self, college_url: str) -> Dict[str, Any]:
        """Extract comprehensive college data from a Collegedunia page"""
        try:
            response = requests.get(college_url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Initialize college data structure
            college_data = {
                'name': '',
                'aka': [],
                'state': '',
                'district': '',
                'city': '',
                'address': '',
                'contacts': {
                    'phone': [],
                    'email': [],
                    'website': []
                },
                'accreditations': [],
                'affiliations': [],
                'campus_size': None,
                'courses': [],
                'entrance_exams': [],
                'fees': None,
                'placements': [],
                'rankings': [],
                'scholarships': [],
                'notable_alumni': [],
                'enrichment_score': 0,
                'url': college_url,
                'enrichment_metadata': {
                    'processed_at': datetime.now().isoformat(),
                    'extractor_version': 'v1.0'
                }
            }
            
            # Extract basic information
            self._extract_basic_info(soup, college_data)
            
            # Extract contact information
            self._extract_contact_info(soup, college_data)
            
            # Extract accreditations and affiliations
            self._extract_accreditations(soup, college_data)
            
            # Extract campus information
            self._extract_campus_info(soup, college_data)
            
            # Extract entrance exams
            self._extract_entrance_exams(soup, college_data)
            
            # Extract fees information
            self._extract_fees_info(soup, college_data)
            
            # Extract placement information
            self._extract_placement_info(soup, college_data)
            
            # Extract rankings
            self._extract_rankings(soup, college_data)
            
            # Extract scholarships
            self._extract_scholarships(soup, college_data)
            
            # Extract notable alumni
            self._extract_notable_alumni(soup, college_data)
            
            return college_data
            
        except Exception as e:
            print(f"Error extracting college data from {college_url}: {str(e)}")
            return {}
    
    def _extract_basic_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract basic college information"""
        try:
            # College name
            name_elem = soup.find('h1', class_='college-name') or soup.find('h1')
            if name_elem:
                college_data['name'] = name_elem.get_text(strip=True)
            
            # State, District, City from breadcrumbs or location info
            breadcrumbs = soup.find('nav', class_='breadcrumb') or soup.find('ol', class_='breadcrumb')
            if breadcrumbs:
                breadcrumb_links = breadcrumbs.find_all('a')
                if len(breadcrumb_links) >= 2:
                    college_data['state'] = breadcrumb_links[-1].get_text(strip=True)
                if len(breadcrumb_links) >= 3:
                    college_data['district'] = breadcrumb_links[-2].get_text(strip=True)
            
            # Address
            address_elem = soup.find('div', class_='address') or soup.find('p', class_='address')
            if address_elem:
                college_data['address'] = address_elem.get_text(strip=True)
            
        except Exception as e:
            print(f"Error extracting basic info: {str(e)}")
    
    def _extract_contact_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract contact information"""
        try:
            # Phone numbers
            phone_pattern = r'(\+?91[\s-]?)?[6-9]\d{9}'
            phone_matches = re.findall(phone_pattern, soup.get_text())
            college_data['contacts']['phone'] = list(set(phone_matches))
            
            # Email addresses
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            email_matches = re.findall(email_pattern, soup.get_text())
            college_data['contacts']['email'] = list(set(email_matches))
            
            # Website
            website_links = soup.find_all('a', href=re.compile(r'^https?://'))
            websites = []
            for link in website_links:
                href = link.get('href', '')
                if 'collegedunia.com' not in href and 'facebook.com' not in href and 'twitter.com' not in href:
                    websites.append(href)
            college_data['contacts']['website'] = list(set(websites))[:5]  # Limit to 5
            
        except Exception as e:
            print(f"Error extracting contact info: {str(e)}")
    
    def _extract_accreditations(self, soup: BeautifulSoup, college_data: Dict):
        """Extract accreditations and affiliations"""
        try:
            # Look for accreditation information
            accreditations = []
            affiliations = []
            
            # Common accreditation patterns
            acc_patterns = [
                r'NAAC\s*[A-Z+]*',
                r'AICTE',
                r'UGC',
                r'NIRF',
                r'NBA',
                r'ABET',
                r'ISO\s*\d+'
            ]
            
            text_content = soup.get_text()
            for pattern in acc_patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                accreditations.extend(matches)
            
            # Look for university affiliations
            affiliation_patterns = [
                r'Affiliated to\s+([^,\n]+)',
                r'University of\s+([^,\n]+)',
                r'Deemed University',
                r'Central University',
                r'State University'
            ]
            
            for pattern in affiliation_patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                affiliations.extend(matches)
            
            college_data['accreditations'] = list(set(accreditations))
            college_data['affiliations'] = list(set(affiliations))
            
        except Exception as e:
            print(f"Error extracting accreditations: {str(e)}")
    
    def _extract_campus_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract campus information"""
        try:
            # Campus size
            campus_text = soup.get_text()
            size_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:acres?|hectares?)', campus_text, re.IGNORECASE)
            if size_match:
                college_data['campus_size'] = size_match.group(1) + ' acres'
            
        except Exception as e:
            print(f"Error extracting campus info: {str(e)}")
    
    def _extract_entrance_exams(self, soup: BeautifulSoup, college_data: Dict):
        """Extract entrance exams"""
        try:
            entrance_exams = []
            
            # Common entrance exam patterns
            exam_patterns = [
                r'JEE\s*Main',
                r'JEE\s*Advanced',
                r'NEET',
                r'CAT',
                r'MAT',
                r'XAT',
                r'CMAT',
                r'GATE',
                r'UPSC',
                r'GATE',
                r'BITSAT',
                r'VITEEE',
                r'SRMJEE',
                r'WBJEE',
                r'KCET',
                r'MHT\s*CET',
                r'TS\s*EAMCET',
                r'AP\s*EAMCET'
            ]
            
            text_content = soup.get_text()
            for pattern in exam_patterns:
                matches = re.findall(pattern, text_content, re.IGNORECASE)
                entrance_exams.extend(matches)
            
            college_data['entrance_exams'] = list(set(entrance_exams))
            
        except Exception as e:
            print(f"Error extracting entrance exams: {str(e)}")
    
    def _extract_fees_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract fees information"""
        try:
            fees_info = None
            
            # Look for fees information
            fees_text = soup.get_text()
            fees_match = re.search(r'fees?\s*:?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:to\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?))?', fees_text, re.IGNORECASE)
            
            if fees_match:
                from_fee = fees_match.group(1).replace(',', '')
                to_fee = fees_match.group(2).replace(',', '') if fees_match.group(2) else from_fee
                
                fees_info = {
                    'from': int(from_fee),
                    'to': int(to_fee)
                }
            
            college_data['fees'] = fees_info
            
        except Exception as e:
            print(f"Error extracting fees info: {str(e)}")
    
    def _extract_placement_info(self, soup: BeautifulSoup, college_data: Dict):
        """Extract placement information"""
        try:
            placements = []
            
            # Look for placement statistics
            placement_text = soup.get_text()
            
            # Average package
            avg_package_match = re.search(r'average\s+package\s*:?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|L)', placement_text, re.IGNORECASE)
            if avg_package_match:
                placements.append(f"Average Package: ₹{avg_package_match.group(1)} LPA")
            
            # Highest package
            highest_package_match = re.search(r'highest\s+package\s*:?\s*₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|L)', placement_text, re.IGNORECASE)
            if highest_package_match:
                placements.append(f"Highest Package: ₹{highest_package_match.group(1)} LPA")
            
            # Placement percentage
            placement_percent_match = re.search(r'placement\s+percentage\s*:?\s*(\d+(?:\.\d+)?)%', placement_text, re.IGNORECASE)
            if placement_percent_match:
                placements.append(f"Placement Percentage: {placement_percent_match.group(1)}%")
            
            college_data['placements'] = placements
            
        except Exception as e:
            print(f"Error extracting placement info: {str(e)}")
    
    def _extract_rankings(self, soup: BeautifulSoup, college_data: Dict):
        """Extract rankings"""
        try:
            rankings = []
            
            # Look for ranking information
            ranking_text = soup.get_text()
            
            # NIRF rankings
            nirf_match = re.search(r'NIRF\s*rank\s*:?\s*(\d+)', ranking_text, re.IGNORECASE)
            if nirf_match:
                rankings.append(f"NIRF Rank: {nirf_match.group(1)}")
            
            # Other rankings
            rank_patterns = [
                r'ranked\s*#?(\d+)',
                r'rank\s*:?\s*(\d+)',
                r'position\s*:?\s*(\d+)'
            ]
            
            for pattern in rank_patterns:
                matches = re.findall(pattern, ranking_text, re.IGNORECASE)
                rankings.extend([f"Rank: {match}" for match in matches])
            
            college_data['rankings'] = list(set(rankings))
            
        except Exception as e:
            print(f"Error extracting rankings: {str(e)}")
    
    def _extract_scholarships(self, soup: BeautifulSoup, college_data: Dict):
        """Extract scholarship information"""
        try:
            scholarships = []
            
            # Look for scholarship information
            scholarship_text = soup.get_text()
            
            # Common scholarship patterns
            scholarship_patterns = [
                r'merit\s+scholarship',
                r'need\s+based\s+scholarship',
                r'government\s+scholarship',
                r'private\s+scholarship',
                r'full\s+tuition\s+waiver',
                r'partial\s+scholarship'
            ]
            
            for pattern in scholarship_patterns:
                if re.search(pattern, scholarship_text, re.IGNORECASE):
                    scholarships.append(pattern.replace('\\s+', ' ').title())
            
            college_data['scholarships'] = list(set(scholarships))
            
        except Exception as e:
            print(f"Error extracting scholarships: {str(e)}")
    
    def _extract_notable_alumni(self, soup: BeautifulSoup, college_data: Dict):
        """Extract notable alumni information"""
        try:
            alumni = []
            
            # Look for alumni section
            alumni_section = soup.find('section', class_='alumni') or soup.find('div', class_='alumni')
            if alumni_section:
                alumni_names = alumni_section.find_all(['h3', 'h4', 'p'])
                for name_elem in alumni_names:
                    name = name_elem.get_text(strip=True)
                    if name and len(name) > 3:  # Basic validation
                        alumni.append(name)
            
            college_data['notable_alumni'] = alumni[:10]  # Limit to 10
            
        except Exception as e:
            print(f"Error extracting notable alumni: {str(e)}")

# Test the extractor
if __name__ == "__main__":
    extractor = CollegeDataExtractor()
    
    # Test with a sample URL
    test_url = "https://collegedunia.com/college/18595-scms-school-of-technology-and-management-sstm-kochi"
    
    print("Testing College Data Extractor...")
    print(f"URL: {test_url}")
    
    college_data = extractor.extract_college_data(test_url)
    
    if college_data:
        print("\n✅ Successfully extracted college data:")
        print(f"Name: {college_data.get('name', 'N/A')}")
        print(f"State: {college_data.get('state', 'N/A')}")
        print(f"Address: {college_data.get('address', 'N/A')}")
        print(f"Phone: {college_data.get('contacts', {}).get('phone', [])}")
        print(f"Email: {college_data.get('contacts', {}).get('email', [])}")
        print(f"Accreditations: {college_data.get('accreditations', [])}")
        print(f"Affiliations: {college_data.get('affiliations', [])}")
        print(f"Entrance Exams: {college_data.get('entrance_exams', [])}")
        print(f"Fees: {college_data.get('fees', 'N/A')}")
        print(f"Placements: {college_data.get('placements', [])}")
        print(f"Rankings: {college_data.get('rankings', [])}")
        print(f"Scholarships: {college_data.get('scholarships', [])}")
        print(f"Notable Alumni: {college_data.get('notable_alumni', [])}")
    else:
        print("❌ Failed to extract college data")
