import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import BookCard from './BookCard';

// Mock LocationPopover component
vi.mock('./LocationPopover', () => ({
  default: ({ isOpen, shelfLocation }) => (
    isOpen ? <div data-testid="location-popover">Popover for {shelfLocation}</div> : null
  )
}));

describe('BookCard', () => {
  afterEach(cleanup);

  it('renders book title', () => {
    const book = {
      Title: 'The Great Gatsby',
      Author: 'F. Scott Fitzgerald'
    };

    render(<BookCard book={book} />);

    expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
  });

  it('shows "Untitled" when title is missing', () => {
    const book = {
      Author: 'Unknown Author'
    };

    render(<BookCard book={book} />);

    expect(screen.getByText('Untitled')).toBeInTheDocument();
  });

  it('renders author when provided', () => {
    const book = {
      Title: 'The Great Gatsby',
      Author: 'F. Scott Fitzgerald'
    };

    render(<BookCard book={book} />);

    expect(screen.getByText('by F. Scott Fitzgerald')).toBeInTheDocument();
  });

  it('renders genre badge when genre is provided', () => {
    const book = {
      Title: 'Test Book',
      Genre: 'Science Fiction'
    };

    render(<BookCard book={book} />);

    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
  });

  it('shows shelf location button when shelf location is provided', () => {
    const book = {
      Title: 'Test Book',
      'Shelf Location': 'A1'
    };

    render(<BookCard book={book} />);

    const locationButton = screen.getByRole('button', { name: 'View location of shelf A1 on map' });
    expect(locationButton).toBeInTheDocument();
    expect(screen.getByText(/A1/)).toBeInTheDocument();
  });

  it('displays year when provided', () => {
    const book = {
      Title: 'Test Book',
      Year: '1925'
    };

    render(<BookCard book={book} />);

    expect(screen.getByText('1925')).toBeInTheDocument();
  });

  it('displays ISBN when provided and not "N/A"', () => {
    const book = {
      Title: 'Test Book',
      ISBN: '978-0-123456-78-9'
    };

    render(<BookCard book={book} />);

    expect(screen.getByText('978-0-123456-78-9')).toBeInTheDocument();
  });
});
