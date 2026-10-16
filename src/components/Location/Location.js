import React from 'react';
import './Location.css';

const query = 'Melbourne, Victoria, Australia';
const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`;
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export default function Location() {
  return (
    <section id="location" className="location">
      <div className="container">
        <h2>Our office</h2>
        <p>PS IT Solutions is based in Melbourne, Australia.</p>
        <div className="location__frame">
          <iframe
            title="Google Map showing PS IT Solutions in Melbourne, Australia"
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a className="location__link" href={mapsHref} target="_blank" rel="noopener noreferrer">
          Open in Google Maps
        </a>
      </div>
    </section>
  );
}
