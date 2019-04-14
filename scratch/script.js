let table;
let canvas;
let rows
let glMap;
let mappa = new Mappa('MapboxGL', 'pk.eyJ1IjoiamFzb25qaWFuZyIsImEiOiJjanViNDFhbHkwOWdzNDNwdXV6b3R1dHM0In0.lRwXk3FgtAvVBYf9xMcIAA');

function preload(){
	table = loadTable("data/2018-09.csv", "csv", "header");
}

function setup() {
	canvas = createCanvas(1024, 768);//.parent('canvasContainer');
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
  	style: 'mapbox://styles/mapbox/light-v9',
  	pitch: 20
  }
  glMap = mappa.tileMap(options);
  glMap.overlay(canvas)
  glMap.onChange(drawDrive);
  fill(207, 204, 0);
  noStroke();
  noLoop();
}

function draw() {}

function drawDrive(){
	clear();
	for(var r = 0; r < rows.length; r++){
		//let dateTime = rows[r].getString("recordDateTime");
		//if(rows[r].getString("rpm") != "")
			//var rpm = rows[r].getNum("rpm");
		//if(rows[r].getString("vehicleSpeedSensorKmPerHour") != "")
			//var speed = rows[r].getNum("vehicleSpeedSensorKmPerHour")*0.621371;

		if(table.getString(r,'latitude') != "" && table.getString(r,'vehicleSpeedSensorKmPerHour') != ""){
			const latitude = table.getNum(r,'latitude');
			const longitude = table.getNum(r,'longitude');
			const speed = table.getNum(r, 'vehicleSpeedSensorKmPerHour')*0.621371;
			//var maf = rows[r].getNum("manifoldAirFlowGramsPerSecond");
			//var mpg = 710.7 * (speed/0.621371) / maf;
			const pos = glMap.latLngToPixel(latitude, longitude);
			let size = 4 + glMap.zoom()/5;
			if(speed >= 65 && speed < 80)
				fill(255,204,0,500);
			else if(speed >= 80 && speed < 100)
				fill(255,69,0,500);
			else if(speed >= 100)
				fill(186,85,211,500);
        	else
          		fill(0,255,0,500);
          	if(dist(mouseX, mouseY, pos.x, pos.y) < 3)
          		triangle(pos.x, pos.y-2.5, pos.x-3, pos.y+2.5, pos.x+3, pos.y+2.5);
			else;
				ellipse(pos.x, pos.y, size, size);
		}
	}
}