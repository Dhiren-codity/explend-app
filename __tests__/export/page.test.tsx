import React from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

type OnExportFn = (startDate?: Date, endDate?: Date) => Promise<unknown[]>;

let capturedOnExport: OnExportFn | null = null;

const mockGetCachedAuthSession = vi.fn();
const mockGetCachedAllTransactions = vi.fn();
const mockGetTransactionsForExport = vi.fn();

vi.mock(
  "@/config/constants/navigation",
  (): Record<string, unknown> => {
    return {
      NAV_TITLE: { EXPORT: "Export Test Title" },
    };
  },
  { virtual: true },
);

vi.mock("../lib/actions", (): Record<string, unknown> => {
  return {
    getCachedAuthSession: mockGetCachedAuthSession,
    getCachedAllTransactions: mockGetCachedAllTransactions,
    getTransactionsForExport: mockGetTransactionsForExport,
  };
});

vi.mock("../ui/home/export-transactions", (): Record<string, unknown> => {
  return {
    __esModule: true,
    default: (props: {
      transactions: Array<Record<string, unknown>>;
      onExport: OnExportFn;
    }): React.ReactElement => {
      capturedOnExport = props.onExport;
      return React.createElement("div", {
        "data-testid": "export-transactions",
      });
    },
  };
});

vi.mock("../ui/no-transactions-plug", (): Record<string, unknown> => {
  return {
    __esModule: true,
    default: (): React.ReactElement => {
      return React.createElement("div", {
        "data-testid": "no-transactions-plug",
      });
    },
  };
});

vi.mock("../ui/sidebar/with-sidebar", (): Record<string, unknown> => {
  return {
    __esModule: true,
    default: (props: { contentNearby: unknown }): React.ReactElement => {
      return React.createElement(
        "div",
        { "data-testid": "with-sidebar" },
        props.contentNearby as React.ReactNode,
      );
    },
  };
});

