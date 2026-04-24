(function initRendererCollections(globalScope) {
    function sortByLocale(items, selector) {
        return [...items].sort((a, b) => selector(a).localeCompare(selector(b), 'de', { sensitivity: 'base' }));
    }

    function splitVehiclesByDeployment(allVehicles) {
        return allVehicles.reduce((acc, vehicle) => {
            if (vehicle.deployed) {
                acc.deployed.push(vehicle);
            } else {
                acc.available.push(vehicle);
            }
            return acc;
        }, { deployed: [], available: [] });
    }

    function groupAvailableVehiclesByStation(availableVehicles) {
        return availableVehicles.reduce((acc, vehicle) => {
            if (vehicle.stationId) {
                if (!acc.byStation[vehicle.stationId]) {
                    acc.byStation[vehicle.stationId] = [];
                }
                acc.byStation[vehicle.stationId].push(vehicle);
            } else {
                acc.unassigned.push(vehicle);
            }

            return acc;
        }, { byStation: {}, unassigned: [] });
    }

    globalScope.RendererCollections = {
        sortByLocale,
        splitVehiclesByDeployment,
        groupAvailableVehiclesByStation
    };
})(window);
