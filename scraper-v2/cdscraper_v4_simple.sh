#!/bin/bash

# CDScraper v4 Simple - Using Golden Scripts Directly
# ==================================================
# Scrapes 10 pages (100 records) from each state's science colleges
# Uses the exact same logic as enrich_colleges_batch.py for perfect compatibility

set -e

# Configuration
BASE_URL="https://collegedunia.com/science"
PAGES_PER_STATE=10
RECORDS_PER_PAGE=10
TOTAL_RECORDS_PER_STATE=100
DELAY_BETWEEN_REQUESTS=2
DELAY_BETWEEN_PAGES=5
DELAY_BETWEEN_STATES=10

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/new-college-data"
PROGRESS_FILE="$SCRIPT_DIR/cdscraper_progress.json"
LOG_FILE="$SCRIPT_DIR/cdscraper.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Indian states
STATES=(
    "andhra-pradesh" "arunachal-pradesh" "assam" "bihar" "chhattisgarh"
    "goa" "gujarat" "haryana" "himachal-pradesh" "jharkhand"
    "karnataka" "kerala" "madhya-pradesh" "maharashtra" "manipur"
    "meghalaya" "mizoram" "nagaland" "odisha" "punjab"
    "rajasthan" "sikkim" "tamil-nadu" "telangana" "tripura"
    "uttar-pradesh" "uttarakhand" "west-bengal" "delhi" "chandigarh"
    "dadra-and-nagar-haveli" "daman-and-diu" "lakshadweep" "puducherry"
)

