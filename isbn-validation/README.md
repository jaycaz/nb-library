# ISBN Edition Validation

This directory contains a Python script that validates whether each book's ISBN matches its stated edition by looking up metadata via Google Books API (primary) and Open Library API (fallback).

## Files

- `validate_editions.py` - The main validation script
- `edition_check_results.csv` - Results from the validation run
- `PROGRESS.json` - Development progress tracker

## Usage

### Basic usage
```bash
python3 validate_editions.py
```

### Options

- `--dry-run` - Show what would be checked without making API calls
- `--limit N` - Test with a subset of N books
- `--api-key KEY` - Optional Google Books API key for higher rate limits
- `--input FILE` - Input CSV file (default: data.csv)
- `--output FILE` - Output CSV file (default: isbn-validation/edition_check_results.csv)

### Examples

```bash
# Dry run to see what would be checked
python3 validate_editions.py --dry-run

# Test with first 5 books
python3 validate_editions.py --limit 5

# Use API key for higher rate limits
python3 validate_editions.py --api-key YOUR_API_KEY

# Custom input/output files
python3 validate_editions.py --input my_books.csv --output my_results.csv
```

## Results

The script validates 49 books that have both an Edition field and an ISBN in the dataset.

### Summary Statistics

- **Total checked**: 49 books
- **Matches**: 5 (10.2%) - ISBN edition matches CSV edition
- **Mismatches**: 14 (28.6%) - ISBN edition differs from CSV edition
- **Uncertain**: 30 (61.2%) - API doesn't provide clear edition info
- **Not found**: 0 (0.0%) - Book not found in APIs

### Notable Mismatches

Several books have significant edition mismatches where the ISBN points to a different edition than stated in the CSV:

- **A First Course in Probability**: CSV says "Seventh", ISBN is for 9th edition
- **Analytic Trigonometry with Applications**: CSV says "Eighth", ISBN is for 11th edition
- **Elementary Differential Equations**: CSV says "Sixth", ISBN is for 11th edition
- **Meggs' History of Graphic Design**: CSV says "Second", ISBN is for 6th edition

### Match Status Definitions

- `match` - The API's edition info matches the CSV edition
- `mismatch` - The API's edition info differs from the CSV edition
- `uncertain` - The API doesn't provide clear edition information
- `not-found` - The book was not found in either API

## Technical Details

### APIs Used

1. **Google Books API** (primary)
   - Uses the existing Google VolumeID when available (999 books have this)
   - Endpoint: `https://www.googleapis.com/books/v1/volumes/{volumeId}`
   - Free tier: 1,000 requests/day without API key

2. **Open Library API** (fallback)
   - Used when Google VolumeID is not available
   - Endpoint: `https://openlibrary.org/isbn/{isbn}.json`
   - Free tier: unlimited

### Rate Limiting

The script enforces a 1-second delay between API requests to be respectful of the free API tiers.

### Edition Matching

The script normalizes edition strings for comparison:
- "Second", "2nd", "2" all normalize to "2"
- "Third", "3rd", "3" all normalize to "3"
- etc.

Edition information is extracted from:
- Title and subtitle text (e.g., "Book Title - 3rd Edition")
- Description text
- Google Books `contentVersion` field
- Open Library `edition_name` field

## Dependencies

The script uses only Python standard library modules:
- `csv` - CSV file handling
- `json` - JSON parsing
- `re` - Regular expressions for edition extraction
- `sys` - System functions
- `time` - Rate limiting
- `argparse` - Command-line argument parsing
- `urllib.request` - HTTP requests
- `urllib.error` - HTTP error handling

No external dependencies required!
