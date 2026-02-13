# Noisebridge Library

Data and tools for the book library at [Noisebridge](https://noisebridge.net), San Francisco's hackerspace. The catalog has 1,100+ books.

![Screenshot](web-app/docs/screenshot.png)

## Projects

### [`web-app/`](web-app/) — Search & Browse UI

A React app for searching the catalog, viewing book details, and locating books on an interactive floorplan.

```bash
cd web-app && npm install && npm run dev
```

---

### [`csv-cleanup/`](csv-cleanup/) — Data Pipeline

Python script that converts the raw 73-column `data.csv` export into the clean 13-column CSV the web app uses. No external dependencies.

```bash
cd csv-cleanup && python3 clean_library_csv.py --input ../data.csv --output cleaned.csv
```

---

### [`isbn-validation/`](isbn-validation/) — ISBN Checker

Validates whether each book's ISBN matches its stated edition using Google Books and Open Library APIs.

```bash
cd isbn-validation && python3 validate_editions.py --limit 5
```

---

## Updating the Web App Data

When books are added or metadata changes in `data.csv`, regenerate the web app's database with [`update-web-db.sh`](README-UPDATE-DB.md):

```bash
./update-web-db.sh --skip-validation
```

## Data

`data.csv` is the source of truth — a 73-column export from the library catalog app. Each subproject reads from this file and processes it for its own needs.
