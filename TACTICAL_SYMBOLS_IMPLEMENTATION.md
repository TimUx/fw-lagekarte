# Tactical Symbols Implementation

## Overview

This document describes the implementation of German fire department tactical symbols in the FW Lagekarte application.

## Problem Statement

The original implementation had several usability issues:
1. **Station markers** were too large (emoji + full station name) and covered too much of the map
2. **Vehicle markers** were too small (40x40px circles with tiny type abbreviations) making callsigns unreadable
3. No professional tactical symbols were used

## Solution

Implemented official German fire department tactical symbols from the [Bibliothek-taktische-Zeichen](https://github.com/ReneDens/Bibliothek-taktische-Zeichen) repository.

## Changes Made

### 1. Added Tactical Symbol Assets

Created `assets/tactical-symbols/` directory with 15 SVG tactical symbols:
- Feuerwehrgerätehaus.svg (fire station)
- ELW_1.svg, Hilfeleistungslöschfahrzeug.svg, Löschfahrzeug.svg, etc.

### 2. Created Symbol Mapping Module

`tactical-symbols.js` provides:
- `TACTICAL_SYMBOLS` - Mapping of vehicle types to SVG filenames
- `getTacticalSymbolPath(vehicleType)` - Returns path to symbol with proper URL encoding
- `getStationSymbolPath()` - Returns path to station symbol

### 3. Updated Station Markers

**Before:** 
```javascript
html: `🏢 ${escapeHtml(station.name)}`
```

**After:**
```javascript
html: `<img src="${escapeHtml(symbolPath)}" alt="Station" class="station-icon-img" />`
```

- Station name now appears only on hover (tooltip)
- Reduced map clutter significantly
- Size: 50x50px tactical symbol

### 4. Updated Vehicle Markers on Map

**Before:**
```javascript
// 40x40px circle with vehicle type abbreviation
html: escapeHtml(vehicle.type)
```

**After:**
```javascript
// 80x80px container with 60px symbol + callsign overlay
html: `<div class="vehicle-marker-container">
    <img src="${escapeHtml(symbolPath)}" alt="..." class="vehicle-icon-img" />
    <div class="vehicle-callsign-overlay">${escapeHtml(vehicle.callsign)}</div>
</div>`
```

- Much larger and more visible
- Callsign clearly displayed below symbol
- Professional tactical symbol for vehicle type

### 5. Updated Sidebar Vehicle Cards

Added tactical symbols to vehicle cards in the sidebar with layout:
```
[Symbol Icon] Vehicle Callsign
              Typ: XYZ
              Besatzung: 1/8
```

### 6. Security Improvements

- All symbol paths are HTML-escaped using `escapeHtml()`
- Proper URL encoding with `encodeURIComponent()`
- Null checks with fallback rendering
- CodeQL scan passed with 0 alerts

### 7. Styling

Added CSS for:
- `.vehicle-marker-container` - Container for symbol + callsign
- `.vehicle-callsign-overlay` - Red badge for callsign
- `.station-icon-img` - Station symbol styling
- `.vehicle-card-icon` - Symbol in sidebar cards
- Fallback styles for missing symbols

## Usage

### Adding New Vehicle Types

1. Add SVG symbol to `assets/tactical-symbols/`
2. Update `TACTICAL_SYMBOLS` mapping in `tactical-symbols.js`:
   ```javascript
   'NEW_TYPE': 'Symbol_Filename.svg'
   ```
3. Add vehicle type to dropdown in `index.html`

### Symbol Requirements

- SVG format
- Recommended size: 256x256px
- Must use standard German tactical symbol format
- Filename can contain Unicode characters and spaces

## Files Modified

- `index.html` - Added tactical-symbols.js script
- `renderer.js` - Updated marker rendering
- `styles.css` - Added styles for tactical symbols
- `tactical-symbols.js` - New mapping module
- `package.json` - Added tactical-symbols.js to build files
- `assets/tactical-symbols/` - New directory with 15 SVG files

## Testing

Created `test-visual.html` for visual verification of:
- Station symbols
- Vehicle symbols on map
- Vehicle cards in sidebar
- All available tactical symbols

## Browser Compatibility

Works with all modern browsers that support:
- SVG images
- CSS flexbox
- Leaflet.js markers

## References

- [Bibliothek-taktische-Zeichen](https://github.com/ReneDens/Bibliothek-taktische-Zeichen) - Source of tactical symbols
- [Leaflet.js Documentation](https://leafletjs.com/) - Map library
