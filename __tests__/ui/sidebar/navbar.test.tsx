import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from './navbar';
import * as reactUse from 'react-use';
import * as nextNavigation from 'next/navigation';
import * as helpers from '@/app/lib/helpers';
import * as hoverables from '../hoverables';
import * as logoModule from '../logo';
import { NAV_TITLE } from '@/config/constants/navigation';
import { ROUTE } from '@/config/constants/routes';
import '@testing-library/jest-dom';

vi.mock('react-use');
vi.mock('next/navigation');
vi.mock('@/app/lib/helpers');
vi.mock('../hoverables');
vi.mock('../logo');
vi.mock('@/config/constants/navigation', () => ({
  NAV_TITLE: {
    HOME: 'Home',
    MONTHLY_REPORT: 'Monthly Report',
    CHART: 'Chart',
    LIMITS: 'Limits',
    SUBSCRIPTIONS: 'Subscriptions',
    CATEGORIES: 'Categories',
    EXPORT: 'Export',
    SETTINGS: 'Settings',
    FEEDBACK: 'Feedback',
    ISSUE: 'Issue',
  },
  NAV_ICON_SIZE: 20,
  NAV_TITLE: {
    HOME: 'Home',
    MONTHLY_REPORT: 'Monthly Report',
    CHART: 'Chart',
    LIMITS: 'Limits',
    SUBSCRIPTIONS: 'Subscriptions',
    CATEGORIES: 'Categories',
    EXPORT: 'Export',
    SETTINGS: 'Settings',
    FEEDBACK: 'Feedback',
    ISSUE: 'Issue',
  }
}));
vi.mock('@/config/constants/routes', () => ({
  ROUTE: {
    HOME: '/home',
    MONTHLY_REPORT: '/monthly-report',
    CHART: '/chart',
    LIMITS: '/limits',
    SUBSCRIPTIONS: '/subscriptions',
    CATEGORIES: '/categories',
    EXPORT: '/export',
    SETTINGS: '/settings',
    FEEDBACK: '/feedback',
    ISSUE: '/issue',
  },
  DISABLED_ROUTES: [],
}));


  afterEach((): void => {
    vi.clearAllMocks();
  });

  test('renders top nav links with logo when withLogo is true', (): void => {
    render(<Navbar linksGroup="top" withLogo />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByTestId('logo').textContent).toBe('sm');
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Home')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Monthly Report')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Chart')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Limits')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Subscriptions')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Categories')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Export')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Settings')).toBeInTheDocument();
  });

  test('renders bottom nav links without logo when withLogo is false', (): void => {
    render(<Navbar linksGroup="bottom" />);
    expect(screen.queryByTestId('logo')).toBeNull();
    expect(screen.getByTestId('navlink-Feedback')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Issue')).toBeInTheDocument();
  });

    // Re-import Navbar to get updated mock
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NavbarWithDisabled = require('./navbar').default;
    render(<NavbarWithDisabled linksGroup="top" />);
    expect(screen.queryByTestId('navlink-Chart')).toBeNull();
    expect(screen.getByTestId('navlink-Home')).toBeInTheDocument();
    render(<NavbarWithDisabled linksGroup="bottom" />);
    expect(screen.queryByTestId('navlink-Feedback')).toBeNull();
    expect(screen.getByTestId('navlink-Issue')).toBeInTheDocument();
  });

  test('uses correct logo size for isMd false', (): void => {
    useMediaMock.mockReturnValue(false);
    render(<Navbar linksGroup="top" withLogo />);
    expect(screen.getByTestId('logo').textContent).toBe('xxs');
  });

  test('sets isActiveLink true for current pathname', (): void => {
    usePathnameMock.mockReturnValue('/settings');
    render(<Navbar linksGroup="top" />);
    expect(screen.getByTestId('navlink-Settings').textContent).toContain('-active');
    expect(screen.getByTestId('navlink-Home').textContent).not.toContain('-active');
  });

    vi.doMock('@/config/constants/routes', () => ({
      ROUTE: {},
      DISABLED_ROUTES: [],
    }));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const NavbarEmpty = require('./navbar').default;
    render(<NavbarEmpty linksGroup="top" />);
    expect(screen.getByRole('list').children.length).toBe(0);
  });

  test('handles edge case: linksGroup is invalid', (): void => {
    // @ts-expect-error
    render(<Navbar linksGroup="invalid" />);
    // Should fallback to bottomNavLinks (since condition is false)
    expect(screen.getByTestId('navlink-Feedback')).toBeInTheDocument();
    expect(screen.getByTestId('navlink-Issue')).toBeInTheDocument();
  });

  test('HoverableNavLink receives correct props', (): void => {
    render(<Navbar linksGroup="top" />);
    expect(HoverableNavLinkMock).toHaveBeenCalled();
    const calls = HoverableNavLinkMock.mock.calls;
    expect(calls[0][0].link.title).toBe('Home');
    expect(typeof calls[0][0].idx).toBe('number');
    expect(typeof calls[0][0].withScale).toBe('boolean');
    expect(typeof calls[0][0].isActiveLink).toBe('boolean');
  });

  test('Logo is not rendered if withLogo is not passed', (): void => {
    render(<Navbar linksGroup="top" />);
    expect(screen.queryByTestId('logo')).toBeNull();
  });

  test('getBreakpointWidth is called with "md"', (): void => {
    render(<Navbar linksGroup="top" withLogo />);
    expect(getBreakpointWidthMock).toHaveBeenCalledWith('md');
  });
