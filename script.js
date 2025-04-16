mapboxgl.accessToken = 'pk.eyJ1IjoiZGJlcmdlcjMyNCIsImEiOiJjbTkxejI1ODYwMGQ1MmxvbWZreDZhMGgxIn0.nfxxsMs9W6jzp0-Wo-OEZg';

const map = new mapboxgl.Map({
    container: 'map-container',
    center: [-73.99432, 40.71103],
    zoom: 9.92,
    style: 'mapbox://styles/mapbox/dark-v11',
    maxBounds: [[-74.459, 40.277], [-73.500, 41.117]],
    pitch: 20,
});

let searchMarker;
let moderateFloodData, extremeFloodData;

// NYC bounding box: [west, south, east, north]
const nycBbox = [-74.25909, 40.477399, -73.700181, 40.917577];

// Add the geocoder control AFTER the map is created
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: 'Enter your address here',
    bbox: nycBbox,
    mapboxgl: mapboxgl,
    marker: false,
    proximity: {
        longitude: -73.935242,
        latitude: 40.730610
    }
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

// === Functions ===
function getFloodRiskStatus(lngLat, moderateData, extremeData) {
    const point = turf.point(lngLat);
    const buffer = turf.buffer(point, 35, { units: 'feet' });

    let inModerate = false;
    let inExtreme = false;

    moderateData.features.forEach(feature => {
        if (turf.booleanIntersects(buffer, feature)) inModerate = true;
    });

    extremeData.features.forEach(feature => {
        if (turf.booleanIntersects(buffer, feature)) inExtreme = true;
    });

    if (inModerate) return 'high flood risk';
    else if (inExtreme) return 'moderate flood risk';
    else return 'low flood risk';
}

// === Geocoder Result Handler ===
geocoder.on('result', (e) => {
    const [lng, lat] = e.result.center;

    // Ensure flood data is loaded
    if (!moderateFloodData || !extremeFloodData) {
        console.error('Flood data is not loaded yet.');
        document.getElementById('flood-risk-text').textContent = 'Flood data is still loading. Please try again later.';
        return;
    }

    // Fly to location
    map.flyTo({
        center: [lng, lat],
        zoom: 15
    });

    // Remove old marker if it exists
    if (searchMarker) {
        searchMarker.remove();
    }

    // Add styled marker
    searchMarker = new mapboxgl.Marker({ color: '#0E34A0' })
        .setLngLat([lng, lat])
        .addTo(map);

    // Calculate flood risk
    const floodStatus = getFloodRiskStatus([lng, lat], moderateFloodData, extremeFloodData);

    // Update sidebar
    document.getElementById('flood-risk-text').textContent = `This location has a ${floodStatus}.`;
    document.getElementById('resource-list').textContent = `Resources for a ${floodStatus} zone will appear here.`;
});

// === Load GeoJSON and Add Layers ===
map.on('load', async () => {
    const moderateResponse = await fetch('moderate_flood_simple.json');
    moderateFloodData = await moderateResponse.json();

    const extremeResponse = await fetch('extreme_flood_simple.json');
    extremeFloodData = await extremeResponse.json();

    map.addSource('moderateFlood', {
        type: 'geojson',
        data: moderateFloodData
    });

    map.addSource('extremeFlood', {
        type: 'geojson',
        data: extremeFloodData
    });

    map.addLayer({
        id: 'extremeFloodLayer',
        type: 'fill',
        source: 'extremeFlood',
        paint: {
            'fill-color': '#fde74c',
            'fill-opacity': 0.5,
            'fill-outline-color': '#fde74c',
        }
    });

    map.addLayer({
        id: 'moderateFloodLayer',
        type: 'fill',
        source: 'moderateFlood',
        paint: {
            'fill-color': '#3399FF',
            'fill-opacity': 0.5,
            'fill-outline-color': '#3399FF',
        }
    });

    // Checkbox event listeners
    document.getElementById('toggle-moderate').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'moderateFloodLayer',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });

    document.getElementById('toggle-extreme').addEventListener('change', (e) => {
        map.setLayoutProperty(
            'extremeFloodLayer',
            'visibility',
            e.target.checked ? 'visible' : 'none'
        );
    });
});

// === Clear Marker on Map Click ===
map.on('click', () => {
    if (searchMarker) {
        searchMarker.remove();
        searchMarker = null;
    }
});
