import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '@/app/ui/sidebar/navbar';

vi.mock('@/app/ui/sidebar/logo', () => {
  const Logo = (props: Record<string, unknown>): React.ReactElement => {
    const size = props.size as string | undefined;
    return <div data-testid="logo" data-size={size} />;
  };
  return { default: Logo };
});
}, { virtual: true });

describe('Navbar', (): void => {
  beforeEach((): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__pathname = '/';
    g.__useMedia = true;
    g.__disabledRoutes = [];
  });



  afterEach((): void => {
    vi.clearAllMocks();
    const g = globalThis as unknown as Record<string, unknown>;
    delete g.__pathname;
    delete g.__useMedia;
    delete g.__disabledRoutes;
  });

  test('renders logo when withLogo is true and isMd true (size sm)', (): void => {
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeDefined();
    expect(logo.getAttribute('data-size')).toBe('sm');
  });

  test('renders logo with size xxs when isMd false', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__useMedia = false;
    render(<Navbar linksGroup="top" withLogo />);
    const logo = screen.getByTestId('logo');
    expect(logo.getAttribute('data-size')).toBe('xxs');
  });

  test('renders top nav items excluding disabled ones', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__disabledRoutes = ['/limits', '/export'];
    render(<Navbar linksGroup="top" />);
    const items = screen.queryAllByTestId('nav-item');
    expect(items.length).toBe(6);
    expect(screen.queryByText('Limits')).toBeNull();
    expect(screen.queryByText('Export')).toBeNull();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Settings')).toBeDefined();
  });

  test('marks active link based on pathname for top group', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__pathname = '/settings';
    render(<Navbar linksGroup="top" />);
    const items = screen.getAllByTestId('nav-item');
    const activeItems = items.filter((el) => el.getAttribute('data-active') === '1');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].getAttribute('data-title')).toBe('Settings');
  });

  test('renders bottom nav links and sets active state correctly', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__pathname = '/issue';
    render(<Navbar linksGroup="bottom" />);
    const items = screen.getAllByTestId('nav-item');
    expect(items.length).toBe(2);
    const activeItems = items.filter((el) => el.getAttribute('data-active') === '1');
    expect(activeItems.length).toBe(1);
    expect(activeItems[0].getAttribute('data-title')).toBe('Issue');
  });

  test('filters bottom nav links by DISABLED_ROUTES', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__disabledRoutes = ['/issue'];
    render(<Navbar linksGroup="bottom" />);
    const items = screen.getAllByTestId('nav-item');
    expect(items.length).toBe(1);
    expect(items[0].getAttribute('data-title')).toBe('Feedback');
  });

  test('handles undefined pathname without crashing and no active links', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__pathname = undefined;
    render(<Navbar linksGroup="top" />);
    const items = screen.getAllByTestId('nav-item');
    const activeItems = items.filter((el) => el.getAttribute('data-active') === '1');
    expect(activeItems.length).toBe(0);
  });

  test('renders empty list when all top routes are disabled', (): void => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__disabledRoutes = [
      '/', '/monthly-report', '/chart', '/limits', '/subscriptions', '/categories', '/export', '/settings',
    ];
    render(<Navbar linksGroup="top" />);
    const list = screen.getByRole('list');
    expect(list).toBeDefined();
    const items = screen.queryAllByTestId('nav-item');
    expect(items.length).toBe(0);
  });
});