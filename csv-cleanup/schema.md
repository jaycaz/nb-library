# Noisebridge Library - Output CSV Schema Definition

**Version**: 1.0
**Date**: 2026-02-02
**Purpose**: Define clean Google Sheets schema for public library catalog

---

## Overview

This schema reduces the source CSV from 79 columns to 13 essential columns, optimized for:
- **Easy browsing** in Google Sheets
- **Quick book discovery** by title, author, genre, location
- **Future lending system** support
- **Clean public access** without personal tracker debris

**Source**: `data.csv` (1,100 books, 79 columns)
**Output**: `library-clean.csv` (1,100 books, 13 columns)
**Reduction**: 83.5% fewer columns while preserving all useful data

---

## 1. Output Schema Definition

### Complete Column List (13 columns)

| # | Column Name | Data Type | Required | Description |
|---|-------------|-----------|----------|-------------|
| 1 | Title | Text | Yes | Book title, may include subtitle |
| 2 | Author | Text | Yes | Primary author(s), comma-separated if multiple |
| 3 | ISBN | Text | No | International Standard Book Number (ISBN-13 or ISBN-10) |
| 4 | Publisher | Text | No | Publishing company name |
| 5 | Year | Integer | No | Publication year (4-digit) |
| 6 | Genre | Text | No | Subject category/genre |
| 7 | Pages | Integer | No | Number of pages |
| 8 | Shelf Location | Text | Yes | Physical location using floor.shelf format (e.g., 2.10) |
| 9 | Cover URL | URL | No | Link to book cover image |
| 10 | Summary | Text | No | Book description/synopsis |
| 11 | Google VolumeID | Text | No | Google Books identifier for enrichment/linking |
| 12 | Loaned To | Text | No | Name of person book is loaned to (empty initially) |
| 13 | Notes | Text | No | Librarian notes, quality flags, special info |

---

## 2. Column Details

### 2.1 Title
- **Type**: Text
- **Required**: Yes (100% populated in source)
- **Max Length**: ~200 characters
- **Format**: Preserve as-is, including quotes and punctuation
- **Example**: `"Surely You're Joking, Mr. Feynman!": Adventures of a Curious Character`
- **Notes**: Some titles include subtitle after colon

### 2.2 Author
- **Type**: Text
- **Required**: Yes (100% populated in source)
- **Format**: Comma-separated for multiple authors
- **Example Single**: `Richard P. Feynman`
- **Example Multiple**: `Fletcher Dunn,Ian Parberry`
- **Notes**: Use "Author" field from source (not "Author (Last, First)")

### 2.3 ISBN
- **Type**: Text (not number, to preserve leading zeros and hyphens)
- **Required**: No (86.5% populated in source)
- **Format**: Preserve as-is (mostly ISBN-13)
- **Default**: `N/A` (when missing)
- **Example**: `9780393339857`
- **Validation**: Should be 10 or 13 digits (ignoring hyphens/spaces)

### 2.4 Publisher
- **Type**: Text
- **Required**: No (95.1% populated in source)
- **Default**: `Unknown` (when missing)
- **Example**: `W. W. Norton & Company`
- **Notes**: 394 unique publishers in source data

### 2.5 Year
- **Type**: Integer
- **Required**: No (92.7% populated in source)
- **Format**: 4-digit year
- **Default**: Empty/blank (when missing)
- **Example**: `2010`
- **Range**: Typically 1900-2026
- **Notes**: Use "Year Published" (not "Date Published" which is less complete)

### 2.6 Genre
- **Type**: Text
- **Required**: No (89.8% populated in source)
- **Default**: Empty/blank (when missing)
- **Example**: `Biography & Autobiography`, `Computers`, `Science`
- **Notes**: 136 unique genres in source; may consolidate in future

### 2.7 Pages
- **Type**: Integer
- **Required**: No (89.9% populated in source)
- **Default**: Empty/blank (when missing)
- **Example**: `352`
- **Range**: Typically 50-2000

### 2.8 Shelf Location
- **Type**: Text
- **Required**: Yes (100% populated in source via Category field)
- **Format**: `floor.shelf` numbering
- **Example**: `2.10`, `1.1`, `2.4`
- **Values**:
  - `1.x` = Floor 1 (1 shelf)
  - `2.1` through `2.13` = Floor 2 (13 shelves total)
- **Notes**: This is the physical location in Noisebridge library
- **Sorting**: Sort as decimal numbers (2.1, 2.2, ..., 2.10, 2.11, 2.12, 2.13)

