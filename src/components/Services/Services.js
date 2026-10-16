import React from 'react';
import './Services.css';

const services = [
  {
    icon: 'ICON', // Placeholder for an icon
    title: 'Custom Software Development',
    description: 'We build tailored software solutions to meet your specific business needs.'
  },
  {
    icon: 'ICON',
    title: 'IT Consulting',
    description: 'Our experts provide strategic guidance to optimize your IT infrastructure.'
  },
  {
    icon: 'ICON',
    title: 'Cloud Solutions',
    description: 'We help you migrate to and manage your cloud environments efficiently.'
  },
  {
    icon: 'ICON',
    title: 'Cybersecurity',
    description: 'Protect your digital assets with our comprehensive cybersecurity services.'
  }
];

const Services = () => {
  return (
    <section id="services" className="services">
      <div className="container">
        <h2>Our Services</h2>
        <div className="service-cards">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 