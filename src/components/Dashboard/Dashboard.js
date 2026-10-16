import React from 'react';
import './Dashboard.css';

const stats = [
  { value: '150+', label: 'Projects Completed' },
  { value: '100+', label: 'Happy Clients' },
  { value: '10+', label: 'Years of Experience' },
  { value: '24/7', label: 'Support' }
];

const Dashboard = () => {
  return (
    <section id="dashboard" className="dashboard">
      <div className="container">
        <h2>Why Choose Us?</h2>
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Dashboard; 