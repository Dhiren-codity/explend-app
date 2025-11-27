import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import Page, { metadata } from "./app/export/page";

vi.mock("@/config/constants/navigation", (): Record<string, unknown> => {
  return {
    NAV_TITLE: { EXPORT: "Export" },
  };
});

vi.mock("./app/export/lib/actions", (): Record<string, unknown> => {
  return {
    getCachedAuthSession: (...args: unknown[]): unknown => {
      return (
        globalThis as unknown as { __mocks: Record<string, unknown> }
      ).__mocks.getCachedAuthSession(...args);
    },
    getCachedAllTransactions: (...args: unknown[]): unknown => {
      return (
        globalThis as unknown as { __mocks: Record<string, unknown> }
      ).__mocks.getCachedAllTransactions(...args);
    },
    getTransactionsForExport: (...args: unknown[]): unknown => {
      return (
        globalThis as unknown as { __mocks: Record<string, unknown> }
      ).__mocks.getTransactionsForExport(...args);
    },
  };
});

vi.mock("./app/export/ui/sidebar/with-sidebar", (): Record<string, unknown> => {
  const WithSidebar = ({
    contentNearby,
  }: {
    contentNearby: unknown;
  }): unknown =>
    React.createElement(
      "div",
      { "data-testid": "with-sidebar" },
      contentNearby as React.ReactNode,
    );
  return { __esModule: true, default: WithSidebar };
});

vi.mock("./app/export/ui/no-transactions-plug", (): Record<string, unknown> => {
  const NoTransactionsPlug = (): unknown =>
    React.createElement("div", { "data-testid": "no-transactions-plug" });
  return { __esModule: true, default: NoTransactionsPlug };
});

vi.mock(
  "./app/export/ui/home/export-transactions",
  (): Record<string, unknown> => {
    const ExportTransactions = (props: Record<string, unknown>): unknown => {
      (
        globalThis as unknown as { __mocks: Record<string, unknown> }
      ).__mocks.lastExportProps = props;
      const count = Array.isArray(props.transactions as unknown[])
        ? (props.transactions as unknown[]).length
        : -1;
      return React.createElement("div", {
        "data-testid": "export-transactions",
        "data-count": count,
      });
    };
    return { __esModule: true, default: ExportTransactions };
  },
);

describe("Tests", (): void => {
  type MockFns = {
    getCachedAuthSession: ReturnType<typeof vi.fn>;
    getCachedAllTransactions: ReturnType<typeof vi.fn>;
    getTransactionsForExport: ReturnType<typeof vi.fn>;
    lastExportProps?: unknown;
  };

  const getMocks = (): MockFns => {
    return (globalThis as unknown as { __mocks: MockFns }).__mocks;
  };

  describe("Page", (): void => {
    (globalThis as unknown as { __mocks: MockFns }).__mocks = {
      getCachedAuthSession: vi
        .fn()
        .mockResolvedValue({ user: { email: "user@example.com" } }),
      getCachedAllTransactions: vi.fn().mockResolvedValue([]),
      getTransactionsForExport: vi.fn().mockResolvedValue([]),
      lastExportProps: undefined,
    };
  });

  delete (globalThis as unknown as { __mocks?: MockFns }).__mocks;

  test("metadata has correct title", (): Promise<void> => {
    test("renders NoTransactionsPlug when there are no transactions and calls caching functions", async (): Promise<void> => {
      const element = await Page();
      render(element);

      // Title rendered
      const heading = screen.getByRole("heading", { level: 1 });

      // Wrapper present
      const wrapper = screen.getByTestId("with-sidebar");

      // NoTransactionsPlug shown, ExportTransactions not shown
      const plug = screen.getByTestId("no-transactions-plug");
      const exportEl = screen.queryByTestId("export-transactions");

      // Calls verification
      const mocks = getMocks();

      test("renders ExportTransactions when transactions exist and onExport calls server action with correct args", async (): Promise<void> => {
        const mocks = getMocks();
        const sampleTransactions = [{ id: "t1" }, { id: "t2" }];
        mocks.getCachedAllTransactions.mockResolvedValueOnce(
          sampleTransactions,
        );
        mocks.getCachedAllTransactions.mockResolvedValueOnce(
          sampleTransactions,
        );

        const element = await Page();
        render(element);

        const exportEl = screen.getByTestId("export-transactions");

        const props = getMocks().lastExportProps as {
          onExport: (startDate?: Date, endDate?: Date) => Promise<unknown>;
          transactions: unknown[];
        };

        const startDate = new Date("2020-01-01T00:00:00.000Z");
        const endDate = new Date("2020-02-01T00:00:00.000Z");
        const expectedExport = [{ id: "e1" }];
        mocks.getTransactionsForExport.mockResolvedValueOnce(expectedExport);

        const result = await props.onExport(startDate, endDate);

        test("handles undefined session email by calling transactions with undefined userId", async (): Promise<void> => {
          const mocks = getMocks();
          mocks.getCachedAuthSession.mockResolvedValueOnce({});
          mocks.getCachedAuthSession.mockResolvedValueOnce({});

          const element = await Page();
          render(element);

          const plug = screen.getByTestId("no-transactions-plug");

          test("propagates error when getCachedAllTransactions rejects", async (): Promise<void> => {
            const mocks = getMocks();
            // First (non-awaited) prefetch resolves, second (awaited) rejects
            mocks.getCachedAllTransactions;
            // REMOVED: .mockResolvedValueOnce([])
            // REMOVED: .mockRejectedValueOnce(new Error('fail-transactions'));

            await expect(Page()).rejects.toThrow("fail-transactions");

            test("throws when getCachedAllTransactions resolves to null (invalid shape)", async (): Promise<void> => {
              const mocks = getMocks();
              mocks.getCachedAllTransactions.mockResolvedValueOnce(null);
              mocks.getCachedAllTransactions.mockResolvedValueOnce(null);

              await expect(Page()).rejects.toThrow();
            });
          });
        });
      });
    });
  });
});
