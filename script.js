
//Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYmVybjY2IiwiYSI6ImNsZG0xMjBqdTA0eWMzeG81Mzk4NjFsMWQifQ.9POsafO8U6TU5MkjHuOZMA'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

//Map initialization
const map = new mapboxgl.Map({
    container: 'map', //container id in HTML
    style: 'mapbox://styles/bern66/clffsesje000301pjwp9cg0wg',  //Map style
    center: [-79.39, 43.65],  // starting point
    zoom: 12 // starting zoom level
});

map.addControl (new mapboxgl.NavigationControl());

//New variable

let collisionjson;

//Creating empty variable from online repository

fetch('https://raw.githubusercontent.com/elcougario/lab4/main/ggr472-lab4/data/pedcyc_collision_06-21.geojson')
.then(response => response.json())
    .then(response => {
        console.log(response); //Check response in console
        collisionjson = response; // Store geojson as variable using URL from fetch response
    });

//Distance between two points
document.getElementById('distbutton').addEventListener('click', () => {
    
    let distance = turf.distance(collisionjson.features[0], collisionjson.features[1], 'kilometers');
    console.log("Distance between " + collisionjson.features[0].properties.ACCNUM + " and " + collisionjson.features[1].properties.ACCNUM + " : " + distance + " km");


});

//UPLOADED COLL DATA
map.on ('load', ()=> {

    map.addSource ('coll-toronto', {
        "type": "geojson",
        "data": collisionjson
    });
    
    map.addLayer ({
        'id': 'coll-toronto-pnts',
        'type': 'circle',
        'source': 'coll-toronto',
        'paint': {
            'circle-radius': 7,
            'circle-color': 'yellow'
        }
        
    });

    }); 
//BOUNDING BOX  

let bboxgeojson;

document.getElementById('bboxbutton').addEventListener('click', () => {
    let bbox = turf.envelope(collisionjson);

    bboxgeojson ={
        "type": "FeatureCollection",
        "features": [bbox]

        
    };

//able to see reesponse in console
    console.log(bbox)
    console.log(bbox.geometry.coordinates) 
    bbox.geometry.coordinates[0][0][0]

//adding bounding box to map display
map.addSource ('envelopeGeoJSON', {
    "type": "geojson",
    "data": bboxgeojson
});
map.addLayer({
    "id": "coll-Envelope",
    "type": "fill",
    "source": "envelopeGeoJSON",
    "paint": {
        'fill-color': "red",
        'fill-opacity': 0.5,
        'fill-outline-color': "black"
    }
});

//No click back

document.getElementById('bboxbutton').disabled = false;

})

//HEXGRID
document.getElementById('hexbutton').addEventListener('click', () => {

//define height+width
let bounds = turf.bbox(collisionjson);

//Dimension of bbox
let bboxWidth = bounds[2] - bounds[0];
let bboxHeight = bounds[3] - bounds[1];

//10% expanded surf
let expandedBounds = [
    bounds[0] - 0.1 * bboxWidth,
    bounds[1] - 0.1 * bboxHeight,
    bounds[2] + 0.1 * bboxWidth,
    bounds[3] + 0.1 * bboxHeight
  ];

// grid parameters
let hexSize = 500
let options = { units: 'meters' };

// hex grid
let hexGrid = turf.hexGrid(expandedBounds, hexSize, options);

// collect collision data into hex grid
let collishex = turf.collect(hexGrid, collisionjson, 'number', 'values');

// set the COUNT property for each hexagon
collishex.features.forEach((feature) => {
  let count = feature.properties.values ? feature.properties.values.length : 0;
  feature.properties.COUNT = count;
});

// log the COUNT property of each hexagon
collishex.features.forEach((feature) => {
  console.log('Hexagon:', feature.properties.hex_id);
  console.log('Collision count:', feature.properties.COUNT);
});

// add source and layer
  map.addSource("hex-grid", {
    type: "geojson",
    data: hexGrid
  });
  

// Display hexagones outline.
map.addLayer ({
    id:'hexoutline',
    type: 'line',
    source: 'hex-grid',
    paint: {  
        'line-width': 1,
        'line-color': "black"
}
});

map.addSource('pnts-cnts', {
    type: 'number',
    data: collishex
  });

//Display colors of hexagones (There seems to be a problem with a library but simply cant figure out)
  map.addLayer({
    id: "hex-grid-color",
    type: "fill",
    source: "pnts-cnts",
    paint: [ "interpolate",
            ["linear"],
         ['number'["get", "COUNT"]],
            0, '#2DC4B2',
            1, '#3BB3C3',
            2, '#669EC4',
            3, '#A2719B',
            4,'#AA5E79'
           
    ]
  });

//Add source & layer

  document.getElementById('hexbutton').disabled = false;
});




   