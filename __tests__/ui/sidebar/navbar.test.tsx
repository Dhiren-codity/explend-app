import React from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Shared mocks and state
const ROUTE = {
  HOME: "/",
  MONTHLY_REPORT: "/monthly",
  CHART: "/chart",
  LIMITS: "/limits",
  SUBSCRIPTIONS: "/subscriptions",
  CATEGORIES: "/categories",
  EXPORT: "/export",
  SETTINGS: "/settings",
  FEEDBACK: "/feedback",
  ISSUE: "/issue",
};
const disabledRoutesRef: string[] = [];

const NAV_TITLE = {
  HOME: "Home",
  MONTHLY_REPORT: "Monthly report",
  CHART: "Chart",
  LIMITS: "Limits",
  SUBSCRIPTIONS: "Subscriptions",
  CATEGORIES: "Categories",
  EXPORT: "Export",
  SETTINGS: "Settings",
  FEEDBACK: "Feedback",
  ISSUE: "Issue",
};
const NAV_ICON_SIZE = 20;

const useMediaMock = vi.fn((_: string, __?: boolean): boolean => true);
const usePathnameMock = vi.fn((): string | null => "/");
const getBreakpointWidthMock = vi.fn((bp: string): string => {
  return bp === "md" ? "(min-width: 768px)" : "";
});
const hoverableNavLinkMock = vi.fn(
  (props: {
    idx: number;
    link: { title: string; url: string } & Record<string, unknown>;
    isActiveLink: boolean;
    withScale?: boolean;
  }): JSX.Element => {
    return React.createElement(
      "li",
      {
        role: "listitem",
        "data-testid": `nav-${props.link.title}`,
        "data-idx": String(props.idx),
        "data-active": String(props.isActiveLink),
        "data-scale": String(Boolean(props.withScale)),
      },
      props.link.title,
    );
  },
);
const logoMock = vi.fn((props: { size: string }): JSX.Element => {
  return React.createElement("div", {
    "data-testid": "logo",
    "data-size": props.size,
  });
});

// Virtual module mocks
vi.mock(
  "react-use",
  () => {
    return {
      useMedia: (query: string, defaultState?: boolean): boolean =>
        useMediaMock(query, defaultState),
    };
  },
  { virtual: true },
);

vi.mock(
  "next/navigation",
  () => {
    return {
      usePathname: (): string | null => usePathnameMock(),
    };
  },
  { virtual: true },
);

vi.mock(
  "@/app/lib/helpers",
  () => {
    return {
      getBreakpointWidth: (bp: string): string => getBreakpointWidthMock(bp),
    };
  },
  { virtual: true },
);

vi.mock(
  "@/config/constants/navigation",
  () => {
    return {
      NAV_ICON_SIZE,
      NAV_TITLE,
    };
  },
  { virtual: true },
);

vi.mock(
  "@/config/constants/routes",
  () => {
    return {
      ROUTE,
      DISABLED_ROUTES: disabledRoutesRef,
    };
  },
  { virtual: true },
);

vi.mock(
  "react-icons/pi",
  () => {
    const ReactLib = require("react");
    const Stub = (_props: Record<string, unknown>): JSX.Element =>
      ReactLib.createElement("span", { "data-testid": "icon" });
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
  },
  { virtual: true },
);

// Relative local component mocks (match component's import specifiers)
vi.mock(
  "../hoverables",
  () => {
    return {
      HoverableNavLink: (props: {
        idx: number;
        link: { title: string; url: string } & Record<string, unknown>;
        isActiveLink: boolean;
        withScale?: boolean;
      }): JSX.Element => hoverableNavLinkMock(props),
    };
  },
  { virtual: true },
);

vi.mock(
  "../logo",
  () => {
    return {
      default: (props: { size: string }): JSX.Element => logoMock(props),
    };
  },
  { virtual: true },
);

