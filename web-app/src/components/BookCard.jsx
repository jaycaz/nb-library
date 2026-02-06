import { useState } from 'react';
import './BookCard.css';

const BookCard = ({ book }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const coverUrl = book['Cover URL'];
  const hasCover = coverUrl && !imageError && coverUrl !== 'N/A';

  return (
    <div className="book-card">
      <div className="book-cover">
        {hasCover ? (
          <img
            src={coverUrl}
            alt={`Cover of ${book.Title}`}
            onError={handleImageError}
            loading="lazy"
          />
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
        {book.Author && <p className="book-author">{book.Author}</p>}
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
