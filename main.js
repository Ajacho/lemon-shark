// This is how your game should behave and look
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 400,
  //   backgroundImage: "assets/images/ocean_bg.png",
  //   backgroundColor: "#1f45de",
  parent: "game-container", // The ID of the HTML element where the game will be rendered
  scene: {
    // The 3 main functions of the game scene
    preload: preload,
    create: create,
    update: update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }, // Makes sure the player does not fall down
      debug: false,
    },
  },
};

// Create game variables
let player;
let cursors;

// Start game
const game = new Phaser.Game(config);

// Games assets gets preloaded here
function preload() {
  this.load.image("player", "assets/images/shark_1.png");
  this.load.image("ocean_bg", "assets/images/ocean_bg.png");
}

// The game objects are created here. Such as the player, enemies, etc.
function create() {
  // Create the shark player sprite (X,Y)
  this.player = this.physics.add.image(120, 300, "player").setDepth(1);

  // Set bg
  const bg = this.add.image(0, 0, "ocean_bg").setOrigin(0, 0);
  bg.setDisplaySize(900, 400).setDepth(0);;

  // Scale the shark if it's too big/small
  this.player.setScale(0.4);

  // Create cursor keys for movement
  this.cursors = this.input.keyboard.createCursorKeys();
}

// The game logic is updated here. Such as player movement, enemy AI, etc.
function update() {
  // Arrow keys to move player
  if (this.cursors.left.isDown) {
    this.player.flipX = false;
    this.player.x -= 5;
  } else if (this.cursors.right.isDown) {
    this.player.flipX = true;
    this.player.x += 5;
  }

  if (this.cursors.up.isDown) {
    this.player.y -= 5;
  } else if (this.cursors.down.isDown) {
    this.player.y += 5;
  }
}
