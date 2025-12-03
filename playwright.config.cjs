/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    headless: true,
    baseURL: 'http://localhost:4173',
  },
};

module.exports = config;