describe("Navbar", (): void => {
  beforeEach((): void => {
    vi.clearAllMocks();
    vi.resetModules();
    disabledRoutesRef.length = 0;
    usePathnameMock.mockReturnValue("/");
    useMediaMock.mockImplementation(
      (_q: string, _d?: boolean): boolean => true,
    );
    getBreakpointWidthMock.mockImplementation((bp: string): string =>
      bp === "md" ? "md-query" : "",
    );
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test("renders top links and highlights active link", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    usePathnameMock.mockReturnValue(ROUTE.SETTINGS);

    render(React.createElement(Navbar, { linksGroup: "top", withLogo: false }));

    const list = screen.getByRole("list");
    expect(list).toBeDefined();

    const items = screen.getAllByRole("listitem");
    // 8 top links defined in source
    expect(items.length).toBe(8);
    expect(hoverableNavLinkMock).toHaveBeenCalledTimes(8);

    const activeItem = screen.getByTestId("nav-Settings");
    expect(activeItem.getAttribute("data-active")).toBe("true");
  });

  test("filters out disabled routes for top group", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    disabledRoutesRef.push(ROUTE.LIMITS, ROUTE.SUBSCRIPTIONS);

    render(React.createElement(Navbar, { linksGroup: "top" }));

    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(6);
    expect(screen.queryByText(NAV_TITLE.LIMITS)).toBeNull();
    expect(screen.queryByText(NAV_TITLE.SUBSCRIPTIONS)).toBeNull();
  });

  test("bottom group renders and respects disabled routes", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    usePathnameMock.mockReturnValue(ROUTE.ISSUE);
    disabledRoutesRef.push(ROUTE.FEEDBACK);

    render(React.createElement(Navbar, { linksGroup: "bottom" }));

    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(1);

    expect(screen.queryByText(NAV_TITLE.FEEDBACK)).toBeNull();
    const issueItem = screen.getByTestId("nav-Issue");
    expect(issueItem).toBeDefined();
    expect(issueItem.getAttribute("data-active")).toBe("true");
  });

  test("renders empty list when all routes disabled in bottom group", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    disabledRoutesRef.push(ROUTE.FEEDBACK, ROUTE.ISSUE);

    render(React.createElement(Navbar, { linksGroup: "bottom" }));

    const list = screen.getByRole("list");
    expect(list).toBeDefined();
    const items = screen.queryAllByRole("listitem");
    expect(items.length).toBe(0);
  });

  test("withLogo true renders Logo with size sm when useMedia is true and calls hooks with correct args", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    useMediaMock.mockImplementation(
      (_q: string, _d?: boolean): boolean => true,
    );

    render(React.createElement(Navbar, { linksGroup: "top", withLogo: true }));

    const logo = screen.getByTestId("logo");
    expect(logo).toBeDefined();
    expect(logo.getAttribute("data-size")).toBe("sm");

    expect(getBreakpointWidthMock).toHaveBeenCalledWith("md");
    expect(useMediaMock).toHaveBeenCalledWith("md-query", true);
  });

  test("withLogo true renders Logo with size xxs when useMedia is false", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    useMediaMock.mockImplementation(
      (_q: string, _d?: boolean): boolean => false,
    );

    render(React.createElement(Navbar, { linksGroup: "top", withLogo: true }));

    const logo = screen.getByTestId("logo");
    expect(logo).toBeDefined();
    expect(logo.getAttribute("data-size")).toBe("xxs");
  });

  test("no active link when usePathname returns null", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    usePathnameMock.mockReturnValue(null);

    render(React.createElement(Navbar, { linksGroup: "top" }));

    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(8);
    for (const item of items) {
      expect(item.getAttribute("data-active")).toBe("false");
    }
  });

  test("idx passed to HoverableNavLink is sequential after filtering", async (): Promise<void> => {
    const { default: Navbar } = await import("./navbar");
    disabledRoutesRef.push(ROUTE.HOME, ROUTE.CHART, ROUTE.EXPORT);

    render(React.createElement(Navbar, { linksGroup: "top" }));

    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(5);
    items.forEach((el, index): void => {
      expect(el.getAttribute("data-idx")).toBe(String(index));
    });
    // Ensure withScale prop is always true
    items.forEach((el): void => {
      expect(el.getAttribute("data-scale")).toBe("true");
    });
  });
});
