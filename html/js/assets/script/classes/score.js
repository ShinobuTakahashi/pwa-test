window.gLocalAssetContainer["score"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("@akashic-extension/akashic-timeline");
const entityUtil_1 = require("../util/entityUtil");
const define_1 = require("./define");
const gameUtil_1 = require("../util/gameUtil");
/** スコア強調時間：OFF→ON */
const SCORE_TIME_ON = 3;
/** スコア強調時間：ON→OFF */
const SCORE_TIME_OFF = 7;
/** スコア強調スケール：OFF→ON */
const SCORE_SCALE_ON = 1.1;
/** スコア強調スケール：ON→OFF */
const SCORE_SCALE_OFF = 1.0;
/** スコア強調時移動調整距離 */
const SCORE_SCALE_MOVE_X = 8;
/**
 * スコア処理を行うクラス
 */
class Score extends g.E {
    /**
     * 継承元のg.Eのコンストラクタを呼び、タイムラインインスタンスを作成する
     * @param  {g.Scene} _scene シーン
     */
    constructor(_scene) {
        super({ scene: _scene });
        /** スコアラベル */
        this.label = null;
        /** ラベル初期位置 */
        this.posLabelStart = null;
        /** 現在のスコア */
        this.value = null;
        /** スコア加算演出用スタック */
        this.stack = null;
        /** 加算幅 */
        this.plus = null;
        this.timeline = new tl.Timeline(_scene);
        this.plus = 10;
    }
    /**
     * 表示系以外のオブジェクトをdestroyするメソッド
     * 表示系のオブジェクトはg.Eのdestroyに任せる。
     * @override
     */
    destroy() {
        if (this.destroyed()) {
            return;
        }
        if (this.timeline) {
            this.timeline.destroy();
            this.timeline = null;
        }
        super.destroy();
    }
    /**
     * ラベルの作成
     * @param {g.BitmapFont}   _font     スコア用フォント
     * @param {number}         _digit    桁数
     * @param {g.CommonOffset} _posStart 初期位置
     */
    createScoreLabel(_font, _digit, _posStart) {
        this.label = entityUtil_1.entityUtil.createNumLabel(this.scene, _font, _digit);
        entityUtil_1.entityUtil.appendEntity(this.label, this);
        entityUtil_1.entityUtil.moveNumLabelTo(// 1ケタ目左上へ移動
        this.label, _posStart.x, _posStart.y);
        // ラベル初期位置記憶
        this.posLabelStart = { x: this.label.x, y: this.label.y };
    }
    /**
     * 初期化
     */
    init() {
        this.value = 0;
        this.stack = 0;
        entityUtil_1.entityUtil.setLabelText(this.label, String(this.value));
    }
    /**
     * ラベルテキストの更新
     */
    onUpdate() {
        entityUtil_1.entityUtil.setLabelText(this.label, String(this.value));
        this.animePlusScore();
        if (this.value < 0) {
            this.value = 0;
            this.stack = 0;
            gameUtil_1.gameUtil.updateGameStateScore(this.value);
        }
        else if (this.value > define_1.define.SCORE_LIMIT) {
            this.value = define_1.define.SCORE_LIMIT;
            this.stack = 0;
            gameUtil_1.gameUtil.updateGameStateScore(this.value);
        }
    }
    /**
     * スコアのgetter
     * @return {number} スコア
     */
    getValue() {
        return this.value;
    }
    /**
     * スタックスコアからのマージスコアを一気に足す
     */
    mergeScore() {
        this.value += this.stack;
        this.stack = 0;
    }
    /**
     * スコア加算開始
     * @param {number} _plusScore 加算対象スコア
     */
    startPlus(_plusScore) {
        this.setStack(_plusScore);
        this.setPlus();
        this.setTween();
        gameUtil_1.gameUtil.updateGameStateScore(this.value + this.stack);
    }
    /**
     * ゲーム終了時の処理まとめ
     */
    onFinishGame() {
        this.mergeScore(); // 残ったスタックスコアを加算
        this.onUpdate();
        gameUtil_1.gameUtil.updateGameStateScore(this.value + this.stack);
    }
    /**
     * スコアをすこしずつ足す
     */
    animePlusScore() {
        if (this.stack > 0 && this.stack >= this.plus) {
            this.value += this.plus;
            this.stack -= this.plus;
        }
        else { // 一気足し
            this.mergeScore();
        }
    }
    /**
     * 加算幅をスタックスコアから設定
     */
    setPlus() {
        // ラベル強調時間で終わるように
        this.plus = Math.floor(this.stack / (SCORE_TIME_ON + SCORE_TIME_OFF));
    }
    /**
     * スコアを演出用にスタック
     * @param {number} _plusScore 加算対象スコア
     */
    setStack(_plusScore) {
        this.stack += _plusScore;
    }
    /**
     * 加算時に強調する演出tween設定
     */
    setTween() {
        const scaleOff = SCORE_SCALE_OFF; // 縮小倍率 =原寸大
        const scaleOn = SCORE_SCALE_ON; // 拡大倍率 スコア桁数によって調整したい
        const fps = this.scene.game.fps;
        const mSec = 1000;
        const timeScaleOffInit = 1 * mSec / fps; // 初期化縮小にかけるミリ秒
        const timeScaleOn = SCORE_TIME_ON * mSec / fps; // 巨大化にかけるミリ秒
        const timeScaleOff = SCORE_TIME_OFF * mSec / fps; // 縮小にかけるミリ秒
        this.timeline.clear(); // 毎回作り直し
        const tween = this.timeline.create(this.label, {
            modified: this.label.modified,
            destroyed: this.label.destroyed
        });
        // tweenが重なった場合、まず元のサイズに
        tween.to({ scaleX: scaleOff, scaleY: scaleOff }, timeScaleOffInit);
        tween.con(); // 上下処理結合
        tween.moveTo(// 位置をもとに戻す
        this.posLabelStart.x, this.posLabelStart.y, timeScaleOffInit);
        tween.to({ scaleX: scaleOn, scaleY: scaleOn }, timeScaleOn); // 強調開始
        tween.con(); // 上下処理結合
        tween.moveTo(// 原点の問題上ずれるので調整用 計算で調整幅出したい
        this.posLabelStart.x - SCORE_SCALE_MOVE_X, this.posLabelStart.y, timeScaleOn);
        tween.to({ scaleX: scaleOff, scaleY: scaleOff }, timeScaleOff); // 強調終了
        tween.con(); // 上下処理結合
        tween.moveTo(// 位置をもとに戻す
        this.posLabelStart.x, this.posLabelStart.y, timeScaleOff);
    }
}
exports.Score = Score;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}