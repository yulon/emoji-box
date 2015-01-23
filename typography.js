function Typography (ele) {

	if (ele.select) {

		this.startOffset = {
			get: function(){
				return ele.selectionStart;
			},
			set: function(offset){
				ele.selectionStart = offset;
			}
		};

		this.endOffset = {
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
				dest.focus();
			}
		};

	} else if (ele.contentEditable){
		var val;

		switch(true){
			case ele.id.slice(0, 10) == "tweet-box-": //Twitter
				val = ele.childNodes[0];
				break;
			case ele.getAttribute("g_editable") != null: //Google+
				ele.parentNode.childNodes[0].style.display = "none";
			default:
				val = ele;
		}

		var selection = window.getSelection();
		var range = selection.rangeCount && selection.getRangeAt(0);

		this.value = {
			get: function(){
				return val.textContent;
			},
			set: function(value){
				val.textContent = value;
			},
			input: function(value){
				//dest.focus();

				var offset = range.startOffset;
				val.textContent = val.textContent.slice(0, range.startOffset) + value + val.textContent.slice(range.endOffset, val.textContent.length);
				offset += value.length;
				
				range.setStart(val.childNodes[0], offset);
				range.setEnd(val.childNodes[0], offset);
				//range.collapse(false);
				//if(selection.rangeCount > 0) selection.removeAllRanges();
				//selection.addRange(range);
			}
		};

		this.startOffset = {
			get: function(){
				return range.startOffset;
			},
			set: function(offset){
				range.setStart(range.commonAncestorContainer, offset);
			}
		};

		this.endOffset = {
			get: function(){
				return range.endOffset;
			},
			set: function(offset){
				range.setEnd(range.commonAncestorContainer, offset);
			}
		};


		this.getSelectedBoundingClientRect = function(){
			return range.getBoundingClientRect();
		};

		this.getSelectedPosition = function(){
			var rect = range.getBoundingClientRect();
			return {
				left: rect.left + window.scrollX,
				top: rect.top + window.scrollY,
				width: rect.width,
				height: rect.height
			};
		};

	};

	this.getPosition = function(){
		var rect = ele.getBoundingClientRect();
		return {
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY,
			width: rect.width,
			height: rect.height
		};
	};

}