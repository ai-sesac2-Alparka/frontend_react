import { describe, it, expect, vi, afterEach } from "vitest";

const postMock = vi.fn();
const getMock = vi.fn();

vi.mock("./index", () => ({
  quadrakillApi: {
    post: vi.fn(),
    get: vi.fn(),
  },
  backendApi: {
    post: postMock,
    get: getMock,
  },
}));

// FormData shim for node/jsdom
global.FormData = class FormData {
  constructor() {
    this._data = {};
  }
  append(k, v) {
    this._data[k] = v;
  }
};

describe("quadrakillAdapter legacy helpers", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes project_id for snapshotLog", async () => {
    const { quadrakillAdapter: adapter } = await import("./quadrakillAdapter");
    adapter.legacy.snapshotLog({ projectId: "p-123" });
    expect(getMock).toHaveBeenCalledWith("/snapshot-log", {
      params: { game_name: "", project_id: "p-123", _t: expect.any(Number) },
      headers: { "Cache-Control": "no-cache" },
    });
  });

  it("passes project_id for restoreVersion", async () => {
    const { quadrakillAdapter: adapter } = await import("./quadrakillAdapter");
    adapter.legacy.restoreVersion({ projectId: "p-123" }, "v1");
    expect(postMock).toHaveBeenCalledWith("/restore-version", {
      version: "v1",
      project_id: "p-123",
      game_name: "",
    });
  });
});
