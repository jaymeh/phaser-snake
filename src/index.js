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
var player;
var currentSpeed = 0;
var speed = 15;
var borderOffset = 1;
var borderTop = 50;
var borderSide = 50;

var game = new Phaser.Game((gridSize * gridSize) + (borderSide * 2), (gridSize * gridSize) + borderTop, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var direction = 'right';

var upKey;
var downKey;
var leftKey;
var rightKey;
var lastMoved = 'right';

var tail = [];
var initialTailLength = 5;
var food_item;

var food_overlap;
var tail_overlap;

var gridWidth = (gridSize * gridSize) + (borderSide * 2);
var gridHeight = (gridSize * gridSize) + borderTop;

var score = 0;
var score_amount;
var score_text;
var width_offset = 15;

var textColour = '#FFFFFF';

function preload() {
  game.load.image('player', './assets/images/green.png');
  game.load.image('food', './assets/images/food.png');

  game.load.audio('eat', ['./assets/sound/eat.mp3', './assets/sound/eat.ogg']);
}

function create() {
	// Reset Variables since when you restart an instance this stuff doesn't get reset
	tail = [];
	score = 0;

	var graphics = game.add.graphics(0, 0);

	var x = Math.ceil(gridSize / 2) * gridSize + (borderSide);
	var y = Math.ceil(gridSize / 2) * gridSize;

	y += (borderTop)
	
	for(var i = 1; i < initialTailLength + 1; i++)
	{
		tail[i - 1] = game.add.sprite(x - (i * gridSize) + (borderSide + 2), y + 1, 'player');
	}

	game.stage.backgroundColor = '#484b5e';

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
			graphics.moveTo(borderSide, borderTop);
			graphics.lineStyle(1, 0x0f380f, 1);
			graphics.beginFill(0x9bbc0f);
			graphics.drawRect((gridSize * i) + (borderSide), (gridSize * n) + borderTop, gridSize, gridSize);
			graphics.endFill();
		}
	}

	// Draw score title
	score_text = this.game.add.text((game.world.width / 2) - width_offset, borderTop / 2, "Score: ", {font:"2rem Wendy One", fill: textColour});
	score_text.anchor.setTo(0.5);

	score_amount = this.game.add.text((game.world.width / 2) + (score_text.width / 2) + width_offset, borderTop / 2, score, {font:"2rem Wendy One", fill: textColour});
	score_amount.anchor.setTo(0.5);

	direction = 'right';
	lastMoved = 'left';

  	// Generate the food
  	_generateFood();
};
  
function update() {
	// Set Direction
	_set_direction();

	// Check not tail collision
	_check_tail_collision();

	// Check if food
	_check_food_eat();

	// Movement
	_handle_movement();

	// Check death
	_wrap_world();
}

function _wrap_world()
{
	if(tail[0].x > game.world.width - (borderSide)) {
		tail[0].x = (borderSide + 1);
	}

	if(tail[0].x < borderSide) {
		tail[0].x = (game.world.width - borderSide) - (gridSize - 1);
	}

	if(tail[0].y > game.world.height) {
		tail[0].y = (borderTop + 1);
	}

	if(tail[0].y < borderTop) {
		tail[0].y = ((game.world.height - gridSize) + 1);
	}
}

function _set_direction()
{
	if(leftKey.isDown && lastMoved != "right") direction = "left";
	else if(upKey.isDown && lastMoved != "down") direction = "up";
	else if(rightKey.isDown && lastMoved != "left") direction = "right";
	else if(downKey.isDown && lastMoved != "up") direction = "down";
}

function _handle_movement()
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

	_check_tail_collision();

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
	// Generate random x and y
	var x = _generateX();
	var y = _generateY();

	// Loop through the tail and check that our spawn position doesn't match the position of the snake.
	// If it does we want to regenerate until it doesn't.
	for(var i = 0; i < tail.length; i++)
	{
		var match = false;
		while(match == false)
		{
			var positionX = (x * gridSize) + (borderOffset + borderSide);
			var positionY = (y * gridSize) + (borderOffset + borderTop);			

			if(tail[i].x == positionX && tail[i].y == positionY)
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

	food_item = game.add.sprite((x * gridSize) + (borderOffset + borderSide), (y * gridSize) + (borderOffset +  borderTop), 'food');
}

function _generateX()
{
	var x = Math.floor(Math.random() * (gridSize));

	return x;
}

function _generateY()
{
	var y = Math.floor(Math.random() * (gridSize));

	return y;
}

function _trigger_death()
{
	game.state.restart();
}

function _check_tail_collision()
{
	// Check if the head of the snake overlaps with any part of the snake.
    for(var i = 1; i < tail.length; i++) {
        if(tail[0].x == tail[i].x && tail[0].y == tail[i].y) {

            // If so, go to game over screen.
            _trigger_death();
        }
    }
}

function _check_food_eat()
{
	// Check if theres some food
	if(tail[0].x == food_item.x && tail[0].y == food_item.y)
	{
		_eat_food();
	}
}

function _eat_food(first_tail)
{
	food_item.destroy();

	var nextX = -100;
	var nextY = -100;

	var tail_item = game.add.sprite(nextX, nextX, 'player');

	tail.push(tail_item);

	score++;

	var scoreTween = game.add.tween(score_amount.scale).to( { x: 1.2, y: 1.2 }, 150, "Linear", true);
	score_amount.text = score;

	scoreTween.onComplete.add(scaleDownText, true);

	game.sound.play('eat');

	_generateFood();
}

function scaleDownText()
{
	game.add.tween(score_amount.scale).to( { x: 1, y: 1 }, 150, "Linear", true);
}