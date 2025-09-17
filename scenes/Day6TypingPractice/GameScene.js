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
        this.load.spritesheet('timeBox', 'assets/Day6TypingPractice/UI/timeBox.png', { frameWidth: 2073, frameHeight: 79 });
        this.load.image('timeBar', 'assets/Day6TypingPractice/UI/timeBar.PNG');
    }

    create() {
        // 애니메이션
        if (!this.anims.exists('timeBox:doodle')) {
            this.anims.create({ key: "timeBox:doodle", frames: "timeBox", frameRate: 4, repeat: -1 });
        }

        // 얼굴 스프라이트
        this.portrait = this.add.sprite(70, 100, this.portrait_key)
            .setDisplaySize(140, 140)
            .setOrigin(0, 0)
            .play(this.portrait_key + ':normal');

        // 가사 불러오기
        this.lyricsList = this.cache.text.get('lyrics').split(/\r?\n/).filter(Boolean);
        this.lyricsBlindList = this.cache.text.get('lyrics_blind').split(/\r?\n/).filter(Boolean);

        // 문장 보여주기
        WebFont.load({
            custom: { families: ['DOSGothic'] },
            active: () => {
                this.previousSentenceText = this.add.text(400, 280, "", { fontFamily: "DOSGothic", fontSize: '24px', fill: '#c5bdbdff' }).setOrigin(0.5).setPadding({ top: 2, bottom: 2 });
                this.currentSentenceText = this.add.text(400, 335, "", { fontFamily: "DOSGothic", fontSize: '36px', fill: '#000' }).setOrigin(0.5).setPadding({ top: 2, bottom: 2 });
                this.upcomingSentenceText = this.add.text(400, 390, "", { fontFamily: "DOSGothic", fontSize: '24px', fill: '#c5bdbdff' }).setOrigin(0.5).setPadding({ top: 2, bottom: 2 });
            }
        });

        // UI 텍스트
        WebFont.load({
            custom: { families: ['DOSGothic'] },
            active: () => {
                this.nicknameText = this.add.text(230, 100, this.nickname, { fontFamily: "DOSGothic", fontSize: '30px', fill: '#000' }).setPadding({ top: 2, bottom: 2 });
                this.healthText = this.add.text(230, 150, '체력: 100', { fontFamily: "DOSGothic", fontSize: '30px', fill: '#000' }).setPadding({ top: 2, bottom: 2 });
                this.scoreText = this.add.text(230, 200, '점수: 0', { fontFamily: "DOSGothic", fontSize: '30px', fill: '#000' }).setPadding({ top: 2, bottom: 2 });
            }
        });

        // 타임바
        this.add.sprite(50, 480, 'timeBox').setDisplaySize(700, 20).setOrigin(0, 0).play('timeBox:doodle');
        this.timeBar = this.add.image(50, 490, 'timeBar').setDisplaySize(690, 20).setOrigin(0, 0.5);
        this.timeBar.fullWidth = this.timeBar.width;
        this.timeBar.thisLimit = this.typingTimerLimit;

        // 텍스트 입력 DOM
        this.add.sprite(70, 430, 'inputBar').setDisplaySize(660, 40).setOrigin(0, 0).play('inputBar:doodle');
        this.textInput = document.getElementById('textInput');
        this.textInput.placeholder = "가사를 입력해 주세요";
        this.textInput.value = '';
        textInput.style.display = "inline-block";
        this.textInput.removeAttribute('maxlength');

        // 이벤트 핸들러 저장 후 등록
        this._onTextInputKeyDown = (event) => {
            if (event.key === 'Enter') {
                this.checkTypedSentence();
            }
        };
        this.textInput.addEventListener('keydown', this._onTextInputKeyDown);

        // 씬 종료 시 이벤트 해제
        this.events.on('shutdown', this.onShutdown, this);
        this.events.on('destroy', this.onShutdown, this);

        // 초기 문장 세팅
        this.pickSentence();
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
            this.timeBar.setCrop(0, 0, this.timeBar.fullWidth * progress, this.timeBar.height || 20);
        }

        // 레벨 변경
        if (this.levelTimer > 30 * 1000) {
            this.typingTimerLimit -= 3 * 1000;
            this.typingTimerLimit = this.typingTimerLimit <= 7 * 1000 ? 7 * 1000 : this.typingTimerLimit;
            this.levelTimer = 0;
        }

        // 새 문장 필요 시
        if (this.currentSentence.raw === "") {
            this.pickSentence();
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
            this.currentSentenceText.setText(this.currentSentence.masking);
            this.upcomingSentenceText.setText(this.upcomingSentence.masking);
        }

        // input 박스 위치 조정
        const canvas = document.querySelector("canvas");
        const textInput = this.textInput;
        if (canvas && textInput) {
            const rect = canvas.getBoundingClientRect();
            const ratio = rect.width / 800;

            textInput.style.width = 660 * ratio + "px";
            textInput.style.height = 40 * ratio + "px";

            const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            const keyboardThreshold = window.innerHeight * 0.7;

            if (viewportHeight < keyboardThreshold) { // 키보드 등장
                textInput.style.left = (rect.left + 70 * ratio) + "px";
                textInput.style.top = (rect.top + 430 * ratio) + "px";
            } else { // 키보드 사라짐
                textInput.style.left = (rect.left + 70 * ratio) + "px";
                textInput.style.top = (rect.top + 430 * ratio) + "px";
            }
        }
    }

    pickSentence() {
        this.previousSentence = this.currentSentence;
        this.currentSentence = this.upcomingSentence;
        this.upcomingSentence = { raw: "", masking: "" };

        if (this.upcomingSentence.raw === "") {
            const randIdx = Phaser.Math.Between(0, this.lyricsList.length - 1);
            const raw = this.lyricsList[randIdx];
            const masked = this.lyricsBlindList[randIdx];
            this.upcomingSentence = { raw: raw, masking: masked };
        }

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
