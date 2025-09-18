import { CharSelectScene } from "/scenes/Day6TypingPractice/CharSelectScene.js";
import { GameScene } from "/scenes/Day6TypingPractice/GameScene.js";
import { ScoreBoardScene } from "/scenes/Day6TypingPractice/ScoreBoardScene.js";

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#fff',
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game-container',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1600,
        height: 1200,
    },
    render: {
        pixelArt: false,
        antialias: true,
    },
    resolution: window.devicePixelRatio,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [ CharSelectScene, GameScene, ScoreBoardScene ]
};

new Phaser.Game(config);