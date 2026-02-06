# Web App Database Update Automation

This document describes the automated process for updating the Noisebridge library web app database from the source `data.csv` file.

## Quick Start

To update the web app database with all default settings:

```bash
./update-web-db.sh --skip-validation
```

To include ISBN validation (slower, but provides additional quality checks):

```bash
./update-web-db.sh
```

## Overview

The `update-web-db.sh` script automates the multi-step process of converting the raw library CSV data into the cleaned format used by the web application. It performs:

1. **CSV Cleanup** - Converts 73-column raw data to 13-column cleaned format
2. **ISBN Validation** (optional) - Validates ISBNs against Google Books and Open Library APIs
3. **Database Deployment** - Copies cleaned CSV to `web-app/public/cleaned_output.csv`

## Script Usage

### Basic Usage

```bash
./update-web-db.sh [OPTIONS]
```

### Options

| Option | Description |
|--------|-------------|
| `--skip-validation` | Skip ISBN validation (faster, recommended for routine updates) |
| `--standardize-case` | Standardize all book titles to Title Case formatting |
| `--report FILE` | Write detailed data quality report to specified file |
| `--help` | Display help message and exit |

### Examples

**Fast update (skip validation):**
```bash
./update-web-db.sh --skip-validation
```

**Full update with title case standardization:**
```bash
./update-web-db.sh --standardize-case
```

**Generate quality report:**
```bash
./update-web-db.sh --skip-validation --report quality-report.txt
```

**Full validation with all options:**
```bash
./update-web-db.sh --standardize-case --report quality-report.txt
```

## What the Script Does

### Step 1: CSV Cleanup

Runs `csv-cleanup/clean_library_csv.py` which:
- Converts 73 raw columns to 13 cleaned columns
- Validates ISBN formats
- Detects duplicate entries
- Flags data quality issues
- Generates completeness statistics

**Output:** `csv-cleanup/cleaned_output.csv`

### Step 2: ISBN Validation (Optional)

Runs `isbn-validation/validate_editions.py` which:
- Validates ISBNs against Google Books API (primary)
- Falls back to Open Library API if needed
- Checks if ISBN matches stated edition
- Rate-limited to 1 request/second (respectful of free API tiers)

**Output:** `isbn-validation/edition_check_results.csv`

**Note:** This step takes several minutes due to API rate limiting. Use `--skip-validation` to skip for faster updates. Validation is informational only and doesn't modify the cleaned CSV.

### Step 3: Database Deployment

- Creates `web-app/public/` directory if needed
- Copies `csv-cleanup/cleaned_output.csv` to `web-app/public/cleaned_output.csv`
- Web app automatically loads this file on startup

## Output Files

After running the script, you'll have:

| File | Description |
|------|-------------|
| `csv-cleanup/cleaned_output.csv` | Cleaned 13-column CSV (intermediate) |
| `web-app/public/cleaned_output.csv` | Web app database (deployed) |
| `isbn-validation/edition_check_results.csv` | ISBN validation results (if not skipped) |
| Custom report file | Data quality report (if `--report` used) |

## Data Quality Report

The script prints a comprehensive quality report showing:

- **Field Completeness** - Fill rates for each column with visual bars
- **Required Field Validation** - Checks for missing critical data
- **Quality Flags** - Counts of various issues (missing ISBN, duplicates, etc.)
- **Duplicate Detection** - Lists of duplicate ISBNs and Title+Author combos

Example output:
```
Total books processed: 1100
Overall data completeness: 86.4%

FIELD COMPLETENESS
  Title                 1100/1100  (100.0%)  [####################]
  Author                1026/1100  ( 93.3%)  [##################..]
  ISBN                   952/1100  ( 86.5%)  [#################...]
  ...

QUALITY FLAGS
  Missing ISBN                                    148
  Duplicate ISBN - verify edition                  50
  Possible duplicate entry                         69
  ...
```

## Testing the Web App

After updating the database:

1. Navigate to the web app directory:
   ```bash
   cd web-app
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

4. Verify:
   - Books load correctly
   - Search works
   - No console errors
   - Book count matches expected (1,100+ books)

## Committing Changes

After verifying the update works:

```bash
# Add all changes
git add csv-cleanup/cleaned_output.csv web-app/public/cleaned_output.csv

# Optionally add validation results
git add isbn-validation/edition_check_results.csv

# Commit with descriptive message
git commit -m "Update web app database from latest data.csv

- Ran cleanup and validation
- Updated web-app/public/cleaned_output.csv
- Data quality: 86.4% completeness, 1100 books"

# Push to remote
git push
```

## When to Update

Run this script whenever:

- Books are added to or removed from `data.csv`
- Book metadata is updated in `data.csv`
- You want to regenerate the web app database from scratch
- You need fresh data quality metrics

## Troubleshooting

### Script fails at CSV cleanup

**Problem:** Python script errors or data issues

**Solution:**
- Check that `data.csv` exists and is valid UTF-8
- Verify Python 3.6+ is installed: `python3 --version`
- Review the error message for specific issues

### ISBN validation times out

**Problem:** API requests take too long or hit rate limits

**Solution:**
- Use `--skip-validation` to skip this step
- The validation is informational only and doesn't affect the web app
- If you need validation, consider running it separately overnight

### Web app doesn't show updated data

**Problem:** Browser cache or build issues

**Solution:**
- Hard refresh the browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux)
- Clear browser cache
- Restart the dev server (`npm run dev`)
- Check that `web-app/public/cleaned_output.csv` was actually updated

### Permission denied when running script

**Problem:** Script not executable

**Solution:**
```bash
chmod +x update-web-db.sh
```

## Technical Details

### Prerequisites

- Python 3.6 or higher
- Bash shell (macOS, Linux, WSL, or Git Bash on Windows)
- Source file: `data.csv` in repository root
- Internet connection (for ISBN validation step only)

### Dependencies

All Python scripts use standard library only:
- `csv`, `json`, `re`, `sys`, `time`, `argparse`, `urllib`
- No external packages required

### Performance

- **Fast mode** (`--skip-validation`): ~5-10 seconds
- **Full validation**: 5-10 minutes (depends on network speed and API rate limits)

### Safety

- Script uses `set -e` to exit on any error
- Creates directories as needed (won't fail if they already exist)
- Validates prerequisites before running
- Colored output for easy status tracking

## References

- [CSV Cleanup Documentation](csv-cleanup/README.md)
- [ISBN Validation Documentation](isbn-validation/README.md)
- [Web App Documentation](web-app/README.md)
- [GitHub Issue #7](https://github.com/jaycaz/nb-library/issues/7)
