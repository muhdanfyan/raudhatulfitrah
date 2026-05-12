import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider } from '../src/contexts/AuthContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import LoginPage from '../src/components/LoginPage';
import { MemoryRouter } from 'react-router-dom';

// Mock navigate
const mockNavigate = vi.fn();

// Mock the auth context
const mockLogin = vi.fn();
vi.mock('../src/contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
      isLoading: false,
      user: null
    })
  };
});

// Mock the settings context
vi.mock('../src/contexts/SettingsContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useSettings: () => ({
      settings: {
        logo: '/logo.png',
        namaSingkat: 'PISANTRI',
        tagline: 'Sistem Informasi Pondok Pesantren'
      }
    })
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('LoginPage Component', () => {
  const renderWithProviders = () => {
    return render(
      <MemoryRouter>
        <SettingsProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderWithProviders();

    expect(screen.getByText('PISANTRI')).toBeInTheDocument();
    expect(screen.getByText('Sistem Informasi Pondok Pesantren')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Login dengan QR Code/i })).toBeInTheDocument();
  });

  it('allows user to input email and password', () => {
    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with valid credentials', async () => {
    mockLogin.mockResolvedValueOnce({});

    renderWithProviders();

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /Masuk/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});