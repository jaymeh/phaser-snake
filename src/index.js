/**
 * Import Phaser dependencies using `expose-loader`.
 * This makes then available globally and it's something required by Phaser.
 * The order matters since Phaser needs them available before it is imported.
 */

import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

/**
 * Create a new Phaser game instance.
 * And render a single sprite so we make sure it works.
 */

var gridSize = 17;
var game = new Phaser.Game(gridSize * gridSize, gridSize * gridSize, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var player;
var currentSpeed = 0;
var speed = 15;

var direction = 'right';

var upKey;
var downKey;
var leftKey;
var rightKey;
var lastMoved = 'right';

var tail = [];
var initialTailLength = 5;
var food_item;

function preload() {
  game.load.image('player', './assets/images/green.png');
  game.load.image('food', './assets/images/food.png');
}

function create() {

	var graphics = game.add.graphics(0, 0);
	
	for(var i = 0; i < initialTailLength; i++)
	{
		tail[i] = game.add.sprite(game.world.centerX - (i * gridSize), game.world.centerY, 'player');
		tail[i].anchor.setTo(.5, .5);
	}

	// Setup Controls
	upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);

	// Build the grid
	// Columns
	for(var i = 0; i < gridSize; i++)
	{
		// Rows
		for(var n = 0; n < gridSize; n++)
		{
			graphics.moveTo(0,0);
			graphics.lineStyle(1, 0x0000FF, 1);
			graphics.drawRect(gridSize * i, gridSize * n, gridSize, gridSize);
		}
	}

  	// Generate the food
  	_generateFood();
};
  
function update() {
	// Check death
	_wrap_world();

	// Set Direction
	_set_direction();

	// Check not tail collision

	// Check if food

	// Movement
	_handleMovement();
}

function _wrap_world()
{
	if(tail[0].x > game.world.width) {
		tail[0].x = 0 + (tail[0].width / 2);
	}

	if(tail[0].x < 0) {
		tail[0].x = game.world.width - (tail[0].width / 2);
	}

	if(tail[0].y > game.world.height) {
		tail[0].y = 0 + (tail[0].height / 2);
	}

	if(tail[0].y < 0) {
		tail[0].y = game.world.height - (tail[0].height / 2);
	}
}

function _set_direction()
{
	if(leftKey.isDown && lastMoved != "right") direction = "left";
	else if(upKey.isDown && lastMoved != "down") direction = "up";
	else if(rightKey.isDown && lastMoved != "left") direction = "right";
	else if(downKey.isDown && lastMoved != "up") direction = "down";
}

function _handleMovement()
{
	if(currentSpeed == speed)
	{
		switch(direction)
		{
			case 'up':
				_movePlayer(tail[0].x, tail[0].y - gridSize);
				lastMoved = direction;
				break;

			case 'down':
				_movePlayer(tail[0].x, tail[0].y + gridSize);
				lastMoved = direction;
				break;

			case 'left':
				_movePlayer(tail[0].x - gridSize, tail[0].y);
				lastMoved = direction;
				break;

			case 'right':
				_movePlayer(tail[0].x + gridSize, tail[0].y);
				lastMoved = direction;
				break;
		}
		
		currentSpeed = 0;
	}

	currentSpeed++;
}

function _movePlayer(x, y)
{
	var oldPosition = [];
	for(var i = 0; i < tail.length; i++)
	{
		oldPosition.push({'x': tail[i].x, 'y': tail[i].y});
	}

	// Set a array for all old tail data to use later
	for(var i = 0; i < tail.length; i++)
	{
		if(i == 0)
		{
			tail[i].x = x;
			tail[i].y = y;
		}
		else
		{
			var newI = i - 1;
			tail[i].x = oldPosition[i - 1].x;
			tail[i].y = oldPosition[i - 1].y;
		}
	}
}

function _generateFood()
{
	// Generate random x
	var x = _generateX();
	var y = _generateY();

	for(var i = 0; i < tail.length; i++)
	{
		var match = false;
		while(match == false)
		{
			if(tail[i].x == x && tail[i].y == y)
			{
				x = _generateX();
				y = _generateY();
			}
			else
			{
				match = true;
			}
		}
	}

	food_item = game.add.sprite(x * gridSize, y * gridSize, 'food');

	console.log(food_item);

	// Generate Random y

	// Randomly spawn a food object
	//x = 

	// Pick a random place + check nothing in it

	// If there is something there repick
}

function _generateX()
{
	var x = Math.floor(Math.random() * gridSize);

	return x;
}

function _generateY()
{
	var y = Math.floor(Math.random() * gridSize);

	return y;
}