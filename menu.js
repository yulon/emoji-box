chrome.contextMenus.create({
	title: "Emoji Box",
	contexts: ["editable"],
	onclick: function() {
		chrome.tabs.executeScript({ code: "showBox();" });
	}
})