var ts = (new Date()).getTime();
var win, upArr, downArr, aArr, pages, cPage, tabCol, tabRow, dest;
var root = chrome.extension.getURL("/");

function show() {
	dest = document.activeElement;

	if (!win) {
		win = document.createElement("div");
		win.setAttribute("emoji-box", "win");
		win.setAttribute("emoji-box-ts", ts);

		win.onmousedown = function(mouseEvent) {
			if (mouseEvent.target.tagName === "I") {
				switch (mouseEvent.button) {
					case 0:
						insertEmoji(mouseEvent, "char");
						break;
					case 1:
						insertEmoji(mouseEvent, "short");
				}
			}
			mouseEvent.cancelBubble = true;
			return false;
		};
		win.onclick = function(mouseEvent) {
			mouseEvent.cancelBubble = true;
			return false;
		};
		win.oncontextmenu = function(mouseEvent) {
			if (mouseEvent.target.tagName === "I") {
				insertEmoji(mouseEvent, "short");
			}
			mouseEvent.cancelBubble = true;
			return false;
		};

		window.addEventListener("mousedown", function() {
			if(win.style.display == "block"){
				win.style.display = null;
				if (aArr) {
					aArr.style.visibility = null;
				}
			};
		});

		upArr = document.createElement("div");
		upArr.setAttribute("emoji-box", "upArr");
		win.appendChild(upArr);

		var box = document.createElement("div");
		box.setAttribute("emoji-box", "box");
		win.appendChild(box);

		var nav = document.createElement("div");
		nav.setAttribute("emoji-box", "nav");
		box.appendChild(nav);

		for (var i = 0; i < emojiGroups.length; i++) {
			var a = document.createElement("a");
			a.setAttribute("emoji-box", "btn");
			a.setAttribute("ix", i);
			a.setAttribute("title", emojiGroups[i].name);
			a.style.backgroundImage = "url(\"" + emojiGroups[i].emojis[1].image + "\")";
			nav.appendChild(a);
		}

		var share = document.createElement("a");
		share.setAttribute("emoji-box", "share");
		share.setAttribute("href", "https://twitter.com/intent/tweet?text=I+recommend+a+very+handy+%23emoji+input+browser+extension!+For+Chrome%3A+https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Femoji-box%2Fhnoiafifeglklbpfplmeofgeliopdpih+For+Firefox%3A+https%3A%2F%2Faddons.mozilla.org%2Fzh-CN%2Ffirefox%2Faddon%2Femoji-box%2F");
		share.setAttribute("target", "_blank");
		share.setAttribute("title", "Share Emoji Box on Twitter.");
		share.innerText = "share"
		box.appendChild(share);

		share.onclick = function(mouseEvent) {
			mouseEvent.cancelBubble = true;
		};

		pages = new Array(emojiGroups.length);

		function changePage(i) {
			if (!pages[i]) {
				var page = document.createElement("div");
				page.setAttribute("emoji-box", "page");
				box.appendChild(page);

				tab = document.createElement("div");
				tab.setAttribute("emoji-box", "tab");
				page.appendChild(tab);

				for (var j = 0; j < emojiGroups[i].emojis.length; j++) {
					var ico = document.createElement("i");
					ico.setAttribute("ix", j);
					ico.setAttribute("title", emojiGroups[i].emojis[j].name);
					ico.style.backgroundImage = "url(\"" + emojiGroups[i].emojis[j].image + "\")";
					tab.appendChild(ico);
				}

				pages[i] = page;
			}
			pages[i].style.display = "block";

			if (cPage != null) {
				nav.querySelector('[ix="' + cPage + '"]').setAttribute("emoji-box", "btn");
				pages[cPage].style.display = null;
			}
			cPage = i;

			nav.querySelector('[ix="' + i + '"]').setAttribute("emoji-box", "c-btn");
		}
		changePage(0);

		nav.onclick = function(mouseEvent) {
			if (mouseEvent.target.getAttribute("emoji-box") === "btn") {
				var ix = mouseEvent.target.getAttribute("ix");
				if (ix != null) {
					changePage(ix);
				}
			}
			mouseEvent.cancelBubble = true;
			return false;
		}

		downArr = document.createElement("div");
		downArr.setAttribute("emoji-box", "downArr");
		win.appendChild(downArr);

		document.body.appendChild(win);
	} else {
		if (!document.querySelector('div[emoji-box="win"][emoji-box-ts="' + ts + '"]')) {
			document.body.appendChild(win);
		}
	}

	win.style.display = "block";

	var left, top, topOff;
	if ("select" in dest) {
		left = popX - win.offsetWidth/2;
		top = popY;
		topOff = 10;
	} else if (dest.contentEditable === "true") {
		var	rect = getCaretRect(dest);
		left = rect.left + rect.width/2 - win.offsetWidth/2;
		top = rect.bottom;
		topOff = 0;
	};

	if (left < window.scrollX) {
		win.style.left = window.scrollX + 5 + "px";
	} else if (left + win.offsetWidth > window.scrollX + window.innerWidth) {
		win.style.left = window.scrollX + window.innerWidth - 17 - win.offsetWidth - 5 + "px";
	} else {
		win.style.left = left + "px";
	};

	if (top + win.offsetHeight > window.scrollY + window.innerHeight) {
		aArr = downArr;
		win.style.top = top - win.offsetHeight - topOff + "px";
		win.style.webkitTransformOrigin = "50% 100%";
	}else{
		aArr = upArr;
		win.style.top = top + topOff + "px";
		win.style.webkitTransformOrigin = "50% 0%";
	};
	aArr.style.visibility = "visible";
}

