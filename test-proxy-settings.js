#!/usr/bin/env node

/**
 * Test to verify that proxy settings can be saved and loaded correctly
 * using the file-based storage system.
 * 
 * This test verifies:
 * 1. Default proxy settings are returned when no file exists
 * 2. Settings can be saved to a file
 * 3. Settings can be loaded from a file
 * 4. All proxy modes are supported (system, manual, direct, pac)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { DEFAULT_PROXY_SETTINGS } = require('./constants');

// Create a temporary test directory
const testDir = path.join(os.tmpdir(), 'fw-lagekarte-test-' + Date.now());
fs.mkdirSync(testDir, { recursive: true });

const testConfigPath = path.join(testDir, 'proxy-settings.json');

// Simulate the proxy settings functions from main.js
function getProxySettings() {
    try {
        if (fs.existsSync(testConfigPath)) {
            const data = fs.readFileSync(testConfigPath, 'utf-8');
            const settings = JSON.parse(data);
            return { ...DEFAULT_PROXY_SETTINGS, ...settings };
        }
        return DEFAULT_PROXY_SETTINGS;
    } catch (error) {
        console.error('Error loading proxy settings:', error);
        return DEFAULT_PROXY_SETTINGS;
    }
}

function saveProxySettings(settings) {
    try {
        fs.writeFileSync(testConfigPath, JSON.stringify(settings, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error saving proxy settings:', error);
        throw error;
    }
}

// Test runner
async function runTests() {
    console.log('=== Testing Proxy Settings Storage ===\n');
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    // Test 1: Get default settings when no file exists
    console.log('Test 1: Get default settings when no file exists');
    const defaultSettings = getProxySettings();
    if (defaultSettings.mode === 'system' && 
        defaultSettings.proxyUrl === '' &&
        defaultSettings.proxyBypassRules === 'localhost,127.0.0.1' &&
        defaultSettings.pacUrl === '') {
        console.log('  ✓ PASS: Default settings returned correctly\n');
        testsPassed++;
    } else {
        console.log('  ✗ FAIL: Default settings incorrect');
        console.log('    Got:', defaultSettings);
        console.log('    Expected:', DEFAULT_PROXY_SETTINGS);
        console.log();
        testsFailed++;
    }
    
    // Test 2: Save system proxy settings
    console.log('Test 2: Save system proxy settings');
    const systemSettings = {
        mode: 'system',
        proxyUrl: '',
        proxyBypassRules: 'localhost,127.0.0.1',
        pacUrl: ''
    };
    try {
        saveProxySettings(systemSettings);
        const loadedSettings = getProxySettings();
        if (JSON.stringify(loadedSettings) === JSON.stringify(systemSettings)) {
            console.log('  ✓ PASS: System settings saved and loaded correctly\n');
            testsPassed++;
        } else {
            console.log('  ✗ FAIL: Settings mismatch');
            console.log('    Saved:', systemSettings);
            console.log('    Loaded:', loadedSettings);
            console.log();
            testsFailed++;
        }
    } catch (error) {
        console.log('  ✗ FAIL: Error saving settings:', error.message, '\n');
        testsFailed++;
    }
    
    // Test 3: Save manual proxy settings
    console.log('Test 3: Save manual proxy settings');
    const manualSettings = {
        mode: 'manual',
        proxyUrl: 'http://proxy.example.com:8080',
        proxyBypassRules: 'localhost,127.0.0.1,*.local',
        pacUrl: ''
    };
    try {
        saveProxySettings(manualSettings);
        const loadedSettings = getProxySettings();
        if (JSON.stringify(loadedSettings) === JSON.stringify(manualSettings)) {
            console.log('  ✓ PASS: Manual settings saved and loaded correctly\n');
            testsPassed++;
        } else {
            console.log('  ✗ FAIL: Settings mismatch');
            console.log('    Saved:', manualSettings);
            console.log('    Loaded:', loadedSettings);
            console.log();
            testsFailed++;
        }
    } catch (error) {
        console.log('  ✗ FAIL: Error saving settings:', error.message, '\n');
        testsFailed++;
    }
    
    // Test 4: Save PAC proxy settings
    console.log('Test 4: Save PAC proxy settings');
    const pacSettings = {
        mode: 'pac',
        proxyUrl: '',
        proxyBypassRules: 'localhost,127.0.0.1',
        pacUrl: 'http://proxy.example.com/proxy.pac'
    };
    try {
        saveProxySettings(pacSettings);
        const loadedSettings = getProxySettings();
        if (JSON.stringify(loadedSettings) === JSON.stringify(pacSettings)) {
            console.log('  ✓ PASS: PAC settings saved and loaded correctly\n');
            testsPassed++;
        } else {
            console.log('  ✗ FAIL: Settings mismatch');
            console.log('    Saved:', pacSettings);
            console.log('    Loaded:', loadedSettings);
            console.log();
            testsFailed++;
        }
    } catch (error) {
        console.log('  ✗ FAIL: Error saving settings:', error.message, '\n');
        testsFailed++;
    }
    
    // Test 5: Save direct connection settings
    console.log('Test 5: Save direct connection settings');
    const directSettings = {
        mode: 'direct',
        proxyUrl: '',
        proxyBypassRules: 'localhost,127.0.0.1',
        pacUrl: ''
    };
    try {
        saveProxySettings(directSettings);
        const loadedSettings = getProxySettings();
        if (JSON.stringify(loadedSettings) === JSON.stringify(directSettings)) {
            console.log('  ✓ PASS: Direct settings saved and loaded correctly\n');
            testsPassed++;
        } else {
            console.log('  ✗ FAIL: Settings mismatch');
            console.log('    Saved:', directSettings);
            console.log('    Loaded:', loadedSettings);
            console.log();
            testsFailed++;
        }
    } catch (error) {
        console.log('  ✗ FAIL: Error saving settings:', error.message, '\n');
        testsFailed++;
    }
    
    // Test 6: Settings persist across multiple reads
    console.log('Test 6: Settings persist across multiple reads');
    const firstRead = getProxySettings();
    const secondRead = getProxySettings();
    if (JSON.stringify(firstRead) === JSON.stringify(secondRead)) {
        console.log('  ✓ PASS: Settings persist correctly\n');
        testsPassed++;
    } else {
        console.log('  ✗ FAIL: Settings do not persist');
        console.log('    First read:', firstRead);
        console.log('    Second read:', secondRead);
        console.log();
        testsFailed++;
    }
    
    // Clean up test directory
    try {
        fs.unlinkSync(testConfigPath);
        fs.rmdirSync(testDir);
    } catch (error) {
        console.log('Warning: Could not clean up test directory:', error.message);
    }
    
    // Summary
    console.log('=== Test Summary ===');
    console.log(`Total: ${testsPassed + testsFailed} tests`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    
    if (testsFailed > 0) {
        process.exit(1);
    } else {
        console.log('\n✓ All tests passed!');
    }
}

// Run tests
runTests().catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
});
