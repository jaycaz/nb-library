#!/usr/bin/env python3
"""
ISBN Edition Validator

Validates whether each book's ISBN matches its stated edition by looking up
metadata via Google Books API (primary) and Open Library API (fallback).
"""

import csv
import json
import re
import sys
import time
import argparse
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError


def normalize_edition(edition_str):
    """
    Normalize edition strings for comparison.
    Examples: "Second" -> "2", "2nd" -> "2", "Third" -> "3", "3rd" -> "3"
    """
    if not edition_str:
        return None

    edition_str = edition_str.strip().lower()

    # Map word editions to numbers
    word_to_num = {
        'first': '1', '1st': '1',
        'second': '2', '2nd': '2',
        'third': '3', '3rd': '3',
        'fourth': '4', '4th': '4',
        'fifth': '5', '5th': '5',
        'sixth': '6', '6th': '6',
        'seventh': '7', '7th': '7',
        'eighth': '8', '8th': '8',
        'ninth': '9', '9th': '9',
        'tenth': '10', '10th': '10',
        'eleventh': '11', '11th': '11',
        'twelfth': '12', '12th': '12',
        'thirteenth': '13', '13th': '13',
        'fourteenth': '14', '14th': '14',
        'fifteenth': '15', '15th': '15',
    }

    for word, num in word_to_num.items():
        if word in edition_str:
            return num

    # Extract number from string like "2nd edition" or "edition 3"
    match = re.search(r'\d+', edition_str)
    if match:
        return match.group(0)

    # Special cases
    if 'revised' in edition_str or 'rev' in edition_str:
        return 'revised'

    return edition_str


