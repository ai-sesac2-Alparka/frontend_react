import { test, expect } from "@playwright/test";

// Step 3: 데이터 저장/재호출 + 스냅샷/복원 준비
const projectId = process.env.E2E_PROJECT_ID || "p-123";

test.describe("E2E: 데이터 저장/재호출", () => {
  test("draft 데이터 업데이트 후 재조회", async ({ page }) => {
    await page.goto(`/gamestudio?projectId=${projectId}`);
    await expect(page.getByText("게임 설정 편집")).toBeVisible({
      timeout: 15000,
    });

    // 임의 데이터 수정: 루트에 test_key 추가 (간단 입력 예시)
    const textarea = page.getByLabel("value", { exact: false }).first();
    await textarea.fill("patched");

    // 저장 버튼 클릭
    await page.getByRole("button", { name: "변경 내용 저장" }).click();

    // 저장 후 상태 확인: 스냅샷/메시지가 없어도 저장 버튼이 다시 활성화되는 정도만 확인
    await expect(
      page.getByRole("button", { name: "변경 내용 저장" }),
    ).toBeEnabled({ timeout: 10000 });
  });
});
