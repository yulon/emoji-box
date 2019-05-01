bext.onInitialized.addListener(function(tab) {
	bext.insert(tab.id, { file: "mps.js", runAt: "document_start" })
});

browser.contextMenus.create({
	title: "Emoji Box",
	contexts: ["editable"]
})

browser.contextMenus.onClicked.addListener(function() {
	bext.insert(null, { file: "emoji.js", runAt: "document_start" }, function (isRepeated) {
		if (isRepeated) {
			bext.call(null, "show")
			return
		}
		browser.tabs.insertCSS(null, { file: "box.css", runAt: "document_start" }, function() {
			bext.insert(null, { file: "box.js", runAt: "document_start" }, function () {
				bext.call(null, "show")
			})
		})
	})
})
