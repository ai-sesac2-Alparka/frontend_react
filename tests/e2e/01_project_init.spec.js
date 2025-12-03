import { test, expect } from "@playwright/test";

// Step 1: 프로젝트 resolve 및 draft 초기 상태 확인
const projectId = process.env.E2E_PROJECT_ID || "p-123";

test.describe("E2E: 프로젝트 초기화", () => {
  test("프로젝트 resolve 후 draft 기본 로드", async ({ page }) => {
    await page.goto(`/gamestudio?projectId=${projectId}`);

    // 필수 UI 요소가 렌더될 때까지 대기 (project resolve 완료 기준)
    await expect(page.getByRole("combobox")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("게임 설정 편집")).toBeVisible();
  });
});
