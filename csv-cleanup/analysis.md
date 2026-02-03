# Noisebridge Library CSV Data Analysis Report

**Dataset**: `data.csv`
**Total Books**: 1,100
**Total Fields**: 79
**Analysis Date**: 2026-02-02

---

## Executive Summary

The Noisebridge library CSV contains 1,100 books with 79 columns. Analysis reveals:

- **Strong core metadata**: Title, Author, Publisher, ISBN, Genre all well-populated (85%+)
- **Personal tracking debris**: Many fields (46 of 79) are completely empty, representing personal reading tracker features not applicable to a shared library
- **Data quality issues**: 26 duplicate ISBNs, 34 duplicate Title+Author combinations
- **Constant value fields**: 9 fields contain only default/constant values (0, false, Unread), providing no useful information
- **Critical gap**: Physical Location field is 0% filled - essential for a physical library

**Recommendation**: Reduce schema from 79 to ~20-25 meaningful fields for a shared library system.

---

## 1. Complete Column Inventory

### 1.1 Title & Identification Fields (7 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Title** | 100.0% | 1,048 | Book title | ✓ Critical |
| **Original Title** | 0.0% | 0 | Title in original language | ✗ Empty, remove |
| **Subtitle** | 39.5% | 394 | Book subtitle | ~ Useful when present |
| **Series** | 5.5% | 5 | Series name | ~ Optional |
| **Volume** | 1.5% | 16 | Volume number in series | ~ Optional |
| **ISBN** | 86.5% | 926 | International Standard Book Number | ✓ Critical |
| **ISSN** | 0.0% | 0 | Periodical identifier | ✗ Empty, remove |

### 1.2 Author & Contributor Fields (6 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Author** | 100.0% | 941 | Primary author(s) | ✓ Critical |
| **Author (Last, First)** | 100.0% | 912 | Author in sorted format | ~ Redundant, can generate |
| **Illustrator** | 0.0% | 0 | Book illustrator | ✗ Empty, remove |
| **Narrator** | 0.0% | 0 | Audiobook narrator | ✗ Empty, remove |
| **Translator** | 0.0% | 0 | Translator name | ✗ Empty, remove |
| **Photographer** | 0.0% | 0 | Photographer credit | ✗ Empty, remove |
| **Editor** | 0.1% | 1 | Editor name | ✗ Nearly empty, remove |

### 1.3 Publication Metadata (8 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Publisher** | 95.1% | 394 | Publishing company | ✓ Useful |
| **Place of Publication** | 0.0% | 0 | City/location published | ✗ Empty, remove |
| **Date Published** | 40.6% | 405 | Full date (YYYY/MM/DD format) | ~ Useful |
| **Year Published** | 92.7% | 74 | Publication year only | ✓ Useful |
| **Original Date Published** | 0.0% | 0 | Original publication date | ✗ Empty, remove |
| **Original Year Published** | 0.4% | 3 | Original publication year | ✗ Nearly empty, remove |
| **Edition** | 4.9% | 9 | Edition number/description | ~ Optional |
| **Language** | 94.1% | 5 | Book language | ✓ Useful |
| **Original Language** | 0.0% | 0 | Original language | ✗ Empty, remove |

### 1.4 Content Description (2 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Genre** | 89.8% | 136 | Subject category | ✓ Useful |
| **Summary** | 73.7% | 785 | Book description/synopsis | ✓ Useful for discovery |

### 1.5 Reading Level Metrics (10 columns)

