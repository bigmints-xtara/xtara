#!/bin/bash

# Dream Career Course Refiner

echo "🔄 Dream Career Course Refiner"
echo "=============================="

# Check if Ollama is running, start if not
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "🚀 Starting Ollama..."
    
    # Start Ollama in background
    if command -v ollama &> /dev/null; then
        nohup ollama serve > /dev/null 2>&1 &
        echo "⏳ Waiting for Ollama to start..."
        
        # Wait for Ollama to be ready (max 30 seconds)
        for i in {1..30}; do
            if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
                echo "✅ Ollama is ready with gpt-oss:20b model"
                break
            fi
            sleep 1
        done
        
        # Final check
        if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
            echo "❌ Failed to start Ollama"
            exit 1
        fi
    else
        echo "❌ Ollama not installed. Install from: https://ollama.ai"
        exit 1
    fi
else
    echo "✅ Ollama is running"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pip3 install requests > /dev/null 2>&1

echo "🔄 Starting intelligent course refinement..."
echo "   Using LLM + college database for accurate mapping..."
echo ""

# Run the refiner
python3 course_refiner.py

echo ""
echo "✅ Done! Check the 'refined_careers' folder for results"
