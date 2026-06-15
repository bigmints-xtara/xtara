#!/bin/bash

# College Data Enrichment Script
# =============================
# This script enriches college data with enhanced course extraction and standardization.
# Features: Individual file statistics, stop/resume functionality, progress tracking.

set -e  # Exit on any error

# Configuration
INPUT_DIR="all-college-data"
OUTPUT_DIR="/Users/pretheesh/Projects/project-xtara/scraper-v2/college-data-courses-refined"
LOG_FILE="enrichment.log"
PROGRESS_FILE="enrichment_progress.json"
STATS_FILE="enrichment_stats.json"
MAX_WORKERS=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Statistics tracking
TOTAL_FILES=0
PROCESSED_FILES=0
SUCCESSFUL_FILES=0
FAILED_FILES=0
TOTAL_COURSES_BEFORE=0
TOTAL_COURSES_AFTER=0
TOTAL_IMPROVEMENT=0
START_TIME=""
CURRENT_FILE=""

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# Function to print statistics
print_stats() {
    local file_name=$1
    local courses_before=$2
    local courses_after=$3
    local improvement=$4
    local status=$5
    
    echo ""
    echo "┌─────────────────────────────────────────────────────────────┐"
    echo "│                    FILE PROCESSING STATS                   │"
    echo "├─────────────────────────────────────────────────────────────┤"
    echo "│ File: $(printf "%-50s" "$file_name") │"
    echo "│ Status: $(printf "%-47s" "$status") │"
    echo "│ Courses Before: $(printf "%-42s" "$courses_before") │"
    echo "│ Courses After: $(printf "%-43s" "$courses_after") │"
    echo "│ Improvement: $(printf "%-45s" "+$improvement") │"
    echo "│ Progress: $(printf "%-46s" "$PROCESSED_FILES/$TOTAL_FILES") │"
    echo "│ Success Rate: $(printf "%-42s" "$((SUCCESSFUL_FILES * 100 / PROCESSED_FILES))%") │"
    echo "└─────────────────────────────────────────────────────────────┘"
    echo ""
}

