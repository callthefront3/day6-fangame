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

    preload() {
        
    }

    create() {
        // 다시하기 버튼
        const button = this.add.sprite(430, 460, 'button')
            .setDisplaySize(320, 64)
            .setOrigin(0, 0)
            .play('button:doodle')
            .setInteractive()
            .on('pointerdown', () => { 
                this.scene.start('GameScene', { nickname: this.nickname, character: this.character }); 
            });

        // WebFont + fetch 후 렌더링
        WebFont.load({
            custom: { families: ['DOSGothic'] },
            active: async () => {
                this.add.text(590, 492, "다시하기", { fontFamily: "DOSGothic", fontSize: '40px', fill: '#000' }).setOrigin(0.5, 0.5).setPadding({ top: 2, bottom: 2 });

                let top10 = [];
                try {
                    const baseUrl = `${window.location.protocol}//${window.location.host}`;
                    const res = await fetch(`${baseUrl}/day6-typing-practice/daily-rank`);
                    top10 = await res.json();
                } catch (err) {
                    console.error("Failed to fetch Top10:", err);
                }

                // Top 1 ~ 8 까지 출력
                top10.forEach((row, i) => {
                    if(i < 8) {
                        this.add.sprite(i % 2 == 0 ? 50 : 430, 100 + Math.floor(i / 2) * 84, 'face' + row.character).setDisplaySize(64, 64).setOrigin(0, 0);
                        this.add.text(i % 2 == 0 ? 134 : 514, 100 + Math.floor(i / 2) * 84, row.nickname, { fontFamily: "DOSGothic", fontSize: '28px', fill: '#000' }).setPadding({ top: 2, bottom: 2 });
                        this.add.text(i % 2 == 0 ? 134 : 514, 134 + Math.floor(i / 2) * 84, row.score, { fontFamily: "DOSGothic", fontSize: '30px', fill: '#000' }).setPadding({ top: 2, bottom: 2 });
                    }
                });

                this.add.image(50, 436, 'timeBar').setDisplaySize(700, 5).setOrigin(0, 0);

                // 내 점수
                this.add.sprite(50, 460, 'face' + this.character).setDisplaySize(64, 64).setOrigin(0, 0);
                this.add.text(134, 460, this.nickname, { fontFamily: "DOSGothic", fontSize: '28px', fill: '#000' }).setPadding({ top: 2, bottom: 2 })
                this.add.text(134, 494, this.score, { fontFamily: "DOSGothic", fontSize: '30px', fill: '#000' }).setPadding({ top: 2, bottom: 2 });

                const textInput = document.getElementById('textInput');
                textInput.style.display = "none";
            }
        });
    }

    update(time, delta) {
        
    }
}
