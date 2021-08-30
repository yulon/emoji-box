var ts = (new Date()).getTime()

var popX, popY
window.addEventListener("contextmenu", function (mouseEvent) {
	popX = mouseEvent.pageX
	popY = mouseEvent.pageY
})

var win = document.createElement("div")
win.setAttribute("emoji-box", "win")
win.setAttribute("emoji-box-ts", ts)

win.onmousedown = function (mouseEvent) {
	if (mouseEvent.target.tagName === "I") {
		switch (mouseEvent.button) {
			case 0:
				insertEmoji(mouseEvent, "char")
				break
			case 1:
				insertEmoji(mouseEvent, "short")
		}
	}
	mouseEvent.cancelBubble = true
	return false
}

win.onclick = function (mouseEvent) {
	mouseEvent.cancelBubble = true
	return false
}

win.oncontextmenu = function (mouseEvent) {
	if (mouseEvent.target.tagName === "I") {
		insertEmoji(mouseEvent, "short")
	}
	mouseEvent.cancelBubble = true
	return false
}

var aArr
window.addEventListener("mousedown", function () {
	if (win.style.display == "block") {
		win.style.display = null
		win.style.position = null
		if (aArr) {
			aArr.style.visibility = null
		}
	}
})

var upArr = document.createElement("div")
upArr.setAttribute("emoji-box", "upArr")
win.appendChild(upArr)

var box = document.createElement("div")
box.setAttribute("emoji-box", "box")
win.appendChild(box)

var nav = document.createElement("div")
nav.setAttribute("emoji-box", "nav")
box.appendChild(nav)

for (var i = 0; i < emojiGroups.length; i++) {
	var a = document.createElement("a")
	a.setAttribute("emoji-box", "btn")
	a.setAttribute("ix", i)
	a.setAttribute("title", emojiGroups[i].name)
	a.style.backgroundImage = "url(\"" + emojiGroups[i].emojis[1].image + "\")"
	nav.appendChild(a)
}

var pages = new Array(emojiGroups.length)
var curPage
function changePage(i) {
	if (!pages[i]) {
		var page = document.createElement("div")
		page.setAttribute("emoji-box", "page")
		box.appendChild(page)

		for (var j = 0; j < emojiGroups[i].emojis.length; j++) {
			var line = document.createElement("p")
			for (var c = 0; c < 10 && j < emojiGroups[i].emojis.length; c++) {
				var ico = document.createElement("i")
				ico.setAttribute("ix", j)
				ico.setAttribute("title", emojiGroups[i].emojis[j].name)
				ico.style.backgroundImage = "url(\"" + emojiGroups[i].emojis[j].image + "\")"
				line.appendChild(ico)
				j++
			}
			page.appendChild(line)
		}

		pages[i] = page
	}
	pages[i].style.display = "block"

	if (curPage != null) {
		nav.querySelector('[ix="' + curPage + '"]').setAttribute("emoji-box", "btn")
		pages[curPage].style.display = null
	}
	curPage = i

	nav.querySelector('[ix="' + i + '"]').setAttribute("emoji-box", "c-btn")
}
changePage(0)

nav.onmousedown = function (mouseEvent) {
	if (mouseEvent.target.getAttribute("emoji-box") === "btn") {
		var ix = mouseEvent.target.getAttribute("ix")
		if (ix != null) {
			changePage(ix)
		}
	}
	mouseEvent.cancelBubble = true
	return false
}

var downArr = document.createElement("div")
downArr.setAttribute("emoji-box", "downArr")
win.appendChild(downArr)

