import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/shared/stat-card';
import { Users } from 'lucide-react';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Students" value={60} icon={Users} />);
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<StatCard title="Students" value={60} description="Active enrollments" icon={Users} />);
    expect(screen.getByText('Active enrollments')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<StatCard title="Students" value={60} icon={Users} />);
    expect(screen.queryByText('Active enrollments')).not.toBeInTheDocument();
  });

  it('renders string values', () => {
    render(<StatCard title="Rate" value="92%" icon={Users} />);
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('renders positive trend with plus sign', () => {
    render(
      <StatCard title="Students" value={60} icon={Users} trend={{ value: 5.2, label: 'from last month' }} />
    );
    expect(screen.getByText(/\+5.2%/)).toBeInTheDocument();
    expect(screen.getByText(/from last month/)).toBeInTheDocument();
  });

  it('renders negative trend without plus sign', () => {
    render(
      <StatCard title="Students" value={60} icon={Users} trend={{ value: -3, label: 'from last month' }} />
    );
    expect(screen.getByText(/-3%/)).toBeInTheDocument();
  });

  it('applies green color for positive trend', () => {
    const { container } = render(
      <StatCard title="Students" value={60} icon={Users} trend={{ value: 5, label: 'up' }} />
    );
    const trendEl = container.querySelector('[class*="emerald"]');
    expect(trendEl).toBeInTheDocument();
  });

  it('applies red color for negative trend', () => {
    const { container } = render(
      <StatCard title="Students" value={60} icon={Users} trend={{ value: -5, label: 'down' }} />
    );
    const trendEl = container.querySelector('[class*="red"]');
    expect(trendEl).toBeInTheDocument();
  });
});
