#!/bin/bash

# Dream Careers Firestore Upload Script

echo "🔥 Dream Careers Firestore Uploader"
echo "=================================="

# Check if we're in the right directory
if [ ! -d "refined_careers" ]; then
    echo "❌ Error: refined_careers directory not found"
    echo "   Make sure you're running this from dream_careers-manager-v2/"
    exit 1
fi

# Check if credentials exist
if [ ! -f "../credentials/serviceAccountKey_Dev.json" ]; then
    echo "❌ Error: Dev credentials not found"
    echo "   Expected: ../credentials/serviceAccountKey_Dev.json"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install -r requirements.txt > /dev/null 2>&1

# Run the upload script
echo "🚀 Starting upload to Firestore..."
python3 upload_dream_careers.py

echo ""
echo "✅ Upload process completed!"
