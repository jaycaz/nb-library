# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains the book library dataset for **Noisebridge**, a hackerspace in San Francisco, and serves as an experimentation ground for building apps and UIs to improve book discovery, lending, and cataloging.

### Purpose

- **Data Source**: `data.csv` contains 1,100+ books from the Noisebridge library
- **Goal**: Develop experimental applications and interfaces for:
  - Book discovery (search, browse, recommendations)
  - Lending management (check-out/check-in, tracking)
  - Improved cataloging (data entry, enrichment, organization)
- **Approach**: This is a sandbox for trying different technologies, UIs, and approaches to library management

## Data Structure

### Primary Data File

- `data.csv` - Main book library dataset (1,100+ entries)

### CSV Schema

The CSV contains 73 fields per book entry, including:

**Core Metadata:**
- Title, Original Title, Subtitle, Series, Volume
- Author, Author (Last, First), Illustrator, Narrator, Translator, Photographer, Editor
- Publisher, Place of Publication, Date Published, Year Published, Original Date Published
- Edition, Genre, Summary
- ISBN, ISSN, OCLC, LCCN, LCC, DDC
- Language, Original Language
- Google VolumeID

**Physical/Format Details:**
- Number of Pages, Format, Audio Runtime
- Dimensions, Weight, List Price

**Reading Metadata:**
- Status (e.g., Unread, Reading, Completed)
- Rating, Favorites
- Date Started, Date Finished, Current Page
- Physical Location

**Library Management:**
- Purchase Date, Purchase Place, Purchase Price
- Loaned To, Date Loaned, Borrowed From, Date Borrowed
- Quantity, Condition
- Tags, Notes
- Category, Uploaded Image URL

**Note**: The current CSV schema includes personal reading tracking fields (Status, Dates, Current Page, etc.). For a shared library system, these fields may need to be reinterpreted or supplemented with multi-user tracking capabilities.

**Reading Metrics:**
- Guided Reading Level, Lexile Measure, Lexile Code
- Grade Level Equivalent, Developmental Reading Assessment
- Interest Level, AR Level, AR Points, AR Quiz Number
- Word Count

## Working with the Data

### Viewing Data
```bash
# View first few entries
head data.csv

# Count total entries (subtract 1 for header)
wc -l data.csv

# View specific columns (e.g., Title and Author)
cut -d',' -f1,6 data.csv | head

# Search for specific books
grep -i "search_term" data.csv
```

### Important Notes

- CSV fields are comma-delimited
- Many fields contain quoted strings with embedded commas
- The first row is a header row with column names
- Many fields may be empty for certain entries
- Image URLs may be external (Amazon, Google Books) or S3-hosted uploads

## Development Approach

This repository is designed for experimentation. Each experiment should:

- Live in its own directory (e.g., `web-app/`, `mobile-app/`, `kiosk/`)
- Include its own README with setup and run instructions
- Be self-contained with its own dependencies
- Load data from `../data.csv` or a processed version

### Potential Experiments

Examples of experiments that might be built here:

- **Search & Discovery**: Full-text search, filtering by genre/author, visual browsing
- **Lending System**: QR code-based check-out, borrowing history, overdue tracking
- **Cataloging Tools**: Bulk editing, ISBN lookup for metadata enrichment, duplicate detection
- **Analytics**: Reading patterns, popular genres, collection gaps
- **Physical Interfaces**: Kiosk displays, label printing, location mapping

### Key Considerations for Noisebridge Context

- **Shared Resource**: Books are communally owned and managed
- **Open Access**: System should be accessible to all hackerspace members
- **Low Barrier**: Solutions should be easy to use without extensive training
- **Offline-Friendly**: Hackerspace internet may be unreliable
- **Physical Integration**: Consider how digital tools connect to physical book locations
- **Device Flexibility**: Native apps can be considered but members will have a wide range of devices and setups. A device-agnostic approach has to be the baseline.

## Database Update Workflow

When `data.csv` is updated (books added, metadata changed, etc.), the web app database must be regenerated. This is automated via the `update-web-db.sh` script.

