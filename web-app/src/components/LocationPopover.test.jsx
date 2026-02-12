import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import LocationPopover from './LocationPopover';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Mock Floorplan since we're testing the popover behavior, not the map
vi.mock('./Floorplan', () => ({
  default: ({ highlightShelf }) => (
    <div data-testid="floorplan-mock">Shelf: {highlightShelf}</div>
  ),
}));

afterEach(cleanup);

describe('LocationPopover', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    shelfLocation: '2.3',
  };

  it('renders nothing when closed', () => {
    const { container } = render(
      <LocationPopover {...defaultProps} isOpen={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders popover content when open', () => {
    render(<LocationPopover {...defaultProps} />);
    expect(screen.getByText('Where to find this book')).toBeInTheDocument();
    expect(screen.getByTestId('floorplan-mock')).toHaveTextContent('Shelf: 2.3');
  });

  it('passes shelfLocation to Floorplan', () => {
    render(<LocationPopover {...defaultProps} shelfLocation="1.1" />);
    expect(screen.getByTestId('floorplan-mock')).toHaveTextContent('Shelf: 1.1');
  });

  it('has a close button with accessible label', () => {
    render(<LocationPopover {...defaultProps} />);
    expect(screen.getByRole('button', { name: /close location map/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<LocationPopover {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: /close location map/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // This is the test that would have caught the flashing bug.
  // The popover had max-width: 4000px, which caused it to briefly render
  // at full viewport width before the animation constrained it, producing
  // a visible flash on desktop screens.
  it('popover max-width does not exceed a reasonable desktop size', () => {
    const cssPath = resolve(__dirname, 'LocationPopover.css');
    const css = readFileSync(cssPath, 'utf-8');

    // Extract max-width from the .location-popover-content rule
    const contentBlock = css.match(
      /\.location-popover-content\s*\{[^}]*max-width:\s*(\d+)px/
    );
    expect(contentBlock).not.toBeNull();

    const maxWidth = parseInt(contentBlock[1], 10);

    // Should be capped at a reasonable size (currently 1400px).
    // Anything over ~1600px is likely to cause layout flash on common monitors.
    expect(maxWidth).toBeLessThanOrEqual(1600);
    expect(maxWidth).toBeGreaterThan(0);
  });
});
