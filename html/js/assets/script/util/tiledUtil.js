window.gLocalAssetContainer["tiledUtil"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tiledのデータを扱うユーティリティ関数群
 */
var tiledUtil;
(function (tiledUtil) {
    /** TileMap#orientationの値：orthogonal */
    tiledUtil.ORIENTATION_ORTHOGONAL = "orthogonal";
    /** TileMap#orientationの値：isometric */
    tiledUtil.ORIENTATION_ISOMETRIC = "isometric";
    /** TileMap#orientationの値：staggered */
    tiledUtil.ORIENTATION_STAGGERED = "staggered";
    /** TileMap#renderorderの値：right-down */
    tiledUtil.RENDERORDER_RIGHT_DOWN = "right-down";
    /** LayerFormat#typeの値：tilelayer */
    tiledUtil.LAYERTYPE_TILELAYER = "tilelayer";
    /** LayerFormat#typeの値：objectgroup */
    tiledUtil.LAYERTYPE_OBJECTGROUP = "objectgroup";
    /** LayerFormat#typeの値：imagelayer */
    tiledUtil.LAYERTYPE_IMAGELAYER = "imagelayer";
    /**
     * jsonからMapオブジェクトを生成する
     * @param _mapJsonName jsonアセット名
     * @param opt_assets   (optional)g.Assetのマップ
     * （省略時はg.game.scene().assetsを使用する）
     * @return             生成したMapオブジェクト
     */
    function loadMapdata(_mapJsonName, opt_assets) {
        if (!opt_assets) {
            opt_assets = g.game.scene().assets;
        }
        // console.log("loadMapdata: _mapJsonName:"+_mapJsonName+", keys(opt_assets):"+Object.keys(opt_assets).join()+".");
        const map = JSON.parse(opt_assets[_mapJsonName].data);
        return map;
    }
    tiledUtil.loadMapdata = loadMapdata;
    /**
     * jsonからObjectLayerのobjectsを取得する
     * @param _mapJsonName        jsonアセット名
     * @param opt_assets          (optional)g.Assetのマップ
     * （省略時はg.game.scene().assetsを使用する）
     * @param opt_enableOffset    (optional)オブジェクトレイヤーのオフセットx,yを反映する
     *  (省略時はオフセットx,yを反映しない)
     * @param opt_useLayerVisible (optional)オブジェクトレイヤーのvisibleフラグを判定する
     *  (省略時はvisibleフラグを判定しない)
     * @return                    生成したMapオブジェクト
     */
    function getObjects(_mapJsonName, opt_assets, opt_enableOffset = false, opt_useLayerVisible = false) {
        const map = loadMapdata(_mapJsonName, opt_assets);
        const layers = map.layers;
        const iEnd = layers.length;
        let resAry = [];
        for (let i = 0; i < iEnd; ++i) {
            if (opt_useLayerVisible && !layers[i].visible) {
                continue;
            }
            if (layers[i].type === tiledUtil.LAYERTYPE_OBJECTGROUP) {
                // オブジェクトレイヤーのオフセットを反映する場合
                if (opt_enableOffset) {
                    // オフセットが0,0の場合JSONに書き出されない為undefinedなら無効とする
                    if (layers[i].offsetx !== undefined && layers[i].offsety !== undefined) {
                        layers[i].objects.forEach((item) => {
                            item.x += layers[i].offsetx;
                            item.y += layers[i].offsety;
                        });
                    }
                }
                // オブジェクトレイヤーの中身を連結する
                resAry = resAry.concat(layers[i].objects);
            }
        }
        return resAry;
    }
    tiledUtil.getObjects = getObjects;
    /**
     * jsonからObjectLayerのobjectsを2次元配列で取得する
     * @param _mapJsonName jsonアセット名
     * @param opt_assets (optional)g.Assetのマップ
     * （省略時はg.game.scene().assetsを使用する）
     * @return           生成したMapオブジェクト
     */
    function getObjects2Array(_mapJsonName, opt_assets) {
        const resObjAry = [];
        const map = loadMapdata(_mapJsonName, opt_assets);
        const layers = map.layers;
        const iEnd = layers.length;
        for (let i = 0; i < iEnd; ++i) {
            if (layers[i].type === tiledUtil.LAYERTYPE_OBJECTGROUP) {
                resObjAry.push(layers[i].objects);
            }
        }
        return resObjAry;
    }
    tiledUtil.getObjects2Array = getObjects2Array;
})(tiledUtil = exports.tiledUtil || (exports.tiledUtil = {}));

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}