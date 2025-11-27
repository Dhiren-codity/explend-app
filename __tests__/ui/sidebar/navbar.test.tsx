import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as nextNavigation from 'next/navigation';
import * as reactUse from 'react-use';
import * as helpers from '@/app/lib/helpers';
import Navbar from '@/app/ui/sidebar/navbar';
import { __setDisabledRoutes, ROUTE } from '@/config/constants/routes';

vi.mock('next/navigation', () => {
  return {
    usePathname: vi.fn(),
  };
});

vi.mock('react-use', () => {
  return {
    useMedia: vi.fn(),
  };
});

vi.mock('@/app/lib/helpers', () => {
  return {
    getBreakpointWidth: vi.fn(),
  };
});

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
});

vi.mock('@/config/constants/routes', () => {
  type RouteMap = {
    HOME: string;
    MONTHLY_REPORT: string;
    CHART: string;
    LIMITS: string;
    SUBSCRIPTIONS: string;
    CATEGORIES: string;
    EXPORT: string;
    SETTINGS: string;
    FEEDBACK: string;
    ISSUE: string;
  };

  const ROUTE: RouteMap = {
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

  let disabledRoutes: string[] = [ROUTE.EXPORT, ROUTE.SETTINGS];

  const __setDisabledRoutes = (routes: string[]): void => {
    disabledRoutes = routes;
  };

  return {
    ROUTE,
    get DISABLED_ROUTES() {
      return disabledRoutes;
    },
    __setDisabledRoutes,
  };
});

describe('Tests', (): void => {

  describe('Navbar', (): void => {
      // Reset mocked implementations before each test
      __setDisabledRoutes([ROUTE.EXPORT, ROUTE.SETTINGS]);
      (helpers.getBreakpointWidth as unknown as vi.Mock).mockReset();
      (reactUse.useMedia as unknown as vi.Mock).mockReset();
      (nextNavigation.usePathname as unknown as vi.Mock).mockReset();

      (helpers.getBreakpointWidth as unknown as vi.Mock).mockReturnValue('(min-width: 768px)');
      (reactUse.useMedia as unknown as vi.Mock).mockReturnValue(true);
      (nextNavigation.usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.HOME);
    });

      vi.clearAllMocks();
    });

    test('should render top nav links filtering disabled routes and call media hooks', (): void => {
      // topNavLinks defined in source has 8 entries; with 2 disabled expected 6
      const expectedTopLinksCount = 8 - 2;

      render(<Navbar linksGroup="top" withLogo />);

      expect(helpers.getBreakpointWidth).toHaveBeenCalledTimes(1);
      expect(helpers.getBreakpointWidth).toHaveBeenCalledWith('md');
      expect(reactUse.useMedia).toHaveBeenCalledTimes(1);
      expect(reactUse.useMedia).toHaveBeenCalledWith('(min-width: 768px)', true);
      expect(nextNavigation.usePathname).toHaveBeenCalledTimes(1);

      const list = screen.getByRole('list');
      const count = (list as HTMLElement).childElementCount;
      expect(count).toBe(expectedTopLinksCount);
    });
    test('should render bottom nav links and filter all when disabled', (): void => {
      // Disable both bottom routes
      __setDisabledRoutes([ROUTE.FEEDBACK, ROUTE.ISSUE]);

      render(<Navbar linksGroup="bottom" />);

      const list = screen.getByRole('list');
      const count = (list as HTMLElement).childElementCount;
      expect(count).toBe(0);
    });
    test('should render bottom nav links and filter one when disabled', (): void => {
      // Disable only ISSUE
      __setDisabledRoutes([ROUTE.ISSUE]);

      render(<Navbar linksGroup="bottom" />);

      const list = screen.getByRole('list');
      const count = (list as HTMLElement).childElementCount;
      expect(count).toBe(1);
    });
    test('should use pathname for active link evaluation (hook is called)', (): void => {
      (nextNavigation.usePathname as unknown as vi.Mock).mockReturnValue(ROUTE.CHART);

      render(<Navbar linksGroup="top" />);

      // We cannot assert internal active prop, but we ensure hook was used
      expect(nextNavigation.usePathname).toHaveBeenCalledTimes(1);
      const list = screen.getByRole('list');
      expect(list).toBeDefined();
    });
    test('should handle small screen media query value (useMedia returns false)', (): void => {
      (reactUse.useMedia as unknown as vi.Mock).mockReturnValueOnce(false);

      render(<Navbar linksGroup="top" withLogo />);

      expect(helpers.getBreakpointWidth).toHaveBeenCalledWith('md');
      expect(reactUse.useMedia).toHaveBeenCalledWith('(min-width: 768px)', true);
    });
    test('should throw error if useMedia hook throws', (): void => {
      (reactUse.useMedia as unknown as vi.Mock).mockImplementationOnce(() => {
        throw new Error('media-error');
      });

      expect((): void => {
        render(<Navbar linksGroup="top" />);
      }).toThrow('media-error');
    });
    test('should render list asynchronously', async (): Promise<void> => {
      render(<Navbar linksGroup="top" />);

      const list = await screen.findByRole('list');
      expect(list).toBeDefined();
    });