import React from "react";
import { render, act, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAssets } from "./useAssets";

vi.mock("../api/backend", () => ({
  getGameAssets: vi.fn(),
  replaceAsset: vi.fn(),
  getSnapshotLog: vi.fn(),
  getGameData: vi.fn(),
}));

const backend = await import("../api/backend");

describe("useAssets", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const setup = (target) => {
    let hook;
    const Wrapper = () => {
      hook = useAssets(target);
      return null;
    };
    render(<Wrapper />);
    return () => hook;
  };

  it("maps assets with metadata and labels", async () => {
    backend.getGameAssets.mockResolvedValue({
      data: {
        images: [
          {
            name: "bg.png",
            url: "/static/bg.png",
            asset_type: "background",
            storage_path: "projects/p1/assets/bg/2025/02/02/uuid_bg.png",
            project_id: "p1",
            metadata: { checksum_sha256: "abcdef1234567890" },
          },
        ],
        sounds: [
          {
            name: "bgm.mp3",
            url: "/static/bgm.mp3",
            asset_type: "soundtrack",
            storage_path: "projects/p1/assets/audio/2025/02/02/uuid_bgm.mp3",
            project_id: "p1",
            metadata: { checksum_sha256: "1234deadbeef" },
          },
        ],
      },
    });

    const getHook = setup({ projectId: "p1", gameName: "demo" });

    let assets;
    await act(async () => {
      assets = await getHook().fetchAssets();
    });

    expect(backend.getGameAssets).toHaveBeenCalledWith({
      projectId: "p1",
      gameName: "demo",
    });
    expect(assets).toHaveLength(2);

    const img = assets.find((a) => a.type === "background");
    expect(img).toMatchObject({
      name: "bg.png",
      projectId: "p1",
      storagePath: "projects/p1/assets/bg/2025/02/02/uuid_bg.png",
      label: "background",
      kind: "image",
    });
    expect(img.checksum).toBe("abcdef1234567890");

    const snd = assets.find((a) => a.type === "soundtrack");
    expect(snd).toMatchObject({
      name: "bgm.mp3",
      projectId: "p1",
      storagePath: "projects/p1/assets/audio/2025/02/02/uuid_bgm.mp3",
      label: "soundtrack",
      kind: "sound",
    });
    expect(snd.checksum).toBe("1234deadbeef");
  });

  it("returns empty when no target provided", async () => {
    const getHook = setup(null);
    let assets;
    await act(async () => {
      assets = await getHook().fetchAssets();
    });
    expect(assets).toEqual([]);
    expect(backend.getGameAssets).not.toHaveBeenCalled();
  });
});
