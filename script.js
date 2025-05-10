mapboxgl.accessToken = 'pk.eyJ1IjoiZGJlcmdlcjMyNCIsImEiOiJjbTkxejI1ODYwMGQ1MmxvbWZreDZhMGgxIn0.nfxxsMs9W6jzp0-Wo-OEZg';

// Ensure Turf.js is imported
if (typeof turf === 'undefined') {
    console.error('Turf.js is not loaded. Please include Turf.js in your HTML file.');
}

const map = new mapboxgl.Map({
    container: 'map-container',
    center: [-73.99432, 40.71103],
    zoom: 9.92,
    style: 'mapbox://styles/dberger324/cmag3wj1f013801s03teu7bom',
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
        if (turf.booleanIntersects(buffer, feature)) inHundredYear = true;
    });

    let status;
    if (inModerate && inHundredYear) {
        status = `
        <p class = "flood-status-text"> This location would likely experience stormwater flooding under a 
        moderate stormwater flooding scenario (2.13 inches per hour of rain). This represents an elevated 
        risk of stormwater flooding. It is also located within the 100-year floodplain. This means that there 
        is at least a 1% chance of flooding from a coastal storm in any given year. Your actual risk may be higher.
         <a href="https://www.nyc.gov/site/floodmaps/about/about-flood-maps.page" target="_blank" rel="noopener noreferrer">Click here</a> 
         for more information on FEMA flood zones. Combined, these two factors indicate a high risk of flooding. 
         <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`; 

    } else if (inExtreme && inHundredYear) {
        status = `
       <p class = "flood-status-text"> This location would likely experience stormwater flooding under an extreme 
       stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). This means 
       this area would likely only experience stormwater flooding with extremely high rainfall. 
       However, these events are expected to become more frequent in the future. It is also located within the 100-year floodplain. 
       This means that there is at least a 1% chance of flooding from a coastal storm in any given year. Your actual risk may be higher. 
       <a href="https://www.nyc.gov/site/floodmaps/about/about-flood-maps.page" target="_blank" rel="noopener noreferrer">Click here</a> 
       for more information on FEMA flood zones. <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`;

    } else if (inModerate) {
        status = `
    <p class = "flood-status-text"> This location would likely experience stormwater flooding under a moderate stormwater 
    flooding scenario (2.13 inches per hour of rain). This represents an elevated risk of stormwater flooding. 
    <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`;

    } else if (inExtreme) {
        status = `
        <p class = "flood-status-text"> This location would likely experience stormwater flooding under 
        an extreme stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). 
        This means this area would likely only experience stormwater flooding with extremely high rainfall. 
        However, these events are expected to become more frequent in the future. 
        <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`;
        
    } else if (inHundredYear) {
        status = `
        <p class = "flood-status-text"> This area is located within the 100-year floodplain. This means that there 
        is at least a 1% chance of flooding from a coastal storm in any given year. Your actual risk may be higher. 
        <a href="https://www.nyc.gov/site/floodmaps/about/about-flood-maps.page" target="_blank" rel="noopener noreferrer">Click here</a> 
        for more information on FEMA flood zones.</p>`;
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
        if (turf.booleanIntersects(buffer, feature)) inHundredYear = true;
    });

    let Rec = ''; // Recommendations

    if (inModerate && inHundredYear) {
        Rec = `
        <h3 class="flood-rec-header"> Consider Purchasing Flood Insurance </h3> 
        <p class="flood-rec-text"> Flood protection is not included in standard homeowners or renter's insurance, but can be obtained as a separate policy. Go to <a href="https://floodhelpny.org" target="_blank" rel="noopener noreferrer">FloodHelpNY</a> to learn more about flood insurance. Even if you are not in a FEMA flood zone, you may be at risk from stormwater flooding.</p>
        <h3 class="flood-rec-header"> Apply for the Business Preparedness and Resiliency Program (PREP) Risk Assessment and Grant Program </h3>
        <p class="flood-rec-text"> The NYC Department of Small Business Services (SBS) offers a grant program to help small businesses assess their flood risk and implement mitigation measures. Go to <a href="https://www.nyc.gov/site/sbs/businesses/preparedness-and-resiliency-program.page" target="_blank" rel="noopener noreferrer">SBS PREP</a> for more information.</p>
        <h3 class="flood-rec-header"> Elevate Important Documents and Equipment </h3>
        <p class="flood-rec-text"> Consider elevating important documents and equipment to reduce the risk of damage.</p>
        <h3 class="flood-rec-header"> Install Flood Barriers </h3>
        <p class="flood-rec-text"> Consider installing flood barriers or flood gates to protect your property from stormwater flooding.</p>
        <h3 class="flood-rec-header"> Create a Flood Emergency Plan </h3>
        <p class="flood-rec-text"> Create a flood emergency plan for your property. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>`;
    
    } else if (inExtreme && inHundredYear) {
        Rec = 'This location would likely experience stormwater flooding under an extreme stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). This means this area would likely only experience stormwater flooding with extremely high rainfall. However, these events are expected to become more frequent in the future. It is also located within the 100-year floodplain. This means that there is a 1% chance of flooding from a coastal storm in any given year.';
    
    } else if (inModerate) {
        Rec = `
        <h3 class="flood-rec-header"> Consider Purchasing Flood Insurance </h3> 
        <p class="flood-rec-text"> Flood protection is not included in standard homeowners or renter's insurance, but can be obtained as a separate policy. Go to <a href="https://floodhelpny.org" target="_blank" rel="noopener noreferrer">FloodHelpNY</a> to learn more about flood insurance. Even if you are not in a FEMA flood zone, you may be at risk from stormwater flooding.</p>
        <h3 class="flood-rec-header"> Apply for the Business Preparedness and Resiliency Program (PREP) Risk Assessment and Grant Program </h3>
        <p class="flood-rec-text"> The NYC Department of Small Business Services (SBS) offers a grant program to help small businesses assess their flood risk and implement mitigation measures. Go to <a href="https://www.nyc.gov/site/sbs/businesses/preparedness-and-resiliency-program.page" target="_blank" rel="noopener noreferrer">SBS PREP</a> for more information.</p>
        <h3 class="flood-rec-header"> Elevate Important Documents and Equipment </h3>
        <p class="flood-rec-text"> Consider elevating important documents and equipment to reduce the risk of damage.</p>
        <h3 class="flood-rec-header"> Install Flood Barriers </h3>
        <p class="flood-rec-text"> Consider installing flood barriers or flood gates to protect your property from stormwater flooding.</p>
        <h3 class="flood-rec-header"> Create a Flood Emergency Plan </h3>
        <p class="flood-rec-text"> Create a flood emergency plan for your property. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>`;
    
    } else if (inExtreme) {
        Rec = 'This location would likely experience stormwater flooding under an extreme stormwater flooding scenario (3.66 inches per hour of rain with 2080 projected sea level rise). This means this area would likely only experience stormwater flooding with extremely high rainfall. However, these events are expected to become more frequent in the future.';
    
    } else if (inHundredYear) {
        Rec = 'This area is located within the 100-year floodplain.';
    
    } else {
        Rec = 'low flood risk';
    }
    
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
    document.getElementById('resource-list').innerHTML = Rec