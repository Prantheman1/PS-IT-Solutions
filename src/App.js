import React from 'react';
import './App.css';
import Header from './components/Header/Header';
import Slideshow from './components/Slideshow/Slideshow';
import About from './components/About/About';
import Services from './components/Services/Services';
import Dashboard from './components/Dashboard/Dashboard';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <Slideshow />
      <About />
      <Services />
      <Dashboard />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
