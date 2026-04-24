const { JSDOM } = require('jsdom');
const { loadBrowserScript } = require('../helpers/load-browser-script');

describe('RendererFormatters', () => {
  let formatters;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    const context = loadBrowserScript('renderer/formatters.js', {
      window: dom.window,
      document: dom.window.document,
    });
    formatters = context.window.RendererFormatters;
  });

  it('escapeHtml sanitizes unsafe characters', () => {
    expect(formatters.escapeHtml('<script>alert(1)</script>')).toContain('&lt;script&gt;');
  });

  it('buildDeploymentInfoHtmlForCard returns mission info only for deployed vehicles', () => {
    const html = formatters.buildDeploymentInfoHtmlForCard({
      deployed: true,
      deploymentInfo: { missionNumber: 'E-1', missionKeyword: 'Brand' },
    });
    expect(html).toContain('E-1');
    expect(html).toContain('Brand');
  });

  it('buildDeploymentInfoHtmlForPopup includes all detail fields', () => {
    const html = formatters.buildDeploymentInfoHtmlForPopup({
      deploymentInfo: {
        missionNumber: 'E-99',
        missionKeyword: 'TH',
        remarks: 'Hydraulik notwendig',
      },
    });
    expect(html).toContain('Einsatznummer');
    expect(html).toContain('Hydraulik notwendig');
  });

  it('print formatters include callsign/type and station address', () => {
    expect(
      formatters.formatVehicleForPrint({ callsign: 'Florian 1', type: 'HLF', crew: '1/8' }),
    ).toContain('Florian 1');
    expect(
      formatters.formatStationForPrint({ name: 'Wache 1', address: 'Musterweg 1' }),
    ).toContain('Musterweg 1');
  });
});
