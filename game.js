/*
*
*	Ludum Dare 30 Entry.
*	By: Matthew Guise
*
*/

console.log("Load Game Script.");

var graphics;

var leftmapContainer;
var rightmapContainer;
var guiContainer;

var canvas;
var canvasStage;
var canvasContext;

var mapID;
var numberOfMaps = 2;
var map_data;
var map_done = false;
var map_l;
var map_r;

var wallColor = "#E7E7E7";
var completedColor = "#DDE7AA";
var boxColor = "#13E7FF";
var playerColor = "#000000";
var goalColor = "#11FF11";

var tile_size = 30;
var board_height = 10;
var board_width = 10;

var playerX;
var playerY;
var prevTile = "";

$(document).ready(function(){

	console.log("On doc ready.");
	canvas = document.getElementById("gamescreen");
	canvasContext = canvas.getContext("2d");

	canvasStage = new createjs.Stage(canvas);

	setup();

});

function setup(){
	console.log("setup.")

	$(document).bind('keyup',function(e){
        if (e.which == 87) {
        	//console.log("up");
        	move(0,-1);
        }
        else if (e.which == 65){
        	//console.log("Left");
        	move(-1, 0);
        }
        else if (e.which == 68){
        	//console.log("Right");
        	move(1,0);
        }
        else if (e.which == 83){
        	//console.log("Down");
        	move(0,1);
        }
        else if (e.which == 82){
        	//console.log("Down");
        	loadMapProperties();
        }
        else if (e.which == 67){
        	//console.log("Down");
        	if (map_done){
        		mapID++;
        		loadMapProperties();
        	}
        }
        else
        { console.log("Not valid input key."); }
    });


	mapID = 1;

	graphics = new createjs.Graphics();

	leftmapContainer = new createjs.Container();
	rightmapContainer = new createjs.Container();
	guiContainer = new createjs.Container();

	canvasStage.addChild(leftmapContainer);
	canvasStage.addChild(rightmapContainer);
	canvasStage.addChild(guiContainer);

	setContainerPlacement();

	loadMapProperties();
}

function getLeftTileRelativePlayerPosition(dirX, dirY){
	return map_l[playerY + dirY][playerX + dirX];
}

function getRightTileRelativePlayerPosition(dirX, dirY){	
	return map_r[playerY + dirY][playerX + dirX];
}

function move(dirX, dirY){

	var nextTile = getLeftTileRelativePlayerPosition(dirX,dirY);
	var rightNextTile = getRightTileRelativePlayerPosition(dirX,dirY);

	var canMove = true;

	if (nextTile == "w"){
    	//console.log("wall");
		//Player hitting wall. Can not proceed.
		return;
	}	
	
	if(rightNextTile == "b") {
		nextnextTile = getRightTileRelativePlayerPosition(2 * dirX, 2 * dirY);

		if (nextnextTile == "w") {
			//Do nothing.
			return;
		}else if (nextnextTile == "g") {
			map_r[playerY + 2 * dirY][playerX + 2 * dirX] = "c";
			map_r[playerY + dirY][playerX + dirX] = prevTile;
		}
		else{
			map_r[playerY + dirY][playerX + dirX] = prevTile;
			map_r[playerY + 2 * dirY][playerX + 2 * dirX] = "b";
		}

	}	
	
	if (canMove) {
		//console.log("Move player.")
		map_l[playerY][playerX] = prevTile;
		playerY += dirY;
		playerX += dirX;
		map_l[playerY][playerX] = "p";
	}

	gameStep();

}


function resetLevel(){
	console.log("resetLevel.");
}

function loadMapProperties(){

	var mapPath = "map"+mapID+".json";

	$.getJSON(mapPath, function( json ){
		console.log("Loading map.");
		map_data = json;

	}).done(function(){
		console.log("Loading map done.");
		loadMap();
	}).fail(function(){
		console.log("Loading map " + mapID + " failed.");
	});
}

