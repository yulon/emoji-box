importScripts('bext.js')

const bext = new Bext()

browser.contextMenus.create({
	id: "emojibox",
	title: "Emoji Box",
	contexts: ["editable"]
})

browser.contextMenus.onClicked.addListener(function () {
	bext.insertTab(null, 'emoji.js', true)
		.then(() => bext.insertTab(null, 'box.css', true))
		.then(() => bext.insertTab(null, 'box.js', true))
		.then(() => bext.callTab(null, 'show'))
})
