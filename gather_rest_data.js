const https = require('https');
const Q = require('q');
const BaseExchange = require('../../models/exchange').BaseExchange;

function biboxTicker() { BaseExchange.call(this, "bibox"); }
biboxTicker.prototype = Object.create(biboxTicker.prototype);
biboxTicker.prototype.getTicker = () => getDeferred().then(adapter);

//Desired currencies to source market data
const symbols = [
	"btc_usdt",
	"eth_usdt",
	"fsn_btc",
	"eos_btc",
	"bix_btc",
	"qtum_btc",
	"gtc_btc",
	"eth_btc",
	"ltc_btc",
	"bch_btc",
	"etc_btc",
	"bch_eth",
	"tnb_btc"
];

function getDeferred(){
	return Q.all(symbols.map(sym => {
		const deferred = Q.defer();
		https.get('https://api.bibox.com/v1/mdata?cmd=ticker&pair='+sym.toUpperCase(), (res) => {
			const { statusCode } = res;
			const contentType = res.headers['content-type'];
			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => { rawData += chunk; });
			res.on('end', () => {
				try {
					const foo = {};
					const bar = JSON.parse(rawData)["result"];
					foo[sym] = bar;
					deferred.resolve(foo);
				} catch (e) {
					console.error(e.message);
				}
			});
		}).on('error', (e) => {
			console.error(`Got error: ${e.message}`);
		});

		return deferred.promise;
	}))
}

function adapter(data){
	a = {};
	for(i in Object.keys(data)){
		sym = Object.keys(data[i])[0];
		a[sym] = {
			bid: +data[i][sym].buy,
			ask: +data[i][sym].sell
		}
		
	}
	return a;
}
	

exports = module.exports = biboxTicker;
