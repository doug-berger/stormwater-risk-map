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
let moderateFloodData, extremeFloodData, hundredYearFloodData;

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

// === Functions === getting flood risk status and recommendations
function getFloodRiskStatus(lngLat, moderateData, extremeData, hundredYearData) {
    const point = turf.point(lngLat);
    const buffer = turf.buffer(point, 35, { units: 'feet' });

    let inModerate = false;
    let inExtreme = false;
    let inHundredYear = false;

    moderateData.features.forEach(feature => {
        if (turf.booleanIntersects(buffer, feature)) inModerate = true;
    });

    extremeData.features.forEach(feature => {
        if (turf.booleanIntersects(buffer, feature)) inExtreme = true;
    });

    hundredYearData.features.forEach(feature => {
        if (turf.booleanPointInPolygon(point, feature)) inHundredYear = true;
    });

    let status;
    if (inModerate) { 
        status = `
    <p class = "flood-status-text"> This location would likely experience stormwater flooding under a moderate stormwater flooding scenario (2.13 inches per hour of rain). This represents an elevated risk of stormwater flooding.</p>`;
     } else if (inExtreme) {
        status = `
        <p class = "flood-status-text"> This location would likely experience stormwater flooding under an extreme stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). This means this area would likely only experience stormwater flooding with extremely high rainfall.. However, these events are expected to become more frequent in the future.</p>`;
    } else if (inHundredYear) {
        status = `
        <p class = "flood-status-text"> classThis area is located within the 100-year floodplain.</p>`;
    } else if (inModerate && inHundredYear) {
         status = `
         <p class = "flood-status-text"> This location would likely experience stormwater flooding under a moderate stormwater flooding scenario (2.13 inches per hour of rain). This represents an elevated risk of stormwater flooding. It is also located within the 100-year floodplain. This means that there is a 1% chance of flooding from a coastal storm in any given year. Combined, these two factors indicate a high risk of flooding.</p>`;
    } else if (inExtreme && inHundredYear) {
        status = `
        <p class = "flood-status-text"> This location would likely experience stormwater flooding under an extreme stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). This means this area would likely only experience stormwater flooding with extremely high rainfall. However, these events are expected to become more frequent in the future. It is also located within the 100-year floodplain. This means that there is a 1% chance of flooding from a coastal storm in any given year.</p>`;
    } else status = ` <p class = "flood-status-text"> low flood risk </p>`;

    return { status, inHundredYear };
}

function getFloodRiskRec(lngLat, moderateData, extremeData, hundredYearData) {
    const point = turf.point(lngLat);
    const buffer = turf.buffer(point, 35, { units: 'feet' });

    let inModerate = false;
    let inExtreme = false;
    let inHundredYear = false;

    moderateData.features.forEach(feature => {
        if (turf.booleanIntersects(buffer, feature)) inModerate = true;
    });

    extremeData.features.forEach(feature => {
        if (turf.booleanIntersects(buffer, feature)) inExtreme = true;
    });

    hundredYearData.features.forEach(feature => {
        if (turf.booleanPointInPolygon(point, feature)) inHundredYear = true;
    });

    let Rec = ''; // Recommendations

    if (inModerate) { 
        Rec = `
        <h3 class="flood-rec-header"> Consider Purchasing flood insurance </h3> 
        <p class="flood-rec-text"> Flood protection is not included in standard homeowners or renter's insurance, but can be obtained as a separate policy. Go to <a href="https://floodhelpny.org" target="_blank" rel="noopener noreferrer">FloodHelpNY</a> 
        to learn more about flood insurance. Even if you are not in a FEMA flood zone, you may be at risk from stormwater flooding.</p>
        <h3 class="flood-rec-header"> Apply for the Business Preparedness and Resiliency Program (PREP) Risk Assessment and Grant Program </h3>
        <p class="flood-rec-text"> The NYC Department of Small Business Services (SBS) offers a grant program to help small businesses assess their flood risk and implement mitigation measures. Go to <a href="https://www.nyc.gov/site/sbs/businesses/preparedness-and-resiliency-program.page" target="_blank" rel="noopener noreferrer">SBS PREP</a> for more information.</p>
        <h3 class="flood-rec-header"> Elevate Important Documents and Equipment </h3>
        <p class="flood-rec-text"> Consider elevating important documents and equipment to reduce the risk of damage.</p>
        <h3 class="flood-rec-header"> Install Flood Barriers </h3>
        <p class="flood-rec-text"> Consider installing flood barriers or flood gates to protect your property from stormwater flooding.</p>
        <h3 class="flood-rec-header"> Create a Flood Emergency Plan </h3>
        <p class="flood-rec-text"> Create a flood emergency plan for your property. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>`;
     } else if (inExtreme) Rec = 'This location would likely experience stormwater flooding under an extreme stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). This means this area would likely only experience stormwater flooding with extremely high rainfall.. However, these events are expected to become more frequent in the future.';
    else if (inHundredYear) Rec = 'This area is located within the 100-year floodplain.';
    else if (inModerate && inHundredYear) Rec = 'This location would likely experience stormwater flooding under a moderate stormwater flooding scenario (2.13 inches per hour of rain). This represents an elevated risk of stormwater flooding. It is also located within the 100-year floodplain. This means that there is a 1% chance of flooding from a coastal storm in any given year. Combined, these two factors indicate a high risk of flooding.';
    else if (inExtreme && inHundredYear) Rec = 'This location would likely experience stormwater flooding under an extreme stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). This means this area would likely only experience stormwater flooding with extremely high rainfall. However, these events are expected to become more frequent in the future. It is also located within the 100-year floodplain. This means that there is a 1% chance of flooding from a coastal storm in any given year.';
    else Rec = 'low flood risk';

    return { Rec, inHundredYear };
}

