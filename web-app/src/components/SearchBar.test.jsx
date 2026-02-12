import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  afterEach(cleanup);

  it('renders the search input with correct placeholder text', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} totalBooks={100} filteredCount={100} />);

    const input = screen.getByPlaceholderText('Search by title, author, genre, or ISBN...');
    expect(input).toBeInTheDocument();
  });

  it('displays book count (e.g., "50 of 100 books")', () => {
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} totalBooks={100} filteredCount={50} />);

    expect(screen.getByText('50 of 100 books')).toBeInTheDocument();
  });

  it('clear button appears when input has text and disappears when empty', async () => {
    const user = userEvent.setup();
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} totalBooks={100} filteredCount={100} />);

    const input = screen.getByPlaceholderText('Search by title, author, genre, or ISBN...');

    // Initially, no clear button
    expect(screen.queryByRole('button', { name: '×' })).not.toBeInTheDocument();

    // Type some text
    await user.type(input, 'test');

    // Clear button should appear
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  it('clear button resets input value when clicked', async () => {
    const user = userEvent.setup();
    const mockOnSearch = vi.fn();
    render(<SearchBar onSearch={mockOnSearch} totalBooks={100} filteredCount={100} />);

    const input = screen.getByPlaceholderText('Search by title, author, genre, or ISBN...');

    // Type some text
    await user.type(input, 'test');
    expect(input).toHaveValue('test');

    // Click clear button
    const clearButton = screen.getByRole('button', { name: '×' });
    await user.click(clearButton);

    // Input should be cleared
    expect(input).toHaveValue('');
  });
});
