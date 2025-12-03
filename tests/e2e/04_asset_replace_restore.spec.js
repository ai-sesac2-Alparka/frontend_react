import { test, expect } from "@playwright/test";

// Step 4: 자산 교체 및 메타 갱신 확인, 복원까지 검증
const projectId = process.env.E2E_PROJECT_ID || "p-123";

test.describe("E2E: 자산 교체/메타 갱신", () => {
  test("교체 후 리스트와 메타가 갱신되는지 확인", async ({ page }) => {
    await page.goto(`/gamestudio?projectId=${projectId}`);
    await expect(page.getByRole("combobox")).toBeVisible({ timeout: 15000 });

    // 기존 자산 선택
    const assetCard = page.getByRole("button", { name: /sample\.png/i });
    await assetCard.click();

    // 교체 파일 업로드
    const replaceInput = page.getByLabel("파일 선택", { exact: true });
    await replaceInput.setInputFiles("tests/fixtures/sample.png");

    // 리스트 재호출 후 메타가 갱신되는지 확인
    await page.reload();
    await expect(page.getByText("sample.png")).toBeVisible({ timeout: 15000 });
    await page.getByText("sample.png").click();
    await expect(page.getByText("SHA256")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("projects/")).toBeVisible();

    // restore 트리거: revert 버튼이 있으면 클릭 후 리스트 확인
    const revertButton = page.getByText("최근 변경사항 되돌리기");
    if (await revertButton.isVisible()) {
      await revertButton.click();
      await expect(page.getByText("sample.png")).toBeVisible({
        timeout: 15000,
      });
    }
  });
});
