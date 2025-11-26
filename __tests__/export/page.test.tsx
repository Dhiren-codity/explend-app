import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

let getCachedAuthSessionMock: ReturnType<typeof vi.fn> | undefined;
let getCachedAllTransactionsMock: ReturnType<typeof vi.fn> | undefined;
let getTransactionsForExportMock: ReturnType<typeof vi.fn> | undefined;

let withSidebarComponentRef: unknown;
let exportTransactionsComponentRef: unknown;
let noTransactionsPlugComponentRef: unknown;

vi.mock(
  "@/config/constants/navigation",
  () => {
    return {
      NAV_TITLE: { EXPORT: "Export" },
    };
  },
  { virtual: true },
);

vi.mock(
  "../lib/actions",
  () => {
    getCachedAuthSessionMock = vi.fn();
    getCachedAllTransactionsMock = vi.fn();
    getTransactionsForExportMock = vi.fn();
    return {
      getCachedAuthSession: getCachedAuthSessionMock,
      getCachedAllTransactions: getCachedAllTransactionsMock,
      getTransactionsForExport: getTransactionsForExportMock,
    };
  },
  { virtual: true },
);

vi.mock(
  "../ui/sidebar/with-sidebar",
  () => {
    const WithSidebar = (_props: Record<string, unknown>): null => null;
    withSidebarComponentRef = WithSidebar;
    return { default: WithSidebar };
  },
  { virtual: true },
);

vi.mock(
  "../ui/home/export-transactions",
  () => {
    const ExportTransactions = (_props: Record<string, unknown>): null => null;
    exportTransactionsComponentRef = ExportTransactions;
    return { default: ExportTransactions };
  },
  { virtual: true },
);

vi.mock(
  "../ui/no-transactions-plug",
  () => {
    const NoTransactionsPlug = (_props: Record<string, unknown>): null => null;
    noTransactionsPlugComponentRef = NoTransactionsPlug;
    return { default: NoTransactionsPlug };
  },
  { virtual: true },
);

type ElementLike = {
  type: unknown;
  props?: Record<string, unknown>;
};

const isElementLike = (value: unknown): value is ElementLike => {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in (value as Record<string, unknown>)
  );
};

const getChildrenArray = (node: unknown): unknown[] => {
  if (!isElementLike(node)) return [];
  const children = node.props?.children as unknown;
  if (Array.isArray(children)) return children;
  if (children === undefined || children === null) return [];
  return [children];
};

const findElementByType = (
  node: unknown,
  typeRef: unknown,
): ElementLike | null => {
  if (!isElementLike(node)) return null;
  if (node.type === typeRef) return node;
  const children = getChildrenArray(node);
  for (const child of children) {
    const found = findElementByType(child, typeRef);
    if (found) return found;
  }
  return null;
};

const findElementByTypeString = (
  node: unknown,
  typeName: string,
): ElementLike | null => {
  if (!isElementLike(node)) return null;
  if (node.type === typeName) return node;
  const children = getChildrenArray(node);
  for (const child of children) {
    const found = findElementByTypeString(child, typeName);
    if (found) return found;
  }
  return null;
};

