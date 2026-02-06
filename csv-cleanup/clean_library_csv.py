#!/usr/bin/env python3
"""
CSV Cleanup Script for Noisebridge Library
Converts messy source CSV (79 columns) to clean schema (14 columns)
"""

import csv
import sys
import argparse
import re
from typing import Dict, List, Tuple


# Output column order (critical - must match schema)
OUTPUT_COLUMNS = [
    "Title",
    "Author",
    "Series",
    "ISBN",
    "Publisher",
    "Year",
    "Genre",
    "Pages",
    "Shelf Location",
    "Cover URL",
    "Summary",
    "Google VolumeID",
    "Loaned To",
    "Notes"
]


def read_csv(filepath: str) -> List[Dict[str, str]]:
    """
    Read input CSV with proper encoding handling.

    Args:
        filepath: Path to input CSV file

    Returns:
        List of row dictionaries
    """
    rows = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
        print(f"✓ Read {len(rows)} rows from {filepath}")
        return rows
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading CSV: {e}", file=sys.stderr)
        sys.exit(1)


def normalize_empty(value: str) -> str:
    """
    Normalize None/empty/whitespace to empty string.
    Strips leading and trailing whitespace from all fields.
    """
    if value is None:
        return ""
    value = str(value).strip()
    return "" if value in ("", "None", "none", "NULL", "null") else value


def validate_isbn(isbn: str) -> Tuple[bool, str]:
    """
    Validate and clean ISBN-10 or ISBN-13 format.

    Args:
        isbn: ISBN string to validate

    Returns:
        Tuple of (is_valid, cleaned_isbn)
        - is_valid: True if ISBN format is correct
        - cleaned_isbn: ISBN with hyphens removed, or original if invalid
    """
    isbn = normalize_empty(isbn)
    if not isbn:
        return (True, "")  # Empty ISBN is valid (will be flagged as missing elsewhere)

    # Remove hyphens and spaces for validation
    cleaned = re.sub(r'[\s\-]', '', isbn)

    # Check ISBN-10 (10 digits, last char can be X)
    if len(cleaned) == 10:
        if re.match(r'^\d{9}[\dX]$', cleaned, re.IGNORECASE):
            return (True, cleaned)
        else:
            return (False, isbn)

    # Check ISBN-13 (13 digits)
    elif len(cleaned) == 13:
        if re.match(r'^\d{13}$', cleaned):
            return (True, cleaned)
        else:
            return (False, isbn)

    # Invalid length or format
    return (False, isbn)


def parse_int(value: str, min_val: int = None, max_val: int = None) -> str:
    """
    Parse integer with optional min/max validation.

    Returns:
        Integer as string if valid, empty string otherwise
    """
    value = normalize_empty(value)
    if not value:
        return ""

    try:
        num = int(float(value))  # Handle "2010.0" style numbers
        if min_val is not None and num < min_val:
            return ""
        if max_val is not None and num > max_val:
            return ""
        return str(num)
    except (ValueError, TypeError):
        return ""


def is_valid_url(value: str) -> bool:
    """Basic URL validation - check for http/https prefix."""
    value = normalize_empty(value)
    return value.startswith(('http://', 'https://'))


def truncate_summary(summary: str, max_len: int = 2000) -> str:
    """Truncate summary to max length with ellipsis if needed."""
    summary = normalize_empty(summary)
    if len(summary) > max_len:
        return summary[:max_len - 3] + "..."
    return summary


def standardize_title_case(title: str) -> str:
    """
    Standardize title to title case using smart capitalization rules.

    Args:
        title: Title string to standardize

    Returns:
        Title in standardized title case
    """
    title = normalize_empty(title)
    if not title:
        return title

    # Articles, conjunctions, and short prepositions to keep lowercase
    # (unless they're the first or last word)
    lowercase_words = {
        'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of',
        'on', 'or', 'the', 'to', 'via', 'with'
    }

    words = title.split()
    result = []

    for i, word in enumerate(words):
        # Always capitalize first and last words
        if i == 0 or i == len(words) - 1:
            result.append(word.capitalize())
        # Keep lowercase words lowercase if they're in the middle
        elif word.lower() in lowercase_words:
            result.append(word.lower())
        # Capitalize all other words
        else:
            result.append(word.capitalize())

    return ' '.join(result)


