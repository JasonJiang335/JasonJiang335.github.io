let table;
let canvas;
let rows
let gMap;
let mappa = new Mappa('Google', 'AIzaSyAFaeJld5AQccJpQg9nTkkq1FmM_Xh6Ni0');

const style = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];

function preload(){
	table = loadTable("data/2018-08.csv", "csv", "header");
}

function setup() {
	canvas = createCanvas(1024, 768);
	let minLat = 200;
	let minLong = 200;
	let maxLat = -200;
	let maxLong = -200;

	rows = table.getRows();
	for(var r = 0; r < rows.length; r++){
		if(rows[r].getString("latitude") != ""){
			let latitude = rows[r].getNum("latitude");
			let longitude = rows[r].getNum("longitude");
		if(latitude < minLat)
			minLat = latitude;
		if(latitude > maxLat)
			maxLat = latitude;
		if(longitude < minLong)
			minLong = longitude
		if(longitude > maxLong)
			maxLong = longitude;
	}
  }

  console.log("minLong: " + minLong + "  maxLong: " + maxLong);
  console.log("minLat: " + minLat + "  maxLat: " + maxLat);

  let options = {
	lat: (minLat+maxLat)/2,
	lng: (minLong+maxLong)/2,
	zoom: 8,
	mapTypeId: 'roadmap',
	styles: style//"http://{s}.tile.osm.org/{z}/{x}/{y}.png"
  }
  gMap = mappa.tileMap(options);
  gMap.overlay(canvas)
  gMap.onChange(drawDrive);
  fill(207, 204, 0);
  noStroke();
}

function draw() {}

function drawDrive(){
	clear();
	for(var r = 0; r < rows.length; r++){
		let dateTime = rows[r].getString("recordDateTime");
		if(rows[r].getString("rpm") != "")
			var rpm = rows[r].getNum("rpm");
		if(rows[r].getString("vehicleSpeedSensorKmPerHour") != "")
			var speed = rows[r].getNum("vehicleSpeedSensorKmPerHour")*0.621371;
		if(rows[r].getString("latitude") != ""){
			var latitude = rows[r].getNum("latitude");
			var longitude = rows[r].getNum("longitude");
			if (gMap.map.getBounds().contains({ lat: latitude, lng: longitude })) {
				let pos = gMap.latLngToPixel(latitude, longitude);
				//size = map(3, 10, 10, 1, 10) + gMap.zoom();
				if(speed >= 75)
					fill(255,0,0,500);
				else
					fill(0,255,0,500);
				ellipse(pos.x, pos.y, 4, 4);
			}
		}
	}
}