### Quick Update

```bash
./update-web-db.sh --skip-validation
```

This will:
1. Run CSV cleanup (converts 73 columns → 13 columns)
2. Copy cleaned CSV to `web-app/public/cleaned_output.csv`
3. Complete in ~5-10 seconds

### Full Documentation

See [README-UPDATE-DB.md](README-UPDATE-DB.md) for:
- Complete usage guide
- All available options
- Testing procedures
- Troubleshooting tips

## Visual Analysis and Coordinate Detection

### For Diagrams, Floor Plans, and Abstract Images

**Use AI Vision MCP (Gemini)** - Not traditional computer vision tools.

- **Install**: `claude mcp add ai-vision-mcp -e IMAGE_PROVIDER=google -e GEMINI_API_KEY=your-key -- npx ai-vision-mcp`
- **Best for**: Floor plans, diagrams, charts, UI mockups, technical drawings
- **Why**: Multimodal vision models understand abstract representations and context
- **Not for**: Photo-based computer vision (use OpenCV for that)

**Example - Detecting shapes in diagrams:**
```javascript
mcp__ai-vision-mcp__detect_objects_in_image({
  imageSource: "/path/to/floorplan.png",
  prompt: "Detect all red rectangular regions. Return bounding box coordinates as percentages."
})
```

**Important**: AI Vision returns **center point coordinates**. If using with SVG rect (which uses top-left anchor), adjust:
```javascript
x_topleft = x_center - (width / 2)
y_topleft = y_center - (height / 2)
```

### SVG Overlay Best Practices

When overlaying SVG on images:

1. **Match aspect ratios**: CSS `aspect-ratio` must match image dimensions
   ```css
   aspect-ratio: 2331 / 2657; /* Use actual image width/height */
   ```

2. **Check coordinate anchor points**: AI vision typically returns centers, SVG uses top-left

3. **Use Playwright for visual verification**: Take screenshots during development to catch alignment issues

## Floorplan Maintenance

### Image Files

The floorplan feature uses two image files:
- **`web-app/public/nb-floorplan.png`** - The main floorplan image used by the component
- **`web-app/public/nb-floorplan-no-bg.png`** - Clean base version (kept for reference)

**Important**: The `Floorplan.jsx` component references `/nb-floorplan.png`. Always verify which file is actually being used before updating assets.

### Updating the Floorplan

When updating the floorplan base image:
1. Check `web-app/src/components/Floorplan.jsx` to confirm which image file is referenced
2. Update the correct image file (typically `nb-floorplan.png`)
3. Use clean source files rather than programmatically removing backgrounds
4. Test the interactive overlays to ensure they still align correctly

## Subtask Usage Patterns

### When to Use Subtask

Subtask is effective for:
- **Exploration and research** - Investigating codebase patterns, APIs, or architecture
- **Polish and refinement** - Well-defined improvements like styling adjustments, text changes
- **Multi-file changes** - Tasks that touch several related files
- **Independent work** - Tasks that can be completed without frequent clarification

### Effective Task Delegation

For best results:
1. **Clear requirements** - Provide specific, measurable goals (e.g., "reduce text to half size")
2. **Context** - Include relevant file paths and what needs to change
3. **Scope appropriately** - Group related changes into one task, but keep tasks focused
4. **Review and iterate** - Use `subtask diff` to review changes before merging

Example of well-scoped polish task:
- Text size adjustments (CSS)
- Element positioning (component data)
- Asset updates (image replacement)

These are independent enough to work well together but related enough for a single task.

## Troubleshooting

### Subtask Issues

If subtask fails with "Credit balance is too low":
- This is usually an **authentication issue**, not actually about credits
- Solution: Re-authenticate with `/login` or `claude login`
- The error message is misleading - it's an account type mismatch (API key vs subscription)
- After re-login, subtask should work normally

### Asset Management

When updating images or other assets:
1. **Verify references** - Check which file path is actually used in the code
2. **Update the right file** - Don't assume based on filename alone
3. **Test changes** - Preview the UI to ensure assets load correctly
