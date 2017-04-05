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
	$('#gdlpid .backdrop').show();
	$('#gdlpid .videobox').show();	
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
	if ($sf) {
		$sf.ext.collapse();
	}
};


/** open lightbox and start the video */
goodloop.act.startVideo = function() {
	goodloop.act.openLightbox();
	// TODO iOS plays the video on its own, full screen. 
	// So we have to show the chooser first, then start the video.
	if (goodloop.env.iOS) {

	}	
	goodloop.state.startTime = new Date().getTime();
	setTimeout(goodloop.act.elapse, 100);

	// on video end
	$('#gdlpid video').on('ended', function(event) {
		goodloop.act.donate();
	});

	// start
	var video = $('#gdlpid video')[0];
	video.play();
};

goodloop.act.elapse = function() {
	// var s = Math.ceil((adEnd - new Date().getTime()) / 1000.0);
	// if (s > 0) {
	// 	$('#skip').text("Donation in "+s+"s")
	// 	if ($vidbox.css('display') !== 'none') {
	// 		setTimeout(function(){skipDown(adEnd);}, 100);
	// 	}
	// } else {
	// 	$('#skip').text("Thanks! Your donation has been made.");
	// 	viewed();
	// 	$('#skip').click(skip);
	// }
};

goodloop.act.pickCharity = function(charityId) {
	// set & inform
	goodloop.state.charityId = charityId;
	datalog.log(dataspace, 'pick', {
			publisher: goodloop.publisher.id,
			charity: charityId
	});

	// hide the buttons
};


goodloop.act.exitEarly = function() {
	// TODO
	var viewtime = startTime? (new Date().getTime() - startTime)/1000 : 0;
	// log it
	datalog.log('goodloop', 'skip', {
		publisher: publisher,
		campaign: goodloop.vert.campaign, 
		viewtime: viewtime,
		variant: variant
	}, true);
	$(document).off('keyup');
};


goodloop.act.pause = function() {

};

/**
 * Called when the video view is complete (i.e. after 14 seconds).
 * Or the user clicks-through to the advertiser.
 */
goodloop.act.viewed = function() {
	// TODO adunit specific
	goodloop.act.donate();
	// log with base
	var dataspace = 'goodloop';
	datalog.log(dataspace, 'adview', {
			campaign: goodloop.vert.campaign,
			publisher: goodloop.publisher.id,
			charity: pickedCharity,
			variant: variant,
			view: 'complete'
		}, true);
	// replace the adunits with a thank you
	render();
};

goodloop.act.donate = function() {
	console.log("DONATE");
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
