if (String.fromCodePoint == null) {
	String.fromCodePoint = function() {
		var string = "";
		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i] < 0x10000)
			{
				string += String.fromCharCode(arguments[i]);
			} else {
				var over = arguments[i] - 0x10000 ;
				string += String.fromCharCode((0xD800 | ((over & 0xFFC00) >> 10)), (0xDC00 | (over & 0x3ff)));
			}
		}
		return string;
	};
};

String.fromCodePointEx = function() {
	var string = "";
	for (var i = 0; i < arguments.length; i++) {
		switch(arguments[i].constructor){
			case Number:
				string += String.fromCodePoint(arguments[i]);
				break;

			case String:
				var code = 0;
				var digit = 0;
				var chars = "";
				for (var y = arguments[i].length - 1; y >= 0; y--) {
					var char = arguments[i].charCodeAt(y);
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
							if (code != 0) {
								chars = String.fromCodePoint(code) + chars;
							};
							code = 0;
							digit = 0;
							continue;
					}
					code += dec * Math.pow(16, digit);
					digit++;
				}
				if (code != 0) {
					chars = String.fromCodePoint(code) + chars;
				};
				string += chars;
				break;

			case Array:
				for (var y = 0; y < arguments[i].length; y++) {
					string += String.fromCodePointEx(arguments[i][y]);
				}
		}
	}
	return string;
}