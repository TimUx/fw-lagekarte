// Mapping of vehicle types to tactical symbol filenames
const TACTICAL_SYMBOLS = {
    // Einsatzleitung
    'ELW': 'ELW_1.svg',
    
    // Löschfahrzeuge
    'HLF': 'Hilfeleistungslöschfahrzeug.svg',
    'LF': 'Löschfahrzeug.svg',
    'StLF': 'Löschfahrzeug_10.svg',
    'TLF': 'Tanklöschfahrzeug.svg',
    'TSF': 'Tragkraftspritzenfahrzeug.svg',
    'TSF-W': 'Tragkraftspritzenfahrzeug.svg',
    
    // Rüst- und Gerätewagen
    'GW-L1': 'Gerätewagen_Logistik_1.svg',
    'GW-L2': 'Gerätewagen_Logistik_2.svg',
    'RW': 'Rüstwagen.svg',
    
    // Mannschaft und Transport
    'MTF': 'Mannschaftstransportwagen.svg',
    'MTW': 'Mannschaftstransportwagen.svg',
    
    // Hubrettungsfahrzeuge
    'DLK': 'Drehleiter_Automatik_mit Korb.svg',
    
    // Rettungsfahrzeuge
    'KTW': 'Krankentransportwagen.svg',
    'NEF': 'Notarzteinsatzfahrzeug.svg',
    'RTW': 'Rettungswagen.svg',
    
    // Station/Gerätehaus
    'STATION': 'Feuerwehrgerätehaus.svg'
};

// Get the path to a tactical symbol
function getTacticalSymbolPath(vehicleType) {
    if (!vehicleType) {
        console.warn('getTacticalSymbolPath called with null/undefined vehicleType');
        return null;
    }
    
    const filename = TACTICAL_SYMBOLS[vehicleType];
    if (filename) {
        // Return path with proper URL encoding
        // encodeURIComponent properly handles Unicode characters and spaces
        return `assets/tactical-symbols/${encodeURIComponent(filename)}`;
    }
    
    console.warn(`No tactical symbol found for vehicle type: ${vehicleType}`);
    return null;
}

// Get the station symbol path
function getStationSymbolPath() {
    return getTacticalSymbolPath('STATION');
}
