String.fromCodePointEx = function() {
	var string = "";
	for (var i = 0; i < arguments.length; i++) {
		if (arguments[i].constructor == Array) {
			for (var y = 0; y < arguments[i].length; y++) {
				string += String.fromCodePointEx.single(arguments[i][y]);
			};
		}else{
			string += String.fromCodePointEx.single(arguments[i]);
		};
	}
	return string;
}

if (String.fromCodePoint == null) {
	String.fromCodePoint = function(code) {
		if (code < 0x10000)
		{
			return String.fromCharCode(code);
		} else {
			var over = code - 0x10000 ;
			return String.fromCharCode((0xD800 | ((over & 0xFFC00) >> 10)), (0xDC00 | (over & 0x3ff)));
		}
	};
};

String.fromCodePointEx.single = function(preCode) {
	var string = "";
	switch(preCode.constructor){
		case Number:
			string = String.fromCodePoint(preCode);
			break;
		case String:
			var num = 0;
			var numDigit = 0;
			for (var i = preCode.length - 1; i >= 0; i--) {
				var char = preCode.charCodeAt(i);
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
							string = String.fromCodePoint(num) + string;
						};
						num = 0;
						numDigit = 0;
						continue;
				}
				num += dec * Math.pow(16, numDigit);
				numDigit++;
			}
			if (num != 0) {
				string = String.fromCodePoint(num) + string;
			};
	}
	return string;
};