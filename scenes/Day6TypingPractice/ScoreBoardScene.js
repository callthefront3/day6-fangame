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

        // 배경
        this.add.image(800, 600, 'background').setDisplaySize(1600, 1200).setTint(0xf8ddac).setAlpha(0.4);

        // 테두리
        this.add.image(100, 150, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0).setTintFill(0x141361);
        this.add.image(100, 1050, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0).setTintFill(0x141361);

        // 다시하기 버튼
        const button = this.add.sprite(420, 860, 'button')
            .setDisplaySize(760, 160)
            .setOrigin(0, 0)
            .setTintFill(0x141361)
            .play('button:doodle')
            .setInteractive()
            .on('pointerdown', () => { 
                this.sound.play('good');
                document.getElementById('textInput').value = '';
                this.scene.start('GameScene', { nickname: this.nickname, character: this.character }); 
            });
        
        WebFont.load({
            custom: { families: ['DOSIyagiBoldface'] },
            active: async () => {
                this.add.text(800, 108, "데식타자연습", { fontFamily: "DOSIyagiBoldface", fontSize: '40px', fill: '#141361' }).setOrigin(0.5, 0.5).setPadding({ top: 4, bottom: 4 });
                this.add.text(100, 108, "← 홈으로", { fontFamily: "DOSIyagiBoldface", fontSize: '40px', fill: '#141361' }).setOrigin(0, 0.5).setPadding({ top: 4, bottom: 4 })
                .setInteractive().on('pointerdown', () => {
                    window.open("https://callthefront3-day6-fangame.pages.dev", "_self");
                });

                // 다시하기 텍스트
                this.add.text(800, 940, "다시하기", { fontFamily: "DOSIyagiBoldface", fontSize: '80px', fill: '#141361' })
                    .setOrigin(0.5, 0.5)
                    .setPadding({ top: 4, bottom: 4 });

                // 내 점수
                const portrait_key = 'face' + this.character;

                if(this.score < 200)
                    this.add.sprite(600, 180, portrait_key).setDisplaySize(400, 400).setOrigin(0, 0).setTintFill(0x141361).play(portrait_key + ':sad');
                else
                    this.add.sprite(600, 180, portrait_key).setDisplaySize(400, 400).setOrigin(0, 0).setTintFill(0x141361).play(portrait_key + ':joy');

                this.add.text(800, 660, this.nickname, { fontFamily: "DOSIyagiBoldface", fontSize: '80px', fill: '#141361' })
                    .setPadding({ top: 4, bottom: 4 })
                    .setOrigin(0.5, 0.5);
                    
                this.add.text(800, 780, this.score, { fontFamily: "DOSIyagiBoldface", fontSize: '80px', fill: '#141361' })
                    .setPadding({ top: 4, bottom: 4 })
                    .setOrigin(0.5, 0.5);
            }
        });
    }

    update(time, delta) {
        // 필요시 업데이트 로직
    }
}