| Column | Completeness | Description | Assessment |
|--------|--------------|-------------|------------|
| **Guided Reading Level** | 0.0% | Educational reading level | ✗ Empty, remove |
| **Lexile Measure** | 0.0% | Lexile reading difficulty score | ✗ Empty, remove |
| **Lexile Code** | 0.0% | Lexile classification code | ✗ Empty, remove |
| **Grade Level Equivalent** | 0.0% | Grade level appropriateness | ✗ Empty, remove |
| **Developmental Reading Assessment** | 0.0% | DRA level | ✗ Empty, remove |
| **Interest Level** | 0.0% | Target age/interest level | ✗ Empty, remove |
| **AR Level** | 0.0% | Accelerated Reader level | ✗ Empty, remove |
| **AR Points** | 0.0% | Accelerated Reader points | ✗ Empty, remove |
| **AR Quiz Number** | 0.0% | AR quiz identifier | ✗ Empty, remove |
| **Word Count** | 0.0% | Total word count | ✗ Empty, remove |

**Note**: All 10 reading level fields are completely empty. These appear to be K-12 educational metrics not applicable to an adult hackerspace library.

### 1.6 Physical Format Fields (7 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Number of Pages** | 89.9% | 510 | Page count | ✓ Useful |
| **Format** | 0.0% | 0 | Physical format (hardcover/paperback/etc) | ✗ Empty, remove |
| **Audio Runtime** | 0.0% | 0 | Audiobook length | ✗ Empty, remove |
| **Dimensions** | 0.0% | 0 | Physical dimensions | ✗ Empty, remove |
| **Weight** | 0.0% | 0 | Book weight | ✗ Empty, remove |
| **List Price** | 0.0% | 0 | Retail price | ✗ Empty, remove |

### 1.7 Library Classification (5 columns)

| Column | Completeness | Description | Assessment |
|--------|--------------|-------------|------------|
| **DDC** | 0.0% | Dewey Decimal Classification | ✗ Empty, remove |
| **LCC** | 0.0% | Library of Congress Classification | ✗ Empty, remove |
| **LCCN** | 0.0% | Library of Congress Control Number | ✗ Empty, remove |
| **OCLC** | 0.0% | OCLC catalog number | ✗ Empty, remove |

**Note**: No formal library classification system is in use. Could be added later if needed.

### 1.8 Personal Reading Tracker Fields (10 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Status** | 100.0% | 1 | Reading status | ✗ Constant "Unread", remove |
| **Status Incompleted Reason** | 0.0% | 0 | Why book not finished | ✗ Empty, remove |
| **Status Hidden** | 100.0% | 1 | Visibility flag | ✗ Constant "0", remove |
| **Date Started** | 0.0% | 0 | When user started reading | ✗ Empty, remove |
| **Date Finished** | 0.0% | 0 | When user finished reading | ✗ Empty, remove |
| **Current Page** | 0.0% | 0 | Bookmark position | ✗ Empty, remove |
| **Favorites** | 100.0% | 1 | Favorite flag | ✗ Constant "0", remove |
| **Rating** | 100.0% | 1 | User rating | ✗ Constant "0.000000", remove |
| **Wish List** | 100.0% | 1 | On wish list flag | ✗ Constant "0", remove |
| **Previously Owned** | 100.0% | 1 | Previously owned flag | ✗ Constant "0", remove |

**Note**: These fields are from personal reading tracker software. All are either empty or contain only default values. Not applicable to shared library.

### 1.9 Lending/Borrowing Fields (7 columns)

| Column | Completeness | Description | Assessment |
|--------|--------------|-------------|------------|
| **Loaned To** | 0.0% | Person book loaned to | ✗ Empty but NEEDED for lending |
| **Date Loaned** | 0.0% | When book loaned out | ✗ Empty but NEEDED for lending |
| **Borrowed From** | 0.0% | Person book borrowed from | ✗ Empty, remove |
| **Date Borrowed** | 0.0% | When book borrowed | ✗ Empty, remove |
| **Returned from Borrow** | 100.0% (constant "0") | Return status | ✗ Constant, remove |
| **Not Owned Reason** | 0.0% | Why library doesn't own | ✗ Empty, remove |

**Note**: Current CSV has no active lending data, but "Loaned To" and "Date Loaned" are critical fields for a library system.