describe("app/export/page", (): void => {
  let Page: (() => Promise<unknown>) | null = null;
  let metadata: { title?: unknown } | null = null;

  const importSut = async (): Promise<void> => {
    const mod = await import("./page");
    Page = mod.default as () => Promise<unknown>;
    metadata = (mod as Record<string, unknown>).metadata as { title?: unknown };
  };

  const sampleSession = { user: { email: "user@example.com" } } as const;
  const sampleTransactions: Array<Record<string, unknown>> = [
    { id: "t1", amount: 100 },
    { id: "t2", amount: 50 },
  ];

  const findByTestId = (node: unknown, testId: string): boolean => {
    if (node === null || typeof node !== "object") return false;
    const element = node as Record<string, unknown>;
    const props = element.props as Record<string, unknown> | undefined;
    if (props && props["data-testid"] === testId) return true;
    const children = props?.children as unknown;
    if (Array.isArray(children)) {
      for (const child of children) {
        if (findByTestId(child, testId)) return true;
      }
      return false;
    }
    if (children !== undefined) {
      return findByTestId(children, testId);
    }
    return false;
  };

  beforeEach(async (): Promise<void> => {
    vi.resetModules();
    vi.clearAllMocks();

    capturedOnExport = null;

    mockGetCachedAuthSession.mockResolvedValue(sampleSession);
    mockGetCachedAllTransactions.mockResolvedValue(sampleTransactions);
    mockGetTransactionsForExport.mockResolvedValue(sampleTransactions);

    await importSut();
  });

  afterEach((): void => {
    vi.clearAllMocks();
    capturedOnExport = null;
    Page = null;
    metadata = null;
  });

  test("metadata.title should equal NAV_TITLE.EXPORT", async (): Promise<void> => {
    // metadata is loaded in beforeEach via importSut
    expect(metadata).toBeTruthy();
    expect(metadata?.title).toBe("Export Test Title");
  });

  test("renders NoTransactionsPlug when no transactions", async (): Promise<void> => {
    mockGetCachedAllTransactions
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    // re-import SUT to pick updated mocks if necessary
    await importSut();

    const element = await (Page as () => Promise<unknown>)();

    expect(findByTestId(element, "with-sidebar")).toBe(true);
    expect(findByTestId(element, "no-transactions-plug")).toBe(true);
    expect(findByTestId(element, "export-transactions")).toBe(false);

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(
      1,
      sampleSession.user.email,
    );
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(
      2,
      sampleSession.user.email,
    );
  });

  test("renders ExportTransactions when transactions exist", async (): Promise<void> => {
    mockGetCachedAllTransactions
      .mockResolvedValueOnce(sampleTransactions)
      .mockResolvedValueOnce(sampleTransactions);

    await importSut();

    const element = await (Page as () => Promise<unknown>)();

    expect(findByTestId(element, "with-sidebar")).toBe(true);
    expect(findByTestId(element, "export-transactions")).toBe(true);
    expect(findByTestId(element, "no-transactions-plug")).toBe(false);

    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(
      1,
      sampleSession.user.email,
    );
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(
      2,
      sampleSession.user.email,
    );
  });

  test("onExport calls getTransactionsForExport with correct params and returns data", async (): Promise<void> => {
    mockGetCachedAllTransactions
      .mockResolvedValueOnce(sampleTransactions)
      .mockResolvedValueOnce(sampleTransactions);

    await importSut();

    await (Page as () => Promise<unknown>)();

    expect(capturedOnExport).toBeInstanceOf(Function);

    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-31T23:59:59Z");

    const result = await (capturedOnExport as OnExportFn)(startDate, endDate);

    expect(mockGetTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(mockGetTransactionsForExport).toHaveBeenCalledWith(
      sampleSession.user.email,
      startDate,
      endDate,
    );
    expect(result).toBe(sampleTransactions);
  });

  test("onExport propagates errors from getTransactionsForExport", async (): Promise<void> => {
    mockGetCachedAllTransactions
      .mockResolvedValueOnce(sampleTransactions)
      .mockResolvedValueOnce(sampleTransactions);
    const exportError = new Error("export failed");
    mockGetTransactionsForExport.mockRejectedValueOnce(exportError);

    await importSut();

    await (Page as () => Promise<unknown>)();

    expect(capturedOnExport).toBeInstanceOf(Function);

    await expect((capturedOnExport as OnExportFn)()).rejects.toThrow(
      "export failed",
    );
    expect(mockGetTransactionsForExport).toHaveBeenCalledWith(
      sampleSession.user.email,
      undefined,
      undefined,
    );
  });

  test("handles undefined user session (userId undefined)", async (): Promise<void> => {
    mockGetCachedAuthSession
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    mockGetCachedAllTransactions
      .mockResolvedValueOnce(sampleTransactions)
      .mockResolvedValueOnce(sampleTransactions);

    await importSut();

    await (Page as () => Promise<unknown>)();

    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(1, undefined);
    expect(mockGetCachedAllTransactions).toHaveBeenNthCalledWith(2, undefined);

    expect(capturedOnExport).toBeInstanceOf(Function);
    await (capturedOnExport as OnExportFn)();
    expect(mockGetTransactionsForExport).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
    );
  });

  test("rejects when getCachedAllTransactions throws", async (): Promise<void> => {
    const fetchError = new Error("fetch transactions failed");
    mockGetCachedAllTransactions.mockRejectedValueOnce(fetchError);

    await importSut();

    await expect((Page as () => Promise<unknown>)()).rejects.toThrow(
      "fetch transactions failed",
    );
    expect(mockGetCachedAllTransactions).toHaveBeenCalledTimes(1);
  });

  test("rejects when getCachedAuthSession throws", async (): Promise<void> => {
    const sessionError = new Error("session failed");
    mockGetCachedAuthSession.mockRejectedValueOnce(sessionError);

    await importSut();

    await expect((Page as () => Promise<unknown>)()).rejects.toThrow(
      "session failed",
    );
    expect(mockGetCachedAuthSession).toHaveBeenCalledTimes(1);
  });
});
