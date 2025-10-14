/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Basic Test Suite', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true);
  });

  it('should render without crashing', () => {
    render(<div data-testid="test-element">Test</div>);
    expect(screen.getByTestId('test-element')).toBeInTheDocument();
  });
});