### 1.10 Acquisition & Management Fields (10 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Physical Location** | 0.0% | 0 | Shelf/location in library | ✗ Empty but CRITICAL |
| **Quantity** | 0.0% | 0 | Number of copies owned | ✗ Empty but useful |
| **Condition** | 0.0% | 0 | Physical condition | ✗ Empty but useful |
| **Purchase Date** | 0.0% | 0 | Date acquired | ✗ Empty, optional |
| **Purchase Place** | 0.0% | 0 | Where acquired | ✗ Empty, optional |
| **Purchase Price** | 0.0% | 0 | Cost paid | ✗ Empty, optional |
| **Date Added** | 100.0% | 1,042 | Timestamp added to database | ~ Useful for tracking |
| **Recommended By** | 0.0% | 0 | Who recommended | ✗ Empty, optional |
| **Tags** | 0.0% | 0 | Custom tags | ✗ Empty but USEFUL |
| **Notes** | 0.0% | 0 | Freeform notes | ✗ Empty but USEFUL |

**Critical Gap**: Physical Location is empty - essential for finding books in physical space.

### 1.11 System/Metadata Fields (7 columns)

| Column | Completeness | Unique Values | Description | Assessment |
|--------|--------------|---------------|-------------|------------|
| **Google VolumeID** | 90.8% | 974 | Google Books identifier | ✓ Useful for enrichment |
| **Uploaded Image URL** | 38.2% | 416 | Cover image URL | ~ Useful for display |
| **Category** | 100.0% | 14 | System category code | ~ Purpose unclear |
| **User Supplied ID** | 0.0% | 0 | Custom identifier | ✗ Empty, remove |
| **User Supplied Descriptor** | 0.0% | 0 | Custom description | ✗ Empty, remove |
| **Up Next** | 100.0% | 1 | Reading queue flag | ✗ Constant "0", remove |
| **Position** | 0.0% | 0 | Queue position | ✗ Empty, remove |
| **Activities** | 0.0% | 0 | Activity log | ✗ Empty, remove |

---

## 2. Data Quality Issues

### 2.1 Duplicate Records

**Duplicate ISBNs**: 26 ISBNs appear multiple times
- Example: ISBN `9780321637734` appears 2 times
- **Issue**: May represent multiple copies OR data entry errors
- **Impact**: Need to determine if duplicates are intentional (multiple copies) or errors

**Duplicate Title+Author combinations**: 34 pairs appear multiple times
- "The C++ Standard Library" by Nicolai M. Josuttis: 3 entries
- "Advanced Programming in the UNIX Environment" by W. Richard Stevens, Stephen A. Rago: 2 entries
- "DNS and BIND" by Paul Albitz, Cricket Liu: 2 entries
- **Issue**: Likely indicates different editions or accidental duplicates
- **Impact**: Need deduplication strategy or edition tracking

### 2.2 Missing Critical Data

| Issue | Impact | Count/Percentage |
|-------|--------|------------------|
| Physical Location 0% filled | Cannot locate books in space | 1,100 books unlocated |
| ISBN missing | Harder to identify/catalog books | 148 books (13.5%) |
| Genre missing | Reduced discoverability | 112 books (10.2%) |
| Publisher missing | Less complete metadata | 54 books (4.9%) |

### 2.3 Inconsistent Date Formats

**Date Published** field shows format: `YYYY/MM/DD` (e.g., "2010/06/28")
**Date Added** field shows format: `YYYY/MM/DD HH:MM:SS.nanoseconds` (e.g., "2026/01/31 01:14:08.946172952")

- **Issue**: Mixed precision, different purposes
- **Recommendation**: Standardize on ISO 8601 format (YYYY-MM-DD)

### 2.4 ISBN Format Inconsistencies

- **ISBN-13**: 950 entries (99.8% of filled ISBNs) ✓
- **ISBN-10**: 2 entries (0.2% of filled ISBNs)
- **Invalid/Other**: 0 entries ✓

**Assessment**: ISBN data is clean, mostly standardized on ISBN-13.

### 2.5 Multi-Valued Author Field

