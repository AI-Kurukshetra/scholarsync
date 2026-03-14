import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/shared/empty-state';
import { Users } from 'lucide-react';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No students" description="Add your first student" icon={Users} />);
    expect(screen.getByText('No students')).toBeInTheDocument();
    expect(screen.getByText('Add your first student')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(
      <EmptyState title="No students" description="Get started" icon={Users}>
        <button>Add Student</button>
      </EmptyState>
    );
    expect(screen.getByText('Add Student')).toBeInTheDocument();
  });

  it('renders icon', () => {
    const { container } = render(
      <EmptyState title="Empty" description="Nothing here" icon={Users} />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
