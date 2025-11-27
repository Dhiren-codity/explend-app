import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./app/export/page";

vi.mock("@/config/constants/navigation", () => ({
  NAV_TITLE: { EXPORT: "Export Title" },
}));

vi.mock("../lib/actions", () => {
  return {
    getCachedAuthSession: vi.fn(async (): Promise<unknown> => {
      const g = globalThis as unknown as Record<string, unknown>;
      const calls =
        (g.__calls_getCachedAuthSession as unknown[] | undefined) ?? [];
      calls.push({});
      g.__calls_getCachedAuthSession = calls;
      return g.__mock_session as unknown;
    }),
    getCachedAllTransactions: vi.fn(
      async (userId?: unknown): Promise<unknown> => {
        const g = globalThis as unknown as Record<string, unknown>;
        const calls =
          (g.__calls_getCachedAllTransactions as unknown[] | undefined) ?? [];
        calls.push(userId);
        g.__calls_getCachedAllTransactions = calls;
        if (
          (g.__throw_getCachedAllTransactions as boolean | undefined) ===
            true &&
          calls.length >= 2
        ) {
          throw new Error("getCachedAllTransactions error");
        }
        return g.__mock_transactions as unknown;
      },
    ),
    getTransactionsForExport: vi.fn(
      async (
        userId?: unknown,
        startDate?: unknown,
        endDate?: unknown,
      ): Promise<unknown> => {
        const g = globalThis as unknown as Record<string, unknown>;
        const calls =
          (g.__calls_getTransactionsForExport as unknown[] | undefined) ?? [];
        calls.push([userId, startDate, endDate]);
        g.__calls_getTransactionsForExport = calls;
        return g.__mock_exportTransactions as unknown;
      },
    ),
  };

vi.mock("../ui/home/export-transactions", () => ({
  default: (props: {
    transactions: unknown;
    onExport: (startDate?: Date, endDate?: Date) => Promise<unknown>;
  }): unknown => {
    const g = globalThis as unknown as Record<string, unknown>;
    g.__lastExportOnExport = props.onExport;
    g.__lastExportTransactions = props.transactions;
    return "ExportTransactions";
  },
}));

vi.mock("../ui/no-transactions-plug", () => ({
  default: (): string => "NoTransactionsPlug",
}));

vi.mock("../ui/sidebar/with-sidebar", () => ({
  default: (props: { contentNearby: unknown }): unknown => {
    return props.contentNearby as unknown;
  },
}));


  vi.clearAllMocks();
});

test("renders NoTransactionsPlug when there are no transactions", async (): Promise<void> => {
  const g = globalThis as unknown as Record<string, unknown>;
  g.__mock_transactions = [];

  const element = await Page();
  render(element as unknown as JSX.Element);

  expect(screen.getByText("NoTransactionsPlug")).toBeDefined();
  expect(screen.queryByText("ExportTransactions")).toBeNull();
  expect(screen.getByText("Export Title")).toBeDefined();
});
  g.__mock_transactions = mockTransactions;

  const element = await Page();
  render(element as unknown as JSX.Element);

  expect(screen.getByText("ExportTransactions")).toBeDefined();
  expect(screen.getByText("Export Title")).toBeDefined();
  expect(g.__lastExportTransactions).toEqual(mockTransactions);

  const onExport = g.__lastExportOnExport as unknown as (
    startDate?: Date,
    endDate?: Date,
  ) => Promise<unknown>;
  const start = new Date("2020-01-01T00:00:00.000Z");
  const end = new Date("2020-12-31T23:59:59.999Z");

  const exportResult = await onExport(start, end);
  expect(exportResult).toEqual(g.__mock_exportTransactions);

  const calls = g.__calls_getTransactionsForExport as unknown[];
  expect(Array.isArray(calls)).toBe(true);
  expect((calls as unknown[]).length).toBe(1);
  const [userId, startArg, endArg] = (
    calls as [unknown, unknown, unknown][]
  )[0];
  expect(userId).toBe("user@example.com");
  expect(startArg).toEqual(start);
  expect(endArg).toEqual(end);
});

  const element = await Page();
  render(element as unknown as JSX.Element);

  const authCalls = g.__calls_getCachedAuthSession as unknown[];
  expect(Array.isArray(authCalls)).toBe(true);
  expect(authCalls.length).toBe(2);

  const txCalls = g.__calls_getCachedAllTransactions as unknown[];
  expect(Array.isArray(txCalls)).toBe(true);
  expect(txCalls.length).toBe(2);
  expect(txCalls[0]).toBe("user@example.com");
  expect(txCalls[1]).toBe("user@example.com");
});
  g.__mock_transactions = [{ id: "t" }];

  const element = await Page();
  render(element as unknown as JSX.Element);

  expect(screen.getByText("ExportTransactions")).toBeDefined();

  const onExport = g.__lastExportOnExport as unknown as (
    startDate?: Date,
    endDate?: Date,
  ) => Promise<unknown>;
  await onExport();

  const calls = g.__calls_getTransactionsForExport as [
    unknown,
    unknown,
    unknown,
  ][];
  expect(calls.length).toBe(1);
  const [userIdArg] = calls[0];
  expect(userIdArg).toBeUndefined();

  const allTxCalls = g.__calls_getCachedAllTransactions as unknown[];
  expect(allTxCalls[0]).toBeUndefined();
  expect(allTxCalls[1]).toBeUndefined();
});
test("propagates error when getCachedAllTransactions rejects", async (): Promise<void> => {
  const g = globalThis as unknown as Record<string, unknown>;
  g.__throw_getCachedAllTransactions = true;

  await expect(Page()).rejects.toThrow("getCachedAllTransactions error");
});
