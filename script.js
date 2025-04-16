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
    zoom: 10.92,
    style: 'mapbox://styles/mapbox/dark-v11',
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

        if (!isWithinNYCBounds(lng, lat)) {
            alert('Address is outside of NYC. Please search within the five boroughs.');
            return;
        }

        map.flyTo({
            center: [lng, lat],
            zoom: 15
        });

        if (searchMarker) {
            searchMarker.setLngLat([lng, lat]);
        } else {
            searchMarker = new mapboxgl.Marker({
                color: '#0E34A0',
                draggable: false
            })
            .setLngLat([lng, lat])
            .addTo(map);
        }

    } catch (error) {
        console.error('Geocoding error:', error);
        alert('There was a problem searching for the address.');
    }
});

map.on('load', () => {
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
});

map.on('click', () => {
    if (searchMarker) {
        searchMarker.remove();
        searchMarker = null;
    }
});

