var request = require('request');
var cheerio = require('cheerio');
var cache = require('./cache');

module.exports = new (function() {
	this.readDailyMenu = function(callback) {
		var restaurant = cache.get('itb-daily');
		if (restaurant) {
			callback(restaurant);
		} else {
			load(function(restaurant) {
				cache.set('itb-daily', restaurant);
				callback(restaurant);
			});
		}
	};
})();

function load(callback) {
	loadUrl(function(html) {
		var menu = parse(html);
		callback({name: 'ITB', menu: menu});
	});
}

function loadUrl(callback) {
	var url = 'http://www.itbfood.sk/index.php?id=1&type=main_menu&t=1';
	request(url, function(err, res, body) {
		if (!!err) {
			throw err;
		}				
		callback(body);
	});
}

function parse(html) {

	var $ = cheerio.load(html);

	var normalize = function(str) {
		return str.trim()
			.replace(/\s\s+/g, ' ')
			.replace(/^\d\.\s*/, '');
	}

	var parseMenu = function(elem) {
		return $(elem).find('tr').map(function() {
			var text = $(this).text();
			return normalize(text);	
		});
	};
	
	var today;
	
	var text = $('td.cnt', '#contentBox').children('table').each(function(index, element){
	    if(!today && index == new Date().getDay()-1)
	    {
	        today = parseMenu(element);
	        return false; //break loop
	    }
	});
	
	
	return today;
}
