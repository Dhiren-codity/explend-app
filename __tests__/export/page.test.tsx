import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import Page from "./app/export/page";

vi.mock("@/config/constants/navigation", (): Record<string, unknown> => {
  return {
    NAV_TITLE: { EXPORT: "Export" },
  };
});

vi.mock("../lib/actions", (): Record<string, unknown> => {
  const getCachedAuthSession = vi.fn();
  const getCachedAllTransactions = vi.fn();
  const getTransactionsForExport = vi.fn();

  (globalThis as unknown as Record<string, unknown>).__actionsMocks = {
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  };

  return {
    getCachedAuthSession,
    getCachedAllTransactions,
    getTransactionsForExport,
  };
});

vi.mock("../ui/home/export-transactions", (): Record<string, unknown> => {
  function ExportTransactions(_props: Record<string, unknown>): null {
    return null;
  }
  return { default: ExportTransactions };
});

vi.mock("../ui/no-transactions-plug", (): Record<string, unknown> => {
  function NoTransactionsPlug(): null {
    return null;
  }
  return { default: NoTransactionsPlug };
});

vi.mock("../ui/sidebar/with-sidebar", (): Record<string, unknown> => {
  function WithSidebar(_props: Record<string, unknown>): null {
    return null;
  }
  return { default: WithSidebar };
});

