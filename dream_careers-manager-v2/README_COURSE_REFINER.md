# Course Refiner

Maps dream career courses to actual college courses using Ollama AI.

## Quick Start

```bash
# 1. Start Ollama
ollama serve
ollama pull gpt-oss:20b

# 2. Run refiner
./refine_courses.sh
```

## What it does

1. **Loads** all college course data from `scraper-v3/outputs/scraped_data/`
2. **Maps** dream career courses to actual college offerings
3. **Uses AI** to find alternatives when exact matches aren't available
4. **Avoids** generic courses like "BA", "MA" without specializations
5. **Saves** refined careers to `refined_careers/` folder

## Files

- `course_refiner.py` - Main refinement script
- `refine_courses.sh` - Quick runner script
- `refined_careers/` - Output folder (created automatically)

## Example

**Before:**
```json
"courses": ["B.Sc - Aviation", "B.Tech - Aerospace Engineering"]
```

**After:**
```json
"courses": [
  {
    "course": "B.Sc",
    "level": "Graduation",
    "duration_year": "3",
    "stream": [
      {
        "name": "Aviation",
        "course_name": "Bachelor of Science [B.Sc] (Aviation)",
        "display_course_name": "Bachelor of Science [B.Sc] (Aviation)"
      }
    ]
  },
  {
    "course": "B.Tech",
    "level": "Graduation", 
    "duration_year": "4",
    "stream": [
      {
        "name": "Aerospace Engineering",
        "course_name": "Bachelor of Technology [B.Tech] (Aerospace Engineering)",
        "display_course_name": "Bachelor of Technology [B.Tech] (Aerospace Engineering)"
      }
    ]
  }
]
```

The courses now use the exact same structure as college data with full course details.
