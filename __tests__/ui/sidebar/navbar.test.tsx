import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Navbar from './navbar';

const hoverSpy = vi.hoisted(() => vi.fn());
const logoSpy = vi.hoisted(() => vi.fn());

vi.mock('react-icons/pi', () => {
  const React = require('react');
  const Stub = () => React.createElement('span', null);
  return {
    PiBugBeetle: Stub,
    PiBugBeetleFill: Stub,
    PiChatText: Stub,
    PiChatTextFill: Stub,
    PiDownloadSimple: Stub,
    PiDownloadSimpleFill: Stub,
    PiEscalatorUp: Stub,
    PiEscalatorUpFill: Stub,
    PiGearSix: Stub,
    PiGearSixFill: Stub,
    PiHouse: Stub,
    PiHouseFill: Stub,
    PiPolygon: Stub,
    PiPolygonFill: Stub,
    PiPresentationChart: Stub,
    PiPresentationChartFill: Stub,
    PiRepeat: Stub,
    PiRepeatFill: Stub,
    PiStack: Stub,
    PiStackFill: Stub,
  };

vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(),
  };

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(),
  };

vi.mock('@/config/constants/navigation', () => {
  return {
    NAV_ICON_SIZE: 16,
    NAV_TITLE: {
      HOME: 'Home',
      MONTHLY_REPORT: 'Monthly report',
      CHART: 'Chart',
      LIMITS: 'Limits',
      SUBSCRIPTIONS: 'Subscriptions',
      CATEGORIES: 'Categories',
      EXPORT: 'Export',
      SETTINGS: 'Settings',
      FEEDBACK: 'Feedback',
      ISSUE: 'Issue',
    },
  };

vi.mock('@/config/constants/routes', () => {
  const ROUTE = {
    HOME: '/',
    MONTHLY_REPORT: '/monthly',
    CHART: '/chart',
    LIMITS: '/limits',
    SUBSCRIPTIONS: '/subscriptions',
    CATEGORIES: '/categories',
    EXPORT: '/export',
    SETTINGS: '/settings',
    FEEDBACK: '/feedback',
    ISSUE: '/issue',
  };
  const state = { disabled: [] as string[] };
  return {
    ROUTE,
    get DISABLED_ROUTES() {
      return state.disabled;
    },
    __setDisabledRoutes: (arr: string[]) => {
      state.disabled = arr;
    },
  };

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn().mockReturnValue('(min-width: 768px)'),
  };

vi.mock('../hoverables', () => {
  const React = require('react');
  return {
    HoverableNavLink: (props: any) => {
      hoverSpy(props);
      const { link, idx, isActiveLink } = props;
      return React.createElement(
        'li',
        {
          'data-testid': `nav-item-${idx}`,
          'data-active': isActiveLink,
          'data-title': link?.title,
        },
        link?.title ?? ''
      );
    },
  };

vi.mock('../logo', () => {
  const React = require('react');
  return {
    default: (props: any) => {
      logoSpy(props);
      return React.createElement('div', { 'data-testid': 'logo', 'data-size': props.size }, null);
    },
  };

const { useMedia } = await vi.importMock<any>('react-use');
const { usePathname } = await vi.importMock<any>('next/navigation');
const { __setDisabledRoutes, ROUTE } = await vi.importMock<any>('@/config/constants/routes');


  afterEach(() => {
    cleanup();
  });

  test(async () => {
    __setDisabledRoutes([ROUTE.EXPORT]);
    useMedia.mockReturnValue(true);
    usePathname.mockReturnValue(ROUTE.SETTINGS);

    render(<Navbar linksGroup="top" />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    // There are 8 top links; one disabled => 7 calls
    expect(hoverSpy).toHaveBeenCalledTimes(7);

    const calls = hoverSpy.mock.calls.map((c: any[]) => c[0]);
    const titles = calls.map((p: any) => p.link.title);
    expect(titles).toContain('Home');
    expect(titles).toContain('Settings');
    expect(titles).not.toContain('Export');

    const activeCalls = calls.filter((p: any) => p.isActiveLink === true);
    expect(activeCalls).toHaveLength(1);
    expect(activeCalls[0].link.url).toBe(ROUTE.SETTINGS);

    const last = calls[calls.length - 1];
    expect(last.idx).toBe(6);
    expect(last.link.title).toBe('Settings');

    expect(calls.every((p: any) => p.withScale === true)).toBe(true);

    expect(screen.queryByTestId('logo')).toBeNull();
  });

  test(async () => {
    __setDisabledRoutes([ROUTE.ISSUE]);
    useMedia.mockReturnValue(false);
    usePathname.mockReturnValue(ROUTE.ISSUE);

    render(<Navbar linksGroup="bottom" />);

    // 2 bottom links, 1 disabled => 1 item rendered
    expect(hoverSpy).toHaveBeenCalledTimes(1);

    const call = hoverSpy.mock.calls[0][0];
    expect(call.link.title).toBe('Feedback');
    expect(call.isActiveLink).toBe(false); // active was disabled
  });

  test(async () => {
    useMedia.mockReturnValue(true);
    usePathname.mockReturnValue(ROUTE.HOME);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('data-size')).toBe('sm');

    // ensure call captured
    expect(logoSpy).toHaveBeenCalledTimes(1);
    expect(logoSpy.mock.calls[0][0].size).toBe('sm');
  });

  test(async () => {
    useMedia.mockReturnValue(false);
    usePathname.mockReturnValue(ROUTE.HOME);

    render(<Navbar linksGroup="top" withLogo />);

    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('data-size')).toBe('xxs');

    expect(logoSpy).toHaveBeenCalledTimes(1);
    expect(logoSpy.mock.calls[0][0].size).toBe('xxs');
  });

  test(async () => {
    useMedia.mockReturnValue(true);
    usePathname.mockReturnValue(ROUTE.FEEDBACK);

    // @ts-expect-error intentional invalid prop to test runtime fallback
    render(<Navbar linksGroup={'invalid'} />);

    // bottom links are 2, none disabled
    expect(hoverSpy).toHaveBeenCalledTimes(2);

    const calls = hoverSpy.mock.calls.map((c: any[]) => c[0]);
    const titles = calls.map((p: any) => p.link.title);
    expect(titles).toEqual(['Feedback', 'Issue']);
  });

  test(async () => {
    __setDisabledRoutes([
      ROUTE.HOME,
      ROUTE.MONTHLY_REPORT,
      ROUTE.CHART,
      ROUTE.LIMITS,
      ROUTE.SUBSCRIPTIONS,
      ROUTE.CATEGORIES,
      ROUTE.EXPORT,
      ROUTE.SETTINGS,
    ]);
    useMedia.mockReturnValue(true);
    usePathname.mockReturnValue(ROUTE.HOME);

    render(<Navbar linksGroup="top" />);

    expect(hoverSpy).toHaveBeenCalledTimes(0);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });
