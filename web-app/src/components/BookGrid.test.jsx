import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import BookGrid from './BookGrid';

// Mock BookCard component
vi.mock('./BookCard', () => ({
  default: ({ book }) => <div data-testid="book-card">{book.Title}</div>
}));

describe('BookGrid', () => {
  afterEach(cleanup);

  it('shows loading spinner when isLoading is true', () => {
    render(<BookGrid books={[]} isLoading={true} />);

    expect(screen.getByText('Loading books...')).toBeInTheDocument();
  });

  it('shows empty state message when books array is empty and not loading', () => {
    render(<BookGrid books={[]} isLoading={false} />);

    expect(screen.getByText('No books found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms')).toBeInTheDocument();
  });

  it('renders BookCard components when books are provided', () => {
    const books = [
      { ISBN: '123', Title: 'Book 1' },
      { ISBN: '456', Title: 'Book 2' },
      { ISBN: '789', Title: 'Book 3' }
    ];

    render(<BookGrid books={books} isLoading={false} />);

    const bookCards = screen.getAllByTestId('book-card');
    expect(bookCards).toHaveLength(3);
    expect(screen.getByText('Book 1')).toBeInTheDocument();
    expect(screen.getByText('Book 2')).toBeInTheDocument();
    expect(screen.getByText('Book 3')).toBeInTheDocument();
  });
});
