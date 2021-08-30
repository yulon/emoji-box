var bext = new (function (g) {
	var th1s = this

	if (typeof (browser) === "undefined") {
		if (typeof (chrome) === "undefined") {
			return
		}
		g.browser = chrome
		th1s.isChrome = true
	} else {
		if (typeof (chrome) === "undefined") {
			if (typeof (browser) === "undefined") {
				return
			}
			g.chrome = browser
		}
		th1s.isChrome = false
	}

	var insertCbs = {}

	function callInsertCb(msg, sender, isRepeated) {
		if (!(sender.tab.id in insertCbs)) {
			return
		}
		var insertCbsOnThisTab = insertCbs[sender.tab.id]
		if (!(msg.scriptName in insertCbsOnThisTab)) {
			return
		}
		insertCbsOnThisTab[msg.scriptName](isRepeated)
		delete insertCbsOnThisTab[msg.scriptName]
	}

	browser.runtime.onMessage.addListener(function (msg, sender, resp) {
		switch (msg.type) {
			case "Bext.Message.Inserted":
				callInsertCb(msg, sender, true)
				return

			case "Bext.Message.ToBeInserted":
				callInsertCb(msg, sender, false)
				return

			case "Bext.Message.Call":
				resp(g[msg.funcName](sender.tab.id))
				return

			case "Bext.Message.CallA":
				g[msg.funcName](sender.tab.id, resp)
				return true
		}
	})

	browser.runtime.onMessage.addListener(function (tabId, removeInfo) {
		if (tabId in insertCbs) {
			delete insertCbs[tabId]
		}
	})

	function getHash(str) {
		var hash = 0
		for (var i = 0; i != str.length(); ++i) {
			hash = 131 * hash + str.charCodeAt(i)
		}
		return hash
	}

	function basicInsert(tab, details, cb) {
		if (!tab || !("id" in tab) || !("url" in tab)) {
			return
		}
		if (typeof URL === "undefined") {
			console.log(tab)
		}
		var urlSlices = tab.url.split(":")
		if (
			urlSlices.length !== 2 ||
			tab.url.substr(0, 4) !== "http"
		) {
			return
		}

		var scriptName
		if (!("file" in details) && !("code" in details)) {
			return
		} else if ("file" in details) {
			scriptName = details.file
		} else if ("code" in details) {
			scriptName = "[" + getHash(details.code) + "]"
		} else {
			return
		}

		if (!(tab.id in insertCbs)) {
			insertCbs[tab.id] = {}
		}
		insertCbs[tab.id][scriptName] = function (isRepeated) {
			if (isRepeated) {
				if (cb) {
					cb(isRepeated)
				}
				return
			}
			browser.tabs.executeScript(tab.id, details, function () {
				if (cb) {
					cb(isRepeated)
				}
			})
		}

		browser.tabs.executeScript(tab.id, {
			code: `
				if (typeof(browser) === "undefined") {
					this.browser = chrome
				} else if (typeof(chrome) === "undefined") {
					this.chrome = browser
				}
				if (!("bext" in this)) {
					function basicCall(type, funcName, resultCb) {
						browser.runtime.sendMessage(null, { type: type, funcName: funcName}, resultCb)
					}
					this.bext = {
						call: function(funcName, resultCb) {
							basicCall("Bext.Message.Call", funcName, resultCb)
						},
						callA: function(funcName, resultCb) {
							basicCall("Bext.Message.CallA", funcName, resultCb)
						}
					}
					var g = this
					browser.runtime.onMessage.addListener(function(msg, sender, resp) {
						switch (msg.type) {
							case "Bext.Message.Call":
								resp(g[msg.funcName]())
								return
							case "Bext.Message.CallA":
								g[msg.funcName](resp)
								return true
						}
					})
				}
				if (!("InsertedScripts" in bext)) {
					bext.InsertedScripts = {}
				}
				if ("` + scriptName + `" in bext.InsertedScripts) {
					browser.runtime.sendMessage(null, { type: "Bext.Message.Inserted", scriptName: \`` + scriptName + `\`})
				} else {
					bext.InsertedScripts["` + scriptName + `"] = true
					browser.runtime.sendMessage(null, { type: "Bext.Message.ToBeInserted", scriptName: \`` + scriptName + `\`})
				}
			`
		})
	}

	this.insert = function (tabId, details, cb) {
		if (tabId == null) {
			browser.tabs.query({ active: true }, function (tabs) {
				basicInsert(tabs[0], details, cb)
			})
			return
		}
		browser.tabs.get(tabId, function (tab) {
			basicInsert(tab, details, cb)
		})
	}

	var onInitializedMap = {}

	this.onInitialized = {
		addListener: function (cb) {
			var cbs = {
				onActivated: function (activeInfo) {
					cb(activeInfo.tabId)
				},
				onUpdated: function (tabId, changeInfo, tab) {
					if ("status" in changeInfo && changeInfo.status == "loading") {
						cb(tabId)
					}
				}
			}
			onInitializedMap[cb] = cbs
			browser.tabs.onActivated.addListener(cbs.onActivated)
			browser.tabs.onUpdated.addListener(cbs.onUpdated)
		},
		removeListener: function (cb) {
			var cbs = onInitializedMap[cb]
			browser.tabs.onActivated.removeListener(cbs.onActivated)
			browser.tabs.onUpdated.removeListener(cbs.onUpdated)
			delete onInitializedMap[cb]
		}
	}

	function basicCall(tabId, type, funcName, resultCb) {
		if (tabId == null) {
			browser.tabs.query({ active: true }, function (tabs) {
				basicCall(tabs[0].id, type, funcName, resultCb)
			})
			return
		}
		browser.tabs.sendMessage(tabId, { type: type, funcName: funcName }, resultCb)
	}

	this.call = function (tabId, funcName, resultCb) {
		basicCall(tabId, "Bext.Message.Call", funcName, resultCb)
	}

	this.callA = function (tabId, funcName, resultCb) {
		basicCall(tabId, "Bext.Message.CallA", funcName, resultCb)
	}
})(this)
