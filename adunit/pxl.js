/* Good-Loop advanced pixel 
This adds exit tracking to the normal pixel. It should be used with the normal pixel, as that is more robust.
*/
if ( ! goodloop) goodloop = {};
if ( ! goodloop.LBURL) goodloop.LBURL = '//lg.good-loop.com';

var body = document.getElementsByTagName('body');

var domain = window.location.hostname;

setTimeout(function() {
	var as = document.getElementsByTagName('a');
	console.log(as);
	for(var i=0; i<as.length; i++) {
		var a = as[i];
		var url = a.href;				
		// don't trackj internal clicks
		var ui = url.indexOf(domain);		
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

	/**
	 * @deprecated Better to put the img tag directly in the page's html if you can.
	 */
	const track = function(){
		// if ($('img#goodlooppixel').length !== 0) return; // dont add twice. ACtually, the browser will only load an image once anyway
		$('body').append('<img src="'+goodloop.LBURL+'/pxl" style="z-index:-1;position:absolute;top:0px;left:0px;width:1;height:1;opacity:0.1;"/>')
	}

	const log = function(dataspace, eventTag, eventParams, addTrackingInfo) {
		console.log("datalog", dataspace, eventTag, eventParams);
		// add standard tracking
		if ( addTrackingInfo ) {
			if ( ! eventParams.user) eventParams.user = '$user';
			if ( ! eventParams.ip) eventParams.ip = '$ip';
			if ( ! eventParams.url) eventParams.url = '$url';
			if ( ! eventParams.useragent) eventParams.useragent = '$useragent';
		}
		// ip, url --> we could get by cross-referencing the tracking pixel 
		// Since we're only sending small data packets -- use an image??
		// Hm... Post seems to work, lets use that.
		// var url = LBURL+'/lg.gif?dataspace='+escape(dataspace)+"&tag="+encURI(eventTag)+"&params="+encURI(JSON.stringify(eventParams));
		// var img = $('<img src="'+url+'" />');
		// $('body').append(img);
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