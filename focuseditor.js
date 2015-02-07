function FocusEditor (ele) {
	if ("select" in ele) {

		this.input = function(value){
			var oldStart = ele.selectionStart;
			ele.value = ele.value.slice(0, ele.selectionStart) + value + ele.value.slice(ele.selectionEnd, ele.value.length);
			ele.selectionStart = ele.selectionEnd = oldStart + value.length;
		};

	} else if ("contentEditable" in ele){

		var selection = window.getSelection();

		this.input = function(value){
			
		};

		this.getCaretRect = function(){
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
	};

	this.getRect = function(){
		var rect = ele.getBoundingClientRect();
		rect.top += window.scrollY;
		rect.left += window.scrollX;
		return rect;
	};
}