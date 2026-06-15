#!/bin/bash

# CollegeDunia Scraper - Single Script Runner
# This is the ONLY script you need to run

echo "=== COLLEGEDUNIA SCRAPER ==="
echo "Single comprehensive script for college data extraction"
echo

# Set up environment
cd "$(dirname "$0")"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ ERROR: Python3 is not installed or not in PATH"
    exit 1
fi

# Check if required files exist
if [ ! -f "scrape_colleges.py" ]; then
    echo "❌ ERROR: Main scraper script not found"
    exit 1
fi

# Make the script executable
chmod +x scrape_colleges.py

echo "📁 Output directory: $(pwd)/outputs"
echo "📝 Log file: $(pwd)/outputs/scraping.log"
echo

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  --test                    Test mode - scrape Kerala with 10 colleges"
    echo "  --single URL              Scrape a single college by URL"
    echo "  --state STATE             Scrape a specific state (e.g., kerala, tamil-nadu)"
    echo "  --all                     Scrape all Indian states (default)"
    echo "  --incomplete              Scrape only incomplete states (< 20 files)"
    echo "  --max N                   Maximum colleges per state (default: 1000)"
    echo "  --pause                   Request pause (create pause file)"
    echo "  --resume                  Clear pause and resume"
    echo "  --status                  Show current status"
    echo "  --help                    Show this help message"
    echo
    echo "Examples:"
    echo "  $0                        # Scrape all states (200 colleges each)"
    echo "  $0 --test                 # Test with Kerala (10 colleges)"
    echo "  $0 --incomplete           # Scrape only incomplete states (200 each)"
    echo "  $0 --single 'https://collegedunia.com/college/18512-rajagiri-business-school-rbs-kochi'"
    echo "  $0 --state kerala         # Scrape Kerala (200 colleges)"
    echo "  $0 --state tamil-nadu --max 50  # Scrape Tamil Nadu (50 colleges)"
    echo "  $0 --all                  # Scrape all states (200 each)"
    echo
    echo "Output Structure:"
    echo "  - outputs/scraped_data/           # Main output directory"
    echo "  - outputs/scraped_data/{state}/   # State-wise organization"
    echo "  - outputs/progress/               # Progress tracking"
    echo "  - outputs/scraping.log            # Detailed logs"
}

    # Parse command line arguments
    if [ $# -eq 0 ]; then
        # Default: all states mode with 1000 colleges each
        ARGS="--mode all --max 1000"
    else
        # Convert arguments to proper format
        ARGS="--max 1000"  # Default max is 1000
    while [[ $# -gt 0 ]]; do
        case $1 in
            --test)
                ARGS="$ARGS --mode test"
                shift
                ;;
            --single)
                ARGS="$ARGS --mode single --url $2"
                shift 2
                ;;
            --state)
                ARGS="$ARGS --mode state --state $2"
                shift 2
                ;;
            --all)
                ARGS="$ARGS --mode all"
                shift
                ;;
            --incomplete)
                ARGS="$ARGS --mode incomplete"
                shift
                ;;
            --max)
                ARGS="$ARGS --max $2"
                shift 2
                ;;
            --pause)
                echo "🛑 Requesting pause..."
                touch outputs/pause_requested
                echo "✅ Pause requested. The scraper will stop after the current college."
                exit 0
                ;;
            --resume)
                echo "▶️  Clearing pause request..."
                rm -f outputs/pause_requested
                echo "✅ Pause cleared. You can now resume scraping."
                exit 0
                ;;
            --status)
                echo "📊 Current Status:"
                if [ -f "outputs/progress/progress.json" ]; then
                    echo "  Progress file: ✅ Found"
                    python3 -c "
import json
try:
    with open('outputs/progress/progress.json', 'r') as f:
        progress = json.load(f)
    print(f'  Current state: {progress.get(\"current_state\", \"None\")}')
    print(f'  Current page: {progress.get(\"current_page\", \"None\")}')
    print(f'  Colleges scraped: {progress.get(\"colleges_scraped\", 0)}')
    print(f'  Completed states: {len(progress.get(\"completed_states\", []))}')
except:
    print('  Progress file: ❌ Error reading')
"
                else
                    echo "  Progress file: ❌ Not found"
                fi
                
                if [ -f "outputs/pause_requested" ]; then
                    echo "  Pause status: 🛑 Paused"
                else
                    echo "  Pause status: ▶️  Running"
                fi
                
                if [ -d "outputs/scraped_data" ]; then
                    total_files=$(find outputs/scraped_data -name "*.json" | wc -l)
                    echo "  Scraped files: $total_files"
                else
                    echo "  Scraped files: 0"
                fi
                exit 0
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
fi

# Run the Python script with all arguments
echo "🚀 Running scraper with arguments: $ARGS"
echo

python3 scrape_colleges.py $ARGS

# Check if successful
if [ $? -eq 0 ]; then
    echo
    echo "=== SCRAPING SUMMARY ==="
    echo "✅ Scraping completed successfully!"
    echo "📁 Output directory: $(pwd)/outputs/scraped_data"
    echo "📝 Log file: $(pwd)/outputs/scraping.log"
    echo
    
    # Show generated files
    if [ -d "outputs/scraped_data" ]; then
        echo "📄 Generated files:"
        find outputs/scraped_data -name "*.json" | head -10 | while read -r file; do
            size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
            echo "  - $(basename "$file") ($size bytes)"
        done
        
        total_files=$(find outputs/scraped_data -name "*.json" | wc -l)
        if [ $total_files -gt 10 ]; then
            echo "  ... and $((total_files - 10)) more files"
        fi
    fi
    
    echo
    echo "🎯 Data Structure:"
    echo "  - basic_info: Complete college information (35 fields)"
    echo "  - courses: All available courses and specializations"
    echo "  - metadata: URL, timestamp, extractor version"
    echo "  - State-wise organization: outputs/scraped_data/{state}/"
    echo "  - Progress tracking: Resume from where you left off"
    echo
    echo "🎉 Ready for production use!"
    
else
    echo
    echo "❌ Scraping failed. Check the logs above for details."
    echo "📝 Full log: $(pwd)/outputs/scraping.log"
    exit 1
fi
