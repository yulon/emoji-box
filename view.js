var box, tab, tabCol, tabRow, dest, tpgp;
var root = chrome.extension.getURL("/");
var loaded = 0;
var loading = false;
var loadEnd = 0;

function showBox() {
	dest = document.activeElement;
	tpgp = new Typography(dest);
	
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

	var tpgpPos = tpgp.getPosition();
	box.style.left = tpgpPos.left + "px";
	box.style.top = tpgpPos.top + tpgpPos.height + "px";
	box.style.width = tpgpPos.width + "px";

	box.style.display = "block";
	box.animate(
		[
			{ offset:0, opacity: 0, transform: "scale(0, 0)" },
			{ offset:6/10, transform: "scale(1.1, 1.1)" },
			{ offset:1, opacity: 1, transform: "scale(1, 1)" }
		],
		{
			duration: 300
		}
	);

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