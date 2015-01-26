var win, tab, tabCol, tabRow, dest, tpgp, popX, popY;
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
	dest = document.activeElement;
	tpgp = new Typography(dest);

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
				};
			});

			var scl = document.createElement("div");
			scl.setAttribute("emoji-box", "scl");
			win.appendChild(scl);

			tab = document.createElement("div");
			tab.setAttribute("emoji-box", "tab");
			scl.appendChild(tab);
			
			scl.onscroll = function(){
				var base = (Math.ceil(scl.scrollTop / 32) + 10) * tabCol;

				if (loadEnd >= base) {
					delete scl.onscroll;
					loadEnd = emoji.length;
				}else{
					loadEnd = base;
				};

				if (loading == false) {
					loading = true;
					for (; loaded < loadEnd && loaded < emoji.length; loaded++) {
						var ico = document.createElement("i");
						ico.setAttribute("emoji-box", loaded);
						ico.style.backgroundImage = "url(\"" + root + "36x36/" + emoji[loaded].unicode + ".png\")";
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

	var	rect = tpgp.getCaretRect();

	win.style.display = "block";

	if (rect) {
		win.style.left = rect.left + rect.width/2 - win.offsetWidth/2 + "px";
		win.style.top = rect.bottom + 10 + "px";
	} else {
		win.style.left = popX - win.offsetWidth/2 + "px";
		win.style.top = popY + 20 + "px";
	};

	tabCol = tab.offsetWidth / 32;
	tabRow = Math.ceil(emoji.length / tabCol);
	tab.style.height = tabRow * 32 + "px";

	if (scl.onscroll) {
		scl.onscroll();
	};
}

function leftClick() {
	tpgp.value.input(unicodesToString(emoji[this.getAttribute("emoji-box")].unicode));
}

function rightClick() {
	tpgp.value.input(":" + emoji[this.getAttribute("emoji-box")].name[0] + ":");
}

function containsNode(parent, child) {
	if (parent === child) return true;
	child = child.parentNode;
	while (child) {
		if (child === parent) return true;
		child = child.parentNode;
	}
	return false;
}

function unicodesToString (unicodes) {
	var a = unicodes.split("-");
	var ret = "";
	for (var i = 0; i < a.length; i++) {
		ret += unicodeToChar(parseInt(a[i], 16));
	};
	return ret;
}

function unicodeToChar (unicode) {
	if (unicode < 0x10000)
	{
		return unescape("%u" + toHex16String(unicode));
	}
	else
	{
		var over = unicode - 0x10000 ;
		return unescape(
			"%u" + toHex16String(0xD800 | ((over & 0xFFC00) >> 10)) +
			"%u" + toHex16String(0xDC00 | (over & 0x3ff))
		);
	}
}

function toHex16String (num) {
	var hex = "000" + num.toString(16);
	return hex.slice(hex.length - 4, hex.length);
}