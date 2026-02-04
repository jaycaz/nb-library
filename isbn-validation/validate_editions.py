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
from urllib.parse import quote_plus


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


def search_correct_isbn(title, author, edition, api_key=None):
    """
    Search for the correct ISBN for a book given title, author, and edition.
    Returns a dict with suggested ISBN, source, confidence, and notes.
    """
    result = {
        'suggested_isbn': '',
        'source': '',
        'confidence': 'low',
        'notes': ''
    }

    # Search Google Books
    query = f"intitle:{title}"
    if author:
        # Extract first author's last name for better search
        author_part = author.split(',')[0].strip() if ',' in author else author.split()[0] if author.split() else author
        query += f"+inauthor:{author_part}"

    # URL encode the query
    encoded_query = quote_plus(query)
    url = f"https://www.googleapis.com/books/v1/volumes?q={encoded_query}"
    if api_key:
        url += f"&key={api_key}"

    try:
        request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))

            if not data.get('items'):
                result['notes'] = 'No results found in Google Books'
                return result

            # Normalize the target edition for comparison
            target_edition = normalize_edition(edition)

            # Search through results for matching edition
            for item in data.get('items', [])[:10]:  # Check first 10 results
                volume_info = item.get('volumeInfo', {})

                # Extract edition from this result
                api_edition = None
                for text in [volume_info.get('title'), volume_info.get('subtitle'),
                             volume_info.get('description')]:
                    api_edition = extract_edition_from_text(text)
                    if api_edition:
                        break

                # Check if title is similar
                api_title = volume_info.get('title', '').lower()
                search_title = title.lower()
                title_match = search_title in api_title or api_title in search_title

                # Extract ISBNs from this result
                isbns = []
                if 'industryIdentifiers' in volume_info:
                    for identifier in volume_info['industryIdentifiers']:
                        if identifier['type'] in ['ISBN_10', 'ISBN_13']:
                            isbns.append(identifier['identifier'])

                if not isbns:
                    continue

                # Determine confidence
                if api_edition == target_edition and title_match:
                    result['suggested_isbn'] = isbns[0]
                    result['source'] = 'google'
                    result['confidence'] = 'high'
                    result['notes'] = f"Exact match: edition {api_edition}, title '{volume_info.get('title')}'"
                    return result
                elif title_match and api_edition:
                    if not result['suggested_isbn']:  # Only set if we haven't found anything better
                        result['suggested_isbn'] = isbns[0]
                        result['source'] = 'google'
                        result['confidence'] = 'medium'
                        result['notes'] = f"Title match with edition {api_edition} (looking for {target_edition})"
                elif title_match:
                    if not result['suggested_isbn']:
                        result['suggested_isbn'] = isbns[0]
                        result['source'] = 'google'
                        result['confidence'] = 'low'
                        result['notes'] = f"Title match but edition unclear from '{volume_info.get('title')}'"

            if not result['suggested_isbn']:
                result['notes'] = f"Found results but no edition match for edition {target_edition}"

    except (HTTPError, URLError) as e:
        result['notes'] = f"Error searching Google Books: {e}"

    return result


