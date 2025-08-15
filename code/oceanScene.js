import Phaser from "phaser";

export default class OceanScene extends Phaser.Scene {
  constructor() {
    super("OceanScene");
    this.waveOffset = 0;
  }

  preload() {
    // Load all your assets here
    this.load.image("bubble", "./images/bubble.png");
    this.load.image("ocean_bg", "./images/ocean_bg.png");
    this.load.image("player", "./images/shark_1.png");
    this.load.image("bomb", "./images/bomb.png");
    this.load.image("explosion", "./images/explosion.png");

    for (let i = 1; i <= 6; i++) {
      this.load.image(`big_fish_${i}`, `./images/fish_${i}.png`);
    }
  }

  create() {
    // Background
    this.background = this.add
      .image(0, 0, "ocean_bg")
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Bubble particle effect
    this.add.particles(0, 500, "bubble", {
      speedY: { min: -100, max: -200 },
      lifespan: 4000,
      frequency: 200,
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.6, end: 0 },
      x: { min: 0, max: 900 },
    });

    // Player
    this.player = this.physics.add.image(120, 300, "player").setDepth(2);
    this.player.setCollideWorldBounds(true);
    const scale = 0.5;
    this.player.setScale(scale);

    // Groups
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
      fish.setDepth(2);
    }

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI texts
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const topLeftX = this.cameras.main.worldView.x;
    const topLeftY = this.cameras.main.worldView.y;
    const topRightX = topLeftX + this.cameras.main.width;

    this.score = 0;
    this.lives = 3;

    this.scoreText = this.add
      .text(topLeftX + 10, topLeftY + 10, "Score: 0", {
        fontSize: "20px",
        fill: "#000",
        fontFamily: "'Press Start 2P', monospace",
      })
      .setDepth(3);

    this.livesText = this.add
      .text(topRightX - 200, topLeftY + 10, "Lives: 3", {
        fontSize: "20px",
        fill: "#000",
        fontFamily: "'Press Start 2P', monospace",
      })
      .setDepth(3);

    this.startBtn = this.add
      .text(centerX, centerY - 50, "Start Game", {
        fontSize: "32px",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        fill: "black",
        fontFamily: "'Press Start 2P', monospace",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.gameInfo = this.add
      .text(
        centerX,
        centerY + 50,
        '🎮 Press on "start game" to begin...\n🕹️ Use arrow keys to move the shark.\n🐟 Catch the fish to score points!\n💣 Avoid the bombs!',
        {
          fontSize: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          fill: "#000",
          fontFamily: "VT323",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(3);

    this.gameoverText = this.add
      .text(centerX, centerY - 50, "Game Over!", {
        fontSize: "32px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        fill: "#ff0000",
        fontFamily: "'Press Start 2P', monospace",
        padding: { x: 20, y: 10 },
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(4)
      .setVisible(false);

    this.gameStarted = false;

    // Start button interaction
    this.startBtn.setInteractive();
    this.startBtn.on("pointerdown", () => {
      this.startGame();
    });
  }

  startGame() {
    this.gameStarted = true;
    this.startBtn.setVisible(false);
    this.gameInfo.setVisible(false);
    this.score = 0;
    this.lives = 3;
    this.scoreText.setText("Score: 0");
    this.livesText.setText("Lives: 3");
    this.gameoverText.setVisible(false);

    // Respawn some fish to start fresh
    this.fishGroup.clear(true, true);
    this.bombGroup.clear(true, true);

    for (let i = 0; i < 5; i++) {
      let fishX = Phaser.Math.Between(300, 800);
      let fishY = Phaser.Math.Between(50, 450);
      let fishType = Phaser.Math.Between(1, random(2, 6));
      let fish = this.fishGroup.create(fishX, fishY, `big_fish_${fishType}`);
      fish.setVelocityX(Phaser.Math.Between(-80, 80));
      fish.setVelocityY(Phaser.Math.Between(-80, 80));
      fish.setScale(0.13);
      fish.setBounce(1, 1);
      fish.setCollideWorldBounds(true);
      fish.setDepth(2);
    }

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (!this.gameStarted) return;

    // Player movement
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

    // Player collision
    this.physics.world.collide(
      this.player,
      this.fishGroup,
      this.collectFish,
      null,
      this
    );
    this.physics.world.collide(
      this.player,
      this.bombGroup,
      this.hitBomb,
      null,
      this
    );

    // Collision with fish
    this.fishGroup.getChildren().forEach((fish) => {
      if (
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.player.getBounds(),
          fish.getBounds()
        )
      ) {
        fish.destroy();
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    });

    // Collision with bombs
    this.bombGroup.getChildren().forEach((bomb) => {
      let playerBounds = this.player.getBounds();
      let bombBounds = bomb.getBounds();

      // Adjust bomb bounds for accurate collision detection
      bombBounds.x += bombBounds.width / 2;
      bombBounds.y += bombBounds.height / 2;
      bombBounds.width /= 2;
      bombBounds.height /= 2;

      if (
        Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, bombBounds)
      ) {
        bomb.destroy();
        // Explosion effect
        let explosion = this.add
          .image(bomb.x, bomb.y, "explosion")
          .setOrigin(0.5, 0.5)
          .setScale(0.5);
        this.time.delayedCall(500, () => {
          explosion.destroy();
        });
        this.lives -= 1;
        this.livesText.setText(`Lives: ${this.lives}`);

        if (this.lives <= 0) {
          this.gameoverText.setText(
            `Game Over!\nYour score: ${this.score}\nRestarting in 3 seconds...`
          );
          this.gameoverText.setVisible(true);
          this.gameStarted = false;

          this.fishGroup.clear(true, true);
          this.bombGroup.clear(true, true);

          // Stop player movement by removing cursors reference
          this.cursors = null;

          // Restart scene after 3 seconds
          this.time.delayedCall(3000, () => {
            this.scene.restart();
          });
        }
      }
    });

    // Spawn fish randomly
    if (Math.random() < 0.01) {
      let fishX = Phaser.Math.Between(300, 800);
      let fishY = Phaser.Math.Between(50, 450);
      let fishType = Phaser.Math.Between(1, 6);
      let fish = this.fishGroup.create(fishX, fishY, `big_fish_${fishType}`);
      fish.setVelocityX(Phaser.Math.Between(-80, 80));
      fish.setVelocityY(Phaser.Math.Between(-80, 80));
      fish.setScale(0.13);
      fish.setBounce(1, 1);
      fish.setCollideWorldBounds(true);
      fish.setDepth(2);
    }

    // Spawn bombs randomly
    if (Math.random() < 0.006) {
      let bombX = Phaser.Math.Between(0, this.sys.game.config.width); // Position starting position
      let bombY = -20;
      let bomb = this.bombGroup.create(bombX, bombY, "bomb");
      bomb.setScale(0.15);
      bomb.setVelocityX(Phaser.Math.Between(-80, 80)); // Random horizontal velocity
      bomb.setVelocityY(Phaser.Math.Between(-80, 80)); // Random vertical velocity
      // bomb.setBounce(1, 1);
      // bomb.setCollideWorldBounds(true);
      bomb.setDepth(2);
    }

    // // // --- Player collision debug box ---
    // if (!this.playerDebug) {
    //     this.playerDebug = this.add.graphics().setDepth(100);
    // }
    // this.playerDebug.clear();
    // this.playerDebug.lineStyle(2, 0xff0000, 1); // Red outline
    // const bounds = this.player.getBounds();
    // this.playerDebug.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
  }
}
