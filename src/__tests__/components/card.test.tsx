import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Components', () => {
  it('renders Card with children', () => {
    render(<Card><div>Content</div></Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('Card has rounded styling', () => {
    const { container } = render(<Card>Test</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-2xl');
  });

  it('renders CardHeader', () => {
    render(<CardHeader><span>Header</span></CardHeader>);
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders CardTitle', () => {
    render(<CardTitle>My Title</CardTitle>);
    const title = screen.getByText('My Title');
    expect(title.className).toContain('font-semibold');
  });

  it('renders CardDescription', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text').className).toContain('text-muted-foreground');
  });

  it('renders CardContent', () => {
    render(<CardContent><p>Body</p></CardContent>);
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders CardFooter', () => {
    render(<CardFooter><button>Action</button></CardFooter>);
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-card">Test</Card>);
    expect((container.firstChild as HTMLElement).className).toContain('custom-card');
  });

  it('composes full card', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Desc</CardDescription>
        </CardHeader>
        <CardContent>Body</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});
