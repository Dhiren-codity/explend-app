import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import Page, { metadata } from "./page";

vi.mock("@/config/constants/navigation", (): Record<string, unknown> => {
  return {
    __esModule: true,
    NAV_TITLE: { EXPORT: "Export" },
  };
});

vi.mock("../lib/actions", (): Record<string, unknown> => {
  const getCachedAuthSession = vi.fn();
  const getCachedAllTransactions = vi.fn();
  const getTransactionsForExport = vi.fn();
  (globalThis as unknown as Record<string, unknown>).__mockActions = {
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  };
  return {
    __esModule: true,
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  };
});

vi.mock("../ui/no-transactions-plug", (): Record<string, unknown> => {
  const NoTransactionsPlug = (): JSX.Element =>
    React.createElement("div", { "data-testid": "no-transactions-plug" });
  return {
    __esModule: true,
    default: NoTransactionsPlug,
  };
});

vi.mock("../ui/sidebar/with-sidebar", (): Record<string, unknown> => {
  const WithSidebar = ({
    contentNearby,
  }: {
    contentNearby: unknown;
  }): JSX.Element => {
    const children = contentNearby as React.ReactNode;
    return React.createElement(
      "div",
      { "data-testid": "with-sidebar" },
      children,
    );
  };
  return {
    __esModule: true,
    default: WithSidebar,
  };
});

vi.mock("../ui/home/export-transactions", (): Record<string, unknown> => {
  const ExportTransactions = (props: {
    transactions: unknown[];
    onExport: (_start?: Date, _end?: Date) => Promise<unknown[]>;
  }): JSX.Element => {
    (globalThis as unknown as Record<string, unknown>).lastOnExport =
      props.onExport as unknown;
    return React.createElement("div", { "data-testid": "export-transactions" });
  };
  return {
    __esModule: true,
    default: ExportTransactions,
  };
});

type MockActions = {
  getCachedAuthSession: ReturnType<typeof vi.fn>;
  getCachedAllTransactions: ReturnType<typeof vi.fn>;
  getTransactionsForExport: ReturnType<typeof vi.fn>;
};

function getActions(): MockActions {
  const container = globalThis as unknown as Record<string, unknown>;
  const actions = container.__mockActions as unknown as MockActions;
  return actions;
}

function getLastOnExport():
  | ((_start?: Date, _end?: Date) => Promise<unknown>)
  | undefined {
  const container = globalThis as unknown as Record<string, unknown>;
  return container.lastOnExport as
    | ((_start?: Date, _end?: Date) => Promise<unknown>)
    | undefined;
}

describe("app/export/page.tsx - Page", (): void => {
  beforeEach((): void => {
    const actions = getActions();
    actions.getCachedAuthSession.mockReset().mockResolvedValue({
      user: { email: "user@example.com" },
    });
    actions.getCachedAllTransactions.mockReset().mockResolvedValue([]);
    actions.getTransactionsForExport.mockReset().mockResolvedValue([]);
    (globalThis as unknown as Record<string, unknown>).lastOnExport = undefined;
  });

  afterEach((): void => {
    vi.clearAllMocks();
    cleanup();
  });

  test("exports metadata with correct title", (): void => {
    expect(metadata.title).toBe("Export");
  });

  test("renders NoTransactionsPlug when there are no transactions", async (): Promise<void> => {
    const element = await Page();
    render(element as React.ReactElement);

    const sidebar = screen.queryByTestId("with-sidebar");
    const noTx = screen.queryByTestId("no-transactions-plug");
    const exportTx = screen.queryByTestId("export-transactions");

    expect(sidebar).not.toBeNull();
    expect(noTx).not.toBeNull();
    expect(exportTx).toBeNull();
  });


    const element = await Page();
    render(element as React.ReactElement);

    const sidebar = screen.queryByTestId("with-sidebar");
    const noTx = screen.queryByTestId("no-transactions-plug");
    const exportTx = screen.queryByTestId("export-transactions");

    expect(sidebar).not.toBeNull();
    expect(noTx).toBeNull();
    expect(exportTx).not.toBeNull();
  });

  test("calls caching functions twice and passes userId to getCachedAllTransactions", async (): Promise<void> => {
    const actions = getActions();
    await Page();

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2);

    const calls = actions.getCachedAllTransactions.mock.calls;
    expect(calls[0]?.[0]).toBe("user@example.com");
    expect(calls[1]?.[0]).toBe("user@example.com");
  });

  test("handleExport passes through to getTransactionsForExport with filters and returns result", async (): Promise<void> => {
    const actions = getActions();
    const expected = [{ id: "e1" }];
    actions.getCachedAllTransactions.mockResolvedValueOnce([{ id: "t1" }]);
    actions.getTransactionsForExport.mockResolvedValueOnce(expected);

    const element = await Page();
    render(element as React.ReactElement);

    const onExport = getLastOnExport();
    expect(typeof onExport).toBe("function");

    const start = new Date("2023-01-01T00:00:00.000Z");
    const end = new Date("2023-12-31T23:59:59.999Z");

    const result = await (
      onExport as (_s?: Date, _e?: Date) => Promise<unknown[]>
    )(start, end);
    expect(result).toEqual(expected);
    expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(actions.getTransactionsForExport).toHaveBeenCalledWith(
      "user@example.com",
      start,
      end,
    );

    // call without dates
    const expectedSecond = [{ id: "e2" }];
    actions.getTransactionsForExport.mockResolvedValueOnce(expectedSecond);
    const result2 = await (
      onExport as (_s?: Date, _e?: Date) => Promise<unknown[]>
    )();
    expect(result2).toEqual(expectedSecond);
    expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(2);
    expect(actions.getTransactionsForExport).toHaveBeenLastCalledWith(
      "user@example.com",
      undefined,
      undefined,
    );
  });

  test("propagates error when getCachedAuthSession rejects", async (): Promise<void> => {
    const actions = getActions();
    actions.getCachedAuthSession.mockRejectedValueOnce(new Error("auth error"));

    await expect(Page()).rejects.toThrow("auth error");
  });

  test("propagates error when getCachedAllTransactions rejects", async (): Promise<void> => {
    const actions = getActions();
    actions.getCachedAllTransactions.mockRejectedValue(new Error("tx error"));

    await expect(Page()).rejects.toThrow("tx error");
  });

    actions.getTransactionsForExport.mockRejectedValueOnce(
      new Error("export error"),
    );

    const element = await Page();
    render(element as React.ReactElement);

    const onExport = getLastOnExport();
    expect(typeof onExport).toBe("function");

    await expect(
      (onExport as (_s?: Date, _e?: Date) => Promise<unknown>)(),
    ).rejects.toThrow("export error");
  });

    actions.getCachedAllTransactions.mockResolvedValueOnce([]);

    const element = await Page();
    render(element as React.ReactElement);

    const noTx = screen.queryByTestId("no-transactions-plug");
    expect(noTx).not.toBeNull();

    const calls = actions.getCachedAllTransactions.mock.calls;
    expect(calls.length).toBe(2);
    expect(calls[0]?.[0]).toBeUndefined();
    expect(calls[1]?.[0]).toBeUndefined();
  });
});
