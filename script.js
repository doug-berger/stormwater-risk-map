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
         for more information on FEMA flood zones. Combined, these two factors indicate a high risk of flooding. <br> <br> 
         <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`;

    } else if (inExtreme && inHundredYear) {
        status = `
       <p class = "flood-status-text"> This location would likely experience stormwater flooding under an extreme 
       stormwater flooding scenario (3.66 inches per hour of rain). While currently unusual, these events are expected to become more frequent in the future. It is also located within the 100-year floodplain. 
       This means that there is at least a 1% chance of flooding from a coastal storm in any given year. Your actual risk may be higher. 
       <a href="https://www.nyc.gov/site/floodmaps/about/about-flood-maps.page" target="_blank" rel="noopener noreferrer">Click here</a> 
       for more information on FEMA flood zones. <br> <br> <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`;

    } else if (inModerate) {
        status = `
    <p class = "flood-status-text"> This location would likely experience stormwater flooding under a moderate stormwater 
    flooding scenario (2.13 inches per hour of rain). This represents an elevated risk of stormwater flooding. <br> <br> 
    <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`;

    } else if (inExtreme) {
        status = `
        <p class = "flood-status-text"> This location would likely experience stormwater flooding under 
        an extreme stormwater flooding scenario (3.66 inches per hour of rain). While currently unusual, these events are expected to become more frequent in the future. <br> <br> 
        <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a></p>`;

    } else if (inHundredYear) {
        status = `
        <p class = "flood-status-text"> This area is located within the 100-year floodplain. This means that there 
        is at least a 1% chance of flooding from a coastal storm in any given year. Your actual risk may be higher. 
        <a href="https://www.nyc.gov/site/floodmaps/about/about-flood-maps.page" target="_blank" rel="noopener noreferrer">Click here</a> 
        for more information on FEMA flood zones.</p>`;

    } else status = ` <p class = "flood-status-text"> This property is at a relatively low risk of stormwater and coastal flooding.
    However, flooding can strike outside of flood zones and you should still take common-sense measures to reduce you and your neighbors' risk. <br> <br> 
     <a href="https://climate.cityofnewyork.us/challenges/extreme-rainfall/" target="_blank" rel="noopener noreferrer">Learn more about extreme rainfall and stormwater flooding.</a> </p>`;

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
        <h3 class="flood-rec-header"> Purchase Flood Insurance </h3> 
        <p class="flood-rec-text"> Flood protection is not included in standard homeowners or renter's insurance, but can be obtained as a separate policy. Go to <a href="https://floodhelpny.org" target="_blank" rel="noopener noreferrer">FloodHelpNY</a> to learn more about flood insurance. Even if you are not in a FEMA flood zone, you may be at risk from stormwater flooding.</p>

        <h3 class="flood-rec-header"> Consider Purchasing Business Interruption Insurance </h3>
        <p class="flood-rec-text"> Business interruption insurance, or business income insurance, covers the income loss
         a business faces after a disaster, whether from facility closure or rebuilding. Standard property insurance might 
         not cover revenue loss, which can be vital for staying operational. </p>

        <h3 class="flood-rec-header"> Get Emergency Notifications Through Notify NYC </h3>
        <p class="flood-rec-text"> Download the <a href="https://a858-nycnotify.nyc.gov/notifynyc/" target="_blank" rel="noopener noreferrer">Notify NYC</a> 
        app or create an account to get the information you want to receive, the way you want to receive it. Registration offers 16 notification types, 
        including emergency and basement flooding alerts. </p>

        <h3 class="flood-rec-header"> Apply for the Business Preparedness and Resiliency Program (PREP) Risk Assessment and Grant Program  </h3>
        <p class="flood-rec-text"> The NYC Department of Small Business Services (SBS) offers a grant program to help small businesses assess their 
        flood risk and implement mitigation measures. <a href="https://nyc-business.nyc.gov/nycbusiness/emergency-preparedness/business-preparedness-and-resiliency-program/risk-assessment-and-preparedness-grant" target="_blank" rel="noopener noreferrer">Click here</a> 
        to learn more about the program. </p>

        <h3 class="flood-rec-header"> Install Backflow Preventer Valve </h3>
        <p class="flood-rec-text"> Using backwater valves, check valves, and drain plugs prevents sewer water from 
        rising into a residence or business through its basement plumbing during heavy rain. Homeowners in one- to four-family 
        buildings may be eligible for low- to no-interest loans to install backwater valves through NYC's Department of Housing and 
        Preservation Development <a href="https://sustainableneighborhoodsny.org/" target="_blank" rel="noopener noreferrer">Resilient Retrofits program</a>. </p>

         <h3 class="flood-rec-header"> Elevate Important Documents and Equipment  </h3>
        <p class="flood-rec-text"> Elevating important documents, equipment, and supplies can help you minimize damage during a flood. Move expensive inventory from 
        the basement to an upper floor, if possible. Consider digitizing important documents or moving them to a safe location off-site. If that is not feasible, a 
        portable waterproof storage box can preserve essential documents. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>

        <h3 class="flood-rec-header"> Elevate Mechanical Systems </h3>
        <p class="flood-rec-text"> Raising your property or critical mechanical systems above flood water levels can prevent damage, while also lowering your flood insurance premiums. 
        Learn more about potential retrofitting projects at <a href="https://www.floodhelpny.org/en/flood-retrofits" target="_blank" rel="noopener noreferrer">FloodHelpNY</a>. </p>

         <h3 class="flood-rec-header"> Document Costly Equipment and Inventory </h3>
        <p class="flood-rec-text"> Take photos of important equipment, inventory, and supplies before and after a flooding event. This will make it easier to get assistance 
        from insurance or FEMA disaster recovery funds or other relief funds that become available. </p>

         <h3 class="flood-rec-header"> Purchase Portable Flood Barriers  </h3>
        <p class="flood-rec-text"> Purchase ready-made flood barriers and make a plan to deploy them in case of heavy rain or coastal flooding. Alternatively, 
        keep materials, such as sandbags, plywood, plastic sheeting, and lumber, on hand to help protect your business.</p>

         <h3 class="flood-rec-header"> Purchase a Submersible Water Pump </h3>
        <p class="flood-rec-text"> A submersible water pump and hose can be used to prevent floodwater from accumulating inside a building or to remove water after 
        a flood event. This reduces damage to the building and supplies and speeds up the recovery process.</p>

        <h3 class="flood-rec-header"> Clean Catch Basins </h3>
        <p class="flood-rec-text"> Work with your neighbors to keep storm drains clear of debris, or call in problems to 311. You can also report issues through 
        the <a href="https://portal.311.nyc.gov/article/?kanumber=KA-01084" target="_blank" rel="noopener noreferrer">online portal</a>. This helps to prevent the accumulation of water during and after a rainstorm. </p>`;


    } else if (inExtreme && inHundredYear) {
        Rec = `
         <h3 class="flood-rec-header"> Purchase Flood Insurance </h3> 
        <p class="flood-rec-text"> Flood protection is not included in standard homeowners or renter's insurance, but can be obtained as a separate policy. Go to <a href="https://floodhelpny.org" target="_blank" rel="noopener noreferrer">FloodHelpNY</a> to learn more about flood insurance. Even if you are not in a FEMA flood zone, you may be at risk from stormwater flooding.</p>

        <h3 class="flood-rec-header"> Consider Purchasing Business Interruption Insurance </h3>
        <p class="flood-rec-text"> Business interruption insurance, or business income insurance, covers the income loss
         a business faces after a disaster, whether from facility closure or rebuilding. Standard property insurance might 
         not cover revenue loss, which can be vital for staying operational. </p>

        <h3 class="flood-rec-header"> Get Emergency Notifications Through Notify NYC </h3>
        <p class="flood-rec-text"> Download the <a href="https://a858-nycnotify.nyc.gov/notifynyc/" target="_blank" rel="noopener noreferrer">Notify NYC</a> 
        app or create an account to get the information you want to receive, the way you want to receive it. Registration offers 16 notification types, 
        including emergency and basement flooding alerts. </p>

        <h3 class="flood-rec-header"> Install Backflow Preventer Valve </h3>
        <p class="flood-rec-text"> Using backwater valves, check valves, and drain plugs prevents sewer water from 
        rising into a residence or business through its basement plumbing during heavy rain. Homeowners in one- to four-family 
        buildings may be eligible for low- to no-interest loans to install backwater valves through NYC's Department of Housing and 
        Preservation Development <a href="https://sustainableneighborhoodsny.org/" target="_blank" rel="noopener noreferrer">Resilient Retrofits program</a>. </p>

           <h3 class="flood-rec-header"> Elevate Important Documents and Equipment  </h3>
        <p class="flood-rec-text"> Elevating important documents, equipment, and supplies can help you minimize damage during a flood. Move expensive inventory from 
        the basement to an upper floor, if possible. Consider digitizing important documents or moving them to a safe location off-site. If that is not feasible, a 
        portable waterproof storage box can preserve essential documents. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>

        <h3 class="flood-rec-header"> Elevate Mechanical Systems </h3>
        <p class="flood-rec-text"> Raising your property or critical mechanical systems above flood water levels can prevent damage, while also lowering your flood insurance premiums. 
        Learn more about potential retrofitting projects at <a href="https://www.floodhelpny.org/en/flood-retrofits" target="_blank" rel="noopener noreferrer">FloodHelpNY</a>. </p>

         <h3 class="flood-rec-header"> Document Costly Equipment and Inventory </h3>
        <p class="flood-rec-text"> Take photos of important equipment, inventory, and supplies before and after a flooding event. This will make it easier to get assistance 
        from insurance or FEMA disaster recovery funds or other relief funds that become available. </p>

         <h3 class="flood-rec-header"> Purchase Portable Flood Barriers  </h3>
        <p class="flood-rec-text"> Purchase ready-made flood barriers and make a plan to deploy them in case of heavy rain or coastal flooding. Alternatively, 
        keep materials, such as sandbags, plywood, plastic sheeting, and lumber, on hand to help protect your business.</p>

         <h3 class="flood-rec-header"> Purchase a Submersible Water Pump </h3>
        <p class="flood-rec-text"> A submersible water pump and hose can be used to prevent floodwater from accumulating inside a building or to remove water after 
        a flood event. This reduces damage to the building and supplies and speeds up the recovery process.</p>

        <h3 class="flood-rec-header"> Clean Catch Basins </h3>
        <p class="flood-rec-text"> Work with your neighbors to keep storm drains clear of debris, or call in problems to 311. You can also report issues through 
        the <a href="https://portal.311.nyc.gov/article/?kanumber=KA-01084" target="_blank" rel="noopener noreferrer">online portal</a>. This helps to prevent the accumulation of water during and after a rainstorm. </p>

        <h3 class="flood-rec-header"> Install rain barrels to capture water </h3>
        <p class="flood-rec-text"> You can take a step to facilitate roof water drainage by installing a rain barrel to capture storm water and drain it after the storm. For more information, see New York City Department of Environmental Protection's 
        the <a href="https://www.nyc.gov/site/dep/water/types-of-green-infrastructure.page" target="_blank" rel="noopener noreferrer">green infrastructure page</a>. </p>`;
       

    } else if (inModerate) {
        Rec = `
        <h3 class="flood-rec-header"> Get Emergency Notifications Through Notify NYC </h3>
        <p class="flood-rec-text"> Download the <a href="https://a858-nycnotify.nyc.gov/notifynyc/" target="_blank" rel="noopener noreferrer">Notify NYC</a> 
        app or create an account to get the information you want to receive, the way you want to receive it. Registration offers 16 notification types, 
        including emergency and basement flooding alerts. </p>

        <h3 class="flood-rec-header"> Apply for the Business Preparedness and Resiliency Program (PREP) Risk Assessment and Grant Program  </h3>
        <p class="flood-rec-text"> The NYC Department of Small Business Services (SBS) offers a grant program to help small businesses assess their 
        flood risk and implement mitigation measures. <a href="https://nyc-business.nyc.gov/nycbusiness/emergency-preparedness/business-preparedness-and-resiliency-program/risk-assessment-and-preparedness-grant" target="_blank" rel="noopener noreferrer">Click here</a> 
        to learn more about the program. </p>

         <h3 class="flood-rec-header"> Consider Purchasing Flood Insurance </h3> 
        <p class="flood-rec-text"> Flood protection is not included in standard homeowners or renter's insurance, 
        but can be obtained as a separate policy. Go to <a href="https://floodhelpny.org" target="_blank" rel="noopener noreferrer">FloodHelpNY</a> to learn more about flood insurance. Even if you are not in a FEMA flood zone, you may be at risk from stormwater flooding.</p>

        <h3 class="flood-rec-header"> Install Backflow Preventer Valve </h3>
        <p class="flood-rec-text"> Using backwater valves, check valves, and drain plugs prevents sewer water from 
        rising into a residence or business through its basement plumbing during heavy rain. Homeowners in one- to four-family 
        buildings may be eligible for low- to no-interest loans to install backwater valves through NYC's Department of Housing and 
        Preservation Development <a href="https://sustainableneighborhoodsny.org/" target="_blank" rel="noopener noreferrer">Resilient Retrofits program</a>. </p>

         <h3 class="flood-rec-header"> Elevate Important Documents and Equipment  </h3>
        <p class="flood-rec-text"> Elevating important documents, equipment, and supplies can help you minimize damage during a flood. Move expensive inventory from 
        the basement to an upper floor, if possible. Consider digitizing important documents or moving them to a safe location off-site. If that is not feasible, a 
        portable waterproof storage box can preserve essential documents. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>

        <h3 class="flood-rec-header"> Elevate Mechanical Systems </h3>
        <p class="flood-rec-text"> Raising your property or critical mechanical systems above flood water levels can prevent damage, while also lowering your flood insurance premiums. 
        Learn more about potential retrofitting projects at <a href="https://www.floodhelpny.org/en/flood-retrofits" target="_blank" rel="noopener noreferrer">FloodHelpNY</a>. </p>

         <h3 class="flood-rec-header"> Document Costly Equipment and Inventory </h3>
        <p class="flood-rec-text"> Take photos of important equipment, inventory, and supplies before and after a flooding event. This will make it easier to get assistance 
        from insurance or FEMA disaster recovery funds or other relief funds that become available. </p>

         <h3 class="flood-rec-header"> Purchase Portable Flood Barriers  </h3>
        <p class="flood-rec-text"> Purchase ready-made flood barriers and make a plan to deploy them in case of heavy rain or coastal flooding. Alternatively, 
        keep materials, such as sandbags, plywood, plastic sheeting, and lumber, on hand to help protect your business.</p>

         <h3 class="flood-rec-header"> Purchase a Submersible Water Pump </h3>
        <p class="flood-rec-text"> A submersible water pump and hose can be used to prevent floodwater from accumulating inside a building or to remove water after 
        a flood event. This reduces damage to the building and supplies and speeds up the recovery process.</p>

        <h3 class="flood-rec-header"> Clean Catch Basins </h3>
        <p class="flood-rec-text"> Work with your neighbors to keep storm drains clear of debris, or call in problems to 311. You can also report issues through 
        the <a href="https://portal.311.nyc.gov/article/?kanumber=KA-01084" target="_blank" rel="noopener noreferrer">online portal</a>. This helps to prevent the accumulation of water during and after a rainstorm. </p>`;

    } else if (inExtreme) {
        Rec = `
        <h3 class="flood-rec-header"> Install Backflow Preventer Valve </h3>
        <p class="flood-rec-text"> Using backwater valves, check valves, and drain plugs prevents sewer water from 
        rising into a residence or business through its basement plumbing during heavy rain. Homeowners in one- to four-family 
        buildings may be eligible for low- to no-interest loans to install backwater valves through NYC's Department of Housing and 
        Preservation Development <a href="https://sustainableneighborhoodsny.org/" target="_blank" rel="noopener noreferrer">Resilient Retrofits program</a>. </p>

           <h3 class="flood-rec-header"> Elevate Important Documents and Equipment  </h3>
        <p class="flood-rec-text"> Elevating important documents, equipment, and supplies can help you minimize damage during a flood. Move expensive inventory from 
        the basement to an upper floor, if possible. Consider digitizing important documents or moving them to a safe location off-site. If that is not feasible, a 
        portable waterproof storage box can preserve essential documents. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>

         <h3 class="flood-rec-header"> Document Costly Equipment and Inventory </h3>
        <p class="flood-rec-text"> Take photos of important equipment, inventory, and supplies before and after a flooding event. This will make it easier to get assistance 
        from insurance or FEMA disaster recovery funds or other relief funds that become available. </p>

         <h3 class="flood-rec-header"> Purchase Portable Flood Barriers  </h3>
        <p class="flood-rec-text"> Purchase ready-made flood barriers and make a plan to deploy them in case of heavy rain or coastal flooding. Alternatively, 
        keep materials, such as sandbags, plywood, plastic sheeting, and lumber, on hand to help protect your business.</p>

         <h3 class="flood-rec-header"> Purchase a Submersible Water Pump </h3>
        <p class="flood-rec-text"> A submersible water pump and hose can be used to prevent floodwater from accumulating inside a building or to remove water after 
        a flood event. This reduces damage to the building and supplies and speeds up the recovery process.</p>

        <h3 class="flood-rec-header"> Get Emergency Notifications Through Notify NYC </h3>
        <p class="flood-rec-text"> Download the <a href="https://a858-nycnotify.nyc.gov/notifynyc/" target="_blank" rel="noopener noreferrer">Notify NYC</a> 
        app or create an account to get the information you want to receive, the way you want to receive it. Registration offers 16 notification types, 
        including emergency and basement flooding alerts. </p>

        <h3 class="flood-rec-header"> Clean Catch Basins </h3>
        <p class="flood-rec-text"> Work with your neighbors to keep storm drains clear of debris, or call in problems to 311. You can also report issues through 
        the <a href="https://portal.311.nyc.gov/article/?kanumber=KA-01084" target="_blank" rel="noopener noreferrer">online portal</a>. This helps to prevent the accumulation of water during and after a rainstorm. </p>

        <h3 class="flood-rec-header"> Install rain barrels to capture water </h3>
        <p class="flood-rec-text"> You can take a step to facilitate roof water drainage by installing a rain barrel to capture storm water and drain it after the storm. For more information, see New York City Department of Environmental Protection's 
        the <a href="https://www.nyc.gov/site/dep/water/types-of-green-infrastructure.page" target="_blank" rel="noopener noreferrer">green infrastructure page</a>. </p>`;

    } else if (inHundredYear) {
        Rec = `
         <h3 class="flood-rec-header"> Purchase Flood Insurance </h3> 
        <p class="flood-rec-text"> Flood protection is not included in standard homeowners or renter's insurance, but can be obtained as a separate policy. 
        Go to <a href="https://floodhelpny.org" target="_blank" rel="noopener noreferrer">FloodHelpNY</a> to learn more about flood insurance. Even if you are not in a FEMA flood zone, you may be at risk from stormwater flooding.</p>

        <h3 class="flood-rec-header"> Get Emergency Notifications Through Notify NYC </h3>
        <p class="flood-rec-text"> Download the <a href="https://a858-nycnotify.nyc.gov/notifynyc/" target="_blank" rel="noopener noreferrer">Notify NYC</a> 
        app or create an account to get the information you want to receive, the way you want to receive it. Registration offers 16 notification types, 
        including emergency and basement flooding alerts. </p>

         <h3 class="flood-rec-header"> Elevate Important Documents and Equipment  </h3>
        <p class="flood-rec-text"> Elevating important documents, equipment, and supplies can help you minimize damage during a flood. Move expensive inventory from 
        the basement to an upper floor, if possible. Consider digitizing important documents or moving them to a safe location off-site. If that is not feasible, a 
        portable waterproof storage box can preserve essential documents. This should include evacuation routes, emergency contacts, and a plan for securing your property.</p>

        <h3 class="flood-rec-header"> Elevate Mechanical Systems </h3>
        <p class="flood-rec-text"> Raising your property or critical mechanical systems above flood water levels can prevent damage, while also lowering your flood insurance premiums. 
        Learn more about potential retrofitting projects at <a href="https://www.floodhelpny.org/en/flood-retrofits" target="_blank" rel="noopener noreferrer">FloodHelpNY</a>. </p>

         <h3 class="flood-rec-header"> Document Costly Equipment and Inventory </h3>
        <p class="flood-rec-text"> Take photos of important equipment, inventory, and supplies before and after a flooding event. This will make it easier to get assistance 
        from insurance or FEMA disaster recovery funds or other relief funds that become available. </p>

         <h3 class="flood-rec-header"> Purchase a Submersible Water Pump </h3>
        <p class="flood-rec-text"> A submersible water pump and hose can be used to prevent floodwater from accumulating inside a building or to remove water after 
        a flood event. This reduces damage to the building and supplies and speeds up the recovery process.</p>`;

    } else {
        Rec = `
        <h3 class="flood-rec-header"> Clean Catch Basins </h3>
        <p class="flood-rec-text"> Work with your neighbors to keep storm drains clear of debris, or call in problems to 311. You can also report issues through 
        the <a href="https://portal.311.nyc.gov/article/?kanumber=KA-01084" target="_blank" rel="noopener noreferrer">online portal</a>. This helps to prevent the accumulation of water during and after a rainstorm. </p>

        <h3 class="flood-rec-header"> Install rain barrels to capture water </h3>
        <p class="flood-rec-text"> You can take a step to facilitate roof water drainage by installing a rain barrel to capture storm water and drain it after a storm. This helps your property and your downhill neighbors stay dry. 
        They also help to reduce the amount of stormwater runoff that enters the sewer system, which can help to prevent basement flooding in your neighborhood.
        For more information, see New York City Department of Environmental Protection's 
        the <a href="https://www.nyc.gov/site/dep/water/types-of-green-infrastructure.page" target="_blank" rel="noopener noreferrer">green infrastructure page</a>. </p>`;
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
    document.getElementById('resource-list').innerHTML = Rec;

});

