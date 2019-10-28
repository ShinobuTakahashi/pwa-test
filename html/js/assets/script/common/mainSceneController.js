window.gLocalAssetContainer["mainSceneController"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sceneController_1 = require("../commonNicowariGame/sceneController");
const tl = require("@akashic-extension/akashic-timeline");
const commonAsaInfo_1 = require("./commonAsaInfo");
const commonAssetInfo_1 = require("./commonAssetInfo");
const commonSoundInfo_1 = require("./commonSoundInfo");
const commonDefine_1 = require("./commonDefine");
const asaInfo_1 = require("../classes/asaInfo");
const assetInfo_1 = require("../classes/assetInfo");
const soundInfo_1 = require("../classes/soundInfo");
const miscAssetInfo_1 = require("../classes/miscAssetInfo");
const asaEx_1 = require("../util/asaEx");
const gameUtil_1 = require("../util/gameUtil");
const spriteUtil_1 = require("../util/spriteUtil");
const entityUtil_1 = require("../util/entityUtil");
const audioUtil_1 = require("../util/audioUtil");
const titleSubscene_1 = require("./titleSubscene");
const descriptionSubscene_1 = require("./descriptionSubscene");
const gameSubscene_1 = require("./gameSubscene");
const resultSubscene_1 = require("./resultSubscene");
const wipeManager_1 = require("./wipeManager");
const commonParameterReader_1 = require("../commonNicowariGame/commonParameterReader");
const informationSubscene_1 = require("./informationSubscene");
/**
 * 起動パラメータイベントの判定を行うメソッド
 * @param {g.MessageEvent} e MessageEventオブジェクト
 * @return {boolean} 起動パラメータイベントであればtrue
 */
function isCOESessionStartMessage(e) {
    return e.data.type === "start";
}
/**
 * mainScene用のSceneを生成するクラス
 */
class MainSceneController extends sceneController_1.SceneController {
    constructor() {
        super();
    }
    /**
     * このクラスのインスタンスと、そのインスタンスで処理するSceneを生成する
     * @param {g.Game} _game Scene生成に使用するGame
     * @return {g.Scene} 生成したScene
     */
    static createMainScene(_game) {
        const controller = new MainSceneController();
        return controller.createScene(g.game);
    }
    /**
     * このクラスで処理するSceneを生成する
     * @param {g.Game} _game Scene生成に使用するGame
     * @return {g.Scene} 生成したScene
     * @override
     */
    createScene(_game) {
        gameUtil_1.gameUtil.initGameState();
        // レイアウト変更要求
        if (_game.external.send) {
            _game.external.send({
                type: "nx:layout",
                layout: "under-comment",
                background: "hidden"
            });
        }
        const assetIds = [];
        spriteUtil_1.spriteUtil.addAssetIdsFromAssetInfoMap(commonAssetInfo_1.CommonAssetInfo, assetIds);
        spriteUtil_1.spriteUtil.addAssetIdsFromAssetInfoMap(assetInfo_1.AssetInfo, assetIds);
        asaEx_1.asaEx.ResourceManager.addAsaAssetIds(spriteUtil_1.spriteUtil.getPjNamesFromAsainfoMap(commonAsaInfo_1.CommonAsaInfo), _game.assets, assetIds);
        asaEx_1.asaEx.ResourceManager.addAsaAssetIds(spriteUtil_1.spriteUtil.getPjNamesFromAsainfoMap(asaInfo_1.AsaInfo), _game.assets, assetIds);
        audioUtil_1.audioUtil.addAssetIdsFromSoundInfoMap(commonSoundInfo_1.CommonSoundInfo, assetIds);
        audioUtil_1.audioUtil.addAssetIdsFromSoundInfoMap(soundInfo_1.SoundInfo, assetIds);
        gameUtil_1.gameUtil.addAssetIdsFromMiscAssetInfoMap(miscAssetInfo_1.MiscAssetInfo, assetIds);
        // console.log("createScene: assetIds:"+assetIds.join(",")+".");
        const scene = new g.Scene({ game: _game, assetIds: assetIds });
        let parameters = null;
        scene.loaded.handle(() => {
            // loaded完了後、OperationEventを処理するため1 tick遅延させる
            scene.update.handle(() => {
                // console.log("scene.update: parameters:" + parameters + ".");
                if (parameters) {
                    // 起動パラメータの保持
                    scene.game.vars.parameters = parameters;
                    commonParameterReader_1.CommonParameterReader.read(parameters);
                }
                else {
                    scene.game.vars.parameters = {};
                    commonParameterReader_1.CommonParameterReader.read({});
                }
                this.onLoaded(scene);
                return true;
            });
            return true;
        });
        scene.message.handle((e) => {
            // console.log("scene.message: e:" + JSON.stringify(e) + ".");
            if (isCOESessionStartMessage(e)) {
                parameters = e.data.parameters;
            }
            return true;
        });
        return scene;
    }
    /**
     * Scene#loadedのハンドラ
     * onUpdateを呼ぶScene#updateのハンドラをこの中で登録する
     * @param {g.Scene} _scene 処理対象のScene
     * @return {boolean} 通常trueを返し、ハンドラ登録を解除する
     * @override
     */
    onLoaded(_scene) {
        const game = _scene.game;
        game.vars.scenedata = {};
        // このシーンで使いまわすTimelineインスタンス
        game.vars.scenedata.timeline = new tl.Timeline(_scene);
        this.mainLayer = new g.E({ scene: _scene });
        entityUtil_1.entityUtil.appendEntity(this.mainLayer, _scene);
        this.wipeLayer = new g.E({ scene: _scene });
        entityUtil_1.entityUtil.appendEntity(this.wipeLayer, _scene);
        this.wipeManager = new wipeManager_1.WipeManager(_scene);
        entityUtil_1.entityUtil.appendEntity(this.wipeManager, this.wipeLayer);
        const shade = new g.FilledRect({
            scene: _scene,
            cssColor: "#000000",
            opacity: commonDefine_1.commonDefine.BG_SHADE_OPACITY,
            width: _scene.game.width,
            height: _scene.game.height
        });
        entityUtil_1.entityUtil.appendEntity(shade, this.mainLayer);
        const infoSubScene = this.informationSubscene = new informationSubscene_1.InformationSubscene(_scene);
        infoSubScene.init();
        infoSubScene.requestedNextSubscene.handle(this, this.goNextFromInformation);
        entityUtil_1.entityUtil.appendEntity(infoSubScene, this.mainLayer);
        const title = this.titleSubscene = new titleSubscene_1.TitleSubscene(_scene);
        title.init();
        title.requestedNextSubscene.handle(this, this.goNextFromTitle);
        entityUtil_1.entityUtil.appendEntity(title, this.mainLayer);
        const desc = this.descriptionSubscene = new descriptionSubscene_1.DescriptionSubscene(_scene);
        desc.init();
        desc.requestedNextSubscene.handle(this, this.goNextFromDescription);
        entityUtil_1.entityUtil.appendEntity(desc, this.mainLayer);
        const main = this.gameSubscene = new gameSubscene_1.GameSubscene(_scene);
        main.init();
        main.requestedNextSubscene.handle(this, this.goNextFromGame);
        entityUtil_1.entityUtil.appendEntity(main, this.mainLayer);
        const result = this.resultSubscene = new resultSubscene_1.ResultSubscene(_scene);
        result.init();
        result.requestedNextSubscene.handle(this, this.goNextFromResult);
        entityUtil_1.entityUtil.appendEntity(result, this.mainLayer);
        if (commonParameterReader_1.CommonParameterReader.muteAudio) {
            audioUtil_1.audioUtil.setMute(true);
        }
        title.setBgmName(main.getTitleBgmName());
        if (commonDefine_1.commonDefine.DEBUG_SKIP_PREGAMESUBSCENE) {
            this.changeSubscene(this.gameSubscene);
        }
        else {
            if (commonParameterReader_1.CommonParameterReader.isInitialSceneGame) {
                this.changeSubscene(this.descriptionSubscene);
            }
            else {
                if (commonParameterReader_1.CommonParameterReader.launchType === commonParameterReader_1.LaunchType.NOTHING) {
                    this.changeSubscene(this.titleSubscene);
                }
                else {
                    this.changeSubscene(this.informationSubscene);
                }
            }
        }
        _scene.update.handle(() => {
            return this.onUpdate(_scene);
        });
        _scene.stateChanged.handle((e) => {
            if (e === g.SceneState.Destroyed) {
                asaEx_1.asaEx.ResourceManager.removeAllLoadedResource();
                delete game.vars.scenedata;
                return true;
            }
            return false;
        });
        return true;
    }
    /**
     * Scene#updateのハンドラ
     * @param {g.Scene} _scene 処理対象のScene
     * @return {boolean} 通常falseを返す
     * @override
     */
    onUpdate(_scene) {
        this.currentSubscene.onUpdate();
        return false;
    }
    /**
     * currentSubsceneをワイプなしで変更する
     * @param {Subscene} _next 変更後のサブシーン
     */
    changeSubscene(_next) {
        if (this.currentSubscene) {
            this.currentSubscene.stopContent();
            this.currentSubscene.hideContent();
        }
        this.currentSubscene = _next;
        this.currentSubscene.showContent();
        this.currentSubscene.startContent();
    }
    /**
     * currentSubsceneをワイプありで変更する
     * @param {boolean} _isRtoL trueならばRtoL、falseならばLtoRのワイプを使用する
     * @param {Subscene} _next 変更後のサブシーン
     */
    trasitionSubscene(_isRtoL, _next) {
        if (this.currentSubscene) {
            this.currentSubscene.stopContent();
        }
        this.wipeManager.startWipe(_isRtoL, () => {
            if (this.currentSubscene) {
                this.currentSubscene.hideContent();
            }
            this.currentSubscene = _next;
            this.currentSubscene.showContent();
        }, () => {
            this.currentSubscene.startContent();
        });
    }
    /**
     * ゲーム開始説明画面からタイトルに遷移する
     * InformationSubScene#requestedNextSubsceneのハンドラ
     */
    goNextFromInformation() {
        this.trasitionSubscene(true, this.titleSubscene);
    }
    /**
     * タイトルから説明に遷移する
     * TitleSubscene#requestedNextSubsceneのハンドラ
     */
    goNextFromTitle() {
        this.trasitionSubscene(true, this.descriptionSubscene);
    }
    /**
     * 説明からゲームに遷移する
     * DescriptionSubscene#requestedNextSubsceneのハンドラ
     */
    goNextFromDescription() {
        this.trasitionSubscene(true, this.gameSubscene);
    }
    /**
     * ゲームからリザルトに遷移する
     * GameSubscene#requestedNextSubsceneのハンドラ
     */
    goNextFromGame() {
        this.trasitionSubscene(false, this.resultSubscene);
    }
    /**
     * リザルトからタイトルに遷移する
     * ResultSubscene#requestedNextSubsceneのハンドラ
     */
    goNextFromResult() {
        if (commonDefine_1.commonDefine.DEBUG_SKIP_PREGAMESUBSCENE) {
            this.changeSubscene(this.gameSubscene);
        }
        else {
            if (commonParameterReader_1.CommonParameterReader.isInitialSceneGame) {
                this.changeSubscene(this.descriptionSubscene);
            }
            else {
                this.changeSubscene(this.informationSubscene);
            }
        }
    }
}
exports.MainSceneController = MainSceneController;

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}