#!/bin/bash

# update-web-db.sh
#
# Automates the conversion of data.csv to the web app database
# Performs validation and cleanup steps to prepare cleaned_output.csv for the web UI
#
# Usage: ./update-web-db.sh [OPTIONS]
#
# Options:
#   --skip-validation    Skip ISBN validation step (faster, validation only)
#   --standardize-case   Standardize title capitalization to Title Case
#   --report FILE        Write data quality report to FILE
#   --help              Show this help message
#
# Example:
#   ./update-web-db.sh --standardize-case --report quality-report.txt

set -e  # Exit on any error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
SKIP_VALIDATION=false
STANDARDIZE_CASE=""
REPORT_FILE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-validation)
            SKIP_VALIDATION=true
            shift
            ;;
        --standardize-case)
            STANDARDIZE_CASE="--standardize-case"
            shift
            ;;
        --report)
            REPORT_FILE="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Automates the conversion of data.csv to the web app database."
            echo ""
            echo "Options:"
            echo "  --skip-validation    Skip ISBN validation step (faster)"
            echo "  --standardize-case   Standardize title capitalization to Title Case"
            echo "  --report FILE        Write data quality report to FILE"
            echo "  --help              Show this help message"
            echo ""
            echo "Example:"
            echo "  $0 --standardize-case --report quality-report.txt"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if [ ! -f "data.csv" ]; then
    echo -e "${RED}Error: data.csv not found in current directory${NC}"
    exit 1
fi

if [ ! -f "csv-cleanup/clean_library_csv.py" ]; then
    echo -e "${RED}Error: csv-cleanup/clean_library_csv.py not found${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 not found. Please install Python 3.6+${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites OK${NC}"
echo ""

# Step 1: Run CSV cleanup script
echo -e "${BLUE}Step 1: Running CSV cleanup script...${NC}"

CLEANUP_ARGS="--input data.csv --output csv-cleanup/cleaned_output.csv"

if [ -n "$STANDARDIZE_CASE" ]; then
    CLEANUP_ARGS="$CLEANUP_ARGS $STANDARDIZE_CASE"
    echo "  - Title case standardization: ENABLED"
fi

if [ -n "$REPORT_FILE" ]; then
    CLEANUP_ARGS="$CLEANUP_ARGS --report $REPORT_FILE"
    echo "  - Quality report: $REPORT_FILE"
fi

echo ""
python3 csv-cleanup/clean_library_csv.py $CLEANUP_ARGS

if [ $? -ne 0 ]; then
    echo -e "${RED}CSV cleanup failed${NC}"
    exit 1
fi

echo -e "${GREEN}CSV cleanup complete${NC}"
echo ""

# Step 2: Optionally run ISBN validation
if [ "$SKIP_VALIDATION" = false ]; then
    echo -e "${BLUE}Step 2: Running ISBN validation (this may take a few minutes)...${NC}"

    if [ ! -f "isbn-validation/validate_editions.py" ]; then
        echo -e "${YELLOW}Warning: isbn-validation/validate_editions.py not found, skipping validation${NC}"
    else
        echo "  - This step validates ISBNs against Google Books and Open Library APIs"
        echo "  - Results will be saved to isbn-validation/edition_check_results.csv"
        echo "  - Use --skip-validation to skip this step for faster updates"
        echo ""

        python3 isbn-validation/validate_editions.py --input csv-cleanup/cleaned_output.csv \
            --output isbn-validation/edition_check_results.csv || {
            echo -e "${YELLOW}Warning: ISBN validation failed, continuing anyway${NC}"
        }

        echo -e "${GREEN}ISBN validation complete${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}Step 2: Skipping ISBN validation (--skip-validation flag set)${NC}"
    echo ""
fi

# Step 3: Copy cleaned CSV to web app public directory
echo -e "${BLUE}Step 3: Copying cleaned CSV to web app...${NC}"

# Create web-app/public directory if it doesn't exist
mkdir -p web-app/public

# Copy the cleaned CSV
cp csv-cleanup/cleaned_output.csv web-app/public/cleaned_output.csv

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to copy CSV to web app${NC}"
    exit 1
fi

echo -e "${GREEN}CSV copied to web-app/public/cleaned_output.csv${NC}"
echo ""

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Database update complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Files generated:"
echo "  - csv-cleanup/cleaned_output.csv (cleaned 13-column CSV)"
echo "  - web-app/public/cleaned_output.csv (web app database)"

if [ "$SKIP_VALIDATION" = false ]; then
    echo "  - isbn-validation/edition_check_results.csv (validation results)"
fi

if [ -n "$REPORT_FILE" ]; then
    echo "  - $REPORT_FILE (data quality report)"
fi

echo ""
echo "Next steps:"
echo "  1. Review the data quality report (if generated)"
echo "  2. Test the web app: cd web-app && npm run dev"
echo "  3. Commit changes: git add . && git commit -m 'Update web app database'"
echo ""
