chrome.contextMenus.create({
	title: "Emoji Box",
	contexts: ["editable"],
	onclick: function() {
		chrome.tabs.executeScript({ code: "if (window.show) { show(); } else { alert('Emoji Box: Please use in the newly opened pages.'); };" });
	}
})
