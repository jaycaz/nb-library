import { useState } from 'react';
import './Floorplan.css';

// Shelf coordinates (approximate percentages of image dimensions)
// Format: { id, x%, y%, width%, height% }
const SHELF_REGIONS = [
  // Left panel shelves
  { id: '1.1', x: 26.5, y: 78, w: 3.5, h: 8.5 },

  // Right panel shelves (vertical stack)
  { id: '2.1', x: 61.5, y: 90, w: 3.5, h: 4 },
  { id: '2.2', x: 61.5, y: 85, w: 3.5, h: 4 },
  { id: '2.3', x: 61.5, y: 80.5, w: 3.5, h: 4 },
  { id: '2.4', x: 61.5, y: 76, w: 3.5, h: 4 },
  { id: '2.5', x: 61.5, y: 71, w: 3.5, h: 4 },
  { id: '2.6', x: 61.5, y: 62, w: 3.5, h: 8 },
  { id: '2.7', x: 61.5, y: 56.5, w: 3.5, h: 5 },
  { id: '2.8', x: 61.5, y: 51, w: 3.5, h: 5 },
  { id: '2.9', x: 61.5, y: 45.5, w: 3.5, h: 5 },
  { id: '2.10', x: 61.5, y: 36.5, w: 3.5, h: 8.5 },
  { id: '2.11', x: 61.5, y: 28, w: 3.5, h: 8 },

  // Angled shelf
  { id: '2.12', x: 69, y: 77, w: 7, h: 3.5, rotation: -35 },

  // Bottom right shelf
  { id: '2.13', x: 93, y: 97.5, w: 4, h: 2 },
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
