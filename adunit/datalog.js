(function() {
	/** convenience for ajax with cookies, assumes jquery/zepto */
	var apost = function(url, data) {
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
	};

	/**
	 * @deprecated Better to put the img tag directly in the page's html if you can.
	 */
	var track = function(){
		$('body').append('<img src="'+goodloop.LBURL+'/pxl" style="z-index:-1;position:absolute;top:0px;left:0px;width:1;height:1;opacity:0.1;"/>')
	};

	var log = function(dataspace, eventTag, eventParams, addTrackingInfo) {
		console.log("datalog", dataspace, eventTag, eventParams);
		// ip, url --> we could get by cross-referencing the tracking pixel 
		// Since we're only sending small data packets -- use an image??
		// Hm... Post seems to work, lets use that.
		// var url = LBURL+'/lg.gif?dataspace='+escape(dataspace)+"&tag="+encURI(eventTag)+"&params="+encURI(JSON.stringify(eventParams));
		// var img = $('<img src="'+url+'" />');
		// $('body').append(img);
		// DfP site value?
		var site = null;
		try {
			site = unescape(window.location.search.match(/[\?&]site=([^&]+)/)[1]);
		} catch(err) {
			// no site param
		}
		var data = {
			d: dataspace,
			t: eventTag,
			p: JSON.stringify(eventParams),
			r: document.referrer, // If in a SafeFrame, this will be the page url
			s: site // If in a well-configured DfP ad, this will be the page url
		};
		// dont do standard tracking?
		if (addTrackingInfo === false) {
			data.track = false;
		}
		return apost(goodloop.LBURL+'/lg', data);
	};

	/**
	 * "export" 
	 */
	window.datalog = {
		log:log,
		track:track
	};
})();
