/* Good-Loop advanced pixel 
This adds exit tracking to the normal pixel. It should be used with the normal pixel, as that is more robust.
*/
if ( ! window.goodloop) goodloop = {};
if ( ! goodloop.LBURL) goodloop.LBURL = '//lg.good-loop.com';

var goodloop.domain = window.location.hostname;

setTimeout(function() {
	var as = document.getElementsByTagName('a');
	for(var i=0; i<as.length; i++) {
		var a = as[i];
		var url = a.href;				
		// don't trackj internal clicks
		var ui = url.indexOf(goodloop.domain);		
		if (ui !=-1 && ui < 20) continue;
		var old = a.onclick;		
		a.onclick = function(e,f,g) {
			console.log(e, f, g);
			try {
				window.datalog.log('goodloop', 'click', {href: url}, true);
			} catch(err) {
				console.error(err);
			}
			if (old) old();
			return true;
		};
	}
}, 250);


// datalog
{
	/** convenience for ajax with cookies */
	const apost = function(url, data) {
		return $.ajax({
			url: url,
			data: data,
			type: 'POST',
			xhrFields: {withCredentials: true}
		});
	};

	/** Url-encoding: e.g. encode a parameter value so you can append it onto a url.
	 * 
	 * Why? When there are 2 built in functions:
	 * escape(), and encodeURIComponent() has better unicode handling -- however it doesn't
	 escape ' which makes it dangerous.
	This is a convenient best-of-both.
	*/
	var encURI = function(urlPart) {
		urlPart = encodeURIComponent(urlPart);
		urlPart = urlPart.replace("'","%27");
		return urlPart;
	}

	const log = function(dataspace, eventTag, eventParams) {
		console.log("datalog", dataspace, eventTag, eventParams);
		// add standard tracking - done automatically server-side
		var data = {
			d: dataspace,
			t: eventTag,
			p: JSON.stringify(eventParams)
		};
		return apost(goodloop.LBURL+'/lg', data);
	}

	/**
	 * 
	 */
	window.datalog = {
		log:log,
		track:track
	}
}