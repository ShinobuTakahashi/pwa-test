window.gLocalAssetContainer["thief"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const audioUtil_1 = require("../util/audioUtil");
const asaEx_1 = require("../util/asaEx");
const entityUtil_1 = require("../util/entityUtil");
const asaInfo_1 = require("./asaInfo");
const define_1 = require("./define");
const soundInfo_1 = require("./soundInfo");
/**
 * 泥棒管理クラス
 */
class Thief {
    /**
     * 泥棒の生成
     * @param  {g.Scene}          _scene  シーン
     * @param  {g.E}              _parent 親E
     * @param  {define.ThiefType} _type   泥棒タイプ
     * @param  {number}           _floor  Y位置
     */
    constructor(_scene, _parent, _type, _floor) {
        /** 属するゲーム */
        this.game = null;
        /** 属するシーン */
        this.scene = null;
        /** 親レイヤー */
        this.layer = null;
        /** 泥棒 */
        this.spr = null;
        /** 逃げ切りトリガー */
        this.escapeStartTrigger = null;
        /** 泥棒耐久値 */
        this.life = null;
        /** 泥棒移動速度 */
        this.moveX = null;
        /** 出現Y位置リスト */
        this.popPositionListY = define_1.define.POS_THIEF_POP_LIST_Y;
        /** Y位置インデックス（ドアとの判定用） */
        this.indexPosY = null;
        /** 泥棒種類 */
        this.type = null;
        /** ドア前立ち止まりカウンタ */
        this.cntStopDoor = 0;
        /** ドア前立ち止まりフラグ */
        this.flgStopDoor = false;
        /** ドアインフラグ */
        this.flgInDoor = false;
        /** 死亡フラグ */
        this.flgDead = false;
        this.scene = _scene;
        this.game = _scene.game;
        this.layer = _parent;
        let thiefType;
        if (typeof _type === "undefined") { // 引数なければ
            thiefType = this.game.random[0].get(0, define_1.define.NUM_OF_THIEF_TYPE - 1); // ランダム
        }
        else {
            thiefType = _type;
        }
        if (typeof _floor === "undefined") { // 引数なければ
            this.indexPosY = this.game.random[0].get(0, 2);
        }
        else {
            this.indexPosY = _floor;
        }
        let thiefValue;
        // 泥棒タイプによって初期値を設定
        for (let i = 0; i < define_1.define.THIEF_VALUES.length; ++i) {
            if (define_1.define.THIEF_VALUES[i].type === thiefType) {
                thiefValue = define_1.define.THIEF_VALUES[i];
                break;
            }
        }
        this.type = thiefType; // このインスタンスの泥棒タイプの記憶
        // このインスタンスのメインactor
        this.spr = new asaEx_1.asaEx.Actor(_scene, asaInfo_1.AsaInfo.thief.pj, thiefValue.anim.walk1);
        this.animeTypes = thiefValue.anim;
        this.moveX = thiefValue.movSpd; // 種類ごとの速さ設定
        this.life = thiefValue.life; // 種類に応じてライフを設定
        this.spr.width = thiefValue.w; // 種類ごとの大きさ設定 幅
        this.spr.height = thiefValue.h; // 種類ごとの大きさ設定 高さ
        // 画面端だが完全に隠れない位置
        this.spr.moveTo(this.game.width - define_1.define.OFFSET_X + 10, this.popPositionListY[this.indexPosY]);
        entityUtil_1.entityUtil.appendEntity(this.spr, _parent);
        this.spr.modified();
        this.escapeStartTrigger = new g.Trigger(); // 逃げ切り用
        // 周りの状況に限らずアニメの更新と移動を行う
        this.spr.update.handle(this, this.update);
    }
    /**
     * sprとtriggerの削除
     */
    destroy() {
        if (!this.spr.destroyed()) {
            this.spr.destroy();
        }
        if (!this.escapeStartTrigger.destroyed()) {
            this.escapeStartTrigger.destroy();
        }
    }
    /**
     * ゲーム中の更新処理
     * @return {boolean} 通常falseを返す
     */
    update() {
        if (!this.spr.destroyed()) {
            this.spr.x += this.moveX;
            this.animeController();
            this.spr.modified();
            this.spr.calc();
        }
        return false;
    }
    /**
     * 弾が泥棒に当たった時
     * @return {number} スコア
     */
    minusLife() {
        this.life -= 1;
        this.createDamegeEffect();
        if (this.life <= 0) { // 泥棒の寿命が尽きる時
            // 泥棒やられアニメに変更
            this.moveX = 0;
            this.setAnime(this.animeTypes.down2);
            this.flgDead = true;
            return (this.type + 1) * define_1.define.SCORE_BASE;
        }
        else {
            this.setAnime(this.animeTypes.down1);
            audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.hit);
            return 0;
        }
    }
    /**
     * 現在位置取得
     * @return {g.CommonOffset} 現在位置（原点）
     */
    getPosition() {
        return {
            x: this.spr.x,
            y: this.spr.y
        };
    }
    /**
     * Y位置インデックス取得
     * @return {number} Y位置インデックス
     */
    getIndexPosY() {
        return this.indexPosY;
    }
    /**
     * 当たり判定用エリア取得
     * @return {g.CommonArea} 当たり判定用エリア 左上基準
     */
    getCollArea() {
        // 原点が底辺中央なので計算して返す
        return {
            x: this.spr.x - (this.spr.width / 2),
            y: this.spr.y - this.spr.height,
            width: this.spr.width,
            height: this.spr.height
        };
    }
    /**
     * 泥棒種類ごとのアニメタイプを取得
     * @return {define.ThiefAnimeType} アニメタイプ
     */
    getAnimeTypes() {
        return this.animeTypes;
    }
    /**
     * ドアインフラグの設定
     * @param  {boolean} _flg ドアインフラグ
     */
    setFlgInDoor(_flg) {
        this.flgInDoor = _flg;
    }
    /**
     * 再生するアニメをセット
     * @param  {string} _animetype アニメタイプ
     */
    setAnime(_animetype) {
        // 現在プレイ中のアニメの場合は処理しない
        if (this.spr.animation.name === _animetype) {
            return;
        }
        // このメソッドを使うときはループが必要なアニメを再生しない想定
        this.spr.play(_animetype, 0, false, 1.0);
        // ドアインアニメへの変更要請ありました
        if (this.spr.animation.name === this.animeTypes.in) {
            this.escapeStartTrigger.handle(() => {
                this.flgInDoor = true; // 逃げ切りフラグオン
                return true;
            });
        }
    }
    /**
     * 移動量設定（主にゲーム終了時用）
     * @param  {number} _moveX 移動量
     */
    setMoveX(_moveX = 0) {
        this.moveX = _moveX;
    }
    /**
     * 死亡フラグ取得
     * @return {boolean} 死亡フラグ
     */
    isDead() {
        return this.flgDead;
    }
    /**
     * ドア前立ち止まりフラグを取得
     * @return {boolean} ドア前立ち止まりフラグ
     */
    isStopDoor() {
        return this.flgStopDoor;
    }
    /**
     * ドアインフラグを取得
     * @return {boolean} ドアインフラグ
     */
    isInDoor() {
        return this.flgInDoor;
    }
    /**
     * sprが削除されたか調べる
     * @return {boolean} 削除されていたらtrue
     */
    checkSprDestroyed() {
        return this.spr.destroyed();
    }
    /**
     * 現在当たり判定できるか否か
     * @return {boolean} できるならtrue
     */
    checkCollisionStat() {
        // down2アニメの時は判定しない
        if (this.spr.animation.name === this.animeTypes.down2) {
            return false;
        }
        // ドアに入り始めている
        if (this.flgStopDoor && this.cntStopDoor >= define_1.define.STOP_DOOR_TIME) {
            return false;
        }
        return true;
    }
    /**
     * 断末魔の叫び
     * @param {number} _kill 弾が倒してきた人数
     */
    deathCry(_kill) {
        switch (_kill) { // 倒した数によって叫びの演技を変える
            case 1:
                audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.kill01);
                break;
            case 2:
                audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.kill02);
                break;
            case 3:
                audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.kill03);
                break;
            case 4:
                audioUtil_1.audioUtil.play(soundInfo_1.SoundInfo.seSet.kill04);
                break;
            default:
                break;
        }
    }
    /**
     * アニメ管理
     */
    animeController() {
        const actor = this.spr;
        const nowAnime = actor.animation.name;
        const anime = this.animeTypes;
        let playAnime = nowAnime;
        let flgLoop = false;
        switch (nowAnime) { // アニメごとの挙動設定
            case anime.walk1:
            case anime.walk2:
                flgLoop = true;
                break;
            // チビノッポのdown1＝down2であることを考慮して先にdown2を書いている
            case anime.down2:
                if (actor.currentFrame >= actor.animation.frameCount - 1) {
                    this.destroy();
                    return;
                }
                break;
            case anime.down1:
                // アニメ終了時
                if (actor.currentFrame >= actor.animation.frameCount - 1) {
                    playAnime = anime.walk2; // 傷つき歩行
                    flgLoop = true;
                    if (this.flgStopDoor) { // ドア前でのダメージ
                        playAnime = anime.in;
                        flgLoop = false;
                    }
                }
                break;
            case anime.in:
                this.flgStopDoor = true;
                this.moveX = 0;
                ++this.cntStopDoor;
                if (this.cntStopDoor < define_1.define.STOP_DOOR_TIME) { // 規定時間に達するまで
                    actor.play(playAnime, 0, flgLoop, 1.0); // 0フレーム目でとめておく
                    return;
                }
                // 以下、規定時間に達したら処理
                // ドアインフラグをオンにしているだけだが、1回しか通りたくないのでtriggerで。
                this.escapeStartTrigger.fire();
                if (actor.currentFrame >= actor.animation.frameCount - 1) {
                    this.destroy();
                    return;
                }
                break;
        }
        if (nowAnime === playAnime) { // アニメが変わらない場合
            return; // なにもしない
        }
        actor.play(playAnime, 0, flgLoop, 1.0);
    }
    /**
     * 血しぶき生成
     */
    createDamegeEffect() {
        const actor = new asaEx_1.asaEx.Actor(this.scene, asaInfo_1.AsaInfo.effect.pj, asaInfo_1.AsaInfo.effect.anim.main);
        const pos = this.getPosition(); // 足元
        actor.moveTo(pos.x, pos.y - (this.spr.height / 2)); // 中心に補正
        entityUtil_1.entityUtil.appendEntity(actor, this.layer);
        actor.play(asaInfo_1.AsaInfo.effect.anim.main, 0, false, 1.0); // ループなしで再生
        actor.update.handle(actor, () => {
            actor.modified();
            actor.calc();
            if (actor.currentFrame >= actor.animation.frameCount - 1) { // 自身を破棄
                actor.destroy();
            }
            return false;
        });
    }
}
exports.Thief = Thief;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}