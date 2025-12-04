#!/usr/bin/env node

/**
 * Test to verify that the embedded server correctly handles incremental updates
 * without overwriting existing data.
 * 
 * This test simulates the bug scenario:
 * 1. Add several vehicles/stations
 * 2. Verify all are stored in the server state
 * 3. Ensure no items are overwritten
 */

const embeddedServer = require('./embedded-server');

// Test counter for unique IDs
let testCounter = 0;

// Mock test data
function createTestStation(index) {
    return {
        id: `station_test_${++testCounter}`,
        name: `Test Station ${index}`,
        address: `Address ${index}`,
        lat: 51.1657 + (index * 0.1),
        lng: 10.4515 + (index * 0.1)
    };
}

function createTestVehicle(index) {
    return {
        id: `vehicle_test_${++testCounter}`,
        callsign: `Test Vehicle ${index}`,
        type: 'HLF',
        crew: '1/8',
        stationId: null,
        notes: `Vehicle number ${index}`,
        deployed: false,
        position: null,
        deploymentInfo: null
    };
}

async function runTests() {
    console.log('=== Testing Embedded Server State Management ===\n');
    
    // Test 1: Add multiple vehicles using incremental updates
    console.log('Test 1: Adding 10 vehicles incrementally...');
    for (let i = 1; i <= 10; i++) {
        const vehicle = createTestVehicle(i);
        embeddedServer.updateVehicle(vehicle);
        console.log(`  Added vehicle ${i}: ${vehicle.callsign}`);
    }
    
    const vehicles = embeddedServer.currentState.vehicles;
    console.log(`  Total vehicles in server state: ${vehicles.length}`);
    
    if (vehicles.length === 10) {
        console.log('  ✓ PASS: All 10 vehicles stored correctly\n');
    } else {
        console.log(`  ✗ FAIL: Expected 10 vehicles, got ${vehicles.length}\n`);
        vehicles.forEach((v, i) => {
            console.log(`    ${i + 1}. ${v.callsign} (${v.id})`);
        });
        process.exit(1);
    }
    
    // Test 2: Add multiple stations using incremental updates
    console.log('Test 2: Adding 5 stations incrementally...');
    for (let i = 1; i <= 5; i++) {
        const station = createTestStation(i);
        embeddedServer.updateStation(station);
        console.log(`  Added station ${i}: ${station.name}`);
    }
    
    const stations = embeddedServer.currentState.stations;
    console.log(`  Total stations in server state: ${stations.length}`);
    
    if (stations.length === 5) {
        console.log('  ✓ PASS: All 5 stations stored correctly\n');
    } else {
        console.log(`  ✗ FAIL: Expected 5 stations, got ${stations.length}\n`);
        stations.forEach((s, i) => {
            console.log(`    ${i + 1}. ${s.name} (${s.id})`);
        });
        process.exit(1);
    }
    
    // Test 3: Update an existing vehicle
    console.log('Test 3: Updating an existing vehicle...');
    const vehicleToUpdate = vehicles[0];
    const originalId = vehicleToUpdate.id;
    vehicleToUpdate.callsign = 'Updated Vehicle 1';
    embeddedServer.updateVehicle(vehicleToUpdate);
    
    const updatedVehicles = embeddedServer.currentState.vehicles;
    const updatedVehicle = updatedVehicles.find(v => v.id === originalId);
    
    if (updatedVehicles.length === 10 && updatedVehicle.callsign === 'Updated Vehicle 1') {
        console.log('  ✓ PASS: Vehicle updated without changing count\n');
    } else {
        console.log(`  ✗ FAIL: Update caused issues (count: ${updatedVehicles.length})\n`);
        process.exit(1);
    }
    
    // Test 4: Delete a vehicle
    console.log('Test 4: Deleting a vehicle...');
    embeddedServer.deleteVehicle(originalId);
    
    const afterDelete = embeddedServer.currentState.vehicles;
    if (afterDelete.length === 9 && !afterDelete.find(v => v.id === originalId)) {
        console.log('  ✓ PASS: Vehicle deleted correctly\n');
    } else {
        console.log(`  ✗ FAIL: Delete caused issues (count: ${afterDelete.length})\n`);
        process.exit(1);
    }
    
    console.log('=== All Tests Passed! ===');
    console.log(`Final state: ${afterDelete.length} vehicles, ${stations.length} stations`);
}

// Run tests
runTests().catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
});