function loadMap(){
	map_l = [];
	map_r = [];
	for(var i = 0; i < board_height; i++){
		//console.log("i: " + i);
		var leftinner = [];
		var rightinner = [];
		for(var j = 0; j < board_width; j++){
			//console.log("index: " + (i*board_height) + j);
			leftinner.push(map_data.map_left[(i*board_height) + j]);
			rightinner.push(map_data.map_right[(i*board_height) + j]);
		}
		map_l.push(leftinner);
		map_r.push(rightinner);
	}
	map_done = false
	guiContainer.removeAllChildren();
	refreshMap();
}

function refreshMap(){

	// First check win condition.

	leftmapContainer.removeAllChildren();
	rightmapContainer.removeAllChildren();
	for(var i = 0; i < board_height; i++){
		for(var j = 0; j < board_width; j++){
			var left_tile = map_l[i][j];
			var right_tile = map_r[i][j];
			addTile((i*board_height) + j, left_tile, leftmapContainer);
			addTile((i*board_height) + j, right_tile, rightmapContainer);
		}
	}
	console.log("Update stage.");
	setContainerPlacement();
	canvasStage.update();
}

function gameStep(){
	refreshMap();

	//checkWinCondition
	if (!map_done && checkWinCondition()){
		console.log("Level Done.");
		map_done = true;
		if( mapID >= numberOfMaps ){
			console.log("Game Done.")
			gameDoneScreen();
			return;
		}else{
			console.log("Load new map.")
			mapDoneScreen();
		}
	}
}

function addTile(index, tileChar, container){
	var x = index % board_width;
	var y = Math.floor(index / board_height);

	var tile = new createjs.Shape();

	//console.log("Create Tile: " + tileChar);

	if (tileChar == "w") {
		tile.graphics.beginFill(wallColor).drawRect(x*tile_size, y*tile_size, tile_size, tile_size);
	}
	else if (tileChar == "b") {
		tile.graphics.beginFill(boxColor).drawRect(x*tile_size, y*tile_size, tile_size, tile_size);
	}
	else if (tileChar == "g") {
		tile.graphics.beginFill(goalColor).drawRect(x*tile_size, y*tile_size, tile_size, tile_size);
	}
	else if (tileChar == "c") {
		tile.graphics.beginFill(completedColor).drawRect(x*tile_size, y*tile_size, tile_size, tile_size);
	}
	else if (tileChar == "p") {
		playerX = x;
		playerY = y;
		tile.graphics.beginFill(playerColor).drawRect(x*tile_size, y*tile_size, tile_size, tile_size);
	}

	container.addChild(tile);
}

function setContainerPlacement(){
	leftmapContainer.x = 0;
	leftmapContainer.y = tile_size;
	rightmapContainer.x = board_width * tile_size + tile_size;
	rightmapContainer.y = tile_size;
	
	guiContainer.x = leftmapContainer.x;
	guiContainer.y = leftmapContainer.y;
}

function checkWinCondition(){
	for (var i = 0; i < board_height; i++) {
		for (var j = 0; j < board_width; j++) {
			if (map_r[i][j] == "b"){
				return false;
			}
		}
	}
	return true;
}

function startScreen(){
	
	var startText = new createjs.Text("Use WASD to move.", "20px Arail", "#000000");
	startText.x = 0;
	startText.y = board_height * tile_size + 2 * tile_size;
	startText.lineWidth = 200;

	guiContainer.addChild(startText);
	canvasStage.update();	

}

function gameDoneScreen(){

	leftmapContainer.removeAllChildren();
	rightmapContainer.removeAllChildren();

	var gameDoneText = new createjs.Text("You have completed the game. Thank you for playing. This game was made for Ludum Dare 30.", "20px Arail", "#000000");
	gameDoneText.x = 0;
	gameDoneText.y = board_height * tile_size + 2 * tile_size;
	gameDoneText.lineWidth = 200;


	guiContainer.addChild(gameDoneText);
	canvasStage.update();	

}

function mapDoneScreen(){

	var mapDoneText = new createjs.Text("Level Complete. Press c to continue.", "20px Arail", "#000000");
	mapDoneText.x = 0;
	mapDoneText.y = board_height * tile_size + 2 * tile_size;
	guiContainer.addChild(mapDoneText);
	canvasStage.update();
	
}