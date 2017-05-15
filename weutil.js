function WEUtil() {
	var weObjName;
	if ("browser" in window) {
		weObjName = "browser";
	} else if ("chrome" in window) {
		weObjName = "chrome";
	} else {
		weObjName = "window";
	}

	window.we = window[weObjName];

	var cs = this.cs = {};

	cs.init = function(tabId, doneCb) {
		try {
			we.tabs.executeScript(tabId, {
				code: `
					if (!("we" in window)) {
						window.we = ` + weObjName + `;
					}
				`,
				runAt: "document_start",
				allFrames: true
			}, function(a) {
				if (a && a.constructor === Array) {
					we.tabs.executeScript(tabId, {
						code: `
							if (!("weUtil" in window)) {
								window.weUtil = {};
								we.runtime.onMessage.addListener(function(msg, sender, resp) {
									switch (msg.type) {
										case "WEUtilMsg.Eval":
											resp([eval(msg.code)]);
											return;
										case "WEUtilMsg.Call":
											resp([eval(msg.funcName)()]);
											return;
										case "WEUtilMsg.CallWAR":
											eval(msg.funcName)(function(r) { resp([r]); });
											return true;
									}
								});
							}
						`,
						runAt: "document_start"
					}, function(a) {
						if (a && a.constructor === Array) {
							doneCb(true);
						} else {
							doneCb(false);
						}
					});
				} else {
					doneCb(false);
				}
			});
		} catch (e) {
			console.log("[Emoji Box]", e);
			doneCb(false);
		}
	};

	function csSendMsg(tabId, msg, resultCb) {
		function send(tabId) {
			function init() {
				cs.init(tabId, function(ok) {
					if (ok) {
						we.tabs.sendMessage(tabId, msg, function(a) {
							if (a && resultCb) {
								resultCb(a[0]);
							}
						});
					}
				});
			}

			try {
				we.tabs.sendMessage(tabId, msg, function(a) {
					if (!a) {
						init();
					} else if (resultCb) {
						resultCb(a[0])
					}
				});
			} catch (e) {
				console.log("[Emoji Box]", e);
				init();
			}
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
