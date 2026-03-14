import { render, screen } from '@testing-library/react';
import { PageHeader } from '@/components/shared/page-header';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<PageHeader title="Dashboard" description="Overview of school data" />);
    expect(screen.getByText('Overview of school data')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<PageHeader title="Dashboard" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(0);
  });

  it('renders children (action buttons)', () => {
    render(
      <PageHeader title="Students">
        <button>Add Student</button>
      </PageHeader>
    );
    expect(screen.getByText('Add Student')).toBeInTheDocument();
  });

  it('title is an h1 element', () => {
    render(<PageHeader title="Dashboard" />);
    const heading = screen.getByText('Dashboard');
    expect(heading.tagName).toBe('H1');
  });
});
