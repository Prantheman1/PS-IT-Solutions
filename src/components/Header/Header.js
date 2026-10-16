import React, { useEffect, useRef, useState } from 'react';
import { Link } from '../../router';
import { useAuth } from '../../auth/AuthContext';
import './Header.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/location', label: 'Location' },
  { to: '/contact', label: 'Contact' },
];

const Header = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const initial = (user?.name || user?.email || 'P').trim().charAt(0).toUpperCase();

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  async function signOut() {
    setOpen(false);
    await logout();
  }

  return (
    <header className="header">
      <Link to="/" className="logo" end>PS IT Solutions</Link>
      <nav aria-label="Site">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <Link to={link.to} end={link.to === '/'}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="profile" ref={menuRef}>
        <button
          type="button"
          className="profile__button"
          aria-label="Account"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {initial}
        </button>
        {open && (
          <div className="profile__menu" role="dialog" aria-label="Account details">
            <p className="profile__name">{user.name}</p>
            <p className="profile__email">{user.email}</p>
            <button type="button" className="profile__signout" onClick={signOut}>Sign out</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
