import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapModal from './MapModal';

// Mock Floorplan component
vi.mock('./Floorplan', () => ({
  default: ({ showAllShelves }) => (
    <div data-testid="floorplan">Floorplan (showAllShelves: {String(showAllShelves)})</div>
  )
}));

describe('MapModal', () => {
  afterEach(cleanup);

  it('renders nothing when isOpen is false', () => {
    const mockOnClose = vi.fn();
    const { container } = render(<MapModal isOpen={false} onClose={mockOnClose} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders modal content when isOpen is true (check for "Noisebridge Library Map" title)', () => {
    const mockOnClose = vi.fn();
    render(<MapModal isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Noisebridge Library Map')).toBeInTheDocument();
    expect(screen.getByTestId('floorplan')).toBeInTheDocument();
  });

  it('has close button with accessible label "Close map"', () => {
    const mockOnClose = vi.fn();
    render(<MapModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close map' });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(<MapModal isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: 'Close map' });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
