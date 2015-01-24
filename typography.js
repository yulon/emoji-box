function Typography (ele) {

	if (ele.select) {

		this.selStart = {
			get: function(){
				return ele.selectionStart;
			},
			set: function(offset){
				ele.selectionStart = offset;
			}
		};

		this.selEnd = {
			get: function(){
				return ele.selectionEnd;
			},
			set: function(offset){
				ele.selectionEnd = offset;
			}
		};

		this.value = {
			get: function(){
				return ele.value;
			},
			set: function(value){
				ele.value = value;
			},
			input: function(value){
				var oldStart = ele.selectionStart;
				ele.value = ele.value.slice(0, ele.selectionStart) + value + ele.value.slice(ele.selectionEnd, ele.value.length);
				ele.selectionStart = ele.selectionEnd = oldStart + value.length;
			}
		};

		this.getCaretRect = function(){};

	} else if (ele.contentEditable){

		var selection = window.getSelection();

		this.value = {
			get: function(){
				return ele.textContent;
			},
			set: function(value){
				ele.textContent = value;
			},
			input: function(value){
				var range = selection.getRangeAt(0);

				var offset = range.startOffset;
				ele.textContent = ele.textContent.slice(0, range.startOffset) + value + ele.textContent.slice(range.endOffset, ele.textContent.length);
				offset += value.length;

				range.setStart(ele.childNodes[0], offset);
				range.setEnd(ele.childNodes[0], offset);
				if(selection.rangeCount > 0) selection.removeAllRanges();
				selection.addRange(range);
			}
		};

		this.selStart = {
			get: function(){
				var range = selection.getRangeAt(0);
				return range.startOffset;
			},
			set: function(offset){
				var range = selection.getRangeAt(0);
				range.setStart(range.commonAncestorContainer, offset);
				if(selection.rangeCount > 0) selection.removeAllRanges();
				selection.addRange(range);
			}
		};

		this.selEnd = {
			get: function(){
				var range = selection.getRangeAt(0);
				return range.endOffset;
			},
			set: function(offset){
				var range = selection.getRangeAt(0);
				range.setEnd(range.commonAncestorContainer, offset);
				if(selection.rangeCount > 0) selection.removeAllRanges();
				selection.addRange(range);
			}
		};

		this.getCaretRect = function(){
			var docRect;
			if (ele.textContent.length == 0) {
				ele.innerHTML = "<span>\u200b</span>";
				var rect = ele.getElementsByTagName("span")[0].getBoundingClientRect();
				ele.innerHTML = "";
				docRect = {
					left: rect.left + window.scrollX,
					right: rect.right + window.scrollX,
					width: 0
				};
			} else{
				var range = selection.getRangeAt(0);
				var rect;
				if (range.collapsed) {
					if (range.startOffset == ele.textContent.length) {
						range.setStart(ele.childNodes[0], range.startOffset - 1);
						range.setEnd(ele.childNodes[0], range.startOffset);
						rect = range.getBoundingClientRect();
						docRect = {
							left: rect.left + window.scrollX + rect.width
						};
					} else{
						range.setStart(ele.childNodes[0], range.startOffset);
						range.setEnd(ele.childNodes[0], range.startOffset + 1);
						rect = range.getBoundingClientRect();
						docRect = {
							left: rect.left + window.scrollX
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