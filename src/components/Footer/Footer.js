import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="social-media">
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">LinkedIn</a>
        </div>
        <p>&copy; {new Date().getFullYear()} PS IT Solutions. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 