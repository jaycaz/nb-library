import { describe, it, expect } from 'vitest';
import { searchBooks } from './csvLoader';

describe('searchBooks', () => {
  // Mock book data for testing
  const mockBooks = [
    {
      Title: 'The Pragmatic Programmer',
      Author: 'Andrew Hunt, David Thomas',
      Genre: 'Programming',
      ISBN: '978-0201616224'
    },
    {
      Title: 'Clean Code',
      Author: 'Robert C. Martin',
      Genre: 'Software Engineering',
      ISBN: '978-0132350884'
    },
    {
      Title: 'JavaScript: The Good Parts',
      Author: 'Douglas Crockford',
      Genre: 'Programming',
      ISBN: '978-0596517748'
    },
    {
      Title: 'Design Patterns',
      Author: 'Erich Gamma',
      Genre: 'Software Architecture',
      ISBN: '978-0201633610'
    }
  ];

  it('returns all books when query is empty string', () => {
    const result = searchBooks(mockBooks, '');
    expect(result).toEqual(mockBooks);
    expect(result.length).toBe(4);
  });

  it('returns all books when query is null', () => {
    const result = searchBooks(mockBooks, null);
    expect(result).toEqual(mockBooks);
    expect(result.length).toBe(4);
  });

  it('returns all books when query is undefined', () => {
    const result = searchBooks(mockBooks, undefined);
    expect(result).toEqual(mockBooks);
    expect(result.length).toBe(4);
  });

  it('filters books by title (case-insensitive)', () => {
    const result = searchBooks(mockBooks, 'clean code');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('Clean Code');
  });

  it('filters books by title with different case', () => {
    const result = searchBooks(mockBooks, 'PRAGMATIC');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('The Pragmatic Programmer');
  });

  it('filters books by author (case-insensitive)', () => {
    const result = searchBooks(mockBooks, 'martin');
    expect(result.length).toBe(1);
    expect(result[0].Author).toBe('Robert C. Martin');
  });

  it('filters books by author with different case', () => {
    const result = searchBooks(mockBooks, 'CROCKFORD');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('JavaScript: The Good Parts');
  });

  it('filters books by genre', () => {
    const result = searchBooks(mockBooks, 'programming');
    expect(result.length).toBe(2);
    expect(result[0].Genre).toBe('Programming');
    expect(result[1].Genre).toBe('Programming');
  });

  it('filters books by genre (case-insensitive)', () => {
    const result = searchBooks(mockBooks, 'SOFTWARE ENGINEERING');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('Clean Code');
  });

  it('filters books by ISBN', () => {
    const result = searchBooks(mockBooks, '978-0596517748');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('JavaScript: The Good Parts');
  });

  it('filters books by partial ISBN', () => {
    const result = searchBooks(mockBooks, '0201');
    expect(result.length).toBe(2);
  });

  it('returns empty array when no matches found', () => {
    const result = searchBooks(mockBooks, 'nonexistent book title');
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });

  it('handles books with missing Title field', () => {
    const booksWithMissingFields = [
      {
        Author: 'John Doe',
        Genre: 'Fiction',
        ISBN: '123456789'
      },
      ...mockBooks
    ];

    const result = searchBooks(booksWithMissingFields, 'john doe');
    expect(result.length).toBe(1);
    expect(result[0].Author).toBe('John Doe');
  });

  it('handles books with missing Author field', () => {
    const booksWithMissingFields = [
      {
        Title: 'Unknown Author Book',
        Genre: 'Mystery',
        ISBN: '999999999'
      },
      ...mockBooks
    ];

    const result = searchBooks(booksWithMissingFields, 'unknown author book');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('Unknown Author Book');
  });

  it('handles books with missing Genre field', () => {
    const booksWithMissingFields = [
      {
        Title: 'No Genre Book',
        Author: 'Jane Smith',
        ISBN: '888888888'
      },
      ...mockBooks
    ];

    const result = searchBooks(booksWithMissingFields, 'jane smith');
    expect(result.length).toBe(1);
    expect(result[0].Author).toBe('Jane Smith');
  });

  it('handles books with missing ISBN field', () => {
    const booksWithMissingFields = [
      {
        Title: 'No ISBN Book',
        Author: 'Bob Johnson',
        Genre: 'Science'
      },
      ...mockBooks
    ];

    const result = searchBooks(booksWithMissingFields, 'bob johnson');
    expect(result.length).toBe(1);
    expect(result[0].Author).toBe('Bob Johnson');
  });

  it('handles books with all undefined fields', () => {
    const booksWithUndefinedFields = [
      {},
      ...mockBooks
    ];

    const result = searchBooks(booksWithUndefinedFields, 'clean code');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('Clean Code');
  });

  it('trims whitespace from search query', () => {
    const result = searchBooks(mockBooks, '  clean code  ');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('Clean Code');
  });

  it('trims whitespace with tabs and newlines', () => {
    const result = searchBooks(mockBooks, '\t\nclean code\n\t');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('Clean Code');
  });

  it('matches partial words in title', () => {
    const result = searchBooks(mockBooks, 'java');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('JavaScript: The Good Parts');
  });

  it('matches across multiple fields', () => {
    const result = searchBooks(mockBooks, 'pattern');
    expect(result.length).toBe(1);
    expect(result[0].Title).toBe('Design Patterns');
  });

  it('returns multiple matches when query matches multiple books', () => {
    const result = searchBooks(mockBooks, 'the');
    expect(result.length).toBeGreaterThan(1);
  });
});
