import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import BookGrid from './components/BookGrid';
import MapModal from './components/MapModal';
import { loadBookData, searchBooks } from './utils/csvLoader';
import './App.css';

function App() {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const books = await loadBookData();
        setAllBooks(books);
        setFilteredBooks(books);
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    const results = searchBooks(allBooks, query);
    setFilteredBooks(results);
  }, [allBooks]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-top">
            <div>
              <h1 className="app-title">Noisebridge Library</h1>
              <p className="app-subtitle">Browse and search our book collection</p>
            </div>
            <button
              className="map-button"
              onClick={() => setIsMapOpen(true)}
              aria-label="View library map"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Library Map</span>
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <SearchBar
            onSearch={handleSearch}
            totalBooks={allBooks.length}
            filteredCount={filteredBooks.length}
          />
          <BookGrid books={filteredBooks} isLoading={isLoading} />
        </div>
      </main>

      <footer className="app-footer">
        <p>Noisebridge Hackerspace Library Catalog</p>
      </footer>

      <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
    </div>
  );
}

export default App;
