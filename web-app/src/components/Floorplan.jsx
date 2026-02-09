import { useState } from 'react';
import './Floorplan.css';

// Shelf coordinates (percentages of image dimensions, calibrated to match PNG)
// Format: { id, x%, y%, width%, height% }
const SHELF_REGIONS = [
  // Left panel - Woodshop area
  { id: '1.1', x: 15.2, y: 64.5, w: 2.8, h: 7 },

  // Right panel - vertical stack along left edge
  { id: '2.1', x: 52.8, y: 89, w: 2.8, h: 3.5 },
  { id: '2.2', x: 52.8, y: 85, w: 2.8, h: 3.5 },
  { id: '2.3', x: 52.8, y: 81, w: 2.8, h: 3.5 },
  { id: '2.4', x: 52.8, y: 77, w: 2.8, h: 3.5 },
  { id: '2.5', x: 52.8, y: 72.5, w: 2.8, h: 4 },
  { id: '2.6', x: 52.8, y: 66.5, w: 2.8, h: 5.5 },
  { id: '2.7', x: 52.8, y: 62, w: 2.8, h: 4 },
  { id: '2.8', x: 52.8, y: 57.5, w: 2.8, h: 4 },
  { id: '2.9', x: 52.8, y: 53, w: 2.8, h: 4 },
  { id: '2.10', x: 52.8, y: 47, w: 2.8, h: 5.5 },
  { id: '2.11', x: 52.8, y: 40, w: 2.8, h: 6.5 },

  // Angled shelf near bottom right (rotated opposite direction)
  { id: '2.12', x: 64, y: 78, w: 6, h: 3, rotation: 35 },

  // Bottom right corner
  { id: '2.13', x: 93.5, y: 95, w: 3, h: 2 },
];

const Floorplan = ({ highlightShelf = null, showAllShelves = false, onShelfClick = null }) => {
  const [hoveredShelf, setHoveredShelf] = useState(null);

  const isHighlighted = (shelfId) => {
    if (showAllShelves) return true;
    if (!highlightShelf) return true;
    return shelfId === highlightShelf;
  };

  const handleShelfClick = (shelfId) => {
    if (onShelfClick) {
      onShelfClick(shelfId);
    }
  };

  return (
    <div className="floorplan-container">
      <div className="floorplan-wrapper">
        <img
          src="/nb-floorplan.png"
          alt="Noisebridge floorplan with shelf locations"
          className={`floorplan-image ${highlightShelf && !showAllShelves ? 'dimmed' : ''}`}
        />
        <svg
          className="floorplan-overlay"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {SHELF_REGIONS.map((shelf) => {
            const highlighted = isHighlighted(shelf.id);
            const hovered = hoveredShelf === shelf.id;

            return (
              <g key={shelf.id}>
                <rect
                  x={shelf.x}
                  y={shelf.y}
                  width={shelf.w}
                  height={shelf.h}
                  transform={shelf.rotation ? `rotate(${shelf.rotation} ${shelf.x + shelf.w/2} ${shelf.y + shelf.h/2})` : ''}
                  className={`shelf-region ${highlighted ? 'highlighted' : 'dimmed'} ${hovered ? 'hovered' : ''}`}
                  onClick={() => handleShelfClick(shelf.id)}
                  onMouseEnter={() => setHoveredShelf(shelf.id)}
                  onMouseLeave={() => setHoveredShelf(null)}
                />
                {(highlighted || showAllShelves || hovered) && (
                  <text
                    x={shelf.x + shelf.w / 2}
                    y={shelf.y + shelf.h / 2}
                    transform={shelf.rotation ? `rotate(${shelf.rotation} ${shelf.x + shelf.w/2} ${shelf.y + shelf.h/2})` : ''}
                    className="shelf-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {shelf.id}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {highlightShelf && !showAllShelves && (
        <div className="floorplan-legend">
          <span className="legend-icon">📍</span>
          <span className="legend-text">Shelf {highlightShelf}</span>
        </div>
      )}
    </div>
  );
};

export default Floorplan;
