import { render, screen } from '@testing-library/react';
import AttendancePage from '@/app/(dashboard)/attendance/page';

jest.mock('next/navigation', () => ({
  usePathname: () => '/attendance',
}));

jest.mock('next/link', () => {
  const Link = ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  );
  Link.displayName = 'Link';
  return Link;
});

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const classesData = [
  { id: 'c1', name: 'Class 5-A' },
  { id: 'c2', name: 'Class 6-A' },
];

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'classes') {
        return {
          select: () => ({
            order: () => Promise.resolve({ data: classesData }),
          }),
        };
      }
      if (table === 'students') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => Promise.resolve({ data: [] }),
              }),
            }),
          }),
        };
      }
      if (table === 'attendance') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: [] }),
            }),
          }),
          delete: () => ({
            eq: () => ({
              eq: () => Promise.resolve({}),
            }),
          }),
          insert: () => Promise.resolve({ error: null }),
        };
      }
      return { select: jest.fn() };
    },
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }),
    },
  }),
}));

describe('AttendancePage', () => {
  it('renders page title', () => {
    render(<AttendancePage />);
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Mark and manage daily attendance')).toBeInTheDocument();
  });

  it('renders class selector', () => {
    render(<AttendancePage />);
    expect(screen.getByText('Select class')).toBeInTheDocument();
  });

  it('renders view reports link', () => {
    render(<AttendancePage />);
    expect(screen.getByText('View Reports')).toBeInTheDocument();
  });
});
