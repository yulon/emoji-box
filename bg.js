var weUtil = new WEUtil("chrome");

we.contextMenus.onClicked.addListener(function() {
	weUtil.cs.eval(null, '!("emojiGroups" in window)', function (r) {
		if (r) {
			we.tabs.executeScript(null, { file: "emoji.js", runAt: "document_start" }, function() {
				we.tabs.executeScript(null, { file: "box.js", runAt: "document_start" }, function() {
					we.tabs.insertCSS(null, { file: "box.css", runAt: "document_start" }, function() {
						weUtil.cs.call(null, "show");
					});
				});
			});
		} else {
			weUtil.cs.call(null, "show");
		}
	});
});

function init() {
	we.contextMenus.create({
		id: "main",
		title: "Emoji Box",
		contexts: ["editable"]
	});

	var other = document.createElement("script");
	other.setAttribute("src", "other.js");
	document.body.appendChild(other);
}

we.runtime.onStartup.addListener(init);

function initTab(tabId) {
	weUtil.cs.eval(tabId, '!("popX" in window)', function (r) {
		if (r) {
			we.tabs.executeScript(tabId, { file: "mps.js", runAt: "document_start" });
		}
	})
}

we.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if ("title" in changeInfo) {
		initTab(tabId);
	}
});

function initEx() {
	we.tabs.query({}, function(result) {
		for (var i = 0; i < result.length; i++) {
			initTab(result[i].id);
		}
		init();
	});
}

we.runtime.onInstalled.addListener(initEx);

we.management.onEnabled.addListener(function(info) {
	if (info.id === we.runtime.id) {
		initEx();
	}
});
