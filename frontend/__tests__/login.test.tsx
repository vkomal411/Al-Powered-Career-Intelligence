import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../pages/login';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
      query: {},
    };
  },
}));

describe('Login Page Component Tests', () => {
  test('renders email and password inputs and sign-in button', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log in/i })).toBeInTheDocument();
  });

  test('allows typing in email and password fields', () => {
    render(<LoginPage />);
    const emailInput = screen.getByPlaceholderText(/Email address/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/Password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Secret123!' } });

    expect(emailInput.value).toBe('user@example.com');
    expect(passwordInput.value).toBe('Secret123!');
  });
});
