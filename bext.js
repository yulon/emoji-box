function Bext(isListen, isV3) {
	let bext = this

	if (typeof chrome !== 'undefined') {
		globalThis.browser = chrome
	} else {
		if (typeof browser === 'undefined') {
			return
		}
	}

	if (isV3 === undefined) {
		isV3 = !!browser.scripting
	}
	bext.isV3 = isV3

	console.log('[Bext]', isV3 ? 'V3' : 'V2', location.href)

	function rSend(extensionId, msg) {
		if (isV3) {
			return browser.runtime.sendMessage(extensionId, msg)
		}
		return new Promise((resolve, reject) => browser.runtime.sendMessage(extensionId, msg, (r) => {
			if (r) {
				resolve(r)
				return
			}
			if (browser.runtime.lastError) {
				reject(browser.runtime.lastError)
				return
			}
			resolve(r)
		}))
	}

	const isBackend = !!browser.tabs
	bext.isBackend = isBackend

	function onCall(msg, resp) {
		if (!(msg.funcName in globalThis)) {
			return
		}
		let r = globalThis[msg.funcName].apply(globalThis, msg.args)
		if (r && r.constructor === Promise) {
			r.catch(() => null).then(resp)
			return true
		}
		resp(r)
	}

	if (!isBackend) {
		bext.callBackend = (funcName, args) => {
			return rSend(null, { type: 'Call', funcName: funcName, args: args })
		}

		bext.callTab = (tabId, funcName, args) => {
			return rSend(null, { type: 'CallTab', tabId: tabId, funcName: funcName, args: args })
		}

		bext.insertTab = (tabId, file, injectImmediately, allFrames) => {
			return rSend(null, { type: 'InsertTab', tabId: tabId, file: file, injectImmediately: injectImmediately, allFrames: allFrames })
		}

		if (!isListen || globalThis._bext_listenned) {
			return
		}
		globalThis._bext_listenned = true
		browser.runtime.onMessage.addListener((msg, sender, resp) => {
			switch (msg.type) {
				case 'Call':
					return onCall(msg, resp)

				case 'Inserted':
					resp(globalThis._bext_inserteds && msg.scriptName in _bext_inserteds)
					return
			}
		})
		return
	}

	function tSend(tabId, msg, options) {
		if (isV3) {
			return browser.tabs.sendMessage(tabId, msg, options)
		}
		return new Promise((resolve, reject) => browser.tabs.sendMessage(tabId, msg, options, (r) => {
			if (r) {
				resolve(r)
				return
			}
			if (browser.runtime.lastError) {
				reject(browser.runtime.lastError)
				return
			}
			resolve(r)
		}))
	}

	function tInsertV2(tabId, file, injectImmediately, allFrames) {
		return new Promise((resolve, reject) => {
			const inserted = (r) => {
				if (!r) {
					reject(browser.runtime.lastError)
					return
				}
				browser.tabs.executeScript(tabId, {
					code: `
						if (!globalThis._bext_inserteds) {
							globalThis._bext_inserteds = {}
						}
						if (!('` + file + `' in _bext_inserteds)) {
							_bext_inserteds['` + file + `'] = true
						}
					`,
					runAt: 'document_start',
					allFrames: allFrames
				}, () => {
					if (!r) {
						reject(browser.runtime.lastError)
						return
					}
					resolve(false)
				})
			}

			if (file.endsWith('.css')) {
				browser.tabs.insertCSS(tabId, {
					file: file,
					runAt: injectImmediately ? 'document_start' : 'document_idle',
					allFrames: allFrames
				}, inserted)
				return
			}

			browser.tabs.executeScript(tabId, {
				file: file,
				runAt: injectImmediately ? 'document_start' : 'document_idle',
				allFrames: allFrames
			}, inserted)
		})
	}

	function tInsertOnceV2(tabId, file, injectImmediately, allFrames) {
		return tSend(tabId, {
			type: 'Inserted',
			scriptName: file
		}).catch(() => {
			return new Promise((resolve, reject) => {
				browser.tabs.executeScript(tabId, {
					file: 'bext.js',
					runAt: 'document_start',
					allFrames: allFrames
				}, (r) => {
					if (!r) {
						reject(browser.runtime.lastError)
						return
					}
					browser.tabs.executeScript(tabId, {
						code: 'globalThis.bext = new Bext(true, false)',
						runAt: 'document_start',
						allFrames: allFrames
					}, () => {
						if (!r) {
							reject(browser.runtime.lastError)
							return
						}
						resolve(false)
					})
				})
			})
		}).then((inserted) => {
			if (inserted) {
				return Promise.resolve(true)
			}
			return tInsertV2(tabId, file, injectImmediately, allFrames)
		})
	}

	function tInitBextV3() {
		globalThis.bext = new Bext(true, true)
	}

	function tIsInsertedV3(file) {
		if (!globalThis._bext_inserteds) {
			globalThis._bext_inserteds = {}
		}
		if (!(file in _bext_inserteds)) {
			_bext_inserteds[file] = true
		}
	}

	function tInsertV3(tabId, file, injectImmediately, allFrames) {
		const inserted = () => {
			return browser.scripting.executeScript({
				target: { tabId: tabId },
				func: tIsInsertedV3,
				args: [file],
				injectImmediately: true
			})
		}

		if (file.endsWith('.css')) {
			return browser.scripting.insertCSS({
				target: { tabId: tabId, allFrames: allFrames },
				files: [file]
			}).then(inserted)
		}

		return browser.scripting.executeScript({
			target: { tabId: tabId, allFrames: allFrames },
			files: [file],
			injectImmediately: injectImmediately,
		}).then(inserted)
	}

	function tInsertOnceV3(tabId, file, injectImmediately, allFrames) {
		return tSend(tabId, {
			type: 'Inserted',
			scriptName: file
		}).catch(() => {
			return browser.scripting.executeScript({
				target: { tabId: tabId },
				files: ['bext.js'],
				injectImmediately: true
			}).then(() => {
				return browser.scripting.executeScript({
					target: { tabId: tabId },
					func: tInitBextV3,
					injectImmediately: true
				})
			}).then(() => false)
		}).then((inserted) => {
			if (inserted) {
				return Promise.resolve(true)
			}
			return tInsertV3(tabId, file, injectImmediately, allFrames)
		})
	}

	const tInsertOnce = isV3 ? tInsertOnceV3 : tInsertOnceV2

	bext.insertTab = function tInsert(tabId, file, injectImmediately, allFrames) {
		if (tabId === null || tabId === 'active') {
			return new Promise((cb) => browser.tabs.query({ active: true }, cb)).then((tabs) => {
				return tInsertOnce(tabs[0].id, file, injectImmediately, allFrames)
			})
		}
		return tInsertOnce(tabId, file, injectImmediately, allFrames)
	}

	var onInitializedMap = {}
	bext.onInitialized = {
		addListener: (cb) => {
			var cbs = {
				onActivated: (activeInfo) => {
					cb(activeInfo.tabId)
				},
				onUpdated: (tabId, changeInfo, tab) => {
					if (changeInfo && changeInfo.status === 'loading') {
						cb(tabId)
					}
				}
			}
			onInitializedMap[cb] = cbs
			browser.tabs.onActivated.addListener(cbs.onActivated)
			browser.tabs.onUpdated.addListener(cbs.onUpdated)
		},
		removeListener: (cb) => {
			var cbs = onInitializedMap[cb]
			browser.tabs.onActivated.removeListener(cbs.onActivated)
			browser.tabs.onUpdated.removeListener(cbs.onUpdated)
			delete onInitializedMap[cb]
		}
	}

	bext.callBackend = function (funcName, args) {
		return rSend(null, { type: 'Call', funcName: funcName, args: args })
	}

	bext.callTab = function tCall(tabId, funcName, args) {
		if (tabId === null || tabId === 'active') {
			if (isV3) {
				return browser.tabs.query({ active: true }).then((tabs) => {
					return tCall(tabs[0].id, funcName, args)
				})
			}
			return new Promise((cb) => browser.tabs.query({ active: true }, cb)).then((tabs) => {
				return tCall(tabs[0].id, funcName, args)
			})
		}
		return tSend(tabId, { type: 'Call', funcName: funcName, args: args })
	}

	if (!isListen || globalThis._bext_listenned) {
		return
	}
	globalThis._bext_listenned = true
	browser.runtime.onMessage.addListener((msg, sender, resp) => {
		switch (msg.type) {
			case 'Call':
				return onCall(msg, resp)

			case 'CallTab':
				tCall(msg.tabId, msg.funcName, msg.args).catch(() => null).then(resp)
				return true

			case 'InsertTab':
				tInsert(msg.tabId, msg.file, msg.injectImmediately, msg.allFrames).catch(() => null).then(resp)
				return true
		}
	})
}