# Initialize progress tracking
init_progress() {
    if [[ ! -f "$PROGRESS_FILE" ]]; then
        cat > "$PROGRESS_FILE" << EOF
{
    "current_state": 0,
    "total_states": ${#STATES[@]},
    "current_page": 1,
    "total_pages": $PAGES_PER_STATE,
    "processed_colleges": 0,
    "successful_colleges": 0,
    "failed_colleges": 0,
    "duplicate_colleges": 0,
    "start_time": null,
    "last_state": "",
    "last_page": 0
}
EOF
    fi
}

# Load progress
load_progress() {
    if [[ -f "$PROGRESS_FILE" ]]; then
        CURRENT_STATE=$(jq -r '.current_state' "$PROGRESS_FILE")
        CURRENT_PAGE=$(jq -r '.current_page' "$PROGRESS_FILE")
        PROCESSED_COLLEGES=$(jq -r '.processed_colleges' "$PROGRESS_FILE")
        SUCCESSFUL_COLLEGES=$(jq -r '.successful_colleges' "$PROGRESS_FILE")
        FAILED_COLLEGES=$(jq -r '.failed_colleges' "$PROGRESS_FILE")
        DUPLICATE_COLLEGES=$(jq -r '.duplicate_colleges' "$PROGRESS_FILE")
        START_TIME=$(jq -r '.start_time' "$PROGRESS_FILE")
        LAST_STATE=$(jq -r '.last_state' "$PROGRESS_FILE")
        LAST_PAGE=$(jq -r '.last_page' "$PROGRESS_FILE")
        
        if [[ "$START_TIME" != "null" ]]; then
            START_TIME=$(date -d "$START_TIME" +%s)
        else
            START_TIME=$(date +%s)
        fi
    else
        CURRENT_STATE=0
        CURRENT_PAGE=1
        PROCESSED_COLLEGES=0
        SUCCESSFUL_COLLEGES=0
        FAILED_COLLEGES=0
        DUPLICATE_COLLEGES=0
        START_TIME=$(date +%s)
        LAST_STATE=""
        LAST_PAGE=0
    fi
}

# Save progress
save_progress() {
    cat > "$PROGRESS_FILE" << EOF
{
    "current_state": $CURRENT_STATE,
    "total_states": ${#STATES[@]},
    "current_page": $CURRENT_PAGE,
    "total_pages": $PAGES_PER_STATE,
    "processed_colleges": $PROCESSED_COLLEGES,
    "successful_colleges": $SUCCESSFUL_COLLEGES,
    "failed_colleges": $FAILED_COLLEGES,
    "duplicate_colleges": $DUPLICATE_COLLEGES,
    "start_time": "$(date -d "@$START_TIME" -Iseconds)",
    "last_state": "$LAST_STATE",
    "last_page": $LAST_PAGE
}
EOF
}

# Log function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Check if college already exists
check_duplicate() {
    local college_id=$1
    local state=$2
    
    # Check in all-college-data folder
    if find "$SCRIPT_DIR/all-college-data" -name "*${college_id}*" -type f | grep -q .; then
        return 0  # Duplicate found
    fi
    
    # Check in new-college-data folder
    if find "$OUTPUT_DIR" -name "*${college_id}*" -type f | grep -q .; then
        return 0  # Duplicate found
    fi
    
    return 1  # No duplicate
}

# Scrape college details using golden scripts
scrape_college_details_golden() {
    local college_url=$1
    local college_id=$2
    local state=$3
    
    log "Scraping college details: $college_url"
    
    # First, extract comprehensive college data using our extractor
    python3 -c "
import sys
sys.path.append('$SCRIPT_DIR')
from college_data_extractor import CollegeDataExtractor
import json

# Extract comprehensive college data
extractor = CollegeDataExtractor()
college_data = extractor.extract_college_data('$college_url')

if college_data and college_data.get('name'):
    # Add college_id and ensure state is set
    college_data['college_id'] = '$college_id'
    college_data['state'] = '$state'
    
    # Save the comprehensive data
    with open('$SCRIPT_DIR/temp_college_input.json', 'w') as f:
        json.dump(college_data, f, indent=2)
    print('EXTRACTION_SUCCESS')
else:
    print('EXTRACTION_FAILED')
" > "$SCRIPT_DIR/temp_extraction_result.json"
    
    # Check if extraction was successful
    if grep -q "EXTRACTION_SUCCESS" "$SCRIPT_DIR/temp_extraction_result.json"; then
        # Now use the golden FinalEnrichmentProcessor to process courses
        python3 -c "
import sys
sys.path.append('$SCRIPT_DIR')
from final_enrichment_script import FinalEnrichmentProcessor
from pathlib import Path
import json

# Initialize processor
processor = FinalEnrichmentProcessor('$SCRIPT_DIR', '$OUTPUT_DIR', 1)

# Process the single college (now with comprehensive data)
result = processor.process_single_college(Path('$SCRIPT_DIR/temp_college_input.json'))

if result and result['status'] == 'success':
    print('SUCCESS')
    print(json.dumps(result))
else:
    print('FAILED')
    if result:
        print(json.dumps(result))
" > "$SCRIPT_DIR/temp_result.json"
        
        # Check if processing was successful
        if grep -q "SUCCESS" "$SCRIPT_DIR/temp_result.json"; then
            # Extract the result data
            grep -A 1000 "SUCCESS" "$SCRIPT_DIR/temp_result.json" | tail -n +2 > "$SCRIPT_DIR/temp_college_data.json"
            rm -f "$SCRIPT_DIR/temp_college_input.json" "$SCRIPT_DIR/temp_result.json" "$SCRIPT_DIR/temp_extraction_result.json"
            return 0
        else
            rm -f "$SCRIPT_DIR/temp_college_input.json" "$SCRIPT_DIR/temp_result.json" "$SCRIPT_DIR/temp_college_data.json" "$SCRIPT_DIR/temp_extraction_result.json"
            return 1
        fi
    else
        rm -f "$SCRIPT_DIR/temp_college_input.json" "$SCRIPT_DIR/temp_extraction_result.json"
        return 1
    fi
}

# Process a single state
process_state() {
    local state=$1
    local state_index=$2
    
    print_status "$BLUE" "Processing state: $state ($((state_index + 1))/${#STATES[@]})"
    
    # Create state directory (convert to proper case)
    local state_display=$(echo "$state" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2))}1')
    local state_dir="$OUTPUT_DIR/$state_display"
    mkdir -p "$state_dir"
    
    local state_colleges=0
    local state_successful=0
    local state_failed=0
    local state_duplicates=0
    
    # Process each page
    for page in $(seq 1 $PAGES_PER_STATE); do
        print_status "$YELLOW" "  Processing page $page/$PAGES_PER_STATE"
        
        # Construct URL for this state and page
        local state_url="${BASE_URL}/${state}-colleges?&page=${page}"
        
        log "Scraping page: $state_url"
        
        # Create Python script to scrape the listing page
        cat > "$SCRIPT_DIR/temp_listing_scraper.py" << EOF
import requests
import json
import re
from bs4 import BeautifulSoup
import time

def scrape_listing_page(url):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        colleges = []
        
        college_links = soup.find_all('a', href=re.compile(r'/college/\d+-'))
        
        for link in college_links:
            college_url = link['href']
            if not college_url.startswith('http'):
                college_url = f"https://collegedunia.com{college_url}"
            
            college_id_match = re.search(r'/college/(\d+)-', college_url)
            if college_id_match:
                college_id = college_id_match.group(1)
                colleges.append({
                    'college_id': college_id,
                    'url': college_url,
                    'name': link.get_text().strip()
                })
        
        return colleges
        
    except Exception as e:
        print(f"Error scraping listing page {url}: {str(e)}")
        return []

if __name__ == "__main__":
    url = sys.argv[1]
    result = scrape_listing_page(url)
    print(json.dumps(result, indent=2))
EOF
        
        # Run the listing scraper
        python3 "$SCRIPT_DIR/temp_listing_scraper.py" "$state_url" > "$SCRIPT_DIR/temp_listing.json"
        
        # Check if scraping was successful
        if [[ -s "$SCRIPT_DIR/temp_listing.json" ]]; then
            # Process each college from the listing
            jq -c '.[]' "$SCRIPT_DIR/temp_listing.json" | while IFS= read -r line; do
                if [[ -n "$line" ]]; then
                    college_id=$(echo "$line" | jq -r '.college_id')
                    college_url=$(echo "$line" | jq -r '.url')
                    college_name=$(echo "$line" | jq -r '.name')
                    
                    # Check for duplicates
                    if check_duplicate "$college_id" "$state"; then
                        print_status "$YELLOW" "    Duplicate found: $college_name (ID: $college_id)"
                        ((state_duplicates++))
                        ((DUPLICATE_COLLEGES++))
                        continue
                    fi
                    
                    # Scrape college details using golden scripts
                    if scrape_college_details_golden "$college_url" "$college_id" "$state_display"; then
                        # Create filename exactly like golden script
                        timestamp=$(date +%Y%m%d_%H%M%S)
                        filename="${college_name,,}_${timestamp}.json"
                        filename=$(echo "$filename" | sed 's/[^a-zA-Z0-9_-]/_/g')
                        
                        mv "$SCRIPT_DIR/temp_college_data.json" "$state_dir/$filename"
                        
                        print_status "$GREEN" "    ✅ Scraped: $college_name"
                        ((state_successful++))
                        ((SUCCESSFUL_COLLEGES++))
                    else
                        print_status "$RED" "    ❌ Failed: $college_name"
                        ((state_failed++))
                        ((FAILED_COLLEGES++))
                    fi
                    
                    ((state_colleges++))
                    ((PROCESSED_COLLEGES++))
                    
                    # Save progress
                    save_progress
                    
                    # Delay between requests
                    sleep $DELAY_BETWEEN_REQUESTS
                fi
            done
        else
            print_status "$RED" "    Failed to scrape listing page $page"
        fi
        
        # Clean up temp files
        rm -f "$SCRIPT_DIR/temp_listing_scraper.py" "$SCRIPT_DIR/temp_listing.json"
        
        # Delay between pages
        if [[ $page -lt $PAGES_PER_STATE ]]; then
            sleep $DELAY_BETWEEN_PAGES
        fi
    done
    
    # Print state statistics
    print_status "$GREEN" "  State $state completed:"
    print_status "$GREEN" "    Colleges processed: $state_colleges"
    print_status "$GREEN" "    Successful: $state_successful"
    print_status "$GREEN" "    Failed: $state_failed"
    print_status "$GREEN" "    Duplicates: $state_duplicates"
    
    # Delay between states
    if [[ $state_index -lt $((${#STATES[@]} - 1)) ]]; then
        sleep $DELAY_BETWEEN_STATES
    fi
}

# Print statistics
print_statistics() {
    local elapsed_time=$(($(date +%s) - START_TIME))
    local hours=$((elapsed_time / 3600))
    local minutes=$(((elapsed_time % 3600) / 60))
    local seconds=$((elapsed_time % 60))
    
    print_status "$BLUE" "╔════════════════════════════════════════════════════════════════════════════════╗"
    print_status "$BLUE" "║                              SCRAPING STATISTICS                              ║"
    print_status "$BLUE" "╠════════════════════════════════════════════════════════════════════════════════╣"
    print_status "$BLUE" "║ Total States: ${#STATES[@]}                                                           ║"
    print_status "$BLUE" "║ Current State: $((CURRENT_STATE + 1))/${#STATES[@]}                                                      ║"
    print_status "$BLUE" "║ Current Page: $CURRENT_PAGE/$PAGES_PER_STATE                                                      ║"
    print_status "$BLUE" "║ Processed Colleges: $PROCESSED_COLLEGES                                                      ║"
    print_status "$BLUE" "║ Successful: $SUCCESSFUL_COLLEGES                                                      ║"
    print_status "$BLUE" "║ Failed: $FAILED_COLLEGES                                                      ║"
    print_status "$BLUE" "║ Duplicates: $DUPLICATE_COLLEGES                                                      ║"
    print_status "$BLUE" "║ Elapsed Time: ${hours}h ${minutes}m ${seconds}s                                                      ║"
    print_status "$BLUE" "╚════════════════════════════════════════════════════════════════════════════════╝"
}

# Main function
main() {
    print_status "$GREEN" "🚀 CDScraper v4 Simple - Using Golden Scripts"
    print_status "$GREEN" "=============================================="
    
    # Initialize
    init_progress
    load_progress
    
    # Create output directory
    mkdir -p "$OUTPUT_DIR"
    
    # Handle resume
    if [[ "$1" == "--resume" ]]; then
        print_status "$YELLOW" "Resuming from previous session..."
        print_status "$YELLOW" "Last state: $LAST_STATE, Last page: $LAST_PAGE"
    fi
    
    # Print initial statistics
    print_statistics
    
    # Process states
    for i in "${!STATES[@]}"; do
        if [[ $i -lt $CURRENT_STATE ]]; then
            continue  # Skip already processed states
        fi
        
        CURRENT_STATE=$i
        process_state "${STATES[$i]}" $i
        
        # Update progress
        save_progress
    done
    
    # Final statistics
    print_status "$GREEN" "🎉 Scraping completed!"
    print_statistics
    
    # Clean up
    rm -f "$PROGRESS_FILE"
    rm -f "$SCRIPT_DIR/temp_*.py" "$SCRIPT_DIR/temp_*.json"
    
    log "Scraping completed successfully"
}

# Handle interruption
trap 'print_status "$RED" "⚠️  Process interrupted. Progress saved."; save_progress; exit 1' INT

# Run main function
main "$@"
