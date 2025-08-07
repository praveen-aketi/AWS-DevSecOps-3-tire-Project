import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders welcome message', () => {
  render(<App />);
  const heading = screen.getByText((text) =>
    text.includes("Welcome to Secure Pet Store")
  );
  expect(heading).toBeInTheDocument();
});
