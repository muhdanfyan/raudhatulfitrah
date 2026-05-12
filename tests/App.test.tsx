import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App Component', () => {
  it('renders without crashing', () => {
    // Render the App component
    const { container } = render(<App />);

    // Since our App component renders different content based on auth status,
    // we can check if the Router is present in the DOM
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});