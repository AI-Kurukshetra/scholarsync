import { render, screen } from '@testing-library/react';
import SettingsPage from '@/app/(dashboard)/settings/page';

jest.mock('@/components/shared/theme-provider', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/settings',
}));

jest.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    locale: 'en',
    setLocale: jest.fn(),
    t: (key: string) => key,
  }),
}));

describe('SettingsPage', () => {
  it('renders settings page with title', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('renders appearance section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('renders theme options', () => {
    render(<SettingsPage />);
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders about section', () => {
    render(<SettingsPage />);
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('ScholarSync v1.0')).toBeInTheDocument();
  });
});
