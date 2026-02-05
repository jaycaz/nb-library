# Noisebridge Library Search UI

A simple, responsive React web application for searching and browsing the Noisebridge library catalog.

## Features

- **Text Search**: Search across book titles, authors, genres, and ISBNs
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Filtering**: Debounced search with instant results
- **Book Cards**: Clean card layout showing cover images, metadata, and shelf locations
- **1,100+ Books**: Full catalog from the Noisebridge hackerspace library

## Tech Stack

- React 18 with hooks
- Vite for fast development and building
- PapaParse for CSV parsing
- Pure CSS (no frameworks) for styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Navigate to the web-app directory:
```bash
cd web-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service.

## Docker Deployment

### Quick Start with Docker Compose

The easiest way to run the app in production mode:

```bash
docker-compose up
```

Access the app at http://localhost:8080

To run in detached mode:
```bash
docker-compose up -d
```

To stop:
```bash
docker-compose down
```

### Manual Docker Build

Build the Docker image:
```bash
docker build -t noisebridge-library .
```

Run the container:
```bash
docker run -p 8080:80 noisebridge-library
```

Access the app at http://localhost:8080

### Docker Image Details

- **Multi-stage build**: Uses `node:18-alpine` for building and `nginx:alpine` for serving
- **CSV data bundled**: The cleaned library catalog is baked into the image
- **Size optimized**: Multi-stage build keeps the final image small
- **Health checks**: Includes a `/health` endpoint for monitoring
- **Production ready**: Gzip compression, security headers, and static asset caching

### Deploying to Noisebridge

1. Build the image on the target server
2. Run with docker-compose or as a standalone container
3. Configure reverse proxy (nginx, Caddy, etc.) if needed
4. Set up restart policies for automatic recovery

## Project Structure

```
web-app/
├── public/
│   └── cleaned_output.csv      # Library catalog data
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx       # Search input with debouncing
│   │   ├── SearchBar.css
│   │   ├── BookCard.jsx        # Individual book display
│   │   ├── BookCard.css
│   │   ├── BookGrid.jsx        # Grid layout for books
│   │   └── BookGrid.css
│   ├── utils/
│   │   └── csvLoader.js        # CSV loading and search logic
│   ├── App.jsx                 # Main application component
│   ├── App.css
│   ├── index.css               # Global styles
│   └── main.jsx                # Entry point
├── package.json
└── README.md
```

## Data Format

The app loads data from `/public/cleaned_output.csv` with the following fields:
- Title, Author, ISBN, Publisher, Year
- Genre, Pages, Shelf Location
- Cover URL, Summary, Google VolumeID
- Loaned To, Notes

## Features in Detail

### Search
- Searches across Title, Author, Genre, and ISBN fields
- 300ms debounce for performance
- Case-insensitive matching
- Shows result count

### Book Cards
- Cover image with fallback for missing images
- Title, author, and publication year
- Genre badge and shelf location
- ISBN display
- Hover effects for interactivity

### Responsive Layout
- Mobile: 2 columns (160px cards)
- Tablet: 3-4 columns (200px cards)
- Desktop: 4-6 columns (220px cards)
- Fluid grid with auto-fill

## Future Enhancements

Potential additions for future development:
- Advanced filtering (by genre, year, location)
- Sorting options (title, author, year)
- Book detail modal/page
- Lending status tracking
- Barcode/QR scanning for check-out
- Favorites and reading lists

## License

Built for the Noisebridge hackerspace community.
