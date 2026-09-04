const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');

async function openModal(window, triggerSelector, modalSelector) {
  await expect.poll(async () => {
    if (await window.locator(modalSelector).isVisible()) {
      return true;
    }

    await window.locator(triggerSelector).click({ timeout: 1000 });
    return window.locator(modalSelector).isVisible();
  }, { timeout: 10000 }).toBe(true);
}

test.describe('FW Lagekarte E2E', () => {
  test('critical flow: create station and vehicle', async () => {
    const electronApp = await electron.launch({
      args: ['.'],
      cwd: path.resolve(__dirname, '../..'),
    });

    try {
      const window = await electronApp.firstWindow();
      await window.waitForSelector('#addStationBtn');

      await openModal(window, '#addStationBtn', '#stationModal');
      await window.fill('#stationName', 'Feuerwache E2E');
      await window.fill('#stationAddress', 'Testweg 1');
      await window.fill('#stationLat', '53.5511');
      await window.fill('#stationLng', '9.9937');
      await window.evaluate(() => {
        document.getElementById('stationForm').requestSubmit();
      });
      await expect(window.locator('#stationModal')).toBeHidden();

      await openModal(window, '#addVehicleBtn', '#vehicleModal');
      await window.fill('#vehicleCallsign', 'Florian E2E 1/46/1');
      await window.selectOption('#vehicleType', 'HLF');
      await window.fill('#vehicleCrew', '1/8');
      await window.selectOption('#vehicleStation', { label: 'Feuerwache E2E' });
      await window.evaluate(() => {
        document.getElementById('vehicleForm').requestSubmit();
      });

      await expect(window.locator('#vehicleList')).toContainText('Florian E2E 1/46/1');
      await expect(window.locator('#vehicleList')).toContainText('Feuerwache E2E');
    } finally {
      await electronApp.evaluate(async ({ app }) => {
        app.quit();
      });
      await electronApp.close();
    }
  });
});
