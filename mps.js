window.popX = window.popY = 0;
window.addEventListener("contextmenu", function(mouseEvent) {
	popX = mouseEvent.pageX;
	popY = mouseEvent.pageY;
});