### 2.9 Cover URL
- **Type**: URL (text)
- **Required**: No (38.2% populated in source)
- **Default**: Empty/blank (when missing)
- **Format**: Full HTTP/HTTPS URL
- **Example**: `https://m.media-amazon.com/images/I/41CsPxSErSL._AC_UF1000,1000_QL80_.jpg`
- **Notes**: Prefer "Uploaded Image URL" from source; could enrich missing ones via Google Books API

### 2.10 Summary
- **Type**: Text (long)
- **Required**: No (73.7% populated in source)
- **Default**: Empty/blank (when missing)
- **Max Length**: ~2000 characters
- **Example**: `A New York Times bestseller—the outrageous exploits of one of this century's greatest scientific minds...`
- **Notes**: Useful for book discovery and recommendations

### 2.11 Google VolumeID
- **Type**: Text
- **Required**: No (90.8% populated in source)
- **Default**: Empty/blank (when missing)
- **Format**: Alphanumeric identifier
- **Example**: `7papZR4oVssC`
- **Use Cases**:
  - Link to Google Books page: `https://books.google.com/books?id={VolumeID}`
  - Fetch additional metadata via Google Books API
  - Retrieve cover images when missing
- **Notes**: High coverage (90.8%) enables rich metadata enrichment

### 2.12 Loaned To
- **Type**: Text
- **Required**: No (0% populated in source - future use)
- **Default**: Empty/blank
- **Format**: Person's name or identifier
- **Example**: `Alice`, `Bob`, `@discord_username`
- **Notes**: Empty initially, for future lending system implementation

### 2.13 Notes
- **Type**: Text
- **Required**: No (0% in source - will be generated)
- **Default**: Empty/blank
- **Format**: Free-form text, semicolon-separated if multiple notes
- **Examples**:
  - `Missing ISBN`
  - `Duplicate entry - check edition`
  - `Multiple copies available`
- **Use Cases**:
  - Flag data quality issues
  - Note duplicates or missing metadata
  - Librarian comments
  - Special handling instructions

---

## 3. Source to Output Mapping

### Mapping Table

| Output Column | Source Column(s) | Transformation | Completeness |
|---------------|------------------|----------------|--------------|
| **Title** | `Title` | Direct copy | 100% |
| **Author** | `Author` | Direct copy (ignore "Author (Last, First)") | 100% |
| **ISBN** | `ISBN` | Direct copy, default "N/A" if empty | 86.5% |
| **Publisher** | `Publisher` | Direct copy, default "Unknown" if empty | 95.1% |
| **Year** | `Year Published` | Direct copy (integer) | 92.7% |
| **Genre** | `Genre` | Direct copy | 89.8% |
| **Pages** | `Number of Pages` | Direct copy (integer) | 89.9% |
| **Shelf Location** | `Category` | **Rename only** (field already uses floor.shelf format) | 100% |
| **Cover URL** | `Uploaded Image URL` | Direct copy | 38.2% |
| **Summary** | `Summary` | Direct copy, truncate if >2000 chars | 73.7% |
| **Google VolumeID** | `Google VolumeID` | Direct copy | 90.8% |
| **Loaned To** | *(none)* | Always empty (future use) | 0% |
| **Notes** | *(generated)* | Generate quality flags | 0% |

### Fields NOT Included (66 source columns removed)

**Completely empty fields (46 columns)**:
- Original Title, Illustrator, Narrator, Translator, Photographer, Editor
- Place of Publication, Original Date/Year Published, Original Language
- All reading level metrics (10 fields: Guided Reading Level, Lexile, AR, etc.)
- Format, Audio Runtime, Dimensions, Weight, List Price
- Library classification codes (DDC, LCC, LCCN, OCLC, ISSN)
- Personal tracking fields (Status, Dates, Favorites, Rating, Wish List, etc.)
- Borrowing fields (Borrowed From, Date Borrowed, etc.)
- User Supplied ID/Descriptor, Position, Activities

**Redundant or low-value fields (20 columns)**:
- Author (Last, First) - redundant with Author
- Date Published - less complete than Year Published (40.6% vs 92.7%)
- Subtitle - merged into Title when needed
- Series, Volume - only 5.5% and 1.5% populated
- Edition - only 4.9% populated
- Date Added - system timestamp, not user-relevant
- Quantity, Condition - 0% filled
- Tags, Purchase info - 0% filled
- Physical Location - 0% filled (Category provides this)

---

## 4. Default Values & Missing Data Handling

### Default Value Rules

