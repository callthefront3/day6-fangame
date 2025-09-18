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
        // 씬 인트로 소리
        this.sound.play('good');

        // 상단/하단 바 (y 좌표 ×2)
        this.add.image(100, 140, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0);
        this.add.image(100, 1060, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0);

        // 다시하기 버튼 (좌표와 크기 2배)
        const button = this.add.sprite(420, 860, 'button')
            .setDisplaySize(760, 160)
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
                // 다시하기 텍스트 (위치/폰트 크기 2배)
                this.add.text(800, 940, "다시하기", { fontFamily: "DOSGothic", fontSize: '80px', fill: '#000' })
                    .setOrigin(0.5, 0.5)
                    .setPadding({ top: 4, bottom: 4 });

                // 내 점수 (좌표/크기 2배)
                const portrait_key = 'face' + this.character;

                if(this.score < 100)
                    this.add.sprite(600, 180, portrait_key).setDisplaySize(400, 400).setOrigin(0, 0).play(portrait_key + ':sad');
                else
                    this.add.sprite(600, 180, portrait_key).setDisplaySize(400, 400).setOrigin(0, 0).play(portrait_key + ':joy');

                this.add.text(800, 660, this.nickname, { fontFamily: "DOSGothic", fontSize: '80px', fill: '#000' })
                    .setPadding({ top: 4, bottom: 4 })
                    .setOrigin(0.5, 0.5);
                this.add.text(800, 780, this.score, { fontFamily: "DOSGothic", fontSize: '80px', fill: '#000' })
                    .setPadding({ top: 4, bottom: 4 })
                    .setOrigin(0.5, 0.5);

                const textInput = document.getElementById('textInput');
                textInput.style.display = "none";
            }
        });
    }

    update(time, delta) {
        // 필요시 업데이트 로직
    }
}
