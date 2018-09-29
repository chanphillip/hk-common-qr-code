/*

	This script is to generate the formatted payload from a trimmed
	easy-to-use payload passing to the function below.

	It is based on specifications of "Common QR Code Specification
	for Retail Payments in Hong Kong v1.0"

	Payload is defined as below:
	{
		"init": 'STATIC' | 'DYNAMIC' | (number),	[01]	(optional)
		"merchant": {
			"operator": (number),					[00]
			"info": {
				"guid": (string),
				[id]: (any)							[**]	(optional)
			},
		}
		"additional": {
			"category": (number),					[52]
			"country": (string),					[58]
			"name": (string),						[59]
			"city": (string),						[60]
			"postal": (string),						[61]	(optional)
			"languageTemplate": [					[64]	(optional)
				{
					"language": (string),			[00]
					"name": (string)				[01]
					"city": (string),				[02]	(optional)
					[id]: (any)						[**]
				}
			],
			"currency": (string) | (number),		[53]	(ISO 4217)
			"amount": (string) | (number),			[54]	(conditional)
			"tip": (number),						[55]	(optional)
			"feeFixed": (number),					[56]	(conditional)
			"feePercentage": (number),				[57]	(conditional)
			"data": {
				"bill": (string),					[01]
				"mobile": (string),					[02]
				"store": (string),					[03]
				"loyalty": (string),				[04]
				"reference": (string),				[05]
				"customer": (string),				[06]
				"terminal": (string),				[07]
				"purpose": (string),				[08]
				"request": (string),				[09]
				[subId]: (any)						[**]
			}
		}
	}
*/

(function() {

	var HKCommonQRCode = {};

	// add leading zeros
	var lz = function(value, digit) {
		var zeros = '';
		for (var i = 0; i < digit; i++) {
			zeros += '0';
		}
		return (zeros + value.toString()).substr(-digit);
	};

	// parse currency, based on ISO4217
	var parseCurrency = function(value) {
		if (typeof value === 'number') {
			return lz(value.toString(), 3);
		}

		// TODO: map code from currency list
	};

	HKCommonQRCode.generate = function(payload) {

		var output = '';

		// fixed beginning payload format indicator
		output += '000201';

		// point of initiation method
		output += '0102';
		switch (payload.init) {
			case 'STATIC':
				output += '11';
				break;
			case 'DYNAMIC':
				output += '12';
				break;
			default:
				// TODO: check validity
				output += lz(payload.init, 2);
		}

		// merchant account information
		output += lz(payload.merchant.operator, 2);

		var merchantOutput = Object.keys(payload.merchant.info).map(function(key) {
			switch (key) {
				case 'guid':
					return '00' + lz(payload.merchant.info[key].length, 2) + payload.merchant.info[key];
				default:
					return lz(key, 2) + lz(payload.merchant.info[key].length, 2) + payload.merchant.info[key];
			}
		}).join('');

		output += lz(merchantOutput.length, 2) + merchantOutput;

		// additional merchant information
		output += Object.keys(payload.additional).map(function(key) {
			switch (key) {
				case 'category':
					return '5204' + lz(payload.additional[key], 4);
				case 'country':
					return '5802' + lz(payload.additional[key], 2);
				case 'name':
					return '59' + lz(payload.additional[key].length, 2) + payload.additional[key];
				case 'city':
					return '60' + lz(payload.additional[key].length, 2) + payload.additional[key];
				case 'postal':
					return '61' + lz(payload.additional[key].length, 2) + payload.additional[key];
				case 'languageTemplate':
					var value = payload.additional[key].map(function(languagePayload) {
						return Object.keys(languagePayload).map(function(key2) {
							switch (key2) {
								case 'language':
									return '0002' + lz(languagePayload[key2], 2);
								case 'name':
									return '01' + lz(languagePayload[key2].length, 2) + languagePayload[key2];
								case 'city':
									return '02' + lz(languagePayload[key2].length, 2) + languagePayload[key2];
								default:
									return lz(key2, 2) + lz(languagePayload[key2].length, 2) + languagePayload[key2];
							}
						}).join('');
					}).join('');
					return '64' + lz(value.length, 2) + value;
				case 'currency':
					return '5303' + parseCurrency(payload.additional[key]);
				case 'amount':
					var value = payload.additional[key].toString();
					return '54' + lz(value.length, 2) + value;
				case 'tip':
					return '5502' + lz(payload.additional[key], 2);
				case 'feeFixed':
					return '56' + lz(payload.additional[key].length, 2) + payload.additional[key];
				case 'feePercentage':
					return '57' + lz(payload.additional[key].length, 2) + payload.additional[key];
				case 'data':
					var dataPayload = payload.additional[key]
					var value = Object.keys(dataPayload).map(function(key2) {
						switch (key2) {
							case 'bill':
								return '01' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'mobile':
								return '02' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'store':
								return '03' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'loyalty':
								return '04' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'reference':
								return '05' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'customer':
								return '06' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'terminal':
								return '07' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'purpose':
								return '08' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							case 'request':
								return '09' + lz(dataPayload[key2].length, 2) + dataPayload[key2];
							default:
								return lz(key2, 2) + lz(dataPayload[key2].length, 2) + dataPayload[key2];
						}
					}).join('');
					return '62' + lz(value.length, 2) + value;
				default:
					//
			}
		}).join('');

		return output;
	};

	window.HKCommonQRCode = HKCommonQRCode;

})();