Some entries contain multiple authors in a single field, comma-separated:
- Example: "Fletcher Dunn,Ian Parberry"
- Example: "W. Richard Stevens,Stephen A. Rago"

**Issue**: Inconsistent delimiter, harder to search by individual author
**Recommendation**: Consider separate table for author relationships, or standardized delimiter

### 2.6 Empty Column Bloat

**46 of 79 columns** (58%) are completely empty or contain only constant values.

Empty columns can be categorized as:
1. **Reading level metrics** (10 fields) - K-12 education features
2. **Personal reading tracker** (10 fields) - individual user features
3. **Detailed physical specs** (5 fields) - dimensions, weight, format
4. **Library classification** (4 fields) - DDC, LCC, LCCN, OCLC
5. **Unused metadata** (17 fields) - various other empty fields

---

## 3. Field Classification for Google Sheets Migration

### 3.1 CRITICAL Fields (Keep & Prioritize)

Must have for basic library function:

| Field | Completeness | Purpose |
|-------|--------------|---------|
| Title | 100% | Identify book |
| Author | 100% | Identify book |
| ISBN | 86.5% | Unique identifier |
| **Physical Location** | **0%** | **MUST ADD - find books** |
| Publisher | 95.1% | Cataloging |
| Genre | 89.8% | Discovery/browsing |
| Number of Pages | 89.9% | Basic metadata |
| Year Published | 92.7% | Cataloging |
| Language | 94.1% | Basic metadata |

**Total: 9 fields** (1 needs population)

### 3.2 USEFUL Fields (Keep)

Enhance discovery and management:

| Field | Completeness | Purpose |
|-------|--------------|---------|
| Subtitle | 39.5% | Additional context |
| Summary | 73.7% | Discovery, recommendations |
| Date Published | 40.6% | More precise than year |
| Google VolumeID | 90.8% | Metadata enrichment, covers |
| Uploaded Image URL | 38.2% | Visual display |
| Series | 5.5% | Track series books |
| Volume | 1.5% | Series ordering |
| Edition | 4.9% | Distinguish versions |
| **Tags** | **0%** | **Categorization (to be added)** |
| **Notes** | **0%** | **Librarian notes (to be added)** |
| Date Added | 100% | Track collection growth |

**Total: 11 fields** (2 empty but useful to keep)

### 3.3 LENDING SYSTEM Fields (Add/Keep for Library Use)

Currently empty but essential for shared library:

| Field | Current Status | Needed For |
|-------|----------------|------------|
| **Loaned To** | 0% | Track who has book |
| **Date Loaned** | 0% | Due dates, overdue tracking |
| **Quantity** | 0% | Multiple copy tracking |
| **Condition** | 0% | Maintenance tracking |

**Total: 4 fields** (all currently empty)

### 3.4 OPTIONAL Fields (Consider Keeping)

Marginally useful, low priority:

- **Category** (100%, 14 values) - Purpose unclear, check what codes mean
- **Purchase Date/Place/Price** (0%) - Historical tracking
- **Recommended By** (0%) - Community engagement

### 3.5 REMOVE Fields (Delete)

No value for shared library:

**46 fields total to remove:**

1. **Empty contributor fields** (5): Illustrator, Narrator, Translator, Photographer, Editor
2. **Empty publication fields** (3): Place of Publication, Original Date Published, Original Year Published, Original Title, Original Language
3. **All reading level metrics** (10): Guided Reading Level through Word Count
4. **Empty physical fields** (5): Format, Audio Runtime, Dimensions, Weight, List Price
5. **Library classification** (4): DDC, LCC, LCCN, OCLC
6. **Personal tracker fields** (10): Status, Status Incompleted Reason, Status Hidden, Date Started, Date Finished, Current Page, Favorites, Rating, Wish List, Previously Owned, Up Next
7. **Empty borrowing fields** (3): Borrowed From, Date Borrowed, Returned from Borrow, Not Owned Reason
8. **Empty system fields** (3): User Supplied ID, User Supplied Descriptor, Position, Activities
9. **Redundant field** (1): Author (Last, First) - can generate from Author
10. **Unused identifiers** (2): ISSN, OCLC

