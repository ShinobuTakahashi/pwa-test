window.gLocalAssetContainer["spriteUtil"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameUtil_1 = require("./gameUtil");
/**
 * g.Spriteとasa.Actor関連のユーティリティ関数群
 */
var spriteUtil;
(function (spriteUtil) {
    /**
     * フレーム名に対応するフレーム矩形を取得する
     * @param _data スプライトシートのjson
     * @param _key フレーム名
     * @return      フレーム矩形
     */
    function getRectData(_data, _key) {
        const rect = {
            x: _data.frames[_key].frame.x,
            y: _data.frames[_key].frame.y,
            w: _data.frames[_key].frame.w,
            h: _data.frames[_key].frame.h
        };
        return rect;
    }
    spriteUtil.getRectData = getRectData;
    /**
     * スプライトシートのjsonとフレーム名からSpriteのパラメータを設定する
     * @param _jsonData  スプライトシートのjson
     * @param _frameName フレーム名
     * @param _sprite    対象のSprite
     */
    function setSpriteFrame(_jsonData, _frameName, _sprite) {
        const rect = getRectData(_jsonData, _frameName);
        _sprite.srcX = rect.x;
        _sprite.srcY = rect.y;
        _sprite.srcWidth = rect.w;
        _sprite.srcHeight = rect.h;
        _sprite.width = rect.w;
        _sprite.height = rect.h;
        _sprite.invalidate();
    }
    spriteUtil.setSpriteFrame = setSpriteFrame;
    /**
     * Spriteの生成とsetSpriteFrameを行う
     * @param _spriteOption Sprite生成用パラメータ
     * @param _jsonData     スプライトシートのjson
     * @param _frameName    フレーム名
     * @return              生成したSprite
     */
    function createFrameSprite(_spriteOption, _jsonData, _frameName) {
        const sprite = new g.Sprite(_spriteOption);
        setSpriteFrame(_jsonData, _frameName, sprite);
        return sprite;
    }
    spriteUtil.createFrameSprite = createFrameSprite;
    /**
     * AssetInfoの情報からSpriteParameterObjectを生成する
     * @param _info     アセット情報
     * @param opt_scene (optional)g.Sceneインスタンス
     * （省略時はg.game.scene()を使用する）
     * @return          生成したSpriteParameterObject
     */
    function createSpriteParameter(_info, opt_scene) {
        if (!opt_scene) {
            opt_scene = g.game.scene();
        }
        const spriteParam = {
            scene: opt_scene,
            src: opt_scene.assets[_info.img]
        };
        return spriteParam;
    }
    spriteUtil.createSpriteParameter = createSpriteParameter;
    /**
     * AssetInfoの情報からSpriteFrameMapを生成する
     * @param _info      アセット情報
     * @param opt_assets (optional)g.Assetのマップ
     * （省略時はg.game.scene().assetsを使用する）
     * @return           生成したSpriteFrameMap
     */
    function createSpriteFrameMap(_info, opt_assets) {
        if (!opt_assets) {
            opt_assets = g.game.scene().assets;
        }
        const frameMap = JSON.parse(opt_assets[_info.json].data);
        return frameMap;
    }
    spriteUtil.createSpriteFrameMap = createSpriteFrameMap;
    /**
     * スプライトの画像だけ変更
     * @param _sprite 変更したいスプライトオブジェクト
     * @param _asset この画像に変更したい
     */
    function changeSpriteSurface(_sprite, _asset) {
        _sprite.surface = _asset.asSurface();
        _sprite.invalidate();
    }
    spriteUtil.changeSpriteSurface = changeSpriteSurface;
    /**
     * asa.Actorをmodify/calcする関数を返す
     * @param _actor 対象のasa.Actor
     * @return       modify/calcする関数
     */
    function makeActorUpdater(_actor) {
        return () => {
            if (_actor.visible() && !_actor.pause) {
                _actor.modified();
                _actor.calc();
            }
        };
    }
    spriteUtil.makeActorUpdater = makeActorUpdater;
    /**
     * asa.Actorを指定時間modify/calcしてdestroyする
     * @param _timeline      tl.Timelineインスタンス
     * @param _actor         対象のasa.Actor
     * @param _frameDuration destroyするまでのフレーム数
     * @param _onFinish      destroyした時点で呼ばれる関数
     * @return               tl.Tweenインスタンス
     */
    function setDelayDestroy(_timeline, _actor, _frameDuration, _onFinish) {
        const fps = _timeline._scene.game.fps;
        return gameUtil_1.gameUtil.createTween(_timeline, _actor).
            every((e, p) => {
            _actor.modified();
            _actor.calc();
        }, _frameDuration * 1000 / fps).
            call(() => {
            _actor.destroy();
            if (!!_onFinish) {
                _onFinish();
            }
        });
    }
    spriteUtil.setDelayDestroy = setDelayDestroy;
    /**
     * AssetInfoTypeのマップからアセット名を配列に追加する
     * @param _map      AssetInfoTypeのマップ
     * @param _assetIds アセット名配列
     */
    function addAssetIdsFromAssetInfoMap(_map, _assetIds) {
        const checkServer = g.game.vars.hasOwnProperty("isServer");
        const isServer = checkServer ? g.game.vars.isServer : false;
        Object.keys(_map).forEach((i) => {
            const info = _map[i];
            if (checkServer
                && info.hasOwnProperty("isServer")
                && (isServer !== info.isServer)) {
                return;
            }
            _assetIds[_assetIds.length] = info.img;
            if (!info.json)
                return;
            _assetIds[_assetIds.length] = info.json;
        });
    }
    spriteUtil.addAssetIdsFromAssetInfoMap = addAssetIdsFromAssetInfoMap;
    /**
     * AsaInfoTypeのマップからasapj名の配列を生成する
     * @param  _map AsaInfoTypeのマップ
     * @return      asapj名の配列
     */
    function getPjNamesFromAsainfoMap(_map) {
        const checkServer = g.game.vars.hasOwnProperty("isServer");
        const isServer = checkServer ? g.game.vars.isServer : false;
        const array = [];
        Object.keys(_map).forEach((i) => {
            const info = _map[i];
            if (checkServer
                && info.hasOwnProperty("isServer")
                && (isServer !== info.isServer)) {
                return;
            }
            array[array.length] = info.pj;
        });
        return array;
    }
    spriteUtil.getPjNamesFromAsainfoMap = getPjNamesFromAsainfoMap;
})(spriteUtil = exports.spriteUtil || (exports.spriteUtil = {}));

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}