import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock(
  "@/config/constants/navigation",
  (): Record<string, unknown> => {
    return {
      NAV_TITLE: { EXPORT: "Export" },
    };
  },
  { virtual: true },
);

vi.mock(
  "../lib/actions",
  (): Record<string, unknown> => {
    return {
      getCachedAllTransactions: vi.fn(),
      getCachedAuthSession: vi.fn(),
      getTransactionsForExport: vi.fn(),
    };
  },
  { virtual: true },
);

vi.mock(
  "../ui/home/export-transactions",
  (): Record<string, unknown> => {
    const MockExportTransactions = function MockExportTransactions(
      _props: Record<string, unknown>,
    ): null {
      return null;
    };
    return { default: MockExportTransactions };
  },
  { virtual: true },
);

vi.mock(
  "../ui/no-transactions-plug",
  (): Record<string, unknown> => {
    const MockNoTransactionsPlug = function MockNoTransactionsPlug(): null {
      return null;
    };
    return { default: MockNoTransactionsPlug };
  },
  { virtual: true },
);

vi.mock(
  "../ui/sidebar/with-sidebar",
  (): Record<string, unknown> => {
    const MockWithSidebar = function MockWithSidebar(
      _props: Record<string, unknown>,
    ): null {
      return null;
    };
    return { default: MockWithSidebar };
  },
  { virtual: true },
);

import ExportTransactionsMock from "../ui/home/export-transactions";
import NoTransactionsPlugMock from "../ui/no-transactions-plug";
import WithSidebarMock from "../ui/sidebar/with-sidebar";
import {
  getCachedAllTransactions,
  getCachedAuthSession,
  getTransactionsForExport,
} from "../lib/actions";

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

const getChildrenArray = (node: ElementLike): unknown[] => {
  const props = node.props;
  const children = props?.children;
  if (Array.isArray(children)) {
    return children;
  }
  if (children === undefined || children === null) {
    return [];
  }
  return [children];
};

const flattenElements = (node: unknown): ElementLike[] => {
  const results: ElementLike[] = [];
  const stack: unknown[] = [node];

  while (stack.length > 0) {
    const current = stack.pop() as unknown;
    if (isElementLike(current)) {
      results.push(current);
      const children = getChildrenArray(current);
      for (const child of children) {
        stack.push(child);
      }
    } else if (Array.isArray(current)) {
      for (const child of current) {
        stack.push(child);
      }
    }
  }

  return results;
};

