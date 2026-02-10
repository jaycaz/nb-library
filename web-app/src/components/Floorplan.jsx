import { useState } from 'react';
import './Floorplan.css';

// Shelf coordinates - AI-detected using Gemini vision model for precise alignment
// Format: { id, x%, y%, width%, height% }
const SHELF_REGIONS = [
  // Left panel - Woodshop area
  { id: '1.1', x: 26.3, y: 69.2, w: 3.2, h: 6.3 },

  // Right panel - vertical stack (AI-detected coordinates)
  { id: '2.1', x: 60.7, y: 81.8, w: 3.4, h: 4.5 },
  { id: '2.2', x: 60.7, y: 76.8, w: 3.4, h: 4.5 },
  { id: '2.3', x: 60.7, y: 71.8, w: 3.4, h: 4.5 },
  { id: '2.4', x: 60.7, y: 66.8, w: 3.4, h: 4.5 },
  { id: '2.5', x: 60.7, y: 61.3, w: 3.4, h: 4.5 },
  { id: '2.6', x: 60.7, y: 55.8, w: 3.4, h: 4.5 },
  { id: '2.7', x: 60.7, y: 50.3, w: 3.4, h: 4.5 },
  { id: '2.8', x: 60.7, y: 44.3, w: 3.4, h: 4.5 },
  { id: '2.9', x: 60.7, y: 39.3, w: 3.4, h: 4.5 },
  { id: '2.10', x: 60.7, y: 31.8, w: 3.4, h: 4.5 },
  { id: '2.11', x: 60.7, y: 26.8, w: 3.4, h: 4.4 },

  // Angled shelf (AI-detected, no rotation needed - already aligned)
  { id: '2.12', x: 69.4, y: 69.3, w: 3.4, h: 4.5 },

  // Bottom right corner
  { id: '2.13', x: 90.8, y: 87.4, w: 5.3, h: 2.8 },
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
                  rx="0.3"
                  ry="0.3"
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
