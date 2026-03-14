import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '@/app/(auth)/signup/page';

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockSignUp = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders signup form', () => {
    render(<SignupPage />);
    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders login link', () => {
    render(<SignupPage />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('submits signup form successfully', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByLabelText('Full Name'), 'Test User');
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');

    // Find the submit button
    const submitBtn = screen.getByRole('button', { name: 'Create account' });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User',
            role: 'parent',
          },
        },
      });
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on failed signup', async () => {
    mockSignUp.mockResolvedValueOnce({
      error: { message: 'Email already registered' },
    });
    const user = userEvent.setup();

    render(<SignupPage />);

    await user.type(screen.getByLabelText('Full Name'), 'Test');
    await user.type(screen.getByLabelText('Email'), 'existing@test.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});
