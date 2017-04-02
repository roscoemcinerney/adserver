/** Change state */

goodloop.act = {};

/** open lightbox and start the video */
goodloop.act.startVideo = function() {
	goodloop.state.startTime = new Date().getTime();
	setTimeout(goodloop.act.elapse, 100);

	var vidurl = isMobile()? goodloop.vert.mobileVideo : goodloop.vert.video;

	// exit on esc
	var KEYCODE_ESC = 27;
	$(document).on('keyup.goodloop', function(event) {
		if(event.which === KEYCODE_ESC) {
			goodloop.act.exitEarly();	
		}
	});
	// on video end
	$video[0].addEventListener('ended', function(event) {
	});
};

goodloop.act.elapse = function() {
	var s = Math.ceil((adEnd - new Date().getTime()) / 1000.0);
	if (s > 0) {
		$('#skip').text("Donation in "+s+"s")
		if ($vidbox.css('display') !== 'none') {
			setTimeout(function(){skipDown(adEnd);}, 100);
		}
	} else {
		$('#skip').text("Thanks! Your donation has been made.");
		viewed();
		$('#skip').click(skip);
	}
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
	$vidbox.css('display','none');
	$('video', $vidbox).remove();
	var viewtime = startTime? (new Date().getTime() - startTime)/1000 : 0;
	// log it
	datalog.log('goodloop', 'skip', {
		publisher: publisher,
		campaign: goodloop.vert.campaign, 
		viewtime: viewtime,
		variant: variant
	}, true);
	$(document).off('keyup.goodloop');
};


goodloop.act.pause = function() {

};

/**
 * Called when the video view is complete (i.e. after 14 seconds).
 * Or the user clicks-through to the advertiser.
 */
goodloop.act.viewed = function() {
	// TODO adunit specific
	Cookies.set('charity', pickedCharity, { expires: expires });
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
	// window.location = url; this wouldn't open a new tab :(
	return true;
}


goodloop.act.endVideo = function() {

};
