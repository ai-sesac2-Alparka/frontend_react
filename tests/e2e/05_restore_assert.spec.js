import { test, expect } from "@playwright/test";

// Step 5: 스냅샷/복원 결과를 자산 리스트와 함께 검증
const projectId = process.env.E2E_PROJECT_ID || "p-123";

test.describe("E2E: 스냅샷 복원 검증", () => {
  test("restore 이후 snapshot-log/자산 리스트가 반환되는지 확인", async ({
    page,
  }) => {
    await page.goto(`/gamestudio?projectId=${projectId}`);
    await expect(page.getByRole("combobox")).toBeVisible({ timeout: 15000 });

    // 되돌리기 버튼이 있는 경우 클릭
    const revertButton = page.getByText("최근 변경사항 되돌리기");
    if (await revertButton.isVisible()) {
      await revertButton.click();
    }

    // 스냅샷 로그 목록이 노출되었는지 확인 (텍스트 "버전" 또는 version 아이템)
    // UI에 따라 수정 필요: 여기서는 버전 목록이 렌더되는지 간단히 체크
    await expect(page.getByText("버전")).toBeVisible({ timeout: 15000 });

    // 자산 리스트가 여전히 노출되는지 확인
    await expect(page.getByText("sample.png")).toBeVisible({ timeout: 15000 });
  });
});
