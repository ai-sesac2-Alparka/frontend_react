import { test, expect, request } from "@playwright/test";

test.setTimeout(120000);

const API_BASE = process.env.VITE_API_BASE || "http://localhost:8000";
const USER_ID = "00000000-0000-0000-0000-000000000000";
const REQUEST_TIMEOUT = 60000;
const PNG_BUF = Buffer.from(
  "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360F8FFFF3F0005FE02FEA7D20D570000000049454E44AE426082",
  "hex",
);
const PNG_BUF2 = Buffer.from(
  "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000100FFFF03000006000557BF0000000049454E44AE426082",
  "hex",
);

test("resolve → draft → upload → list → replace → snapshot/restore → chat", async () => {
  const ctx = await request.newContext({
    baseURL: API_BASE,
    timeout: REQUEST_TIMEOUT,
  });

  // 1) 프로젝트 확보
  const title = `e2e-${Date.now()}`;
  const resolveRes = await ctx.get("api/v1/projects/resolve", {
    params: { title, create_if_missing: true, user_id: USER_ID },
    timeout: REQUEST_TIMEOUT,
  });
  expect(resolveRes.ok()).toBeTruthy();
  const projectId = (await resolveRes.json()).id;
  expect(projectId).toBeTruthy();

  // 2) 드래프트 로드
  const draftRes = await ctx.get(`api/v1/projects/${projectId}/draft`, {
    timeout: REQUEST_TIMEOUT,
  });
  expect(draftRes.ok()).toBeTruthy();

  // 3) 더미 이미지 업로드
  const uploadRes = await ctx.post("api/v1/upload", {
    multipart: {
      file: {
        name: "generated.png",
        mimeType: "image/png",
        buffer: PNG_BUF,
      },
      type: "image",
      project_id: projectId,
      name: "generated.png",
    },
    timeout: REQUEST_TIMEOUT,
  });
  expect(uploadRes.ok()).toBeTruthy();
  const uploadJson = await uploadRes.json();

  // 4) 에셋 리스트
  const listRes = await ctx.get("api/v1/assets", {
    params: { project_id: projectId },
    timeout: REQUEST_TIMEOUT,
  });
  expect(listRes.ok()).toBeTruthy();
  const assets = await listRes.json();
  const firstImage =
    assets.images?.[0] || uploadJson?.asset || uploadJson?.assets?.images?.[0];
  const imageId = firstImage?.id || uploadJson?.id;
  expect(imageId).toBeTruthy();

  // 5) 교체
  const replaceRes = await ctx.post(`api/v1/assets/${imageId}/replace`, {
    multipart: {
      file: {
        name: "replace.png",
        mimeType: "image/png",
        buffer: PNG_BUF2,
      },
      type: "image",
      project_id: projectId,
      name: "replace.png",
    },
    timeout: REQUEST_TIMEOUT,
  });
  expect(replaceRes.ok()).toBeTruthy();

  // 6) 스냅샷 생성/복원
  const snapRes = await ctx.post(`api/v1/projects/${projectId}/snapshot`, {
    data: { data: { checkpoint: "e2e" } },
    timeout: REQUEST_TIMEOUT,
  });
  expect(snapRes.ok()).toBeTruthy();
  const logRes = await ctx.get("api/v1/snapshot-log", {
    params: { project_id: projectId },
    timeout: REQUEST_TIMEOUT,
  });
  expect(logRes.ok()).toBeTruthy();
  const logJson = await logRes.json();
  const latest = logJson.versions?.[0]?.version;
  if (latest) {
    const restoreRes = await ctx.post("api/v1/restore-version", {
      data: { project_id: projectId, version: latest },
      timeout: REQUEST_TIMEOUT,
    });
    expect(restoreRes.ok()).toBeTruthy();
  }

  // 7) 채팅 컨텍스트
  const chatRes = await ctx.post("api/v1/generate/", {
    data: {
      prompt: "hello",
      context: {
        project_id: projectId,
        context_entity_id: "entity-1",
        task_type: "CHAT",
      },
    },
    timeout: REQUEST_TIMEOUT,
  });
  expect(chatRes.ok()).toBeTruthy();
});
