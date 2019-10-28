window.gLocalAssetContainer["mainScene"] = function(g) { (function(exports, require, module, __filename, __dirname) {
"use strict";
const mainSceneController_1 = require("./common/mainSceneController");
module.exports = function () {
    return mainSceneController_1.MainSceneController.createMainScene(g.game);
};

})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);
}