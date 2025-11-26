import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

let lastExportTransactionsProps: {
  transactions?: unknown;
  onExport?: (startDate?: Date, endDate?: Date) => Promise<unknown>;
} | null = null;

let getCachedAuthSessionMock: unknown;
let getCachedAllTransactionsMock: unknown;
let getTransactionsForExportMock: unknown;

vi.mock("@/config/constants/navigation", () => {
  return {
    NAV_TITLE: { EXPORT: "Export Page" },
  };

vi.mock("../lib/actions", () => {
  getCachedAuthSessionMock = vi.fn();
  getCachedAllTransactionsMock = vi.fn();
  getTransactionsForExportMock = vi.fn();
  return {
    getCachedAuthSession: getCachedAuthSessionMock,
    getCachedAllTransactions: getCachedAllTransactionsMock,
    getTransactionsForExport: getTransactionsForExportMock,
  };

vi.mock("../ui/home/export-transactions", () => {
  const MockExportTransactions = (props: {
    transactions: unknown;
    onExport: (_startDate?: Date, _endDate?: Date) => Promise<unknown>;
  }): React.ReactElement => {
    lastExportTransactionsProps = {
      transactions: props.transactions,
      onExport: props.onExport,
    };
    return React.createElement(
      "div",
      { "data-testid": "export-transactions-mock" },
      "ExportTransactionsMock",
    );
  };
  return { default: MockExportTransactions };
});

vi.mock("../ui/no-transactions-plug", () => {
  const MockNoTransactionsPlug = (): React.ReactElement =>
    React.createElement(
      "div",
      { "data-testid": "no-transactions-plug" },
      "NoTransactionsPlugMock",
    );
  return { default: MockNoTransactionsPlug };
});

vi.mock("../ui/sidebar/with-sidebar", () => {
  const MockWithSidebar = (
    props: Record<string, unknown>,
  ): React.ReactElement => {
    const contentNearby = props.contentNearby as React.ReactNode;
    return React.createElement(
      "div",
      { "data-testid": "with-sidebar" },
      contentNearby,
    );
  };
  return { default: MockWithSidebar };
});

import Page, { metadata } from "app/export/page";

const resetMock = (mockFn: unknown): void => {
  (mockFn as { mockReset: () => unknown }).mockReset();
};

const setMockResolvedValue = (mockFn: unknown, value: unknown): void => {
  (
    mockFn as { mockResolvedValue: (_value: unknown) => unknown }
  ).mockResolvedValue(value);
};

const setMockRejectedValue = (mockFn: unknown, error: unknown): void => {
  (
    mockFn as { mockRejectedValue: (_error: unknown) => unknown }
  ).mockRejectedValue(error);
};

const setMockImplementationOnce = (
  mockFn: unknown,
  impl: (..._args: unknown[]) => unknown,
): void => {
  (
    mockFn as {
      mockImplementationOnce: (
        _impl: (..._args: unknown[]) => unknown,
      ) => unknown;
    }
  ).mockImplementationOnce(impl);
};


  afterEach((): void => {
    vi.clearAllMocks();
    lastExportTransactionsProps = null;
  });

  test("metadata contains the export title", (): void => {
    expect(metadata.title).toBe("Export Page");
  });

  test("renders NoTransactionsPlug when there are no transactions", async (): Promise<void> => {
    setMockResolvedValue(getCachedAllTransactionsMock, []);

    const element = await Page();
    const markup = renderToStaticMarkup(
      element as unknown as React.ReactElement,
    );

    expect(markup).toContain('data-testid="with-sidebar"');
    expect(markup).toContain('data-testid="no-transactions-plug"');
    expect(markup).not.toContain('data-testid="export-transactions-mock"');

    expect(getCachedAuthSessionMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(
      1,
      "user@example.com",
    );
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(
      2,
      "user@example.com",
    );
  });

    setMockResolvedValue(getCachedAllTransactionsMock, txList);

    const element = await Page();
    const markup = renderToStaticMarkup(
      element as unknown as React.ReactElement,
    );

    expect(markup).toContain('data-testid="with-sidebar"');
    expect(markup).toContain('data-testid="export-transactions-mock"');
    expect(markup).not.toContain('data-testid="no-transactions-plug"');

    expect(lastExportTransactionsProps).not.toBeNull();
    expect(lastExportTransactionsProps?.transactions).toEqual(txList);

    const startDate = new Date("2020-01-01");
    const endDate = new Date("2020-01-10");
    const exportResult = [{ id: "e1" }];
    setMockResolvedValue(getTransactionsForExportMock, exportResult);

    const result = await (
      lastExportTransactionsProps?.onExport as (
        _s?: Date,
        _e?: Date,
      ) => Promise<unknown>
    )(startDate, endDate);

    expect(getTransactionsForExportMock).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExportMock).toHaveBeenCalledWith(
      "user@example.com",
      startDate,
      endDate,
    );
    expect(result).toEqual(exportResult);
  });


    await Page();

    expect(lastExportTransactionsProps).not.toBeNull();
    setMockResolvedValue(getTransactionsForExportMock, [{ id: "e2" }]);

    const result = await (
      lastExportTransactionsProps?.onExport as (
        _s?: Date,
        _e?: Date,
      ) => Promise<unknown>
    )();

    expect(getTransactionsForExportMock).toHaveBeenCalledWith(
      "user@example.com",
      undefined,
      undefined,
    );
    expect(result).toEqual([{ id: "e2" }]);
  });

  test("handles undefined session by calling actions with undefined userId and showing NoTransactionsPlug", async (): Promise<void> => {
    setMockResolvedValue(getCachedAuthSessionMock, undefined);
    setMockResolvedValue(getCachedAllTransactionsMock, []);

    const element = await Page();
    const markup = renderToStaticMarkup(
      element as unknown as React.ReactElement,
    );

    expect(markup).toContain('data-testid="no-transactions-plug"');
    expect(getCachedAuthSessionMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(1, undefined);
    expect(getCachedAllTransactionsMock).toHaveBeenNthCalledWith(2, undefined);
  });

    );
    setMockRejectedValue(getCachedAuthSessionMock, new Error("Auth failed"));

    await expect(Page()).rejects.toThrow("Auth failed");
  });

    setMockImplementationOnce(
      getCachedAllTransactionsMock,
      (): Promise<unknown> => Promise.resolve([]),
    );
    setMockRejectedValue(getCachedAllTransactionsMock, new Error("Fetch fail"));

    await expect(Page()).rejects.toThrow("Fetch fail");
  });

  test("includes header with navigation title", async (): Promise<void> => {
    setMockResolvedValue(getCachedAllTransactionsMock, []);
    const element = await Page();
    const markup = renderToStaticMarkup(
      element as unknown as React.ReactElement,
    );

    expect(markup).toContain("Export Page");
  });
