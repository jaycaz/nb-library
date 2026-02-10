import { useEffect } from 'react';
import Floorplan from './Floorplan';
import './MapModal.css';

const MapModal = ({ isOpen, onClose }) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="map-icon">🗺️</span>
            Noisebridge Library Map
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close map"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          <Floorplan showAllShelves={true} />
          <div className="map-instructions">
            <p><strong>How to find your book:</strong></p>
            <ul>
              <li>Find the shelf number on your book card (e.g., 📍 2.5)</li>
              <li>Locate the corresponding red shelf on this map</li>
              <li>Visit the physical location to find your book!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