---

## 4. Sample Observations (Detailed Examination)

Examined 7 sample rows at positions: 0, 10, 50, 100, 500, 900, 1099

### 4.1 Representative Books

**Book #1** (First entry):
- Title: "Surely You're Joking, Mr. Feynman!": Adventures of a Curious Character
- Author: Richard P. Feynman
- ISBN: 9780393339857
- Genre: Biography & Autobiography
- Publisher: W. W. Norton & Company
- **Observation**: Well-populated metadata, all critical fields present

**Book #2** (Row 10):
- Title: 3D Game Engine Design
- Author: David H. Eberly
- ISBN: (empty)
- Genre: (empty)
- Publisher: Morgan Kaufmann
- **Observation**: Missing ISBN and Genre - example of incomplete records

**Book #500** (Middle):
- **Observation**: Similar pattern - core fields (Title, Author, Publisher) always filled, secondary fields variable

### 4.2 Common Patterns

1. **Title + Author + Publisher** = Core triple always present
2. **ISBN** usually present but not universal
3. **Genre** usually present but ~10% missing
4. **Summary** often present (~74%) - good for discovery
5. **Physical Location** universally empty - critical gap
6. **All personal tracking fields** = debris from import source

### 4.3 Notable Data Characteristics

- **Multiple authors**: Stored comma-separated in single field
- **Category codes**: Range from 1.1 to 2.13, meaning unclear (possibly import categories)
- **Date Added timestamps**: All from 2026/01, suggests recent bulk import
- **Google VolumeID**: High coverage (90.8%) enables rich metadata lookup

---

## 5. Statistical Summary

### 5.1 Overall Data Completeness

| Metric | Value |
|--------|-------|
| Total records | 1,100 |
| Total fields | 79 |
| Fields 100% complete | 13 (16.5%) |
| Fields >80% complete | 10 (12.7%) |
| Fields 50-80% complete | 2 (2.5%) |
| Fields <50% complete | 7 (8.9%) |
| Completely empty fields | 47 (59.5%) |
| **Usable fields** | **~24** |
| **Fields to remove** | **~46** |

### 5.2 Core Metadata Completeness Score

Measuring the 9 critical fields:

| Field | Weight | Completeness | Weighted Score |
|-------|--------|--------------|----------------|
| Title | 20% | 100% | 20.0 |
| Author | 20% | 100% | 20.0 |
| ISBN | 15% | 86.5% | 13.0 |
| Publisher | 10% | 95.1% | 9.5 |
| Genre | 10% | 89.8% | 9.0 |
| Year Published | 10% | 92.7% | 9.3 |
| Language | 5% | 94.1% | 4.7 |
| Number of Pages | 5% | 89.9% | 4.5 |
| **Physical Location** | **5%** | **0%** | **0.0** |

**Core Metadata Score: 90.0/100** - Excellent except for critical Physical Location gap

### 5.3 Most Populated Columns (Top 10)

1. Title - 100%
2. Author - 100%
3. Author (Last, First) - 100%
4. Publisher - 95.1%
5. Language - 94.1%
6. Year Published - 92.7%
7. Google VolumeID - 90.8%
8. Number of Pages - 89.9%
9. Genre - 89.8%
10. ISBN - 86.5%

### 5.4 Collection Statistics

- **Unique titles**: 1,048 (some duplicates/editions)
- **Unique authors**: 941
- **Publishers**: 394 different publishers
- **Genres**: 136 different genre categories
- **Languages**: 5 languages (primarily English at 94.1%)
- **Publication span**: ~74 different years represented
- **Books with summaries**: 811 (73.7%)
- **Books with cover images**: 420 (38.2%)

---

## 6. Recommendations

### 6.1 Immediate Actions

1. **Add Physical Location data** - Critical for library function
   - Develop shelf/location taxonomy for Noisebridge space
   - Conduct physical inventory to populate this field

