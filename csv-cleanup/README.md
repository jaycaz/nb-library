# CSV Cleanup Script

Converts the Noisebridge library's raw export (`data.csv`, 79 columns) into a clean 13-column CSV suitable for Google Sheets.

## Requirements

- Python 3.6+
- No external dependencies (stdlib only)

## Usage

Basic run:

```bash
cd csv-cleanup
python3 clean_library_csv.py --input ../data.csv --output cleaned.csv
```

With a data quality report written to file:

```bash
python3 clean_library_csv.py --input ../data.csv --output cleaned.csv --report report.txt
```

Standardize title capitalization:

```bash
python3 clean_library_csv.py --input ../data.csv --output cleaned.csv --standardize-case
```

Process a subset for testing:

```bash
python3 clean_library_csv.py --input ../data.csv --output cleaned.csv --limit 50
```

All flags can be combined.

## Input Format

The script expects the raw CSV export from the library catalog app (79 columns, UTF-8). The source file is `data.csv` in the repository root.

## Output Format

The output CSV has 13 columns:

| Column | Description |
|--------|-------------|
| Title | Book title |
| Author | Primary author(s), comma-separated |
| ISBN | ISBN-10 or ISBN-13, or `N/A` if missing |
| Publisher | Publisher name, or `Unknown` if missing |
| Year | 4-digit publication year |
| Genre | Subject category |
| Pages | Page count |
| Shelf Location | Physical location in Noisebridge (e.g. `2.10`) |
| Cover URL | Link to cover image |
| Summary | Book description (max 2000 chars) |
| Google VolumeID | Google Books identifier for enrichment |
| Loaned To | Empty (reserved for future lending system) |
| Notes | Auto-generated quality flags (see below) |

## Data Quality Report

The report (printed to console, optionally to file via `--report`) includes:

- **Field completeness** — per-column fill rates with visual bars
- **Required field validation** — checks Title, Author, Shelf Location
- **Quality flags** — counts of issues found (missing ISBN, invalid ISBN, duplicates, etc.)
- **Duplicate entries** — lists all duplicate Title+Author combos and duplicate ISBNs with titles

### Quality Flags in Notes Column

The script auto-generates these flags in the Notes field:

| Flag | Meaning |
|------|---------|
| `MISSING: Title` / `MISSING: Author` | Required field is empty |
| `INVALID ISBN` | ISBN doesn't match ISBN-10 or ISBN-13 format |
| `Missing ISBN` | No ISBN provided |
| `Duplicate ISBN - verify edition` | Same ISBN on multiple entries |
| `Possible duplicate entry` | Same Title+Author on multiple entries |
| `Genre not classified` | Genre field is empty |
| `Publisher unknown` | Publisher field is empty |
| `Summary available via Google Books` | Summary missing but Google VolumeID exists |
| `Cover image available via Google Books` | Cover missing but Google VolumeID exists |

## Known Limitations

- **74 books have no author** in the source data — these are flagged but not fixable by the script
- **2 entries have encoding artifacts** (replacement characters) inherited from the source CSV
- The `--standardize-case` flag uses basic title-case rules that may not handle all edge cases (e.g. acronyms like "3D" become "3d")
- Duplicate detection is exact-match only — near-duplicates (typos, alternate spellings) are not caught

## Updating

When new books are added to `data.csv`, re-run the script to regenerate the cleaned output:

```bash
python3 clean_library_csv.py --input ../data.csv --output cleaned_output.csv --report report.txt
```

Then re-import `cleaned_output.csv` into Google Sheets.