describe("Page", (): void => {
  let Page: (() => Promise<unknown>) | null = null;

  beforeEach(async (): Promise<void> => {
    // Reset implementation defaults before each test
    (getCachedAuthSession as unknown as ReturnType<typeof vi.fn>).mockReset();
    (
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>
    ).mockReset();
    (
      getTransactionsForExport as unknown as ReturnType<typeof vi.fn>
    ).mockReset();

    (
      getCachedAuthSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      user: { email: "alice@example.com" },
    });
    (
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([{ id: "t1" }, { id: "t2" }]);
    (
      getTransactionsForExport as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue([{ id: "e1" }]);

    const mod = await import("./page");
    Page = mod.default as () => Promise<unknown>;
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test("renders WithSidebar and ExportTransactions with transactions; wires onExport to getTransactionsForExport", async (): Promise<void> => {
    const result = await (Page as () => Promise<unknown>)();
    expect(result).toBeDefined();
    expect(isElementLike(result)).toBe(true);

    const top = result as ElementLike;
    expect(top.type).toBe(WithSidebarMock);

    const contentNearby = top.props?.contentNearby as unknown;
    expect(isElementLike(contentNearby)).toBe(true);

    const allElements = flattenElements(contentNearby);
    const exportTransactionsElements = allElements.filter(
      (el) => el.type === ExportTransactionsMock,
    );
    expect(exportTransactionsElements.length).toBe(1);

    const exportEl = exportTransactionsElements[0];
    const transactionsProp = exportEl.props?.transactions as unknown[];
    expect(Array.isArray(transactionsProp)).toBe(true);
    expect(transactionsProp?.length).toBe(2);

    const onExport = exportEl.props?.onExport as unknown;
    expect(typeof onExport).toBe("function");

    const startDate = new Date("2020-01-01T00:00:00.000Z");
    const endDate = new Date("2020-12-31T23:59:59.999Z");

    const exported = await (
      onExport as (s?: Date, e?: Date) => Promise<unknown[]>
    )(startDate, endDate);
    expect(getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(getTransactionsForExport).toHaveBeenCalledWith(
      "alice@example.com",
      startDate,
      endDate,
    );
    expect(Array.isArray(exported)).toBe(true);
    expect((exported as unknown[]).length).toBe(1);

    // Called twice for caching behavior
    expect(getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenNthCalledWith(1, "alice@example.com");
    expect(
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenNthCalledWith(2, "alice@example.com");

    // Ensure the heading h1 with NAV_TITLE.EXPORT exists
    const h1Elements = allElements.filter((el) => el.type === "h1");
    expect(h1Elements.length).toBe(1);
    const h1Children = getChildrenArray(h1Elements[0]);
    const h1Text = h1Children.find((c) => typeof c === "string") as
      | string
      | undefined;
    expect(h1Text).toBe("Export");
  });

  test("renders NoTransactionsPlug when there are no transactions", async (): Promise<void> => {
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await (Page as () => Promise<unknown>)();
    expect(isElementLike(result)).toBe(true);
    const top = result as ElementLike;
    const contentNearby = top.props?.contentNearby as unknown;
    expect(isElementLike(contentNearby)).toBe(true);

    const allElements = flattenElements(contentNearby);
    const noTxElements = allElements.filter(
      (el) => el.type === NoTransactionsPlugMock,
    );
    const exportTxElements = allElements.filter(
      (el) => el.type === ExportTransactionsMock,
    );

    expect(noTxElements.length).toBe(1);
    expect(exportTxElements.length).toBe(0);
  });


    // still return a non-empty transactions list so ExportTransactions renders
    (getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([{ id: "t1" }])
      .mockResolvedValueOnce([{ id: "t1" }]);

    const result = await (Page as () => Promise<unknown>)();
    expect(isElementLike(result)).toBe(true);

    const top = result as ElementLike;
    const contentNearby = top.props?.contentNearby as unknown;
    expect(isElementLike(contentNearby)).toBe(true);

    const allElements = flattenElements(contentNearby);
    const exportTransactionsElements = allElements.filter(
      (el) => el.type === ExportTransactionsMock,
    );
    expect(exportTransactionsElements.length).toBe(1);

    const exportEl = exportTransactionsElements[0];
    const onExport = exportEl.props?.onExport as unknown;
    expect(typeof onExport).toBe("function");

    const startDate = new Date("2021-01-01T00:00:00.000Z");
    const endDate = new Date("2021-06-30T23:59:59.999Z");
    await (onExport as (s?: Date, e?: Date) => Promise<unknown[]>)(
      startDate,
      endDate,
    );

    expect(getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenNthCalledWith(1, undefined);
    expect(
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>,
    ).toHaveBeenNthCalledWith(2, undefined);
    expect(getTransactionsForExport).toHaveBeenCalledWith(
      undefined,
      startDate,
      endDate,
    );
  });

  test("propagates error when getCachedAuthSession rejects", async (): Promise<void> => {
    (
      getCachedAuthSession as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("auth failed"));
    await expect((Page as () => Promise<unknown>)()).rejects.toThrow(
      "auth failed",
    );
  });

  test("propagates error when getCachedAllTransactions rejects", async (): Promise<void> => {
    (
      getCachedAllTransactions as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("db fail"));
    await expect((Page as () => Promise<unknown>)()).rejects.toThrow("db fail");
  });

      .mockResolvedValueOnce([{ id: "t1" }]);
    (
      getTransactionsForExport as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValueOnce(new Error("export fail"));

    const result = await (Page as () => Promise<unknown>)();
    expect(isElementLike(result)).toBe(true);

    const top = result as ElementLike;
    const contentNearby = top.props?.contentNearby as unknown;
    expect(isElementLike(contentNearby)).toBe(true);

    const allElements = flattenElements(contentNearby);
    const exportTransactionsElements = allElements.filter(
      (el) => el.type === ExportTransactionsMock,
    );
    expect(exportTransactionsElements.length).toBe(1);

    const exportEl = exportTransactionsElements[0];
    const onExport = exportEl.props?.onExport as unknown;
    expect(typeof onExport).toBe("function");

    await expect(
      (onExport as (s?: Date, e?: Date) => Promise<unknown[]>)(
        undefined,
        undefined,
      ),
    ).rejects.toThrow("export fail");
  });
});
