let table;
let canvas;
let rows
let glMap;
let mappa = new Mappa('MapboxGL', 'pk.eyJ1IjoiamFzb25qaWFuZyIsImEiOiJjanVkcG9oa2kwaDY5NDRtbjhrbjQ3YjU3In0.22j_LKssPcNg6AdR8qeUQg');
var my_driving = [];
let date = null;
let file_path = "data/2018-08.csv";
var pos;
var this_driving;
function setup() {
	load(file_path, (table) => {
		canvas = createCanvas(window.innerWidth, window.innerHeight-150);
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
	  			this_driving = new driving(dateTime, latitude, longitude, speed, maf);
				my_driving.push(this_driving);
	  		}
  		}
		//console.log('in setup, my_driving: ', my_driving)  
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
	})
}

function getDate(){
	let jsDate1 = $('#datepicker1').datepicker('getDate');
	let jsDate2 = $('#datepicker2').datepicker('getDate');
	if (jsDate1 !== null && jsDate2 !== null) { // if any date selected in datepicker
		jsDate1 instanceof Date; // -> true
		jsDate2 instanceof Date; 
		let theDate = {
			date1 : jsDate1,
			date2 : jsDate2,
			day1: jsDate1.getDate(),
			month1: jsDate1.getMonth(),
			year1: jsDate1.getFullYear(),
			day2: jsDate2.getDate(),
			month2: jsDate2.getMonth(),
			year2: jsDate2.getFullYear()
		}
		console.log('theDate: ', theDate)
		if (jsDate1 <= jsDate2) 
			return theDate;
		else{
			alert("Please correct the date input!");
			return null;
		}
		
	}
	else{
		alert("Please correct the date input!");
		jsDate = null;
		return jsDate;
	}
}

$('#btn_submit').click(function(){
	date = getDate();
	readData(date)
});

async function readData(the_date) {
	let table_array = [];
	if (the_date == null) {
		file_path = "data/2018-08.csv";
		load(file_path, (the_table) => {
			newSetup(table_array[the_table], 1, 31)
		})
		console.log(file_path)
	} else {
		let the_day1 = the_date.day1, the_month1 = the_date.month1+1, the_year1 = the_date.year1, the_day2 = the_date.day2, the_month2 = the_date.month2+1, the_year2 = the_date.year2;
		if(the_month1 < 8 && the_year1 <= 2018 || the_month2 > 3 && the_year2 >= 2019 ) {
			file_path = "data/2018-08.csv";
			alert("Please correct the date input!");
			load(file_path, (the_table) => {
				newSetup(table_array[the_table], 1, 31)
			})
			console.log(file_path)
			alert('please enter the valid date')
		} else if (the_date.date1 > the_date.date2) {
			alert('please enter the valid date')
			file_path = "data/2018-08.csv";
			load(file_path, (the_table) => {
				newSetup(table_array[the_table], 1, 31)
			})
			console.log(file_path)
		} else {
			let str_month = '';
			if (the_year1 < the_year2) {
				let temp_year = the_year1, temp_month = the_month1;
				while (temp_year < the_year2 && temp_month < 13) {
					if(temp_month < 10) {
						str_month = "0" +""+ temp_month
					} else {
						str_month = temp_month
					}
					let temp_path = "data/" + temp_year + "-" + str_month + ".csv";
					console.log(temp_path)
					await load(temp_path, (the_table) => {
						table_array.push(the_table);
					})
					temp_month += 1;
					if (temp_month == 13) {
						temp_year += 1;
						temp_month = 1;
					}
				}
				while (temp_year == the_year2 && temp_month <= the_month2) {
					if(temp_month < 10) {
						str_month = "0" +""+ temp_month
					} else {
						str_month = temp_month
					}
					let temp_path = "data/" + temp_year + "-" + str_month + ".csv";
					console.log(temp_path)
					await load(temp_path, (the_table) => {
						table_array.push(the_table);
					})
					temp_month += 1;
				}
				newSetup(table_array, the_day1, the_day2)
			}
			else if (the_year1 == the_year2 && the_month1 < the_month2) {
				for (let temp_month = the_month1; temp_month <= the_month2; temp_month++) {
					if(temp_month < 10) {
						temp_month = "0" +""+ temp_month
					}
					let temp_path = "data/" + the_year2 + "-" + temp_month + ".csv";
					console.log(temp_path)
					await load(temp_path, (the_table) => {
						table_array.push(the_table);
					})
				}
				newSetup(table_array, the_day1, the_day2)
			} 
			else if (the_year1 == the_year2 && the_month1 == the_month2 && the_day1 <= the_day2) {
				let temp_month = the_month1;
				if(temp_month < 10) {
					temp_month = "0" +""+ temp_month
				}
				let temp_path = "data/" + the_year2 + "-" + temp_month + ".csv";
				console.log(temp_path)
				await load(temp_path, (the_table) => {
					table_array.push(the_table);
				})
				newSetup(table_array, the_day1, the_day2)
			} 
			else {
				file_path = "data/2018-08.csv";
				await load(file_path, (the_table) => {
					newSetup(table_array[the_table], 1, 31)
				})
				console.log(file_path)
			}
		}
	}
}