def flag_issues(entry: Dict[str, str]) -> List[str]:
    """
    Check for data quality issues in a cleaned entry.

    Args:
        entry: Cleaned entry dictionary

    Returns:
        List of issue strings describing problems found
    """
    issues = []

    # Required field checks
    if not normalize_empty(entry.get("Title", "")):
        issues.append("MISSING: Title")

    if not normalize_empty(entry.get("Author", "")):
        issues.append("MISSING: Author")

    return issues


def generate_notes(source_row: Dict[str, str], cleaned_row: Dict[str, str],
                   duplicate_isbns: set, duplicate_titles: set) -> str:
    """
    Generate quality flags for Notes field.

    Args:
        source_row: Original source row
        cleaned_row: Cleaned output row
        duplicate_isbns: Set of ISBNs that appear multiple times
        duplicate_titles: Set of Title+Author combos that appear multiple times

    Returns:
        Semicolon-separated notes string
    """
    notes = []

    # Check for required field issues using flag_issues()
    field_issues = flag_issues(cleaned_row)
    notes.extend(field_issues)

    # Validate ISBN format
    isbn = normalize_empty(source_row.get("ISBN", ""))
    if isbn:
        is_valid, _ = validate_isbn(isbn)
        if not is_valid:
            notes.append("INVALID ISBN")

    # Check for missing ISBN
    if cleaned_row["ISBN"] == "N/A":
        notes.append("Missing ISBN")

    # Check for duplicate ISBN
    if isbn and isbn in duplicate_isbns:
        notes.append("Duplicate ISBN - verify edition")

    # Check for duplicate Title+Author
    title_author = f"{cleaned_row['Title']}|{cleaned_row['Author']}"
    if title_author in duplicate_titles:
        notes.append("Possible duplicate entry")

    # Check for missing Genre
    if not cleaned_row["Genre"]:
        notes.append("Genre not classified")

    # Check for missing Publisher
    if cleaned_row["Publisher"] == "Unknown":
        notes.append("Publisher unknown")

    # Check for available Google Books enrichment
    has_volume_id = bool(cleaned_row["Google VolumeID"])
    if has_volume_id:
        if not cleaned_row["Summary"]:
            notes.append("Summary available via Google Books")
        if not cleaned_row["Cover URL"]:
            notes.append("Cover image available via Google Books")

    return "; ".join(notes)


def clean_entry(row: Dict[str, str], duplicate_isbns: set,
                duplicate_titles: set, standardize_case: bool = False) -> Dict[str, str]:
    """
    Map and clean a single book entry per schema.

    Args:
        row: Source row dictionary
        duplicate_isbns: Set of duplicate ISBNs
        duplicate_titles: Set of duplicate Title+Author combos
        standardize_case: If True, standardize title to title case

    Returns:
        Cleaned row dictionary with 13 output columns
    """
    cleaned = {}

    # Direct copy fields with normalization
    title = normalize_empty(row.get("Title", ""))
    if standardize_case and title:
        title = standardize_title_case(title)
    cleaned["Title"] = title

    cleaned["Author"] = normalize_empty(row.get("Author", ""))
    cleaned["Series"] = normalize_empty(row.get("Series", ""))
    cleaned["Genre"] = normalize_empty(row.get("Genre", ""))
    cleaned["Summary"] = truncate_summary(row.get("Summary", ""))
    cleaned["Google VolumeID"] = normalize_empty(row.get("Google VolumeID", ""))

    # ISBN with default
    isbn = normalize_empty(row.get("ISBN", ""))
    cleaned["ISBN"] = isbn if isbn else "N/A"

    # Publisher with default
    publisher = normalize_empty(row.get("Publisher", ""))
    cleaned["Publisher"] = publisher if publisher else "Unknown"

    # Integer fields with validation
    cleaned["Year"] = parse_int(row.get("Year Published", ""), min_val=1000, max_val=2100)
    cleaned["Pages"] = parse_int(row.get("Number of Pages", ""), min_val=1)

    # Shelf Location (direct rename from Category)
    cleaned["Shelf Location"] = normalize_empty(row.get("Category", ""))

    # Cover URL with validation
    cover_url = normalize_empty(row.get("Uploaded Image URL", ""))
    cleaned["Cover URL"] = cover_url if is_valid_url(cover_url) else ""

    # Empty/future fields
    cleaned["Loaned To"] = ""

    # Generated Notes field
    cleaned["Notes"] = generate_notes(row, cleaned, duplicate_isbns, duplicate_titles)

    return cleaned


