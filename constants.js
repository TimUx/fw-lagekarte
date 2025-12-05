// Shared constants for the application

// Default proxy settings used by both main and renderer processes
const DEFAULT_PROXY_SETTINGS = {
    mode: 'system', // 'system', 'manual', 'direct', 'pac'
    proxyUrl: '',
    proxyBypassRules: 'localhost,127.0.0.1',
    pacUrl: '' // URL to PAC script file
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_PROXY_SETTINGS
    };
}
