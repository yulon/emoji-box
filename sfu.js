String.fromUnicode = function() {
	var string = "";
	for (var i = 0; i < arguments.length; i++) {
		if (arguments[i].constructor == Array) {
			for (var y = 0; y < arguments[i].length; y++) {
				string += String.fromUnicode.numberOrHexString(arguments[i][y]);
			};
		}else{
			string += String.fromUnicode.numberOrHexString(arguments[i]);
		};
	}
	return string;
}

String.fromUnicode.number = function(number) {
	if (number < 0x10000)
	{
		return String.fromCharCode(number);
	} else {
		var over = number - 0x10000 ;
		return String.fromCharCode((0xD800 | ((over & 0xFFC00) >> 10)), (0xDC00 | (over & 0x3ff)));
	}
};

String.fromUnicode.numberOrHexString = function(nohs) {
	var string = "";
	switch(nohs.constructor){
		case Number:
			string = String.fromUnicode.number(nohs);
			break;
		case String:
			var num = 0;
			var numDigit = 0;
			for (var i = nohs.length - 1; i >= 0; i--) {
				var char = nohs.charCodeAt(i);
				var dec;
				switch(true){
					case char > 47 && char < 58: //0~9
						dec = char - 48;
						break;
					case char > 96 && char < 103: //a~f
						dec = char - 87;
						break;
					case char > 64 && char < 71: //A~F
						dec = char - 55;
						break;
					default:
						if (num != 0) {
							string = String.fromUnicode.number(num) + string;
						};
						num = 0;
						numDigit = 0;
						continue;
				}
				num += dec * Math.pow(16, numDigit);
				numDigit++;
			}
			if (num != 0) {
				string = String.fromUnicode.number(num) + string;
			};
	}
	return string;
};