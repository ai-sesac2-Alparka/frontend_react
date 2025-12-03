import { quadrakillApi, backendApi } from "./index";

const normalizeLegacyTarget = (target) => {
  if (typeof target === "string") {
    return { projectId: target || "" };
  }
  if (!target) {
    return { projectId: "" };
  }

  return {
    projectId: target.projectId || target.project_id || "",
    version: target.version,
    data: target.data,
    payload: target.payload,
  };
};

/**
 * Adapter for Quadrakill unified backend.
 * Keeps surface minimal to ease migration from legacy endpoints.
 */
export const quadrakillAdapter = {
  wizard: {
    draft: (prompt, tags = []) =>
      quadrakillApi.post("/wizard/draft/", { prompt, tags }),
    plan: (userQuery) =>
      quadrakillApi.post("/wizard/plan/", { user_query: userQuery }),
    construct: (options, platform = "3d") =>
      quadrakillApi.post("/wizard/construct/", { options, platform }),
  },
  ai2d: {
    spriteSheet: (prompt, style = "pixel", worldType) =>
      quadrakillApi.post("/ai-2d/sprite-sheet", {
        prompt,
        style,
        world_type: worldType,
      }),
    refineMotion: (originalImage, modelType = "flash") =>
      quadrakillApi.post("/ai-2d/refine-motion", {
        original_image: originalImage,
        model_type: modelType,
      }),
  },
  generate: {
    run: (prompt, context = {}) =>
      quadrakillApi.post("/generate/", { prompt, context }),
  },
  projects: {
    create: (title, userId = "user-1") =>
      quadrakillApi.post("/projects/", { title, user_id: userId }),
    resolve: (title, { create = false, userId = "user-1" } = {}) =>
      quadrakillApi.get("/projects/resolve", {
        params: {
          title,
          create_if_missing: create,
          user_id: userId,
        },
      }),
    draft: (projectId) => quadrakillApi.get(`/projects/${projectId}/draft`),
    bootstrap: (projectId) =>
      quadrakillApi.post(`/projects/${projectId}/bootstrap`),
  },
  assets: {
    upload: ({ file, type = "raw", projectId, name }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      if (projectId) form.append("project_id", projectId);
      if (name) form.append("name", name);
      return quadrakillApi.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    replace: ({ assetId, file, type = "raw", projectId, name }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("type", type);
      if (projectId) form.append("project_id", projectId);
      if (name) form.append("name", name);
      return quadrakillApi.post(`/assets/${assetId}/replace`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
  },
  legacy: {
    restoreVersion: (target, versionOverride) => {
      const ctx = normalizeLegacyTarget(target);
      const version = versionOverride ?? ctx.version;
      return backendApi.post("/restore-version", {
        version,
        project_id: ctx.projectId,
      });
    },
    snapshotLog: (target) => {
      const ctx = normalizeLegacyTarget(target);
      return backendApi.get("/snapshot-log", {
        params: {
          project_id: ctx.projectId,
          _t: Date.now(),
        },
        headers: { "Cache-Control": "no-cache" },
      });
    },
    gameData: (target) => {
      const ctx = normalizeLegacyTarget(target);
      return backendApi.get("/game_data", {
        params: {
          project_id: ctx.projectId,
          _t: Date.now(),
        },
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      });
    },
    chat: (target) => {
      const ctx = normalizeLegacyTarget(target);
      return backendApi.get("/load-chat", {
        params: {
          game_name: ctx.gameName || "",
          project_id: ctx.projectId,
          _t: Date.now(),
        },
        headers: { "Cache-Control": "no-cache" },
      });
    },
    assets: (target) => {
      const ctx = normalizeLegacyTarget(target);
      return backendApi.get("/assets", {
        params: {
          game_name: ctx.gameName || "",
          project_id: ctx.projectId,
          _t: Date.now(),
        },
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      });
    },
    dataUpdate: (target, dataOverride) => {
      const ctx = normalizeLegacyTarget(target);
      const data = dataOverride ?? ctx.data;
      return backendApi.post(
        "/data-update",
        { project_id: ctx.projectId, data },
        { headers: { "Content-Type": "application/json" } },
      );
    },
    clientError: (payload) => backendApi.post("/client-error", payload),
    revert: (target) => {
      const ctx = normalizeLegacyTarget(target);
      return backendApi.post("/revert", {
        project_id: ctx.projectId,
      });
    },
    answer: (questionId, answer) =>
      backendApi.post("/answer", { questionId, answer }),
    qna: (target, payloadOverride) => {
      const ctx = normalizeLegacyTarget(target);
      const payload = payloadOverride ?? ctx.payload;
      return backendApi.post("/qna", {
        project_id: ctx.projectId,
        payload,
      });
    },
    specQuestion: (target, message) => {
      const ctx = normalizeLegacyTarget(target);
      return backendApi.post("/spec-question", {
        project_id: ctx.projectId,
        message,
      });
    },
  },
};
