import { render } from '@testing-library/react';
import { TableSkeleton, CardSkeleton, DashboardSkeleton } from '@/components/shared/loading-skeleton';

describe('Loading Skeletons', () => {
  it('renders TableSkeleton with default rows', () => {
    const { container } = render(<TableSkeleton />);
    const rows = container.querySelectorAll('[class*="animate-pulse"]');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('renders CardSkeleton', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders DashboardSkeleton', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeTruthy();
  });
});