// === Load GeoJSON and Add Layers ===
map.on('load', async () => {
    const moderateResponse = await fetch('Moderate_Flood_WGS84_Simple.json');
    moderateFloodData = await moderateResponse.json();

    const extremeResponse = await fetch('Extreme_Flood_noHighTide_Dissolved.geojson');
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

    console.log(moderateFloodData);
    console.log(extremeFloodData);
    console.log(hundredYearFloodData);
    console.log(moderateFloodData.features[0].geometry.coordinates);


    map.addLayer({
        id: 'extremeFloodLayer',
        type: 'fill',
        source: 'extremeFlood',
        paint: {
            'fill-color': '#fde74c',
            'fill-opacity': 0.3,
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

    // Ensure 'settlement-subdivision-label' is on top of all flood layers
    map.moveLayer('settlement-subdivision-label');

    // Ensure 'road-label-simple' is above the data layers but below 'settlement-subdivision-label'
    map.moveLayer('road-label-simple', 'settlement-subdivision-label'); // Place it below settlement-subdivision-label

    // Ensure labels appear above data layers and move 'settlement-subdivision-label' first
    map.moveLayer('settlement-subdivision-label', 'HundredYearFloodOutline'); // Ensure it is above all data layers

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
    document.getElementById('flood-risk-text').textContent = 'Search for a property on the map to see flood risk information.';
    document.getElementById('resource-list').textContent = 'Search for a property on the map to see flood mitigation resources.';
});