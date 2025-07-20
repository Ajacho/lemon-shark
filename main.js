// This is how your game should behave and look
const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 500,
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
  this.load.image("bomb", "assets/images/bomb.png");

  // Generate a random fish image from 1 to 6
  for (let i = 1; i <= 6; i++) {
    this.load.image(`big_fish_${i}`, `assets/images/fish_${i}.png`);
  }
}

// The game objects are created here. Such as the player, enemies, etc.
function create() {
  // Set bg FIRST so it's behind everything
  const bg = this.add.image(0, 0, "ocean_bg").setOrigin(0, 0);
  bg.setDisplaySize(900, 500).setDepth(0);

  // Create the shark player sprite (X,Y)
  this.player = this.physics.add.image(120, 300, "player").setDepth(1);
  this.player.setCollideWorldBounds(true); // Prevents the player from going out of bounds
  this.player.setScale(0.6);
  // Create groups for fish and bombs
  this.fishGroup = this.physics.add.group();
  this.bombGroup = this.physics.add.group();

  // Spawn initial fish
  for (let i = 0; i < 5; i++) {
    let fishX = Phaser.Math.Between(300, 800);
    let fishY = Phaser.Math.Between(50, 450);
    let fishType = Phaser.Math.Between(1, 6);

    let fish = this.fishGroup.create(fishX, fishY, `big_fish_${fishType}`);
    fish.setVelocityX(Phaser.Math.Between(-80, 80));
    fish.setVelocityY(Phaser.Math.Between(-80, 80));
    fish.setScale(0.13);
    fish.setBounce(1, 1);
    fish.setCollideWorldBounds(true);
    fish.setDepth(1);
  }

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
      '🎮 Press on "start game" to begin...\n' +
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

  // Create game over text (initially hidden)
  this.gameoverText = this.add
    .text(centerX - 200, centerY - 50, "Game Over!", {
      fontSize: "20px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      fill: "#ff0000",
      align: "center",
      fontFamily: "'Press Start 2P', monospace",
      padding: { x: 20, y: 10 },
    })
    .setDepth(3)
    .setVisible(false); // Hide initially
}

// The game logic is updated here. Such as player movement, enemy AI, etc.
function update() {
  // Only allow player movement if cursors exist (not in game over state)
  if (this.cursors) {
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

  // Start the game when the start button is clicked
  if (this.startBtn && this.input.activePointer.isDown) {
    this.startBtn.destroy();
    this.gameInfo.destroy();
    this.gameoverText.setVisible(false); // Hide game over text when restarting
    this.startBtn = null; // Prevent multiple clicks
    this.gameInfo = null;
  }

  // Only run game logic if game has started
  if (!this.startBtn) {
    // Handle fish collision and scoring
    if (this.fishGroup.getChildren().length > 0) {
      this.fishGroup.getChildren().forEach((fish) => {
        // Check if player collides with fish
        // If so, destroy the fish and increase score
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.player.getBounds(),
            fish.getBounds()
          )
        ) {
          fish.destroy();
          let currentScore = parseInt(this.scoreText.text.split(": ")[1]);
          this.scoreText.setText(`Score: ${currentScore + 10}`);
        }
      });
    }

    // Handle bomb collision and lives
    if (this.bombGroup.getChildren().length > 0) {
      this.bombGroup.getChildren().forEach((bomb) => {
        let playerBounds = this.player.getBounds();
        let bombBounds = bomb.getBounds();

        bombBounds.x += bombBounds.width / 2;
        bombBounds.y += bombBounds.height / 2;
        bombBounds.width /= 2;
        bombBounds.height /= 2;

        if (
          Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, bombBounds)
        ) {
          bomb.destroy();
          let currentLives = parseInt(this.livesText.text.split(": ")[1]);
          this.livesText.setText(`Lives: ${currentLives - 1}`);

          if (currentLives <= 1) {
            // Show game over message
            let finalScore = this.scoreText.text.split(": ")[1];

            this.gameoverText.setText(
              `Game Over!\nYour score: ${finalScore}\nRestarting in 3 seconds...`
            );
            this.gameoverText.setVisible(true);

            // Clear all fish and bombs immediately
            this.fishGroup.clear(true, true);
            this.bombGroup.clear(true, true);

            // Stop player movement by removing input
            this.cursors = null;

            // Restart the game after 3 seconds
            this.time.delayedCall(3000, () => {
              this.scene.restart();
            });
          }
        }
      });
    }

    // Randomly generate fish (1% chance per frame)
    if (Math.random() < 0.02) {
      let fishX = Phaser.Math.Between(300, 800);
      let fishY = Phaser.Math.Between(50, 450);
      let fishType = Phaser.Math.Between(1, 6);

      let fish = this.fishGroup.create(fishX, fishY, `big_fish_${fishType}`);
      fish.setVelocityX(Phaser.Math.Between(-80, 80));
      fish.setVelocityY(Phaser.Math.Between(-80, 80));
      fish.setScale(0.13);
    }

    // Randomly generate bombs (#% chance per frame)
    if (Math.random() < 0.008) {
      // Bomb coming from top left
      let bombX = Phaser.Math.Between(0, 50);
      // Bomb coming from top right
      let bombY = Phaser.Math.Between(0, 100);

      let bomb = this.bombGroup.create(bombX, bombY, "bomb");
      bomb.setScale(0.15);
      bomb.setVelocityX(Phaser.Math.Between(-80, 80));
      bomb.setVelocityY(Phaser.Math.Between(-80, 80));
    }
  }
}