def extract_edition_from_text(text):
    """
    Extract edition information from title, subtitle, or description.
    Returns a normalized edition string or None.
    """
    if not text:
        return None

    text = text.lower()

    # Look for patterns like "2nd edition", "third edition", "revised edition"
    patterns = [
        r'(\d+)(?:st|nd|rd|th)\s+edition',
        r'(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth)\s+edition',
        r'edition\s+(\d+)',
        r'(\d+)(?:st|nd|rd|th)\s+ed\.',
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return normalize_edition(match.group(1))

    # Check for "revised"
    if 'revised edition' in text or 'revised ed.' in text:
        return 'revised'

    return None


def fetch_google_books_by_volumeid(volume_id, api_key=None):
    """
    Fetch book metadata from Google Books API using volume ID.
    Returns a dict with book information or None if not found.
    """
    url = f"https://www.googleapis.com/books/v1/volumes/{volume_id}"
    if api_key:
        url += f"?key={api_key}"

    try:
        request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            return parse_google_books_response(data)
    except HTTPError as e:
        if e.code == 404:
            return None
        raise
    except URLError as e:
        print(f"  Warning: Network error fetching Google Books: {e}", file=sys.stderr)
        return None


def parse_google_books_response(data):
    """Parse Google Books API response and extract relevant fields."""
    if not data or 'volumeInfo' not in data:
        return None

    volume_info = data['volumeInfo']

    # Extract ISBNs
    isbns = []
    if 'industryIdentifiers' in volume_info:
        for identifier in volume_info['industryIdentifiers']:
            if identifier['type'] in ['ISBN_10', 'ISBN_13']:
                isbns.append(identifier['identifier'])

    # Build full title (title + subtitle)
    full_title = volume_info.get('title', '')
    if volume_info.get('subtitle'):
        full_title += f" - {volume_info['subtitle']}"

    # Try to extract edition from title, subtitle, or description
    edition = None
    for text in [volume_info.get('title'), volume_info.get('subtitle'),
                 volume_info.get('description')]:
        edition = extract_edition_from_text(text)
        if edition:
            break

    return {
        'title': full_title,
        'published_date': volume_info.get('publishedDate', ''),
        'isbns': isbns,
        'edition': edition,
        'description': volume_info.get('description', '')[:200] if volume_info.get('description') else ''
    }


def fetch_open_library_by_isbn(isbn):
    """
    Fetch book metadata from Open Library API using ISBN.
    Returns a dict with book information or None if not found.
    """
    url = f"https://openlibrary.org/isbn/{isbn}.json"

    try:
        request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            return parse_open_library_response(data)
    except HTTPError as e:
        if e.code == 404:
            return None
        raise
    except URLError as e:
        print(f"  Warning: Network error fetching Open Library: {e}", file=sys.stderr)
        return None


def parse_open_library_response(data):
    """Parse Open Library API response and extract relevant fields."""
    if not data:
        return None

    # Extract ISBNs
    isbns = []
    for key in ['isbn_10', 'isbn_13']:
        if key in data:
            isbns.extend(data[key])

    # Extract edition
    edition = None
    if 'edition_name' in data:
        edition = normalize_edition(data['edition_name'])

    # Try to extract edition from title if not in edition_name
    if not edition and 'title' in data:
        edition = extract_edition_from_text(data['title'])

    return {
        'title': data.get('title', ''),
        'published_date': data.get('publish_date', ''),
        'isbns': isbns,
        'edition': edition,
        'description': ''
    }


def compare_editions(csv_edition, api_edition):
    """
    Compare CSV edition with API edition.
    Returns: 'match', 'mismatch', or 'uncertain'
    """
    csv_norm = normalize_edition(csv_edition)

    if not api_edition:
        return 'uncertain'

    if csv_norm == api_edition:
        return 'match'

    # Special case: if API has 'revised' and CSV doesn't specify, it's uncertain
    if api_edition == 'revised':
        return 'uncertain'

    return 'mismatch'


def validate_book(book, api_key=None, dry_run=False):
    """
    Validate a single book's edition against API data.
    Returns a result dict.
    """
    title = book['Title']
    author = book['Author']
    csv_edition = book['Edition']
    csv_isbn = book['ISBN']
    volume_id = book.get('Google VolumeID', '').strip()

    result = {
        'Title': title,
        'Author': author,
        'CSV Edition': csv_edition,
        'CSV ISBN': csv_isbn,
        'API Title': '',
        'API Published Date': '',
        'API ISBNs': '',
        'API Edition': '',
        'Source': '',
        'Match Status': 'not-found'
    }

    if dry_run:
        result['Match Status'] = 'dry-run'
        return result

    # Try Google Books first (by volume ID if available)
    api_data = None
    if volume_id:
        print(f"  Fetching from Google Books (volumeId: {volume_id})...", end='', flush=True)
        api_data = fetch_google_books_by_volumeid(volume_id, api_key)
        if api_data:
            result['Source'] = 'google'
            print(" found")
        else:
            print(" not found")

    # Fallback to Open Library
    if not api_data:
        print(f"  Fetching from Open Library (ISBN: {csv_isbn})...", end='', flush=True)
        api_data = fetch_open_library_by_isbn(csv_isbn)
        if api_data:
            result['Source'] = 'openlibrary'
            print(" found")
        else:
            print(" not found")

    # Process API data if found
    if api_data:
        result['API Title'] = api_data['title']
        result['API Published Date'] = api_data['published_date']
        result['API ISBNs'] = ', '.join(api_data['isbns'])
        result['API Edition'] = api_data['edition'] or ''
        result['Match Status'] = compare_editions(csv_edition, api_data['edition'])

    return result


def main():
    parser = argparse.ArgumentParser(
        description='Validate ISBN editions against Google Books and Open Library APIs'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be checked without making API calls'
    )
    parser.add_argument(
        '--limit',
        type=int,
        metavar='N',
        help='Test with a subset of N books'
    )
    parser.add_argument(
        '--api-key',
        metavar='KEY',
        help='Google Books API key for higher rate limits'
    )
    parser.add_argument(
        '--input',
        default='data.csv',
        help='Input CSV file (default: data.csv)'
    )
    parser.add_argument(
        '--output',
        default='isbn-validation/edition_check_results.csv',
        help='Output CSV file (default: isbn-validation/edition_check_results.csv)'
    )

    args = parser.parse_args()

    # Read input CSV
    print(f"Reading {args.input}...")
    with open(args.input, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        books = list(reader)

    # Filter to books with both Edition and ISBN
    books_to_check = [
        b for b in books
        if b.get('Edition', '').strip() and b.get('ISBN', '').strip()
    ]

    print(f"Found {len(books_to_check)} books with both Edition and ISBN")

    # Apply limit if specified
    if args.limit:
        books_to_check = books_to_check[:args.limit]
        print(f"Limiting to first {len(books_to_check)} books")

    if args.dry_run:
        print("\n=== DRY RUN MODE ===")
        print("Books that would be checked:")
        for i, book in enumerate(books_to_check, 1):
            print(f"{i}. {book['Title']} - Edition: {book['Edition']}, ISBN: {book['ISBN']}")
        print(f"\nTotal: {len(books_to_check)} books")
        return

    # Validate each book
    print(f"\nValidating {len(books_to_check)} books...")
    results = []

    for i, book in enumerate(books_to_check, 1):
        print(f"\n[{i}/{len(books_to_check)}] {book['Title']}")
        print(f"  CSV Edition: {book['Edition']}, CSV ISBN: {book['ISBN']}")

        result = validate_book(book, api_key=args.api_key, dry_run=args.dry_run)
        results.append(result)

        if result['Match Status'] != 'not-found':
            print(f"  API Edition: {result['API Edition'] or '(not specified)'}")
            print(f"  Match Status: {result['Match Status']}")

        # Rate limiting: 1 second between requests
        if i < len(books_to_check):
            time.sleep(1)

    # Write results to CSV
    print(f"\nWriting results to {args.output}...")
    fieldnames = [
        'Title', 'Author', 'CSV Edition', 'CSV ISBN',
        'API Title', 'API Published Date', 'API ISBNs', 'API Edition',
        'Source', 'Match Status'
    ]

    with open(args.output, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)

    # Summary statistics
    print("\n=== SUMMARY ===")
    total = len(results)
    matches = sum(1 for r in results if r['Match Status'] == 'match')
    mismatches = sum(1 for r in results if r['Match Status'] == 'mismatch')
    uncertain = sum(1 for r in results if r['Match Status'] == 'uncertain')
    not_found = sum(1 for r in results if r['Match Status'] == 'not-found')

    print(f"Total checked: {total}")
    print(f"Matches: {matches} ({matches/total*100:.1f}%)")
    print(f"Mismatches: {mismatches} ({mismatches/total*100:.1f}%)")
    print(f"Uncertain: {uncertain} ({uncertain/total*100:.1f}%)")
    print(f"Not found: {not_found} ({not_found/total*100:.1f}%)")

    print(f"\nResults saved to {args.output}")


if __name__ == '__main__':
    main()
