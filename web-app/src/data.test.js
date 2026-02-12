import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('Data Integrity Tests', () => {
  describe('Cleaned CSV (cleaned_output.csv)', () => {
    const cleanedCsvPath = resolve(__dirname, '../public/cleaned_output.csv');
    const csvContent = readFileSync(cleanedCsvPath, 'utf-8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    const { data, meta } = parsed;

    it('has the expected 15 columns', () => {
      const expectedColumns = [
        'Title',
        'Author',
        'Series',
        'ISBN',
        'Publisher',
        'Year',
        'Genre',
        'Pages',
        'Shelf Location',
        'Cover URL',
        'Placeholder Cover',
        'Summary',
        'Google VolumeID',
        'Loaned To',
        'Notes',
      ];

      expect(meta.fields).toEqual(expectedColumns);
      expect(meta.fields).toHaveLength(15);
    });

    it('has at least 1000 rows of data', () => {
      expect(data.length).toBeGreaterThanOrEqual(1000);
    });

    it('every row has a non-empty Title', () => {
      const rowsWithoutTitle = data.filter(row => !row.Title || row.Title.trim() === '');
      expect(rowsWithoutTitle).toHaveLength(0);
    });

    it('has a stable count of unique ISBNs', () => {
      const isbns = data
        .map(row => row.ISBN)
        .filter(isbn => isbn && isbn.trim() !== '' && isbn !== 'N/A');

      const uniqueIsbns = new Set(isbns);
      // Baseline: the dataset currently has ~900+ unique ISBNs.
      // A significant drop would indicate data loss.
      expect(uniqueIsbns.size).toBeGreaterThanOrEqual(800);
    });
  });

  describe('Raw CSV (data.csv)', () => {
    const rawCsvPath = resolve(__dirname, '../../data.csv');
    const csvContent = readFileSync(rawCsvPath, 'utf-8');
    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    const { data, meta } = parsed;

    it('has at least 73 columns', () => {
      expect(meta.fields.length).toBeGreaterThanOrEqual(73);
    });

    it('has at least 1000 rows', () => {
      expect(data.length).toBeGreaterThanOrEqual(1000);
    });

    it('the first column is "Title"', () => {
      expect(meta.fields[0]).toBe('Title');
    });
  });
});