def check_duplicates(all_entries: List[Dict[str, str]]) -> List[List[Dict[str, str]]]:
    """
    Find and group duplicate entries by Title+Author combination.

    Args:
        all_entries: List of all book entry dictionaries

    Returns:
        List of duplicate groups, where each group is a list of entries
        with the same Title+Author combination
    """
    title_author_groups = {}

    for entry in all_entries:
        title = normalize_empty(entry.get("Title", ""))
        author = normalize_empty(entry.get("Author", ""))

        if title and author:
            key = f"{title}|{author}"
            if key not in title_author_groups:
                title_author_groups[key] = []
            title_author_groups[key].append(entry)

    # Return only groups with more than one entry (duplicates)
    duplicate_groups = [group for group in title_author_groups.values() if len(group) > 1]
    return duplicate_groups


def find_duplicates(rows: List[Dict[str, str]]) -> tuple:
    """
    Find duplicate ISBNs and Title+Author combinations.

    Returns:
        Tuple of (duplicate_isbns_set, duplicate_title_author_set)
    """
    isbn_counts = {}
    title_author_counts = {}

    for row in rows:
        # Track ISBNs
        isbn = normalize_empty(row.get("ISBN", ""))
        if isbn:
            isbn_counts[isbn] = isbn_counts.get(isbn, 0) + 1

        # Track Title+Author combos
        title = normalize_empty(row.get("Title", ""))
        author = normalize_empty(row.get("Author", ""))
        if title and author:
            key = f"{title}|{author}"
            title_author_counts[key] = title_author_counts.get(key, 0) + 1

    # Find duplicates (appearing more than once)
    duplicate_isbns = {isbn for isbn, count in isbn_counts.items() if count > 1}
    duplicate_titles = {key for key, count in title_author_counts.items() if count > 1}

    return duplicate_isbns, duplicate_titles


def write_csv(data: List[Dict[str, str]], filepath: str) -> None:
    """
    Write cleaned data to output CSV.

    Args:
        data: List of cleaned row dictionaries
        filepath: Output file path
    """
    try:
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=OUTPUT_COLUMNS)
            writer.writeheader()
            writer.writerows(data)
        print(f"✓ Wrote {len(data)} rows to {filepath}")
    except Exception as e:
        print(f"Error writing CSV: {e}", file=sys.stderr)
        sys.exit(1)


