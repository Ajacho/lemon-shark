// This is how your game should behave and look
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 500,
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
let randomFish;
let randomFishPositionX;
let randomFishPositionY;
let bombEnemy;

// Start game
const game = new Phaser.Game(config);

// Games assets gets preloaded here
function preload() {
  this.load.image("player", "assets/images/shark_1.png");
  this.load.image("ocean_bg", "assets/images/ocean_bg.png");

  // Generate a random fish image from 1 to 6
  for (let i = 1; i <= 6; i++) {
    this.load.image(`big_fish_${i}`, `assets/images/fish_${i}.png`);
  }
}

// The game objects are created here. Such as the player, enemies, etc.
function create() {
  // Create the shark player sprite (X,Y)
  this.player = this.physics.add.image(120, 300, "player").setDepth(1);
  this.player.setCollideWorldBounds(true); // Prevents the player from going out of bounds

  // Set random fish in the game
  randomFish = Phaser.Math.Between(1, 6);
  randomFishPositionX = Phaser.Math.Between(400, 700);
  randomFishPositionY = Phaser.Math.Between(100, 400);

  this.fish = this.physics.add
    .sprite(400, 200, `big_fish_${randomFish}`)
    .setDepth(1);
  this.fish.setVelocityX(Phaser.Math.Between(-100, 100));
  this.fish.setVelocityY(Phaser.Math.Between(-100, 100));
  this.fish.setScale(0.18, 0.18);

  // Set bg
  const bg = this.add.image(0, 0, "ocean_bg").setOrigin(0, 0);
  bg.setDisplaySize(900, 500).setDepth(0);

  // Scale the shark if it's too big/small
  this.player.setScale(0.6);

  // Create cursor keys for movement
  this.cursors = this.input.keyboard.createCursorKeys();

  // Get center of the game
  const centerX = this.cameras.main.centerX;
  const centerY = this.cameras.main.centerY;

  const topLeftX = this.cameras.main.worldView.x;
  const topLeftY = this.cameras.main.worldView.y;

  const topRightX = topLeftX + this.cameras.main.width;
  const topRightY = topLeftY;

  this.scoreText = this.add
    .text(topLeftX + 10, topLeftY + 10, "Score: 0", {
      fontSize: "20px",
      fill: "#000",
      align: "left",
      fontFamily: "'Press Start 2P', monospace",
    })
    .setDepth(2);

  this.livesText = this.add
    .text(topRightX - 200, topLeftY + 10, "Lives: 3", {
      fontSize: "20px",
      fill: "#000",
      align: "right",
      fontFamily: "'Press Start 2P', monospace",
    })
    .setDepth(2);

  this.startBtn = this.add
    .text(centerX, centerY, "Start Game", {
      fontSize: "32px",
      backgroundColor: "rgba(255, 255, 255, 0.7)",

      fill: "black",
      align: "center",
      fontFamily: "'Press Start 2P', monospace",
    })
    .setDepth(2);

  this.gameInfo = this.add
    .text(
      centerX,
      centerY + 50,
      "🎮 Press any key to start...\n" +
        "🕹️ Use arrow keys to move the shark.\n" +
        "🐟 Catch the fish to score points!\n" +
        "💣 Avoid the bombs!",
      {
        fontSize: "20px",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        fill: "#000",
        align: "center",
        fontFamily: "VT323",
      }
    )
    .setDepth(2);
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
