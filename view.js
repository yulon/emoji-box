var box, tab, tabCol, tabRow, dest, er;
var root = chrome.extension.getURL("/");
var loaded = 0;
var loading = false;
var loadEnd = 0;

function showBox() {
	dest = document.activeElement;
	er = new Editor(dest)
	
	if (box == null) {
		box = document.createElement("div");
		box.id = "emoji-box";
		box.setAttribute("bani", "up2down pluse 3ds");

		box.onclick = box.oncontextmenu = function(me){
			me.cancelBubble = true;
		};

		window.addEventListener("click", hideBox);
		window.addEventListener("contextmenu", hideBox);

		tab = document.createElement("div");
		tab.id = "emoji-box-tab"
		box.appendChild(tab);

		document.body.appendChild(box);

		box.onscroll = function(){
			var base = (Math.ceil(box.scrollTop / 32) + 15) * tabCol;

			if (loadEnd >= base) {
				box.onmousewheel = null;
				loadEnd = emoji.length;
			}else{
				loadEnd = base;
			};

			if (loading == false) {
				loading = true;
				for (; loaded < loadEnd && loaded < emoji.length; loaded++) {
					var ico = document.createElement("i");
					ico.setAttribute("emoji-id", loaded);
					ico.style.backgroundImage = "url(\"" + root + "emoji/" + emoji[loaded].unicode + ".png\")";
					ico.onclick = leftClick;
					ico.oncontextmenu = rightClick;
					tab.appendChild(ico);
				};
				loading = false;
			};
		};
	};

	var erPos = er.getPosition();
	box.style.left = erPos.left + "px";
	box.style.top = erPos.top + erPos.height + "px";
	box.style.width = erPos.width + "px";

	box.style.display = "block";

	tab.style.width = box.clientWidth - (box.clientWidth % 32) + "px";

	tabCol = tab.offsetWidth / 32;
	tabRow = Math.ceil(emoji.length / tabCol);
	tab.style.height = tabRow * 32 + "px";

	if (box.onscroll != null) {
		box.onscroll();
	};

}

function hideBox (argument) {
	if(box.style.display == "block"){
		box.style.display = null;
	};
}

function leftClick(me) {
	er.value.input(emoji[this.getAttribute("emoji-id")].utf16);
	me.cancelBubble = true;
	return false;
}

function rightClick(me) {
	er.value.input(":" + emoji[this.getAttribute("emoji-id")].text + ":");
	me.cancelBubble = true;
	return false;
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