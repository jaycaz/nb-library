import { useState, useEffect } from 'react';
import './BookCard.css';

const BookCard = ({ book }) => {
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleMouseEnter = () => {
    // Only trigger on desktop (non-touch devices)
    if (!('ontouchstart' in window)) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    // Only trigger on desktop (non-touch devices)
    if (!('ontouchstart' in window)) {
      setShowTooltip(false);
    }
  };

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(prev => !prev);
  };

  // Click-outside detection for mobile
  useEffect(() => {
    if (!showTooltip) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest('.placeholder-indicator')) {
        setShowTooltip(false);
      }
    };

    // Delay to prevent immediate close on same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showTooltip]);

  const coverUrl = book['Cover URL'];
  const hasCover = coverUrl && !imageError && coverUrl !== 'N/A';

  return (
    <div className="book-card">
      <div className="book-cover">
        {hasCover ? (
          <>
            <img
              src={coverUrl}
              alt={`Cover of ${book.Title}`}
              onError={handleImageError}
              loading="lazy"
            />
            {book['Placeholder Cover'] === 'yes' && (
              <div
                className="placeholder-indicator"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                role="tooltip"
                aria-label="Cover image information"
              >
                <div className="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>
                  </svg>
                </div>
                {showTooltip && (
                  <div className="tooltip-bubble">
                    Cover image from Google Books - actual book may look different
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="book-cover-placeholder">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.Title || 'Untitled'}</h3>
        {(book.Author && book.Author !== 'N/A') ? (
          <p className="book-author">by {book.Author}</p>
        ) : book.Series ? (
          <p className="book-series">{book.Series}</p>
        ) : null}
        <div className="book-meta">
          {book.Genre && (
            <span className="book-genre">{book.Genre}</span>
          )}
          {book['Shelf Location'] && (
            <span className="book-location">
              📍 {book['Shelf Location']}
            </span>
          )}
        </div>
        {book.Year && (
          <p className="book-year">{book.Year}</p>
        )}
        {book.ISBN && book.ISBN !== 'N/A' && (
          <p className="book-isbn">{book.ISBN}</p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
