/** Change state */

/*	LIFECYLE

1. Advert
2. startVideo -> openLightbox

3. closeLightbox (covers all forms of exit)
   -?> exitEarly



*/

goodloop.act = {};


goodloop.act.openLightbox = function() {
	// in a SafeFrame?
	if ($sf) {
		try {
			var g = $sf.ext.geom(); // the geometry object
			$sf.ext.expand(g.exp);
			return; // show on expand
		} catch (e) {
			//do not expand :(
		}
	}
	// Open the lightbox
	goodloop.act.openLightbox2();
};
goodloop.act.openLightbox2 = function() {
	// make it?
	goodloop.$vbox = $('#gdlpid .videobox');
	if (goodloop.$vbox.length === 0) {
		goodloop.$vbox = $(goodloop.html.videobox());
		$('#gdlpid .unit').append(goodloop.html.backdrop);
		$('#gdlpid .unit').append(goodloop.$vbox);
	}
	$('#gdlpid .backdrop').show();
	goodloop.$vbox.show();
	// exits	
	$(document).on('keyup', goodloop.act.keyup);	
	// close button & click-out -- already set in render
};

goodloop.act.keyup = function(event) {
	if (event.which === 27) {
		goodloop.act.closeLightbox();
	}	
};

goodloop.act.closeLightbox = function() {	
	console.log("closeLightbox");
	$(document).off('keyup', goodloop.act.keyup);
	$('#gdlpid .videobox').hide();
	$('#gdlpid .backdrop').hide();
	if (goodloop.domvideo) goodloop.domvideo.stop();
	goodloop.state.playing = false;
	if ($sf) {
		$sf.ext.collapse();
	}
};


/** open lightbox and start the video */
goodloop.act.startVideo = function() {
	goodloop.act.openLightbox();	
	goodloop.domvideo = $('#gdlpid video')[0];
	// TODO iOS plays the video on its own, full screen. 
	// So we have to show the chooser first, then start the video.
	if (goodloop.env.iOS) {
		// ??
	}	
	goodloop.state.startTime = new Date().getTime();
	setTimeout(goodloop.act.elapse, 100);
	// on video end
	goodloop.domvideo.addEventListener("ended", function(event) {
		goodloop.act.showEndPage(); // TODO
	});
	// start	
	goodloop.domvideo.play();
	goodloop.state.playing = true;
};

goodloop.act.elapse = function() {
	var dt = goodloop.dt();
	var s = Math.ceil(goodloop.variant.adsecs - dt/1000.0);
	if (s > 0) {
		$('#gdlpid .vidbox .counter').text(s+"s");
		if (goodloop.state.playing) {
			setTimeout(goodloop.act.elapse, 100);
		}
	} else {
		if (goodloop.state.charity && goodloop.state.charity.id) {
			goodloop.act.donate();
		} else {
			goodloop.act.showCharityChooser();
		}
	}
};

goodloop.act.showCharityChooser = function() {
	$('#gdlpid .charity_chooser').addClass('showing');
	var up = (video.offsetHeight - goodloop.domvideo.offsetHeight - goodloop.domvideo.offsetTop) + 28 + "px";
	$('#gdlpid .charity_chooser').css('bottom', up);
};

goodloop.act.pickCharity = function(charityId) {
	// set & inform
	for(var i=0; i<goodloop.charities.length; i++) {
		if (goodloop.charities[i].id === charityId) {
			goodloop.state.charity = goodloop.charities[i];
		}
	}
	datalog.log(dataspace, 'pick', {
			publisher: goodloop.publisher.id,
			charity: charityId
	});
	// TODO hide the buttons
};

goodloop.dt = function() { 
	if ( ! goodloop.state.playing) return goodloop.state.elapsed;
	return new Date().getTime() - goodloop.state.startTime + goodloop.state.elapsed; 
}; 

goodloop.act.exitEarly = function() {
	var dt = goodloop.dt();
	// log it
	datalog.log('goodloop', 'skip', {
		publisher: goodloop.publisher.id,
		campaign: goodloop.vert.campaign, 
		viewtime: dt/1000,
		variant: goodloop.variant
	}, true);
	$(document).off('keyup');
};


goodloop.act.pause = function() {
	goodloop.state.playing = false;
	goodloop.state.elapsed = goodloop.dt();
	if (goodloop.domvideo) goodloop.domvideo.pause();
};

/**
 * Called when the video view is complete (i.e. after 14 seconds).
 * Or the user clicks-through to the advertiser.
 */
goodloop.act.donate = function() {
	if (goodloop.state.donated) return;
	// log with base
	var dataspace = 'goodloop';
	datalog.log(dataspace, 'adview', {
			campaign: goodloop.vert.campaign,
			publisher: goodloop.publisher.id,
			charity: goodloop.state.charity.id,
			variant: variant,
			view: 'complete'
		}, true);
	goodloop.state.donated = true;
	// replace the adunits with a thank you
	$('#gdlpid .unit').html(goodloop.html.tq());
};

/** log a click-through (does not change location - the original a tag must do this) */
goodloop.act.click = function() {
	// default
	var url = goodloop.vert.url;
	// click came from a link?
	const href = $(el).attr('href');
	if (href) url = href;
	// log the click
	var dataspace = 'goodloop';
	datalog.log(dataspace, 'click', {
			publisher: publisher,
			variant: variant,
			url: url
	}, true);
	// make a donation?
	if (url === goodloop.vert.url) {
		goodloop.act.donate();
	}
	// window.location = url; this wouldn't open a new tab :(
	return true;
};