describe("Page", (): void => {
  beforeEach((): void => {
    vi.resetModules();
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test("renders ExportTransactions when transactions exist and wires onExport correctly", async (): Promise<void> => {
    const mod = await import("app/export/page");
    const Page = mod.default as () => Promise<unknown>;

    // Configure mocks after import (mocks are initialized by now)
    const session = { user: { email: "user@example.com" } } as Record<
      string,
      unknown
    >;
    const transactions = [{ id: "t1" } as Record<string, unknown>];
    const exported = [{ id: "e1" } as Record<string, unknown>];
    getCachedAuthSessionMock?.mockResolvedValue(session);
    getCachedAllTransactionsMock?.mockResolvedValue(transactions);
    getTransactionsForExportMock?.mockResolvedValue(exported);

    const result = await Page();
    expect(isElementLike(result)).toBe(true);
    expect((result as ElementLike).type).toBe(withSidebarComponentRef);

    const content = (result as ElementLike).props?.contentNearby as unknown;
    const exportEl = findElementByType(content, exportTransactionsComponentRef);
    expect(exportEl).not.toBeNull();

    // Validate props
    const exportProps = (exportEl as ElementLike).props ?? {};
    expect(exportProps.transactions).toBe(transactions);
    expect(typeof exportProps.onExport).toBe("function");

    // Call onExport and assert behavior
    const startDate = new Date("2024-01-01T00:00:00.000Z");
    const endDate = new Date("2024-01-31T23:59:59.000Z");
    const onExport = exportProps.onExport as (
      a?: Date,
      b?: Date,
    ) => Promise<unknown[]>;
    const exportedResult = await onExport(startDate, endDate);
    expect(getTransactionsForExportMock).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExportMock).toHaveBeenCalledWith(
      "user@example.com",
      startDate,
      endDate,
    );
    expect(exportedResult).toBe(exported);

    // Ensure caching calls occurred as expected
    expect(getCachedAuthSessionMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock?.mock.calls[0]?.[0]).toBe(
      "user@example.com",
    );
    expect(getCachedAllTransactionsMock?.mock.calls[1]?.[0]).toBe(
      "user@example.com",
    );
  });

  test("renders NoTransactionsPlug when transactions array is empty", async (): Promise<void> => {
    const mod = await import("app/export/page");
    const Page = mod.default as () => Promise<unknown>;

    const session = { user: { email: "user@example.com" } } as Record<
      string,
      unknown
    >;
    getCachedAuthSessionMock?.mockResolvedValue(session);
    getCachedAllTransactionsMock?.mockResolvedValue([]);

    const result = await Page();
    expect(isElementLike(result)).toBe(true);
    const content = (result as ElementLike).props?.contentNearby as unknown;

    const noTxEl = findElementByType(content, noTransactionsPlugComponentRef);
    const exportEl = findElementByType(content, exportTransactionsComponentRef);
    expect(noTxEl).not.toBeNull();
    expect(exportEl).toBeNull();
  });

  test("handles undefined session and passes undefined userId to data calls", async (): Promise<void> => {
    const mod = await import("app/export/page");
    const Page = mod.default as () => Promise<unknown>;

    getCachedAuthSessionMock?.mockResolvedValue(undefined);
    getCachedAllTransactionsMock?.mockResolvedValue([]);

    const result = await Page();
    expect(isElementLike(result)).toBe(true);

    // Both calls should receive undefined as userId
    expect(getCachedAllTransactionsMock).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactionsMock?.mock.calls[0]?.[0]).toBeUndefined();
    expect(getCachedAllTransactionsMock?.mock.calls[1]?.[0]).toBeUndefined();

    const content = (result as ElementLike).props?.contentNearby as unknown;
    const noTxEl = findElementByType(content, noTransactionsPlugComponentRef);
    expect(noTxEl).not.toBeNull();
  });

  test("throws when getCachedAllTransactions rejects (second awaited call rejects)", async (): Promise<void> => {
    const mod = await import("app/export/page");
    const Page = mod.default as () => Promise<unknown>;

    const session = { user: { email: "user@example.com" } } as Record<
      string,
      unknown
    >;
    getCachedAuthSessionMock?.mockResolvedValue(session);

    // First call (non-awaited) resolves to avoid unhandled rejection, second (awaited) rejects
    getCachedAllTransactionsMock
      ?.mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("fetch-failed"));

    await expect(Page()).rejects.toThrow("fetch-failed");
  });

  test("throws when getCachedAuthSession throws synchronously on first call", async (): Promise<void> => {
    const mod = await import("app/export/page");
    const Page = mod.default as () => Promise<unknown>;

    // First call throws sync, which should cause Page to reject immediately
    const syncErr = new Error("session-failed");
    getCachedAuthSessionMock
      // first call: throw
      ?.mockImplementationOnce((): never => {
        throw syncErr;
      })
      // second call (if it ever happens) resolve
      ?.mockResolvedValueOnce({ user: { email: "user@example.com" } } as Record<
        string,
        unknown
      >);

    await expect(Page()).rejects.toThrow("session-failed");
  });

  test("onExport propagates error from getTransactionsForExport and handles undefined dates", async (): Promise<void> => {
    const mod = await import("app/export/page");
    const Page = mod.default as () => Promise<unknown>;

    const session = { user: { email: "user@example.com" } } as Record<
      string,
      unknown
    >;
    const transactions = [{ id: "t2" } as Record<string, unknown>];
    getCachedAuthSessionMock?.mockResolvedValue(session);
    getCachedAllTransactionsMock?.mockResolvedValue(transactions);

    const error = new Error("export-failed");
    getTransactionsForExportMock?.mockRejectedValue(error);

    const result = await Page();
    const content = (result as ElementLike).props?.contentNearby as unknown;
    const exportEl = findElementByType(content, exportTransactionsComponentRef);
    expect(exportEl).not.toBeNull();

    const exportProps = (exportEl as ElementLike).props ?? {};
    const onExport = exportProps.onExport as (
      a?: Date,
      b?: Date,
    ) => Promise<unknown[]>;

    await expect(onExport()).rejects.toThrow("export-failed");
    expect(getTransactionsForExportMock).toHaveBeenCalledTimes(1);
    // Should be called with userId and undefined dates
    expect(getTransactionsForExportMock).toHaveBeenCalledWith(
      "user@example.com",
      undefined,
      undefined,
    );
  });

  test("renders heading with NAV_TITLE.EXPORT", async (): Promise<void> => {
    const mod = await import("app/export/page");
    const Page = mod.default as () => Promise<unknown>;

    getCachedAuthSessionMock?.mockResolvedValue({
      user: { email: "u@e.com" },
    } as Record<string, unknown>);
    getCachedAllTransactionsMock?.mockResolvedValue([]);

    const result = await Page();
    const content = (result as ElementLike).props?.contentNearby as unknown;
    const headingEl = findElementByTypeString(content, "h1");
    expect(headingEl).not.toBeNull();

    const headingChildren = getChildrenArray(headingEl as ElementLike);
    // One of the children should be 'Export'
    const hasExportText = headingChildren.some(
      (c) => typeof c === "string" && c.includes("Export"),
    );
    expect(hasExportText).toBe(true);
  });
});