def collect_stats(cleaned_data: List[Dict[str, str]],
                  duplicate_isbns: set, duplicate_titles: set) -> Dict:
    """
    Collect comprehensive statistics from cleaned data.

    Args:
        cleaned_data: List of cleaned row dictionaries
        duplicate_isbns: Set of ISBNs that appear multiple times
        duplicate_titles: Set of Title+Author combos that appear multiple times

    Returns:
        Dictionary of statistics for report generation
    """
    total = len(cleaned_data)

    # Field completeness counts
    filled = {col: 0 for col in OUTPUT_COLUMNS}
    for row in cleaned_data:
        for col in OUTPUT_COLUMNS:
            val = row.get(col, "")
            if val and val not in ("N/A", "Unknown"):
                filled[col] += 1

    # Quality flag counts
    flag_counts = {
        "MISSING: Title": 0,
        "MISSING: Author": 0,
        "Missing ISBN": 0,
        "INVALID ISBN": 0,
        "Duplicate ISBN - verify edition": 0,
        "Possible duplicate entry": 0,
        "Genre not classified": 0,
        "Publisher unknown": 0,
        "Summary available via Google Books": 0,
        "Cover image available via Google Books": 0,
    }

    flagged_rows = []
    for i, row in enumerate(cleaned_data):
        notes = row["Notes"]
        if not notes:
            continue
        flagged_rows.append((i + 1, row["Title"], row["Author"], notes))
        for flag in flag_counts:
            if flag in notes:
                flag_counts[flag] += 1

    # Duplicate title details
    dup_title_details = []
    for key in sorted(duplicate_titles):
        title, author = key.split("|", 1)
        count = sum(1 for r in cleaned_data
                    if r["Title"] == title and r["Author"] == author)
        dup_title_details.append((title, author, count))

    # Duplicate ISBN details
    dup_isbn_details = []
    for isbn in sorted(duplicate_isbns):
        titles = [r["Title"] for r in cleaned_data
                  if r["ISBN"] == isbn]
        dup_isbn_details.append((isbn, titles))

    # Overall completeness: percentage of non-empty cells across all columns
    # (excluding Loaned To and Notes which are expected to be sparse)
    data_columns = [c for c in OUTPUT_COLUMNS if c not in ("Loaned To", "Notes")]
    total_cells = total * len(data_columns)
    filled_cells = sum(filled[c] for c in data_columns)
    completeness_pct = (filled_cells / total_cells * 100) if total_cells else 0

    return {
        "total": total,
        "filled": filled,
        "flag_counts": flag_counts,
        "flagged_rows": flagged_rows,
        "dup_title_details": dup_title_details,
        "dup_isbn_details": dup_isbn_details,
        "completeness_pct": completeness_pct,
    }


