function Editor (ele) {

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

	} else if (ele.tagName == "DIV"){
		var val;
		
		if(ele.id.slice(0, 10) == "tweet-box-"){

			val = ele.querySelector("div");
			
			if(val.childElementCount==1 && val.childNodes[0].tagName=="BR"){
				val.removeChild(val.childNodes[0]);
			}


		}else{
			val = ele;
		}
		

		var selection = document.getSelection();
		var range = selection.rangeCount && selection.getRangeAt(0);


		this.value = {
			get: function(){
				return val.innerHTML;
			},
			set: function(value){
				val.innerHTML = value;
			},
			input: function(value){
				//dest.focus();
				//console.log(ele.childElementCount, ele.childNodes[0].tagName);

				var oldStart = range.startOffset;
				val.innerHTML = val.innerHTML.slice(0, range.startOffset) + value + val.innerHTML.slice(range.endOffset, val.innerHTML.length);

				range.setStart(range.commonAncestorContainer, oldStart + value.length);
				range.setEnd(range.commonAncestorContainer, oldStart + value.length);

				//selection.removeAllRanges();
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