# Function to print overall statistics
print_overall_stats() {
    local elapsed_time=$1
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                              OVERALL STATISTICS                               ║"
    echo "╠════════════════════════════════════════════════════════════════════════════════╣"
    echo "║ Total Files: $(printf "%-65s" "$TOTAL_FILES") ║"
    echo "║ Processed: $(printf "%-67s" "$PROCESSED_FILES") ║"
    echo "║ Successful: $(printf "%-65s" "$SUCCESSFUL_FILES") ║"
    echo "║ Failed: $(printf "%-69s" "$FAILED_FILES") ║"
    echo "║ Success Rate: $(printf "%-62s" "$((SUCCESSFUL_FILES * 100 / PROCESSED_FILES))%") ║"
    echo "║ Total Courses Before: $(printf "%-52s" "$TOTAL_COURSES_BEFORE") ║"
    echo "║ Total Courses After: $(printf "%-53s" "$TOTAL_COURSES_AFTER") ║"
    echo "║ Total Improvement: $(printf "%-58s" "+$TOTAL_IMPROVEMENT") ║"
    echo "║ Elapsed Time: $(printf "%-62s" "$elapsed_time") ║"
    echo "╚════════════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

# Function to save progress
save_progress() {
    cat > "$PROGRESS_FILE" << EOF
{
    "total_files": $TOTAL_FILES,
    "processed_files": $PROCESSED_FILES,
    "successful_files": $SUCCESSFUL_FILES,
    "failed_files": $FAILED_FILES,
    "total_courses_before": $TOTAL_COURSES_BEFORE,
    "total_courses_after": $TOTAL_COURSES_AFTER,
    "total_improvement": $TOTAL_IMPROVEMENT,
    "start_time": "$START_TIME",
    "current_file": "$CURRENT_FILE"
}
EOF
}

# Function to load progress
load_progress() {
    if [ -f "$PROGRESS_FILE" ]; then
        TOTAL_FILES=$(jq -r '.total_files' "$PROGRESS_FILE")
        PROCESSED_FILES=$(jq -r '.processed_files' "$PROGRESS_FILE")
        SUCCESSFUL_FILES=$(jq -r '.successful_files' "$PROGRESS_FILE")
        FAILED_FILES=$(jq -r '.failed_files' "$PROGRESS_FILE")
        TOTAL_COURSES_BEFORE=$(jq -r '.total_courses_before' "$PROGRESS_FILE")
        TOTAL_COURSES_AFTER=$(jq -r '.total_courses_after' "$PROGRESS_FILE")
        TOTAL_IMPROVEMENT=$(jq -r '.total_improvement' "$PROGRESS_FILE")
        START_TIME=$(jq -r '.start_time' "$PROGRESS_FILE")
        CURRENT_FILE=$(jq -r '.current_file' "$PROGRESS_FILE")
        
        print_status $YELLOW "Resuming from previous session..."
        print_status $CYAN "Processed: $PROCESSED_FILES/$TOTAL_FILES files"
        print_status $CYAN "Successful: $SUCCESSFUL_FILES, Failed: $FAILED_FILES"
        echo ""
    fi
}

# Function to process a single file
process_file() {
    local file_path=$1
    local file_name=$(basename "$file_path")
    
    CURRENT_FILE="$file_name"
    print_status $BLUE "Processing: $file_name"
    
    # Run the Python enrichment script for this file
    local result=$(python3 process_single_file.py "$file_path" "$INPUT_DIR" "$OUTPUT_DIR" 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$result" ]; then
        # Parse the result
        local status=$(echo "$result" | jq -r '.status')
        local courses_before=$(echo "$result" | jq -r '.courses_before')
        local courses_after=$(echo "$result" | jq -r '.courses_after')
        local improvement=$(echo "$result" | jq -r '.improvement_score')
        
        # Update statistics
        PROCESSED_FILES=$((PROCESSED_FILES + 1))
        TOTAL_COURSES_BEFORE=$((TOTAL_COURSES_BEFORE + courses_before))
        TOTAL_COURSES_AFTER=$((TOTAL_COURSES_AFTER + courses_after))
        TOTAL_IMPROVEMENT=$((TOTAL_IMPROVEMENT + improvement))
        
        if [ "$status" = "success" ]; then
            SUCCESSFUL_FILES=$((SUCCESSFUL_FILES + 1))
            print_status $GREEN "✅ Success: $file_name"
        else
            FAILED_FILES=$((FAILED_FILES + 1))
            print_status $RED "❌ Failed: $file_name"
        fi
        
        # Print individual file statistics
        print_stats "$file_name" "$courses_before" "$courses_after" "$improvement" "$status"
        
        # Save progress
        save_progress
        
    else
        FAILED_FILES=$((FAILED_FILES + 1))
        PROCESSED_FILES=$((PROCESSED_FILES + 1))
        print_status $RED "❌ Error processing: $file_name"
        print_stats "$file_name" "0" "0" "0" "ERROR"
        save_progress
    fi
}

# Function to handle interruption
handle_interrupt() {
    echo ""
    print_status $YELLOW "⚠️  Process interrupted by user"
    print_status $CYAN "Progress saved. You can resume later by running the script again."
    local elapsed_seconds=$(( $(date +%s) - $(date -j -f "%Y-%m-%d %H:%M:%S" "$START_TIME" +%s) ))
    local elapsed_time=$(printf "%02d:%02d:%02d" $((elapsed_seconds/3600)) $((elapsed_seconds%3600/60)) $((elapsed_seconds%60)))
    print_overall_stats "$elapsed_time"
    save_progress
    exit 0
}

# Function to show help
show_help() {
    echo "College Data Enrichment Script"
    echo "=============================="
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -r, --resume        Resume from previous session"
    echo "  -c, --clean         Clean progress and start fresh"
    echo "  -s, --stats         Show current statistics and exit"
    echo "  -t, --test          Test on sample files only"
    echo ""
    echo "Features:"
    echo "  • Individual file statistics after each processing"
    echo "  • Stop and resume functionality"
    echo "  • Progress tracking and saving"
    echo "  • Colored output for better readability"
    echo "  • Comprehensive error handling"
    echo ""
    echo "Output: $OUTPUT_DIR"
    echo "Logs: $LOG_FILE"
    echo "Progress: $PROGRESS_FILE"
}

# Function to show current statistics
show_stats() {
    if [ -f "$PROGRESS_FILE" ]; then
        load_progress
        local elapsed_seconds=$(( $(date +%s) - $(date -j -f "%Y-%m-%d %H:%M:%S" "$START_TIME" +%s) ))
    local elapsed_time=$(printf "%02d:%02d:%02d" $((elapsed_seconds/3600)) $((elapsed_seconds%3600/60)) $((elapsed_seconds%60)))
    print_overall_stats "$elapsed_time"
    else
        print_status $YELLOW "No progress file found. Run the script to start processing."
    fi
}

# Function to clean progress
clean_progress() {
    if [ -f "$PROGRESS_FILE" ]; then
        rm -f "$PROGRESS_FILE"
        print_status $GREEN "Progress file cleaned"
    fi
    if [ -f "$STATS_FILE" ]; then
        rm -f "$STATS_FILE"
        print_status $GREEN "Stats file cleaned"
    fi
}

# Function to test on sample files
test_sample() {
    print_status $BLUE "Running test on sample files..."
    
    # Get a few sample files (only actual JSON files, not directories)
    local sample_files=()
    while IFS= read -r file; do
        sample_files+=("$file")
    done < <(find "$INPUT_DIR" -name "*.json" -type f | head -5)
    
    if [ ${#sample_files[@]} -eq 0 ]; then
        print_status $RED "No JSON files found in $INPUT_DIR"
        exit 1
    fi
    
    TOTAL_FILES=${#sample_files[@]}
    START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
    
    print_status $CYAN "Testing on $TOTAL_FILES sample files"
    echo ""
    
    for file in "${sample_files[@]}"; do
        process_file "$file"
    done
    
    local elapsed_seconds=$(( $(date +%s) - $(date -j -f "%Y-%m-%d %H:%M:%S" "$START_TIME" +%s) ))
    local elapsed_time=$(printf "%02d:%02d:%02d" $((elapsed_seconds/3600)) $((elapsed_seconds%3600/60)) $((elapsed_seconds%60)))
    print_overall_stats "$elapsed_time"
}

# Main function
main() {
    # Parse command line arguments
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--stats)
            show_stats
            exit 0
            ;;
        -c|--clean)
            clean_progress
            exit 0
            ;;
        -t|--test)
            test_sample
            exit 0
            ;;
        -r|--resume)
            load_progress
            ;;
        "")
            # Start fresh
            ;;
        *)
            print_status $RED "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
    
    # Set up signal handling
    trap handle_interrupt SIGINT SIGTERM
    
    # Initialize
    if [ -z "$START_TIME" ]; then
        START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
    fi
    
    # Get all files if not resuming
    if [ $TOTAL_FILES -eq 0 ]; then
        print_status $BLUE "Scanning for college files..."
        local all_files=()
        while IFS= read -r file; do
            all_files+=("$file")
        done < <(find "$INPUT_DIR" -name "*.json" -type f | sort)
        TOTAL_FILES=${#all_files[@]}
        
        if [ $TOTAL_FILES -eq 0 ]; then
            print_status $RED "No JSON files found in $INPUT_DIR"
            exit 1
        fi
        
        print_status $GREEN "Found $TOTAL_FILES college files to process"
        save_progress
    fi
    
    # Get remaining files to process
    local all_files=()
    while IFS= read -r file; do
        all_files+=("$file")
    done < <(find "$INPUT_DIR" -name "*.json" -type f | sort)
    local remaining_files=()
    
    if [ $PROCESSED_FILES -gt 0 ]; then
        # Skip already processed files
        for file in "${all_files[@]}"; do
            local file_name=$(basename "$file")
            if [ "$file_name" != "$CURRENT_FILE" ]; then
                remaining_files+=("$file")
            fi
        done
    else
        remaining_files=("${all_files[@]}")
    fi
    
    print_status $CYAN "Starting enrichment process..."
    print_status $CYAN "Files to process: ${#remaining_files[@]}"
    print_status $CYAN "Output directory: $OUTPUT_DIR"
    echo ""
    
    # Process files
    for file in "${remaining_files[@]}"; do
        process_file "$file"
    done
    
    # Final statistics
    print_status $GREEN "🎉 Enrichment process completed!"
    local elapsed_seconds=$(( $(date +%s) - $(date -j -f "%Y-%m-%d %H:%M:%S" "$START_TIME" +%s) ))
    local elapsed_time=$(printf "%02d:%02d:%02d" $((elapsed_seconds/3600)) $((elapsed_seconds%3600/60)) $((elapsed_seconds%60)))
    print_overall_stats "$elapsed_time"
    
    # Clean up progress file
    rm -f "$PROGRESS_FILE"
    
    print_status $GREEN "Results saved to: $OUTPUT_DIR"
    print_status $GREEN "Logs saved to: $LOG_FILE"
}

# Run main function
main "$@"
