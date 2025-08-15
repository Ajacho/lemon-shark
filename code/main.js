import Phaser from 'phaser';
import OceanScene from './oceanScene.js';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 500,
  parent: "game-container",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  scene: [OceanScene],
};

export default new Phaser.Game(config);