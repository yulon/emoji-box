function Bext() {
	var bext = this;

	if ("browser" in Bext.scope) {
		bext.isStd = true;
	} else if ("chrome" in Bext.scope) {
		Bext.scope.browser = Bext.scope.chrome;
	} else {
		Bext.scope.browser = Bext.scope;
	}

	var c = bext.c = {};

	c.init = function(tabId, doneCb) {
		try {
			var baseCode;
			if (!bext.isStd) {
				baseCode = `
					if ("chrome" in this) {
						this.browser = this.chrome;
					} else {
						this.browser = this;
					}
				`
			} else {
				baseCode = "";
			}
			browser.tabs.executeScript(tabId, {
				code: `
					if (!("bext" in this)) {
						` + baseCode + `
						this.bext = {};
						this.bext.c = {};
						this.bext.c.global = this;
						browser.runtime.onMessage.addListener(function(msg, sender, resp) {
							switch (msg.type) {
								case "BextMsg.Has":
									resp([msg.obj in bext.c.global]);
									return;
								case "BextMsg.Call":
									resp([bext.c.global[msg.funcName]()]);
									return;
								case "BextMsg.CallWAR":
									bext.c.global[msg.funcName](function(r) { resp([r]); });
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

	c.has = function(tabId, object, resultCb) {
		cSendMsg(tabId, { type: "BextMsg.Has", obj: object}, resultCb);
	};

	c.call = function(tabId, funcName, resultCb) {
		cSendMsg(tabId, { type: "BextMsg.Call", funcName: funcName}, resultCb);
	};

	c.callWAR = function(tabId, funcName, argCb) {
		cSendMsg(tabId, { type: "BextMsg.CallWAR", funcName: funcName}, argCb);
	};
};

Bext.scope = this;