function insertEmoji(event, type) {
	var i = event.target.getAttribute("ix")
	if (i) {
		var emoji = emojiGroups[cPage].emojis[i][type];
		if (emoji) {
			if (!document.execCommand("insertText", false, emoji)) {
				insertText(dest, emoji);
			}
		} else {
			alert("Emoji Box: This :shortcode: is missing.");
		}
	}
}

function insertText(ele, value) {
	if ("select" in ele) {
		var oldStart = ele.selectionStart;
		ele.value = ele.value.slice(0, ele.selectionStart) + value + ele.value.slice(ele.selectionEnd, ele.value.length);
		ele.selectionStart = ele.selectionEnd = oldStart + value.length;
	} else if ("contentEditable" in ele){
		var selection = window.getSelection();

		var range = selection.getRangeAt(0);

		var offset = range.startOffset;
		ele.textContent = ele.textContent.slice(0, range.startOffset) + value + ele.textContent.slice(range.endOffset, ele.textContent.length);
		offset += value.length;

		range.setStart(ele.childNodes[0], offset);
		range.setEnd(ele.childNodes[0], offset);
		if(selection.rangeCount > 0) selection.removeAllRanges();
		selection.addRange(range);
	}
}

function getCaretRect(ele){
	var selection = window.getSelection();
	var docRect;
	var rect;
	if (ele.textContent.length == 0) {
		ele.innerHTML = "<span>\u200b</span>";
		rect = ele.getElementsByTagName("span")[0].getBoundingClientRect();
		ele.innerHTML = "";
		docRect = {
			left: rect.left + window.scrollX,
			right: rect.right + window.scrollX,
			width: 0
		};
	} else {
		var range = selection.getRangeAt(0);
		if (range.collapsed) {
			if (range.startOffset < range.commonAncestorContainer.length) {
				range.setEnd(range.commonAncestorContainer, range.startOffset + 1);
				rect = range.getBoundingClientRect();
				range.setEnd(range.commonAncestorContainer, range.startOffset);
				docRect = {
					left: rect.left + window.scrollX
				};
			} else{
				range.setEnd(range.commonAncestorContainer, range.startOffset);
				range.setStart(range.commonAncestorContainer, 0);
				rect = range.getBoundingClientRect();
				range.setStart(range.commonAncestorContainer, range.endOffset);
				docRect = {
					left: rect.right + window.scrollX
				};
			};
			docRect.right = docRect.left;
			docRect.width = 0;
		}else{
			rect = range.getBoundingClientRect();
			docRect = {
				left: rect.left + window.scrollX,
				right: rect.right + window.scrollX,
				width: rect.width
			};
		};
	};
	docRect.top = rect.top + window.scrollY;
	docRect.bottom = rect.bottom + window.scrollY;
	docRect.height = rect.height;
	return docRect;
};
