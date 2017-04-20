/** Change state */

/*	LIFECYLE

1. Advert
2. openLightbox
 -> openLightbox2 (possibly async after a SafeFrame expand)

3. closeLightbox (covers all forms of exit)
   -?> exitEarly



*/

goodloop.act = {};


goodloop.act.openLightbox = function() {
	// in a SafeFrame?
	if ($sf) {
		try {
			var g = goodloop.env.geom; // the geometry object
			if (goodloop.state.expanded) {
				$sf.ext.collapse();
			}
			$sf.ext.expand(g.exp);
			goodloop.state.expanded = true;
			setTimeout(function() {
				if ( ! goodloop.state.lightbox) goodloop.act.openLightbox2();
			}, 300);
			return; // show on expand
		} catch (e) {
			//do not expand :(
		}
	}
	// Open the lightbox
	goodloop.act.openLightbox2();
};
goodloop.act.openLightbox2 = function() {
	if (goodloop.state.lightbox) return;
	goodloop.state.lightbox = true;
	if (goodloop.state.endpage) {
		// it was over-written -- remove the old.
		// NB: this can happen if you watch the advert but don't pick a charity.
		$('#gdlpid .videobox').remove();
		goodloop.state.endpage = false;
	}
	// make it?
	goodloop.$vbox = $('#gdlpid .videobox');
	if (goodloop.$vbox.length === 0) {
		goodloop.$vbox = $(goodloop.html.videobox());		
		$('#gdlpid').append(goodloop.html.backdrop);
		$('#gdlpid').append(goodloop.$vbox);
		// close
		$('.close', goodloop.$vbox).click(goodloop.act.closeLightbox);
		$('#gdlpid .backdrop').click(goodloop.act.closeLightbox);
		// wire up chooser	
		$('.chty', goodloop.$vbox).each(function() {
			var cid = $(this).attr('data-cid');
			$(this).click(function() { goodloop.act.pickCharity(cid); });
		});
	}
	$('#gdlpid .backdrop').show();
	goodloop.$vbox.show();	
	// exits	
	$(document).on('keyup', goodloop.act.keyup);	
	// close button & click-out -- already set in render
	goodloop.act.startVideo();
};

goodloop.act.keyup = function(event) {
	if (event.which === 27) {
		goodloop.act.closeLightbox(event);
	}	
};

/** the dismiss button on stickyfooter */
goodloop.act.closeUnit = function(event) {
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}
	$('#gdlpid.stickyfooter').hide();
	goodloop.act.log('close', {});
};

goodloop.act.closeLightbox = function(event) {	
	try {
		if (goodloop.domvideo) {

			goodloop.domvideo.pause();
			goodloop.domvideo.currentTime = 0;
		}
	} catch(err) {}
	if (event) {
		event.preventDefault();
		event.stopPropagation();
	}
	$(document).off('keyup', goodloop.act.keyup);
	$('#gdlpid .videobox').hide();
	$('#gdlpid .backdrop').hide();	
	goodloop.state.playing = false;
	goodloop.state.lightbox = false;
	if ($sf) {		
		$sf.ext.collapse();
		goodloop.state.expanded = false;
		// FIXME we may have to re-expand!!
	}
	// close the unit if mobile
	if (goodloop.env.format ==='stickyfooter') {
		goodloop.act.closeUnit();
	}
};


/** assumes: open lightbox
 * Start the video */
goodloop.act.startVideo = function() {
	// goodloop.act.openLightbox();	
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
	// console.log("play video", goodloop.domvideo, $(goodloop.domvideo).attr('id'));
	goodloop.domvideo.play();
	goodloop.state.playing = true;
};

goodloop.act.showEndPage = function() {
	$('#gdlpid .vcontainer').html(goodloop.html.endpage());
	goodloop.state.endpage = true;
	// TODO if they haven't picked a charity?? 
	// Ideally, offer them the choice in endpage.
};

goodloop.act.vmsg = function(m) {
	$('#gdlpid .message').html(m);
};

goodloop.act.elapse = function() {
	var dt = goodloop.dt();
	var s = Math.ceil(goodloop.variant.adsecs - dt/1000.0);
	if (s > 0) {
		goodloop.act.vmsg("Your donation will be unlocked in "+s+" seconds");
		if (goodloop.state.playing) {
			setTimeout(goodloop.act.elapse, 100);
		}
	} else {
		goodloop.state.complete = true;
		if (goodloop.state.charity && goodloop.state.charity.id) {
			goodloop.act.donate();
		} else {
			goodloop.act.showCharityChooser();
		}
	}
};

goodloop.act.showCharityChooser = function() {
	goodloop.act.vmsg("");
	$('#gdlpid .charity_chooser').addClass('showing');
	var up = (goodloop.domvideo.offsetHeight + goodloop.domvideo.offsetTop - 104) + "px";
	$('#gdlpid .charity_chooser').css('top', up);
	// NB wired up when the vidbox html was made
};
goodloop.act.pickCharity = function(charityId) {
	// set & inform
	for(var i=0; i<goodloop.charities.length; i++) {
		if (goodloop.charities[i].id === charityId) {
			goodloop.state.charity = goodloop.charities[i];
		}
	}
	goodloop.act.log('pick', {charity: charityId});
	// hide the buttons
	// TODO could we make the chosen charity pulse? 
	// e.g. via opacity or border-colour, and use a css animation or transition?
	$('#gdlpid .charity_chooser').removeClass('showing');
	$('#gdlpid .charity_chooser').css('top', '600px');
	// make the donation?
	if (goodloop.state.complete) {
		goodloop.act.donate();
	}
};

goodloop.dt = function() { 
	if ( ! goodloop.state.playing) return goodloop.state.elapsed;
	return new Date().getTime() - goodloop.state.startTime + goodloop.state.elapsed; 
}; 

goodloop.act.exitEarly = function() {
	var dt = goodloop.dt();
	// log it
	goodloop.act.log('skip', {viewtime: dt/1000});
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
	goodloop.act.log('adview', {
		charity: goodloop.state.charity.id,
		view: 'complete'
	});
	goodloop.state.donated = true;
	// replace the adunits with a thank you	
	$('#gdlpid .unit').replaceWith(goodloop.html.tq());
	var msg = goodloop.html.msgdonated();
	goodloop.act.vmsg(msg);
};

/** log a click-through (does not change location - the original a tag must do this) */
goodloop.act.click = function() {
	// default
	var url = goodloop.vert.url;
	// click came from a link?
	const href = $(el).attr('href');
	if (href) url = href;
	// log the click
	goodloop.act.log('click', {url:url});
	// make a donation?
	if (url === goodloop.vert.url) {
		goodloop.act.donate();
	}
	// window.location = url; this wouldn't open a new tab :(
	return true;
};
goodloop.act.log = function(eventTag, eventParams) {
	eventParams = $.extend({
		publisher: goodloop.publisher.id,
		campaign: goodloop.vert.campaign,
		variant: goodloop.variant
	}, eventParams);
	datalog.log(goodloop.dataspace, eventTag, eventParams, true);
};