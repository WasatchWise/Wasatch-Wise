#!/bin/bash

# Monthly YouTube Video Fidelity Check
# Run this script monthly to ensure video quality

echo "🎬 Running Monthly YouTube Video Fidelity Check..."
echo ""

# Change to project directory
cd "$(dirname "$0")/.."

# Run fidelity checker
node check-youtube-fidelity.mjs

# Check if there are issues
RELEVANCE_RATE=$(node -e "
  const fs = require('fs');
  const report = JSON.parse(fs.readFileSync('youtube-fidelity-report.json', 'utf8'));
  const rate = (report.relevant / report.checked * 100).toFixed(1);
  console.log(rate);
")

ERROR_RATE=$(node -e "
  const fs = require('fs');
  const report = JSON.parse(fs.readFileSync('youtube-fidelity-report.json', 'utf8'));
  const rate = (report.errors / report.checked * 100).toFixed(1);
  console.log(rate);
")

echo ""
echo "📊 Results:"
echo "   Relevance Rate: ${RELEVANCE_RATE}%"
echo "   Error Rate: ${ERROR_RATE}%"
echo ""

# Alert if issues found
if (( $(echo "$RELEVANCE_RATE < 80" | bc -l) )); then
  echo "⚠️  WARNING: Relevance rate below 80% - Review recommended"
fi

if (( $(echo "$ERROR_RATE > 10" | bc -l) )); then
  echo "⚠️  WARNING: Error rate above 10% - Broken links detected"
fi

echo ""
echo "✅ Check complete. Review youtube-fidelity-report.json for details."