| Column | When Empty | Default Value | Rationale |
|--------|------------|---------------|-----------|
| Title | Never empty | *(required)* | 100% populated in source |
| Author | Never empty | *(required)* | 100% populated in source |
| ISBN | 13.5% empty | `N/A` | Makes clear it's missing, not an error |
| Publisher | 4.9% empty | `Unknown` | Semantic clarity |
| Year | 7.3% empty | *(blank)* | Empty more appropriate than fake year |
| Genre | 10.2% empty | *(blank)* | Better than generic "Uncategorized" |
| Pages | 10.1% empty | *(blank)* | Empty clearer than 0 |
| Shelf Location | Never empty | *(required)* | 100% via Category field |
| Cover URL | 61.8% empty | *(blank)* | Can enrich later via Google Books API |
| Summary | 26.3% empty | *(blank)* | Empty acceptable for discovery |
| Google VolumeID | 9.2% empty | *(blank)* | Empty acceptable |
| Loaned To | 100% empty | *(blank)* | For future lending system |
| Notes | Varies | *(see below)* | Generated based on quality flags |

### Quality Flag Generation for Notes Field

Automatically generate Notes content when:

| Condition | Note to Add |
|-----------|-------------|
| ISBN is empty | `Missing ISBN` |
| ISBN appears >1 time | `Duplicate ISBN - verify edition` |
| Title+Author appears >1 time | `Possible duplicate entry` |
| Genre is empty | `Genre not classified` |
| Publisher is empty | `Publisher unknown` |
| Summary is empty AND Google VolumeID exists | `Summary available via Google Books` |
| Cover URL is empty AND Google VolumeID exists | `Cover image available via Google Books` |

**Format**: Semicolon-separated if multiple flags
**Example**: `Missing ISBN; Genre not classified`

---

## 5. Data Transformation Rules

### 5.1 Text Field Transformations

**Title**:
- Keep as-is, including quotes, colons, subtitles
- No truncation unless >500 characters (extremely rare)
- Preserve Unicode characters

**Author**:
- Use "Author" field directly (format: "First Last" or "First Last,First Last")
- Do NOT use "Author (Last, First)" field
- Keep comma-separated format for multiple authors
- No additional parsing or reformatting

**Summary**:
- Keep as-is
- If >2000 characters, truncate with "..." ellipsis
- Remove excessive whitespace/newlines

### 5.2 Number Field Transformations

**Year**:
- Use "Year Published" column
- Must be 4-digit integer
- If not 4 digits or not parseable, leave blank
- Valid range: 1000-2100 (generous range)

**Pages**:
- Must be positive integer
- If not parseable as number, leave blank
- If 0 or negative, leave blank

### 5.3 Special Field Transformations

**ISBN**:
- Keep as-is (text format preserves leading zeros)
- No validation or reformatting
- If empty, use default "N/A"

**Shelf Location**:
- Direct copy from "Category" field
- Already in correct floor.shelf format
- No transformation needed
- **Critical**: This field provides physical location (Category is NOT a category code)

**Cover URL**:
- Must be valid HTTP/HTTPS URL
- If malformed or not a URL, leave blank
- No URL validation beyond basic format check

**Google VolumeID**:
- Direct copy
- Alphanumeric text, typically 10-15 characters
- Use for constructing Google Books links: `https://books.google.com/books?id={VolumeID}`

### 5.4 Duplicate Handling

**Do NOT remove duplicates** - they may represent:
- Different editions of the same book
- Multiple physical copies
- Legitimate separate entries

Instead:
- Flag duplicates in Notes field
- Let librarians review and decide
- Preserve all entries in output

---

## 6. Data Quality Expectations

### Input Data Quality (from analysis)

| Metric | Value |
|--------|-------|
| Total books | 1,100 |
| Core metadata completeness | 90/100 |
| Books with ISBN | 952 (86.5%) |
| Books with Genre | 988 (89.8%) |
| Books with Summary | 811 (73.7%) |
| Books with Cover URL | 420 (38.2%) |
| Duplicate ISBNs | 26 |
| Duplicate Title+Author | 34 |

### Output Data Quality Goals

| Metric | Target |
|--------|--------|
| All books have Title | 100% |
| All books have Author | 100% |
| All books have Shelf Location | 100% |
| Books with valid ISBN | >86% |
| Books with Genre | >89% |
| Books with quality flags in Notes | ~15-20% |

---

## 7. Example Transformations

### Example 1: Complete Metadata