// === Geocoder Result Handler ===
geocoder.on('result', (e) => {
    const [lng, lat] = e.result.center;

    // Ensure flood data is loaded
    if (!moderateFloodData || !extremeFloodData || !hundredYearFloodData) {
        console.error('Flood data is not loaded yet.');
        document.getElementById('flood-risk-text').textContent = 'Flood data is still loading. Please try again later.';
        return;
    }

    // Fly to location
    map.flyTo({
        center: [lng, lat],
        zoom: 15,
        speed: 0.4, // make the flying slow
        curve: 1.8, // higher is more dramatic
        essential: true,
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
    const { status, inHundredYear } = getFloodRiskStatus([lng, lat], moderateFloodData, extremeFloodData, hundredYearFloodData);

    // Update sidebar
    let sidebarText = `${status}`;
    if (inHundredYear) {
        sidebarText += ' It is located within the 100-year floodplain. This means that there is a 1% chance of flooding from a coastal storm in any given year.';
    }

    document.getElementById('flood-risk-text').innerHTML = status;
    const { Rec } = getFloodRiskRec([lng, lat], moderateFloodData, extremeFloodData, hundredYearFloodData);
    document.getElementById('resource-list').innerHTML = Rec;
    
});

// === Load GeoJSON and Add Layers ===
map.on('load', async () => {
    const moderateResponse = await fetch('moderate_flood_simple.json');
    moderateFloodData = await moderateResponse.json();

    const extremeResponse = await fetch('extreme_flood_simple.json');
    extremeFloodData = await extremeResponse.json();

    const hundredYearResponse = await fetch('FEMA_100_Year_Dissolved.json');
    hundredYearFloodData = await hundredYearResponse.json();

    map.addSource('moderateFlood', {
        type: 'geojson',
        data: moderateFloodData
    });

    map.addSource('extremeFlood', {
        type: 'geojson',
        data: extremeFloodData
    });

    map.addSource('HundredYearFlood', {
        type: 'geojson',
        data: hundredYearFloodData
    });

    map.addLayer({
        id: 'extremeFloodLayer',
        type: 'fill',
        source: 'extremeFlood',
        paint: {
            'fill-color': '#fde74c',
            'fill-opacity': 0.5,
            'fill-outline-color': '#fde74c'
        }
    });

    map.addLayer({
        id: 'moderateFloodLayer',
        type: 'fill',
        source: 'moderateFlood',
        paint: {
            'fill-color': '#3399FF',
            'fill-opacity': 0.5,
            'fill-outline-color': '#3399FF'
        }
    });

    map.addLayer({
        id: 'HundredYearFloodLayer',
        type: 'fill',
        source: 'HundredYearFlood',
        paint: {
            'fill-color': '#C3423F',
            'fill-opacity': 0.2,
            'fill-outline-color': '#C3423F'
        }
    });

    map.addLayer({
        id: 'HundredYearFloodOutline',
        type: 'line',
        source: 'HundredYearFlood',
        paint: {
            'line-color': '#C3423F',
            'line-opacity': 0.6,
            'line-width': 1
        }
    });

    document.getElementById('toggle-moderate').addEventListener('change', (e) => {
        map.setLayoutProperty('moderateFloodLayer', 'visibility', e.target.checked ? 'visible' : 'none');
    });

    document.getElementById('toggle-extreme').addEventListener('change', (e) => {
        map.setLayoutProperty('extremeFloodLayer', 'visibility', e.target.checked ? 'visible' : 'none');
    });

    document.getElementById('toggle-hundred').checked = false;

    document.getElementById('toggle-hundred').addEventListener('change', (e) => {
        map.setLayoutProperty('HundredYearFloodLayer', 'visibility', e.target.checked ? 'visible' : 'none');
        map.setLayoutProperty('HundredYearFloodOutline', 'visibility', e.target.checked ? 'visible' : 'none');
    });

    map.setLayoutProperty('HundredYearFloodLayer', 'visibility', 'none');
    map.setLayoutProperty('HundredYearFloodOutline', 'visibility', 'none');
});

// === Clear Marker on Map Click ===
map.on('click', () => {
    if (searchMarker) {
        searchMarker.remove();
        searchMarker = null;
    }
    document.getElementById('flood-risk-text').textContent = 'Select a property on the map to see flood risk information.';
    document.getElementById('resource-list').textContent = 'Select a property on the map to see flood mitigation resources.';
});
