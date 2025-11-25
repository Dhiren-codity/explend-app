import React, { type ReactElement } from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// Mock constants with virtual module to avoid path alias config
vi.mock(
  "@/config/constants/navigation",
  () => {
    return {
      NAV_TITLE: { EXPORT: "Export Transactions" },
    };
  },
  { virtual: true },
);

// Mock lib/types as a virtual module since it's type-only in source
vi.mock("app/lib/types", () => ({}), { virtual: true });

// Mock actions module
vi.mock("app/lib/actions", () => {
  return {
    getCachedAllTransactions: vi.fn(),
    getCachedAuthSession: vi.fn(),
    getTransactionsForExport: vi.fn(),
  };
});

// Mock UI components
vi.mock("app/ui/home/export-transactions", () => {
  // Component won't be executed during element creation; return value is irrelevant
  const ExportTransactions = (
    _props: Record<string, unknown>,
  ): ReactElement | null => null;
  return { default: ExportTransactions };
});
vi.mock("app/ui/no-transactions-plug", () => {
  const NoTransactionsPlug = (
    _props: Record<string, unknown>,
  ): ReactElement | null => null;
  return { default: NoTransactionsPlug };
});
vi.mock("app/ui/sidebar/with-sidebar", () => {
  const WithSidebar = (_props: Record<string, unknown>): ReactElement | null =>
    null;
  return { default: WithSidebar };
});

// Import mocked modules' exports for assertions
import { NAV_TITLE } from "@/config/constants/navigation";
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from "app/lib/actions";

// Import mocked component references for type comparisons
import ExportTransactions from "app/ui/home/export-transactions";
import NoTransactionsPlug from "app/ui/no-transactions-plug";
import WithSidebar from "app/ui/sidebar/with-sidebar";

// Import module under test
import Page, { metadata } from "app/export/page";

describe("Page (app/export/page.tsx)", (): void => {
  const userEmail = "user@example.com";
  const transactionsDefault: Array<Record<string, unknown>> = [
    { id: "t1" },
    { id: "t2" },
  ];
  const exportResults: Array<Record<string, unknown>> = [{ id: "e1" }];

  beforeEach((): void => {
    vi.clearAllMocks();

    // Default mock implementations
    (
      getCachedAuthSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      user: { email: userEmail },
    });

    (
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(transactionsDefault);

    (
      getTransactionsForExport as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(exportResults);
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test("should expose metadata title from NAV_TITLE.EXPORT", (): void => {
    expect(metadata.title).toBe(NAV_TITLE.EXPORT);
  });

  test("should render WithSidebar and include ExportTransactions when transactions exist", async (): Promise<void> => {
    const element = (await Page()) as unknown as ReactElement;

    // Root element should be WithSidebar
    expect(element.type).toBe(WithSidebar);

    const props = element.props as Record<string, unknown>;
    const content = props.contentNearby as ReactElement;
    const fragmentChildren = (content.props as Record<string, unknown>)
      .children as unknown;

    const childArray = Array.isArray(fragmentChildren)
      ? fragmentChildren
      : [fragmentChildren];
    // Expect two children in fragment: <h1> and a wrapper <div>
    expect(childArray.length).toBe(2);

    // Assert header contains NAV_TITLE.EXPORT
    const headerEl = childArray[0] as ReactElement;
    expect(headerEl.type).toBe("h1");
    // h1 children is NAV_TITLE.EXPORT
    const headerText = (headerEl.props as Record<string, unknown>)
      .children as unknown;
    expect(headerText).toBe(NAV_TITLE.EXPORT);

    const wrapperDiv = childArray[1] as ReactElement;
    expect(wrapperDiv.type).toBe("div");

    const inner = (wrapperDiv.props as Record<string, unknown>)
      .children as ReactElement;
    expect(inner.type).toBe(ExportTransactions);

    const exportProps = inner.props as Record<string, unknown>;
    expect(exportProps.transactions).toEqual(transactionsDefault);
    expect(typeof exportProps.onExport).toBe("function");

    // Ensure data fetching functions called as expected
    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenCalledWith(userEmail);
  });

  test("should render NoTransactionsPlug when no transactions", async (): Promise<void> => {
    (
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);

    const element = (await Page()) as unknown as ReactElement;
    expect(element.type).toBe(WithSidebar);

    const content = (element.props as Record<string, unknown>)
      .contentNearby as ReactElement;
    const fragmentChildren = (content.props as Record<string, unknown>)
      .children as unknown;
    const childArray = Array.isArray(fragmentChildren)
      ? fragmentChildren
      : [fragmentChildren];

    const wrapperDiv = childArray[1] as ReactElement;
    expect(wrapperDiv.type).toBe("div");

    const inner = (wrapperDiv.props as Record<string, unknown>)
      .children as ReactElement;
    expect(inner.type).toBe(NoTransactionsPlug);
  });

  test("should provide onExport that calls getTransactionsForExport with userId and dates", async (): Promise<void> => {
    const element = (await Page()) as unknown as ReactElement;
    const content = (element.props as Record<string, unknown>)
      .contentNearby as ReactElement;
    const fragmentChildren = (content.props as Record<string, unknown>)
      .children as unknown;
    const childArray = Array.isArray(fragmentChildren)
      ? fragmentChildren
      : [fragmentChildren];

    const wrapperDiv = childArray[1] as ReactElement;
    const exportEl = (wrapperDiv.props as Record<string, unknown>)
      .children as ReactElement;
    expect(exportEl.type).toBe(ExportTransactions);

    const exportProps = exportEl.props as Record<string, unknown>;
    const onExport = exportProps.onExport as (
      startDate?: Date,
      endDate?: Date,
    ) => Promise<unknown>;

    const start = new Date("2020-01-01T00:00:00.000Z");
    const end = new Date("2020-12-31T23:59:59.999Z");

    const result = (await onExport(start, end)) as unknown;
    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(
      getTransactionsForExport as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenCalledWith(userEmail, start, end);

    expect(result).toEqual(exportResults);
  });

  test("should pass undefined userId when session or email missing", async (): Promise<void> => {
    (
      getCachedAuthSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(undefined);
    (
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue(transactionsDefault);

    const element = (await Page()) as unknown as ReactElement;
    const content = (element.props as Record<string, unknown>)
      .contentNearby as ReactElement;
    const fragmentChildren = (content.props as Record<string, unknown>)
      .children as unknown;
    const childArray = Array.isArray(fragmentChildren)
      ? fragmentChildren
      : [fragmentChildren];

    const wrapperDiv = childArray[1] as ReactElement;
    const exportEl = (wrapperDiv.props as Record<string, unknown>)
      .children as ReactElement;
    const exportProps = exportEl.props as Record<string, unknown>;
    const onExport = exportProps.onExport as (
      startDate?: Date,
      endDate?: Date,
    ) => Promise<unknown>;

    const start = new Date("2021-01-01T00:00:00.000Z");
    const end = new Date("2021-02-01T00:00:00.000Z");

    await onExport(start, end);

    expect(
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenCalledWith(undefined);
    expect(
      getTransactionsForExport as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenCalledWith(undefined, start, end);
  });

  test("should propagate error when getCachedAuthSession throws synchronously", async (): Promise<void> => {
    (
      getCachedAuthSession as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {
      throw new Error("auth error");
    });

    await expect(Page()).rejects.toThrow("auth error");
  });

  test("should propagate error when getCachedAllTransactions throws synchronously", async (): Promise<void> => {
    (
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {
      throw new Error("transactions error");
    });

    await expect(Page()).rejects.toThrow("transactions error");
  });
});
