window.gLocalAssetContainer["thiefBuster"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asaEx_1 = require("../util/asaEx");
const audioUtil_1 = require("../util/audioUtil");
const entityUtil_1 = require("../util/entityUtil");
const gameUtil_1 = require("../util/gameUtil");
const spriteUtil_1 = require("../util/spriteUtil");
const asaInfo_1 = require("./asaInfo");
const assetInfo_1 = require("./assetInfo");
const define_1 = require("./define");
const soundInfo_1 = require("./soundInfo");
const timerLabel_1 = require("./timerLabel");
const workman_1 = require("./workman");
const bullet_1 = require("./bullet");
const item_1 = require("./item");
const thief_1 = require("./thief");
const score_1 = require("./score");
const combo_1 = require("./combo");
const popScore_1 = require("./popScore");
const gameParameterReader_1 = require("./gameParameterReader");
const gameBase_1 = require("../commonNicowariGame/gameBase");
const commonParameterReader_1 = require("../commonNicowariGame/commonParameterReader");
// const fs = require("fs");
// import * as http from "http";

/**
 * ゲームの実体を実装するクラス
 */
class ThiefBuster extends gameBase_1.GameBase {
    /**
     * 継承元のコンストラクタをよぶ
     * @param  {g.Scene} _scene シーン
     */
    constructor(_scene) {
        super(_scene);
        /** 弾 */
        this.bullets = [];
        /** 泥棒たち */
        this.thieves = [];
        /** ドア3枚 */
        this.doors = [];
        /** 泥棒出現段階 */
        this.popPhase = 0;
        /** ゲーム開始からのフレーム用カウンタ */
        this.cntGame = 0;
        /** アイテム出現用カウンタ */
        this.cntItemPop = 0;
        /** フェイズごとの泥棒出現インデックスカウンタ */
        this.cntPopIndexOnPhase = 0;
    }
    /**
     * このクラスで使用するオブジェクトを生成するメソッド
     * Scene#loadedを起点とする処理からコンストラクタの直後に呼ばれる。
     * このクラスはゲーム画面終了時も破棄されず、次のゲームで再利用される。
     * そのためゲーム状態の初期化はinitではなくshowContentで行う必要がある。
     * @override
     */
    init() {
        super.init();
        // console.log("*********************** v2");
        // process.exit();
        // var dir = fs.readdirSync("/");
        // console.log("***", dir);
        // console.log("*********************** fileRead");
        const scene = this.scene;
        const game = scene.game;
        const spoUi = spriteUtil_1.spriteUtil.createSpriteParameter(assetInfo_1.AssetInfo.ui);
        const sfmUi = spriteUtil_1.spriteUtil.createSpriteFrameMap(assetInfo_1.AssetInfo.ui);
        const charCode0 = 48;
        const charCode10 = 58;
        gameParameterReader_1.GameParameterReader.read(scene);
        // 白数字
        const fontStgNum1 = gameUtil_1.gameUtil.createNumFontWithAssetInfo(assetInfo_1.AssetInfo.numWhite);
        // 赤数字
        const imgStgNum2 = this.scene.assets[assetInfo_1.AssetInfo.numRed.img];
        const jsonStgNum2 = JSON.parse(this.scene.assets[assetInfo_1.AssetInfo.numRed.json].data);
        const stgNum2FrameNames = assetInfo_1.AssetInfo.numRed.numFrames;
        const fontmapStgNum2 = gameUtil_1.gameUtil.makeGlyphMapFromFrames(charCode0, charCode10, jsonStgNum2, stgNum2FrameNames);
        gameUtil_1.gameUtil.addOneGlyphMapFromFrame("+", jsonStgNum2, assetInfo_1.AssetInfo.numRed.frames.plus, fontmapStgNum2);
        const stgNum2W = assetInfo_1.AssetInfo.numRed.fontWidth;
        const stgNum2H = assetInfo_1.AssetInfo.numRed.fontHeight;
        const fontStgNum2 = new g.BitmapFont({
            src: imgStgNum2,
            map: fontmapStgNum2,
            defaultGlyphWidth: stgNum2W,
            defaultGlyphHeight: stgNum2H
            // map: fontmapStgNum2[charCode0]
        });
        game.vars.scenedata.fontStgNum2 = fontStgNum2;
        // 青数字
        const imgStgNum3 = this.scene.assets[assetInfo_1.AssetInfo.numBlue.img];
        const jsonStgNum3 = JSON.parse(this.scene.assets[assetInfo_1.AssetInfo.numBlue.json].data);
        const stgNum3FrameNames = assetInfo_1.AssetInfo.numBlue.numFrames;
        const fontmapStgNum3 = gameUtil_1.gameUtil.makeGlyphMapFromFrames(charCode0, charCode10, jsonStgNum3, stgNum3FrameNames);
        gameUtil_1.gameUtil.addOneGlyphMapFromFrame("-", jsonStgNum3, assetInfo_1.AssetInfo.numBlue.frames.minus, fontmapStgNum3);
        const stgNum3W = assetInfo_1.AssetInfo.numBlue.fontWidth;
        const stgNum3H = assetInfo_1.AssetInfo.numBlue.fontHeight;
        const fontStgNum3 = new g.BitmapFont({
            src: imgStgNum3,
            map: fontmapStgNum3,
            defaultGlyphWidth: stgNum3W,
            defaultGlyphHeight: stgNum3H
            // ,
            // fontmapStgNum2[charCode0]
        });
        game.vars.scenedata.fontStgNum3 = fontStgNum3;
        // レイヤー
        this.layerBuilding = new g.E({ scene: scene });
        this.layerThief = new g.E({ scene: scene });
        this.layerBullet = new g.E({ scene: scene });
        this.layerItem = new g.E({ scene: scene });
        entityUtil_1.entityUtil.appendEntity(this.layerBuilding, this);
        entityUtil_1.entityUtil.appendEntity(this.layerThief, this);
        entityUtil_1.entityUtil.appendEntity(this.layerBullet, this);
        entityUtil_1.entityUtil.appendEntity(this.layerItem, this);
        // タイマー
        const iconT = spriteUtil_1.spriteUtil.createFrameSprite(spoUi, sfmUi, assetInfo_1.AssetInfo.ui.frames.iconT);
        iconT.moveTo(define_1.define.ICON_T_X, define_1.define.ICON_T_Y);
        entityUtil_1.entityUtil.appendEntity(iconT, this.layerItem);
        const timer = this.timerLabel = new timerLabel_1.TimerLabel(this.scene);
        timer.createLabel(assetInfo_1.AssetInfo.numWhite, assetInfo_1.AssetInfo.numRed);
        timer.moveLabelTo(define_1.define.GAME_TIMER_X, define_1.define.GAME_TIMER_Y);
        entityUtil_1.entityUtil.appendEntity(timer, this.layerItem);
        const spoStage = spriteUtil_1.spriteUtil.createSpriteParameter(assetInfo_1.AssetInfo.stage);
        const sfmStage = spriteUtil_1.spriteUtil.createSpriteFrameMap(assetInfo_1.AssetInfo.stage);
        const stageBG = spriteUtil_1.spriteUtil.createFrameSprite(spoStage, sfmStage, assetInfo_1.AssetInfo.stage.frames.bg);
        stageBG.moveTo(define_1.define.POS_STAGE_BG);
        entityUtil_1.entityUtil.appendEntity(stageBG, this.layerBuilding);
        // ステージ背景とステージメインの間
        this.wkman = new workman_1.Workman(scene, this.layerBuilding);
        const stage = spriteUtil_1.spriteUtil.createFrameSprite(spoStage, sfmStage, assetInfo_1.AssetInfo.stage.frames.building);
        stage.moveTo(define_1.define.POS_STAGE);
        entityUtil_1.entityUtil.appendEntity(stage, this.layerBuilding);
        const stageSide = spriteUtil_1.spriteUtil.createFrameSprite(spoStage, sfmStage, assetInfo_1.AssetInfo.stage.frames.buildingSide);
        stageSide.moveTo(define_1.define.POS_STAGE_SIDE);
        entityUtil_1.entityUtil.appendEntity(stageSide, this.layerItem); // 泥棒より手前
        // スコア
        const iconPt = spriteUtil_1.spriteUtil.createFrameSprite(spoUi, sfmUi, assetInfo_1.AssetInfo.ui.frames.iconPt);
        iconPt.moveTo(define_1.define.ICON_PT_X, define_1.define.ICON_PT_Y);
        entityUtil_1.entityUtil.appendEntity(iconPt, this.layerItem);
        this.score = new score_1.Score(this.scene);
        entityUtil_1.entityUtil.appendEntity(this.score, this.layerItem);
        this.score.createScoreLabel(fontStgNum1, define_1.define.GAME_SCORE_DIGIT, { x: define_1.define.GAME_SCORE_X, y: define_1.define.GAME_SCORE_Y });
        this.combo = new combo_1.Combo(this.scene, this.layerItem, gameUtil_1.gameUtil.createNumFontWithAssetInfo(assetInfo_1.AssetInfo.numCb), asaInfo_1.AsaInfo.combo.pj, asaInfo_1.AsaInfo.combo.anim.combo, define_1.define.POS_COMBO, define_1.define.COMBO_DIGIT, define_1.define.COMBO_DIVISOR, define_1.define.COMBO_PIVOT);
        this.popScore = new popScore_1.PopScore(this.scene, this.layerItem, fontStgNum2, fontStgNum3, asaInfo_1.AsaInfo.scorePopPoint.pj, asaInfo_1.AsaInfo.scorePopPoint.anim.plus, asaInfo_1.AsaInfo.scorePopPoint.anim.minus, define_1.define.POS_POINT_OFFSET_Y_1, define_1.define.POS_POINT_OFFSET_Y_2, define_1.define.POP_SCORE_PIVOT, define_1.define.POP_SCORE_DIGIT);
        for (let i = 0; i < 3; ++i) { // ドア生成
            this.doors.push(this.createDoor(i));
        }
        this.item = new item_1.Item(this.scene, this.layerItem);
    }
    /**
     * 表示系以外のオブジェクトをdestroyするメソッド
     * 表示系のオブジェクトはg.Eのdestroyに任せる。
     * @override
     */
    destroy() {
        super.destroy();
    }
    /**
     * タイトル画面のBGMのアセット名を返すメソッド
     * 共通フロー側でBGMを鳴らさない場合は実装クラスでオーバーライドして
     * 空文字列を返すようにする
     * @return {string} アセット名
     * @override
     */
    getTitleBgmName() {
        return soundInfo_1.SoundInfo.bgmSet.title;
    }
    /**
     * ゲーム中のBGMのアセット名を返すメソッド
     * 共通フロー側でBGMを鳴らさない場合は実装クラスでオーバーライドして
     * 空文字列を返すようにする
     * @return {string} アセット名
     * @override
     */
    getMainBgmName() {
        return soundInfo_1.SoundInfo.bgmSet.main;
    }
    /**
     * 表示を開始するメソッド
     * ゲーム画面に遷移するワイプ演出で表示が始まる時点で呼ばれる。
     * @override
     */
    showContent() {
        this.inGame = false;
        let timeLimit = define_1.define.GAME_TIME;
        if (commonParameterReader_1.CommonParameterReader.useGameTimeLimit) {
            timeLimit = commonParameterReader_1.CommonParameterReader.gameTimeLimit;
            if (timeLimit > define_1.define.GAME_TIME_MAX) {
                timeLimit = define_1.define.GAME_TIME_MAX;
            }
        }
        else if (commonParameterReader_1.CommonParameterReader.useGameTimeMax) {
            timeLimit = define_1.define.GAME_TIME_MAX;
        }
        this.timerLabel.setTimeCount(timeLimit);
        this.timerLabel.timeCaution.handle(this, this.onTimeCaution);
        this.timerLabel.timeCautionCancel.handle(this, this.onTimeCautionCancel);
        this.wkman.init();
        this.item.init();
        for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
            this.thieves[i].destroy();
        }
        this.thieves = [];
        for (let i = 0; i < this.doors.length; ++i) { // ドアループ
            this.doors[i].play(asaInfo_1.AsaInfo.door.anim.main, 0, false, 1.0); // ドア閉
            this.doors[i].pause = true;
        }
        this.score.init();
        this.combo.init();
        this.cntGame = 0;
        this.cntItemPop = 0;
        this.popPhase = 0;
        // 各フェイズの泥棒出現テーブルのランダムソート
        for (let i = 0; i < gameParameterReader_1.GameParameterReader.thiefPopRates.length; ++i) {
            this.sortArrayRandom(gameParameterReader_1.GameParameterReader.thiefPopRates[i].list);
        }
        super.showContent();
    }
    /**
     * ゲームを開始するメソッド
     * ReadyGo演出が完了した時点で呼ばれる。
     * @override
     */
    startGame() {
        this.inGame = true;
        this.scene.pointDownCapture.handle(this, this.onTouch);
        const len = gameParameterReader_1.GameParameterReader.thiefPopRates.length;
        this.retTimeIdentifier = this.scene.setInterval((this.timerLabel.getTimeCount() * 1000) / len, // ゲーム制限時間のフェーズ数分の1ごと
        this, // owner
        () => {
            if (this.popPhase < gameParameterReader_1.GameParameterReader.thiefPopRates.length - 1) {
                this.popPhase += 1;
                this.cntPopIndexOnPhase = 0;
                // console.log("sec" + this.timerLabel.getTimeCount() + " popPhase：" + (this.popPhase + 1));
                // console.table(define.THIEF_POP_RATES[this.popPhase].list);
            }
        });
    }
    /**
     * 表示を終了するメソッド
     * このサブシーンから遷移するワイプ演出で表示が終わる時点で呼ばれる。
     * @override
     */
    hideContent() {
        this.timerLabel.timeCaution.removeAll();
        this.timerLabel.timeCautionCancel.removeAll();
        super.hideContent();
    }
    /**
     * Scene#updateを起点とする処理から呼ばれるメソッド
     * ゲーム画面でない期間には呼ばれない。
     * @override
     */
    onUpdate() {
        if (this.inGame) {
            this.timerLabel.tick();
            if (this.timerLabel.getTimeCount() === 0) {
                this.finishGame();
                return; // ゲーム終了時は以降の処理を飛ばす
            }
            // 泥棒出現処理
            this.popThiefController();
            // アイテム出現処理
            this.popItemController();
            this.wkman.update();
            this.score.onUpdate();
            // 弾ループ
            for (let i = 0; i < this.bullets.length; ++i) {
                const bul = this.bullets[i]; // 短縮
                const bulArea = bul.getCollArea();
                // 画面外に出たら
                if (bulArea.x > (this.scene.game.width - define_1.define.OFFSET_X)) {
                    bul.destroySpr(); // 弾の削除
                    continue; // 次の弾へ
                }
                // アイテムに当たったら
                this.collWithItem(bulArea);
                // 泥棒に当たったら
                this.collWithThief(bul);
            } // end 弾ループ
            // 泥棒逃亡
            for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
                const thief = this.thieves[i]; // 短縮
                if (thief.isDead()) { // 倒していたら処理しない＝ダウンアニメ中
                    continue;
                }
                // ドアとの判定
                this.collWithDoor(thief);
            } // end泥棒ループ
            // ドアクローズ音
            this.playCloseDoorSE();
            // 削除された弾を配列から取り除く
            this.spliceDestroyedBullet();
            // 削除された泥棒を配列から取り除く
            this.spliceDestroyedThief();
        } // end if (this.inGame)
    }
    /**
     * ゲームスタート前の説明
     * @return {boolean} trueで有効
     * @override
     */
    startPreGameGuide() {
        return false;
    }
    /**
     * ゲームスタート前の説明中の更新処理
     * @return {boolean} trueで終了
     * @override
     */
    onUpdatePreGameGuide() {
        return true;
    }
    /**
     * TimerLabel#timeCautionのハンドラ
     */
    onTimeCaution() {
        this.timeCaution.fire();
    }
    /**
     * TimerLabel#timeCautionCancelのハンドラ
     */
    onTimeCautionCancel() {
        this.timeCautionCancel.fire();
    }
    /**
     * ゲームを終了するメソッド
     * gameUtil.setGameScoreしたスコアが結果画面で表示される。
     * @param {boolean = false} opt_isLifeZero
     * (optional)ライフ消滅によるゲーム終了の場合はtrue
     */
    finishGame(opt_isLifeZero = false) {
        this.inGame = false;
        this.scene.pointDownCapture.removeAll();
        this.scene.clearInterval(this.retTimeIdentifier);
        for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
            this.thieves[i].setMoveX(); // 画面上の泥棒の移動をストップ
        }
        this.score.onFinishGame();
        const resultScore = this.score.getValue();
        // マイナスの場合があるので明示的に0
        gameUtil_1.gameUtil.setGameScore(resultScore < 0 ? 0 : resultScore);
        // 呼び出すトリガーによって共通フローのジングルアニメが変化する
        if (opt_isLifeZero) {
            this.gameOver.fire();
            this.timerLabel.forceStopBlink();
        }
        else {
            this.timeup.fire();
        }
    }
    /**
     * Scene#pointDownCaptureのハンドラ
     * @param  {g.PointDownEvent} _e イベントパラメータ
     * @return {boolean}             ゲーム終了時はtrueを返す
     */
    onTouch(_e) {
        if (!this.inGame) {
            return true;
        }
        if (!this.wkman.isAttack()) { // 攻撃中じゃない
            audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.attack);
            this.wkman.pointDown(); // 腕ふり
            const level = this.wkman.getLevel(); // ワークマン現在レベル
            const atkPos = this.wkman.getAttackPosition(); // 腕ふり場所
            // 弾の生成と配列への追加
            this.bullets.push(new bullet_1.Bullet(this.scene, this.layerBullet, level, atkPos));
        }
        return false;
    }
    /**
     * ドアの作成
     * @param  {number}      _index 階層
     * @return {asaEx.Actor}        ドアActor
     */
    createDoor(_index) {
        const doorActor = new asaEx_1.asaEx.Actor(this.scene, asaInfo_1.AsaInfo.door.pj, asaInfo_1.AsaInfo.door.anim.main);
        doorActor.width = define_1.define.DOOR_WIDTH;
        doorActor.moveTo(define_1.define.POS_DOOR.x, define_1.define.POS_DOOR.y + (_index * define_1.define.FLOOR_HEIGHT) // 各階層の高さ
        );
        entityUtil_1.entityUtil.appendEntity(doorActor, this.layerBuilding);
        doorActor.play(asaInfo_1.AsaInfo.door.anim.main, 0, false, 1.0);
        doorActor.pause = true;
        doorActor.update.handle(doorActor, () => {
            doorActor.modified();
            doorActor.calc();
            return false;
        });
        return doorActor;
    }
    /**
     * 一次元配列のランダムソート
     * @param {number[]} _ary 配列
     */
    sortArrayRandom(_ary) {
        if (!Array.isArray(_ary)) {
            return;
        }
        let len = _ary.length - 1;
        while (len) {
            const randWk = this.scene.game.random[0].get(0, len);
            const wk = _ary[len];
            _ary[len] = _ary[randWk];
            _ary[randWk] = wk;
            len -= 1;
        }
    }
    /**
     * 泥棒出現管理
     */
    popThiefController() {
        const info = gameParameterReader_1.GameParameterReader.thiefPopRates[this.popPhase];
        if (this.cntGame === 0 ||
            this.cntGame % info.popInterval === 0) { // 段階ごとの泥棒出現フレーム
            let retIndex = define_1.define.ThiefType.short;
            // フェイズごとのランダムソートされた泥棒リストから選択
            retIndex = info.list[this.cntPopIndexOnPhase];
            // フェイズごとのインデックスを進める
            ++this.cntPopIndexOnPhase;
            if (this.cntPopIndexOnPhase >= info.list.length) {
                this.cntPopIndexOnPhase = 0;
            }
            // 選択した泥棒の出現高さを取得
            const floorIndex = this.findOfFloor(info.floor, retIndex);
            this.sortArrayRandom(info.floor[floorIndex].value);
            // 泥棒の生成と配列への追加
            this.thieves.push(new thief_1.Thief(this.scene, this.layerThief, retIndex, info.floor[floorIndex].value[0] // ランダムソート後の1番目
            ));
        }
        ++this.cntGame;
    }
    /**
     * 指定配列の中からtype値が一致する要素があるindex番号を返す
     * @param  {define.PopFloorInterface[]} _ary  配列
     * @param  {number}                     _type 種別
     * @return {number}                           該当Index
     */
    findOfFloor(_ary, _type) {
        for (let i = 0; i < _ary.length; ++i) {
            if (_ary[i].type === _type) {
                return i;
            }
        }
        return 0;
    }
    /**
     * アイテム出現管理
     */
    popItemController() {
        if (this.beforeLevel !== this.wkman.getLevel()) { // アイテムとったなら
            this.cntItemPop = 0; // 再計測開始
        }
        ++this.cntItemPop;
        // アイテムとるまでは休みなく出す
        if (this.cntItemPop > this.scene.game.fps * gameParameterReader_1.GameParameterReader.itemPopInterval) {
            this.item.popItem(this.wkman.getLevel()); // アイテムの出現
        }
        this.beforeLevel = this.wkman.getLevel(); // レベルの記憶
    }
    /**
     * 弾と泥棒との衝突
     * @param {Bullet} _bul 弾
     */
    collWithThief(_bul) {
        const bulArea = _bul.getCollArea();
        for (let i = 0; i < this.thieves.length; ++i) { // 泥棒ループ
            const thief = this.thieves[i]; // 短縮
            const thiefArea = thief.getCollArea(); // 当たり判定エリア取得
            let plusScore = 0;
            // 弾と泥棒との当たり判定
            if (thief.checkCollisionStat() && // 当たり判定可能状態かつ
                g.Collision.intersectAreas(bulArea, thiefArea)) { // 当たってる
                // 泥棒のlife削る、泥棒の絶命時は自身の得点を返す
                plusScore = thief.minusLife();
                _bul.minusLife(); // 弾のlife削る
                if (plusScore !== 0) { // 0じゃないのは倒した証拠
                    _bul.addKill(); // 弾ごとのキルカウント
                    thief.deathCry(_bul.getKill()); // 断末魔の叫び
                    // コンボなどのエフェクト作成と最終的なスコア計算
                    const comboValue = this.combo.getComboValue(plusScore);
                    this.combo.playComboAnim();
                    this.popScore.createPopScore(thief.getPosition(), comboValue);
                    this.score.startPlus(comboValue); // スコア加算開始
                }
            }
            if (_bul.checkSprDestroyed()) { // 弾消滅したら
                break; // 泥棒との当たり判定ループ抜ける
            }
        }
    }
    /**
     * 弾とアイテムとの衝突処理
     * @param {g.CommonArea} _bulArea 弾の領域
     */
    collWithItem(_bulArea) {
        const item = this.item; // 短縮
        const itemArea = item.getCollArea();
        if (item.checkCollisionStat() && // 当たり判定可能状態かつ
            g.Collision.intersectAreas(_bulArea, itemArea)) { // 当たってる
            item.setAnimeGet(); // アニメをゲットに
            this.wkman.plusLevel(); // レベルアップ
        }
    }
    /**
     * 泥棒とドアとの衝突処理
     * @param {Thief} _thief 泥棒
     */
    collWithDoor(_thief) {
        const thiefPos = _thief.getPosition();
        const indexY = _thief.getIndexPosY();
        const door = this.doors[indexY];
        // ドア位置に達したら
        if (thiefPos.x < define_1.define.POS_DOOR.x + (door.width / 2) + 10) {
            if (!_thief.isStopDoor()) { // まだ立ち止まりフラグ立ってない
                _thief.setAnime(_thief.getAnimeTypes().in); // ドアに入るアニメに
            }
            else { // ドア前で佇んでいる状態
                if (_thief.isInDoor()) { // ドア入ったら。 1回だけ通る想定
                    audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.open); // ドアオープン音
                    // ドア開閉アニメスタート
                    door.play(asaInfo_1.AsaInfo.door.anim.main, 0, false, 0.7);
                    // マイナスエフェクト作成
                    const minusValue = this.combo.getComboValue(define_1.define.SCORE_MINUS);
                    this.combo.playComboAnim();
                    this.popScore.createPopScore(thiefPos, minusValue);
                    this.score.startPlus(minusValue); // スコア減算開始
                    _thief.setFlgInDoor(false); // この条件にまた入らないようにset
                }
            }
        }
    }
    /**
     * ドア閉じる音鳴らす
     */
    playCloseDoorSE() {
        for (let i = 0; i < this.doors.length; ++i) { // ドアループ
            // アニメ終わったら
            if (this.doors[i].currentFrame >= this.doors[i].animation.frameCount - 1) {
                audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.close);
                this.doors[i].play(asaInfo_1.AsaInfo.door.anim.main, 0, false, 1.0); // ドア開閉
                this.doors[i].pause = true;
            }
        }
    }
    /**
     * 使命を終えた弾を配列から除去
     */
    spliceDestroyedBullet() {
        // 途中で取り除く可能性があるので最大値からマイナスループ
        for (let i = this.bullets.length - 1; i >= 0; --i) {
            if (this.bullets[i].checkSprDestroyed()) {
                this.bullets.splice(i, 1); // 配列から要素取り除き
            }
        }
    }
    /**
     * 使命を終えた泥棒を配列から除去
     */
    spliceDestroyedThief() {
        // 途中で取り除く可能性があるので最大値からマイナスループ
        for (let i = this.thieves.length - 1; i >= 0; --i) {
            if (this.thieves[i].checkSprDestroyed()) {
                this.thieves.splice(i, 1); // 配列から要素取り除き
            }
        }
    }
}
exports.ThiefBuster = ThiefBuster;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}