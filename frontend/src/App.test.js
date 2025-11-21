import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

// Simple smoke test to verify React is working
test('renders without crashing', () => {
  const TestComponent = () => <div>Test</div>;
  const { container } = render(<TestComponent />);
  expect(container).toBeInTheDocument();
});

test('can render text content', () => {
  const TestComponent = () => <h1>Welcome to Secure Pet Store</h1>;
  const { getByText } = render(<TestComponent />);
  expect(getByText('Welcome to Secure Pet Store')).toBeInTheDocument();
});
