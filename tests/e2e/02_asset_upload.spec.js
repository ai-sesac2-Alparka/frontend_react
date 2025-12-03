import { test, expect } from "@playwright/test";

// Step 2: 자산 업로드 및 리스트 노출
const projectId = process.env.E2E_PROJECT_ID || "p-123";

test.describe("E2E: 자산 업로드/리스트", () => {
  test("업로드 후 리스트와 메타 노출", async ({ page }) => {
    await page.goto(`/gamestudio?projectId=${projectId}`);
    await expect(page.getByRole("combobox")).toBeVisible({ timeout: 15000 });

    // 파일 업로드
    const fileInput = page.getByLabel("파일 선택", { exact: true });
    await fileInput.setInputFiles("tests/fixtures/sample.png");

    // 리스트에 파일명 노출
    await expect(page.getByText("sample.png")).toBeVisible({ timeout: 15000 });

    // 메타 확인(모달) - 다운로드 링크 없음
    await page.getByText("sample.png").click();
    await expect(page.getByText("SHA256")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("projects/")).toBeVisible();
  });
});
