export class CharSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharSelectScene' });

        this.nickname = '';
        this.character = 1;
        
        this.portrait = null;
        this.textInput = null;

        this.startGameListener = null;
    }

    preload() {
        this.load.script('webfont', 'js/webfont.js');
        this.load.image('background', 'assets/Day6TypingPractice/UI/background.jpg');
        this.load.spritesheet('arrow', 'assets/Day6TypingPractice/UI/arrow.png', { frameWidth: 94, frameHeight: 100 });
        this.load.spritesheet('inputBar', 'assets/Day6TypingPractice/UI/inputBar.png', { frameWidth: 1956, frameHeight: 152 });
        this.load.spritesheet('button', 'assets/Day6TypingPractice/UI/button.png', { frameWidth: 596, frameHeight: 134 });
        this.load.spritesheet('timeBox', 'assets/Day6TypingPractice/UI/timeBox.png', { frameWidth: 2073, frameHeight: 79 });
        this.load.image('timeBar', 'assets/Day6TypingPractice/UI/timeBar.PNG');
        this.load.spritesheet('face1', 'assets/Day6TypingPractice/portrait/sungjin_sheet.PNG', { frameWidth: 520, frameHeight: 520 });
        this.load.spritesheet('face2', 'assets/Day6TypingPractice/portrait/youngk_sheet.PNG', { frameWidth: 520, frameHeight: 520 });
        this.load.spritesheet('face3', 'assets/Day6TypingPractice/portrait/wonpil_sheet.png', { frameWidth: 520, frameHeight: 520 });
        this.load.spritesheet('face4', 'assets/Day6TypingPractice/portrait/dowoon_sheet.PNG', { frameWidth: 520, frameHeight: 520 });

        // sound
        this.load.audio('fail', 'assets/Day6TypingPractice/sound/fail.mp3');
        this.load.audio('good', 'assets/Day6TypingPractice/sound/good.mp3');
        this.load.audio('typing1', 'assets/Day6TypingPractice/sound/typing1.wav');
        this.load.audio('typing2', 'assets/Day6TypingPractice/sound/typing2.wav');
        this.load.audio('typing3', 'assets/Day6TypingPractice/sound/typing3.wav');
        this.load.audio('typing4', 'assets/Day6TypingPractice/sound/typing4.wav');
        this.load.audio('typing5', 'assets/Day6TypingPractice/sound/typing5.wav');
    }

    create() {
        // 애니메이션
        this.anims.create({ key: "arrow:doodle", frames: "arrow", frameRate: 4, repeat: -1 });
        this.anims.create({ key: "inputBar:doodle", frames: "inputBar", frameRate: 4, repeat: -1 });
        this.anims.create({ key: "button:doodle", frames: "button", frameRate: 4, repeat: -1 });

        for(let i = 1; i < 5; i++) {
            const portrait_key = 'face' + i;

            this.anims.create({ key: portrait_key + ':normal'
                            , frames: this.anims.generateFrameNumbers(portrait_key, { start: 0, end: 1 })
                            , frameRate: 4
                            , repeat: -1 });

            this.anims.create({ key: portrait_key + ':joy'
                            , frames: this.anims.generateFrameNumbers(portrait_key, { start: 2, end: 3 })
                            , frameRate: 4 
                            , repeat: -1 });

            this.anims.create({ key: portrait_key + ':sad'
                            , frames: this.anims.generateFrameNumbers(portrait_key, { start: 4, end: 5 })
                            , frameRate: 4
                            , repeat: -1 });
        }

        // 배경
        this.add.image(800, 600, 'background').setDisplaySize(1600, 1200); // '#eae7ca'

        // 테두리
        this.add.image(100, 150, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0);
        this.add.image(100, 1050, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0);

        // 캐릭터 선택 (좌표 ×2, 크기 ×2)
        this.portrait = this.add.sprite(200, 400, 'face1').setDisplaySize(400, 400).setOrigin(0, 0).play('face1:normal');
        this.arrow_left = this.add.sprite(100, 570, 'arrow').setDisplaySize(60, 60).setOrigin(0, 0).setFlipX(true).play('arrow:doodle');
        this.arrow_right = this.add.sprite(640, 570, 'arrow').setDisplaySize(60, 60).setOrigin(0, 0).play('arrow:doodle');

        this.arrow_left.setInteractive().on('pointerdown', () => {
            this.character = this.character - 1 < 1 ? 4 : this.character - 1;
            this.redrawPortrait();
            this.sound.play('fail');
        });

        this.arrow_right.setInteractive().on('pointerdown', () => {
            this.character = this.character + 1 > 4 ? 1 : this.character + 1;
            this.redrawPortrait();
            this.sound.play('fail');
        });

        // 닉네임 입력 (좌표 ×2, 폰트 크기 ×2)
        WebFont.load({
            custom: {
                families: ['DOSGothic']
            },
            active: () => {
                this.add.text(800, 108, "데식타자연습", { fontFamily: "DOSGothic", fontSize: '40px', fill: '#000' }).setOrigin(0.5, 0.5).setPadding({ top: 4, bottom: 4 });
                this.add.text(740, 400, "이름", { fontFamily: "DOSGothic", fontSize: '80px', fill: '#000' }).setPadding({ top: 4, bottom: 4 });
                this.add.text(1120, 720, "게임 시작", { fontFamily: "DOSGothic", fontSize: '80px', fill: '#000' }).setOrigin(0.5, 0.5).setPadding({ top: 4, bottom: 4 });
            }
        });
        
        this.add.sprite(740, 520, 'inputBar').setDisplaySize(760, 80).setOrigin(0, 0).play('inputBar:doodle');
        this.textInput = document.getElementById('textInput');
        this.textInput.placeholder = "김마이데이";
        this.textInput.setAttribute('maxlength', '8');
        this.textInput.addEventListener('input', () => this.playTypingSound());

        // 게임 시작하기 버튼 (좌표 ×2, 크기 ×2)
        const button = this.add.sprite(740, 640, 'button')
            .setDisplaySize(760, 160)
            .setOrigin(0, 0)
            .play('button:doodle')
            .setInteractive()
            .on('pointerdown', () => {
                if (this.textInput.value !== '') {
                    this.sound.play('good');
                    this.scene.start('GameScene', { nickname: this.textInput.value, character: this.character });
                    this.textInput.style.display = 'none';
                    this.textInput.value = '';
                } else {
                    this.textInput.classList.add('shake-element');

                    this.textInput.addEventListener('animationend', () => {
                        this.textInput.classList.remove('shake-element');
                    });
                }
            });
    }

    update() {
        // input box 조정
        const canvas = document.querySelector("canvas");
        const textInput = document.getElementById('textInput');
        const rect = canvas.getBoundingClientRect();
        const ratio = rect.width / 1600; // ✅ 800 → 1600

        textInput.style.width = 760 * ratio + "px";
        textInput.style.height = 80 * ratio + "px";
    
        textInput.style.left = (rect.left + 740 * ratio) + "px";
        textInput.style.top  = (rect.top + 520 * ratio) + "px";
    }

    redrawPortrait() {
        const portrait_key = 'face' + this.character;

        this.portrait.destroy();
        this.portrait = this.add.sprite(200, 400, portrait_key).setDisplaySize(400, 400).setOrigin(0, 0).play(portrait_key + ':normal');
    }
    
    playTypingSound() {
        const randomKey = Phaser.Utils.Array.GetRandom(['typing1', 'typing2', 'typing3', 'typing4', 'typing5']);
        this.sound.play(randomKey);
    }
}
