#!/usr/bin/env node
/**
 * TUI-like minimal runner: 시나리오 선택 → Playwright 실행
 * 환경 변수:
 *  - E2E_PROJECT_ID (필수)
 *  - BASE_URL (선택, playwright.config.cjs의 baseURL 대체 시)
 */

const { spawn } = require("child_process");
const path = require("path");
const inquirer = require("inquirer");

const scenarios = [
  { name: "01_project_init", file: "tests/e2e/01_project_init.spec.js" },
  { name: "02_asset_upload", file: "tests/e2e/02_asset_upload.spec.js" },
  { name: "03_data_save", file: "tests/e2e/03_data_save.spec.js" },
  { name: "04_asset_replace_restore", file: "tests/e2e/04_asset_replace_restore.spec.js" },
  { name: "05_restore_assert", file: "tests/e2e/05_restore_assert.spec.js" },
  { name: "ALL", file: "" },
];

async function main() {
  const projectId = process.env.E2E_PROJECT_ID;
  if (!projectId) {
    console.error("E2E_PROJECT_ID가 필요합니다.");
    process.exit(1);
  }

  const { choice } = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "실행할 E2E 시나리오를 선택하세요",
      choices: scenarios.map((s) => s.name),
    },
  ]);

  const selected = scenarios.find((s) => s.name === choice);
  const args = ["test"];
  if (selected && selected.file) {
    args.push(selected.file);
  }

  const proc = spawn("npx", ["playwright", ...args], {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
  });

  proc.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
