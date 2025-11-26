import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

vi.mock("@/config/constants/navigation", (): Record<string, unknown> => {
  return {
    NAV_TITLE: { EXPORT: "Export Title" },
  };

let getCachedAuthSessionMock: ReturnType<typeof vi.fn> = vi.fn();
let getCachedAllTransactionsMock: ReturnType<typeof vi.fn> = vi.fn();
let getTransactionsForExportMock: ReturnType<typeof vi.fn> = vi.fn();

let capturedExportProps: {
  transactions: unknown;
  onExport: (startDate?: Date, endDate?: Date) => Promise<unknown>;
} | null = null;

vi.mock("../lib/actions", (): Record<string, unknown> => {
  return {
    getCachedAuthSession: getCachedAuthSessionMock,
    getCachedAllTransactions: getCachedAllTransactionsMock,
    getTransactionsForExport: getTransactionsForExportMock,
  };

vi.mock("../ui/home/export-transactions", (): Record<string, unknown> => {
  return {
    default: (props: {
      transactions: unknown;
      onExport: (startDate?: Date, endDate?: Date) => Promise<unknown>;
    }): unknown => {
      capturedExportProps = props;
      return React.createElement("div", {
        "data-testid": "export-transactions",
      });
    },
  };

vi.mock("../ui/no-transactions-plug", (): Record<string, unknown> => {
  return {
    default: (): unknown => {
      return React.createElement("div", {
        "data-testid": "no-transactions-plug",
      });
    },
  };

vi.mock("../ui/sidebar/with-sidebar", (): Record<string, unknown> => {
  return {
    default: (props: { contentNearby: unknown }): unknown => {
      return React.createElement("div", {
        "data-testid": "with-sidebar",
        "data-content": props.contentNearby,
      });
    },
  };

function findByTestIdInTree(node: unknown, testId: string): boolean {
  if (node == null) {
    return false;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      if (findByTestIdInTree(child, testId)) {
        return true;
      }
    return false;
  }
  if (React.isValidElement(node)) {
    const elementProps = (node as unknown as { props: Record<string, unknown> })
      .props;
    if (elementProps && elementProps["data-testid"] === testId) {
      return true;
    }
    const children = elementProps ? elementProps.children : undefined;
    if (children == null) {
      return false;
    }
    if (Array.isArray(children)) {
      for (const child of children) {
        if (findByTestIdInTree(child, testId)) {
          return true;
        }
      return false;
    }
    return findByTestIdInTree(children, testId);
  }
  return false;
}


  afterEach((): void => {
    vi.clearAllMocks();
  });

  test("should render NoTransactionsPlug when there are no transactions and set metadata title", async (): Promise<void> => {
    getCachedAllTransactionsMock;
    // REMOVED: .mockResolvedValueOnce([])
    // REMOVED: .mockResolvedValueOnce([]);

    const mod = await import("./app/export/page");
    const Page = mod.default as unknown as () => Promise<unknown>;
    const result = await Page();

    expect(React.isValidElement(result)).toBe(true);

    const props = (result as unknown as { props: Record<string, unknown> })
      .props;
    expect(props["data-testid"]).toBe("with-sidebar");

    const contentTree = props["data-content"];
    expect(findByTestIdInTree(contentTree, "no-transactions-plug")).toBe(true);
    expect(findByTestIdInTree(contentTree, "export-transactions")).toBe(false);

    expect(getCachedAuthSessionMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock.mock.calls[0][0]).toBe(
      "user@example.com",
    );
    expect(getCachedAllTransactionsMock.mock.calls[1][0]).toBe(
      "user@example.com",
    );

    expect(mod.metadata.title).toBe("Export Title");
  });

    const exported = [{ id: "exp1" }];

    getCachedAllTransactionsMock;
    // REMOVED: .mockResolvedValueOnce(transactions)
    // REMOVED: .mockResolvedValueOnce(transactions);
    getTransactionsForExportMock.mockResolvedValueOnce(exported);

    const mod = await import("./app/export/page");
    const Page = mod.default as unknown as () => Promise<unknown>;
    const result = await Page();

    expect(React.isValidElement(result)).toBe(true);

    const props = (result as unknown as { props: Record<string, unknown> })
      .props;
    const contentTree = props["data-content"];

    expect(findByTestIdInTree(contentTree, "export-transactions")).toBe(true);
    expect(capturedExportProps).not.toBeNull();
    expect(
      capturedExportProps ? capturedExportProps.transactions : null,
    ).toEqual(transactions);

    const startDate = new Date("2020-01-01T00:00:00.000Z");
    const endDate = new Date("2020-01-31T00:00:00.000Z");
    const exportResult = await (
      capturedExportProps as {
        onExport: (startDate?: Date, endDate?: Date) => Promise<unknown>;
      }
    ).onExport(startDate, endDate);

    expect(getTransactionsForExportMock).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExportMock.mock.calls[0][0]).toBe(
      "user@example.com",
    );
    expect(getTransactionsForExportMock.mock.calls[0][1]).toEqual(startDate);
    expect(getTransactionsForExportMock.mock.calls[0][2]).toEqual(endDate);
    expect(exportResult).toEqual(exported);
  });

    // REMOVED: .mockRejectedValueOnce(new Error("auth fail"));

    const mod = await import("./app/export/page");
    const Page = mod.default as unknown as () => Promise<unknown>;

    await expect(Page()).rejects.toThrow("auth fail");
  });

  test("should reject when getCachedAllTransactions fails on awaited call", async (): Promise<void> => {
    getCachedAllTransactionsMock;
    // REMOVED: .mockResolvedValueOnce([])
    // REMOVED: .mockRejectedValueOnce(new Error("tx fail"));

    const mod = await import("./app/export/page");
    const Page = mod.default as unknown as () => Promise<unknown>;

    await expect(Page()).rejects.toThrow("tx fail");
  });


    getCachedAllTransactionsMock;
    // REMOVED: .mockResolvedValueOnce(transactions)
    // REMOVED: .mockResolvedValueOnce(transactions);
    getTransactionsForExportMock.mockRejectedValueOnce(
      new Error("export fail"),
    );

    const mod = await import("./app/export/page");
    const Page = mod.default as unknown as () => Promise<unknown>;
    await Page();

    expect(capturedExportProps).not.toBeNull();

    const startDate = new Date("2021-01-01T00:00:00.000Z");
    const endDate = new Date("2021-01-31T00:00:00.000Z");

    await expect(
      (
        capturedExportProps as {
          onExport: (startDate?: Date, endDate?: Date) => Promise<unknown>;
        }
      ).onExport(startDate, endDate),
    ).rejects.toThrow("export fail");
  });

    getCachedAllTransactionsMock;
    // REMOVED: .mockResolvedValueOnce([])
    // REMOVED: .mockResolvedValueOnce([]);

    const mod = await import("./app/export/page");
    const Page = mod.default as unknown as () => Promise<unknown>;
    const result = await Page();

    expect(React.isValidElement(result)).toBe(true);

    expect(getCachedAllTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock.mock.calls[0][0]).toBeUndefined();
    expect(getCachedAllTransactionsMock.mock.calls[1][0]).toBeUndefined();

    const props = (result as unknown as { props: Record<string, unknown> })
      .props;
    const contentTree = props["data-content"];
    expect(findByTestIdInTree(contentTree, "no-transactions-plug")).toBe(true);
  });
