let table;
let canvas;
let rows
let mappa = new Mappa('MapboxGL', 'pk.eyJ1IjoiamFzb25qaWFuZyIsImEiOiJjanVkcG9oa2kwaDY5NDRtbjhrbjQ3YjU3In0.22j_LKssPcNg6AdR8qeUQg');
let glMap;
var my_driving = [];

function preload(){
	table = loadTable("data/2018-09.csv", "csv", "header");
}

function setup() {
	canvas = createCanvas(window.innerWidth, window.innerHeight-200);
	let minLat = 200;
	let minLong = 200;
	let maxLat = -200;
	let maxLong = -200;

	for(let r = 0; r < table.getRowCount(); r++){
	  	if(table.getString(r,'latitude') != "" && table.getString(r,'vehicleSpeedSensorKmPerHour') != "" 
	  		&&table.getString(r,'manifoldAirFlowGramsPerSecond') != ""){
	  		let dateTime = table.getString(r, "recordDateTime");
			let latitude = table.getNum(r,'latitude');
			let longitude = table.getNum(r,'longitude');
			let speed = table.getNum(r, 'vehicleSpeedSensorKmPerHour')*0.621371;
			let maf = table.getNum(r, "manifoldAirFlowGramsPerSecond");

	  		if(latitude < minLat)
	  			minLat = latitude;
	  		if(latitude > maxLat)
	  			maxLat = latitude;
	  		if(longitude < minLong)
	  			minLong = longitude
	  		if(longitude > maxLong)
	  			maxLong = longitude;
	  		var this_driving = new driving(dateTime, latitude, longitude, speed, maf);
	  		my_driving.push(this_driving);
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
	glMap.onChange(function(){
		clear();
		for(let i in my_driving){
			my_driving[i].drawDriving();
		}
	});
	fill(207, 204, 0);
	noStroke();
	//noLoop();
}

var driving = function(dt,lat,lng,spd,maf){
	this.dateTime = dt;
	this.latitude = lat;
	this.longitude = lng;
	this.speed = spd;
	this.massair = maf;
	this.mpg = 710.7 * (spd/0.621371) / (maf*100);
	
	this.selected = function(){
		let pos = glMap.latLngToPixel(this.latitude, this.longitude);
		if(dist(mouseX, mouseY, pos.x, pos.y) < 3)
			return true;
		else
			return false;
	}

	this.displayInfo = function(){
		fill(220,220,220,500);
		rect(mouseX+50, mouseY-200, 200, 150, 10);
		let s = "Date, Time: "+ this.dateTime + "\n\n" + "Speed: " + this.speed.toFixed(2) + "\n\n" + "MPG: " + this.mpg.toFixed(2);
		fill(0,0,0,500);
		textSize(14);
		text(s, mouseX+60, mouseY-190, 200, 150); 
	}

	this.drawDriving = function(){
		if(this.speed >= 65 && this.speed < 80)
			fill(255,204,0,500);
		else if(this.speed >= 80 && this.speed < 100)
			fill(255,69,0,500);
		else if(this.speed >= 100)
			fill(186,85,211,500);
        else
          	fill(0,255,0,500);
        let pos = glMap.latLngToPixel(this.latitude, this.longitude);
        let size = 1 + glMap.zoom()/2;
		ellipse(pos.x, pos.y, size,size);
	}

	this.drawDrivingSelected = function(){
		if(this.speed >= 65 && this.speed < 80)
			fill(255,204,0,500);
		else if(this.speed >= 80 && this.speed < 100)
			fill(255,69,0,500);
		else if(this.speed >= 100)
			fill(186,85,211,500);
        else
          	fill(0,255,0,500);
        let pos = glMap.latLngToPixel(this.latitude, this.longitude);
        let size = 1 + glMap.zoom()/2;
		ellipse(pos.x, pos.y, size+15,size+15);
	}
}

function draw() {
	clear();
	for(let i in my_driving){
		if(my_driving[i].selected()){
			my_driving[i].drawDrivingSelected();
			my_driving[i].displayInfo();
		}
		else
			my_driving[i].drawDriving();
	}
}
