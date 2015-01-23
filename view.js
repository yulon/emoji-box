var box, tab, tabCol, tabRow, dest, tpgp, popX, popY;
var root = chrome.extension.getURL("/");
var loaded = 0;
var loading = false;
var loadEnd = 0;

window.addEventListener("contextmenu", function(mouseEvent) {
	dest = mouseEvent.srcElement;
	popX = mouseEvent.pageX;
	popY = mouseEvent.pageY;
});

function showBox() {
	if (dest != document.activeElement){
		console.log(dest, document.activeElement);
	};
	
	if(dest.id.slice(0, 10) == "tweet-box-"){
		tpgp = new Typography(dest.childNodes[0]);
	}else{
		tpgp = new Typography(dest);
	};
	
	if (document.getElementById("emoji-box") == null) {
		if (box == null) {
			box = document.createElement("div");
			box.id = "emoji-box";

			box.onclick = box.oncontextmenu = function(me){
				me.cancelBubble = true;
			};

			window.addEventListener("click", hideBox);
			window.addEventListener("contextmenu", hideBox);

			tab = document.createElement("div");
			tab.id = "emoji-box-tab"
			box.appendChild(tab);

			box.onscroll = function(){
				var base = (Math.ceil(box.scrollTop / 32) + 10) * tabCol;

				if (loadEnd >= base) {
					delete box.onmousewheel;
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

		document.body.appendChild(box);

	};

	var	rect = tpgp.getCaretRect();

	if (rect) {
		box.style.left = rect.left + rect.width/2 - 200 + "px";
		box.style.top = rect.bottom + 20 + "px";
	} else {
		box.style.left = popX - 200 + "px";
		box.style.top = popY + 30 + "px";
	};

	box.style.display = "block";

	tab.style.width = box.clientWidth - (box.clientWidth % 32) + "px";

	tabCol = tab.offsetWidth / 32;
	tabRow = Math.ceil(emoji.length / tabCol);
	tab.style.height = tabRow * 32 + "px";

	if (box.onscroll) {
		box.onscroll();
	};
}

function hideBox (argument) {
	if(box.style.display == "block"){
		box.style.display = null;
	};
}

function leftClick(me) {
	tpgp.value.input(emoji[this.getAttribute("emoji-id")].utf16);
	me.cancelBubble = true;
	return false;
}

function rightClick(me) {
	tpgp.value.input(":" + emoji[this.getAttribute("emoji-id")].text + ":");
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