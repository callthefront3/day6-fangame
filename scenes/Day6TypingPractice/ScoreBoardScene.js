export class ScoreBoardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ScoreBoardScene' });

        this.nickname = '';
        this.character = 1;
        this.score = 0;
    }

    init(data) {
        this.nickname = data.nickname;
        this.character = data.character;
        this.score = data.score;
    }

    create() {
        this.add.image(50, 70, 'timeBar').setDisplaySize(700, 5).setOrigin(0, 0);
        this.add.image(50, 530, 'timeBar').setDisplaySize(700, 5).setOrigin(0, 0);

        // 다시하기 버튼
        const button = this.add.sprite(210, 430, 'button')
            .setDisplaySize(380, 80)
            .setOrigin(0, 0)
            .play('button:doodle')
            .setInteractive()
            .on('pointerdown', () => { 
                this.sound.play('good');
                this.scene.start('GameScene', { nickname: this.nickname, character: this.character }); 
            });
        
        WebFont.load({
            custom: { families: ['DOSGothic'] },
            active: async () => {
                this.add.text(400, 470, "다시하기", { fontFamily: "DOSGothic", fontSize: '40px', fill: '#000' }).setOrigin(0.5, 0.5).setPadding({ top: 2, bottom: 2 });

                // 내 점수
                this.add.sprite(300, 90, 'face' + this.character).setDisplaySize(200, 200).setOrigin(0, 0);
                this.add.text(400, 330, this.nickname, { fontFamily: "DOSGothic", fontSize: '40px', fill: '#000' }).setPadding({ top: 2, bottom: 2 }).setOrigin(0.5, 0.5);
                this.add.text(400, 390, this.score, { fontFamily: "DOSGothic", fontSize: '40px', fill: '#000' }).setPadding({ top: 2, bottom: 2 }).setOrigin(0.5, 0.5);

                const textInput = document.getElementById('textInput');
                textInput.style.display = "none";
            }
        });
    }

    update(time, delta) {
        
    }
}
