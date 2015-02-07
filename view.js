var win, scl, tab, tabCol, tabRow, dest, feor, popX, popY;
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
				};
			});

			scl = document.createElement("div");
			scl.setAttribute("emoji-box", "scl");
			win.appendChild(scl);

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

	dest = document.activeElement;
	feor = new FocusEditor(dest);
	
	win.style.display = "block";

	var left;
	if ("getCaretRect" in feor) {
		var	rect = feor.getCaretRect();
		left = rect.left + rect.width/2 - win.offsetWidth/2;
		win.style.top = rect.bottom + 10 + "px";
	} else {
		left = popX - win.offsetWidth/2;
		win.style.top = popY + 20 + "px";
	};

	if (left < window.scrollX) {
		win.style.left = window.scrollX + 5 + "px";
	} else if (left + win.offsetWidth > window.scrollX + window.innerWidth) {
		win.style.left = window.scrollX + window.innerWidth - 17 - win.offsetWidth - 5 + "px";
	} else {
		win.style.left = left + "px";
	};

	tabCol = tab.offsetWidth / 32;
	tabRow = Math.ceil(emoji.length / tabCol);
	tab.style.height = tabRow * 32 + "px";

	if ("onscroll" in scl) {
		scl.onscroll();
	};
}

function leftClick() {
	feor.input(String.fromCodePointEx(emoji[this.getAttribute("emoji-box")].unicode));
}

function rightClick() {
	feor.input(":" + emoji[this.getAttribute("emoji-box")].name[0] + ":");
}