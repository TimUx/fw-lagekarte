// Shared constants for the application

// Default proxy settings used by both main and renderer processes
const DEFAULT_PROXY_SETTINGS = {
    mode: 'system', // 'system', 'manual', 'direct'
    proxyUrl: '',
    proxyBypassRules: 'localhost,127.0.0.1'
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DEFAULT_PROXY_SETTINGS
    };
}
