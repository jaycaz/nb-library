import { useState } from 'react'
import curatedData from '../data/curated.json'
import './StyleSample.css'

const colors = [
  { name: 'Background Cream', hex: '#f5f0e8' },
  { name: 'Card Surface', hex: '#faf8f3' },
  { name: 'Primary Text', hex: '#2c2416' },
  { name: 'Secondary Text', hex: '#6b5e4f' },
  { name: 'Accent Teal', hex: '#2a6e6e' },
  { name: 'Aged Gold', hex: '#b8860b' },
  { name: 'Copper Hover', hex: '#b87333' },
]

const collagePositions = [
  { top: '0%', left: '5%', width: '140px', height: '190px', rotate: '-4deg', z: 2 },
  { top: '10%', left: '30%', width: '130px', height: '180px', rotate: '3deg', z: 3 },
  { top: '5%', left: '55%', width: '145px', height: '195px', rotate: '-2deg', z: 1 },
  { top: '15%', left: '75%', width: '125px', height: '175px', rotate: '5deg', z: 4 },
  { top: '45%', left: '10%', width: '135px', height: '185px', rotate: '2deg', z: 3 },
  { top: '40%', left: '50%', width: '140px', height: '190px', rotate: '-3deg', z: 2 },
]

export default function StyleSample() {
  const [searchValue, setSearchValue] = useState('')
  const { quotes, featuredBooks } = curatedData

  return (
    <div className="style-sample">
      {/* Header */}
      <header className="ss-header">
        <h1>Noisebridge Library</h1>
        <p className="subtitle">Card Catalog Design System &mdash; Style Sample</p>
      </header>

      {/* 1. Typography Specimen */}
      <section className="ss-section">
        <p className="ss-section-label">Section 01</p>
        <h2 className="ss-section-title">Typography Specimen</h2>
        <div className="type-specimen">
          <div className="type-family">
            <p className="type-family-name">Archivo Black &mdash; Headings &amp; Hero Text</p>
            <div className="type-sizes type-sample-archivo">
              <p><span className="size-label">32px</span> <span style={{ fontSize: '2rem' }}>The stacks are open</span></p>
              <p><span className="size-label">24px</span> <span style={{ fontSize: '1.5rem' }}>Browse the collection at Noisebridge</span></p>
              <p><span className="size-label">18px</span> <span style={{ fontSize: '1.125rem' }}>Every book tells a story about who we are</span></p>
              <p><span className="size-label">14px</span> <span style={{ fontSize: '0.875rem' }}>Catalog entry no. 1138 — checked out — due back Tuesday</span></p>
            </div>
          </div>

          <div className="type-family">
            <p className="type-family-name">IBM Plex Mono &mdash; Body Text, UI &amp; Metadata</p>
            <div className="type-sizes type-sample-ibm-plex">
              <p><span className="size-label">16px</span> <span style={{ fontSize: '1rem', fontWeight: 400 }}>A shared library for the curious and the bold. Noisebridge maintains a collection of over 1,100 books spanning electronics, programming, mathematics, science fiction, and the liberal arts.</span></p>
              <p><span className="size-label">14px</span> <span style={{ fontSize: '0.875rem', fontWeight: 400 }}>Books may be borrowed by any member. Please return them to the shelf when finished. If a book changes your life, leave a note in the margin.</span></p>
              <p style={{ marginTop: '0.5rem' }}><span className="size-label">14px</span> <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>STATUS: AVAILABLE &bull; SHELF A-3 &bull; ISBN 978-0-393-31604-9</span></p>
              <p><span className="size-label">12px</span> <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Last checked out: 2024-11-03 &bull; Condition: Good &bull; Edition: 2nd</span></p>
              <p><span className="size-label">11px</span> <span style={{ fontSize: '0.6875rem', fontWeight: 600 }}>SCIENCE / MEMOIR &bull; 391 PAGES &bull; W. W. NORTON &amp; COMPANY</span></p>
              <p><span className="size-label">italic</span> <span style={{ fontSize: '0.875rem', fontWeight: 400, fontStyle: 'italic' }}>Richard P. Feynman &bull; Douglas R. Hofstadter &bull; Harold Abelson</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Color Palette */}
      <section className="ss-section">
        <p className="ss-section-label">Section 02</p>
        <h2 className="ss-section-title">Color Palette</h2>
        <div className="color-grid">
          {colors.map((c) => (
            <div key={c.hex} className="color-chip">
              <div
                className="color-chip-swatch"
                style={{ backgroundColor: c.hex }}
              />
              <div className="color-chip-info">
                <span className="color-chip-name">{c.name}</span>
                <span className="color-chip-hex">{c.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Texture Samples */}
      <section className="ss-section">
        <p className="ss-section-label">Section 03</p>
        <h2 className="ss-section-title">Texture Samples</h2>
        <div className="texture-grid">
          <div className="texture-sample texture-paper-grain">
            <span className="texture-sample-label">Paper Grain</span>
          </div>
          <div className="texture-sample texture-dot-grid">
            <span className="texture-sample-label">Dot Grid</span>
          </div>
          <div className="texture-sample texture-flat">
            <span className="texture-sample-label">Flat (No Texture)</span>
          </div>
          <div className="texture-sample texture-linen">
            <span className="texture-sample-label">Linen Weave</span>
          </div>
        </div>
      </section>

      {/* 4. Book Card Mockups */}
      <section className="ss-section">
        <p className="ss-section-label">Section 04</p>
        <h2 className="ss-section-title">Book Card Mockups</h2>
        <div className="book-cards">
          {featuredBooks.map((book) => (
            <div key={book.title} className="book-card">
              <img
                className="book-card-cover"
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                loading="lazy"
              />
              <div className="book-card-body">
                <p className="book-card-title">{book.title}</p>
                <p className="book-card-author">{book.author}</p>
                <div className="book-card-meta">
                  <span className="book-card-genre">{book.genre}</span>
                  <span className="book-card-location">{book.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Search Bar */}
      <section className="ss-section">
        <p className="ss-section-label">Section 05</p>
        <h2 className="ss-section-title">Search — "The Typewriter"</h2>
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Type to search the stacks..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <p className="search-hint">Monospace input &bull; paper-inset styling &bull; block cursor</p>
        </div>
      </section>

      {/* 6. Featured Quote Card */}
      <section className="ss-section">
        <p className="ss-section-label">Section 06</p>
        <h2 className="ss-section-title">Featured Quote</h2>
        <div className="quote-card">
          <p className="quote-text">{quotes[0].text}</p>
          <p className="quote-attribution">{quotes[0].attribution}</p>
        </div>
      </section>

      {/* 7. Collage Preview */}
      <section className="ss-section">
        <p className="ss-section-label">Section 07</p>
        <h2 className="ss-section-title">Collage Preview</h2>
        <div className="collage-container">
          <div className="collage-wrapper">
            {featuredBooks.slice(0, 6).map((book, i) => {
              const pos = collagePositions[i]
              return (
                <div
                  key={book.title}
                  className="collage-item"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    width: pos.width,
                    height: pos.height,
                    transform: `rotate(${pos.rotate})`,
                    zIndex: pos.z,
                  }}
                >
                  <img src={book.coverUrl} alt={book.title} loading="lazy" />
                </div>
              )
            })}
            <div
              className="collage-quote"
              style={{
                bottom: '5%',
                right: '5%',
                transform: 'rotate(2deg)',
                zIndex: 5,
              }}
            >
              {quotes[1].text}
              <span className="collage-quote-attr">&mdash; {quotes[1].attribution}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ss-footer">
        Noisebridge Library &bull; Card Catalog Design System &bull; Style Sample v0.1
      </footer>
    </div>
  )
}
