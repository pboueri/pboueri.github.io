#!/bin/bash

# Script to generate git history for all prompt files
# This should be run before Hugo build

echo "Generating git history for all prompts..."

# Create data directory if it doesn't exist
mkdir -p data

# Initialize the JSON file
echo "{" > data/prompt_history.json
echo '  "prompts": {' >> data/prompt_history.json

FIRST=true

# Find all prompt files in the prompts/ directory
for prompt_file in prompts/[0-9]*.md; do
    if [ -f "$prompt_file" ]; then
        # Extract prompt number from filename (e.g., 005_prompt_diff_viewer.md -> 5)
        basename=$(basename "$prompt_file" .md)
        # Extract just the numeric part at the beginning
        prompt_num=$(echo "$basename" | grep -o '^[0-9]\+' | sed 's/^0*//')  # Extract number, remove leading zeros
        
        echo "Processing: $prompt_file (prompt $prompt_num)"
        
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> data/prompt_history.json
        fi
        
        # Start this prompt's entry
        echo -n "    \"$prompt_num\": [" >> data/prompt_history.json
        
        # Get git log for this file
        COMMIT_FIRST=true
        while IFS='|' read -r HASH DATE MESSAGE; do
            if [ "$COMMIT_FIRST" = true ]; then
                COMMIT_FIRST=false
                echo "" >> data/prompt_history.json
            else
                echo "," >> data/prompt_history.json
            fi
            
            # Get the diff for this commit and properly escape it
            DIFF=$(git show --no-color --pretty="" "$HASH" -- "$prompt_file" | \
                   awk '{
                       gsub(/\\/, "\\\\");
                       gsub(/"/, "\\\"");
                       gsub(/\t/, "\\t");
                       gsub(/\r/, "\\r");
                       printf "%s\\n", $0
                   }' | sed '$ s/\\n$//')
            
            # Get the full file content at this commit
            CONTENT=$(git show "$HASH:$prompt_file" 2>/dev/null | \
                     awk '{
                         gsub(/\\/, "\\\\");
                         gsub(/"/, "\\\"");
                         gsub(/\t/, "\\t");
                         gsub(/\r/, "\\r");
                         printf "%s\\n", $0
                     }' | sed '$ s/\\n$//')
            
            echo -n "      {
        \"hash\": \"$HASH\",
        \"date\": \"$DATE\",
        \"message\": \"$(echo "$MESSAGE" | sed 's/"/\\"/g')\",
        \"diff\": \"$DIFF\",
        \"content\": \"$CONTENT\"
      }" >> data/prompt_history.json
        done < <(git log --pretty=format:"%H|%ad|%s" --date=short -- "$prompt_file")
        
        # Close this prompt's array
        echo -n "
    ]" >> data/prompt_history.json
    fi
done

# Close the JSON structure
echo "
  }
}" >> data/prompt_history.json

echo "Git history generation complete!"