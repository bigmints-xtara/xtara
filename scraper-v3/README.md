# CollegeDunia Scraper

**Single comprehensive script** for scraping college data from CollegeDunia.com with state-wise organization.

## 🚀 Quick Start

### **The ONLY script you need:**
```bash
./run.sh
```

That's it! This will run the test mode (Kerala, 10 colleges).

## 📋 Usage Options

```bash
# Test mode (default) - Kerala with 10 colleges
./run.sh
./run.sh --test

# Single college
./run.sh --single "https://collegedunia.com/college/18512-rajagiri-business-school-rbs-kochi"

# Specific state
./run.sh --state kerala
./run.sh --state tamil-nadu --max 50

# All states
./run.sh --all
./run.sh --all --max 200

# Help
./run.sh --help

# Pause/Resume
./run.sh --pause    # Request pause
./run.sh --resume   # Clear pause
./run.sh --status   # Check status
```

## 📁 Output Structure

```
outputs/
├── scraped_data/                    # Main output directory
│   ├── kerala/                      # State-wise organization
│   │   ├── College_Name_ID_Timestamp.json
│   │   ├── College_Name_ID_Timestamp.json
│   │   └── kerala_summary.json
│   ├── tamil_nadu/
│   └── ...
├── progress/                        # Progress tracking
│   └── progress.json
├── duplicates.json                  # Duplicate prevention
└── scraping.log                     # Detailed logs
```

## 🎯 Data Structure

Each college JSON file contains:

```json
{
  "basic_info": {
    "id": 18512,
    "short_form": "Rajagiri Business School Kochi",
    "year_founded": 2008,
    "type_of_college": "Private",
    "city": "Kochi",
    "state": "Kerala",
    "website": "https://www.rajagiribusinessschool.edu.in/",
    "major_stream_name": "Management",
    "naac_approval": {
      "grade": "A++",
      "approval_name": "NAAC"
    },
    "affiliated_to": {
      "name": "Mahatma Gandhi University Kottayam, Kottayam"
    },
    "address": {
      "address": "Rajagiri Valley P. O, Kakkanad<br>   India",
      "pincode": "682039"
    },
    "landline": [
      {"value": "0484-2426554", "text": ""}
    ],
    "reviews": {
      "rating": "4.0",
      "count": "12"
    },
    "ranking": [
      {
        "rank": "91",
        "stream": "MBA",
        "year": 2025,
        "agency": "NIRF"
      }
    ]
    // ... all 35 fields exactly as from CollegeDunia
  },
  "courses": [
    {
      "course": "PGDM",
      "level": "Post Graduation",
      "duration_year": 2,
      "stream_id": 13,
      "stream": [
        {"name": "Finance", "display_name": null},
        {"name": "Business Intelligence", "display_name": null}
        // ... all specializations
      ]
    }
  ],
  "metadata": {
    "college_dunia_url": "https://collegedunia.com/college/18512-rajagiri-business-school-rbs-kochi",
    "processed_at": "2025-09-15T14:00:04.926000",
    "extractor_version": "1.0",
    "state": "kerala",
    "scraped_page": 1
  }
}
```

## ✨ Key Features

- **Single Script**: Only one script to run everything
- **State-wise Organization**: Colleges organized by Indian states
- **Complete Data**: All 35 fields in `basic_info` + all courses
- **Clean Data**: Automatically removes unwanted fields after scraping
- **Gentle Crawling**: Respectful delays to avoid overwhelming the server
- **Progress Tracking**: Resume from where you left off
- **Pause/Resume**: Pause and resume anytime during scraping
- **Duplicate Prevention**: Never scrape the same college twice
- **Comprehensive Logging**: Detailed logs for debugging

## 🎯 Data Sources

- **basic_info**: `props.initialProps.pageProps.data.basic_info`
- **courses**: `props.initialProps.pageProps.data.new_compare_courses`

## 🧹 Data Cleanup

The scraper automatically removes unwanted fields after scraping:

**Original fields removed:**
- `stream_id`, `id`, `short_head_two`, `admission`, `reviews`
- `fees_data`, `previous_fees_data`, `academic_year`, `cutoff`
- `is_discontinued`, `previous_year_fees`, `click_stats`
- `monthly_click_stats`, `monthly_leads_stats`, `priority_score`
- `tuitionFeesData`, `course_tag_id`, `tuition_fee`, `url`
- `lead_params`, `ranking_stats_key`, `rankingStats`

**Additional fields removed:**
- `logo`, `cover_image`, `city_id`, `state_id`, `area_id`, `area_name`
- `overall_admin_rating`, `qna`, `major_stream`, `major_stream_rating`
- `ranking`, `is_distance`, `naac_approval`, `college_tier`
- `review_amount`, `isShowFull`, `chat_group_members`, `hide_live_form`

**Fee-related fields removed:**
- `exam_fee`, `training_and_placement_fees`, `miscellaneous_fees`

This results in cleaner, more focused data files with only essential information.

## 🔧 Requirements

- Python 3.7+
- Required packages: `requests`, `beautifulsoup4`, `lxml`

## 📊 Supported States

All Indian states are supported:
- Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh
- Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand
- Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur
- Meghalaya, Mizoram, Nagaland, Odisha, Punjab
- Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura
- Uttar Pradesh, Uttarakhand, West Bengal, Delhi, Jammu & Kashmir

## 🎉 Ready for Production

The scraper is production-ready and extracts data exactly as it appears on CollegeDunia.com without any modifications.

**Just run `./run.sh` and you're done!** 🚀