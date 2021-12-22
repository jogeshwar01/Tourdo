/* eslint-disable */   //to disable esLint as this is js and not nodejs so we dont want node errors
//could have used mapbox npm library but that gives some issues with parcel-bundler so we use the script tags cdn only

export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9nZXNod2FyMDEiLCJhIjoiY2t4aDZzdm5rMXpsYTJ3cGQzOHV3NWZtZSJ9.4O3OBTuvYV1xYG8scxid-w';

    var map = new mapboxgl.Map({
        container: 'map',   //put this on the one with id of map --thats why we put id of element as map earlier
        style: 'mapbox://styles/jogeshwar01/ckxh8697n4zvv15phyd6w2hs4',
        scrollZoom: false   //disable zoom for smooth scroll
        // center: [-118.113491, 34.111745],
        // zoom: 10,
        // interactive: false
    });

    //area that will be displayed on the map -we want all our locations of a tour
    const bounds = new mapboxgl.LngLatBounds()

    //to put markers on locations
    locations.forEach(loc => {
        // Create marker
        const el = document.createElement('div');   //standard JS
        el.className = 'marker';    //this is in css where we have our image

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'    //bottom of the pim image will point to the location 
        })
            .setLngLat(loc.coordinates) //gets our exact coordinates
            .addTo(map);

        // Add popup on locations
        new mapboxgl.Popup({
            offset: 30  //to prevent overlap of popup on marker
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)   //define html of popups
            .addTo(map);

        // Extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });

    //gives zoom ANIMATION --zooms and fits the map to show our pin images
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}