2. **Resolve duplicates**
   - Investigate 26 duplicate ISBNs - multiple copies or errors?
   - Check 34 duplicate Title+Author pairs - different editions?

3. **Schema reduction**
   - Remove 46 empty/constant value columns
   - Reduce from 79 to 24-28 meaningful fields

4. **Populate lending fields structure**
   - Keep Loaned To, Date Loaned fields for future use
   - Add Quantity field to track multiple copies

### 6.2 Data Enrichment Opportunities

1. **Genre cleanup**: 112 books (10.2%) missing genre - can use Google Books API
2. **ISBN enrichment**: 148 books (13.5%) missing ISBN - manual research or API lookup
3. **Cover images**: 680 books (61.8%) missing covers - Google Books API can provide
4. **Standardize authors**: Consider splitting multi-author field for better searchability

### 6.3 Recommended Final Schema (24 fields)

**Critical (9):**
Title, Author, ISBN, Physical Location, Publisher, Genre, Number of Pages, Year Published, Language

**Useful (11):**
Subtitle, Summary, Date Published, Google VolumeID, Uploaded Image URL, Series, Volume, Edition, Tags, Notes, Date Added

**Lending (4):**
Loaned To, Date Loaned, Quantity, Condition

**Total: 24 fields** (down from 79, 69% reduction)

### 6.4 Data Quality Improvements

1. **Standardize dates**: Use ISO 8601 (YYYY-MM-DD)
2. **Author normalization**: Consider standardized format or separate author table
3. **Genre taxonomy**: Consolidate 136 genre values to manageable set
4. **Category field**: Document what the 14 category codes mean, or remove if obsolete

---

## 7. Next Steps for Google Sheets Migration

1. Create clean schema with 24 recommended fields
2. Write transformation script to:
   - Remove 46 unused columns
   - Standardize date formats
   - Flag duplicates for review
   - Preserve all critical data
3. Add Physical Location column with empty values (to be populated)
4. Export to Google Sheets with proper column types
5. Set up data validation rules (e.g., ISBN format, date ranges)
6. Create view/interface for lending system
7. Plan physical inventory process to populate locations

---

## Appendix A: Column Deletion List

**47 columns recommended for removal:**

Original Title, Illustrator, Narrator, Translator, Photographer, Editor, Place of Publication, Original Date Published, Original Year Published, Original Language, Guided Reading Level, Lexile Measure, Lexile Code, Grade Level Equivalent, Developmental Reading Assessment, Interest Level, AR Level, AR Points, AR Quiz Number, Word Count, Format, Audio Runtime, Dimensions, Weight, List Price, DDC, LCC, LCCN, OCLC, ISSN, Favorites, Rating, Status, Status Incompleted Reason, Status Hidden, Date Started, Date Finished, Current Page, Borrowed From, Date Borrowed, Returned from Borrow, Not Owned Reason, User Supplied ID, User Supplied Descriptor, Wish List, Previously Owned, Up Next, Position, Activities

**Plus consider removing:**
- Author (Last, First) - can generate from Author field
- Category - if purpose unclear after investigation

---

## Appendix B: Analysis Methodology

**Tools Used:**
- Python 3 with built-in `csv` module
- Analysis script: `.subtask/tasks/csv--1-data-analysis/analyze_csv.py`
- Output data: `.subtask/tasks/csv--1-data-analysis/analysis_data.json`

**Analysis Approach:**
1. Programmatic CSV parsing (not manual inspection)
2. Completeness analysis for all 79 columns
3. Unique value counting for data variety assessment
4. Duplicate detection on ISBN and Title+Author
5. Sample examination at 7 different dataset positions
6. Format validation for ISBNs and dates
7. Pattern analysis for multi-valued fields

**Data Quality Checks:**
- Empty vs filled cell counting
- Unique value diversity
- Constant value detection
- Duplicate record identification
- Format consistency validation
- Cross-field relationship analysis