async function loadfile(path) {    
    return new Promise((resolve, reject) => {
        loadTable(path, "csv", "header", (res, err) => {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    })
}

async function load(file_path, callback){
	if (date == null) {
		await loadfile(file_path)
		.then(res => {
			the_table = res;
			console.log(the_table)
			callback(the_table)
		})
		.catch(err => {
			console.log('the err is: ', err)
		})
		console.log(file_path)
	} else {
		await loadfile(file_path)
		.then(res => {
			the_table = res;
			callback(the_table)
		})
		.catch(err => {
			console.log(err)
		})
	}
}

function newSetup(table_array, day1, day2) {
	my_driving = [];
	//console.log("init my driving", my_driving);
	let minLat = 200;
	let minLong = 200;
	let maxLat = -200;
	let maxLong = -200;

	let SdateTime = "", dateTime = null, table_day = 0;

	if (table_array.length == 1) {
		array_table = table_array[0];
		for(let r = 0; r < array_table.getRowCount(); r++){
			if (array_table.getString(r, "recordDateTime") != "") {
				SdateTime = array_table.getString(r, "recordDateTime");
				dateTime = new Date(SdateTime)
				table_day = dateTime.getDate();
			}
			if(table_day >= day1 && table_day <= day2 && array_table.getString(r,'latitude') != "" && array_table.getString(r,'vehicleSpeedSensorKmPerHour') != "" 
			&&array_table.getString(r,'manifoldAirFlowGramsPerSecond') != ""){
				//console.log("in one month day:", table_day)
				let latitude = array_table.getNum(r,'latitude');
				let longitude = array_table.getNum(r,'longitude');
				let speed = array_table.getNum(r, 'vehicleSpeedSensorKmPerHour')*0.621371;
				let maf = array_table.getNum(r, "manifoldAirFlowGramsPerSecond");

				if(latitude < minLat)
					minLat = latitude;
				  if(latitude > maxLat)
					  maxLat = latitude;
				  if(longitude < minLong)
					  minLong = longitude
				  if(longitude > maxLong)
					  maxLong = longitude;
				  this_driving = new driving(dateTime, latitude, longitude, speed, maf);
				my_driving.push(this_driving);
			}
		}
	}
	else {
		for(let i = 0; i < table_array.length; i++) {
			let array_table = table_array[i];
			if(i == 0){
				for(let r = 0; r < array_table.getRowCount(); r++){
					if (array_table.getString(r, "recordDateTime") != "") {
						SdateTime = array_table.getString(r, "recordDateTime");
						dateTime = new Date(SdateTime)
						table_day = dateTime.getDate();
					}
					if(table_day >= day1 && array_table.getString(r,'latitude') != "" && array_table.getString(r,'vehicleSpeedSensorKmPerHour') != "" 
					&&array_table.getString(r,'manifoldAirFlowGramsPerSecond') != ""){
						//console.log("the begining month day:", table_day)
						let latitude = array_table.getNum(r,'latitude');
						let longitude = array_table.getNum(r,'longitude');
						let speed = array_table.getNum(r, 'vehicleSpeedSensorKmPerHour')*0.621371;
						let maf = array_table.getNum(r, "manifoldAirFlowGramsPerSecond");
		
						if(latitude < minLat)
							minLat = latitude;
						  if(latitude > maxLat)
							  maxLat = latitude;
						  if(longitude < minLong)
							  minLong = longitude
						  if(longitude > maxLong)
							  maxLong = longitude;
						  this_driving = new driving(dateTime, latitude, longitude, speed, maf);
						my_driving.push(this_driving);
					}
				}
			} else if (i == table_array.length-1) {
				for(let r = 0; r < array_table.getRowCount(); r++){
					if (array_table.getString(r, "recordDateTime") != "") {
						SdateTime = array_table.getString(r, "recordDateTime");
						dateTime = new Date(SdateTime)
						table_day = dateTime.getDate();
					}
					if(table_day <= day2 && array_table.getString(r,'latitude') != "" && array_table.getString(r,'vehicleSpeedSensorKmPerHour') != "" 
					&&array_table.getString(r,'manifoldAirFlowGramsPerSecond') != ""){
						//console.log("the ending month day:", table_day)
						let latitude = array_table.getNum(r,'latitude');
						let longitude = array_table.getNum(r,'longitude');
						let speed = array_table.getNum(r, 'vehicleSpeedSensorKmPerHour')*0.621371;
						let maf = array_table.getNum(r, "manifoldAirFlowGramsPerSecond");
		
						if(latitude < minLat)
							minLat = latitude;
						  if(latitude > maxLat)
							  maxLat = latitude;
						  if(longitude < minLong)
							  minLong = longitude
						  if(longitude > maxLong)
							  maxLong = longitude;
						  this_driving = new driving(dateTime, latitude, longitude, speed, maf);
						my_driving.push(this_driving);
					}
				}
			} 
			else {
				for(let r = 0; r < array_table.getRowCount(); r++){
					if(array_table.getString(r,'latitude') != "" && array_table.getString(r,'vehicleSpeedSensorKmPerHour') != "" 
					&&array_table.getString(r,'manifoldAirFlowGramsPerSecond') != ""){
						SdateTime = array_table.getString(r, "recordDateTime");
						dateTime = new Date(SdateTime)
						let latitude = array_table.getNum(r,'latitude');
						let longitude = array_table.getNum(r,'longitude');
						let speed = array_table.getNum(r, 'vehicleSpeedSensorKmPerHour')*0.621371;
						let maf = array_table.getNum(r, "manifoldAirFlowGramsPerSecond");
		
						if(latitude < minLat)
							minLat = latitude;
						  if(latitude > maxLat)
							  maxLat = latitude;
						  if(longitude < minLong)
							  minLong = longitude
						  if(longitude > maxLong)
							  maxLong = longitude;
						  this_driving = new driving(dateTime, latitude, longitude, speed, maf);
						my_driving.push(this_driving);
					}
				}
			}
		}	
	}
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
        pos = glMap.latLngToPixel(this.latitude, this.longitude);
        size = 1 + glMap.zoom()/2;
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
        pos = glMap.latLngToPixel(this.latitude, this.longitude);
        size = 1 + glMap.zoom()/2;
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