function show() {
	var dest = document.activeElement

	if (!document.querySelector('div[emoji-box="win"][emoji-box-ts="' + ts + '"]')) {
		document.body.appendChild(win)
	}
	win.style.display = "block"

	var left, top, topOff
	if ("select" in dest) {
		if (popX && popY) {
			left = popX - win.offsetWidth / 2
			top = popY
		} else {
			left = 0
			top = 0
			for (var e = dest; e && "offsetLeft" in e; e = e.offsetParent) {
				left += e.offsetLeft
				top += e.offsetTop
				if (window.getComputedStyle(e).getPropertyValue("position") === "fixed") {
					if (e !== document.body) {
						win.style.position = "fixed"
					}
					break
				}
			}
			if (dest.offsetWidth < win.offsetWidth) {
				left += dest.offsetWidth / 2 - win.offsetWidth / 2
			}
			top += dest.offsetHeight / 2
		}
		topOff = 10
	} else if (dest.contentEditable === "true") {
		var rect = getCaretRect(dest)
		left = rect.left + rect.width / 2 - win.offsetWidth / 2
		top = rect.bottom
		topOff = 0
	}
	if (win.style.position === "") {
		for (var e = dest; e && "offsetLeft" in e; e = e.offsetParent) {
			if (window.getComputedStyle(e).getPropertyValue("position") === "fixed") {
				if (e !== document.body) {
					left -= document.body.parentNode.scrollLeft
					top -= document.body.parentNode.scrollTop
					win.style.position = "fixed"
				}
				break
			}
		}
	}

	if (left < window.scrollX) {
		win.style.left = window.scrollX + 5 + "px"
	} else if (left + win.offsetWidth > window.scrollX + window.innerWidth) {
		win.style.left = window.scrollX + window.innerWidth - 17 - win.offsetWidth - 5 + "px"
	} else {
		win.style.left = left + "px"
	}

	if (top + win.offsetHeight > window.scrollY + window.innerHeight) {
		aArr = downArr
		win.style.top = top - win.offsetHeight - topOff + "px"
		win.style.webkitTransformOrigin = "50% 100%"
	} else {
		aArr = upArr
		win.style.top = top + topOff + "px"
		win.style.webkitTransformOrigin = "50% 0%"
	}
	aArr.style.visibility = "visible"
}

function insertEmoji(event, type) {
	var i = event.target.getAttribute("ix")
	if (i) {
		var emoji = emojiGroups[curPage].emojis[i][type]
		if (emoji) {
			if (!document.execCommand("insertText", false, emoji)) {
				insertText(dest, emoji)
			}
		} else {
			alert("Emoji Box: This :shortcode: is missing.")
		}
	}
}

function insertText(ele, value) {
	if ("select" in ele) {
		var oldStart = ele.selectionStart
		ele.value = ele.value.slice(0, ele.selectionStart) + value + ele.value.slice(ele.selectionEnd, ele.value.length)
		ele.selectionStart = ele.selectionEnd = oldStart + value.length
	} else if ("contentEditable" in ele) {
		var selection = window.getSelection()

		var range = selection.getRangeAt(0)

		var offset = range.startOffset
		ele.textContent = ele.textContent.slice(0, range.startOffset) + value + ele.textContent.slice(range.endOffset, ele.textContent.length)
		offset += value.length

		range.setStart(ele.childNodes[0], offset)
		range.setEnd(ele.childNodes[0], offset)
		if (selection.rangeCount > 0) selection.removeAllRanges()
		selection.addRange(range)
	}
}

function getCaretRect(ele) {
	var selection = window.getSelection()
	var docRect
	var rect
	if (ele.textContent.length == 0) {
		ele.innerHTML = "<span>\u200b</span>"
		rect = ele.getElementsByTagName("span")[0].getBoundingClientRect()
		ele.innerHTML = ""
		docRect = {
			left: rect.left + window.scrollX,
			right: rect.right + window.scrollX,
			width: 0
		}
	} else {
		var range = selection.getRangeAt(0)
		if (range.collapsed) {
			if (range.startOffset < range.commonAncestorContainer.length) {
				range.setEnd(range.commonAncestorContainer, range.startOffset + 1)
				rect = range.getBoundingClientRect()
				range.setEnd(range.commonAncestorContainer, range.startOffset)
				docRect = {
					left: rect.left + window.scrollX
				}
			} else {
				range.setEnd(range.commonAncestorContainer, range.startOffset)
				range.setStart(range.commonAncestorContainer, 0)
				rect = range.getBoundingClientRect()
				range.setStart(range.commonAncestorContainer, range.endOffset)
				docRect = {
					left: rect.right + window.scrollX
				}
			}
			docRect.right = docRect.left
			docRect.width = 0
		} else {
			rect = range.getBoundingClientRect()
			docRect = {
				left: rect.left + window.scrollX,
				right: rect.right + window.scrollX,
				width: rect.width
			}
		}
	}
	docRect.top = rect.top + window.scrollY
	docRect.bottom = rect.bottom + window.scrollY
	docRect.height = rect.height
	return docRect
}
