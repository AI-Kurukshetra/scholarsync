import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/shared/sidebar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
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
    expect(screen.getByText('Attendance')).toBeInTheDocument();
    expect(screen.getByText('Grades')).toBeInTheDocument();
    expect(screen.getByText('Fees')).toBeInTheDocument();
    expect(screen.getByText('Announcements')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('filters nav items by teacher role', () => {
    render(<Sidebar {...defaultProps} role="teacher" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.queryByText('Fees')).not.toBeInTheDocument();
  });

  it('filters nav items by parent role', () => {
    render(<Sidebar {...defaultProps} role="parent" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Fees')).toBeInTheDocument();
    expect(screen.queryByText('Reports')).not.toBeInTheDocument();
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
