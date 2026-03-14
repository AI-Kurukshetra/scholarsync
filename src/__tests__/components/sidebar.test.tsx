import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/shared/sidebar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

jest.mock('@/lib/i18n/language-context', () => ({
  useLanguage: () => ({
    locale: 'en',
    setLocale: jest.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers',
        attendance: 'Attendance', timetable: 'Timetable', grades: 'Grades',
        exams: 'Exams', fees: 'Fees', admissions: 'Admissions', library: 'Library',
        messages: 'Messages', announcements: 'Announcements', events: 'Events',
        transport: 'Transport', hostel: 'Hostel', inventory: 'Inventory',
        payroll: 'Payroll', analytics: 'AI Analytics', reports: 'Reports', settings: 'Settings',
      };
      return map[key] || key;
    },
  }),
}));

describe('Sidebar', () => {
  const defaultProps = {
    role: 'admin' as const,
    collapsed: false,
    onToggle: jest.fn(),
  };

  it('renders all admin nav items', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Timetable')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
    expect(screen.getByText('Exams')).toBeInTheDocument();
    expect(screen.getByText('Fees')).toBeInTheDocument();
    expect(screen.getByText('Admissions')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Announcements')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Hostel')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Payroll')).toBeInTheDocument();
    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('filters nav items by teacher role', () => {
    render(<Sidebar {...defaultProps} role="teacher" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Exams')).toBeInTheDocument();
    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
    expect(screen.queryByText('Fees')).not.toBeInTheDocument();
    expect(screen.queryByText('Admissions')).not.toBeInTheDocument();
    expect(screen.queryByText('Payroll')).not.toBeInTheDocument();
    expect(screen.queryByText('Hostel')).not.toBeInTheDocument();
  });

  it('filters nav items by parent role', () => {
    render(<Sidebar {...defaultProps} role="parent" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Fees')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
    expect(screen.queryByText('Teachers')).not.toBeInTheDocument();
    expect(screen.queryByText('Admissions')).not.toBeInTheDocument();
    expect(screen.queryByText('AI Analytics')).not.toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    render(<Sidebar {...defaultProps} collapsed={true} />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('ScholarSync')).not.toBeInTheDocument();
  });

  it('shows ScholarSync brand when expanded', () => {
    render(<Sidebar {...defaultProps} collapsed={false} />);
    expect(screen.getByText('ScholarSync')).toBeInTheDocument();
  });

  it('calls onToggle when collapse button is clicked', async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} onToggle={onToggle} />);
    const toggleButtons = screen.getAllByRole('button');
    await user.click(toggleButtons[0]);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('highlights active nav item with primary color', () => {
    render(<Sidebar {...defaultProps} />);
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink?.className).toContain('text-primary');
  });
});
