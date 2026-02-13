import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Floorplan from './Floorplan';
import './LocationPopover.css';

const LocationPopover = ({ isOpen, onClose, shelfLocation }) => {
  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest('.location-popover-content') && !e.target.closest('.book-location')) {
        onClose();
      }
    };

    // Delay to prevent immediate close on same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="location-popover-overlay">
      <div className="location-popover-content" onClick={(e) => e.stopPropagation()}>
        <div className="popover-header">
          <h3 className="popover-title">Where to find this book</h3>
          <button
            className="popover-close"
            onClick={onClose}
            aria-label="Close location map"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="popover-body">
          <Floorplan highlightShelf={shelfLocation} disableHover={true} />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationPopover;
