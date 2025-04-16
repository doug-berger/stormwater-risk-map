// Add keydown listener to trigger search on Enter key
const input = document.getElementById('search-input');
input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        document.getElementById('search-button').click();
    }
});

mapboxgl.accessToken = 'pk.eyJ1IjoiZGJlcmdlcjMyNCIsImEiOiJjbTkxejI1ODYwMGQ1MmxvbWZreDZhMGgxIn0.nfxxsMs9W6jzp0-Wo-OEZg';

const mapOptions = {
    container: 'map-container',
    center: [-73.99432, 40.71103],
    zoom: 9.92,
    style: 'mapbox://styles/mapbox/dark-v11',
    maxBounds: [[-74.459, 40.277], [-73.500, 41.117]], 
    pitch: 20,

};

const map = new mapboxgl.Map(mapOptions);

let searchMarker;

const nycBounds = {
    west: -74.25909,
    south: 40.477399,
    east: -73.700181,
    north: 40.917577
};

function isWithinNYCBounds(lng, lat) {
    return lng >= nycBounds.west && lng <= nycBounds.east &&
           lat >= nycBounds.south && lat <= nycBounds.north;
}

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


document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;

    if (!query) return;

    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=1`;

    try {
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.features.length === 0) {
            alert('Address not found.');
            return;
        }

        const [lng, lat] = data.features[0].center;

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
        searchMarker = new mapboxgl.Marker({ color: '#007cbf' })
            .setLngLat([lng, lat])
            .addTo(map);

        // Calculate flood risk
        const floodStatus = getFloodRiskStatus([lng, lat], moderateFloodData, extremeFloodData);

        // Update sidebar
        document.getElementById('flood-risk-text').textContent = `This location has a ${floodStatus}.`;
        document.getElementById('resource-list').textContent = `Resources for a ${floodStatus} zone will appear here.`;

    } catch (error) {
        console.error('Geocoding error:', error);
        alert('There was a problem searching for the address.');
    }
});

let moderateFloodData, extremeFloodData;

map.on('load', async () => {
    // load flood zone geoJson data
    const moderateResponse = await fetch('moderate_flood_simple.json');
    moderateFloodData = await moderateResponse.json();

    const extremeResponse = await fetch('extreme_flood_simple.json');
    extremeFloodData = await extremeResponse.json();

    // Add flood risk data to map
    map.addSource('moderateFlood', {
        type: 'geojson',
        data: 'moderate_flood_simple.json'
    });

    map.addSource('extremeFlood', {
        type: 'geojson',
        data: 'extreme_flood_simple.json'
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

map.on('click', () => {
    if (searchMarker) {
        searchMarker.remove();
        searchMarker = null;
    }
});

