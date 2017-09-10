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
var speed = 60;

function preload() {
  game.load.image('player', './assets/images/green.png');
}

function create() {

	var graphics = game.add.graphics(0, 0);
	player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
	player.anchor.setTo(.5, .5);

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

  	// Build the grid
};
  
function update() {
	// Check death
	if(player.x > game.world.width) {
		player.x = 0;
	}

	// Check not tail collision

	// Check if food

	// Movement

	if(currentSpeed == speed)
	{
		player.x += gridSize;
		currentSpeed = 0;
	}

	currentSpeed++;
}
