import { useState, useEffect } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, totalBooks, filteredCount }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const handleClear = () => {
    setInputValue('');
  };

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <svg
          className="search-icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search by title, author, genre, or ISBN..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="search-input"
        />
        {inputValue && (
          <button onClick={handleClear} className="clear-button">
            ×
          </button>
        )}
      </div>
      <div className="search-results-count">
        {filteredCount} of {totalBooks} books
      </div>
    </div>
  );
};

export default SearchBar;