**Source Row** (selected fields):
```
Title: "Surely You're Joking, Mr. Feynman!": Adventures of a Curious Character
Author: Richard P. Feynman
ISBN: 9780393339857
Publisher: W. W. Norton & Company
Year Published: 2010
Genre: Biography & Autobiography
Number of Pages: 352
Category: 2.10
Uploaded Image URL: (empty)
Google VolumeID: 7papZR4oVssC
Summary: A New York Times bestseller—the outrageous exploits of one of this century's greatest scientific minds...
```

**Output Row**:
```
Title: "Surely You're Joking, Mr. Feynman!": Adventures of a Curious Character
Author: Richard P. Feynman
ISBN: 9780393339857
Publisher: W. W. Norton & Company
Year: 2010
Genre: Biography & Autobiography
Pages: 352
Shelf Location: 2.10
Cover URL:
Summary: A New York Times bestseller—the outrageous exploits of one of this century's greatest scientific minds...
Google VolumeID: 7papZR4oVssC
Loaned To:
Notes: Cover image available via Google Books
```

### Example 2: Missing Metadata

**Source Row**:
```
Title: 3D Game Engine Design
Author: David H. Eberly
ISBN: (empty)
Publisher: Morgan Kaufmann
Year Published: 2007
Genre: (empty)
Number of Pages: 1018
Category: 2.5
Uploaded Image URL: https://m.media-amazon.com/images/I/31twMWYdoWL._AC_UF1000,1000_QL80_.jpg
Google VolumeID: M_l_tAEACAAJ
Summary: (empty)
```

**Output Row**:
```
Title: 3D Game Engine Design
Author: David H. Eberly
ISBN: N/A
Publisher: Morgan Kaufmann
Year: 2007
Genre:
Pages: 1018
Shelf Location: 2.5
Cover URL: https://m.media-amazon.com/images/I/31twMWYdoWL._AC_UF1000,1000_QL80_.jpg
Summary:
Google VolumeID: M_l_tAEACAAJ
Loaned To:
Notes: Missing ISBN; Genre not classified; Summary available via Google Books
```

### Example 3: Multiple Authors

**Source Row**:
```
Title: 3D Math Primer for Graphics and Game Development
Author: Fletcher Dunn,Ian Parberry
ISBN: 9781439869819
Publisher: CRC Press
Year Published: 2011
Genre: Computers
Number of Pages: 846
Category: 2.4
Uploaded Image URL: https://m.media-amazon.com/images/I/41CsPxSErSL._AC_UF1000,1000_QL80_.jpg
Google VolumeID: TvrRBQAAQBAJ
Summary: This engaging book presents the essential mathematics needed to describe, simulate, and render a 3D world...
```

**Output Row**:
```
Title: 3D Math Primer for Graphics and Game Development
Author: Fletcher Dunn,Ian Parberry
ISBN: 9781439869819
Publisher: CRC Press
Year: 2011
Genre: Computers
Pages: 846
Shelf Location: 2.4
Cover URL: https://m.media-amazon.com/images/I/41CsPxSErSL._AC_UF1000,1000_QL80_.jpg
Summary: This engaging book presents the essential mathematics needed to describe, simulate, and render a 3D world...
Google VolumeID: TvrRBQAAQBAJ
Loaned To:
Notes:
```

---

## 8. Google Sheets Optimization

### Column Formatting Recommendations

| Column | Format | Width | Notes |
|--------|--------|-------|-------|
| Title | Text | 300px | Wrap text enabled |
| Author | Text | 200px | |
| ISBN | Plain text | 120px | Not number format |
| Publisher | Text | 150px | |
| Year | Number | 60px | No decimals |
| Genre | Text | 150px | |
| Pages | Number | 60px | No decimals |
| Shelf Location | Text | 100px | Sort as decimal |
| Cover URL | URL | 80px | Display as "Image" |
| Summary | Text | 400px | Wrap text, expand height |
| Google VolumeID | Text | 120px | Can create hyperlink formula |
| Loaned To | Text | 120px | |
| Notes | Text | 200px | Wrap text |

### Suggested Google Sheets Features

**Freeze Rows**: Freeze header row for scrolling

**Filter Views**: Enable filtering on:
- Genre
- Shelf Location
- Year
- Loaned To (to see available books)

**Conditional Formatting**:
- Highlight rows where `Loaned To` is not empty (books currently out)
- Highlight rows where `Notes` contains "Missing ISBN"
- Highlight rows where `Notes` contains "Duplicate"

**Data Validation**:
- Shelf Location: Dropdown with valid values (1.1, 2.1-2.13)
- Year: Must be 4-digit number between 1000-2100

