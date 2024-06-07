Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1NmYzNGVhOC02MTkzLTQ3MWMtYmVhNC0zZGU4YjI5MWRiM2EiLCJpZCI6MjIwNDIwLCJpYXQiOjE3MTc2NDA5NzJ9.3PEp4J2fXfyDKc4VLf0_wuTyL3khGRmyUzh0vosC4TA';

const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: Cesium.Terrain.fromWorldTerrain(),
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    animation: false,
    timeline: false,
    infoBox: false,
    vrButton: false,
});

viewer.scene.screenSpaceCameraController.enableZoom = false;
viewer.scene.screenSpaceCameraController.enableRotate = false;
viewer.scene.screenSpaceCameraController.enableTranslate = false;
viewer.scene.screenSpaceCameraController.enableTilt = false;
viewer.scene.screenSpaceCameraController.enableLook = false;

const osmBuildings = await Cesium.createOsmBuildingsAsync();
viewer.scene.primitives.add(osmBuildings);

const positionProperty = new Cesium.SampledPositionProperty();

async function fetchISSLocation() {
    //const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
    const response = await fetch('/.netlify/functions/issNow');
    const data = await response.json();
    //updateLocationDataDiv(data);
    const latitude = parseFloat(data.iss_position.latitude);
    const longitude = parseFloat(data.iss_position.longitude);
    const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, 400000); // Approximate ISS altitude in meters

    const currentTime = Cesium.JulianDate.now();
    positionProperty.addSample(currentTime, position);

    // Check if the ISS entity already exists
    let issEntity = viewer.entities.getById('iss');
    if (!issEntity) {
        // If it doesn't exist, create it
        issEntity = viewer.entities.add({
            id: 'iss',
            description: `Location: (${data.iss_position.longitude}, ${data.iss_position.latitude}, ${400000})`,
            position: position,
            point: { pixelSize: 10, color: Cesium.Color.RED }
        });
    } else {
        // If it exists, update the position
        issEntity.position = position;
        issEntity.description = `Location: (${data.iss_position.longitude}, ${data.iss_position.latitude}, ${400000})`;
    }

    // Adjust the camera to show the full globe
    viewer.scene.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 20000000) // Adjust altitude to show full globe
    });

}

const updateLocationDataDiv = (data) => {
    const locationInfoBoxContent = document.getElementById('iss-location-data-div');

    locationInfoBoxContent.innerHTML = `
    <p>
        <span style="display: block;">Latitude: ${data.latitude.toFixed(6)}</span>
        <span style="display: block;">Longitude: ${data.longitude.toFixed(6)}</span>
        <span style="display: block;">Altitude: ${data.altitude.toFixed(2)} km</span>
        <span style="display: block;">Velocity: ${data.velocity.toFixed(2)} km/h</span>
        <span style="display: block;">Visibility: ${data.visibility}</span>
        <span style="display: block;">Timestamp: ${new Date(data.timestamp * 1000).toUTCString()}</span>
    </p>
    `;
}

async function updateAstronautDynamicContent() {
    //const astronautsResponse = await fetch('http://api.open-notify.org/astros.json');
    const astronautsResponse = await fetch('/.netlify/functions/astros');

    const astronautsData = await astronautsResponse.json();
    const astronauts = astronautsData.people.map(person => `${person.name} (${person.craft})`).join(', ');

    document.getElementById('astronautDynamicContent').innerHTML = `
                <p>Astronauts currently in space:</p>
                <p>${astronauts}</p>
            `;
}

setTimeout(() => {
    fetchISSLocation();
    updateAstronautDynamicContent();
}, "3000");
setInterval(fetchISSLocation, 5000);
fetchISSLocation();
