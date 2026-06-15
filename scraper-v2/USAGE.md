# College Data Enrichment - Usage Guide

## 🚀 Quick Start

### 1. Test the System
```bash
./enrich_colleges.sh --test
```

### 2. Run Full Enrichment
```bash
./enrich_colleges.sh
```

### 3. Resume After Interruption
```bash
./enrich_colleges.sh --resume
```

## 📋 Available Commands

### Basic Commands
- `./enrich_colleges.sh` - Start fresh enrichment process
- `./enrich_colleges.sh --resume` - Resume from previous session
- `./enrich_colleges.sh --test` - Test on sample files only
- `./enrich_colleges.sh --stats` - Show current statistics
- `./enrich_colleges.sh --clean` - Clean progress and start fresh
- `./enrich_colleges.sh --help` - Show help message

### Stop and Resume
- **Stop**: Press `Ctrl+C` to stop the process safely
- **Resume**: Run `./enrich_colleges.sh --resume` to continue
- **Progress**: Automatically saved after each file

## 📊 Features

### ✅ Individual File Statistics
After processing each file, you'll see:
```
┌─────────────────────────────────────────────────────────────┐
│                    FILE PROCESSING STATS                   │
├─────────────────────────────────────────────────────────────┤
│ File: don_bosco_college_panji_20250914_134000.json        │
│ Status: success                                            │
│ Courses Before: 7                                          │
│ Courses After: 10                                          │
│ Improvement: +3                                            │
│ Progress: 1/2794                                           │
│ Success Rate: 100%                                         │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Overall Statistics
Periodic overall statistics showing:
- Total files processed
- Success/failure rates
- Total course improvements
- Elapsed time

### ✅ Progress Tracking
- **Progress File**: `enrichment_progress.json`
- **Log File**: `enrichment.log`
- **Stats File**: `enrichment_stats.json`

## 🎯 Output Structure

All enriched data is saved to:
```
/Users/pretheesh/Projects/project-xtara/scraper-v2/college-data-courses-refined/
├── Andhra Pradesh/
│   ├── college1.json
│   └── college2.json
├── Assam/
│   ├── college1.json
│   └── college2.json
└── ... (all states)
```

## 🔧 Configuration

### Environment Variables
You can modify these in the script:
- `INPUT_DIR`: Source directory (default: "all-college-data")
- `OUTPUT_DIR`: Output directory (default: "/Users/pretheesh/Projects/project-xtara/scraper-v2/college-data-courses-refined")
- `MAX_WORKERS`: Parallel processing (default: 5)
- `LOG_FILE`: Log file name (default: "enrichment.log")

### File Processing
- **Sequential Processing**: Files processed one by one for better control
- **Error Handling**: Failed files are logged and processing continues
- **Progress Saving**: Progress saved after each file

## 📈 Expected Results

Based on testing:
- **Don Bosco College**: 7 → 10 courses (+43% improvement)
- **Nirmala College**: 6 → 45 courses (+650% improvement)
- **Average Improvement**: Significant course extraction improvements
- **Standardization**: All courses follow college.json structure

## 🚨 Important Notes

### Stop and Resume
- **Safe Stop**: Always use `Ctrl+C` to stop safely
- **Progress Saved**: Progress is automatically saved
- **Resume Anytime**: Can resume from any point
- **No Data Loss**: Interrupted processing doesn't lose data

### Error Handling
- **Failed Files**: Logged and processing continues
- **Network Issues**: Automatic retry and error logging
- **File Errors**: Individual file errors don't stop the process

### Performance
- **Sequential Processing**: Better control and monitoring
- **Memory Efficient**: Processes one file at a time
- **Progress Tracking**: Real-time statistics

## 🔍 Monitoring

### Real-time Monitoring
- **Console Output**: Colored status messages
- **File Statistics**: After each file processing
- **Overall Statistics**: Periodic updates
- **Progress Bar**: Visual progress indication

### Log Files
- **enrichment.log**: Detailed processing logs
- **enrichment_progress.json**: Current progress state
- **enrichment_stats.json**: Final statistics

## 🛠️ Troubleshooting

### Common Issues
1. **Permission Denied**: Run `chmod +x enrich_colleges.sh`
2. **Python Errors**: Check Python dependencies
3. **File Not Found**: Verify input directory exists
4. **JSON Parse Error**: Check file format

### Debug Mode
```bash
# Run with verbose output
bash -x enrich_colleges.sh --test
```

### Clean Start
```bash
# Clean all progress and start fresh
./enrich_colleges.sh --clean
./enrich_colleges.sh
```

## 📞 Support

For issues or questions:
1. Check the log files for error details
2. Verify file permissions and dependencies
3. Test with sample files first
4. Check the progress file for current state
