function Typography (ele) {

	if (ele.select) {

		this.selectionStart = {
			get: function(){
				return ele.selectionStart;
			},
			set: function(offset){
				ele.selectionStart = offset;
			}
		};

		this.selectionEnd = {
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
				dest.focus();
				var oldStart = ele.selectionStart;
				ele.value = ele.value.slice(0, ele.selectionStart) + value + ele.value.slice(ele.selectionEnd, ele.value.length);
				ele.selectionStart = ele.selectionEnd = oldStart + value.length;
			}
		};

		this.getCaretRect = function(){};

	} else if (ele.contentEditable){

		var selection = window.getSelection();
		var range = selection.rangeCount && selection.getRangeAt(0);

		if (dest.textContent == "") {
			dest.textContent = "\u200b";
		};

		this.value = {
			get: function(){
				return ele.textContent;
			},
			set: function(value){
				ele.textContent = value;
			},
			input: function(value){
				//ele.focus();
				var offset = range.startOffset;
				
				ele.textContent = (
					ele.textContent.slice(0, range.startOffset) +
					value +
					ele.textContent.slice(range.endOffset, ele.textContent.length)
				).replace("\u200b", "");

				offset += value.length;
				//range = document.createRange();
				range.setStart(ele.childNodes[0], offset);
				range.setEnd(ele.childNodes[0], offset);
				//range.collapse(false);
				//if(selection.rangeCount > 0) selection.removeAllRanges();
				//selection.addRange(range);
			}
		};

		this.selectionStart = {
			get: function(){
				return range.startOffset;
			},
			set: function(offset){
				range.setStart(range.commonAncestorContainer, offset);
			}
		};

		this.selectionEnd = {
			get: function(){
				return range.endOffset;
			},
			set: function(offset){
				range.setEnd(range.commonAncestorContainer, offset);
			}
		};

		this.getCaretRect = function(){
			var docRect;

			if (range.collapsed) {
				if (range.startOffset == 0) return;

				var newRange = document.createRange();

				var caret;
				if (range.startOffset < range.commonAncestorContainer.length) {

					newRange.setStart(range.commonAncestorContainer, range.startOffset);
					newRange.setEnd(range.commonAncestorContainer, range.startOffset + 1);

					var rect = newRange.getBoundingClientRect();

					docRect = {
						left: rect.left + window.scrollX,
						width: 0
					};

				}else{

					newRange.setStart(range.commonAncestorContainer, range.startOffset - 1);
					newRange.setEnd(range.commonAncestorContainer, range.startOffset);

					var rect = newRange.getBoundingClientRect();

					docRect = {
						left: rect.left + window.scrollX + rect.width,
						width: 0
					};

				};

				docRect.right = docRect.left;

			}else{
				var rect = range.getBoundingClientRect();
				docRect = {
					left: rect.left + window.scrollX,
					right: rect.right + window.scrollX,
					width: rect.width
				};
			};

			docRect.top = rect.top +window.scrollY;
			docRect.bottom = rect.bottom +window.scrollY;
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