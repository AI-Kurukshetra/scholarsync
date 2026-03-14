import { render, screen } from '@testing-library/react';
import { RoleGate } from '@/components/shared/role-gate';

describe('RoleGate', () => {
  it('renders children when role is allowed', () => {
    render(
      <RoleGate role="admin" allowed={['admin', 'teacher']}>
        <p>Admin Content</p>
      </RoleGate>
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('does not render children when role is not allowed', () => {
    render(
      <RoleGate role="parent" allowed={['admin', 'teacher']}>
        <p>Admin Content</p>
      </RoleGate>
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders fallback when role is not allowed and fallback provided', () => {
    render(
      <RoleGate role="parent" allowed={['admin']} fallback={<p>Access denied</p>}>
        <p>Secret</p>
      </RoleGate>
    );
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });

  it('renders nothing when role is not allowed and no fallback', () => {
    const { container } = render(
      <RoleGate role="parent" allowed={['admin']}>
        <p>Secret</p>
      </RoleGate>
    );
    expect(container.textContent).toBe('');
  });
});
