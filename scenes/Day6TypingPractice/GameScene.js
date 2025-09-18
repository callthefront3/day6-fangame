export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        this.character = 1;
        this.nickname = '';
        this.score = 0;
        this.health = 100;

        this.nicknameText = null;
        this.scoreText = null;
        this.healthText = null;

        this.portrait = null;
        this.portrait_key = '';
        this.textInput = null;

        this.lyricsList = [];
        this.lyricsBlindList = [];

        this.previousSentence = { raw: "", masking: "" };
        this.currentSentence = { raw: "", masking: "" };
        this.upcomingSentence = { raw: "", masking: "" };
        this.previousSentenceText = null;
        this.currentSentenceText = null;
        this.upcomingSentenceText = null;

        this.levelTimer = 0;
        this.typingTimer = 30 * 1000;
        this.typingTimerLimit = 30 * 1000;
        this.portraitTimer = null;
        this.timeBar = null;

        this._onTextInputKeyDown = null;
        this._gameOverHandled = false;
    }

    init(data) {
        this.character = data.character;
        this.nickname = data.nickname;
        this.score = 0;
        this.health = 100;

        this.portrait_key = 'face' + data.character;
        this.previousSentence = { raw: "", masking: "" };
        this.currentSentence = { raw: "", masking: "" };
        this.upcomingSentence = { raw: "", masking: "" };

        this.levelTimer = 0;
        this.typingTimer = 30 * 1000;
        this.typingTimerLimit = 30 * 1000;
        this._gameOverHandled = false;
    }

    preload() {
        this.load.text('lyrics', 'assets/Day6TypingPractice/lyrics.txt');
        this.load.text('lyrics_blind', 'assets/Day6TypingPractice/lyrics_blind.txt');
    }

    create() {
        // 애니메이션
        if (!this.anims.exists('timeBox:doodle')) {
            this.anims.create({ key: "timeBox:doodle", frames: "timeBox", frameRate: 4, repeat: -1 });
        }

        // 배경
        // this.add.image(800, 600, 'background').setDisplaySize(1600, 1200).setTint(0xfffad4); // '#eae7ca'

        // 테두리
        this.add.image(100, 150, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0).setTintFill(0x3e3988);
        this.add.image(100, 1050, 'timeBar').setDisplaySize(1400, 10).setOrigin(0, 0).setTintFill(0x3e3988);

        // 얼굴 스프라이트
        this.portrait = this.add.sprite(140, 200, this.portrait_key)
            .setDisplaySize(280, 280)
            .setOrigin(0, 0)
            .setTintFill(0x3e3988)
            .play(this.portrait_key + ':normal');

        // 가사 불러오기
        this.lyricsList = this.cache.text.get('lyrics').split(/\r?\n/).filter(Boolean);
        this.lyricsBlindList = this.cache.text.get('lyrics_blind').split(/\r?\n/).filter(Boolean);

        // 문장 보여주기
        WebFont.load({
            custom: { families: ['DOSGothic'] },
            active: () => {
                this.previousSentenceText = this.add.text(800, 560, "", { fontFamily: "DOSGothic", fontSize: '48px', fill: '#ac9292' }).setOrigin(0.5).setPadding({ top: 4, bottom: 4 });
                this.currentSentenceText = this.add.text(800, 670, "", { fontFamily: "DOSGothic", fontSize: '72px', fill: '#3e3988' }).setOrigin(0.5).setPadding({ top: 4, bottom: 4 });
                this.upcomingSentenceText = this.add.text(800, 780, "", { fontFamily: "DOSGothic", fontSize: '48px', fill: '#ac9292' }).setOrigin(0.5).setPadding({ top: 4, bottom: 4 });
            }
        });

        // UI 텍스트
        WebFont.load({
            custom: { families: ['DOSGothic'] },
            active: () => {
                this.add.text(100, 108, "데식타자연습", { fontFamily: "DOSGothic", fontSize: '40px', fill: '#3e3988' }).setOrigin(0, 0.5).setPadding({ top: 4, bottom: 4 });
                this.add.text(800, 1100, "callthefront3-day6-fangame.pages.dev", { fontFamily: "DOSGothic", fontSize: '40px', fill: '#3e3988' }).setOrigin(0.5, 0.5).setPadding({ top: 4, bottom: 4 })
                .setInteractive().on('pointerdown', () => {
                    window.open("https://callthefront3-day6-fangame.pages.dev");
                });
                this.nicknameText = this.add.text(460, 200, this.nickname, { fontFamily: "DOSGothic", fontSize: '60px', fill: '#3e3988' }).setPadding({ top: 4, bottom: 4 });
                this.healthText = this.add.text(460, 300, '체력: 100', { fontFamily: "DOSGothic", fontSize: '60px', fill: '#3e3988' }).setPadding({ top: 4, bottom: 4 });
                this.scoreText = this.add.text(460, 400, '점수: 0', { fontFamily: "DOSGothic", fontSize: '60px', fill: '#3e3988' }).setPadding({ top: 4, bottom: 4 });
            }
        });

        // 타임바
        this.add.sprite(100, 960, 'timeBox').setDisplaySize(1400, 40).setOrigin(0, 0).setTintFill(0x3e3988).play('timeBox:doodle');
        this.timeBar = this.add.image(100, 980, 'timeBar').setDisplaySize(1380, 40).setOrigin(0, 0.5).setTintFill(0x3e3988);
        this.timeBar.fullWidth = this.timeBar.width;
        this.timeBar.thisLimit = this.typingTimerLimit;

        // 텍스트 입력 DOM
        this.add.sprite(140, 860, 'inputBar').setDisplaySize(1320, 80).setOrigin(0, 0).setTintFill(0x3e3988).play('inputBar:doodle');
        this.textInput = document.getElementById('textInput');
        this.textInput.placeholder = "가사를 입력해 주세요";
        this.textInput.value = '';
        textInput.style.display = "inline-block";
        this.textInput.removeAttribute('maxlength');

        // 이벤트 핸들러 저장 후 등록
        this._onTextInputKeyDown = (event) => {
            if (event.key === 'Enter' && this.textInput.value !== '') {
                this.checkTypedSentence();
            }
        };
        this.textInput.addEventListener('keydown', this._onTextInputKeyDown);

        // 씬 종료 시 이벤트 해제
        this.events.on('shutdown', this.onShutdown, this);
        this.events.on('destroy', this.onShutdown, this);

        // 초기 문장 세팅
        let randIdx = Phaser.Math.Between(0, this.lyricsList.length - 1);
        let raw = this.lyricsList[randIdx];
        let masked = this.lyricsBlindList[randIdx];
        this.currentSentence = { raw: raw, masking: masked };

        randIdx = Phaser.Math.Between(0, this.lyricsList.length - 1);
        raw = this.lyricsList[randIdx];
        masked = this.lyricsBlindList[randIdx];
        this.upcomingSentence = { raw: raw, masking: masked };
    }

    update(_, delta) {
        this.typingTimer -= delta;
        this.levelTimer += delta;

        // 안전한 timeLimit 사용
        const timeLimit = (this.timeBar && typeof this.timeBar.thisLimit === 'number')
            ? this.timeBar.thisLimit
            : this.typingTimerLimit;

        const progress = Phaser.Math.Clamp(this.typingTimer / Math.max(1, timeLimit), 0, 1);

        if (this.timeBar && typeof this.timeBar.setCrop === 'function' && typeof this.timeBar.fullWidth === 'number') {
            this.timeBar.setCrop(0, 0, this.timeBar.fullWidth * progress, this.timeBar.height || 40);
        }

        // 레벨 변경
        if (this.levelTimer > 30 * 1000) {
            this.typingTimerLimit -= 3 * 1000;
            this.typingTimerLimit = this.typingTimerLimit <= 10 * 1000 ? 10 * 1000 : this.typingTimerLimit;
            this.levelTimer = 0;
        }

        // 시간 초과
        if (this.typingTimer <= 0) {
            this.timeOver();
        }

        // 체력 0
        if (this.health <= 0) {
            this.gameOver();
        }

        // 문장 텍스트 표시 (씬에 속해있는 오브젝트만)
        const canSetText = obj => obj && typeof obj.setText === 'function' && obj.scene === this;
        if (canSetText(this.previousSentenceText) && canSetText(this.currentSentenceText) && canSetText(this.upcomingSentenceText)) {
            this.previousSentenceText.setText(this.previousSentence.raw);

            if(timeLimit == 30 * 1000) {
                this.currentSentenceText.setText(this.currentSentence.raw);
                this.upcomingSentenceText.setText(this.upcomingSentence.raw);
            } else {
                this.currentSentenceText.setText(this.currentSentence.masking);
                this.upcomingSentenceText.setText(this.upcomingSentence.masking);
            }
        }

        // input 박스 위치 조정
        const canvas = document.querySelector("canvas");
        const textInput = this.textInput;
        if (canvas && textInput) {
            const rect = canvas.getBoundingClientRect();
            const ratio = rect.width / 1600; // ✅ 해상도 변경

            textInput.style.width = 1200 * ratio + "px";
            textInput.style.height = 80 * ratio + "px";

            textInput.style.left = (rect.left + 140 * ratio) + "px";
            textInput.style.top = (rect.top + 860 * ratio) + "px";
        }
    }

    pickSentence() {
        this.previousSentence = this.currentSentence;
        this.currentSentence = this.upcomingSentence;
        
        const randIdx = Phaser.Math.Between(0, this.lyricsList.length - 1);
        const raw = this.lyricsList[randIdx];
        const masked = this.lyricsBlindList[randIdx];
        this.upcomingSentence = { raw: raw, masking: masked };

        this.typingTimer = this.typingTimerLimit;
        if (this.timeBar) this.timeBar.thisLimit = this.typingTimerLimit;
    }

    checkTypedSentence() {
        const typed = this.textInput.value.trim();

        if (this.currentSentence.raw === typed) {
            this.pickSentence();
            this.score += 10;

            this.portrait.play(this.portrait_key + ':joy');
            this.time.delayedCall(3000, () => this.portrait.play(this.portrait_key + ':normal'));

            this.sound.play('good');
        } else {
            this.typingTimer -= 3 * 1000;

            if (this.portraitTimer)
                this.portraitTimer.remove(false);

            this.portrait.play(this.portrait_key + ':sad');
            this.portraitTimer = this.time.delayedCall(3000, () => {
                this.portrait.play(this.portrait_key + ':normal');
                this.portraitTimer = null;
            });

            this.sound.play('fail');
            this.cameras.main.shake(200, 0.003);
        }

        this.textInput.value = '';
        this.updateScoreAndHealth();
    }

    updateScoreAndHealth() {
        if (this.scoreText && this.healthText) {
            this.healthText.setText(`체력: ${this.health}`);
            this.scoreText.setText(`점수: ${this.score}`);
        }
    }

    timeOver() {
        this.pickSentence();
        this.health -= 10;

        if (this.portraitTimer)
            this.portraitTimer.remove(false);

        this.portrait.play(this.portrait_key + ':sad');
        this.portraitTimer = this.time.delayedCall(3000, () => {
            this.portrait.play(this.portrait_key + ':normal');
            this.portraitTimer = null;
        });

        this.sound.play('fail');
        this.cameras.main.shake(200, 0.003);

        this.updateScoreAndHealth();
    }

    gameOver() {
        if (this._gameOverHandled) return;
        this._gameOverHandled = true;
        this.scene.start("ScoreBoardScene", { 'nickname': this.nickname, 'character': this.character, 'score': this.score });
        this.textInput.style.display = 'none';
        this.textInput.value = '';
    }

    playTypingSound() {
        const randomKey = Phaser.Utils.Array.GetRandom(['typing1', 'typing2', 'typing3', 'typing4', 'typing5']);
        this.sound.play(randomKey);
    }

    onShutdown() {
        if (this.textInput && this._onTextInputKeyDown) {
            this.textInput.removeEventListener('keydown', this._onTextInputKeyDown);
            this.textInput.style.display = 'none';
            this.textInput.value = '';
        }
    }
}
