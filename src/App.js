import React from 'react';
import './App.css';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { Router, usePath } from './router';
import Header from './components/Header/Header';
import Slideshow from './components/Slideshow/Slideshow';
import About from './components/About/About';
import Services from './components/Services/Services';
import Dashboard from './components/Dashboard/Dashboard';
import Location from './components/Location/Location';
import Contact from './components/Contact/Contact';
import Account from './components/Account/Account';
import Footer from './components/Footer/Footer';

function Page() {
  const path = usePath();

  if (path === '/about') return <About />;
  if (path === '/services') return <Services />;
  if (path === '/dashboard') return <Dashboard />;
  if (path === '/location') return <Location />;
  if (path === '/contact') return <Contact />;
  return <Slideshow />;
}

function AppContent() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="account">
        <p className="account__brand">PS IT Solutions</p>
      </div>
    );
  }

  if (!user) return <Account />;

  return (
    <div className="App">
      <Header />
      <main>
        <Page />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
