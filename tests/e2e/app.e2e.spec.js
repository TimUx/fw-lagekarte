const { test, expect, _electron: electron } = require('@playwright/test');
const path = require('path');

test.describe('FW Lagekarte E2E', () => {
  test('critical flow: create station and vehicle', async () => {
    const electronApp = await electron.launch({
      args: ['.'],
      cwd: path.resolve(__dirname, '../..'),
    });

    try {
      const window = await electronApp.firstWindow();
      await window.waitForSelector('#addStationBtn');

      await window.evaluate(() => {
        document.getElementById('addStationBtn').click();
      });
      await window.fill('#stationName', 'Feuerwache E2E');
      await window.fill('#stationAddress', 'Testweg 1');
      await window.fill('#stationLat', '53.5511');
      await window.fill('#stationLng', '9.9937');
      await window.evaluate(() => {
        document.getElementById('stationForm').requestSubmit();
      });

      await window.evaluate(() => {
        document.getElementById('addVehicleBtn').click();
      });
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
