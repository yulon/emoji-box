function WEUtil(weObjName) {
	window.we = window[weObjName];

	var cs = this.cs = {};

	cs.init = function(tabId, doneCb) {
		we.tabs.executeScript(tabId, {
			code: `
				if (!("we" in window)) {
					window.we = ` + weObjName + `;
				}
			`,
			runAt: "document_start",
			allFrames: true
		}, function() {
			we.tabs.executeScript(tabId, {
				code: `
					if (!("weUtil" in window)) {
						window.weUtil = {};
						we.runtime.onMessage.addListener(function(msg, sender, resp) {
							switch (msg.type) {
								case "WEUtilMsg.Eval":
									resp(eval(msg.code), true);
									return;
								case "WEUtilMsg.Call":
									resp(window[msg.funcName](), true);
									return;
								case "WEUtilMsg.CallWAR":
									window[msg.funcName](function(r) { resp(r, true); });
									return true;
							}
						});
					}
				`,
				runAt: "document_start"
			}, doneCb);
		});
	};

	function csSendMsg(tabId, msg, resultCb) {
		function send(tabId) {
			we.tabs.sendMessage(tabId, msg, function(r, ok) {
				if (!ok) {
					cs.init(tabId, function() {
						we.tabs.sendMessage(tabId, msg, resultCb);
					});
				} else {
					resultCb(r);
				}
			});
		}

		if (tabId == null) {
			we.tabs.query({ active: true }, function(tabs) {
				send(tabs[0].id);
			});
		} else {
			send(tabId);
		}
	};

	cs.eval = function(tabId, code, resultCb) {
		csSendMsg(tabId, { type: "WEUtilMsg.Eval", code: code}, resultCb);
	};

	cs.call = function(tabId, funcName, resultCb) {
		csSendMsg(tabId, { type: "WEUtilMsg.Call", funcName: funcName}, resultCb);
	};

	cs.callWAR = function(tabId, funcName, argCb) {
		csSendMsg(tabId, { type: "WEUtilMsg.CallWAR", funcName: funcName}, argCb);
	};
};