**Hyperlink Formula** (for Google VolumeID):
```
=IF(K2<>"", HYPERLINK("https://books.google.com/books?id="&K2, "View"), "")
```
(Add in helper column to link to Google Books)

**Image Display** (for Cover URL):
```
=IF(I2<>"", IMAGE(I2, 4, 50, 80), "")
```
(Add in helper column to show cover thumbnails)

---

## 9. Future Enhancements

### Planned Schema Extensions

**Phase 2 - Lending System**:
- Add "Date Loaned" column (date)
- Add "Due Date" column (calculated: Date Loaned + 14 days)
- Add "Status" column (Available, Loaned, Overdue)

**Phase 3 - Multi-Copy Support**:
- Add "Quantity" column (number of copies owned)
- Add "Available Copies" column (calculated: Quantity - loaned count)

**Phase 4 - Enhanced Metadata**:
- Add "Tags" column (comma-separated keywords)
- Add "Condition" column (New, Good, Fair, Poor)
- Add "Date Added" column (when added to library)

### Metadata Enrichment Opportunities

Using Google VolumeID (90.8% populated):

1. **Fill missing Summaries**: Use Google Books API to fetch descriptions
2. **Get missing Cover URLs**: Fetch thumbnail images from Google Books
3. **Enrich Genre data**: Get subject categories from Google Books
4. **Add missing ISBNs**: Look up via Google Books API

---

## 10. Implementation Checklist

### Transformation Script Requirements

- [ ] Read source CSV (`data.csv`, 79 columns)
- [ ] Map columns according to Section 3
- [ ] Apply transformations per Section 5
- [ ] Generate Notes field with quality flags (Section 4)
- [ ] Apply default values (Section 4)
- [ ] Preserve all 1,100 rows (no filtering or removal)
- [ ] Output clean CSV (`library-clean.csv`, 13 columns)
- [ ] Validate output (all required fields populated)
- [ ] Generate summary report (counts, quality metrics)

### Validation Checks

- [ ] All 1,100 rows present in output
- [ ] Title: 100% populated
- [ ] Author: 100% populated
- [ ] Shelf Location: 100% populated
- [ ] ISBN: Either valid or "N/A"
- [ ] Year: Either 4-digit number or blank
- [ ] Pages: Either positive integer or blank
- [ ] No source columns leaked into output
- [ ] Column order matches schema definition

### Post-Processing

- [ ] Review Books with quality flags in Notes
- [ ] Manually verify duplicate entries
- [ ] Consider enriching missing metadata via Google Books API
- [ ] Import to Google Sheets
- [ ] Apply formatting recommendations (Section 8)
- [ ] Set up filter views and conditional formatting
- [ ] Share with Noisebridge community

---

## Appendix A: Schema Comparison

### Before (Source CSV)
- **Columns**: 79
- **Usable columns**: ~24
- **Empty columns**: 46 (58%)
- **Personal tracker debris**: Yes
- **Duplicate data**: Yes (Author vs Author (Last, First))
- **Clear location field**: No (Physical Location 0% filled)

### After (Output CSV)
- **Columns**: 13
- **Usable columns**: 13 (100%)
- **Empty columns**: 0
- **Personal tracker debris**: No
- **Duplicate data**: No
- **Clear location field**: Yes (Shelf Location from Category)

**Improvement**: 83.5% reduction in columns, 100% increase in data clarity

---

## Appendix B: Shelf Location Reference

### Floor 1
- **1.1** - Single shelf on first floor

### Floor 2
- **2.1** through **2.13** - 13 shelves on second floor

**Total**: 14 physical shelf locations in Noisebridge library

**Distribution** (from source data):
- Category values: 14 unique values (1.1, 2.1-2.13)
- All 1,100 books have shelf assignments (100% coverage)

---

## Appendix C: Column Order Rationale

The 13 columns are ordered for optimal usability:

1. **Title** - Primary identifier, what people search first
2. **Author** - Secondary identifier
3. **ISBN** - Unique identifier for cataloging
4. **Publisher** - Discovery metadata
5. **Year** - Discovery metadata (chronological filtering)
6. **Genre** - Discovery metadata (category browsing)
7. **Pages** - Quick reference (time commitment)
8. **Shelf Location** - **Critical** - where to find the book
9. **Cover URL** - Visual discovery
10. **Summary** - Detailed discovery
11. **Google VolumeID** - System field for enrichment
12. **Loaned To** - Management (shows availability)
13. **Notes** - System/librarian field

**Left-to-right priority**: Discovery → Location → Management → System
