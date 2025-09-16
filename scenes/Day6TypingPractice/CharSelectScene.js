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
        this.load.spritesheet('arrow', 'assets/Day6TypingPractice/UI/arrow.png', { frameWidth: 94, frameHeight: 100 });
        this.load.spritesheet('inputBar', 'assets/Day6TypingPractice/UI/inputBar.png', { frameWidth: 1956, frameHeight: 152 });
        this.load.spritesheet('button', 'assets/Day6TypingPractice/UI/button.png', { frameWidth: 596, frameHeight: 134 });
        this.load.spritesheet('face1', 'assets/Day6TypingPractice/portrait/sungjin_sheet.PNG', { frameWidth: 520, frameHeight: 520 });
        this.load.spritesheet('face2', 'assets/Day6TypingPractice/portrait/youngk_sheet.PNG', { frameWidth: 520, frameHeight: 520 });
        this.load.spritesheet('face3', 'assets/Day6TypingPractice/portrait/wonpil_sheet.png', { frameWidth: 520, frameHeight: 520 });
        this.load.spritesheet('face4', 'assets/Day6TypingPractice/portrait/dowoon_sheet.PNG', { frameWidth: 520, frameHeight: 520 });
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

        // 캐릭터 선택
        this.portrait = this.add.sprite(100, 200, 'face1').setDisplaySize(200, 200).setOrigin(0, 0).play('face1:normal');
        this.arrow_left = this.add.sprite(50, 285, 'arrow').setDisplaySize(30, 30).setOrigin(0, 0).setFlipX(true).play('arrow:doodle');
        this.arrow_right = this.add.sprite(320, 285, 'arrow').setDisplaySize(30, 30).setOrigin(0, 0).play('arrow:doodle');

        this.arrow_left.setInteractive().on('pointerdown', () => {
            this.character = this.character - 1 < 1 ? 4 : this.character - 1;
            this.redrawPortrait();
        });

        this.arrow_right.setInteractive().on('pointerdown', () => {
            this.character = this.character + 1 > 4 ? 1 : this.character + 1;
            this.redrawPortrait();
        });

        // 닉네임 입력
        WebFont.load({
            custom: {
                families: ['DOSGothic']
            },
            active: () => {
                this.add.text(370, 200, "이름", { fontFamily: "DOSGothic", fontSize: '40px', fill: '#000' });
                this.add.text(560, 360, "게임 시작", { fontFamily: "DOSGothic", fontSize: '40px', fill: '#000' }).setOrigin(0.5, 0.5);
            }
        });
        
        this.add.sprite(370, 260, 'inputBar').setDisplaySize(380, 40).setOrigin(0, 0).play('inputBar:doodle');
        this.textInput = document.getElementById('textInput');
        this.textInput.placeholder = "김마이데이";
        this.textInput.setAttribute('maxlength', '8');

        // 게임 시작하기 버튼
        const button = this.add.sprite(370, 320, 'button')
            .setDisplaySize(380, 80)
            .setOrigin(0, 0)
            .play('button:doodle')
            .setInteractive()
            .on('pointerdown', () => {
                if (this.textInput.value !== '') {                    
                    this.scene.start('GameScene', { nickname: this.textInput.value, character: this.character });
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
        const ratio = rect.width / 800;

        textInput.style.width = 380 * ratio + "px";
        textInput.style.height = 40 * ratio + "px";

        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const keyboardThreshold = window.innerHeight * 0.7; // 화면의 70% 이하로 줄어들면 키보드 등장으로 간주

        if (viewportHeight < keyboardThreshold) { // 키보드 등장
            // textInput.style.left = (rect.left + 370 * ratio) + "px";
            // textInput.style.top  = (rect.top + 260 * ratio) - 400 + "px";
        } else { // 키보드 사라짐
            textInput.style.left = (rect.left + 370 * ratio) + "px";
            textInput.style.top  = (rect.top + 260 * ratio) + "px";
        }
    }

    redrawPortrait() {
        const portrait_key = 'face' + this.character;

        this.portrait.destroy();
        this.portrait = this.add.sprite(100, 200, portrait_key).setDisplaySize(200, 200).setOrigin(0, 0).play(portrait_key + ':normal');
    }
}