describe("Page", (): void => {
  type ActionsMocks = {
    getCachedAuthSession: ReturnType<typeof vi.fn>;
    getCachedAllTransactions: ReturnType<typeof vi.fn>;
    getTransactionsForExport: ReturnType<typeof vi.fn>;
  };

  const getActionsMocks = (): ActionsMocks => {
    return (globalThis as unknown as { __actionsMocks: ActionsMocks })
      .__actionsMocks;
  };

  beforeEach((): void => {
    const actions = getActionsMocks();
    actions.getCachedAuthSession.mockReset();
    actions.getCachedAllTransactions.mockReset();
    actions.getTransactionsForExport.mockReset();
  });

  afterEach((): void => {
    vi.clearAllMocks();
  });

  test("should render ExportTransactions with transactions and handleExport calls getTransactionsForExport", async (): Promise<void> => {
    const actions = getActionsMocks();
    const userId = "user@example.com";
    const transactionsValue: Record<string, unknown>[] = [{ id: "1" }];

    actions.getCachedAuthSession.mockResolvedValue({ user: { email: userId } });
    actions.getCachedAllTransactions.mockResolvedValue(transactionsValue);
    const exportReturn: Record<string, unknown>[] = [{ id: "exp-1" }];
    actions.getTransactionsForExport.mockResolvedValue(exportReturn);

    const result = await Page();
    const withSidebarElement = result as unknown as {
      type: unknown;
      props: Record<string, unknown>;
    };
    expect(withSidebarElement).toBeDefined();
    expect(withSidebarElement.props).toBeDefined();

    const contentNearby = withSidebarElement.props.contentNearby as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const fragmentChildren = contentNearby.props.children as unknown[];
    const h1Element = fragmentChildren[0] as {
      type: unknown;
      props: Record<string, unknown>;
    };
    expect(h1Element.type).toBe("h1");
    expect(h1Element.props.children).toBe("Export");

    const contentContainer = fragmentChildren[1] as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const innerChild = contentContainer.props.children as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const innerTypeName = (innerChild.type as { name?: string }).name;
    expect(innerTypeName).toBe("ExportTransactions");

    const passedTransactions = innerChild.props.transactions as unknown[];
    expect(passedTransactions).toBe(transactionsValue);

    const onExport = innerChild.props.onExport as (
      start?: Date,
      end?: Date,
    ) => Promise<unknown[]>;
    const start = new Date("2020-01-01T00:00:00.000Z");
    const end = new Date("2020-12-31T23:59:59.999Z");
    const onExportResult = await onExport(start, end);
    expect(onExportResult).toBe(exportReturn);

    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(1, userId);
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(2, userId);
    expect(actions.getTransactionsForExport).toHaveBeenCalledTimes(1);
    expect(actions.getTransactionsForExport).toHaveBeenCalledWith(
      userId,
      start,
      end,
    );
  });

  test("should render NoTransactionsPlug when transactions array is empty", async (): Promise<void> => {
    const actions = getActionsMocks();
    actions.getCachedAuthSession.mockResolvedValue({
      user: { email: "user@example.com" },
    });
    actions.getCachedAllTransactions.mockResolvedValue([]);

    const result = await Page();
    const withSidebarElement = result as unknown as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const contentNearby = withSidebarElement.props.contentNearby as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const fragmentChildren = contentNearby.props.children as unknown[];
    const contentContainer = fragmentChildren[1] as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const innerChild = contentContainer.props.children as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const innerTypeName = (innerChild.type as { name?: string }).name;

    expect(innerTypeName).toBe("NoTransactionsPlug");
    expect(actions.getCachedAuthSession).toHaveBeenCalledTimes(2);
    expect(actions.getCachedAllTransactions).toHaveBeenCalledTimes(2);
  });

  test("should handle undefined session (no userId) and still export with undefined userId", async (): Promise<void> => {
    const actions = getActionsMocks();
    const transactionsValue: Record<string, unknown>[] = [{ id: "2" }];

    actions.getCachedAuthSession.mockResolvedValue(undefined);
    actions.getCachedAllTransactions.mockResolvedValue(transactionsValue);
    const exportReturn: Record<string, unknown>[] = [{ id: "exp-2" }];
    actions.getTransactionsForExport.mockResolvedValue(exportReturn);

    const result = await Page();
    const withSidebarElement = result as unknown as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const contentNearby = withSidebarElement.props.contentNearby as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const fragmentChildren = contentNearby.props.children as unknown[];
    const contentContainer = fragmentChildren[1] as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const innerChild = contentContainer.props.children as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const innerTypeName = (innerChild.type as { name?: string }).name;
    expect(innerTypeName).toBe("ExportTransactions");

    const onExport = innerChild.props.onExport as (
      start?: Date,
      end?: Date,
    ) => Promise<unknown[]>;
    const start = new Date("2021-01-01T00:00:00.000Z");
    const end = new Date("2021-12-31T23:59:59.999Z");
    const onExportResult = await onExport(start, end);
    expect(onExportResult).toBe(exportReturn);

    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(
      1,
      undefined,
    );
    expect(actions.getCachedAllTransactions).toHaveBeenNthCalledWith(
      2,
      undefined,
    );
    expect(actions.getTransactionsForExport).toHaveBeenCalledWith(
      undefined,
      start,
      end,
    );
  });

  test("should propagate error when getCachedAllTransactions rejects", async (): Promise<void> => {
    const actions = getActionsMocks();
    actions.getCachedAuthSession.mockResolvedValue({
      user: { email: "user@example.com" },
    });
    actions.getCachedAllTransactions.mockResolvedValueOnce([] as unknown[]);
    actions.getCachedAllTransactions.mockRejectedValueOnce(new Error("boom"));

    await expect(Page()).rejects.toThrow("boom");
  });

  test("should propagate error when handleExport (getTransactionsForExport) rejects", async (): Promise<void> => {
    const actions = getActionsMocks();
    const userId = "user@example.com";
    const transactionsValue: Record<string, unknown>[] = [{ id: "3" }];

    actions.getCachedAuthSession.mockResolvedValue({ user: { email: userId } });
    actions.getCachedAllTransactions.mockResolvedValue(transactionsValue);
    actions.getTransactionsForExport.mockRejectedValue(
      new Error("export fail"),
    );

    const result = await Page();
    const withSidebarElement = result as unknown as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const contentNearby = withSidebarElement.props.contentNearby as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const fragmentChildren = contentNearby.props.children as unknown[];
    const contentContainer = fragmentChildren[1] as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const innerChild = contentContainer.props.children as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const onExport = innerChild.props.onExport as (
      start?: Date,
      end?: Date,
    ) => Promise<unknown[]>;

    await expect(onExport(undefined, undefined)).rejects.toThrow("export fail");
    expect(actions.getTransactionsForExport).toHaveBeenCalledWith(
      userId,
      undefined,
      undefined,
    );
  });
});