def generate_report(stats: Dict) -> str:
    """
    Format a plain-text data quality report from collected stats.

    Args:
        stats: Statistics dictionary from collect_stats()

    Returns:
        Formatted report string
    """
    total = stats["total"]
    filled = stats["filled"]
    flag_counts = stats["flag_counts"]
    lines = []

    lines.append("=" * 60)
    lines.append("NOISEBRIDGE LIBRARY — DATA QUALITY REPORT")
    lines.append("=" * 60)

    # --- Overview ---
    lines.append("")
    lines.append(f"Total books processed: {total}")
    lines.append(f"Overall data completeness: {stats['completeness_pct']:.1f}%")

    # --- Field completeness ---
    lines.append("")
    lines.append("-" * 60)
    lines.append("FIELD COMPLETENESS")
    lines.append("-" * 60)
    for col in OUTPUT_COLUMNS:
        if col in ("Loaned To", "Notes"):
            continue
        count = filled[col]
        pct = count / total * 100 if total else 0
        bar = "#" * int(pct // 5) + "." * (20 - int(pct // 5))
        lines.append(f"  {col:<20s} {count:>5d}/{total}  ({pct:5.1f}%)  [{bar}]")

    # --- Required fields ---
    lines.append("")
    lines.append("-" * 60)
    lines.append("REQUIRED FIELD VALIDATION")
    lines.append("-" * 60)
    required = ["Title", "Author", "Shelf Location"]
    all_ok = True
    for col in required:
        missing = total - filled[col]
        status = "OK" if missing == 0 else f"MISSING {missing}"
        if missing > 0:
            all_ok = False
        lines.append(f"  {col:<20s} {status}")
    if all_ok:
        lines.append("  All required fields populated.")
    else:
        lines.append("  WARNING: Some required fields are missing!")

    # --- Quality flags ---
    lines.append("")
    lines.append("-" * 60)
    lines.append("QUALITY FLAGS")
    lines.append("-" * 60)
    flagged_total = len(stats["flagged_rows"])
    lines.append(f"  Entries flagged for review: {flagged_total}"
                 f" ({flagged_total / total * 100:.1f}%)" if total else "")
    lines.append("")
    for flag, count in flag_counts.items():
        if count > 0:
            lines.append(f"  {flag:<45s} {count:>5d}")

    # --- Duplicates ---
    lines.append("")
    lines.append("-" * 60)
    lines.append("DUPLICATE ENTRIES")
    lines.append("-" * 60)

    dup_titles = stats["dup_title_details"]
    lines.append(f"  Duplicate Title+Author combinations: {len(dup_titles)}")
    for title, author, count in dup_titles:
        display_title = title if len(title) <= 40 else title[:37] + "..."
        lines.append(f"    [{count}x] {display_title} — {author}")

    lines.append("")
    dup_isbns = stats["dup_isbn_details"]
    lines.append(f"  Duplicate ISBNs: {len(dup_isbns)}")
    for isbn, titles in dup_isbns:
        lines.append(f"    ISBN {isbn}:")
        for t in titles:
            display_t = t if len(t) <= 50 else t[:47] + "..."
            lines.append(f"      - {display_t}")

    lines.append("")
    lines.append("=" * 60)
    lines.append("END OF REPORT")
    lines.append("=" * 60)

    return "\n".join(lines)


def main():
    """Main script orchestration."""
    parser = argparse.ArgumentParser(
        description="Clean Noisebridge library CSV from 79 to 13 columns"
    )
    parser.add_argument(
        "--input",
        default="../data.csv",
        help="Input CSV file path (default: ../data.csv)"
    )
    parser.add_argument(
        "--output",
        default="cleaned.csv",
        help="Output CSV file path (default: cleaned.csv)"
    )
    parser.add_argument(
        "--limit",
        type=int,
        help="Process only first N rows (for testing)"
    )
    parser.add_argument(
        "--standardize-case",
        action="store_true",
        help="Standardize title case for book titles"
    )
    parser.add_argument(
        "--report",
        metavar="FILEPATH",
        help="Write data quality report to a file (in addition to console)"
    )

    args = parser.parse_args()

    print("Noisebridge Library CSV Cleanup")
    print("=" * 60)

    # Read source data
    source_data = read_csv(args.input)

    # Apply limit if specified (for testing)
    if args.limit:
        source_data = source_data[:args.limit]
        print(f"✓ Limited to first {args.limit} rows for testing")

    # Find duplicates for quality flagging
    print("✓ Analyzing duplicates...")
    duplicate_isbns, duplicate_titles = find_duplicates(source_data)
    print(f"  - Found {len(duplicate_isbns)} duplicate ISBNs")
    print(f"  - Found {len(duplicate_titles)} duplicate Title+Author combos")

    # Clean all entries
    print("✓ Cleaning entries...")
    if args.standardize_case:
        print("✓ Standardizing title case...")
    cleaned_data = []
    for row in source_data:
        cleaned = clean_entry(row, duplicate_isbns, duplicate_titles, args.standardize_case)
        cleaned_data.append(cleaned)

    # Write output
    write_csv(cleaned_data, args.output)

    # Generate and display report
    stats = collect_stats(cleaned_data, duplicate_isbns, duplicate_titles)
    report = generate_report(stats)
    print("\n" + report)

    if args.report:
        try:
            with open(args.report, 'w', encoding='utf-8') as f:
                f.write(report + "\n")
            print(f"\n✓ Report written to {args.report}")
        except Exception as e:
            print(f"Error writing report: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
