var win, upArr, downArr, aArr, scl, tab, tabCol, tabRow, dest, feor, popX, popY;
var root = chrome.extension.getURL("/");
var loaded = 0;
var loading = false;
var loadEnd = 0;

window.addEventListener("contextmenu", function(mouseEvent) {
	//dest = mouseEvent.srcElement;
	popX = mouseEvent.pageX;
	popY = mouseEvent.pageY;
});

function show() {

	if (document.querySelector("[emoji-box=\"win\"]") == null) {
		if (win == null) {
			win = document.createElement("div");
			win.setAttribute("emoji-box", "win");

			win.onmousedown = win.onclick = win.oncontextmenu = function(mouseEvent){
				mouseEvent.cancelBubble = true;
				return false;
			};

			window.addEventListener("mousedown", function() {
				if(win.style.display == "block"){
					win.style.display = null;
					aArr.style.visibility = null;
				};
			});

			upArr = document.createElement("div");
			upArr.setAttribute("emoji-box", "upArr");
			win.appendChild(upArr);

			scl = document.createElement("div");
			scl.setAttribute("emoji-box", "scl");
			win.appendChild(scl);

			downArr = document.createElement("div");
			downArr.setAttribute("emoji-box", "downArr");
			win.appendChild(downArr);

			tab = document.createElement("div");
			tab.setAttribute("emoji-box", "tab");
			scl.appendChild(tab);

			scl.onscroll = function(){
				var base = (Math.ceil(scl.scrollTop / 32) + 10) * tabCol;

				if (base >= emoji.length) {
					delete scl.onscroll;
					loadEnd = emoji.length;
				}else{
					loadEnd = base;
				};

				if (loading == false) {
					loading = true;
					for (; loaded < loadEnd; loaded++) {
						var ico = document.createElement("i");
						ico.setAttribute("emoji-box", loaded);
						ico.style.backgroundImage = "url(\"" + root + "icons/" + emoji[loaded].unicode + ".png\")";
						ico.onclick = leftClick;
						ico.oncontextmenu = rightClick;
						tab.appendChild(ico);
					};
					loading = false;
				};
			};
		};
		document.body.appendChild(win);
	};

	dest = document.activeElement;

	win.style.display = "block";
	tabCol = tab.offsetWidth / 32;
	tabRow = Math.ceil(emoji.length / tabCol);
	tab.style.height = tabRow * 32 + "px";

	var left, top, topOff;
	if ("select" in dest) {
		left = popX - win.offsetWidth/2;
		top = popY;
		topOff = 10;
	} else if ("contentEditable" in dest) {
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

	if ("onscroll" in scl) {
		scl.onscroll();
	};
}

function leftClick() {
	document.execCommand("insertText", false, String.fromCodePointEx(emoji[this.getAttribute("emoji-box")].unicode));
}

function rightClick() {
	document.execCommand("insertText", false, ":" + emoji[this.getAttribute("emoji-box")].name[0] + ":");
}

function getCaretRect(ele){
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
				docRect = {
					left: rect.left + window.scrollX
				};
			} else{
				range.setEnd(range.commonAncestorContainer, range.startOffset);
				range.setStart(range.commonAncestorContainer, 0);
				rect = range.getBoundingClientRect();
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
