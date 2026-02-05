# Architecture Guide for visionOS Developers

A step-by-step walkthrough of how this web app is built, explained with
analogies to SwiftUI, Xcode, and the Apple platform toolchain you already know.

---

## Table of Contents

1. [The Big Picture](#1-the-big-picture)
2. [Mapping Concepts: Apple vs Web](#2-mapping-concepts-apple-vs-web)
3. [The Toolchain](#3-the-toolchain)
4. [Project Structure](#4-project-structure)
5. [Step 1: The Entry Point (main.jsx)](#5-step-1-the-entry-point)
6. [Step 2: The Root View (App.jsx)](#6-step-2-the-root-view)
7. [Step 3: State Management](#7-step-3-state-management)
8. [Step 4: Data Loading (csvLoader.js)](#8-step-4-data-loading)
9. [Step 5: Components as Views](#9-step-5-components-as-views)
10. [Step 6: Styling (CSS files)](#10-step-6-styling)
11. [Step 7: How Rendering Works](#11-step-7-how-rendering-works)
12. [Step 8: Building for Production](#12-step-8-building-for-production)
13. [Step 9: Deployment with Docker](#13-step-9-deployment-with-docker)
14. [Full Data Flow Diagram](#14-full-data-flow-diagram)
15. [Glossary](#15-glossary)

---

## 1. The Big Picture

This app is a **search-and-browse interface** for a library of 1,100+ books.
There is no server-side logic or database. The entire dataset (a CSV file) is
bundled into the app at build time and parsed in the browser at runtime.

Think of it like a visionOS app where you ship a `.json` file inside your app
bundle and decode it on launch -- except the "app bundle" is a folder of HTML,
CSS, and JavaScript files served by a web server.

### What this app does

1. Loads a CSV file of books when the page opens
2. Parses it into an array of dictionaries (objects)
3. Renders a grid of book cards
4. Lets the user type a search query to filter the grid in real time

---

## 2. Mapping Concepts: Apple vs Web

| Apple / visionOS | Web Equivalent (this app) | Notes |
|---|---|---|
| Xcode | **Vite** | Build tool, dev server, bundler |
| Swift / SwiftUI | **JavaScript / React (JSX)** | Language and UI framework |
| `@main` / `App` struct | `main.jsx` | Entry point |
| `ContentView` | `App.jsx` | Root view |
| `@State` | `useState()` | Local reactive state |
| `@StateObject` / `@ObservedObject` | `useState()` at parent + props down | Shared state pattern |
| `.onAppear { }` | `useEffect(() => {}, [])` | Run code when a view appears |
| `body: some View` | `return ( <div>...</div> )` | Declaring UI |
| SwiftUI modifiers (`.font()`, `.padding()`) | **CSS classes** | Styling |
| `ForEach` | `array.map()` | Looping over data to render views |
| `if condition { View }` | `{condition && <View />}` | Conditional rendering |
| Asset catalog / Bundle.main | `public/` folder | Static files shipped with the app |
| `.xcassets` images | CSS + inline SVG | Icons and graphics |
| Swift Package Manager | **npm** (Node Package Manager) | Dependency management |
| `Package.swift` | `package.json` | Dependency manifest |
| `.app` bundle (archive) | `dist/` folder (build output) | What you ship |
| TestFlight / App Store | **Docker container on a server** | Distribution |

---

## 3. The Toolchain

### 3.1 Node.js -- the runtime

Node.js is to JavaScript what the Swift runtime is to Swift. You need it
installed on your machine to run build tools and development servers. Node.js
itself does **not** run in production for this app -- it is only used during
development and building.

### 3.2 npm -- the package manager

npm is the equivalent of Swift Package Manager. The file `package.json` is like
`Package.swift` -- it declares the project name, scripts, and dependencies.

```json
// package.json (simplified)
{
  "dependencies": {
    "react": "^19.2.0",       // The UI framework (like SwiftUI)
    "react-dom": "^19.2.0",   // Renders React to the browser DOM
    "papaparse": "^5.5.3"     // CSV parser (like a Swift CSV library)
  },
  "devDependencies": {
    "vite": "^7.2.4",         // Build tool (like Xcode's build system)
    "eslint": "^9.39.1"       // Linter (like SwiftLint)
  }
}
```

Running `npm install` reads this file and downloads all dependencies into a
`node_modules/` folder (like SPM's `.build/` directory). You never commit
`node_modules/` to git.

### 3.3 Vite -- the build tool

Vite (French for "fast") replaces Xcode's build system. It does two things:

- **Dev mode** (`npm run dev`): Starts a local web server with hot-reload.
  Every time you save a file, the browser updates instantly -- no rebuild
  needed. This is faster than Xcode previews.

- **Production build** (`npm run build`): Bundles, minifies, and optimizes all
  your source files into a `dist/` folder of static HTML/CSS/JS. This is like
  archiving your Xcode project into a `.app`.

---

## 4. Project Structure

```
web-app/
├── index.html                    # The single HTML page (like a storyboard)
├── package.json                  # Dependencies (like Package.swift)
├── vite.config.js                # Build config (like xcconfig)
│
├── public/
│   └── cleaned_output.csv        # The book data (like a bundled .json)
│
├── src/
│   ├── main.jsx                  # Entry point (like @main App struct)
│   ├── App.jsx                   # Root component (like ContentView)
│   ├── App.css                   # Root styles
│   ├── index.css                 # Global styles (like global appearance proxy)
│   │
│   ├── components/
│   │   ├── SearchBar.jsx         # Search input component
│   │   ├── SearchBar.css
│   │   ├── BookCard.jsx          # Individual book card
│   │   ├── BookCard.css
│   │   ├── BookGrid.jsx          # Grid layout of cards
│   │   └── BookGrid.css
│   │
│   └── utils/
│       └── csvLoader.js          # Data loading + search logic
│
├── Dockerfile                    # Build + serve recipe (like CI config)
├── docker-compose.yml            # Orchestration (like Xcode scheme)
└── nginx.conf                    # Web server config (no Apple equivalent)
```

### Key insight: `.jsx` files

JSX is a syntax extension to JavaScript that lets you write HTML-like markup
directly in your code. It is the React equivalent of SwiftUI's `body` property.

```swift
// SwiftUI
var body: some View {
    VStack {
        Text("Hello")
        Button("Tap me") { }
    }
}
```

```jsx
// React JSX
return (
    <div>
        <p>Hello</p>
        <button onClick={() => {}}>Tap me</button>
    </div>
);
```

Both are declarative. Both describe **what** the UI should look like, not
**how** to build it step by step.

---

## 5. Step 1: The Entry Point

**File: `src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**What is happening:**

1. `document.getElementById('root')` finds a `<div id="root">` in `index.html`.
   Think of this as the window your app renders into -- like `UIWindow` in UIKit
   or the `WindowGroup` in SwiftUI.

2. `createRoot(...)` tells React to take over that DOM node and manage its
   contents. This is like calling `UIHostingController(rootView: App())`.

3. `<App />` is the root component. Everything else is nested inside it.

4. `StrictMode` is a development-only wrapper that warns you about potential
   problems. It has no effect in production. Think of it like enabling extra
   diagnostics in Xcode's scheme.

**Apple equivalent:**

```swift
@main
struct LibraryApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()  // <-- this is <App />
        }
    }
}
```

---

## 6. Step 2: The Root View

**File: `src/App.jsx`**

This is the `ContentView` of the web app. Here is the full file, annotated:

```jsx
import { useState, useEffect, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import BookGrid from './components/BookGrid';
import { loadBookData, searchBooks } from './utils/csvLoader';
import './App.css';

function App() {
  // ---- STATE (like @State in SwiftUI) ----
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ---- LIFECYCLE (like .onAppear) ----
  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      const books = await loadBookData();
      setAllBooks(books);
      setFilteredBooks(books);
      setIsLoading(false);
    };
    fetchBooks();
  }, []);  // [] means "run once on mount" -- same as .onAppear

  // ---- EVENT HANDLER ----
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    const results = searchBooks(allBooks, query);
    setFilteredBooks(results);
  }, [allBooks]);

  // ---- UI (like body: some View) ----
  return (
    <div className="app">
      <header className="app-header">
        <h1>Noisebridge Library</h1>
        <p>Browse and search our book collection</p>
      </header>

      <main className="app-main">
        <SearchBar
          onSearch={handleSearch}
          totalBooks={allBooks.length}
          filteredCount={filteredBooks.length}
        />
        <BookGrid books={filteredBooks} isLoading={isLoading} />
      </main>

      <footer className="app-footer">
        <p>Noisebridge Hackerspace Library Catalog</p>
      </footer>
    </div>
  );
}
```

### The SwiftUI translation

If this were SwiftUI, it would look roughly like this:

```swift
struct ContentView: View {
    @State private var allBooks: [Book] = []
    @State private var filteredBooks: [Book] = []
    @State private var isLoading = true
    @State private var searchQuery = ""

    var body: some View {
        VStack {
            HeaderView()
            SearchBar(
                onSearch: handleSearch,
                totalBooks: allBooks.count,
                filteredCount: filteredBooks.count
            )
            BookGrid(books: filteredBooks, isLoading: isLoading)
            FooterView()
        }
        .onAppear { loadBooks() }
    }

    func handleSearch(_ query: String) {
        searchQuery = query
        filteredBooks = searchBooks(allBooks, query)
    }
}
```

### Props = Init parameters

In React, data flows **downward** via "props" (properties). When `App` renders
`<SearchBar onSearch={handleSearch} />`, it is passing `handleSearch` as a prop.

This is exactly like passing a closure or binding to a child view in SwiftUI:

```swift
SearchBar(onSearch: handleSearch)  // Swift
```
```jsx
<SearchBar onSearch={handleSearch} />  // React
```

---

## 7. Step 3: State Management

### `useState` = `@State`

```jsx
const [isLoading, setIsLoading] = useState(true);
//     ^value     ^setter          ^initial value
```

This is the React equivalent of:

```swift
@State private var isLoading = true
```

Key difference: in React, you **must** use the setter function (`setIsLoading`)
to update state. You cannot mutate it directly. In SwiftUI, you assign to the
property directly (`isLoading = false`), but under the hood SwiftUI is also
using a setter.

When state changes, React re-renders the component (re-calls the function) --
just like SwiftUI re-evaluates `body` when `@State` changes.

### `useEffect` = `.onAppear` / `.onChange`

```jsx
useEffect(() => {
    // This code runs after render
    loadData();
}, []);  // empty array = run once, on mount
```

The dependency array `[]` controls when the effect re-runs:

| Dependency array | SwiftUI equivalent | When it runs |
|---|---|---|
| `[]` (empty) | `.onAppear { }` | Once, when the view appears |
| `[someValue]` | `.onChange(of: someValue) { }` | When `someValue` changes |
| (omitted) | No equivalent | After every render (rare) |

### `useCallback` = memoized closure

```jsx
const handleSearch = useCallback((query) => {
    // ...
}, [allBooks]);
```

This tells React: "only create a new version of this closure when `allBooks`
changes." This is a performance optimization. Without it, `handleSearch` would
be a new closure reference on every render, which could cause unnecessary
re-renders of child components. There is no direct SwiftUI equivalent, but it
is conceptually like caching a computed property.

---

## 8. Step 4: Data Loading

**File: `src/utils/csvLoader.js`**

This file serves the same role as a `DataService` or `Repository` class in your
Swift codebase. It has two functions:

### `loadBookData()` -- fetching and parsing

```javascript
import Papa from 'papaparse';

export const loadBookData = async () => {
  const response = await fetch('/cleaned_output.csv');
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};
```

**Translated to Swift thinking:**

```swift
func loadBookData() async throws -> [Book] {
    // 1. Fetch the CSV from the app bundle (here, from the web server)
    let url = Bundle.main.url(forResource: "cleaned_output", withExtension: "csv")!
    let csvText = try String(contentsOf: url)

    // 2. Parse CSV into array of dictionaries
    //    PapaParse is like a CSV version of JSONDecoder
    let books = CSVDecoder().decode(csvText)

    return books
}
```

Key points:
- `fetch()` is the web equivalent of `URLSession.shared.data(from:)`.
- `Papa.parse()` is a third-party CSV parser, like using `CodableCSV` or
  `SwiftCSV` in a Swift project.
- The `{ header: true }` option means the first row becomes dictionary keys --
  like `JSONDecoder` mapping JSON keys to struct properties.
- Each book becomes a plain JavaScript object (dictionary), not a typed struct.

### `searchBooks()` -- filtering

```javascript
export const searchBooks = (books, query) => {
  if (!query || query.trim() === '') return books;

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
```

**Swift equivalent:**

```swift
func searchBooks(_ books: [Book], query: String) -> [Book] {
    guard !query.trimmingCharacters(in: .whitespaces).isEmpty else {
        return books
    }
    let term = query.lowercased().trimmingCharacters(in: .whitespaces)
    return books.filter {
        $0.title.lowercased().contains(term) ||
        $0.author.lowercased().contains(term) ||
        $0.genre.lowercased().contains(term) ||
        $0.isbn.lowercased().contains(term)
    }
}
```

No fuzzy matching, no indexing -- just substring search across four fields.

---

## 9. Step 5: Components as Views

React components are functions that return JSX. They are the direct equivalent
of SwiftUI `View` structs. Let's walk through each one.

### SearchBar (`components/SearchBar.jsx`)

```jsx
const SearchBar = ({ onSearch, totalBooks, filteredCount }) => {
    const [inputValue, setInputValue] = useState('');

    // Debounce: wait 300ms after the user stops typing before searching
    useEffect(() => {
        const timer = setTimeout(() => onSearch(inputValue), 300);
        return () => clearTimeout(timer);  // cleanup on re-render
    }, [inputValue, onSearch]);

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search by title, author, genre, or ISBN..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            <div>{filteredCount} of {totalBooks} books</div>
        </div>
    );
};
```

**Notable concept -- debouncing:**

The `useEffect` with `setTimeout` implements a 300ms debounce. This means the
search doesn't fire on every keystroke -- it waits until the user pauses. In
Swift, you would achieve this with `Combine`:

```swift
$searchText
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .sink { query in onSearch(query) }
```

The `return () => clearTimeout(timer)` is a **cleanup function**. React calls
it before re-running the effect. This cancels the previous timer, ensuring only
the latest keystroke triggers a search. It is like calling `.cancel()` on a
Combine subscription.

### BookGrid (`components/BookGrid.jsx`)

```jsx
const BookGrid = ({ books, isLoading }) => {
    if (isLoading) {
        return <div className="loading-spinner">Loading books...</div>;
    }
    if (books.length === 0) {
        return <div className="empty-state">No books found</div>;
    }
    return (
        <div className="book-grid">
            {books.map((book, index) => (
                <BookCard key={`${book.ISBN}-${index}`} book={book} />
            ))}
        </div>
    );
};
```

**SwiftUI equivalent:**

```swift
struct BookGrid: View {
    let books: [Book]
    let isLoading: Bool

    var body: some View {
        if isLoading {
            ProgressView("Loading books...")
        } else if books.isEmpty {
            ContentUnavailableView("No books found", systemImage: "magnifyingglass")
        } else {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 200))]) {
                ForEach(Array(books.enumerated()), id: \.offset) { _, book in
                    BookCard(book: book)
                }
            }
        }
    }
}
```

The `key` prop in `books.map()` serves the same purpose as `id:` in `ForEach`
-- it tells the framework how to track which items moved, were added, or were
removed, so it can animate and update efficiently.

### BookCard (`components/BookCard.jsx`)

```jsx
const BookCard = ({ book }) => {
    const [imageError, setImageError] = useState(false);

    const coverUrl = book['Cover URL'];
    const hasCover = coverUrl && !imageError && coverUrl !== 'N/A';

    return (
        <div className="book-card">
            <div className="book-cover">
                {hasCover ? (
                    <img src={coverUrl} alt={book.Title}
                         onError={() => setImageError(true)}
                         loading="lazy" />
                ) : (
                    <div className="book-cover-placeholder">
                        {/* SVG book icon */}
                    </div>
                )}
            </div>
            <div className="book-info">
                <h3>{book.Title || 'Untitled'}</h3>
                {book.Author && <p>{book.Author}</p>}
                {book.Genre && <span>{book.Genre}</span>}
            </div>
        </div>
    );
};
```

**SwiftUI equivalent:**

```swift
struct BookCard: View {
    let book: Book
    @State private var imageError = false

    var body: some View {
        VStack {
            if let url = book.coverURL, !imageError {
                AsyncImage(url: url) { image in
                    image.resizable().aspectRatio(2/3, contentMode: .fill)
                } placeholder: {
                    BookPlaceholder()
                }
            } else {
                BookPlaceholder()
            }
            Text(book.title).lineLimit(2)
            if let author = book.author { Text(author) }
        }
    }
}
```

Key concepts:
- `loading="lazy"` on `<img>` is like using `LazyVGrid` / `LazyVStack` in
  SwiftUI -- images only load when they scroll into view.
- `onError` is an image load failure handler. The component falls back to a
  placeholder SVG icon, similar to `AsyncImage`'s placeholder.

---

## 10. Step 6: Styling

### How CSS works (for someone who knows SwiftUI modifiers)

In SwiftUI, you style views inline:

```swift
Text("Hello")
    .font(.title)
    .foregroundColor(.blue)
    .padding(16)
```

In web development, you separate structure (JSX) from style (CSS). Each
component references a CSS class name via `className`:

```jsx
<h1 className="app-title">Noisebridge Library</h1>
```

And in `App.css`:

```css
.app-title {
    font-size: 2rem;         /* like .font(.title) */
    color: white;            /* like .foregroundColor(.white) */
    margin: 0;               /* like .padding(0) */
}
```

### Why separate files?

This is a design philosophy difference. SwiftUI co-locates style with
structure. Web development traditionally separates them. There are web
approaches that co-locate (CSS-in-JS, Tailwind), but this project uses the
traditional approach.

Each component has a paired `.css` file:

| Component | Style file |
|---|---|
| `App.jsx` | `App.css` |
| `SearchBar.jsx` | `SearchBar.css` |
| `BookCard.jsx` | `BookCard.css` |
| `BookGrid.jsx` | `BookGrid.css` |

### Responsive layout

The book grid uses CSS Grid, which is conceptually similar to `LazyVGrid` with
an adaptive column:

```css
.book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 24px;
}
```

This means: "fill the available width with as many columns as possible, where
each column is at least 220px wide." The browser handles the math automatically.

**SwiftUI equivalent:**

```swift
LazyVGrid(columns: [GridItem(.adaptive(minimum: 220))], spacing: 24) { ... }
```

---

## 11. Step 7: How Rendering Works

### The DOM = the view hierarchy

In visionOS/SwiftUI, you have a **view tree** managed by the framework. In web
development, the browser maintains a **DOM** (Document Object Model) -- a tree
of HTML elements. React sits between your code and the DOM.

```
Your JSX code
    |
    v
React (virtual DOM)  ← compares old vs new
    |
    v
Browser DOM          ← only changed nodes are updated
    |
    v
Pixels on screen
```

This is similar to how SwiftUI maintains a "view graph" and only updates the
parts of the render tree that changed. You never directly manipulate the DOM,
just like you never directly manipulate `UIView` instances in SwiftUI.

### Re-render cycle

1. State changes (e.g., `setFilteredBooks(results)`)
2. React re-calls the component function (`App()`)
3. React compares the new JSX output to the previous output
4. React updates only the DOM nodes that changed

This is the same as SwiftUI re-evaluating `body` when `@State` changes and
diffing the view tree.

---

## 12. Step 8: Building for Production

### Development mode

```bash
cd web-app
npm install       # Download dependencies (like "Resolve Package Versions")
npm run dev       # Start dev server at http://localhost:5173
```

Vite serves your source files directly to the browser with hot module
replacement (HMR). When you edit a file, the browser updates in < 100ms
without a full page reload.

### Production build

```bash
npm run build     # Outputs to dist/
```

This:
1. Transpiles JSX into plain JavaScript
2. Bundles all modules into a few optimized files
3. Minifies the code (removes whitespace, shortens variable names)
4. Generates hashed filenames for cache busting (e.g., `App-a1b2c3.js`)

The `dist/` folder is the equivalent of your `.app` bundle -- it contains
everything needed to run the application:

```
dist/
├── index.html
├── assets/
│   ├── index-a1b2c3.js      # All JavaScript, bundled and minified
│   └── index-d4e5f6.css     # All CSS, bundled and minified
└── cleaned_output.csv        # Book data (copied from public/)
```

---

## 13. Step 9: Deployment with Docker

### What is Docker? (for Apple developers)

Docker is a way to package an application with its entire runtime environment.
If a `.app` bundle contains your code + frameworks, a Docker **image** contains
your code + the operating system + the web server + all configuration.

Think of it as creating a self-contained Linux VM (but much lighter) that
anyone can run with a single command.

### The Dockerfile (multi-stage build)

This project uses a two-stage build, which is analogous to how Xcode archives
work: first you build, then you package for distribution.

```dockerfile
# STAGE 1: Build (like Xcode's "Archive" step)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # Install dependencies
COPY . .
RUN npm run build             # Build the dist/ folder

# STAGE 2: Serve (like distributing via TestFlight)
FROM nginx:alpine             # Nginx = lightweight web server
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Stage 1** uses a Node.js image to install dependencies and build the
project. This image is large (~180 MB) but is discarded after building.

**Stage 2** uses a tiny Nginx image (~25 MB) and copies only the built output
(`dist/`) from Stage 1. The final image contains no Node.js, no source code,
no `node_modules` -- just static files and a web server.

### Nginx -- the web server

Nginx (pronounced "engine-x") serves the static files to browsers. It is the
equivalent of the HTTP server built into Apple's frameworks, but purpose-built
for production. It handles:

- Serving `index.html`, JS, CSS, and the CSV file
- Gzip compression (smaller downloads)
- Cache headers (browsers cache assets for 1 year)
- Security headers
- SPA routing fallback (all URLs serve `index.html`, React handles routing)

### Running the app

```bash
# Build the Docker image and start the container
docker-compose up

# The app is now running at http://localhost:8080
```

This is the equivalent of `xcodebuild archive && xcodebuild -exportArchive` --
except the output runs on any machine with Docker, not just Apple hardware.

---

## 14. Full Data Flow Diagram

```
                    BUILD TIME
                    ==========

  data.csv (1,100 books, 79 columns)
      |
      | Python script (csv-cleanup/)
      v
  cleaned_output.csv (1,100 books, 13 columns)
      |
      | Copied into web-app/public/
      v
  npm run build (Vite)
      |
      | Bundles into dist/
      v
  Docker image (Nginx + static files)


                    RUNTIME (in the browser)
                    ========================

  Browser loads index.html
      |
      v
  main.jsx runs, mounts <App /> into the DOM
      |
      v
  App component initializes state:
    allBooks = []
    filteredBooks = []
    isLoading = true
      |
      v
  useEffect fires (like .onAppear):
    fetch('/cleaned_output.csv')
      |
      v
  PapaParse converts CSV text -> Array of Objects
    [{ Title: "...", Author: "...", ... }, ...]
      |
      v
  State updates:
    allBooks = [1,100 books]
    filteredBooks = [1,100 books]
    isLoading = false
      |
      v
  BookGrid renders 1,100 BookCards in a CSS grid
      |
      v
  User types in SearchBar
      |
      | 300ms debounce
      v
  searchBooks() filters allBooks by query
      |
      v
  filteredBooks state updates
      |
      v
  React re-renders BookGrid with filtered results
```

---

## 15. Glossary

| Term | Definition |
|---|---|
| **Component** | A reusable UI building block (like a SwiftUI `View` struct) |
| **Props** | Input parameters passed from parent to child component (like init params) |
| **State** | Mutable data owned by a component that triggers re-renders when changed |
| **Hook** | A function like `useState` or `useEffect` that lets components use React features. Named because they "hook into" the React lifecycle |
| **JSX** | Syntax extension that lets you write HTML-like markup in JavaScript |
| **DOM** | Document Object Model -- the browser's tree of HTML elements (like the view hierarchy) |
| **Virtual DOM** | React's internal copy of the DOM used for efficient diffing (like SwiftUI's view graph) |
| **CSS** | Cascading Style Sheets -- the language for visual styling on the web |
| **npm** | Node Package Manager -- downloads and manages third-party libraries |
| **Vite** | The build tool and dev server (replaces older tools like Webpack) |
| **Nginx** | A production web server that serves static files to browsers |
| **Docker** | A containerization tool that packages an app with its full runtime environment |
| **Bundle** | The optimized output of a production build (the `dist/` folder) |
| **Debounce** | A technique to delay execution until input stops changing for a set duration |
| **Hot Module Replacement (HMR)** | Dev feature that updates the browser instantly when you save a file |
