import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const heading = screen.getByText(/Welcome to Secure Pet Store/i); // Add spaces
  expect(heading).toBeInTheDocument();
});

