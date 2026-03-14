import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('applies primary styles for default variant', () => {
    render(<Button>Default</Button>);
    expect(screen.getByText('Default').className).toContain('bg-primary');
  });

  it('applies outline styles', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline').className).toContain('border');
  });

  it('applies ghost styles', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByText('Ghost');
    expect(btn.className).not.toContain('bg-primary');
    expect(btn.className).not.toContain('border');
  });

  it('applies size variants', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small').className).toContain('h-8');
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/test');
  });
});
