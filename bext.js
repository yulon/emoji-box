function Bext() {
	var bext = this;

	try {
		if (browser) {
			bext.isStd = true;
		}
	} catch (e) {
		if (chrome) {
			window.browser = window.chrome;
		} else {
			window.browser = window;
		}
	}

	var c = bext.c = {};

	c.init = function(tabId, doneCb) {
		try {
			var baseCode;
			if (!bext.isStd) {
				baseCode = `window.browser = chrome;`
			} else {
				baseCode = "";
			}
			browser.tabs.executeScript(tabId, {
				code: baseCode + `
					if (!("bext" in window)) {
						window.bext = {};
						browser.runtime.onMessage.addListener(function(msg, sender, resp) {
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
		} catch (e) {
			console.log("[Emoji Box]", e);
			doneCb(false);
		}
	};

	function cSendMsg(tabId, msg, resultCb) {
		function cSendMsg2Tab(tabId) {
			function cInit() {
				c.init(tabId, function(ok) {
					if (ok) {
						browser.tabs.sendMessage(tabId, msg, function(a) {
							if (a && resultCb) {
								resultCb(a[0]);
							}
						});
					}
				});
			}

			try {
				browser.tabs.sendMessage(tabId, msg, function(a) {
					if (!a) {
						cInit();
					} else if (resultCb) {
						resultCb(a[0])
					}
				});
			} catch (e) {
				console.log("[Emoji Box]", e);
				cInit();
			}
		}

		if (tabId == null) {
			browser.tabs.query({ active: true }, function(tabs) {
				cSendMsg2Tab(tabs[0].id);
			});
		} else {
			cSendMsg2Tab(tabId);
		}
	};

	c.eval = function(tabId, code, resultCb) {
		cSendMsg(tabId, { type: "WEUtilMsg.Eval", code: code}, resultCb);
	};

	c.call = function(tabId, funcName, resultCb) {
		cSendMsg(tabId, { type: "WEUtilMsg.Call", funcName: funcName}, resultCb);
	};

	c.callWAR = function(tabId, funcName, argCb) {
		cSendMsg(tabId, { type: "WEUtilMsg.CallWAR", funcName: funcName}, argCb);
	};

	var b = bext.b = {};

	b.main = function(mainFunc) {
		function bInit() {
			browser.tabs.query({}, function(createdTabs) {
				mainFunc(createdTabs);
			});
		}

		if (!bext.isStd && browser.runtime.getManifest().background.persistent === false) {
			browser.runtime.onStartup.addListener(function() { mainFunc([]); });
			browser.runtime.onInstalled.addListener(bInit);
			browser.management.onEnabled.addListener(function(info) {
				if (info.id === browser.runtime.id) {
					bInit();
				}
			});
		} else {
			bInit();
		}
	}
};
