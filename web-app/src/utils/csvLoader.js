import Papa from 'papaparse';

export const loadBookData = async () => {
  try {
    const response = await fetch('/cleaned_output.csv');
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading CSV:', error);
    throw error;
  }
};

export const searchBooks = (books, query) => {
  if (!query || query.trim() === '') {
    return books;
  }

  const searchTerm = query.toLowerCase().trim();

  return books.filter(book => {
    const title = (book.Title || '').toLowerCase();
    const author = (book.Author || '').toLowerCase();
    const genre = (book.Genre || '').toLowerCase();
    const isbn = (book.ISBN || '').toLowerCase();

    return title.includes(searchTerm) ||
           author.includes(searchTerm) ||
           genre.includes(searchTerm) ||
           isbn.includes(searchTerm);
  });
};
