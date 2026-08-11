import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from '../pages/register';

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

describe('Register Page Component Tests', () => {
  test('renders full name, email, password inputs and register button', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/Full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('allows typing registration credentials', () => {
    render(<RegisterPage />);
    const nameInput = screen.getByPlaceholderText(/Full name/i) as HTMLInputElement;
    const emailInput = screen.getByPlaceholderText(/Email address/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: 'Rahul Sharma' } });
    fireEvent.change(emailInput, { target: { value: 'rahul@example.com' } });

    expect(nameInput.value).toBe('Rahul Sharma');
    expect(emailInput.value).toBe('rahul@example.com');
  });
});
