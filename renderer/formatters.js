(function initRendererFormatters(globalScope) {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function buildDeploymentInfoHtmlForCard(vehicle) {
        if (!vehicle.deployed || !vehicle.deploymentInfo) {
            return '';
        }

        let html = '';
        if (vehicle.deploymentInfo.missionNumber) {
            html += `<div class="vehicle-mission">📋 ${escapeHtml(vehicle.deploymentInfo.missionNumber)}</div>`;
        }
        if (vehicle.deploymentInfo.missionKeyword) {
            html += `<div class="vehicle-mission">🚨 ${escapeHtml(vehicle.deploymentInfo.missionKeyword)}</div>`;
        }
        return html;
    }

    function buildDeploymentInfoHtmlForPopup(vehicle) {
        if (!vehicle.deploymentInfo) {
            return '';
        }

        let html = '';
        if (vehicle.deploymentInfo.missionNumber) {
            html += `<div class="popup-info"><strong>Einsatznummer:</strong> ${escapeHtml(vehicle.deploymentInfo.missionNumber)}</div>`;
        }
        if (vehicle.deploymentInfo.missionKeyword) {
            html += `<div class="popup-info"><strong>Einsatzstichwort:</strong> ${escapeHtml(vehicle.deploymentInfo.missionKeyword)}</div>`;
        }
        if (vehicle.deploymentInfo.remarks) {
            html += `<div class="popup-info"><strong>Bemerkungen:</strong> ${escapeHtml(vehicle.deploymentInfo.remarks)}</div>`;
        }
        return html;
    }

    function formatVehicleForPrint(vehicle) {
        return `<li><strong>${escapeHtml(vehicle.callsign)}</strong> - ${escapeHtml(vehicle.type)}${vehicle.crew ? ` (${escapeHtml(vehicle.crew)})` : ''}</li>`;
    }

    function formatStationForPrint(station) {
        return `<li><strong>${escapeHtml(station.name)}</strong>${station.address ? ` - ${escapeHtml(station.address)}` : ''}</li>`;
    }

    globalScope.RendererFormatters = {
        escapeHtml,
        buildDeploymentInfoHtmlForCard,
        buildDeploymentInfoHtmlForPopup,
        formatVehicleForPrint,
        formatStationForPrint
    };
})(window);
