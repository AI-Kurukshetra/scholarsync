import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('primary');
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Paid</Badge>);
    const badge = screen.getByText('Paid');
    expect(badge.className).toContain('emerald');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Overdue</Badge>);
    const badge = screen.getByText('Overdue');
    expect(badge.className).toContain('destructive');
  });

  it('renders with warning variant', () => {
    render(<Badge variant="warning">Pending</Badge>);
    const badge = screen.getByText('Pending');
    expect(badge.className).toContain('amber');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Draft</Badge>);
    const badge = screen.getByText('Draft');
    expect(badge.className).toContain('secondary');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge.className).toContain('text-foreground');
  });

  it('accepts custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    expect(screen.getByText('Test').className).toContain('custom-class');
  });
});
