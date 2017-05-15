var bext = new Bext();

browser.contextMenus.onClicked.addListener(function() {
	browser.tabs.executeScript(null, { file: "emoji.js", runAt: "document_start" }, function() {
		browser.tabs.executeScript(null, { file: "box.js", runAt: "document_start" }, function() {
			browser.tabs.insertCSS(null, { file: "box.css", runAt: "document_start" }, function() {
				bext.c.call(null, "show");
			});
		});
	});
});

function initTab(tabId) {
	bext.c.eval(tabId, '!("popX" in window)', function (r) {
		if (r) {
			browser.tabs.executeScript(tabId, { file: "mps.js", runAt: "document_start" });
		}
	})
}

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if ("status" in changeInfo && changeInfo.status == "loading") {
		initTab(tabId);
	}
});

bext.b.main(function(createdTabs) {
	for (var i = 0; i < createdTabs.length; i++) {
		initTab(createdTabs[i].id);
	}

	browser.contextMenus.create({
		id: "main",
		title: "Emoji Box",
		contexts: ["editable"]
	});

	var other = document.createElement("script");
	other.setAttribute("src", "other.js");
	document.body.appendChild(other);
});
