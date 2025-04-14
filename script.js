


mapboxgl.accessToken = 'pk.eyJ1IjoiZGJlcmdlcjMyNCIsImEiOiJjbTkxejI1ODYwMGQ1MmxvbWZreDZhMGgxIn0.nfxxsMs9W6jzp0-Wo-OEZg';

const mapOptions = {
    container: 'map-container', // container ID
    center: [-73.99432, 40.71103], // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 10.92, // starting zoom
    style: 'mapbox://styles/mapbox/dark-v11', // style URL
}

const map = new mapboxgl.Map(mapOptions);


map.on('load', () => {

    // Add new sources from external GeoJSON files
    map.addSource('moderateFlood', {
        type: 'geojson',
        data: 'moderate_flood_simple.json'
    });

    map.addSource('extremeFlood', {
        type: 'geojson',
        data: 'extreme_flood_simple.json'
    });

    // Add new layers
   

    map.addLayer({
        id: 'extremeFloodLayer',
        type: 'fill',
        source: 'extremeFlood',
        paint: {
            'fill-color': '#fde74c', // Changed to yellow
            'fill-opacity': 0.5,
            'fill-outline-color': '#fde74c', 
            'fill-outline-width': 2,
            'fill-outline-opacity': 1.0,
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
        'fill-outline-width': 2,
        'fill-outline-opacity': 1.0,
    }
    });

    });
