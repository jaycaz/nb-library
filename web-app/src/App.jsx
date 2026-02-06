import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import BookGrid from './components/BookGrid';
import { loadBookData, searchBooks } from './utils/csvLoader';
import './App.css';

function App() {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
          <h1 className="app-title">Noisebridge Library</h1>
          <p className="app-subtitle">Browse and search our book collection</p>
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
    </div>
  );
}

export default App;
