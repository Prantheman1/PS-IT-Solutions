import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the company name', () => {
  render(<App />);
  const brand = screen.getByText(/PS IT Solutions/i);
  expect(brand).toBeInTheDocument();
});
