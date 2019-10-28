var config = {
	showMenu: true,
    "autoSendEvents": "mySessionParameter",
	events: {
		 "mySessionParameter": [
            [
                32, // g.MessageEventを示す0x20
                0,
                ":akashic", // プレイヤーID
                {
                    "type":"start", // セッションパラメータであることを示すstart
                    "parameters":{
                        "mode": "single",
                        "totalTimeLimit": 75 // タイムリミット
                    }
                }
            ]
        ]
		
	}
};

module.exports = config;