def search_correct_isbn_openlibrary(title, author, edition):
    """
    Search Open Library for the correct ISBN.
    Returns a dict with suggested ISBN, source, confidence, and notes.
    """
    result = {
        'suggested_isbn': '',
        'source': '',
        'confidence': 'low',
        'notes': ''
    }

    # Search Open Library
    encoded_title = quote_plus(title)
    url = f"https://openlibrary.org/search.json?title={encoded_title}"
    if author:
        encoded_author = quote_plus(author)
        url += f"&author={encoded_author}"

    try:
        request = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))

            if not data.get('docs'):
                result['notes'] = 'No results found in Open Library'
                return result

            target_edition = normalize_edition(edition)

            # Check first few results
            for doc in data.get('docs', [])[:5]:
                # Get work key to fetch editions
                work_key = doc.get('key')
                if not work_key:
                    continue

                # Fetch editions for this work
                editions_url = f"https://openlibrary.org{work_key}/editions.json"
                try:
                    editions_request = Request(editions_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urlopen(editions_request, timeout=10) as editions_response:
                        editions_data = json.loads(editions_response.read().decode('utf-8'))

                        for ed in editions_data.get('entries', [])[:10]:
                            # Extract edition
                            api_edition = None
                            if 'edition_name' in ed:
                                api_edition = normalize_edition(ed['edition_name'])

                            # Extract ISBNs
                            isbns = []
                            for key in ['isbn_13', 'isbn_10']:
                                if key in ed:
                                    isbns.extend(ed[key])

                            if not isbns:
                                continue

                            # Check for match
                            if api_edition == target_edition:
                                result['suggested_isbn'] = isbns[0]
                                result['source'] = 'openlibrary'
                                result['confidence'] = 'high'
                                result['notes'] = f"Exact match: edition {api_edition}"
                                return result
                            elif api_edition and not result['suggested_isbn']:
                                result['suggested_isbn'] = isbns[0]
                                result['source'] = 'openlibrary'
                                result['confidence'] = 'medium'
                                result['notes'] = f"Found edition {api_edition} (looking for {target_edition})"

                except (HTTPError, URLError):
                    continue

            if not result['suggested_isbn']:
                result['notes'] = f"Found work but no edition match for edition {target_edition}"

    except (HTTPError, URLError) as e:
        result['notes'] = f"Error searching Open Library: {e}"

    return result


def repair_mismatches(results_file, output_file, api_key=None):
    """
    Read mismatch results and search for correct ISBNs.
    Outputs repair suggestions to a CSV file.
    """
    print(f"Reading mismatches from {results_file}...")

    with open(results_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        mismatches = [row for row in reader if row['Match Status'] == 'mismatch']

    print(f"Found {len(mismatches)} mismatches to repair")

    suggestions = []

    for i, mismatch in enumerate(mismatches, 1):
        print(f"\n[{i}/{len(mismatches)}] {mismatch['Title']}")
        print(f"  Current: Edition {mismatch['CSV Edition']}, ISBN {mismatch['CSV ISBN']}")
        print(f"  API says: Edition {mismatch['API Edition']}")
        print(f"  Searching for correct ISBN...")

        # Try Google Books first
        result = search_correct_isbn(
            mismatch['Title'],
            mismatch['Author'],
            mismatch['CSV Edition'],
            api_key
        )

        # If no good result from Google Books, try Open Library
        if result['confidence'] == 'low' or not result['suggested_isbn']:
            print(f"  Trying Open Library...")
            ol_result = search_correct_isbn_openlibrary(
                mismatch['Title'],
                mismatch['Author'],
                mismatch['CSV Edition']
            )

            # Use Open Library result if it's better
            if ol_result['confidence'] == 'high' or (ol_result['suggested_isbn'] and not result['suggested_isbn']):
                result = ol_result

        suggestion = {
            'Title': mismatch['Title'],
            'Author': mismatch['Author'],
            'Current ISBN': mismatch['CSV ISBN'],
            'Current Edition': mismatch['CSV Edition'],
            'API Found Edition': mismatch['API Edition'],
            'Suggested ISBN': result['suggested_isbn'],
            'Suggested ISBN Source': result['source'],
            'Confidence': result['confidence'],
            'Notes': result['notes']
        }

        suggestions.append(suggestion)

        print(f"  Result: {result['confidence']} confidence")
        if result['suggested_isbn']:
            print(f"  Suggested ISBN: {result['suggested_isbn']} (from {result['source']})")
        print(f"  Notes: {result['notes']}")

        # Rate limiting
        if i < len(mismatches):
            time.sleep(1)

    # Write suggestions to CSV
    print(f"\nWriting repair suggestions to {output_file}...")
    fieldnames = [
        'Title', 'Author', 'Current ISBN', 'Current Edition', 'API Found Edition',
        'Suggested ISBN', 'Suggested ISBN Source', 'Confidence', 'Notes'
    ]

    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(suggestions)

    # Summary
    print("\n=== REPAIR SUMMARY ===")
    total = len(suggestions)
    high_conf = sum(1 for s in suggestions if s['Confidence'] == 'high')
    medium_conf = sum(1 for s in suggestions if s['Confidence'] == 'medium')
    low_conf = sum(1 for s in suggestions if s['Confidence'] == 'low')

    print(f"Total mismatches: {total}")
    print(f"High confidence repairs: {high_conf}")
    print(f"Medium confidence repairs: {medium_conf}")
    print(f"Low confidence repairs: {low_conf}")
    print(f"\nSuggestions saved to {output_file}")


def apply_repairs(suggestions_file, data_file):
    """
    Apply high-confidence repair suggestions to data.csv.
    Creates a backup first.
    """
    print(f"Reading repair suggestions from {suggestions_file}...")

    with open(suggestions_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        suggestions = [row for row in reader if row['Confidence'] == 'high' and row['Suggested ISBN']]

    print(f"Found {len(suggestions)} high-confidence repairs to apply")

    if not suggestions:
        print("No high-confidence repairs to apply.")
        return

    # Create backup
    backup_file = f"{data_file}.bak"
    print(f"Creating backup: {backup_file}")

    with open(data_file, 'r', encoding='utf-8') as f:
        backup_content = f.read()

    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(backup_content)

    # Read data.csv
    print(f"Reading {data_file}...")
    with open(data_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        books = list(reader)

    # Apply repairs
    changes_made = 0
    for suggestion in suggestions:
        for book in books:
            # Match by title and current ISBN
            if (book['Title'] == suggestion['Title'] and
                book['ISBN'] == suggestion['Current ISBN']):
                old_isbn = book['ISBN']
                book['ISBN'] = suggestion['Suggested ISBN']
                print(f"  Updated: {book['Title']}")
                print(f"    {old_isbn} -> {suggestion['Suggested ISBN']}")
                changes_made += 1
                break

    # Write updated data.csv
    if changes_made > 0:
        print(f"\nWriting updated data to {data_file}...")
        with open(data_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(books)

        print(f"\n=== APPLY SUMMARY ===")
        print(f"Total changes applied: {changes_made}")
        print(f"Backup saved to: {backup_file}")
    else:
        print("\nNo changes were made.")


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
    parser.add_argument(
        '--repair',
        action='store_true',
        help='Search for correct ISBNs for mismatched editions'
    )
    parser.add_argument(
        '--repair-input',
        default='isbn-validation/edition_check_results.csv',
        help='Input file with mismatch results for repair (default: isbn-validation/edition_check_results.csv)'
    )
    parser.add_argument(
        '--repair-output',
        default='isbn-validation/repair_suggestions.csv',
        help='Output file for repair suggestions (default: isbn-validation/repair_suggestions.csv)'
    )
    parser.add_argument(
        '--apply',
        action='store_true',
        help='Apply high-confidence repair suggestions to data.csv'
    )
    parser.add_argument(
        '--suggestions',
        default='isbn-validation/repair_suggestions.csv',
        help='Repair suggestions file for --apply (default: isbn-validation/repair_suggestions.csv)'
    )

    args = parser.parse_args()

    # Handle --apply mode
    if args.apply:
        apply_repairs(args.suggestions, args.input)
        return

    # Handle --repair mode
    if args.repair:
        repair_mismatches(args.repair_input, args.repair_output, args.api_key)
        return

    # Normal validation mode
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
